'use client'

import { addToCart } from '@/lib/features/cart/cartSlice'
import { Check, ShoppingBag, StarIcon } from 'lucide-react'
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

            // 5. Slower Luxurious Pure Product Image Flight Animation (1.6s / 1600ms)
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
                const arcSide = deltaX > 0 ? 30 : -30

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

                // Dispatch Cart Bump Feedback at ~1500ms
                const bumpTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('cart-bump'))
                }, 1500)

                // 1600ms Web Animations API curved arc keyframe animation
                const animation = flyImg.animate(
                    [
                        { 
                            transform: 'translate3d(0px, 0px, 0) scale(1) rotate(0deg)', 
                            opacity: 1 
                        },
                        { 
                            transform: `translate3d(${arcSide * 0.2}px, ${arcLift * 0.6}px, 0) scale(1.05) rotate(-3deg)`, 
                            opacity: 1,
                            offset: 0.15
                        },
                        { 
                            transform: `translate3d(${deltaX * 0.72}px, ${deltaY * 0.65 + arcLift * 0.4}px, 0) scale(0.72) rotate(8deg)`, 
                            opacity: 0.95,
                            offset: 0.75
                        },
                        { 
                            transform: `translate3d(${deltaX * 0.95}px, ${deltaY * 0.92}px, 0) scale(0.28) rotate(15deg)`, 
                            opacity: 0.7,
                            offset: 0.92
                        },
                        { 
                            transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.05) rotate(20deg)`, 
                            opacity: 0 
                        }
                    ],
                    {
                        duration: 1600,
                        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        fill: 'forwards'
                    }
                )

                animation.onfinish = () => {
                    clearTimeout(bumpTimer)
                    flyImg.remove()
                }
            }
        } catch (err) {
            console.error('Add to cart operation error:', err)
        }
    }

    return (
        <div className='group relative flex flex-col w-full bg-white rounded-xl border border-[#EFE0EF] hover:border-[#6C306E]/30 transition-all duration-300 overflow-hidden'>
            {/* Aspect Square Image Box (100% 1:1 Square Area for Ready-made Product Photos) */}
            <div className='relative aspect-square w-full bg-[#FAF6FA] overflow-hidden rounded-t-xl'>
                <Link href={`/product/${product.id}`} className='w-full h-full block relative'>
                    <Image
                        ref={imageRef}
                        width={400}
                        height={400}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        src={product.images[0]}
                        alt={product.name}
                    />
                </Link>

                {/* Small Premium Floating Add-to-Cart Button (Top-Right) */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to cart`}
                    className={`absolute top-2.5 right-2.5 z-10 size-7.5 sm:size-8.5 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 ${
                        isPressed ? 'scale-90' : ''
                    } ${
                        isAdded
                            ? 'bg-[#6C306E] text-white border-[#6C306E]'
                            : 'bg-white border-[#EFE0EF] text-[#6C306E] hover:bg-[#6C306E] hover:text-white hover:border-[#6C306E] hover:scale-105'
                    }`}
                >
                    {isAdded ? (
                        <Check size={14} className='stroke-[2.5]' />
                    ) : (
                        <ShoppingBag size={14} className='stroke-[2]' />
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
                                    className='text-transparent'
                                    fill={avgRating >= index + 1 ? "#D8B56D" : "#E2E8F0"}
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
        </div>
    )
}

export default ProductCard