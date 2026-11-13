'use client'

import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCart, calculateCartTotal } from '@/lib/features/cart/cartSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'
import { setProduct, setCategories, setHomepageSections, setBanners } from '@/lib/features/product/productSlice'
import AuthModal from '@/components/AuthModal'

export default function DataSyncProvider({ children }) {
    const dispatch = useDispatch()
    const hasInitializedRef = useRef(false)
    const [authModal, setAuthModal] = useState({
        isOpen: false,
        mode: 'login',
        message: '',
    })

    // Global listener to trigger Auth Modal from any component
    useEffect(() => {
        const handleOpenAuth = (e) => {
            const detail = e?.detail || {}
            setAuthModal({
                isOpen: true,
                mode: detail.mode || 'login',
                message: detail.message || '',
            })
        }

        window.addEventListener('open-auth-modal', handleOpenAuth)
        return () => window.removeEventListener('open-auth-modal', handleOpenAuth)
    }, [])

    useEffect(() => {
        // Prevent duplicate execution on fast dev re-renders
        if (hasInitializedRef.current) return
        hasInitializedRef.current = true

        // 1. INSTANT 0ms HYDRATION FROM LOCALSTORAGE
        if (typeof window !== 'undefined') {
            try {
                // Hydrate Categories for 0ms instantaneous render
                const storedCats = localStorage.getItem('ukbl_cached_categories')
                if (storedCats) {
                    const parsedCats = JSON.parse(storedCats)
                    if (Array.isArray(parsedCats) && parsedCats.length > 0) {
                        dispatch(setCategories(parsedCats))
                    }
                }

                // Hydrate Homepage Sections for 0ms instantaneous render
                const storedSections = localStorage.getItem('ukbl_cached_homepage_sections')
                if (storedSections) {
                    try {
                        const parsedSec = JSON.parse(storedSections)
                        if (parsedSec && typeof parsedSec === 'object') {
                            dispatch(setHomepageSections(parsedSec))
                        }
                    } catch (e) {}
                }

                // Hydrate Hero Banners for 0ms instantaneous render
                const storedBanners = localStorage.getItem('ukbl_cached_hero_banners')
                if (storedBanners) {
                    try {
                        const parsedBanners = JSON.parse(storedBanners)
                        if (Array.isArray(parsedBanners) && parsedBanners.length > 0) {
                            dispatch(setBanners(parsedBanners))
                        }
                    } catch (e) {}
                }

                // Hydrate Products for 0ms instantaneous render
                const storedProds = localStorage.getItem('ukbl_cached_products')
                if (storedProds) {
                    const parsedProds = JSON.parse(storedProds)
                    if (Array.isArray(parsedProds) && parsedProds.length > 0) {
                        dispatch(setProduct(parsedProds))
                    }
                }

                const currentUser = localStorage.getItem('ukbl_current_user')

                if (currentUser) {
                    // Hydrate Cart for signed-in user
                    const storedCart = localStorage.getItem('ukbl_cart')
                    if (storedCart) {
                        const parsedCart = JSON.parse(storedCart)
                        if (parsedCart && parsedCart.cartItems) {
                            dispatch(setCart(parsedCart))
                        }
                    }

                    // Hydrate Addresses
                    const storedAddresses = localStorage.getItem('savedAddresses')
                    if (storedAddresses) {
                        const parsedAddr = JSON.parse(storedAddresses)
                        if (Array.isArray(parsedAddr) && parsedAddr.length > 0) {
                            dispatch(setAddresses(parsedAddr))
                        }
                    }
                } else {
                    // Unauthenticated visitors CANNOT have items in shopping bag
                    localStorage.removeItem('ukbl_cart')
                    dispatch(setCart({ cartItems: {}, total: 0 }))
                }
            } catch (e) {
                console.error('Initial storage hydration error:', e)
            }
        }

        // 2. FETCH LIVE PRODUCT CATALOG
        const syncProductCatalog = async () => {
            try {
                const res = await fetch(`/api/products?_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.products) && data.products.length > 0) {
                    dispatch(setProduct(data.products))
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_cached_products', JSON.stringify(data.products))
                    }
                }
            } catch (e) {
                // Silent fallback: productDummyData remains active
            }
        }
        syncProductCatalog()

        // 2b. FETCH LIVE CATEGORY CATALOG SITE-WIDE
        const syncCategoryCatalog = async () => {
            try {
                const res = await fetch(`/api/categories?_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
                    const activeNames = data.categories
                        .filter(c => c.isActive !== false)
                        .map(c => c.name)
                    if (activeNames.length > 0) {
                        dispatch(setCategories(activeNames))
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('ukbl_cached_categories', JSON.stringify(activeNames))
                        }
                    }
                }
            } catch (e) {
                // Silent fallback
            }
        }
        syncCategoryCatalog()

        // 2c. FETCH LIVE HOMEPAGE CURATED SECTIONS
        const syncHomepageSections = async () => {
            try {
                const res = await fetch(`/api/homepage-sections?_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && data.sections) {
                    dispatch(setHomepageSections(data.sections))
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_cached_homepage_sections', JSON.stringify(data.sections))
                    }
                }
            } catch (e) {
                // Silent fallback
            }
        }
        syncHomepageSections()

        // 2d. FETCH LIVE HERO BANNERS
        const syncHeroBanners = async () => {
            try {
                const res = await fetch(`/api/banners?_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
                    dispatch(setBanners(data.banners))
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(data.banners))
                    }
                }
            } catch (e) {
                // Silent fallback
            }
        }
        syncHeroBanners()

        if (typeof window !== 'undefined') {
            window.addEventListener('product-catalog-updated', syncProductCatalog)
            window.addEventListener('category-catalog-updated', syncCategoryCatalog)
            window.addEventListener('homepage-sections-updated', syncHomepageSections)
            window.addEventListener('hero-banners-updated', syncHeroBanners)
            window.addEventListener('storage', (e) => {
                if (e.key === 'ukbl_categories_synced') syncCategoryCatalog()
                if (e.key === 'ukbl_products_synced') syncProductCatalog()
                if (e.key === 'ukbl_sections_synced') syncHomepageSections()
                if (e.key === 'ukbl_banners_synced') syncHeroBanners()
                if (e.key === 'ukbl_coupons_synced') {
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                }
            })
            try {
                const bc = new BroadcastChannel('ukbl_catalog_channel')
                bc.onmessage = (msg) => {
                    if (msg.data?.type === 'hero-banners-updated' && Array.isArray(msg.data?.banners)) {
                        dispatch(setBanners(msg.data.banners))
                        try {
                            localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(msg.data.banners))
                        } catch {}
                    }
                    if (msg.data?.type === 'homepage-sections-updated' && msg.data?.sections) {
                        dispatch(setHomepageSections(msg.data.sections))
                        try {
                            localStorage.setItem('ukbl_cached_homepage_sections', JSON.stringify(msg.data.sections))
                        } catch {}
                    }
                    if (msg.data?.type === 'product-updated' && msg.data?.product) {
                        dispatch(setProduct([msg.data.product]))
                        try {
                            const cached = JSON.parse(localStorage.getItem('ukbl_cached_products') || '[]')
                            const list = Array.isArray(cached) ? cached : []
                            const idx = list.findIndex(p => p.id === msg.data.product.id)
                            if (idx >= 0) {
                                list[idx] = { ...list[idx], ...msg.data.product }
                            } else {
                                list.unshift(msg.data.product)
                            }
                            localStorage.setItem('ukbl_cached_products', JSON.stringify(list))
                        } catch {}
                    }
                    if (msg.data?.type === 'category-updated') {
                        syncCategoryCatalog()
                    }
                    syncProductCatalog()
                }
            } catch {}
        }

        // 3. SYNCHRONIZE USER ACCOUNT, DATABASE CART & ADDRESSES
        const syncUserData = async () => {
            try {
                // Check if user is authenticated
                const authRes = await fetch('/api/auth/me')
                const authData = await authRes.json()

                if (authData.success && authData.user) {
                    const user = authData.user

                    // Save verified user to localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_current_user', JSON.stringify(user))
                    }

                    // A. Fetch and Merge Database Cart
                    try {
                        const cartRes = await fetch('/api/cart')
                        const cartData = await cartRes.json()

                        if (cartData.success) {
                            const dbCartItems = cartData.cartItems || {}

                            // Read local cart items to merge
                            let localCartItems = {}
                            if (typeof window !== 'undefined') {
                                try {
                                    const localRaw = localStorage.getItem('ukbl_cart')
                                    if (localRaw) {
                                        const parsed = JSON.parse(localRaw)
                                        localCartItems = parsed.cartItems || {}
                                    }
                                } catch {}
                            }

                            // Smart Merge: combine products, taking max quantity
                            const mergedItems = { ...dbCartItems }
                            for (const [prodId, qty] of Object.entries(localCartItems)) {
                                if (typeof qty === 'number' && qty > 0) {
                                    mergedItems[prodId] = Math.max(mergedItems[prodId] || 0, qty)
                                }
                            }

                            const mergedTotal = calculateCartTotal(mergedItems)
                            dispatch(setCart({ cartItems: mergedItems, total: mergedTotal }))

                            // Persist merged cart back to server if different from dbCart
                            if (JSON.stringify(mergedItems) !== JSON.stringify(dbCartItems)) {
                                fetch('/api/cart', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ cartItems: mergedItems, total: mergedTotal })
                                }).catch(() => {})
                            }
                        }
                    } catch (cartErr) {
                        console.error('Failed to sync server cart:', cartErr)
                    }

                    // B. Fetch and Sync User Addresses
                    try {
                        const addrRes = await fetch('/api/addresses')
                        const addrData = await addrRes.json()

                        if (addrData.success && Array.isArray(addrData.addresses) && addrData.addresses.length > 0) {
                            dispatch(setAddresses(addrData.addresses))
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('savedAddresses', JSON.stringify(addrData.addresses))
                            }
                        }
                    } catch (addrErr) {
                        console.error('Failed to sync server addresses:', addrErr)
                    }
                }
            } catch (authErr) {
                // Visitor session
            }
        }

        syncUserData()

        // 4. CROSS-TAB & CROSS-WINDOW SYNCHRONIZATION
        const handleStorageEvent = (event) => {
            if (!event || !event.key) return

            if (event.key === 'ukbl_cart' && event.newValue) {
                try {
                    const parsed = JSON.parse(event.newValue)
                    if (parsed && parsed.cartItems) {
                        dispatch(setCart(parsed))
                    }
                } catch {}
            }

            if (event.key === 'savedAddresses' && event.newValue) {
                try {
                    const parsed = JSON.parse(event.newValue)
                    if (Array.isArray(parsed)) {
                        dispatch(setAddresses(parsed))
                    }
                } catch {}
            }

            if (event.key === 'ukbl_current_user') {
                syncUserData()
            }
        }

        const handleAuthChange = () => {
            syncUserData()
        }

        window.addEventListener('storage', handleStorageEvent)
        window.addEventListener('auth-change', handleAuthChange)

        return () => {
            window.removeEventListener('storage', handleStorageEvent)
            window.removeEventListener('auth-change', handleAuthChange)
        }
    }, [dispatch])

    return (
        <>
            {children}
            <AuthModal
                isOpen={authModal.isOpen}
                onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
                initialMode={authModal.mode}
                promptMessage={authModal.message}
                onLoginSuccess={() => {
                    setAuthModal(prev => ({ ...prev, isOpen: false }))
                }}
            />
        </>
    )
}

