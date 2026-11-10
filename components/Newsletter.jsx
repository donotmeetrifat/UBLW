'use client'

import React from 'react'
import Image from 'next/image'
import { FacebookIcon, SparklesIcon } from '@/components/icons'
import { assets } from '@/assets/assets'
import { motion } from 'framer-motion'

const Newsletter = () => {
    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32 mb-16 sm:mb-24' aria-label="UK Brand Lover Facebook Community">
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

                    {/* Small Eyebrow */}
                    <span className='inline-flex items-center gap-1.5 text-[10px] font-bold text-[#6C306E] tracking-widest uppercase mb-2'>
                        <SparklesIcon size={11} color="#D8B56D" />
                        THE UK BRAND LOVER COMMUNITY
                    </span>

                    {/* Main Headline */}
                    <h2 className='text-2xl sm:text-3xl font-extrabold text-[#241224] mb-3 tracking-tight'>
                        Join Our Facebook Community
                    </h2>

                    {/* Description */}
                    <p className='text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 max-w-md font-normal'>
                        Connect with over 10,000+ beauty lovers in Bangladesh for authentic UK restock alerts, flash drops, reviews, and personalized skincare advice.
                    </p>

                    {/* Benefit Pills */}
                    <div className='flex flex-wrap justify-center gap-2 mb-2'>
                        <span className='inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#EFE0EF] text-[#3A0C38] text-[10px] font-bold tracking-wider uppercase shadow-2xs'>
                            NEW ARRIVALS
                        </span>
                        <span className='inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#EFE0EF] text-[#3A0C38] text-[10px] font-bold tracking-wider uppercase shadow-2xs'>
                            EXCLUSIVE UK DROPS
                        </span>
                        <span className='inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#EFE0EF] text-[#3A0C38] text-[10px] font-bold tracking-wider uppercase shadow-2xs'>
                            RESTOCK ALERTS
                        </span>
                    </div>

                    {/* Primary Facebook CTA Button with Spring */}
                    <motion.a
                        href="https://www.facebook.com/tuhinatopa"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow UK Brand Lover on Facebook"
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className='inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#6C306E] to-[#4F1A51] hover:from-[#4F1A51] hover:to-[#3A0C38] text-white px-8 py-3.5 rounded-full text-xs font-bold shadow-[0_4px_18px_rgba(108,48,110,0.25)] mx-auto mt-7'
                    >
                        <FacebookIcon size={16} color="#FFFFFF" fill="#FFFFFF" />
                        Follow on Facebook
                    </motion.a>

                    {/* Sub-label */}
                    <p className='text-slate-400 text-[11px] mt-4 font-medium'>
                        Official Community • @tuhinatopa • 100% Authentic UK Beauty in Bangladesh
                    </p>
                </div>
            </motion.div>
        </section>
    )
}

export default Newsletter
