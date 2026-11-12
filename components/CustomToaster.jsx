'use client'

import React from 'react'
import { Toaster, resolveValue, toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

// 1. Bespoke Luxury SVGs (Crafted exclusively for UK Brand Lover - No generic/common icons)
const SuccessGemIcon = ({ className = "size-5" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="url(#ukblSuccessBg)" stroke="#EFE0EF" strokeWidth="1.25" />
        <path d="M12 3.5L13.2 8.8L18.5 10L13.2 11.2L12 16.5L10.8 11.2L5.5 10L10.8 8.8L12 3.5Z" fill="#FAF6FA" opacity="0.75" />
        <circle cx="12" cy="12" r="9" stroke="url(#ukblSuccessRing)" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
        <path d="M8 12.2L10.7 14.9L16.2 9.4" stroke="url(#ukblSuccessStroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="ukblSuccessBg" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF6FA" />
                <stop stopColor="#F5E8F5" />
            </linearGradient>
            <linearGradient id="ukblSuccessStroke" x1="8" y1="9" x2="16" y2="15" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C306E" />
                <stop stopColor="#9956A1" />
            </linearGradient>
            <linearGradient id="ukblSuccessRing" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C306E" stopOpacity="0.5" />
                <stop stopColor="#9956A1" stopOpacity="0.1" />
            </linearGradient>
        </defs>
    </svg>
)

const ErrorGemIcon = ({ className = "size-5" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#FFF1F2" stroke="#FFE4E6" strokeWidth="1.25" />
        <path d="M12 4L19 12L12 20L5 12L12 4Z" stroke="#E11D48" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
        <path d="M12 7.5V12.5" stroke="#BE123C" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.3" fill="#BE123C" />
    </svg>
)

const LoadingGemIcon = ({ className = "size-5" }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
        >
            <circle cx="12" cy="12" r="9.5" stroke="#EFE0EF" strokeWidth="1.75" />
            <path
                d="M12 2.5C17.2 2.5 21.5 6.8 21.5 12"
                stroke="url(#ukblLoadingGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <defs>
                <linearGradient id="ukblLoadingGrad" x1="12" y1="2.5" x2="21.5" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6C306E" />
                    <stop stopColor="#C084FC" />
                </linearGradient>
            </defs>
        </motion.svg>
        <motion.div
            animate={{ scale: [0.75, 1.15, 0.75], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute size-2 bg-gradient-to-tr from-[#6C306E] to-[#9956A1] rounded-full shadow-xs"
        />
    </div>
)

const InfoGemIcon = ({ className = "size-5" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#FAF6FA" stroke="#EFE0EF" strokeWidth="1.25" />
        <path d="M12 4.5L13.8 9.5L19 10.2L15.2 13.8L16.2 19L12 16.4L7.8 19L8.8 13.8L5 10.2L10.2 9.5L12 4.5Z" fill="#6C306E" opacity="0.12" />
        <circle cx="12" cy="8" r="1.3" fill="#6C306E" />
        <path d="M12 11.5V16.5" stroke="#6C306E" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
)

const CloseMiniIcon = ({ className = "size-3" }) => (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

function getHeaderLabel(type) {
    switch (type) {
        case 'success':
            return 'Live Update Applied'
        case 'error':
            return 'Notice / Attention'
        case 'loading':
            return 'Processing Update'
        default:
            return 'System Notification'
    }
}

function renderToastIcon(t) {
    if (t.icon && typeof t.icon !== 'string') return t.icon
    switch (t.type) {
        case 'success':
            return <SuccessGemIcon className="size-5" />
        case 'error':
            return <ErrorGemIcon className="size-5" />
        case 'loading':
            return <LoadingGemIcon className="size-5" />
        default:
            return <InfoGemIcon className="size-5" />
    }
}

export default function CustomToaster() {
    return (
        <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{
                top: 24,
                zIndex: 99999,
            }}
            toastOptions={{
                duration: 3800,
            }}
        >
            {(t) => (
                <motion.div
                    initial={{ opacity: 0, y: -24, scale: 0.92, filter: 'blur(4px)' }}
                    animate={
                        t.visible
                            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
                            : { opacity: 0, y: -18, scale: 0.94, filter: 'blur(3px)' }
                    }
                    transition={{
                        type: 'spring',
                        stiffness: 460,
                        damping: 28,
                        mass: 0.75,
                    }}
                    whileHover={{ scale: 1.012 }}
                    className="pointer-events-auto select-none max-w-[92vw] sm:max-w-md w-auto min-w-[280px] sm:min-w-[340px] px-4 py-3 sm:px-5 sm:py-3.5 rounded-[22px] bg-white/95 backdrop-blur-xl border border-[#EFE0EF] shadow-[0_16px_40px_rgba(58,12,56,0.14),0_3px_10px_rgba(58,12,56,0.06)] flex items-center gap-3.5 relative overflow-hidden ring-1 ring-black/[0.03]"
                >
                    {/* Subtle Luxury Top Shimmer Accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6C306E]/70 to-transparent" />

                    {/* Custom Premium Icon */}
                    <div className="shrink-0 size-9 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center shadow-2xs">
                        {renderToastIcon(t)}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6C306E]">
                                {getHeaderLabel(t.type)}
                            </span>
                            <span className="size-1 rounded-full bg-[#6C306E]/40" />
                            <span className="text-[9px] font-bold text-slate-400">
                                UK Brand Lover
                            </span>
                        </div>
                        <p className="text-xs sm:text-[13px] font-semibold text-[#241224] leading-snug break-words">
                            {resolveValue(t.message, t)}
                        </p>
                    </div>

                    {/* Dismiss Close Action */}
                    <button
                        type="button"
                        onClick={() => toast.dismiss(t.id)}
                        className="shrink-0 p-1.5 rounded-full text-slate-400 hover:text-[#6C306E] hover:bg-[#FAF6FA] border border-transparent hover:border-[#EFE0EF] transition cursor-pointer"
                        aria-label="Dismiss notification"
                    >
                        <CloseMiniIcon />
                    </button>
                </motion.div>
            )}
        </Toaster>
    )
}
