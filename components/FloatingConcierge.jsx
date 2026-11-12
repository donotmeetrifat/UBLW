'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    WhatsAppIcon,
    CloseIcon,
    TruckIcon,
    SparklesIcon,
    ShieldCheckIcon,
    RoyalCrownIcon
} from '@/components/icons'
import { SOCIAL_LINKS } from '@/lib/constants/social'

const FloatingConcierge = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-6 right-5 sm:right-6 z-40 select-none">
            {/* Expanded Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 15 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 w-[290px] sm:w-[320px] bg-white rounded-3xl p-5 border border-[#EFE0EF] shadow-2xl relative text-xs"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF6FA] text-slate-400 hover:text-[#241224] transition cursor-pointer"
                        >
                            <CloseIcon size={14} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-11 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                <RoyalCrownIcon size={20} color="#6C306E" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-[#241224] text-sm">UK Brand Lover</h4>
                                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online Beauty Concierge
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-600 text-[11px] leading-relaxed mb-4">
                            Need fast delivery in Dhaka or personal help picking the right UK skincare formula? Connect directly with our team:
                        </p>

                        <div className="space-y-2">
                            <a
                                href={`${SOCIAL_LINKS.whatsapp.url}?text=Hi%20UK%20Brand%20Lover,%20I%20have%20an%20inquiry%20about%20UK%20beauty%20products`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6FA] hover:bg-[#EFE0EF] border border-[#EFE0EF] text-[#241224] font-bold transition group"
                            >
                                <span className="flex items-center gap-2">
                                    <WhatsAppIcon size={16} color="#047857" />
                                    <span>Direct Product Inquiry</span>
                                </span>
                                <span className="text-[10px] text-[#6C306E]">Chat ➔</span>
                            </a>

                            <a
                                href={`${SOCIAL_LINKS.whatsapp.url}?text=Hi,%20can%20you%20help%20me%20track%20my%20parcel%20delivery?`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6FA] hover:bg-[#EFE0EF] border border-[#EFE0EF] text-[#241224] font-bold transition group"
                            >
                                <span className="flex items-center gap-2">
                                    <TruckIcon size={16} color="#6C306E" />
                                    <span>Live Parcel Tracking Support</span>
                                </span>
                                <span className="text-[10px] text-[#6C306E]">Help ➔</span>
                            </a>

                            <a
                                href={`${SOCIAL_LINKS.whatsapp.url}?text=Hi%20UK%20Brand%20Lover,%20I%20would%20like%20a%20free%20skincare%20consultation`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6FA] hover:bg-[#EFE0EF] border border-[#EFE0EF] text-[#241224] font-bold transition group"
                            >
                                <span className="flex items-center gap-2">
                                    <SparklesIcon size={16} color="#D8B56D" />
                                    <span>Free Skincare Consultation</span>
                                </span>
                                <span className="text-[10px] text-[#6C306E]">Ask ➔</span>
                            </a>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#EFE0EF] flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                            <ShieldCheckIcon size={12} color="#059669" />
                            <span>100% Original UK Imported Stock Guaranteed</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Pill / Circle with Breathing Emerald Halo */}
            <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open WhatsApp Concierge"
                className="group relative overflow-hidden flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:from-[#059669] hover:to-[#065F46] text-white border border-emerald-300/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_25px_-4px_rgba(5,150,105,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_16px_36px_-2px_rgba(5,150,105,0.75)] transition-all duration-300 cursor-pointer shimmer-active"
            >
                <div className="phone-icon-wiggle transition-transform duration-300">
                    <WhatsAppIcon size={20} color="#FFFFFF" />
                </div>
                <span className="text-xs font-bold tracking-wide">
                    {isOpen ? 'Close Concierge' : 'Beauty Concierge'}
                </span>
                <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
            </motion.button>
        </div>
    )
}

export default FloatingConcierge

