'use client'

import React from 'react'
import Image from 'next/image'
import { Facebook } from 'lucide-react'
import { assets } from '@/assets/assets'

const Newsletter = () => {
    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32 mb-16 sm:mb-24' aria-label="UK Brand Lover Facebook Community">
            <div className='bg-gradient-to-b from-[#FAF6FA] to-[#FCF8FC] rounded-3xl py-12 sm:py-16 px-6 sm:px-12 border border-[#EFE0EF] relative overflow-hidden text-center max-w-4xl mx-auto shadow-2xs'>
                {/* Subtle Decorative Background Accents */}
                <div className='size-72 rounded-full bg-[#6C306E]/3 blur-3xl absolute -top-20 -left-20 pointer-events-none' />
                <div className='size-72 rounded-full bg-[#D8B56D]/5 blur-3xl absolute -bottom-20 -right-20 pointer-events-none' />

                <div className='relative z-10 flex flex-col items-center max-w-2xl mx-auto'>
                    {/* Brand Logo */}
                    <div className='mb-3'>
                        <Image src={assets.webLogo} alt="UK Brand Lover Logo" className="h-12 sm:h-14 w-auto object-contain" priority />
                    </div>

                    {/* Small Eyebrow */}
                    <span className='text-[10px] font-bold text-[#6C306E] tracking-widest uppercase mb-2 block'>
                        THE UK BRAND LOVER COMMUNITY
                    </span>

                    {/* Main Headline */}
                    <h2 className='text-2xl sm:text-3xl font-extrabold text-[#241224] mb-3 tracking-tight'>
                        Join Our Facebook Community
                    </h2>

                    {/* Description */}
                    <p className='text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 max-w-md font-normal'>
                        Stay connected for new arrivals, exclusive UK beauty offers, restocks, and daily inspiration.
                    </p>

                    {/* Benefit Pills */}
                    <div className='flex flex-wrap justify-center gap-2 mb-2'>
                        <span className='inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#EFE0EF] text-[#3A0C38] text-[10px] font-bold tracking-wider uppercase shadow-2xs'>
                            NEW ARRIVALS
                        </span>
                        <span className='inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#EFE0EF] text-[#3A0C38] text-[10px] font-bold tracking-wider uppercase shadow-2xs'>
                            EXCLUSIVE OFFERS
                        </span>
                        <span className='inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border border-[#EFE0EF] text-[#3A0C38] text-[10px] font-bold tracking-wider uppercase shadow-2xs'>
                            RESTOCK ALERTS
                        </span>
                    </div>

                    {/* Primary Facebook CTA Button */}
                    <a
                        href="https://www.facebook.com/tuhinatopa"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow UK Brand Lover on Facebook"
                        className='inline-flex items-center justify-center gap-2.5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-8 py-3.5 rounded-full text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 mx-auto mt-7'
                    >
                        <Facebook size={16} className='text-white fill-white' />
                        Follow on Facebook
                    </a>

                    {/* Sub-label */}
                    <p className='text-slate-400 text-[11px] mt-4 font-medium'>
                        Official Facebook Community • @tuhinatopa • Authentic UK Beauty in Bangladesh
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Newsletter