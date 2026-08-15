'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import HeroBannerSlider from './HeroBannerSlider'

const Hero = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8'>
            {/* PRIMARY HERO: Main Banner Slider */}
            <HeroBannerSlider />

            {/* SECONDARY PROMOTIONAL AREA */}
            <div className='grid grid-cols-1 xl:grid-cols-[1fr_370px] gap-6 mt-6 sm:mt-10'>
                {/* Secondary Main Feature Card: Direct from the UK (Main Focal Point) */}
                <div className='relative flex flex-col justify-between bg-[#FAF6FA]/90 rounded-3xl p-5 sm:p-8 md:p-10 border border-[#EFE0EF] overflow-hidden group hover:border-[#6C306E]/30 transition-all min-h-[240px] min-[420px]:min-h-[260px] sm:min-h-[360px]'>
                    <div className='z-10 max-w-[56%] min-[450px]:max-w-[58%] sm:max-w-md'>
                        <div className='inline-flex items-center gap-1 sm:gap-1.5 bg-white text-[#6C306E] border border-[#EFE0EF] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 shadow-2xs'>
                            <Sparkles size={12} className='text-[#D8B56D] shrink-0' />
                            100% Original UK Imports
                        </div>

                        <h2 className='text-lg min-[400px]:text-xl sm:text-3xl font-bold text-[#241224] leading-snug tracking-tight'>
                            Curated Beauty & Skincare. <br className='hidden sm:inline' />
                            <span className='text-[#6C306E] font-medium'>Direct from the UK.</span>
                        </h2>

                        <p className='text-[11px] sm:text-sm text-slate-500 mt-1.5 sm:mt-2 font-normal leading-relaxed max-w-sm line-clamp-2 sm:line-clamp-none'>
                            Discover authentic dermatological skincare, cult cosmetics, and premium haircare imported directly to Bangladesh.
                        </p>

                        <div className='flex items-baseline gap-1.5 sm:gap-2 mt-2.5 sm:mt-4'>
                            <span className='text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider'>Starts from</span>
                            <span className='text-lg sm:text-2xl font-bold text-[#3A0C38]'>{currency}1,650</span>
                        </div>

                        <Link 
                            href="/shop" 
                            className='inline-flex items-center gap-1.5 sm:gap-2 bg-[#6C306E] hover:bg-[#3A0C38] text-white text-[11px] sm:text-xs font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full mt-3.5 sm:mt-6 transition-all shadow-2xs active:scale-95'
                        >
                            Explore Collection
                            <ChevronRightIcon size={14} />
                        </Link>
                    </div>

                    {/* Right-Aligned Large Transparent Image (Direct from the UK - Placed flush at bottom) */}
                    <div className='absolute right-0 min-[400px]:right-1 sm:right-2 bottom-0 top-0 w-[44%] min-[450px]:w-[48%] sm:w-[50%] max-w-[340px] flex items-end justify-end pointer-events-none z-0 overflow-hidden rounded-b-3xl'>
                        <Image 
                            className='h-full max-h-full w-auto object-contain object-right-bottom group-hover:scale-104 transition-transform duration-500 ease-out translate-y-1' 
                            src={assets.hero_card_img1} 
                            alt="Direct from the UK - Premium Beauty" 
                            priority
                        />
                    </div>
                </div>

                {/* Hero Secondary Side Promotional Cards (Skincare & Cosmetics) */}
                <div className='flex flex-col sm:flex-row xl:flex-col gap-4 sm:gap-5 text-xs justify-between'>
                    {/* Top Card: TOP SELECTED / Skincare */}
                    <Link 
                        href="/shop?category=Skincare" 
                        className='flex-1 flex items-center justify-between w-full bg-[#FAF6FA]/90 rounded-3xl p-5 sm:p-6 border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-colors group relative overflow-hidden h-[160px] min-[400px]:h-[170px] sm:h-[180px]'
                    >
                        <div className='z-10 max-w-[54%] pr-1'>
                            <span className='text-[9px] sm:text-[10px] font-bold text-[#6C306E] uppercase tracking-wider block mb-1'>TOP SELECTED</span>
                            <h3 className='text-lg sm:text-2xl font-bold text-[#241224] tracking-tight'>Skincare</h3>
                            <p className='inline-flex items-center gap-1 mt-2.5 sm:mt-3 text-[11px] sm:text-xs font-semibold text-[#6C306E]'>
                                Shop Skincare <ArrowRightIcon className='group-hover:translate-x-1 transition-transform' size={13} />
                            </p>
                        </div>

                        {/* Right-aligned Large Transparent Product Image (Flush Bottom) */}
                        <div className='w-[46%] h-full flex items-end justify-end relative shrink-0 overflow-hidden pointer-events-none'>
                            <Image 
                                className='h-full max-h-full w-auto object-contain object-right-bottom group-hover:scale-105 transition-transform duration-500 ease-out translate-y-0.5' 
                                src={assets.hero_card_img2} 
                                alt="Skincare Top Selected" 
                            />
                        </div>
                    </Link>

                    {/* Bottom Card: EXCLUSIVE DEALS / Cosmetics */}
                    <Link 
                        href="/shop?category=Makeup" 
                        className='flex-1 flex items-center justify-between w-full bg-[#FAF6FA]/90 rounded-3xl p-5 sm:p-6 border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-colors group relative overflow-hidden h-[160px] min-[400px]:h-[170px] sm:h-[180px]'
                    >
                        <div className='z-10 max-w-[54%] pr-1'>
                            <span className='text-[9px] sm:text-[10px] font-bold text-[#D8B56D] uppercase tracking-wider block mb-1'>EXCLUSIVE DEALS</span>
                            <h3 className='text-lg sm:text-2xl font-bold text-[#241224] tracking-tight'>Cosmetics</h3>
                            <p className='inline-flex items-center gap-1 mt-2.5 sm:mt-3 text-[11px] sm:text-xs font-semibold text-[#6C306E]'>
                                Shop Makeup <ArrowRightIcon className='group-hover:translate-x-1 transition-transform' size={13} />
                            </p>
                        </div>

                        {/* Right-aligned Large Transparent Product Image (Flush Bottom) */}
                        <div className='w-[46%] h-full flex items-end justify-end relative shrink-0 overflow-hidden pointer-events-none'>
                            <Image 
                                className='h-full max-h-full w-auto object-contain object-right-bottom group-hover:scale-105 transition-transform duration-500 ease-out translate-y-0.5' 
                                src={assets.hero_card_img3} 
                                alt="Cosmetics Exclusive Deals" 
                            />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Category Navigation Strip below secondary hero */}
            <CategoriesMarquee />
        </div>
    )
}

export default Hero