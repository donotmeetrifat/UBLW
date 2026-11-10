'use client'

import banner1 from '../assets/banner/1.png'
import banner2 from '../assets/banner/2.jpg'
import banner3 from '../assets/banner/3.jpg'
import banner4 from '../assets/banner/4.jpg'
import banner5 from '../assets/banner/5.jpg'
import banner6 from '../assets/banner/6.jpg'
import banner7 from '../assets/banner/7.jpg'
import banner8 from '../assets/banner/8.jpg'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const AUTOPLAY_DELAY = 5000

const slides = [
    { image: banner1, imageAlt: 'UK Brand Lover curated skincare banner 1' },
    { image: banner2, imageAlt: 'UK Brand Lover luxury skincare banner 2' },
    { image: banner3, imageAlt: 'UK Brand Lover premium beauty banner 3' },
    { image: banner4, imageAlt: 'UK Brand Lover authentic cosmetics banner 4' },
    { image: banner5, imageAlt: 'UK Brand Lover direct UK imports banner 5' },
    { image: banner6, imageAlt: 'UK Brand Lover hair repair treatment banner 6' },
    { image: banner7, imageAlt: 'UK Brand Lover luxury fragrance banner 7' },
    { image: banner8, imageAlt: 'UK Brand Lover beauty deals banner 8' }
]

const HeroBannerSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const touchStartX = useRef(null)
    const touchEndX = useRef(null)

    const goToSlide = (index) => {
        setActiveIndex((index + slides.length) % slides.length)
    }

    const showPrevious = () => {
        goToSlide(activeIndex - 1)
    }

    const showNext = () => {
        goToSlide(activeIndex + 1)
    }

    const handleTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX
        touchEndX.current = null
    }

    const handleTouchMove = (event) => {
        touchEndX.current = event.touches[0].clientX
    }

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return

        const distance = touchStartX.current - touchEndX.current
        const minimumSwipeDistance = 45

        if (distance > minimumSwipeDistance) showNext()
        if (distance < -minimumSwipeDistance) showPrevious()

        touchStartX.current = null
        touchEndX.current = null
    }

    useEffect(() => {
        if (isPaused) return

        const timer = setInterval(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
        }, AUTOPLAY_DELAY)

        return () => clearInterval(timer)
    }, [isPaused, activeIndex])

    return (
        <section aria-label="Featured UK Brand Lover promotions" className="relative group">
            <div
                className="relative max-w-7xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-[0_8px_30px_rgba(58,12,56,0.06)]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Slides Track with Smooth Cubic Easing */}
                <div
                    className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <article
                            key={slide.imageAlt || index}
                            className="relative min-w-full w-full overflow-hidden flex items-center justify-center bg-[#FAF6FA]"
                            aria-hidden={activeIndex !== index}
                        >
                            <Image
                                src={slide.image}
                                alt={slide.imageAlt}
                                className="w-full h-auto object-cover max-h-[220px] min-[450px]:max-h-[280px] sm:max-h-[380px] md:max-h-[460px] lg:max-h-[520px] transition-transform duration-1000 ease-out select-none"
                                priority={index === 0}
                                quality={92}
                            />
                        </article>
                    ))}
                </div>

                {/* Glassmorphic Navigation Buttons (Appear smoothly on hover) */}
                <motion.button
                    type="button"
                    onClick={showPrevious}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous promotional slide"
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/80 backdrop-blur-md border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer"
                >
                    <ChevronLeftIcon size={18} color="#6C306E" />
                </motion.button>

                <motion.button
                    type="button"
                    onClick={showNext}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next promotional slide"
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/80 backdrop-blur-md border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer"
                >
                    <ChevronRightIcon size={18} color="#6C306E" />
                </motion.button>

                {/* Round Small Clickable Slide Indicators (Dots) */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20" role="tablist" aria-label="Banner slides">
                    {slides.map((_, index) => {
                        const isActive = activeIndex === index
                        return (
                            <button
                                key={index}
                                type="button"
                                role="tab"
                                aria-label={`Go to slide ${index + 1}`}
                                aria-selected={isActive}
                                onClick={() => goToSlide(index)}
                                className={`size-2 sm:size-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#6C306E] scale-125 shadow-xs ring-2 ring-white/60'
                                        : 'bg-white/80 hover:bg-white shadow-2xs'
                                }`}
                            />
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default HeroBannerSlider
