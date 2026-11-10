'use client'

import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { CloseIcon, RoyalCrownIcon, ShieldCheckIcon } from '@/components/icons'

const InvoiceModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const orderNo = order.orderNumber || order.id || 'UKBL-2026'
    const custName = order.address?.fullName || order.user?.name || 'Customer'
    const custPhone = order.address?.phoneNumber || order.address?.phone || ''
    const custAddr = `${order.address?.address || order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.region || ''}`

    const items = order.orderItems || []

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
            {/* Screen Controls & Container */}
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#EFE0EF] shadow-2xl relative my-8">
                {/* Screen Action Bar (Hidden during print) */}
                <div className="print:hidden flex items-center justify-between pb-4 mb-4 border-b border-[#EFE0EF]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#6C306E] bg-[#FAF6FA] px-3 py-1 rounded-full border border-[#EFE0EF]">
                            Printable Tax Invoice & Packing Slip
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                            Print A4 Invoice
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#241224] transition cursor-pointer"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>
                </div>

                {/* The Printable Invoice Document (Clean standard A4 layout) */}
                <div id="printable-invoice" className="text-[#241224] text-xs">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-[#6C306E] pb-4 mb-4">
                        <div>
                            <Image
                                src={assets.webLogo}
                                alt="UK Brand Lover Logo"
                                width={160}
                                height={60}
                                className="h-10 w-auto object-contain mb-1.5"
                            />
                            <p className="font-bold text-[#3A0C38]">UK BRAND LOVER BANGLADESH</p>
                            <p className="text-[10px] text-slate-500">100% Authentic UK Imported Skincare & Cosmetics</p>
                            <p className="text-[10px] text-slate-500">House 14, Road 7, Block C, Mirpur-2, Dhaka-1216</p>
                            <p className="text-[10px] text-slate-500">Hotline: +880 1959-524393 | support@ukbrandlover.com</p>
                        </div>

                        <div className="text-right">
                            <h2 className="text-lg font-extrabold text-[#6C306E] tracking-tight">COMMERCIAL INVOICE</h2>
                            <p className="font-mono font-bold text-sm text-[#241224] mt-1">{orderNo}</p>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E]">
                                {order.paymentStatus === 'PAID' ? 'PAID INVOICE' : 'CASH ON DELIVERY (DUE)'}
                            </div>
                        </div>
                    </div>

                    {/* Recipient & Shipping Meta */}
                    <div className="grid grid-cols-2 gap-4 bg-[#FAF6FA] p-3.5 rounded-2xl border border-[#EFE0EF] mb-4">
                        <div>
                            <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider mb-1">Billed & Delivered To:</p>
                            <p className="font-bold text-xs text-[#241224]">{custName}</p>
                            <p className="font-medium text-slate-700">{custPhone}</p>
                            <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">{custAddr}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider mb-1">Shipping & Logistics:</p>
                            <p className="font-bold text-slate-800">Courier: {order.courierName || 'Steadfast Courier'}</p>
                            {order.consignmentId && (
                                <p className="font-mono font-bold text-purple-700">Tracking: {order.consignmentId}</p>
                            )}
                            <p className="text-slate-600 mt-0.5">Method: {order.paymentMethod || 'COD'}</p>
                            {order.transactionId && (
                                <p className="font-mono font-bold text-emerald-700">TrxID: {order.transactionId}</p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left text-xs mb-4 border border-[#EFE0EF] rounded-xl overflow-hidden">
                        <thead className="bg-[#FAF6FA] text-[#241224] font-bold uppercase text-[10px] border-b border-[#EFE0EF]">
                            <tr>
                                <th className="p-2.5">Item Description</th>
                                <th className="p-2.5 text-center">Qty</th>
                                <th className="p-2.5 text-right">Unit Price</th>
                                <th className="p-2.5 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]">
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-2.5 font-medium text-[#241224]">
                                        {item.name || item.product?.name}
                                    </td>
                                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                                    <td className="p-2.5 text-right">{currency}{Number(item.price).toLocaleString()}</td>
                                    <td className="p-2.5 text-right font-bold text-[#3A0C38]">
                                        {currency}{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Breakdown */}
                    <div className="flex justify-end mb-6">
                        <div className="w-64 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span>{currency}{Number(order.subtotal || order.total).toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-[#6C306E] font-bold">
                                    <span>Discount ({order.couponCode || 'Promo'}):</span>
                                    <span>-{currency}{Number(order.discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                                <span>Nationwide Delivery:</span>
                                <span className="font-bold text-emerald-700">FREE</span>
                            </div>
                            <div className="flex justify-between text-sm font-extrabold text-[#3A0C38] pt-2 border-t border-[#EFE0EF]">
                                <span>Total Payable:</span>
                                <span>{currency}{Number(order.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Authentic UK Guarantee & Footer Notice */}
                    <div className="pt-4 border-t border-dashed border-[#EFE0EF] text-[10px] text-slate-400 space-y-1 text-center">
                        <p className="font-bold text-slate-600">
                            🛡️ 100% Genuine UK Imported Stock • Sealed with British Manufacturer Verification
                        </p>
                        <p>
                            Please verify the package seal upon delivery. For queries or exchanges, contact our official hotline at +880 1959-524393.
                        </p>
                        <p className="italic">Thank you for trusting UK Brand Lover with your beauty routine.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceModal

