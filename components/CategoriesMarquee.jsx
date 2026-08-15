'use client'

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

const categoryNames = [
    "Skincare",
    "Makeup",
    "Haircare",
    "Fragrance",
    "Body Care",
    "Beauty Tools",
    "Accessories",
    "Lifestyle",
    "New Arrivals",
    "Best Sellers",
    "Premium Picks",
    "Sale",
];

const CategoriesMarqueeContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams?.get('category') || '';
    const [isPaused, setIsPaused] = useState(false);

    const handleCategoryClick = (catName) => {
        router.push(`/shop?category=${encodeURIComponent(catName)}`);
    };

    return (
        <section aria-label="Product categories navigation" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-12 sm:mb-14">
            <div 
                className="overflow-hidden w-full relative select-none group/marquee py-1"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Edge Fades */}
                <div className="absolute left-0 top-0 h-full w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent opacity-90" />
                <div className="absolute right-0 top-0 h-full w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent opacity-90" />

                {/* Horizontal Navigation Track with permanent CSS animation & true animationPlayState pause/resume */}
                <div 
                    className="flex items-center gap-3 sm:gap-3.5 overflow-x-auto no-scrollbar sm:min-w-[200%] sm:animate-[marqueeScroll_35s_linear_infinite] group-hover/marquee:[animation-play-state:paused]"
                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                    {[...categoryNames, ...categoryNames, ...categoryNames].map((catName, index) => {
                        const isActive = activeCategory.toLowerCase() === catName.toLowerCase();

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleCategoryClick(catName)}
                                className={`flex items-center justify-center h-[38px] sm:h-[44px] px-4 sm:px-5 rounded-xl border transition-all duration-200 shrink-0 text-xs sm:text-xs font-medium tracking-tight whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? 'bg-[#FAF6FA] border-[#6C306E] text-[#6C306E] font-semibold'
                                        : 'bg-white border-[#F0E6F1] text-[#4A304A] hover:bg-[#FAF6FA]/80 hover:border-[#6C306E]/30 hover:text-[#6C306E]'
                                }`}
                            >
                                {catName}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const CategoriesMarquee = () => {
    return (
        <Suspense fallback={<div className="h-11 w-full max-w-7xl mx-auto my-6 bg-slate-50 animate-pulse rounded-xl" />}>
            <CategoriesMarqueeContent />
        </Suspense>
    );
};

export default CategoriesMarquee;