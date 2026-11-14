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
    const [localBanners, setLocalBanners] = useState(null)

    // Storefront Autoplay resolution (true by default unless disabled by admin)
    const [liveAutoplay, setLiveAutoplay] = useState(
        bannerSettings?.autoplay !== undefined ? bannerSettings.autoplay : true
    )

    useEffect(() => {
        if (bannerSettings && typeof bannerSettings.autoplay === 'boolean') {
            setLiveAutoplay(bannerSettings.autoplay)
        }
    }, [bannerSettings])

    // Instant local hydration & real-time synchronization across all devices and browsers
    useEffect(() => {
        // 1. Instant 0ms hydration from cache
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('ukbl_cached_hero_banners')
                if (cached) {
                    const parsed = JSON.parse(cached)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setLocalBanners(parsed)
                    }
                }
            } catch {}
        }

        // 2. Fetch fresh live banners from database
        const fetchFreshBanners = async () => {
            try {
                const res = await fetch(`/api/banners?_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
                    setLocalBanners(data.banners)
                    try {
                        localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(data.banners))
                    } catch {}
                }
            } catch (err) {}
        }

        fetchFreshBanners()

        // 3. Multi-channel real-time synchronization when admin updates banners or toggles autoplay
        const handleAutoplayChange = (e) => {
            if (typeof e?.detail?.autoplay === 'boolean') {
                setLiveAutoplay(e.detail.autoplay)
            }
        }

        const handleBannersUpdated = (e) => {
            if (Array.isArray(e?.detail?.banners) && e.detail.banners.length > 0) {
                setLocalBanners(e.detail.banners)
            } else {
                fetchFreshBanners()
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
            if (e.key === 'ukbl_banners_synced' || e.key === 'ukbl_cached_hero_banners') {
                try {
                    const parsed = JSON.parse(e.newValue || '[]')
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setLocalBanners(parsed)
                    } else {
                        fetchFreshBanners()
                    }
                } catch {
                    fetchFreshBanners()
                }
            }
        }

        window.addEventListener('hero-banner-autoplay-updated', handleAutoplayChange)
        window.addEventListener('hero-banners-updated', handleBannersUpdated)
        window.addEventListener('storage', handleStorage)

        let bc
        try {
            bc = new BroadcastChannel('ukbl_catalog_channel')
            bc.onmessage = (msg) => {
                if (msg.data?.type === 'hero-banner-autoplay-updated' && typeof msg.data?.autoplay === 'boolean') {
                    setLiveAutoplay(msg.data.autoplay)
                }
                if (msg.data?.type === 'hero-banners-updated') {
                    if (Array.isArray(msg.data?.banners) && msg.data.banners.length > 0) {
                        setLocalBanners(msg.data.banners)
                    } else {
                        fetchFreshBanners()
                    }
                }
            }
        } catch {}

        return () => {
            window.removeEventListener('hero-banner-autoplay-updated', handleAutoplayChange)
            window.removeEventListener('hero-banners-updated', handleBannersUpdated)
            window.removeEventListener('storage', handleStorage)
            if (bc) bc.close()
        }
    }, [])

    // Compute active slides from Redux / Live database, with default fallback
    const slides = useMemo(() => {
        const source = (Array.isArray(reduxBanners) && reduxBanners.length > 0)
            ? reduxBanners
            : (Array.isArray(localBanners) && localBanners.length > 0)
                ? localBanners
                : null

        if (source) {
            const active = source
                .filter(b => b && b.isActive !== false && b.image)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            if (active.length > 0) return active
        }
        return DEFAULT_SLIDES
    }, [reduxBanners, localBanners])

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

        if (Math.abs(diff) > 15) {
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

        // Reset drag threshold shortly after click handling
        setTimeout(() => {
            hasDraggedBeyondThreshold.current = false
        }, 120)
    }

    const handlePointerCancel = () => {
        if (!isPointerDown.current) return
        isPointerDown.current = false
        setIsDragging(false)
        setDragOffset(0)
        currentDragOffset.current = 0
        hasDraggedBeyondThreshold.current = false
        setIsPaused(false)
    }

    // Format target redirection URL (supports internal /shop, external https://..., and clean www....)
    const formatRedirectUrl = (raw) => {
        if (!raw) return ''
        let trimmed = String(raw).trim()
        if (!trimmed) return ''
        if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
        if (trimmed.includes('.')) return `https://${trimmed}`
        return trimmed
    }

    // Handle slide click to navigate to target URL configured by Admin
    const handleSlideClick = (slide) => {
        if (hasDraggedBeyondThreshold.current || isDragging || Math.abs(currentDragOffset.current) > 10) {
            return
        }

        const url = formatRedirectUrl(slide.link)
        if (!url) return

        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.location.assign(url)
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

                                    {/* Campaign Title & Subtitle Overlay */}
                                    {(slide.title || slide.subtitle) && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-5 sm:p-8 md:p-12 z-10 pointer-events-none">
                                            <div className="max-w-xl text-white space-y-1 sm:space-y-2">
                                                {slide.title && (
                                                    <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
                                                        {slide.title}
                                                    </h2>
                                                )}
                                                {slide.subtitle && (
                                                    <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium line-clamp-2 drop-shadow-sm">
                                                        {slide.subtitle}
                                                    </p>
                                                )}
                                                {hasLink && (
                                                    <div className="pt-1.5 sm:pt-2.5">
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 shadow-sm">
                                                            <span>Explore Collection</span>
                                                            <ChevronRightIcon size={12} color="#FFFFFF" />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
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
