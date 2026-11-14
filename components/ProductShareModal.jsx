'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CloseIcon,
    CheckIcon,
    CopyLinkIcon,
    ShareIcon,
    OfficialWhatsAppIcon,
    OfficialMessengerIcon,
    OfficialTelegramIcon,
    OfficialFacebookIcon,
    OfficialXIcon
} from '@/components/icons'
import toast from 'react-hot-toast'

export default function ProductShareModal({ product, isOpen, onClose }) {
    const [copied, setCopied] = useState(false)
    const [shareUrl, setShareUrl] = useState('')
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(window.location.href)
        }
    }, [isOpen, product])

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !product) return null

    const shareTitle = `Check out ${product.name} on UK Brand Lover — 100% authentic UK imported beauty in Bangladesh!`
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success('Product link copied to clipboard!')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            // Fallback for older browsers
            try {
                const el = document.createElement('textarea')
                el.value = shareUrl
                document.body.appendChild(el)
                el.select()
                document.execCommand('copy')
                document.body.removeChild(el)
                setCopied(true)
                toast.success('Product link copied to clipboard!')
                setTimeout(() => setCopied(false), 2500)
            } catch {
                toast.error('Could not copy link automatically. Please copy the URL manually.')
            }
        }
    }

    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: shareTitle,
                    url: shareUrl
                })
            } catch (err) {
                // User cancelled or share failed silently
            }
        } else {
            handleCopyLink()
        }
    }

    const sharePlatforms = [
        {
            name: 'WhatsApp',
            icon: OfficialWhatsAppIcon,
            color: '#25D366',
            url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
            target: '_blank'
        },
        {
            name: 'Messenger',
            icon: OfficialMessengerIcon,
            color: '#0084FF',
            url: `fb-messenger://share/?link=${encodedUrl}&app_id=966242223397117`,
            fallbackUrl: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=966242223397117&redirect_uri=${encodedUrl}`,
            onClick: (e) => {
                // Try opening messenger or fallback to dialog
                e.preventDefault()
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                if (isMobile) {
                    window.location.href = `fb-messenger://share/?link=${encodedUrl}`
                    setTimeout(() => {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
                    }, 1200)
                } else {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=500')
                }
            }
        },
        {
            name: 'Telegram',
            icon: OfficialTelegramIcon,
            color: '#229ED9',
            url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            target: '_blank'
        },
        {
            name: 'Facebook',
            icon: OfficialFacebookIcon,
            color: '#1877F2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            target: '_blank'
        },
        {
            name: 'X (Twitter)',
            icon: OfficialXIcon,
            color: '#000000',
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            target: '_blank'
        }
    ]

    const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
                {/* Backdrop Click */}
                <div 
                    className="absolute inset-0" 
                    onClick={onClose} 
                    aria-hidden="true" 
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative bg-white rounded-3xl p-5 sm:p-6 border border-[#EFE0EF] shadow-2xl max-w-md w-full z-10 overflow-hidden font-poppins"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                <ShareIcon size={16} color="#6C306E" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold text-[#241224] tracking-tight">
                                    Share This Product
                                </h3>
                                <p className="text-[10.5px] text-slate-400">
                                    100% Authentic UK Imported Skincare
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="size-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#241224] transition cursor-pointer"
                            aria-label="Close share dialog"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>

                    {/* Product Preview Snippet */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] mb-5">
                        <div className="size-14 rounded-xl bg-white border border-[#EFE0EF] overflow-hidden shrink-0 relative">
                            {product.images && product.images[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[9.5px] font-bold text-[#6C306E] uppercase tracking-wider block mb-0.5">
                                {product.category || 'UK Beauty'}
                            </span>
                            <h4 className="text-xs font-bold text-[#241224] truncate leading-tight">
                                {product.name}
                            </h4>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xs font-black text-[#3A0C38]">
                                    {currency}{Number(product.price || 0).toLocaleString()}
                                </span>
                                {product.mrp && product.mrp > product.price && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                        {currency}{Number(product.mrp).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Platform Icons Grid */}
                    <div className="mb-5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Direct Share to Platforms
                        </p>

                        <div className="grid grid-cols-5 gap-2 text-center">
                            {sharePlatforms.map((platform) => {
                                const Icon = platform.icon
                                return (
                                    <a
                                        key={platform.name}
                                        href={platform.url}
                                        target={platform.target || '_self'}
                                        rel="noopener noreferrer"
                                        onClick={platform.onClick}
                                        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-[#FAF6FA] border border-transparent hover:border-[#EFE0EF] transition-all group cursor-pointer"
                                        title={`Share on ${platform.name}`}
                                    >
                                        <div className="size-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs">
                                            <Icon size={38} />
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-600 group-hover:text-[#241224] truncate w-full">
                                            {platform.name}
                                        </span>
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* Native Device Share Sheet (Mobile / Tablet / Modern Browsers) */}
                    {canNativeShare && (
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={handleNativeShare}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-[#FAF6FA] border border-[#EFE0EF] hover:border-[#6C306E]/30 rounded-2xl text-xs font-bold text-[#6C306E] transition shadow-2xs cursor-pointer"
                            >
                                <ShareIcon size={14} color="#6C306E" />
                                <span>More Sharing Options (Device Share)</span>
                            </button>
                        </div>
                    )}

                    {/* Copy Link Section */}
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Or Copy Product Link
                        </p>
                        <div className="flex items-center gap-2 p-1.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl">
                            <div className="flex items-center gap-2 pl-2.5 flex-1 min-w-0">
                                <CopyLinkIcon size={14} color="#6C306E" className="shrink-0" />
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="w-full bg-transparent text-xs text-slate-600 font-mono outline-none truncate select-all"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                    copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[#6C306E] hover:bg-[#3A0C38] text-white'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon size={13} color="#FFFFFF" strokeWidth={2.5} />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <span>Copy Link</span>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
