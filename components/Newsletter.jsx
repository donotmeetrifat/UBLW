'use client'

import React from 'react'
import Image from 'next/image'
import { FacebookIcon } from '@/components/icons'
import { assets } from '@/assets/assets'
import { motion } from 'framer-motion'
import { SOCIAL_LINKS } from '@/lib/constants/social'

// Custom Premium 2D Luxury SVGs (Brand Color: #6C306E)
const UKCargoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M1.5 8L14.5 2.5L9.5 14.5L7.5 9.5L1.5 8Z" stroke="#6C306E" strokeWidth="1.4" strokeLinejoin="round" fill="#FAF6FA"/>
        <path d="M7.5 9.5L14.5 2.5" stroke="#6C306E" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
)

const ReviewsStarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M8 1.5L9.9 5.8L14.5 6.3L11.1 9.4L12.1 14L8 11.6L3.9 14L4.9 9.4L1.5 6.3L6.1 5.8L8 1.5Z" stroke="#6C306E" strokeWidth="1.4" strokeLinejoin="round" fill="#FAF6FA"/>
    </svg>
)

const AdviceSparkleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M8 1C8 4.8 4.8 8 1 8C4.8 8 8 11.2 8 15C8 11.2 11.2 8 15 8C11.2 8 8 4.8 8 1Z" stroke="#6C306E" strokeWidth="1.4" strokeLinejoin="round" fill="#FAF6FA"/>
    </svg>
)

const Newsletter = () => {
    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32 mb-16 sm:mb-24' aria-label="UK Brand Lover Facebook Page">
            <motion.div 
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className='bg-gradient-to-b from-[#FAF6FA] to-[#FCF8FC] rounded-3xl py-12 sm:py-16 px-6 sm:px-12 border border-[#EFE0EF] relative overflow-hidden text-center max-w-4xl mx-auto shadow-[0_8px_32px_rgba(58,12,56,0.04)]'
            >
                {/* Subtle Decorative Ambient Glow Orbs */}
                <div className='size-72 rounded-full bg-[#6C306E]/4 blur-3xl absolute -top-20 -left-20 pointer-events-none' />
                <div className='size-72 rounded-full bg-[#D8B56D]/6 blur-3xl absolute -bottom-20 -right-20 pointer-events-none' />

                <div className='relative z-10 flex flex-col items-center max-w-3xl mx-auto w-full'>
                    {/* Brand Logo with Gentle Hover */}
                    <div className='mb-3'>
                        <Image 
                            src={assets.webLogo} 
                            alt="UK Brand Lover Logo" 
                            className="h-12 sm:h-14 w-auto object-contain" 
                            priority 
                        />
                    </div>

                    {/* Warm Community Eyebrow */}
                    <span className='inline-block text-[10px] sm:text-[11px] font-bold text-[#6C306E] tracking-widest uppercase mb-2'>
                        3,000+ BEAUTY LOVERS ACROSS BANGLADESH
                    </span>

                    {/* Emotional & Connecting Headline */}
                    <h2 className='text-2xl sm:text-3xl font-extrabold text-[#241224] mb-3 tracking-tight'>
                        You&apos;re Not Just Shopping. You&apos;re Joining a Family.
                    </h2>

                    {/* Description */}
                    <p className='text-slate-600 text-xs sm:text-sm leading-relaxed mb-7 max-w-lg font-normal'>
                        Restock alerts, honest reviews, and real beauty advice —<br className='hidden sm:inline' />
                        from people who actually use it.
                    </p>

                    {/* 3 Highlights in One Unified Horizontal Row (Left to Right, Compact & Fully Visible) */}
                    <div className='w-full mx-auto mb-7 px-1'>
                        <div className='flex items-center justify-center gap-1.5 sm:gap-2.5 flex-nowrap'>
                            <div className='inline-flex items-center gap-1 sm:gap-1.5 bg-white/95 border border-[#EFE0EF] hover:border-[#6C306E]/40 px-2 sm:px-2.5 py-1 rounded-full shadow-2xs shrink-0'>
                                <UKCargoIcon />
                                <span className='text-[8.5px] min-[400px]:text-[9.5px] sm:text-[10px] md:text-[11px] font-semibold text-[#3A0C38] tracking-wide uppercase whitespace-nowrap'>
                                    FIRST ACCESS TO NEW UK CARGO
                                </span>
                            </div>
                            <div className='inline-flex items-center gap-1 sm:gap-1.5 bg-white/95 border border-[#EFE0EF] hover:border-[#6C306E]/40 px-2 sm:px-2.5 py-1 rounded-full shadow-2xs shrink-0'>
                                <ReviewsStarIcon />
                                <span className='text-[8.5px] min-[400px]:text-[9.5px] sm:text-[10px] md:text-[11px] font-semibold text-[#3A0C38] tracking-wide uppercase whitespace-nowrap'>
                                    HONEST REVIEWS FROM REAL CUSTOMERS
                                </span>
                            </div>
                            <div className='inline-flex items-center gap-1 sm:gap-1.5 bg-white/95 border border-[#EFE0EF] hover:border-[#6C306E]/40 px-2 sm:px-2.5 py-1 rounded-full shadow-2xs shrink-0'>
                                <AdviceSparkleIcon />
                                <span className='text-[8.5px] min-[400px]:text-[9.5px] sm:text-[10px] md:text-[11px] font-semibold text-[#3A0C38] tracking-wide uppercase whitespace-nowrap'>
                                    PERSONAL SKINCARE ADVICE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Primary Facebook CTA Button with Emotional Connection */}
                    <motion.a
                        href={SOCIAL_LINKS.facebook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Join UK Brand Lover Family on Facebook"
                        whileHover={{ scale: 1.035, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className='group relative overflow-hidden inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1877F2] via-[#166FE5] to-[#0E52B5] hover:from-[#1A82FF] hover:to-[#1264DA] text-white px-9 py-4 rounded-full text-xs sm:text-sm font-bold border border-blue-300/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_24px_-4px_rgba(24,119,242,0.45)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_14px_34px_-2px_rgba(24,119,242,0.7)] mx-auto transition-all duration-300 shimmer-active cursor-pointer'
                    >
                        <div className="group-hover:scale-110 transition-transform duration-300 shrink-0">
                            <FacebookIcon size={16} color="#FFFFFF" />
                        </div>
                        <span className="tracking-wide">Join Our Facebook Family</span>
                    </motion.a>

                    {/* Sub-label */}
                    <p className='text-slate-400 text-[11px] mt-4 font-medium'>
                        UK Brand LOVER Community · 3,000+ Members · 100% Authentic UK Imports
                    </p>
                </div>
            </motion.div>
        </section>
    )
}

export default Newsletter
