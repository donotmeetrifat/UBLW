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
import { motion, LayoutGroup } from 'framer-motion'

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
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EFE0EF] shadow-[0_-2px_16px_rgba(58,12,56,0.04)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 px-2 select-none"
        >
            <LayoutGroup id="mobile-bottom-navigation-group">
                <nav className="flex items-center justify-around max-w-md mx-auto">
                    {navItems.map((item, idx) => {
                        const Icon = item.icon
                        const isSelected = item.isActive

                        return (
                            <motion.div
                                key={idx}
                                whileTap={{ scale: 0.90 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="relative flex-1 flex justify-center"
                            >
                                <Link
                                    id={item.id}
                                    href={item.href}
                                    className="flex flex-col items-center justify-center py-1 px-1 rounded-2xl relative w-full min-w-[56px] max-w-[70px] min-h-[50px] cursor-pointer"
                                >
                                    {/* Icon Container with Badge */}
                                    <div className="relative flex items-center justify-center">
                                        <motion.div
                                            animate={isSelected ? {
                                                scale: [1, 1.2, 1.1],
                                                y: -2.5,
                                            } : {
                                                scale: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 450,
                                                damping: 24,
                                                mass: 0.6
                                            }}
                                            className="size-7 flex items-center justify-center"
                                        >
                                            <Icon
                                                size={19}
                                                color={isSelected ? '#6C306E' : '#8A7B8A'}
                                                strokeWidth={isSelected ? 2.2 : 1.75}
                                            />
                                        </motion.div>

                                        {/* Live Bag Badge */}
                                        {item.badge > 0 && (
                                            <motion.span
                                                key={`badge-${item.badge}`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                                className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white leading-none pointer-events-none"
                                            >
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </motion.span>
                                        )}
                                    </div>

                                    {/* Label with Smooth Color & Scale Transition */}
                                    <motion.span
                                        animate={isSelected ? {
                                            color: '#6C306E',
                                            scale: 1.05,
                                            y: -0.5
                                        } : {
                                            color: '#8A7B8A',
                                            scale: 1,
                                            y: 0
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className={`text-[10px] tracking-tight truncate max-w-[64px] select-none ${
                                            isSelected ? 'font-bold' : 'font-medium'
                                        }`}
                                    >
                                        {item.label}
                                    </motion.span>

                                    {/* Clean Minimalist Active Dot that slides smoothly across tabs */}
                                    {isSelected && (
                                        <motion.span
                                            layoutId="cleanActiveNavDot"
                                            className="size-1 rounded-full bg-[#6C306E] mt-0.5"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 32,
                                                mass: 0.5
                                            }}
                                        />
                                    )}
                                </Link>
                            </motion.div>
                        )
                    })}
                </nav>
            </LayoutGroup>
        </aside>
    )
}
