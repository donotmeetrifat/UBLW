'use client'

import { SparklesIcon } from "@/components/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const DEFAULT_CATEGORIES = [];

const CategoriesMarqueeContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams?.get('category') || '';
    const [isPaused, setIsPaused] = useState(false);
    const reduxCategories = useSelector(state => state.product?.categories);
    const [categories, setCategories] = useState(() => {
        if (Array.isArray(reduxCategories) && reduxCategories.length > 0) return reduxCategories;
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_categories') || '[]');
                if (Array.isArray(cached) && cached.length > 0) return cached;
            } catch {}
        }
        return DEFAULT_CATEGORIES;
    });

    const loadLiveCategories = () => {
        fetch('/api/categories?_t=' + Date.now(), { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.categories)) {
                    const activeNames = data.categories
                        .filter(c => c.isActive !== false)
                        .map(c => c.name);
                    setCategories(activeNames);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_cached_categories', JSON.stringify(activeNames));
                    }
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        loadLiveCategories();
    }, []);

    useEffect(() => {
        if (Array.isArray(reduxCategories) && reduxCategories.length > 0) {
            setCategories(reduxCategories);
        }
    }, [reduxCategories]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('category-catalog-updated', loadLiveCategories);
            const onStorage = (e) => {
                if (e.key === 'ukbl_categories_synced') loadLiveCategories();
            };
            window.addEventListener('storage', onStorage);

            let bc;
            try {
                bc = new BroadcastChannel('ukbl_catalog_channel');
                bc.onmessage = (msg) => {
                    if (msg.data?.type === 'category-updated') {
                        loadLiveCategories();
                    }
                };
            } catch {}

            return () => {
                window.removeEventListener('category-catalog-updated', loadLiveCategories);
                window.removeEventListener('storage', onStorage);
                if (bc) bc.close();
            };
        }
    }, []);

    const handleCategoryClick = (catName) => {
        router.push(`/shop?category=${encodeURIComponent(catName)}`);
    };

    // Construct perfectly balanced, seamless double-half infinite loop
    const marqueeItems = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        let base = [...categories];
        while (base.length < 10) {
            base = [...base, ...categories];
        }
        return [...base, ...base];
    }, [categories]);

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section aria-label="Product categories navigation" className="w-full max-w-7xl mx-auto mt-4 sm:mt-8 mb-4 sm:mb-8">
            <div 
                className="overflow-hidden w-full relative select-none group/marquee py-2 sm:py-3 touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Edge Fades for Smooth Infinite Illusion */}
                <div className="absolute left-0 top-0 h-full w-8 sm:w-16 z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />
                <div className="absolute right-0 top-0 h-full w-8 sm:w-16 z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />

                {/* Horizontal Navigation Track - Infinite Right-to-Left Marquee on All Devices (Mobile & Desktop) */}
                <div 
                    className="flex items-center gap-2.5 sm:gap-3 w-max min-w-[200%] animate-[marqueeScroll_38s_linear_infinite] group-hover/marquee:[animation-play-state:paused] py-1.5 sm:py-2 px-2 will-change-transform"
                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                    {marqueeItems.map((catName, index) => {
                        const isActive = activeCategory.toLowerCase() === catName.toLowerCase();

                        return (
                            <motion.button
                                key={`${catName}-${index}`}
                                type="button"
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => handleCategoryClick(catName)}
                                className={`flex items-center gap-1.5 h-8 sm:h-[38px] px-3.5 sm:px-5 rounded-full border transition-all duration-300 shrink-0 text-[11px] sm:text-xs font-bold tracking-wide whitespace-nowrap cursor-pointer shadow-2xs ${
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
