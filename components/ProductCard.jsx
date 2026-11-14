'use client'

import { addToCart } from '@/lib/features/cart/cartSlice'
import { BagIcon, CheckIcon, StarIcon } from '@/components/icons'
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth'
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

    const badgeText = discountPercentage > 0 && product?.category
        ? `${discountPercentage}% OFF · ${product.category}`
        : discountPercentage > 0
            ? `${discountPercentage}% OFF`
            : product?.category || 'UK Import'

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Strict sign-in enforcement: only authenticated users can add to bag
        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add products to your shopping bag.')
            return
        }

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
                flyImg.style.objectFit = 'cover'
                flyImg.style.zIndex = '9999'
                flyImg.style.pointerEvents = 'none'
                flyImg.style.backgroundColor = 'transparent'
                flyImg.style.borderRadius = '12px'
                flyImg.style.boxShadow = 'none'
                flyImg.style.border = 'none'
                flyImg.style.willChange = 'transform, opacity'

                document.body.appendChild(flyImg)

                // Dispatch Cart Bump Feedback
                const bumpTimer = setTimeout(() => {
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
                    clearTimeout(bumpTimer)
                    flyImg.remove()
                }
            } else {
                window.dispatchEvent(new CustomEvent('cart-bump'))
            }
        } catch (err) {
            console.error('Add to cart operation error:', err)
            window.dispatchEvent(new CustomEvent('cart-bump'))
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4 }}
            className='group relative flex flex-col w-full bg-white rounded-xl border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-all duration-300 overflow-hidden hover:shadow-[0_8px_24px_rgba(108,48,110,0.06)]'
        >
            {/* Aspect Square Image Box (100% 1:1 Square Area for Ready-made Product Photos - Full Filled) */}
            <div className='relative aspect-square w-full bg-white overflow-hidden rounded-t-xl'>
                <Link href={`/product/${product.id}`} className='w-full h-full block relative'>
                    <Image
                        ref={imageRef}
                        width={800}
                        height={800}
                        unoptimized={true}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        src={product.images[0]?.src || product.images[0]}
                        alt={product.name}
                    />
                </Link>

                {/* Floating Add-to-Cart Action Button with Micro-Animation & Glow */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to cart`}
                    className={`group/cartbtn absolute top-2.5 right-2.5 z-10 size-8 sm:size-9 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer active:scale-90 ${
                        isPressed ? 'scale-90' : ''
                    } ${
                        isAdded
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-[0_4px_16px_rgba(5,150,105,0.45)] scale-105'
                            : 'bg-white border-[#EFE0EF] text-[#6C306E] hover:bg-gradient-to-br hover:from-[#6C306E] hover:to-[#401242] hover:text-white hover:border-[#6C306E] hover:scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(108,48,110,0.4)]'
                    }`}
                >
                    {isAdded ? (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 450, damping: 20 }}
                        >
                            <CheckIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
                        </motion.div>
                    ) : (
                        <div className="group-hover/cartbtn:scale-110 group-hover/cartbtn:-rotate-12 transition-transform duration-300">
                            <BagIcon size={14} color="currentColor" />
                        </div>
                    )}
                </button>
            </div>

            {/* Compact Information Area (~30-35% Height) */}
            <div className='p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white text-left'>
                <div>
                    {/* Line 1: Dynamic Discount & Category Label */}
                    <span className='text-[9px] sm:text-[10px] font-bold text-[#6C306E] uppercase tracking-wider block mb-1'>
                        {badgeText}
                    </span>

                    {/* Line 2: Product Title (Compact 2 Lines) */}
                    <Link href={`/product/${product.id}`}>
                        <h3 className='font-semibold text-[#241224] text-xs leading-snug line-clamp-2 hover:text-[#6C306E] transition-colors mb-1.5'>
                            {product.name}
                        </h3>
                    </Link>

                    {/* Line 3: Compact Rating (★★★★★ 5.0 (18)) */}
                    <div className='flex items-center gap-1 text-[10px] text-slate-500 mb-2'>
                        <div className='flex items-center gap-0.5'>
                            {Array(5).fill('').map((_, index) => (
                                <StarIcon
                                    key={index}
                                    size={11}
                                    filled={avgRating >= index + 1}
                                    color="#D8B56D"
                                />
                            ))}
                        </div>
                        <span className='font-bold text-slate-700 text-[10px]'>{avgRating.toFixed(1)}</span>
                        <span className='text-slate-400 text-[10px]'>({ratingCount || 18})</span>
                    </div>
                </div>

                {/* Line 4: Clean Price Row */}
                <div className='flex items-baseline gap-2 pt-1 border-t border-[#EFE0EF]/60'>
                    <span className='font-bold text-[#3A0C38] text-sm sm:text-base'>
                        {currency}{product.price.toLocaleString()}
                    </span>
                    {product?.mrp && product.mrp > product.price && (
                        <span className='text-xs text-slate-400 line-through font-normal'>
                            {currency}{product.mrp.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default ProductCard
