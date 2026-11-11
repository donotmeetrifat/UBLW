'use client'

import React from 'react'
import Image from 'next/image'
import { FacebookIcon } from '@/components/icons'
import { assets } from '@/assets/assets'
import { motion } from 'framer-motion'
import { SOCIAL_LINKS } from '@/lib/constants/social'

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
                        OVER 3,000+ BEAUTY LOVERS IN BANGLADESH
                    </span>

                    {/* Emotional & Connecting Headline */}
                    <h2 className='text-2xl sm:text-3xl font-extrabold text-[#241224] mb-3 tracking-tight'>
                        Be Part of Our Beauty Family
                    </h2>

                    {/* Description */}
                    <p className='text-slate-600 text-xs sm:text-sm leading-relaxed mb-7 max-w-lg font-normal'>
                        Connect with over 3,000+ beauty lovers in Bangladesh for authentic UK restock alerts, flash drops, reviews, and personalized skincare advice.
                    </p>

                    {/* 3 Premium Boxes (No Icons, High-End Minimalist UI) */}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-7'>
                        <div className='bg-white/90 backdrop-blur-xs border border-[#EFE0EF] hover:border-[#6C306E]/40 py-3 px-4 rounded-2xl shadow-[0_2px_10px_rgba(108,48,110,0.03)] hover:shadow-[0_4px_16px_rgba(108,48,110,0.08)] transition-all duration-300 flex items-center justify-center text-center'>
                            <span className='text-[11px] sm:text-xs font-bold text-[#3A0C38] tracking-wide'>
                                Direct From London
                            </span>
                        </div>
                        <div className='bg-white/90 backdrop-blur-xs border border-[#EFE0EF] hover:border-[#6C306E]/40 py-3 px-4 rounded-2xl shadow-[0_2px_10px_rgba(108,48,110,0.03)] hover:shadow-[0_4px_16px_rgba(108,48,110,0.08)] transition-all duration-300 flex items-center justify-center text-center'>
                            <span className='text-[11px] sm:text-xs font-bold text-[#3A0C38] tracking-wide'>
                                VIP Restock Drops
                            </span>
                        </div>
                        <div className='bg-white/90 backdrop-blur-xs border border-[#EFE0EF] hover:border-[#6C306E]/40 py-3 px-4 rounded-2xl shadow-[0_2px_10px_rgba(108,48,110,0.03)] hover:shadow-[0_4px_16px_rgba(108,48,110,0.08)] transition-all duration-300 flex items-center justify-center text-center'>
                            <span className='text-[11px] sm:text-xs font-bold text-[#3A0C38] tracking-wide'>
                                Personal Skincare Advice
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
                        <span className="tracking-wide">Join Our Beauty Family</span>
                    </motion.a>

                    {/* Sub-label */}
                    <p className='text-slate-400 text-[11px] mt-4 font-medium'>
                        Our Facebook Family • {SOCIAL_LINKS.facebook.handle} • 100% Original UK Imports
                    </p>
                </div>
            </motion.div>
        </section>
    )
}

export default Newsletter
