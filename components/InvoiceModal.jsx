'use client'

import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { CloseIcon, PrinterIcon } from '@/components/icons'
import { isInsideDhaka } from '@/lib/settings'

const InvoiceModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const orderNo = order.orderNumber || order.id || 'UKBL-2026-1001'
    const custName = order.address?.fullName || order.user?.name || order.address?.name || 'Valued Customer'
    const custPhone = order.address?.phoneNumber || order.address?.phone || ''
    const custAddr = `${order.address?.address || order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.region || order.address?.state || ''}`
    const isDhaka = isInsideDhaka(order.address)

    const items = order.orderItems || []
    const deliveryFee = Number(order.deliveryCharge ?? (isDhaka ? 80 : 150))
    const discount = Number(order.discount || 0)
    const subtotal = Number(order.subtotal || (order.total - deliveryFee + discount))

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 10mm 12mm;
                }
                @media print {
                    body {
                        background: white !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice-content, #printable-invoice-content * {
                        visibility: visible;
                    }
                    #printable-invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
            {/* Modal Screen Container */}
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#EFE0EF] shadow-2xl relative my-6 print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
                
                {/* Screen Action Bar (Hidden when printing on A4) */}
                <div className="print:hidden flex items-center justify-between pb-4 mb-5 border-b border-[#EFE0EF]">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#6C306E] bg-[#FAF6FA] px-3 py-1 rounded-full border border-[#EFE0EF] uppercase tracking-wider">
                            Official Commercial Invoice
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">
                            #{orderNo}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                            <PrinterIcon size={14} color="#FFFFFF" />
                            <span>Print A4 Invoice</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#241224] transition cursor-pointer"
                            aria-label="Close invoice"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice (Strict A4 Layout) */}
                <div id="printable-invoice-content" className="text-[#241224] text-xs font-sans print:w-[100%] print:text-black">
                    {/* Invoice Header */}
                    <div className="flex items-start justify-between pb-4 border-b-2 border-[#6C306E] mb-5">
                        <div>
                            <Image
                                src={assets.webLogo}
                                alt="UK Brand Lover Logo"
                                width={150}
                                height={45}
                                className="h-9 w-auto object-contain mb-1.5"
                            />
                            <p className="font-bold text-[#3A0C38] text-xs">UK Brand Lover Bangladesh</p>
                            <p className="text-[10px] text-slate-500">100% Authentic British Skincare & Cosmetics</p>
                            <p className="text-[10px] text-slate-500">Mirpur, Dhaka, Bangladesh • +880 1959-524393</p>
                        </div>

                        <div className="text-right">
                            <h1 className="text-lg font-black tracking-tight text-[#6C306E]">INVOICE</h1>
                            <p className="font-mono font-bold text-xs text-[#241224] mt-0.5">{orderNo}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                order.paymentStatus === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                                {order.paymentStatus === 'PAID' ? 'PAID IN FULL' : 'PAYMENT DUE (COD)'}
                            </span>
                        </div>
                    </div>

                    {/* Billed To & Shipping Logistics */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] mb-5 print:bg-slate-50">
                        <div>
                            <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider mb-1">
                                Delivery Address:
                            </p>
                            <p className="font-bold text-xs text-[#241224]">{custName}</p>
                            <p className="font-mono text-[11px] text-[#6C306E] font-bold">{custPhone}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{custAddr}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider mb-1">
                                Order Details:
                            </p>
                            <p className="text-slate-700 font-medium">
                                Payment: <b>{order.paymentMethod || 'Cash on Delivery'}</b>
                            </p>
                            {order.consignmentId && (
                                <p className="font-mono text-purple-800 text-[11px] font-bold mt-0.5">
                                    Courier: {order.consignmentId}
                                </p>
                            )}
                            {order.transactionId && (
                                <p className="font-mono text-emerald-800 text-[11px] font-bold mt-0.5">
                                    TrxID: {order.transactionId}
                                </p>
                            )}
                            {order.senderNumber && (
                                <p className="font-mono text-slate-700 text-[11px] font-medium mt-0.5">
                                    Sender: {order.senderNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full text-left text-xs mb-5 border border-[#EFE0EF] rounded-xl overflow-hidden">
                        <thead className="bg-[#FAF6FA] text-[#241224] font-bold uppercase text-[10px] border-b border-[#EFE0EF] print:bg-slate-100">
                            <tr>
                                <th className="p-2.5">Item Description</th>
                                <th className="p-2.5 text-center">Qty</th>
                                <th className="p-2.5 text-right">Price</th>
                                <th className="p-2.5 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]">
                            {items.map((item, idx) => {
                                const prodName = item.name || item.product?.name || 'UK Beauty Product'
                                const price = Number(item.price || 0)
                                const qty = Number(item.quantity || 1)
                                return (
                                    <tr key={idx}>
                                        <td className="p-2.5 font-medium text-[#241224]">{prodName}</td>
                                        <td className="p-2.5 text-center font-bold">{qty}</td>
                                        <td className="p-2.5 text-right font-medium">{currency}{price.toLocaleString()}</td>
                                        <td className="p-2.5 text-right font-extrabold text-[#3A0C38]">
                                            {currency}{(price * qty).toLocaleString()}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {/* Totals Breakdown */}
                    <div className="flex justify-end mb-6">
                        <div className="w-56 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span className="font-bold text-[#241224]">{currency}{subtotal.toLocaleString()}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-[#6C306E] font-bold">
                                    <span>Discount:</span>
                                    <span>-{currency}{discount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee:</span>
                                <span className="font-bold text-[#241224]">
                                    {deliveryFee === 0 ? 'FREE' : `${currency}${deliveryFee.toLocaleString()}`}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm font-black text-[#3A0C38] pt-2 border-t border-[#EFE0EF]">
                                <span>Total Payable:</span>
                                <span>{currency}{Number(order.total || (subtotal + deliveryFee - discount)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Footer */}
                    <div className="pt-4 border-t border-dashed border-[#EFE0EF] text-[10px] text-slate-400 text-center space-y-1">
                        <p className="font-bold text-slate-600">
                            100% Authentic British Stock Guaranteed • UK Brand Lover
                        </p>
                        <p>Thank you for shopping with UK Brand Lover. For any queries, contact hotline +880 1959-524393.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceModal
