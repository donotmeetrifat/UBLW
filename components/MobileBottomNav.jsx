'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
    BagIcon,
    TruckIcon,
    UserIcon,
    HomeIcon,
    StoreFrontIcon,
    SparklesIcon,
    ReviewBadgeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    CloseIcon,
    ChevronRightIcon
} from '@/components/icons'
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function MobileBottomNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState(null)
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

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

    // Close account drawer automatically when route changes
    useEffect(() => {
        setIsAccountMenuOpen(false)
    }, [pathname])

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

    // Sign out handler
    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' })
        } catch (_) {}

        if (typeof window !== 'undefined') {
            localStorage.removeItem('ukbl_current_user')
            localStorage.removeItem('ukbl_auth_token')
            window.dispatchEvent(new Event('auth-change'))
        }
        setCurrentUser(null)
        setIsAccountMenuOpen(false)
        toast.success('Signed out successfully.')
        router.refresh()
    }

    // Hide mobile bottom nav inside admin pages
    if (pathname && pathname.startsWith('/admin')) {
        return null
    }

    // 5 Mobile Tabs: Home, Shop, Bag, AI Advisor, Account (with merged Orders/Reviews/Profile)
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
            label: 'AI Advisor',
            href: '/beauty-advisor',
            icon: SparklesIcon,
            isActive: pathname === '/beauty-advisor'
        },
        {
            label: currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'Account') : 'Sign In',
            href: currentUser ? '/account' : '/login',
            icon: UserIcon,
            isAccountTrigger: true,
            isActive: isAccountMenuOpen || pathname === '/account' || pathname === '/orders' || pathname === '/reviews' || pathname === '/login' || pathname === '/signup'
        }
    ]

    return (
        <>
            {/* MOBILE ACCOUNT DRAWER / BOTTOM SHEET */}
            <AnimatePresence>
                {isAccountMenuOpen && currentUser && (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                        />

                        {/* Slide-up sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                            className="relative bg-white rounded-t-3xl border-t border-[#EFE0EF] shadow-[0_-16px_50px_rgba(58,12,56,0.18)] max-w-md mx-auto w-full p-4 pb-6 z-10 flex flex-col max-h-[85vh] overflow-y-auto"
                        >
                            {/* Drag handle pill */}
                            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 shrink-0" />

                            {/* User Profile Header Card */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FAF6FA] via-[#FCF8FC] to-white border border-[#EFE0EF] mb-3 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-[#6C306E] to-[#401242] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-bold text-xs text-[#241224] truncate">
                                                {currentUser.name}
                                            </p>
                                            {currentUser.role === 'ADMIN' && (
                                                <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#6C306E] text-white shrink-0">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                                            {currentUser.email || currentUser.phone}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAccountMenuOpen(false)}
                                    className="size-7 rounded-full border border-[#EFE0EF] bg-white text-slate-400 hover:text-[#241224] flex items-center justify-center shrink-0 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <CloseIcon size={12} />
                                </button>
                            </div>

                            {/* Clean Navigation Options */}
                            <div className="space-y-1.5 overflow-y-auto">
                                {/* Admin Portal Quick Link */}
                                {currentUser.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsAccountMenuOpen(false)}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] hover:bg-[#EFE0EF] transition font-bold text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <ShieldCheckIcon size={16} color="#6C306E" />
                                            <span>Admin Portal</span>
                                        </div>
                                        <span className="text-xs">↗</span>
                                    </Link>
                                )}

                                {/* 1. Manage My Account */}
                                <Link
                                    href="/account"
                                    onClick={() => setIsAccountMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA] transition text-xs font-semibold text-[#241224] group"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                                            <UserIcon size={14} color="#6C306E" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs text-[#241224] truncate">Manage My Account</p>
                                            <p className="text-[10px] text-slate-400 font-normal truncate">Profile details & saved addresses</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={14} color="#8A7B8A" className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </Link>

                                {/* 2. My Orders */}
                                <Link
                                    href="/orders"
                                    onClick={() => setIsAccountMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA] transition text-xs font-semibold text-[#241224] group"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                                            <TruckIcon size={14} color="#6C306E" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs text-[#241224] truncate">My Orders</p>
                                            <p className="text-[10px] text-slate-400 font-normal truncate">Track live shipments & order invoices</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={14} color="#8A7B8A" className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </Link>

                                {/* 3. My Reviews */}
                                <Link
                                    href="/reviews"
                                    onClick={() => setIsAccountMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA] transition text-xs font-semibold text-[#241224] group"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                                            <ReviewBadgeIcon size={14} color="#6C306E" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs text-[#241224] truncate">My Reviews</p>
                                            <p className="text-[10px] text-slate-400 font-normal truncate">Product ratings & customer feedback</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={14} color="#8A7B8A" className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </Link>

                                {/* 4. Contact & Support (specifically kept on mobile) */}
                                <Link
                                    href="/contact"
                                    onClick={() => setIsAccountMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA] transition text-xs font-semibold text-[#241224] group"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                                            <PhoneIcon size={14} color="#6C306E" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs text-[#241224] truncate">Contact & Support</p>
                                            <p className="text-[10px] text-slate-400 font-normal truncate">Customer advice & direct phone/email</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={14} color="#8A7B8A" className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                                </Link>
                            </div>

                            {/* Logout Action */}
                            <div className="pt-2.5 border-t border-[#EFE0EF] mt-2.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50/70 hover:bg-rose-50 text-rose-600 border border-rose-100 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 5-BUTTON MOBILE BOTTOM NAVIGATION BAR */}
            <aside
                aria-label="Mobile Navigation Bar"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl backdrop-saturate-180 border-t border-[#EFE0EF]/80 shadow-[0_-4px_24px_rgba(58,12,56,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 px-2 select-none"
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
                                        onClick={(e) => {
                                            if (item.isAccountTrigger && currentUser) {
                                                e.preventDefault()
                                                setIsAccountMenuOpen(prev => !prev)
                                            }
                                        }}
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

                                        {/* Label */}
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

                                        {/* Minimalist Active Indicator Dot */}
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
        </>
    )
}
