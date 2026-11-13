'use client'

import React, { useState, useEffect } from 'react'
import { CloseIcon, DownloadIcon } from '@/components/icons'
import ThankYouSignature from '@/components/ThankYouSignature'
import { webLogoBase64 } from '@/assets/webLogoBase64'
import { isInsideDhaka } from '@/lib/settings'
import toast from 'react-hot-toast'

const InvoiceModal = ({ order, isOpen, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false)
    const [accountUser, setAccountUser] = useState(null)

    // Load actual registered account user from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = JSON.parse(localStorage.getItem('ukbl_current_user') || 'null')
                if (saved) setAccountUser(saved)
            } catch {}
        }
    }, [])

    if (!isOpen || !order) return null

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const orderNo = order.orderNumber || order.id || 'UKBL-2026-1001'

    // Customer Name: prioritize authenticated account name, then order address name
    const custName = order.user?.name || 
        (accountUser?.name && accountUser.name !== 'Valued Customer' ? accountUser.name : '') || 
        (order.address?.fullName && order.address.fullName !== 'Customer' ? order.address.fullName : '') || 
        (order.address?.name && order.address.name !== 'Customer' ? order.address.name : '') || 
        'Valued Customer'

    // Customer Phone: prioritize order address phone, then account phone
    const custPhone = order.address?.phoneNumber || 
        order.address?.phone || 
        accountUser?.phone || 
        accountUser?.whatsapp || 
        '+880 1959-524393'

    // Customer Email: strictly prioritize the email used to create the account
    const custEmail = order.user?.email || 
        order.email || 
        accountUser?.email || 
        (order.address?.email && !order.address.email.includes('example.com') ? order.address.email : '') || 
        ''

    const custAddr = `${order.address?.address || order.address?.street || 'Delivery Address'}, ${order.address?.city || 'Dhaka'}${order.address?.region ? `, ${order.address.region}` : ''}`
    const isDhaka = isInsideDhaka(order.address)

    const items = order.orderItems || []
    const deliveryFee = Number(order.deliveryCharge ?? (isDhaka ? 80 : 150))
    const discount = Number(order.discount || 0)
    const subtotal = Number(order.subtotal || (order.total - deliveryFee + discount))
    const totalAmount = Number(order.total || (subtotal + deliveryFee - discount))

    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const paymentLabel = (() => {
        const pm = (order.paymentMethod || '').toLowerCase()
        if (pm.includes('bkash')) return 'bKash Send Money'
        if (pm.includes('nagad')) return 'Nagad Wallet'
        if (pm.includes('rocket')) return 'Rocket App'
        if (pm.includes('card')) return 'Debit / Credit Card'
        return 'Cash on Delivery'
    })()

    // 100% Reliable Client-Side A4 PDF Download - Strictly Single Page Full-Screen Guarantee
    const handleDownloadInvoice = async () => {
        try {
            setIsDownloading(true)
            const element = document.getElementById('printable-invoice-content')
            if (!element) {
                toast.error('Invoice content could not be found')
                return
            }

            const html2canvas = (await import('html2canvas')).default
            const { jsPDF } = await import('jspdf')

            const canvas = await html2canvas(element, {
                scale: 2, // Crisp 200+ DPI vector clarity, fast and lightweight
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794,
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.getElementById('printable-invoice-content')
                    if (clonedEl) {
                        clonedEl.style.width = '794px'
                        clonedEl.style.minHeight = '1123px'
                        clonedEl.style.maxWidth = '794px'
                        clonedEl.style.padding = '48px 56px 40px 56px'
                        clonedEl.style.boxSizing = 'border-box'
                        clonedEl.style.border = 'none'
                        clonedEl.style.borderRadius = '0'
                        clonedEl.style.boxShadow = 'none'
                        clonedEl.style.margin = '0 auto'
                        clonedEl.style.background = '#ffffff'
                    }
                }
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            })

            // Cover full A4 page edge-to-edge (0,0 to 210,297) without outer border or frame
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST')

            // HARD ENFORCE: strictly 1 single page (strip any accidental trailing page)
            while (pdf.internal.getNumberOfPages() > 1) {
                pdf.deletePage(pdf.internal.getNumberOfPages())
            }

            pdf.save(`UKBL_Invoice_${orderNo}.pdf`)
            toast.success('Official invoice downloaded successfully!')
        } catch (error) {
            console.error('Error generating PDF invoice:', error)
            toast.error('Could not generate PDF directly. Opening print dialog as fallback...')
            window.print()
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto transition-all duration-300"
        >
            <style>{`
                .clean-invoice-font {
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                @page {
                    size: A4 portrait;
                    margin: 0;
                }

                @media print {
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-invoice-content,
                    #printable-invoice-content * {
                        visibility: visible !important;
                    }
                    #printable-invoice-content {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        box-sizing: border-box !important;
                        margin: 0 !important;
                        padding: 16mm 18mm 12mm 18mm !important;
                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        background: #ffffff !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        break-after: avoid !important;
                        break-inside: avoid !important;
                        overflow: hidden !important;
                    }
                    .print-hidden-bar {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Modal Container: borderless professional document viewport */}
            <div className="clean-invoice-font bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl relative my-6 border-0">
                
                {/* Screen Action Bar (Clean Header: Invoice # on Left, Download & Close on Right) */}
                <div className="print-hidden-bar flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#6C306E] bg-[#FAF6FA] px-3.5 py-1.5 rounded-full border border-[#EFE0EF]">
                            Invoice: #{orderNo}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={isDownloading}
                            onClick={handleDownloadInvoice}
                            className="bg-[#6C306E] hover:bg-[#3A0C38] disabled:opacity-70 text-white px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
                        >
                            {isDownloading ? (
                                <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <DownloadIcon size={14} color="#FFFFFF" />
                            )}
                            <span>{isDownloading ? 'Downloading...' : 'Download Invoice (PDF)'}</span>
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

                {/* Printable Invoice (Borderless, Full-Width Professional Corporate Document Format) */}
                <div 
                    id="printable-invoice-content" 
                    className="clean-invoice-font bg-white text-neutral-900 w-full"
                    style={{ border: 'none', boxShadow: 'none', borderRadius: '0' }}
                >
                    {/* 1. Header Centered Logo & Subtitle */}
                    <div className="text-center pt-1 pb-8">
                        <div className="flex flex-col items-center justify-center">
                            {/* Embedded high-resolution vector-grade logo without network/CORS overhead */}
                            <img
                                src={webLogoBase64}
                                alt="UK Brand Lover Logo"
                                className="h-10 sm:h-12 w-auto object-contain mx-auto"
                            />
                            <p className="text-[10px] text-neutral-400 font-semibold tracking-widest uppercase mt-2">
                                100% ORIGINAL UK IMPORTED PRODUCTS
                            </p>
                        </div>
                    </div>

                    {/* 2. Top Two-Column Info Row (INVOICE TO on left, INVOICE metadata on right) */}
                    <div className="grid grid-cols-2 gap-6 pb-6 pt-1 items-start">
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

                    {/* 3. Line Items Table with Clean Corporate Divider Rules */}
                    <div className="mt-2 mb-6">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-t-2 border-b border-neutral-900 text-neutral-900 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 text-left font-bold">ITEM DESCRIPTION</th>
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
                                        <td className="py-3.5 font-normal text-neutral-900">100% Original UK Imported Cosmetics Order</td>
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

                                {/* Divider Line Above Total */}
                                <div className="border-t border-neutral-900 pt-2.5 mt-2 flex justify-between items-baseline">
                                    <span className="font-bold text-neutral-900 text-xs">Total :</span>
                                    <span className="font-bold text-neutral-900 text-base">
                                        {currency}{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Elegant Signature Script: "Thank You" */}
                    <div className="pt-8 pb-3 text-center">
                        <ThankYouSignature className="w-56 sm:w-64 mx-auto text-[#242424]" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceModal
