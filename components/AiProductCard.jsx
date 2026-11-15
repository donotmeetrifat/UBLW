'use client'

import React from 'react'
import Link from 'next/link'
import { BagIcon, ShieldCheckIcon } from '@/components/icons'

export default function AiProductCard({ product, onQuickAdd, onCloseChat }) {
    if (!product) return null;

    return (
        <div className="my-2.5 p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs hover:border-[#6C306E]/40 hover:shadow-xs transition-all duration-200 flex items-center justify-between gap-3 text-left select-none group/card">
            <Link
                href={`/product/${product.id}`}
                onClick={onCloseChat}
                className="flex items-center gap-3 min-w-0 flex-1 group cursor-pointer"
            >
                {/* Product Thumbnail */}
                <div className="relative size-13 sm:size-14 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BagIcon size={18} />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-wider truncate">
                            {product.brand || 'UK Brand'}
                        </span>
                        <span className="text-[9px] text-slate-300">•</span>
                        <span className="text-[9px] text-slate-400 font-medium">100% Authentic UK</span>
                    </div>

                    <h4 className="text-xs sm:text-[13px] font-bold text-[#241224] truncate group-hover:text-[#6C306E] transition-colors leading-snug">
                        {product.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs sm:text-[13px] font-black text-[#6C306E]">
                            ৳{product.price}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                                ৳{product.mrp}
                            </span>
                        )}
                        <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                product.inStock
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Quick Action Button */}
            {product.inStock && onQuickAdd && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(product);
                    }}
                    title="Add to Shopping Bag"
                    className="size-8 sm:size-9 rounded-xl bg-[#6C306E]/10 hover:bg-[#6C306E] text-[#6C306E] hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
                >
                    <BagIcon size={15} color="currentColor" />
                </button>
            )}
        </div>
    );
}
