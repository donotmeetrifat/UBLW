'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloseIcon, AlertCircleIcon, CheckIcon } from '@/components/icons'
import toast from 'react-hot-toast'
import { broadcastStoreChange } from '@/lib/realtimeSync'

const CANCELLATION_REASONS = [
    { id: 'mistake', label: 'Placed order by mistake / duplicate order' },
    { id: 'address', label: 'Need to change delivery address or phone number' },
    { id: 'items', label: 'Want to change product shade, variant, or add more items' },
    { id: 'mind', label: 'Changed my mind / found another alternative' },
    { id: 'timing', label: 'Delivery time is taking longer than expected' },
    { id: 'formulation', label: 'Ordered wrong skin type or cosmetic formulation' },
    { id: 'other', label: 'Other reason (write below)' }
]

export default function CancelOrderModal({ order, isOpen, onClose, onCancelled }) {
    const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0].label)
    const [customReason, setCustomReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen || !order) return null

    const orderNumber = order.orderNumber || order.id || 'UKBL-2026'

    const handleConfirmCancel = async () => {
        if (!selectedReason && !customReason.trim()) {
            toast.error('Please select or specify a reason for cancellation')
            return
        }

        const isOther = selectedReason.toLowerCase().includes('other')
        if (isOther && !customReason.trim()) {
            toast.error('Please write your cancellation reason in the text box')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: selectedReason,
                    customReason: customReason.trim(),
                    cancelledBy: 'CUSTOMER'
                })
            })

            const data = await res.json()
            if (data.success && data.order) {
                // Update local storage cache if present
                if (typeof window !== 'undefined') {
                    try {
                        const localOrders = JSON.parse(localStorage.getItem('ukbl_orders') || '[]')
                        const updatedLocal = localOrders.map(o =>
                            (o.id === order.id || o.orderNumber === order.orderNumber) ? data.order : o
                        )
                        localStorage.setItem('ukbl_orders', JSON.stringify(updatedLocal))
                    } catch (e) {
                        console.error('Error updating cached local orders:', e)
                    }
                }

                toast.success(`Order #${orderNumber} has been successfully cancelled`)
                broadcastStoreChange('orders', {
                    orderId: order.id,
                    status: 'CANCELLED',
                    cancelReason: data.order.cancelReason
                })
                broadcastStoreChange('products', { action: 'stock_restored' })

                if (onCancelled) {
                    onCancelled(data.order)
                }
                onClose()
            } else {
                toast.error(data.message || 'Failed to cancel order')
            }
        } catch (error) {
            console.error('Error cancelling order:', error)
            toast.error('Network error. Please try again or contact customer support.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl border border-[#EFE0EF] relative my-auto sm:my-6 max-h-[92vh] overflow-y-auto text-slate-800"
                >
                    {/* Header Strip */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EFE0EF]">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                                <AlertCircleIcon size={22} color="#E11D48" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-[#241224] tracking-tight">
                                    Cancel Order
                                </h3>
                                <p className="text-xs text-[#6C306E] font-mono font-bold">
                                    #{orderNumber}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            aria-label="Close cancel modal"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>

                    {/* Question Prompt */}
                    <div className="pt-4 pb-2">
                        <p className="text-xs sm:text-sm font-bold text-[#241224]">
                            Why do you want to cancel this order?
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Please select a common reason or write your own feedback to help us serve you better.
                        </p>
                    </div>

                    {/* Suggestion Options List */}
                    <div className="space-y-2 py-3 max-h-56 overflow-y-auto pr-1">
                        {CANCELLATION_REASONS.map(reason => {
                            const isSelected = selectedReason === reason.label
                            return (
                                <button
                                    key={reason.id}
                                    type="button"
                                    onClick={() => setSelectedReason(reason.label)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left text-xs transition border cursor-pointer ${
                                        isSelected
                                            ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-bold shadow-2xs'
                                            : 'bg-[#FAF6FA]/60 hover:bg-[#FAF6FA] border-[#EFE0EF] text-slate-700 font-medium'
                                    }`}
                                >
                                    <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                                        isSelected
                                            ? 'border-rose-600 bg-rose-600'
                                            : 'border-slate-300 bg-white'
                                    }`}>
                                        {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="flex-1 leading-snug">{reason.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Custom Textarea for Additional/Other Information */}
                    <div className="pt-3 pb-2 space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block">
                            {selectedReason.toLowerCase().includes('other')
                                ? 'Write your specific cancellation reason *'
                                : 'Additional notes or comments (optional)'}
                        </label>
                        <textarea
                            rows={3}
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder={selectedReason.toLowerCase().includes('other')
                                ? 'Please explain why you wish to cancel this order...'
                                : 'Any additional details you want our dispatch team to know...'}
                            className="w-full text-xs p-2.5 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] focus:border-rose-400 focus:bg-white focus:outline-none transition resize-none text-slate-800 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Reassurance Notice */}
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed mb-4">
                        <b>Notice:</b> Stock items will be returned to inventory immediately. If you made an upfront payment via bKash, Nagad, or Rocket, our verified customer care will contact your phone for prompt verification and refund.
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EFE0EF]">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        >
                            Nevermind, Keep Order
                        </button>

                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleConfirmCancel}
                            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 transition shadow-xs cursor-pointer flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Cancelling...</span>
                                </>
                            ) : (
                                <span>Confirm Cancel Order</span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
