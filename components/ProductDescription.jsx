'use client'

import { CheckIcon, StarIcon, RoyalCrownIcon } from "@/components/icons"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const category = product?.category || 'Beauty'

    const defaultBenefits = [
        "100% Authentic UK Imported Formulation ensuring optimal potency and purity.",
        "Dermatologically tested daily care tailored for sensitive skin.",
        "Delivers visible, clinically-proven nourishment, hydration, and glow.",
        "Sourced straight from certified British and European distributors."
    ]

    return (
        <div className="my-16 text-sm text-slate-600">
            {/* Navigation Tabs with Spring Animated Indicator */}
            <div className="flex items-center gap-2 border-b border-[#EFE0EF] mb-8 pb-2 max-w-2xl relative">
                {['Description', 'Reviews'].map((tab, index) => {
                    const isSelected = selectedTab === tab;
                    return (
                        <button 
                            key={index} 
                            onClick={() => setSelectedTab(tab)}
                            className={`px-5 py-2.5 font-bold text-xs sm:text-sm transition-all duration-200 relative cursor-pointer rounded-xl ${
                                isSelected ? 'text-[#6C306E]' : 'text-slate-400 hover:text-slate-700 hover:bg-[#FAF6FA]/50'
                            }`}
                        >
                            <span className="relative z-10">
                                {tab === 'Reviews' ? `Customer Reviews (${product.rating?.length || 0})` : 'Product Details & Specs'}
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
                                    className="absolute -bottom-2.5 left-0 right-0 h-0.75 bg-gradient-to-r from-[#6C306E] via-[#9956A1] to-[#6C306E] rounded-full shadow-xs"
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
                        className="max-w-3xl space-y-8 text-slate-700"
                    >
                        {/* Section 1: Product Overview */}
                        <div>
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-2.5">
                                Formulation & Profile
                            </h4>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                                {product.description}
                            </p>
                        </div>

                        {/* Section 2: Key Benefits */}
                        <div className="bg-[#FAF6FA] border border-[#EFE0EF] p-6 rounded-3xl">
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-3.5 flex items-center gap-2">
                                <RoyalCrownIcon size={14} color="#6C306E" />
                                Key Proven Benefits
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                                {defaultBenefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                                        <div className="size-5 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0 mt-0.5 shadow-2xs">
                                            <CheckIcon size={12} color="#6C306E" strokeWidth={2.5} />
                                        </div>
                                        <span className="leading-snug">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 3: Why You'll Love It */}
                        <div>
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-2">
                                Why You'll Love It
                            </h4>
                            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                                Directly imported into Bangladesh from official British retail distribution networks, this product complies with strict EU and UK cosmetic safety regulations. Designed for effortless daily use with genuine noticeable benefits.
                            </p>
                        </div>

                        {/* Section 4: Specifications Grid */}
                        <div className="pt-4 border-t border-[#EFE0EF]">
                            <h4 className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-3">
                                Product Attributes
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white p-5 border border-[#EFE0EF] rounded-2xl shadow-2xs">
                                <div>
                                    <span className="text-slate-400 block mb-1">Category</span>
                                    <span className="font-bold text-[#241224]">{category}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Origin</span>
                                    <span className="font-bold text-[#241224]">United Kingdom</span>
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
                        className="flex flex-col gap-4 max-w-3xl"
                    >
                        {product.rating?.map((item, index) => (
                            <div key={index} className="flex gap-4 p-5 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF]">
                                <Image 
                                    src={item.user.image} 
                                    alt={item.user.name} 
                                    className="size-11 rounded-full object-cover shrink-0 border border-[#EFE0EF]" 
                                    width={44} 
                                    height={44} 
                                />
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {Array(5).fill('').map((_, idx) => (
                                            <StarIcon 
                                                key={idx} 
                                                size={14} 
                                                filled={item.rating >= idx + 1}
                                                color="#D8B56D"
                                                emptyColor="#E8DFE9"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed my-2">
                                        "{item.review}"
                                    </p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-[#241224]">{item.user.name}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-400 text-[11px]">{new Date(item.createdAt).toDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDescription;
