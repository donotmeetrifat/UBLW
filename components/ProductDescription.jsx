'use client'

import { CheckIcon, StarIcon, RoyalCrownIcon, ReviewBadgeIcon, VideoIcon, CameraIcon, CloseIcon } from "@/components/icons"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')
    const [reviews, setReviews] = useState(product?.ratings || product?.rating || [])
    const [activeMedia, setActiveMedia] = useState(null)

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const category = product?.category || 'Beauty'

    // Real-time synchronization when any review is published across the website
    useEffect(() => {
        setReviews(product?.ratings || product?.rating || [])

        const handleReviewPublished = async (event) => {
            if (!product?.id) return
            // If the review is for this product, refresh reviews instantly
            if (!event?.detail?.productId || event.detail.productId === product.id) {
                try {
                    const res = await fetch(`/api/reviews?productId=${product.id}`)
                    const data = await res.json()
                    if (data.success && Array.isArray(data.ratings)) {
                        setReviews(data.ratings)
                    }
                } catch (e) {
                    console.error('Failed to sync live reviews:', e)
                }
            }
        }

        window.addEventListener('review-published', handleReviewPublished)
        return () => window.removeEventListener('review-published', handleReviewPublished)
    }, [product])

    const defaultBenefits = [
        "100% Authentic UK Imported Formulation ensuring optimal potency and purity.",
        "Dermatologically tested daily care tailored for sensitive skin.",
        "Delivers visible, clinically-proven nourishment, hydration, and glow.",
        "Direct London shipments with verified batch codes and authentic UK store packaging."
    ]

    const resolvedBenefits = (() => {
        let raw = product?.benefits;
        if (!raw) return defaultBenefits;

        if (typeof raw === 'string') {
            try {
                raw = JSON.parse(raw);
            } catch (e) {
                if (raw.startsWith('{') && raw.endsWith('}')) {
                    raw = raw.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim());
                } else if (raw.includes('\n')) {
                    raw = raw.split('\n').map(s => s.trim());
                } else if (raw.includes('•') || raw.includes('-')) {
                    raw = raw.split(/[•\-]/).map(s => s.trim());
                } else {
                    raw = [raw.trim()];
                }
            }
        }
        if (Array.isArray(raw)) {
            const list = raw
                .map(b => {
                    if (typeof b === 'string') return b.trim();
                    if (b && typeof b === 'object' && b.text) return String(b.text).trim();
                    return String(b || '').trim();
                })
                .filter(Boolean);
            if (list.length > 0) return list;
        }
        return defaultBenefits;
    })();

    const resolvedWhyYouLoveIt = (() => {
        const customWhy = product?.whyYouWillLoveIt;
        if (customWhy && String(customWhy).trim().length > 0) {
            return String(customWhy).trim();
        }
        return "Sourced with direct traceability from authorized UK brands and laboratories. Formulated to provide lasting radiance, barrier protection, and hydration without clogging pores or causing irritation.";
    })();

    const resolvedFormulaProfile = (() => {
        const customFormula = product?.formulaProfile;
        if (customFormula && String(customFormula).trim().length > 0) {
            return String(customFormula).trim();
        }
        return (product?.description || '').trim();
    })();

    return (
        <div className="mt-16 sm:mt-20 mb-16 sm:mb-20 pt-10 sm:pt-14 border-t border-[#EFE0EF] text-sm text-slate-600">
            {/* Navigation Tabs with Spring Animated Indicator */}
            <div className="flex items-center gap-3 border-b border-[#EFE0EF] mb-10 pb-3 max-w-2xl relative">
                {['Description', 'Reviews'].map((tab, index) => {
                    const isSelected = selectedTab === tab;
                    return (
                        <button 
                            key={index} 
                            onClick={() => setSelectedTab(tab)}
                            className={`px-6 py-2.5 font-bold text-xs sm:text-sm transition-all duration-200 relative cursor-pointer rounded-xl ${
                                isSelected ? 'text-[#6C306E]' : 'text-slate-400 hover:text-slate-700 hover:bg-[#FAF6FA]/50'
                            }`}
                        >
                            <span className="relative z-10">
                                {tab === 'Reviews' ? `Customer Reviews (${reviews.length})` : 'Product Details & Specs'}
                            </span>
                            {isSelected && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    className="absolute inset-0 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl shadow-2xs z-0"
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                />
                            )}
                            {isSelected && (
                                <motion.div
                                    layoutId="activeTabLine"
                                    className="absolute -bottom-3.5 left-0 right-0 h-0.75 bg-gradient-to-r from-[#6C306E] via-[#9956A1] to-[#6C306E] rounded-full shadow-xs"
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Description Tab Content */}
            <AnimatePresence mode="wait">
                {selectedTab === "Description" ? (
                    <motion.div
                        key="desc"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-3xl space-y-10 sm:space-y-12 text-slate-700"
                    >
                        {/* Section 1: Product Overview */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest">
                                Formulation & Profile
                            </h4>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
                                {resolvedFormulaProfile}
                            </p>
                        </div>

                        {/* Section 2: Key Benefits */}
                        <div className="bg-[#FAF6FA]/90 border border-[#EFE0EF] p-7 sm:p-9 rounded-[28px] shadow-2xs">
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-5 flex items-center gap-2">
                                <RoyalCrownIcon size={15} color="#6C306E" />
                                Key Proven Benefits
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs sm:text-sm">
                                {resolvedBenefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                                        <div className="size-5 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0 mt-0.5 shadow-2xs">
                                            <CheckIcon size={12} color="#6C306E" strokeWidth={2.5} />
                                        </div>
                                        <span className="leading-relaxed">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 3: Why You'll Love It */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest">
                                Why You'll Love It
                            </h4>
                            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                                {resolvedWhyYouLoveIt}
                            </p>
                        </div>

                        {/* Section 4: Specifications Grid */}
                        <div className="border border-[#EFE0EF] bg-white rounded-2xl p-6 shadow-2xs">
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-4">
                                Product Specifications
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-1">Brand Origin</span>
                                    <span className="font-bold text-[#241224]">{product.brand || 'United Kingdom'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Category</span>
                                    <span className="font-bold text-[#241224]">{category}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Price</span>
                                    <span className="font-bold text-[#3A0C38]">{currency}{product.price.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Authenticity</span>
                                    <span className="font-bold text-emerald-700">100% Certified</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-5 max-w-3xl"
                    >
                        {reviews.length > 0 ? (
                            reviews.map((item, index) => {
                                const userName = item.user?.name || 'Verified Buyer';
                                const userImage = item.user?.image || null;
                                const reviewImages = Array.isArray(item.images) ? item.images : [];
                                const reviewVideos = Array.isArray(item.videos) ? item.videos : [];

                                return (
                                    <div key={index} className="p-6 rounded-3xl bg-[#FAF6FA]/80 border border-[#EFE0EF] shadow-2xs space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {userImage ? (
                                                    <Image 
                                                        src={userImage} 
                                                        alt={userName} 
                                                        className="size-11 rounded-full object-cover shrink-0 border border-[#EFE0EF]" 
                                                        width={44} 
                                                        height={44} 
                                                    />
                                                ) : (
                                                    <div className="size-11 rounded-full bg-gradient-to-br from-[#6C306E] to-[#401242] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                                                        {userName[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="font-bold text-[#241224] text-sm">{userName}</h5>
                                                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            Verified Buyer
                                                        </span>
                                                    </div>
                                                    <span className="text-slate-400 text-[11px]">
                                                        {new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 2D Gold Star Rating */}
                                            <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-white border border-[#EFE0EF]">
                                                {Array(5).fill('').map((_, idx) => (
                                                    <StarIcon 
                                                        key={idx} 
                                                        size={13} 
                                                        filled={item.rating >= idx + 1}
                                                        color="#D8B56D"
                                                        emptyColor="#E8DFE9"
                                                    />
                                                ))}
                                                <span className="ml-1 text-[11px] font-black text-[#D8B56D]">{Number(item.rating).toFixed(1)}</span>
                                            </div>
                                        </div>

                                        {/* Review Text */}
                                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                                            "{item.review}"
                                        </p>

                                        {/* Review Photos & Videos Grid */}
                                        {(reviewImages.length > 0 || reviewVideos.length > 0) && (
                                            <div className="flex flex-wrap gap-2.5 pt-1">
                                                {reviewImages.map((imgUrl, imgIdx) => (
                                                    <button
                                                        key={`img-${imgIdx}`}
                                                        type="button"
                                                        onClick={() => setActiveMedia({ type: 'image', url: imgUrl })}
                                                        className="size-16 sm:size-20 rounded-2xl overflow-hidden border border-[#EFE0EF] hover:border-[#6C306E] transition cursor-pointer relative group/media bg-white"
                                                    >
                                                        <Image
                                                            src={imgUrl}
                                                            alt={`Review photo ${imgIdx + 1}`}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                                        />
                                                    </button>
                                                ))}

                                                {reviewVideos.map((vidUrl, vidIdx) => (
                                                    <button
                                                        key={`vid-${vidIdx}`}
                                                        type="button"
                                                        onClick={() => setActiveMedia({ type: 'video', url: vidUrl })}
                                                        className="size-16 sm:size-20 rounded-2xl overflow-hidden border border-[#6C306E] transition cursor-pointer relative group/media bg-black flex items-center justify-center"
                                                    >
                                                        <video
                                                            src={vidUrl}
                                                            className="w-full h-full object-cover opacity-80"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/media:bg-black/20 transition-colors">
                                                            <div className="size-6 rounded-full bg-white/90 flex items-center justify-center text-[#6C306E] shadow-sm">
                                                                <VideoIcon size={12} color="#6C306E" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 rounded-3xl bg-[#FAF6FA] border border-[#EFE0EF] text-center max-w-lg mx-auto">
                                <div className="size-14 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-3 shadow-2xs">
                                    <ReviewBadgeIcon size={24} color="#6C306E" />
                                </div>
                                <h4 className="font-extrabold text-[#241224] text-base">No Customer Reviews Yet</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    Be the first verified customer to share your experience with this authentic UK imported product!
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Media Lightbox Modal */}
            <AnimatePresence>
                {activeMedia && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md transition-all duration-300"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-3 border border-[#EFE0EF] shadow-2xl max-w-2xl w-full overflow-hidden relative cursor-default"
                        >
                            <button
                                type="button"
                                onClick={() => setActiveMedia(null)}
                                className="absolute top-5 right-5 z-20 size-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                                aria-label="Close preview"
                            >
                                <CloseIcon size={14} color="#FFFFFF" />
                            </button>
                            {activeMedia.type === 'video' ? (
                                <video
                                    src={activeMedia.url}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[75vh] rounded-2xl bg-black object-contain"
                                />
                            ) : (
                                <Image
                                    src={activeMedia.url}
                                    alt="Enlarged review photo"
                                    width={800}
                                    height={800}
                                    className="w-full max-h-[75vh] object-contain rounded-2xl"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => setActiveMedia(null)}
                                className="mt-3 w-full py-2.5 rounded-full bg-[#FAF6FA] hover:bg-[#EFE0EF] text-xs font-bold text-[#6C306E] transition cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDescription;
