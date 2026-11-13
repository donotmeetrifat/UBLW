'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'

const AUTOPLAY_DELAY = 5000

const DEFAULT_SLIDES = [
    { id: 'def-1', image: '/banner/1.png', imageAlt: 'UK Brand Lover curated skincare banner 1', link: '/shop', isActive: true },
    { id: 'def-2', image: '/banner/2.jpg', imageAlt: 'UK Brand Lover luxury skincare banner 2', link: '/shop?category=Skincare', isActive: true },
    { id: 'def-3', image: '/banner/3.jpg', imageAlt: 'UK Brand Lover premium beauty banner 3', link: '/shop?category=Makeup', isActive: true },
    { id: 'def-4', image: '/banner/4.jpg', imageAlt: 'UK Brand Lover authentic cosmetics banner 4', link: '/shop?category=Haircare', isActive: true },
    { id: 'def-5', image: '/banner/5.jpg', imageAlt: 'UK Brand Lover direct UK imports banner 5', link: '/shop', isActive: true },
    { id: 'def-6', image: '/banner/6.jpg', imageAlt: 'UK Brand Lover hair repair treatment banner 6', link: '/shop', isActive: true },
    { id: 'def-7', image: '/banner/7.jpg', imageAlt: 'UK Brand Lover luxury fragrance banner 7', link: '/shop?category=Fragrance', isActive: true },
    { id: 'def-8', image: '/banner/8.jpg', imageAlt: 'UK Brand Lover beauty deals banner 8', link: '/shop', isActive: true }
]

const HeroBannerSlider = () => {
    const router = useRouter()
    const reduxBanners = useSelector(state => state.product.banners)
    const bannerSettings = useSelector(state => state.product.bannerSettings)

    // Storefront Autoplay resolution (true by default unless disabled by admin)
    const [liveAutoplay, setLiveAutoplay] = useState(
        bannerSettings?.autoplay !== undefined ? bannerSettings.autoplay : true
    )

    useEffect(() => {
        if (bannerSettings && typeof bannerSettings.autoplay === 'boolean') {
            setLiveAutoplay(bannerSettings.autoplay)
        }
    }, [bannerSettings])

    // Real-time synchronization when admin toggles autoplay on/off storewide
    useEffect(() => {
        const handleAutoplayChange = (e) => {
            if (typeof e?.detail?.autoplay === 'boolean') {
                setLiveAutoplay(e.detail.autoplay)
            }
        }

        const handleStorage = (e) => {
            if (e.key === 'ukbl_cached_hero_banner_settings') {
                try {
                    const parsed = JSON.parse(e.newValue || '{}')
                    if (typeof parsed?.autoplay === 'boolean') {
                        setLiveAutoplay(parsed.autoplay)
                    }
                } catch {}
            }
        }

        window.addEventListener('hero-banner-autoplay-updated', handleAutoplayChange)
        window.addEventListener('storage', handleStorage)

        let bc
        try {
            bc = new BroadcastChannel('ukbl_catalog_channel')
            bc.onmessage = (msg) => {
                if (msg.data?.type === 'hero-banner-autoplay-updated' && typeof msg.data?.autoplay === 'boolean') {
                    setLiveAutoplay(msg.data.autoplay)
                }
            }
        } catch {}

        return () => {
            window.removeEventListener('hero-banner-autoplay-updated', handleAutoplayChange)
            window.removeEventListener('storage', handleStorage)
            if (bc) bc.close()
        }
    }, [])

    // Compute active slides from Redux / Live database, with default fallback
    const slides = useMemo(() => {
        if (Array.isArray(reduxBanners) && reduxBanners.length > 0) {
            const active = reduxBanners
                .filter(b => b && b.isActive !== false && b.image)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            if (active.length > 0) return active
        }
        return DEFAULT_SLIDES
    }, [reduxBanners])

    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)

    const dragStartX = useRef(0)
    const dragStartY = useRef(0)
    const isPointerDown = useRef(false)
    const currentDragOffset = useRef(0)
    const hasDraggedBeyondThreshold = useRef(false)

    // Ensure activeIndex is within range if slides length changes
    useEffect(() => {
        if (activeIndex >= slides.length) {
            setActiveIndex(Math.max(0, slides.length - 1))
        }
    }, [slides.length, activeIndex])

    const goToSlide = (index) => {
        if (slides.length === 0) return
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
        if (event.button !== undefined && event.button !== 0) return

        isPointerDown.current = true
        dragStartX.current = event.clientX
        dragStartY.current = event.clientY
        currentDragOffset.current = 0
        hasDraggedBeyondThreshold.current = false
        setIsPaused(true)
    }

    const handlePointerMove = (event) => {
        if (!isPointerDown.current) return

        const diffX = event.clientX - dragStartX.current
        const diffY = event.clientY - dragStartY.current

        // If movement is predominantly vertical scroll, do not hijack
        if (Math.abs(diffY) > Math.abs(diffX) && !isDragging) {
            return
        }

        let diff = diffX

        // Add rubber-band resistance at boundary edges
        if (activeIndex === 0 && diff > 0) {
            diff = diff * 0.3
        } else if (activeIndex === slides.length - 1 && diff < 0) {
            diff = diff * 0.3
        }

        if (Math.abs(diff) > 5) {
            setIsDragging(true)
            hasDraggedBeyondThreshold.current = true
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

    // Handle slide click to navigate to target URL configured by Admin
    const handleSlideClick = (slide) => {
        if (hasDraggedBeyondThreshold.current || isDragging || Math.abs(currentDragOffset.current) > 5) {
            return
        }

        const url = (slide.link || '').trim()
        if (!url) return

        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.open(url, '_blank', 'noopener,noreferrer')
        } else {
            router.push(url)
        }
    }

    useEffect(() => {
        if (!liveAutoplay || isPaused || isDragging || slides.length <= 1) return

        const delay = bannerSettings?.delay || AUTOPLAY_DELAY
        const timer = setInterval(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
        }, delay)

        return () => clearInterval(timer)
    }, [liveAutoplay, isPaused, isDragging, activeIndex, slides.length, bannerSettings?.delay])

    if (!slides || slides.length === 0) return null

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
                        const hasLink = Boolean(slide.link && slide.link.trim())

                        return (
                            <article
                                key={slide.id || index}
                                onClick={() => handleSlideClick(slide)}
                                className={`relative min-w-full w-full overflow-hidden flex items-center justify-center bg-[#FAF6FA] shrink-0 ${
                                    hasLink && !isDragging ? 'cursor-pointer' : ''
                                }`}
                                aria-hidden={!isActive}
                                title={hasLink ? `Click to visit: ${slide.link}` : (slide.title || 'UK Brand Lover')}
                            >
                                <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[26/9] min-h-[160px] max-h-[520px]">
                                    <Image
                                        src={slide.image}
                                        alt={slide.imageAlt || slide.title || 'UK Brand Lover promotional banner'}
                                        fill
                                        draggable={false}
                                        className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out pointer-events-none select-none ${
                                            isActive ? 'scale-[1.02]' : 'scale-100'
                                        }`}
                                        priority={index === 0}
                                        quality={92}
                                        unoptimized
                                    />
                                </div>
                            </article>
                        )
                    })}
                </div>

                {/* Glassmorphic Navigation Buttons (Appear smoothly on hover) */}
                {slides.length > 1 && (
                    <>
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
                    </>
                )}

                {/* Round Small Clickable Slide Indicators (Dots in Glass Capsule) */}
                {slides.length > 1 && (
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
                )}
            </div>
        </section>
    )
}

export default HeroBannerSlider
