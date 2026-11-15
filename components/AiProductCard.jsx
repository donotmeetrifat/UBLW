'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BagIcon, CheckIcon, ShieldCheckIcon } from '@/components/icons'
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth'

export default function AiProductCard({ product, onQuickAdd, onCloseChat }) {
    const [isAdded, setIsAdded] = useState(false)

    if (!product) return null

    const handleAdd = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!product.inStock) return

        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add authentic UK products to your shopping bag.')
            return
        }

        onQuickAdd?.(product)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1800)
    }

    const hasDiscount = product.mrp && Number(product.mrp) > Number(product.price)
    const savings = hasDiscount ? Math.round(Number(product.mrp) - Number(product.price)) : 0

    return (
        <div className="my-3 rounded-2xl bg-gradient-to-br from-white via-[#FAF6FA]/40 to-white border border-[#EFE0EF] hover:border-[#6C306E]/40 shadow-[0_4px_16px_rgba(108,48,110,0.06)] hover:shadow-[0_8px_24px_rgba(108,48,110,0.12)] transition-all duration-300 p-3 sm:p-3.5 select-none group/card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Product Left: Thumbnail + Info */}
                <Link
                    href={`/product/${product.id}`}
                    onClick={onCloseChat}
                    className="flex items-center gap-3 min-w-0 flex-1 group cursor-pointer"
                >
                    {/* Thumbnail Box */}
                    <div className="relative size-16 sm:size-18 rounded-xl bg-white border border-[#EFE0EF] p-1.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs group-hover/card:scale-105 transition-transform duration-300">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <BagIcon size={22} color="#D1D5DB" />
                            </div>
                        )}
                        <span className="absolute top-1 left-1 px-1 py-0.2 rounded-md bg-[#6C306E] text-white text-[7.5px] font-bold tracking-tight">
                            UK
                        </span>
                    </div>

                    {/* Metadata & Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-wider truncate">
                                {product.brand || 'UK Brand'}
                            </span>
                            <span className="text-[9px] text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-150">
                                <ShieldCheckIcon size={10} color="#059669" />
                                100% Authentic UK
                            </span>
                        </div>

                        <h4 className="text-xs sm:text-[13.5px] font-bold text-[#241224] group-hover:text-[#6C306E] transition-colors leading-snug line-clamp-2">
                            {product.name}
                        </h4>

                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            <span className="text-sm sm:text-[15px] font-black text-[#6C306E]">
                                ৳{Number(product.price).toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-[11px] text-slate-400 line-through">
                                        ৳{Number(product.mrp).toLocaleString()}
                                    </span>
                                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                                        Save ৳{savings}
                                    </span>
                                </>
                            )}
                            <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    product.inStock
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                            >
                                {product.inStock ? '● In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Right Action: Add to Bag Button */}
                {product.inStock && onQuickAdd && (
                    <div className="flex sm:flex-col items-center justify-end gap-1.5 sm:self-center shrink-0 border-t sm:border-t-0 border-[#EFE0EF]/60 pt-2 sm:pt-0">
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={handleAdd}
                            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                                isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#6C306E] hover:bg-[#562258] text-white hover:shadow-xs'
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
                                        <CheckIcon size={14} color="white" />
                                        <span>Added!</span>
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
                        <Link
                            href={`/product/${product.id}`}
                            onClick={onCloseChat}
                            className="hidden sm:inline-block text-[10.5px] font-semibold text-slate-400 hover:text-[#6C306E] transition-colors"
                        >
                            View details →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
