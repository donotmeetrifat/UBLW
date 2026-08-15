'use client'

import banner1 from '../assets/banner/1.png'
import banner2 from '../assets/banner/2.jpg'
import banner3 from '../assets/banner/3.jpg'
import banner4 from '../assets/banner/4.jpg'
import banner5 from '../assets/banner/5.jpg'
import banner6 from '../assets/banner/6.jpg'
import banner7 from '../assets/banner/7.jpg'
import banner8 from '../assets/banner/8.jpg'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const AUTOPLAY_DELAY = 4500

const slides = [
    { image: banner1, imageAlt: 'UK Brand Lover skincare banner 1' },
    { image: banner2, imageAlt: 'UK Brand Lover skincare banner 2' },
    { image: banner3, imageAlt: 'UK Brand Lover skincare banner 3' },
    { image: banner4, imageAlt: 'UK Brand Lover skincare banner 4' },
    { image: banner5, imageAlt: 'UK Brand Lover skincare banner 5' },
    { image: banner6, imageAlt: 'UK Brand Lover skincare banner 6' },
    { image: banner7, imageAlt: 'UK Brand Lover skincare banner 7' },
    { image: banner8, imageAlt: 'UK Brand Lover skincare banner 8' }
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
        const minimumSwipeDistance = 50

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
    }, [isPaused])

    return (
        <section aria-label="Featured UK Brand Lover promotions">
            <div
                className="relative max-w-7xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-2xs"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-700 ease-out"
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
                                priority={index === 0}
                                sizes="(max-width: 768px) 100vw, 1280px"
                                className="w-full h-auto block object-contain rounded-2xl sm:rounded-3xl"
                            />
                        </article>
                    ))}
                </div>

                <button
                    type="button"
                    aria-label="Show previous banner slide"
                    onClick={showPrevious}
                    className="absolute left-2 sm:left-4 top-1/2 z-20 flex size-7 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur text-[#3A0C38] border border-[#EFE0EF] shadow-md transition hover:bg-[#6C306E] hover:text-white"
                >
                    <ChevronLeft className="size-4 sm:size-5" />
                </button>

                <button
                    type="button"
                    aria-label="Show next banner slide"
                    onClick={showNext}
                    className="absolute right-2 sm:right-4 top-1/2 z-20 flex size-7 sm:size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur text-[#3A0C38] border border-[#EFE0EF] shadow-md transition hover:bg-[#6C306E] hover:text-white"
                >
                    <ChevronRight className="size-4 sm:size-5" />
                </button>

                <div className="absolute bottom-2 sm:bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5" role="tablist" aria-label="Banner slides">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.imageAlt || index}
                            type="button"
                            role="tab"
                            aria-label={`Show banner image ${index + 1}`}
                            aria-selected={activeIndex === index}
                            onClick={() => goToSlide(index)}
                            className={`h-1.5 sm:h-2 rounded-full transition-all ${activeIndex === index ? 'w-5 sm:w-7 bg-[#6C306E]' : 'w-1.5 sm:w-2 bg-[#C599CB]/70 hover:bg-[#6C306E]/60'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroBannerSlider
