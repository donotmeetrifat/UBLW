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
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)

    const dragStartX = useRef(0)
    const isPointerDown = useRef(false)
    const currentDragOffset = useRef(0)

    const goToSlide = (index) => {
        setActiveIndex((index + slides.length) % slides.length)
    }

    const showPrevious = () => {
        goToSlide(activeIndex - 1)
    }

    const showNext = () => {
        goToSlide(activeIndex + 1)
    }

    /* Unified Smooth Pointer / Mouse Drag Handlers */
    const handlePointerDown = (event) => {
        // Only accept primary button (left click) or touch
        if (event.button !== undefined && event.button !== 0) return

        isPointerDown.current = true
        dragStartX.current = event.clientX
        currentDragOffset.current = 0
        setIsPaused(true)
    }

    const handlePointerMove = (event) => {
        if (!isPointerDown.current) return

        let diff = event.clientX - dragStartX.current

        // Add rubber-band resistance at boundary edges
        if (activeIndex === 0 && diff > 0) {
            diff = diff * 0.3
        } else if (activeIndex === slides.length - 1 && diff < 0) {
            diff = diff * 0.3
        }

        if (Math.abs(diff) > 3) {
            setIsDragging(true)
        }

        currentDragOffset.current = diff
        setDragOffset(diff)
    }

    const handlePointerUp = () => {
        if (!isPointerDown.current) return

        isPointerDown.current = false
        const diff = currentDragOffset.current
        const threshold = 55 // Minimum distance to trigger slide change

        if (diff < -threshold) {
            showNext()
        } else if (diff > threshold) {
            showPrevious()
        }

        setIsDragging(false)
        setDragOffset(0)
        currentDragOffset.current = 0
        setIsPaused(false)
    }

    const handlePointerCancel = () => {
        if (!isPointerDown.current) return
        isPointerDown.current = false
        setIsDragging(false)
        setDragOffset(0)
        currentDragOffset.current = 0
        setIsPaused(false)
    }

    useEffect(() => {
        if (isPaused || isDragging) return

        const timer = setInterval(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
        }, AUTOPLAY_DELAY)

        return () => clearInterval(timer)
    }, [isPaused, isDragging, activeIndex])

    return (
        <section aria-label="Featured UK Brand Lover promotions" className="relative group select-none">
            <div
                className={`relative max-w-7xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-[0_8px_30px_rgba(58,12,56,0.06)] touch-pan-y ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                    handlePointerCancel()
                    setIsPaused(false)
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onDragStart={(e) => e.preventDefault()}
            >
                {/* Slides Track with Smooth Dek-celerated Easing & Real-Time Mouse Drag */}
                <div
                    className="flex will-change-transform"
                    style={{
                        transform: isDragging
                            ? `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`
                            : `translateX(-${activeIndex * 100}%)`,
                        transition: isDragging
                            ? 'none'
                            : 'transform 750ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    {slides.map((slide, index) => {
                        const isActive = activeIndex === index
                        return (
                            <article
                                key={slide.imageAlt || index}
                                className="relative min-w-full w-full overflow-hidden flex items-center justify-center bg-[#FAF6FA] shrink-0"
                                aria-hidden={!isActive}
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.imageAlt}
                                    draggable={false}
                                    className={`w-full h-auto object-cover max-h-[220px] min-[450px]:max-h-[280px] sm:max-h-[380px] md:max-h-[460px] lg:max-h-[520px] transition-transform duration-[6000ms] ease-out pointer-events-none select-none ${
                                        isActive ? 'scale-[1.02]' : 'scale-100'
                                    }`}
                                    priority={index === 0}
                                    quality={92}
                                />
                            </article>
                        )
                    })}
                </div>

                {/* Glassmorphic Navigation Buttons (Appear smoothly on hover) */}
                <motion.button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        showPrevious()
                    }}
                    whileHover={{ scale: 1.12, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous promotional slide"
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/85 backdrop-blur-md border border-white/50 text-[#6C306E] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer hover:shadow-[0_6px_22px_rgba(108,48,110,0.35)]"
                >
                    <ChevronLeftIcon size={18} color="#6C306E" />
                </motion.button>

                <motion.button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        showNext()
                    }}
                    whileHover={{ scale: 1.12, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next promotional slide"
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/85 backdrop-blur-md border border-white/50 text-[#6C306E] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer hover:shadow-[0_6px_22px_rgba(108,48,110,0.35)]"
                >
                    <ChevronRightIcon size={18} color="#6C306E" />
                </motion.button>

                {/* Round Small Clickable Slide Indicators (Dots in Glass Capsule) */}
                <div 
                    className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 shadow-md z-20" 
                    role="tablist" 
                    aria-label="Banner slides"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {slides.map((_, index) => {
                        const isActive = activeIndex === index
                        return (
                            <button
                                key={index}
                                type="button"
                                role="tab"
                                aria-label={`Go to slide ${index + 1}`}
                                aria-selected={isActive}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    goToSlide(index)
                                }}
                                className={`transition-all duration-300 cursor-pointer rounded-full ${
                                    isActive
                                        ? 'w-6 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                                        : 'size-2 bg-white/60 hover:bg-white hover:scale-125'
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
