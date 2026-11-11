'use client'

import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { CloseIcon, PrinterIcon } from '@/components/icons'
import ThankYouSignature from '@/components/ThankYouSignature'
import { isInsideDhaka } from '@/lib/settings'

const InvoiceModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const orderNo = order.orderNumber || order.id || 'UKBL-2026-1001'
    const custName = order.address?.fullName || order.user?.name || order.address?.name || 'Valued Customer'
    const custPhone = order.address?.phoneNumber || order.address?.phone || '+880 1XXXXXXXXX'
    const custEmail = order.address?.email || order.user?.email || 'customer@ukbrandlover.com'
    const custAddr = `${order.address?.address || order.address?.street || 'Delivery Address'}, ${order.address?.city || ''}${order.address?.region ? `, ${order.address.region}` : ''}`
    const isDhaka = isInsideDhaka(order.address)

    const items = order.orderItems || []
    const deliveryFee = Number(order.deliveryCharge ?? (isDhaka ? 80 : 150))
    const discount = Number(order.discount || 0)
    const subtotal = Number(order.subtotal || (order.total - deliveryFee + discount))
    const totalAmount = Number(order.total || (subtotal + deliveryFee - discount))

    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print()
        }
    }

    const paymentLabel = (() => {
        const pm = (order.paymentMethod || '').toLowerCase()
        if (pm.includes('bkash')) return 'bKash Send Money'
        if (pm.includes('nagad')) return 'Nagad Wallet'
        if (pm.includes('card')) return 'Debit / Credit Card'
        return 'Cash on Delivery'
    })()

    return (
        <div 
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-white/60 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto transition-all duration-300"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

                .clean-invoice-font {
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                @page {
                    size: A4 portrait;
                    margin: 15mm 16mm;
                }

                @media print {
                    html, body {
                        background: #ffffff !important;
                        color: #111827 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-invoice-content, #printable-invoice-content * {
                        visibility: visible !important;
                    }
                    #printable-invoice-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>

            {/* Modal Container */}
            <div className="clean-invoice-font bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 border border-[#EFE0EF] shadow-2xl relative my-6 print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
                
                {/* Screen Action Bar (Hidden when printing on A4) */}
                <div className="print:hidden flex items-center justify-between pb-4 mb-6 border-b border-[#EFE0EF]">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#6C306E] bg-[#FAF6FA] px-3 py-1 rounded-full border border-[#EFE0EF] uppercase tracking-wider">
                            Clean Minimal Modern Invoice
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

                {/* Printable Invoice (Exact Match to Clean Minimal Modern Business Invoice Template) */}
                <div id="printable-invoice-content" className="clean-invoice-font text-neutral-900 print:w-full print:text-black">
                    
                    {/* 1. Header Centered Logo & Brand Name */}
                    <div className="text-center pt-2 pb-10">
                        <div className="flex flex-col items-center justify-center">
                            <Image
                                src={assets.webLogo}
                                alt="UK Brand Lover Logo"
                                width={180}
                                height={50}
                                className="h-10 sm:h-11 w-auto object-contain mx-auto"
                                priority
                            />
                            <p className="text-[10px] text-neutral-400 font-semibold tracking-widest uppercase mt-2">
                                100% Authentic British Skincare & Cosmetics
                            </p>
                        </div>
                    </div>

                    {/* 2. Top Two-Column Info Row (INVOICE TO on left, INVOICE metadata on right) */}
                    <div className="grid grid-cols-2 gap-6 pb-6 pt-2 items-start">
                        {/* Left: INVOICE TO */}
                        <div>
                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                                INVOICE TO :
                            </p>
                            <h3 className="text-base sm:text-lg font-medium text-neutral-900 leading-snug">
                                {custName}
                            </h3>
                            <div className="text-xs text-neutral-500 space-y-0.5 mt-1 leading-relaxed">
                                <p>{custPhone}</p>
                                {custEmail && <p>{custEmail}</p>}
                                <p className="max-w-xs">{custAddr}</p>
                            </div>
                        </div>

                        {/* Right: INVOICE Title & Metadata */}
                        <div className="text-right">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
                                INVOICE
                            </h1>
                            <div className="text-xs text-neutral-600 space-y-1">
                                <p>
                                    <span className="text-neutral-500">Invoice no : </span>
                                    <span className="font-semibold text-neutral-900 font-mono">{orderNo}</span>
                                </p>
                                <p>
                                    <span className="text-neutral-500">Invoice Date : </span>
                                    <span className="font-medium text-neutral-900">{formattedDate}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Line Items Table with Exact Border Style from Template */}
                    <div className="mt-2 mb-6">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-t-2 border-b border-neutral-900 text-neutral-900 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 text-left font-bold">SERVICE</th>
                                    <th className="py-3 text-center font-bold w-16">QTY</th>
                                    <th className="py-3 text-right font-bold w-24 sm:w-28">PRICE</th>
                                    <th className="py-3 text-right font-bold w-24 sm:w-28">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item, idx) => {
                                        const prodName = item.name || item.product?.name || 'UK Beauty Product'
                                        const price = Number(item.price || 0)
                                        const qty = Number(item.quantity || 1)
                                        const lineTotal = price * qty

                                        return (
                                            <tr key={idx} className="text-neutral-800">
                                                <td className="py-3.5 pr-2 font-normal text-neutral-900">
                                                    {prodName}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-neutral-700 font-normal">
                                                    {qty}
                                                </td>
                                                <td className="py-3.5 px-2 text-right text-neutral-700">
                                                    {currency}{price.toLocaleString()}
                                                </td>
                                                <td className="py-3.5 pl-2 text-right font-normal text-neutral-900">
                                                    {currency}{lineTotal.toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr className="text-neutral-800">
                                        <td className="py-3.5 font-normal text-neutral-900">Authentic UK Cosmetics Order</td>
                                        <td className="py-3.5 text-center text-neutral-700 font-normal">1</td>
                                        <td className="py-3.5 text-right text-neutral-700">{currency}{subtotal.toLocaleString()}</td>
                                        <td className="py-3.5 text-right font-normal text-neutral-900">{currency}{subtotal.toLocaleString()}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="border-b border-neutral-900 pt-1"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* 4. Lower Two-Column Section (Contact on Left, Calculation on Right) */}
                    <div className="grid grid-cols-2 gap-6 pt-3 pb-6 items-start text-xs">
                        {/* Left: Contact Information */}
                        <div className="space-y-1 text-neutral-600">
                            <h4 className="font-bold text-neutral-900 text-xs mb-1.5">
                                Contact :
                            </h4>
                            <p>
                                <span className="text-neutral-500">Hotline : </span>
                                <span className="font-medium text-neutral-900">+880 1959-524393</span>
                            </p>
                            <p>
                                <span className="text-neutral-500">Email : </span>
                                <span className="font-medium text-neutral-900">support@ukbrandlover.com</span>
                            </p>
                            <p>
                                <span className="text-neutral-500">Payment : </span>
                                <span className="font-medium text-neutral-900">{paymentLabel}</span>
                            </p>
                            {order.transactionId && (
                                <p>
                                    <span className="text-neutral-500">TrxID : </span>
                                    <span className="font-mono font-medium text-neutral-900">{order.transactionId}</span>
                                </p>
                            )}
                            {order.senderNumber && (
                                <p>
                                    <span className="text-neutral-500">Sender : </span>
                                    <span className="font-mono font-medium text-neutral-900">{order.senderNumber}</span>
                                </p>
                            )}
                        </div>

                        {/* Right: Sub-total, Delivery Fee, Discount, and Total */}
                        <div className="flex flex-col items-end">
                            <div className="w-full max-w-[210px] space-y-1.5 text-right">
                                <div className="flex justify-between text-neutral-600">
                                    <span className="text-neutral-500">Sub-total :</span>
                                    <span className="font-medium text-neutral-900">{currency}{subtotal.toLocaleString()}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-neutral-600">
                                        <span className="text-neutral-500">Discount :</span>
                                        <span className="font-medium text-neutral-900">-{currency}{discount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-neutral-600">
                                    <span className="text-neutral-500">Delivery :</span>
                                    <span className="font-medium text-neutral-900">
                                        {deliveryFee === 0 ? 'FREE' : `${currency}${deliveryFee.toLocaleString()}`}
                                    </span>
                                </div>

                                {/* Divider Line Above Total (Exact Match to PDF) */}
                                <div className="border-t border-neutral-900 pt-2.5 mt-2 flex justify-between items-baseline">
                                    <span className="font-bold text-neutral-900 text-xs">Total :</span>
                                    <span className="font-bold text-neutral-900 text-base">
                                        {currency}{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Elegant Signature Script: "Thank You" (Exact Halimun Vector Outline from Template) */}
                    <div className="pt-10 pb-4 text-center">
                        <ThankYouSignature className="w-56 sm:w-64 mx-auto text-[#242424]" />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default InvoiceModal
