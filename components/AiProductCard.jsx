'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BagIcon, CheckIcon } from '@/components/icons'
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth'

export default function AiProductCard({ product, onQuickAdd, onCloseChat }) {
    const [isAdded, setIsAdded] = useState(false)

    if (!product) return null

    const handleAdd = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!product.inStock) return

        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add products to your shopping bag.')
            return
        }

        onQuickAdd?.(product)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1600)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="my-2.5 rounded-2xl bg-white border border-[#EFE0EF] hover:border-[#6C306E]/30 shadow-2xs hover:shadow-xs transition-all duration-200 p-2.5 sm:p-3 select-none group/card"
        >
            <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* Left: Product Thumbnail + Title & Price */}
                <Link
                    href={`/product/${product.id}`}
                    onClick={onCloseChat}
                    className="flex items-center gap-3 min-w-0 flex-1 group/link cursor-pointer"
                >
                    {/* Clean Image Thumbnail */}
                    <div className="size-14 sm:size-15 rounded-xl bg-[#FAF6FA]/80 border border-[#EFE0EF]/80 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover/link:scale-105 transition-transform duration-200"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <BagIcon size={18} color="#D1D5DB" />
                            </div>
                        )}
                    </div>

                    {/* Clean Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                        {product.brand && (
                            <span className="text-[10.5px] font-semibold text-[#6C306E] uppercase tracking-wider block truncate">
                                {product.brand}
                            </span>
                        )}
                        <h4 className="text-xs sm:text-[13px] font-bold text-[#241224] group-hover/link:text-[#6C306E] transition-colors leading-snug truncate">
                            {product.name}
                        </h4>
                        <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-xs sm:text-[13.5px] font-bold text-[#241224]">
                                ৳{Number(product.price).toLocaleString()}
                            </span>
                            {product.mrp && Number(product.mrp) > Number(product.price) && (
                                <span className="text-[11px] text-slate-400 line-through">
                                    ৳{Number(product.mrp).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Right: Sleek Add to Bag Button */}
                {product.inStock && onQuickAdd && (
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={handleAdd}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs ${
                            isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#6C306E] hover:bg-[#562258] text-white'
                        }`}
                    >
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.span
                                    key="added"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="flex items-center gap-1"
                                >
                                    <CheckIcon size={13} color="white" />
                                    <span>Added</span>
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="add"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <BagIcon size={13} color="white" />
                                    <span>Add to Bag</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                )}
            </div>
        </motion.div>
    )
}
