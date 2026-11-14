'use client'

import React from 'react'
import Image from 'next/image'
import { FacebookIcon } from '@/components/icons'
import { assets } from '@/assets/assets'
import { motion } from 'framer-motion'
import { SOCIAL_LINKS } from '@/lib/constants/social'

// Custom Inline Brand SVGs (Brand Color: #6C306E)
const UKCargoIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        {/* Simple UK flag / plane icon */}
        <rect x="1" y="4" width="16" height="10" rx="2" stroke="#6C306E" strokeWidth="1.5" fill="none"/>
        <line x1="1" y1="4" x2="17" y2="14" stroke="#6C306E" strokeWidth="1"/>
        <line x1="17" y1="4" x2="1" y2="14" stroke="#6C306E" strokeWidth="1"/>
        <line x1="9" y1="4" x2="9" y2="14" stroke="#6C306E" strokeWidth="1.5"/>
        <line x1="1" y1="9" x2="17" y2="9" stroke="#6C306E" strokeWidth="1.5"/>
    </svg>
)

const ReviewsStarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path d="M9 2 L10.8 7H16L11.6 10.1L13.4 15.1L9 12L4.6 15.1L6.4 10.1L2 7H7.2Z" stroke="#6C306E" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
    </svg>
)

const AdviceSparkleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        {/* Sparkle / wand */}
        <line x1="9" y1="1" x2="9" y2="5" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="13" x2="9" y2="17" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="1" y1="9" x2="5" y2="9" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="13" y1="9" x2="17" y2="9" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="3" x2="6" y2="6" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="12" x2="15" y2="15" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="15" y1="3" x2="12" y2="6" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="12" x2="3" y2="15" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Center circle */}
        <circle cx="9" cy="9" r="2.5" stroke="#6C306E" strokeWidth="1.5" fill="none"/>
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

                <div className='relative z-10 flex flex-col items-center max-w-2xl mx-auto'>
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

                    {/* 3 Organized Luxury Tags (Small, Balanced & Clean) */}
                    <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-lg mx-auto mb-7'>
                        <div className='inline-flex items-center justify-center gap-1.5 bg-white/95 border border-[#EFE0EF] hover:border-[#6C306E]/40 px-3.5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(108,48,110,0.03)] hover:shadow-[0_4px_12px_rgba(108,48,110,0.08)] transition-all duration-300'>
                            <UKCargoIcon />
                            <span className='text-[10px] sm:text-[11px] font-bold text-[#3A0C38] tracking-wider uppercase whitespace-nowrap'>
                                FIRST ACCESS TO NEW UK CARGO
                            </span>
                        </div>
                        <div className='inline-flex items-center justify-center gap-1.5 bg-white/95 border border-[#EFE0EF] hover:border-[#6C306E]/40 px-3.5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(108,48,110,0.03)] hover:shadow-[0_4px_12px_rgba(108,48,110,0.08)] transition-all duration-300'>
                            <ReviewsStarIcon />
                            <span className='text-[10px] sm:text-[11px] font-bold text-[#3A0C38] tracking-wider uppercase whitespace-nowrap'>
                                HONEST REVIEWS FROM REAL CUSTOMERS
                            </span>
                        </div>
                        <div className='inline-flex items-center justify-center gap-1.5 bg-white/95 border border-[#EFE0EF] hover:border-[#6C306E]/40 px-3.5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(108,48,110,0.03)] hover:shadow-[0_4px_12px_rgba(108,48,110,0.08)] transition-all duration-300'>
                            <AdviceSparkleIcon />
                            <span className='text-[10px] sm:text-[11px] font-bold text-[#3A0C38] tracking-wider uppercase whitespace-nowrap'>
                                PERSONAL SKINCARE ADVICE
                            </span>
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
