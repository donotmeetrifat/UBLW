'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
    BagIcon,
    TruckIcon,
    UserIcon,
    HomeIcon,
    StoreFrontIcon
} from '@/components/icons'
import { motion } from 'framer-motion'

export default function MobileBottomNav() {
    const pathname = usePathname()
    const [currentUser, setCurrentUser] = useState(null)

    const cart = useSelector(state => state.cart)
    const products = useSelector(state => state.product.list)
    const isProductsLoaded = useSelector(state => state.product.isLoaded)

    // Load active user session
    useEffect(() => {
        const syncUser = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    try {
                        setCurrentUser(JSON.parse(saved))
                    } catch {
                        setCurrentUser(null)
                    }
                } else {
                    setCurrentUser(null)
                }
            }
        }
        syncUser()
        window.addEventListener('auth-change', syncUser)
        window.addEventListener('storage', syncUser)
        return () => {
            window.removeEventListener('auth-change', syncUser)
            window.removeEventListener('storage', syncUser)
        }
    }, [])

    // Verified bag count
    const cartCount = useMemo(() => {
        if (!currentUser || !cart?.cartItems || typeof cart.cartItems !== 'object') {
            return 0
        }
        if (isProductsLoaded || (Array.isArray(products) && products.length > 0)) {
            const validProductIds = new Set((products || []).map(p => p.id))
            let verifiedTotal = 0
            for (const [id, qty] of Object.entries(cart.cartItems)) {
                if (validProductIds.has(id) && typeof qty === 'number' && qty > 0) {
                    verifiedTotal += qty
                }
            }
            return verifiedTotal
        }
        return Math.max(0, cart.total || 0)
    }, [currentUser, cart, products, isProductsLoaded])

    // Hide mobile bottom nav inside admin pages
    if (pathname && pathname.startsWith('/admin')) {
        return null
    }

    const navItems = [
        {
            label: 'Home',
            href: '/',
            icon: HomeIcon,
            isActive: pathname === '/'
        },
        {
            label: 'Shop',
            href: '/shop',
            icon: StoreFrontIcon,
            isActive: pathname === '/shop' || (pathname.startsWith('/product') && !pathname.includes('admin'))
        },
        {
            label: 'Bag',
            href: currentUser ? '/cart' : '/login?redirect=/cart',
            icon: BagIcon,
            badge: currentUser ? cartCount : 0,
            isActive: pathname === '/cart' || pathname === '/checkout',
            id: 'navbar-cart-icon-mobile'
        },
        {
            label: 'Orders',
            href: currentUser ? '/orders' : '/login?redirect=/orders',
            icon: TruckIcon,
            isActive: pathname === '/orders'
        },
        {
            label: currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'Account') : 'Sign In',
            href: currentUser ? '/account' : '/login',
            icon: UserIcon,
            isActive: pathname === '/account' || pathname === '/login' || pathname === '/signup'
        }
    ]

    return (
        <aside
            aria-label="Mobile Navigation Bar"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EFE0EF] shadow-[0_-4px_24px_rgba(58,12,56,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 px-2 select-none"
        >
            <nav className="flex items-center justify-around max-w-lg mx-auto">
                {navItems.map((item, idx) => {
                    const Icon = item.icon
                    const isSelected = item.isActive

                    return (
                        <Link
                            key={idx}
                            id={item.id}
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative min-w-[56px] min-h-[48px] transition-all duration-200 cursor-pointer ${
                                isSelected
                                    ? 'text-[#6C306E]'
                                    : 'text-slate-500 hover:text-[#241224] active:scale-95'
                            }`}
                        >
                            {/* Icon Wrapper with Badge */}
                            <div className="relative flex items-center justify-center">
                                <motion.div
                                    whileTap={{ scale: 0.88 }}
                                    transition={{ duration: 0.15 }}
                                    className={`size-7 rounded-xl flex items-center justify-center transition-all ${
                                        isSelected
                                            ? 'bg-[#FAF6FA] text-[#6C306E] shadow-2xs border border-[#EFE0EF]'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    <Icon
                                        size={18}
                                        color={isSelected ? '#6C306E' : 'currentColor'}
                                        strokeWidth={isSelected ? 2.2 : 1.8}
                                    />
                                </motion.div>

                                {/* Live Bag Badge */}
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white leading-none">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[64px] ${
                                    isSelected
                                        ? 'font-extrabold text-[#6C306E]'
                                        : 'font-medium text-slate-500'
                                }`}
                            >
                                {item.label}
                            </span>

                            {/* Active Top/Bottom Accent Dot */}
                            {isSelected && (
                                <motion.span
                                    layoutId="bottomNavDot"
                                    className="absolute -bottom-0.5 size-1 rounded-full bg-[#6C306E]"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
