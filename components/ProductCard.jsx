'use client'

import { addToCart } from '@/lib/features/cart/cartSlice'
import { BagIcon, CheckIcon, StarIcon } from '@/components/icons'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

const ProductCard = ({ product }) => {
    const dispatch = useDispatch()
    const imageRef = useRef(null)
    const [isAdded, setIsAdded] = useState(false)
    const [isPressed, setIsPressed] = useState(false)

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    // Calculate average rating safely
    const ratingList = product?.rating || []
    const ratingCount = ratingList.length
    const avgRating = ratingCount > 0
        ? (ratingList.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratingCount)
        : 5.0

    const discountPercentage = product?.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0

    const isOutOfStock = product.inStock === false

    const badgeText = isOutOfStock
        ? 'Sold Out'
        : discountPercentage > 0
            ? `${discountPercentage}% OFF`
            : product?.category || 'UK Import'

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()

        // 1. Button Press Feedback
        setIsPressed(true)
        setTimeout(() => setIsPressed(false), 150)

        try {
            // 2. Dispatch Redux Action
            dispatch(addToCart({ productId: product.id }))

            // 3. Trigger Brief Checkmark Success State on Button
            setIsAdded(true)
            setTimeout(() => setIsAdded(false), 1400)

            // 4. Accessibility: Check prefers-reduced-motion
            const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (prefersReducedMotion) {
                window.dispatchEvent(new CustomEvent('cart-bump'))
                return
            }

            // 5. Luxurious Pure Product Image Flight Animation (1.4s)
            const navCartIcon = document.getElementById('navbar-cart-icon') || document.getElementById('navbar-cart-icon-mobile')
            if (imageRef.current && navCartIcon) {
                const imgRect = imageRef.current.getBoundingClientRect()
                const cartRect = navCartIcon.getBoundingClientRect()

                // Calculate exact starting and target coordinates
                const startX = imgRect.left
                const startY = imgRect.top
                const startWidth = imgRect.width
                const startHeight = imgRect.height

                const targetX = cartRect.left + cartRect.width / 2 - startWidth / 2
                const targetY = cartRect.top + cartRect.height / 2 - startHeight / 2

                const deltaX = targetX - startX
                const deltaY = targetY - startY

                // Calculate graceful curved trajectory arc lift
                const arcLift = -Math.min(Math.max(Math.abs(deltaY) * 0.35, 50), 140)
                const arcSide = deltaX > 0 ? 25 : -25

                // Create Pure Product Image Clone
                const flyImg = document.createElement('img')
                flyImg.src = product.images[0]?.src || product.images[0]
                flyImg.alt = product.name
                flyImg.style.position = 'fixed'
                flyImg.style.left = `${startX}px`
                flyImg.style.top = `${startY}px`
                flyImg.style.width = `${startWidth}px`
                flyImg.style.height = `${startHeight}px`
                flyImg.style.objectFit = 'contain'
                flyImg.style.zIndex = '9999'
                flyImg.style.pointerEvents = 'none'
                flyImg.style.backgroundColor = 'transparent'
                flyImg.style.borderRadius = '12px'
                flyImg.style.boxShadow = 'none'
                flyImg.style.border = 'none'
                flyImg.style.willChange = 'transform, opacity'

                document.body.appendChild(flyImg)

                // Trigger Cart Bump Feedback
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('cart-bump'))
                }, 1300)

                // Smooth luxury flight keyframes
                const animation = flyImg.animate([
                    {
                        transform: 'translate(0px, 0px) scale(1)',
                        opacity: 1,
                        filter: 'drop-shadow(0 6px 16px rgba(108, 48, 110, 0.2))'
                    },
                    {
                        transform: `translate(${deltaX * 0.45 + arcSide}px, ${deltaY * 0.35 + arcLift}px) scale(0.7)`,
                        opacity: 0.95,
                        filter: 'drop-shadow(0 10px 24px rgba(108, 48, 110, 0.28))',
                        offset: 0.45
                    },
                    {
                        transform: `translate(${deltaX}px, ${deltaY}px) scale(0.18)`,
                        opacity: 0,
                        filter: 'drop-shadow(0 2px 8px rgba(108, 48, 110, 0.1))',
                        offset: 1
                    }
                ], {
                    duration: 1400,
                    easing: 'cubic-bezier(0.25, 1, 0.35, 1)',
                    fill: 'forwards'
                })

                animation.onfinish = () => {
                    flyImg.remove()
                }
            } else {
                window.dispatchEvent(new CustomEvent('cart-bump'))
            }
        } catch (error) {
            console.error('Add to bag animation error:', error)
            window.dispatchEvent(new CustomEvent('cart-bump'))
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col justify-between bg-white rounded-3xl p-3 sm:p-4 border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-all duration-300 shadow-[0_2px_12px_rgba(58,12,56,0.02)] hover:shadow-[0_12px_32px_rgba(58,12,56,0.08)] select-none"
        >
            <Link href={`/product/${product.id}`} className="block flex-1">
                {/* Product Image Container with Smooth Zoom */}
                <div
                    ref={imageRef}
                    className="relative aspect-square w-full rounded-2xl bg-[#FAF6FA] flex items-center justify-center p-3 sm:p-4 overflow-hidden border border-[#EFE0EF]/60"
                >
                    {/* Badge */}
                    <span className="absolute top-2.5 left-2.5 z-10 text-[10px] sm:text-[11px] font-bold text-[#6C306E] bg-white/90 backdrop-blur-xs border border-[#EFE0EF] px-2.5 py-0.5 rounded-full shadow-2xs">
                        {badgeText}
                    </span>

                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={280}
                        height={280}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-106 transition-transform duration-500 ease-out"
                    />
                </div>

                {/* Content */}
                <div className="mt-3.5 flex flex-col flex-1">
                    {/* Category & Star Rating */}
                    <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
                        <span className="text-[10px] font-bold text-[#9956A1] uppercase tracking-wider">
                            {product.category}
                        </span>

                        <div className="flex items-center gap-1">
                            <StarIcon size={12} filled={true} color="#D8B56D" />
                            <span className="text-[11px] font-semibold text-slate-700">
                                {avgRating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                ({ratingCount})
                            </span>
                        </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-[#241224] text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#6C306E] transition-colors">
                        {product.name}
                    </h3>
                </div>
            </Link>

            {/* Bottom Row: Price & Animated Quick Add Button */}
            <div className="mt-3 pt-3 border-t border-[#EFE0EF]/70 flex items-center justify-between gap-2">
                <div>
                    <span className="text-[10px] text-slate-400 block font-medium leading-none mb-0.5">Price</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-[#3A0C38]">
                            {currency}{product.price.toLocaleString()}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                                {currency}{product.mrp.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Luxury Add to Cart Button */}
                <motion.button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
                    whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                    whileTap={{ scale: isOutOfStock ? 1 : 0.92 }}
                    aria-label={isOutOfStock ? `${product.name} is sold out` : `Add ${product.name} to cart`}
                    className={`size-9 sm:size-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xs ${
                        isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : isAdded
                                ? 'bg-emerald-600 text-white cursor-pointer'
                                : 'bg-[#6C306E] hover:bg-[#3A0C38] text-white hover:shadow-[0_4px_14px_rgba(108,48,110,0.35)] cursor-pointer'
                        }`}
                >
                    {isOutOfStock ? (
                        <span className="text-[10px] font-bold">X</span>
                    ) : isAdded ? (
                        <CheckIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                    ) : (
                        <BagIcon size={16} color="#FFFFFF" />
                    )}
                </motion.button>
            </div>
        </motion.div>
    )
}

export default ProductCard
