'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon, RoyalCrownIcon, SparklesIcon } from '@/components/icons'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import CategoriesMarquee from './CategoriesMarquee'
import HeroBannerSlider from './HeroBannerSlider'
import { FlowButton } from './ui/flow-button'
import { DEFAULT_PROMOTIONS } from '@/lib/promotions'

const Hero = () => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const reduxPromotions = useSelector(state => state.product?.promotions)

    // Merge live Redux promotions with defaults
    const promos = useMemo(() => {
        if (!reduxPromotions || typeof reduxPromotions !== 'object') {
            return DEFAULT_PROMOTIONS
        }
        return {
            mainCard: { ...DEFAULT_PROMOTIONS.mainCard, ...(reduxPromotions.mainCard || {}) },
            sideCardTop: { ...DEFAULT_PROMOTIONS.sideCardTop, ...(reduxPromotions.sideCardTop || {}) },
            sideCardBottom: { ...DEFAULT_PROMOTIONS.sideCardBottom, ...(reduxPromotions.sideCardBottom || {}) }
        }
    }, [reduxPromotions])

    const { mainCard, sideCardTop, sideCardBottom } = promos

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6'>
            {/* PRIMARY HERO: Main Banner Slider */}
            <HeroBannerSlider />

            {/* SECONDARY PROMOTIONAL AREA: 3 Interactive Boxes */}
            <div className='grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 mt-6 sm:mt-10'>
                {/* 1. Large Main Feature Card (Left Column) */}
                {mainCard.isActive !== false && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className='relative flex flex-col justify-between bg-gradient-to-br from-[#FAF6FA] via-[#FCF8FC] to-[#F7EEF7] rounded-3xl p-5 min-[380px]:p-6 sm:p-8 md:p-10 border border-[#EFE0EF] overflow-hidden group/hero hover:border-[#6C306E]/30 transition-all duration-300 min-h-[260px] sm:min-h-[340px] md:min-h-[380px] shadow-[0_4px_24px_rgba(58,12,56,0.03)]'
                    >
                        {/* Subtle ambient light orb */}
                        <div className='absolute -top-12 -left-12 size-48 rounded-full bg-[#6C306E]/4 blur-2xl pointer-events-none' />

                        <div className={`z-10 relative ${mainCard.image ? 'max-w-[58%] min-[400px]:max-w-[60%] sm:max-w-md' : 'max-w-xl'}`}>
                            {mainCard.badge && (
                                <div className='inline-flex items-center gap-1.5 bg-white text-[#6C306E] border border-[#EFE0EF] px-2.5 min-[380px]:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-2.5 sm:mb-3 shadow-2xs'>
                                    <RoyalCrownIcon size={12} color="#D8B56D" />
                                    <span>{mainCard.badge}</span>
                                </div>
                            )}

                            <h2 className='text-base min-[360px]:text-lg min-[420px]:text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#241224] leading-tight sm:leading-snug tracking-tight'>
                                {mainCard.title} <br className='hidden sm:inline' />
                                <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#6C306E] to-[#9956A1] font-semibold'>
                                    {mainCard.titleHighlight}
                                </span>
                            </h2>

                            {mainCard.description && (
                                <p className='text-[11px] sm:text-sm text-slate-500 mt-1.5 sm:mt-2 font-normal leading-relaxed max-w-sm line-clamp-2 sm:line-clamp-none'>
                                    {mainCard.description}
                                </p>
                            )}

                            {(mainCard.priceLabel || mainCard.priceValue) && (
                                <div className='flex items-baseline gap-2 mt-3 sm:mt-4'>
                                    {mainCard.priceLabel && (
                                        <span className='text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider'>
                                            {mainCard.priceLabel}
                                        </span>
                                    )}
                                    {mainCard.priceValue && (
                                        <span className='text-base sm:text-2xl font-extrabold text-[#3A0C38]'>
                                            {currency}{mainCard.priceValue.replace(/^[৳$£\s]+/, '')}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mt-3.5 sm:mt-5">
                                <FlowButton 
                                    text={mainCard.buttonText || "Discover the Collection →"} 
                                    href={mainCard.buttonLink || "/shop"} 
                                    className="px-4 min-[380px]:px-6 sm:px-8 h-9 min-[380px]:h-10 sm:h-12 text-[11px] min-[380px]:text-xs sm:text-sm font-bold shadow-xs" 
                                />
                            </div>
                        </div>

                        {/* Right-Aligned Large Transparent Image */}
                        {mainCard.image ? (
                            <div className='absolute right-0 bottom-0 top-0 h-full flex items-end justify-end pointer-events-none z-0 overflow-hidden rounded-r-3xl'>
                                <div
                                    className='h-full flex items-end justify-end'
                                    style={{
                                        transform: `scale(${(mainCard.imageScale || 100) / 100}) translateY(${mainCard.imageOffsetY || 0}%)`,
                                        transformOrigin: 'right bottom'
                                    }}
                                >
                                    <Image 
                                        className='h-full max-h-full w-auto object-contain object-right-bottom group-hover/hero:scale-104 transition-transform duration-700 ease-out translate-y-0.5' 
                                        src={mainCard.image} 
                                        alt={mainCard.imageAlt || "Direct from the UK - Premium Beauty"} 
                                        fill={false}
                                        width={500}
                                        height={500}
                                        priority
                                        unoptimized
                                    />
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                )}

                {/* 2 & 3. Secondary Side Promotional Cards (Right Column) */}
                <div className='flex flex-col sm:flex-row xl:flex-col gap-4 sm:gap-5 text-xs justify-between'>
                    {/* Top Small Card */}
                    {sideCardTop.isActive !== false && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-1"
                        >
                            <Link 
                                href={sideCardTop.buttonLink || "/shop"} 
                                className='flex items-center justify-between w-full h-full bg-[#FAF6FA] hover:bg-[#FAF3FA] rounded-3xl p-4 min-[380px]:p-5 sm:p-6 border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-all duration-300 group relative overflow-hidden min-h-[150px] min-[400px]:min-h-[160px] sm:min-h-[175px]'
                            >
                                <div className={`z-10 ${sideCardTop.image ? 'max-w-[56%] pr-1' : 'w-full'}`}>
                                    {sideCardTop.tag && (
                                        <span className='text-[9px] sm:text-[10px] font-extrabold text-[#6C306E] uppercase tracking-widest block mb-1'>
                                            {sideCardTop.tag}
                                        </span>
                                    )}
                                    <h3 className='text-base min-[380px]:text-lg sm:text-2xl font-bold text-[#241224] tracking-tight'>
                                        {sideCardTop.title}
                                    </h3>
                                    <p className='inline-flex items-center gap-1.5 mt-2.5 sm:mt-3 text-xs font-bold text-[#6C306E]'>
                                        {sideCardTop.buttonText || "Shop Now →"} 
                                        <ArrowRightIcon className='group-hover:translate-x-1.5 transition-transform duration-200' size={13} color="#6C306E" />
                                    </p>
                                </div>

                                {sideCardTop.image ? (
                                    <div className='w-[48%] h-full flex items-end justify-end relative shrink-0 overflow-hidden pointer-events-none'>
                                        <div
                                            className='h-full flex items-end justify-end'
                                            style={{
                                                transform: `scale(${(sideCardTop.imageScale || 100) / 100}) translateY(${sideCardTop.imageOffsetY || 0}%)`,
                                                transformOrigin: 'right bottom'
                                            }}
                                        >
                                            <Image 
                                                className='h-full max-h-full w-auto object-contain object-right-bottom group-hover:scale-106 transition-transform duration-500 ease-out translate-y-0.5' 
                                                src={sideCardTop.image} 
                                                alt={sideCardTop.imageAlt || sideCardTop.title || "Category Showcase"} 
                                                width={200}
                                                height={180}
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </Link>
                        </motion.div>
                    )}

                    {/* Bottom Small Card */}
                    {sideCardBottom.isActive !== false && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="flex-1"
                        >
                            <Link 
                                href={sideCardBottom.buttonLink || "/shop"} 
                                className='flex items-center justify-between w-full h-full bg-[#FAF6FA] hover:bg-[#FAF3FA] rounded-3xl p-4 min-[380px]:p-5 sm:p-6 border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-all duration-300 group relative overflow-hidden min-h-[150px] min-[400px]:min-h-[160px] sm:min-h-[175px]'
                            >
                                <div className={`z-10 ${sideCardBottom.image ? 'max-w-[56%] pr-1' : 'w-full'}`}>
                                    {sideCardBottom.tag && (
                                        <span className='text-[9px] sm:text-[10px] font-extrabold text-[#D8B56D] uppercase tracking-widest block mb-1'>
                                            {sideCardBottom.tag}
                                        </span>
                                    )}
                                    <h3 className='text-base min-[380px]:text-lg sm:text-2xl font-bold text-[#241224] tracking-tight'>
                                        {sideCardBottom.title}
                                    </h3>
                                    <p className='inline-flex items-center gap-1.5 mt-2.5 sm:mt-3 text-xs font-bold text-[#6C306E]'>
                                        {sideCardBottom.buttonText || "Shop Now →"} 
                                        <ArrowRightIcon className='group-hover:translate-x-1.5 transition-transform duration-200' size={13} color="#6C306E" />
                                    </p>
                                </div>

                                {sideCardBottom.image ? (
                                    <div className='w-[48%] h-full flex items-end justify-end relative shrink-0 overflow-hidden pointer-events-none'>
                                        <div
                                            className='h-full flex items-end justify-end'
                                            style={{
                                                transform: `scale(${(sideCardBottom.imageScale || 100) / 100}) translateY(${sideCardBottom.imageOffsetY || 0}%)`,
                                                transformOrigin: 'right bottom'
                                            }}
                                        >
                                            <Image 
                                                className='h-full max-h-full w-auto object-contain object-right-bottom group-hover:scale-106 transition-transform duration-500 ease-out translate-y-0.5' 
                                                src={sideCardBottom.image} 
                                                alt={sideCardBottom.imageAlt || sideCardBottom.title || "Promo Showcase"} 
                                                width={200}
                                                height={180}
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Running Category Navigation Marquee */}
            <CategoriesMarquee />
        </div>
    )
}

export default Hero
