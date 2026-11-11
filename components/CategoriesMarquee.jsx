'use client'

import { SparklesIcon } from "@/components/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";

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
        <section aria-label="Product categories navigation" className="w-full max-w-7xl mx-auto mt-6 sm:mt-8 mb-6 sm:mb-8">
            <div 
                className="overflow-hidden w-full relative select-none group/marquee py-2.5 sm:py-3.5"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Edge Fades for Smooth Infinite Illusion */}
                <div className="absolute left-0 top-0 h-full w-10 sm:w-16 z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />
                <div className="absolute right-0 top-0 h-full w-10 sm:w-16 z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />

                {/* Horizontal Navigation Track with Ample Vertical Padding */}
                <div 
                    className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar sm:min-w-[200%] sm:animate-[marqueeScroll_38s_linear_infinite] group-hover/marquee:[animation-play-state:paused] py-2 sm:py-3 px-2"
                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                    {[...categoryNames, ...categoryNames, ...categoryNames].map((catName, index) => {
                        const isActive = activeCategory.toLowerCase() === catName.toLowerCase();

                        return (
                            <motion.button
                                key={index}
                                type="button"
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => handleCategoryClick(catName)}
                                className={`flex items-center gap-1.5 h-[38px] sm:h-[42px] px-4.5 sm:px-5.5 rounded-full border transition-all duration-300 shrink-0 text-xs font-bold tracking-wide whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? 'bg-gradient-to-r from-[#6C306E] to-[#401242] border-[#6C306E] text-white shadow-[0_4px_14px_rgba(108,48,110,0.35)] scale-102'
                                        : 'bg-white border-[#EFE0EF] text-[#3A0C38] hover:bg-[#FAF6FA] hover:border-[#6C306E]/40 hover:shadow-xs'
                                }`}
                            >
                                {isActive && <SparklesIcon size={11} color="#FFFFFF" />}
                                <span>{catName}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const CategoriesMarquee = () => {
    return (
        <Suspense fallback={<div className="h-11 w-full max-w-7xl mx-auto my-6 bg-slate-50 animate-pulse rounded-full" />}>
            <CategoriesMarqueeContent />
        </Suspense>
    );
};

export default CategoriesMarquee;
