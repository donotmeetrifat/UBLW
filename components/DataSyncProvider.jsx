'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCart, calculateCartTotal, sanitizeCartWithProducts } from '@/lib/features/cart/cartSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'
import { 
    setProduct, 
    setCategories, 
    setHomepageSections, 
    setBanners, 
    setBannerSettings, 
    setHeroBannerAutoplay, 
    setPromotions 
} from '@/lib/features/product/productSlice'
import AuthModal from '@/components/AuthModal'
import { subscribeToStoreSync } from '@/lib/realtimeSync'

export default function DataSyncProvider({ children }) {
    const dispatch = useDispatch()
    const productsList = useSelector(state => state.product.list)
    const isProductsLoaded = useSelector(state => state.product.isLoaded)
    const hasInitializedRef = useRef(false)
    const knownVersionsRef = useRef({
        banners: 0,
        promotions: 0,
        categories: 0,
        products: 0,
        sections: 0,
        settings: 0,
        coupons: 0,
        orders: 0,
        inquiries: 0
    })
    const [authModal, setAuthModal] = useState({
        isOpen: false,
        mode: 'login',
        message: '',
    })

    // Continuously verify and sanitize shopping bag whenever live product list changes
    useEffect(() => {
        if (isProductsLoaded) {
            dispatch(sanitizeCartWithProducts(productsList))
        }
    }, [productsList, isProductsLoaded, dispatch])

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

        // Register Service Worker with Auto-Updating & Cache Eviction
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then((registration) => {
                    // Force immediate update check on each load
                    registration.update().catch(() => {});

                    // Self-healing: if device holds stale sw cache from previous versions, purge immediately
                    const currentSwVer = 'ukbl-v5';
                    if (localStorage.getItem('ukbl_sw_installed_version') !== currentSwVer) {
                        if (registration.active) {
                            registration.active.postMessage({ type: 'CLEAR_ALL_CACHES' });
                        }
                        if ('caches' in window) {
                            caches.keys().then((keys) => {
                                keys.forEach(key => {
                                    if (!key.includes(currentSwVer)) {
                                        caches.delete(key);
                                    }
                                });
                            });
                        }
                        try {
                            const cachedPromos = localStorage.getItem('ukbl_cached_promotions');
                            if (cachedPromos && (cachedPromos.includes('hero_card_img') || cachedPromos.includes('product_img'))) {
                                localStorage.removeItem('ukbl_cached_promotions');
                            }
                        } catch {}
                        localStorage.setItem('ukbl_sw_installed_version', currentSwVer);
                    }

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    installingWorker.postMessage({ type: 'CLEAR_ALL_CACHES' });
                                }
                            };
                        }
                    };
                }).catch((err) => {
                    console.warn('[SW] Offline worker registration:', err);
                });
            });
        }

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

                // Hydrate Hero Banner Settings (autoplay, timing)
                const storedBannerSettings = localStorage.getItem('ukbl_cached_hero_banner_settings')
                if (storedBannerSettings) {
                    try {
                        const parsedSettings = JSON.parse(storedBannerSettings)
                        if (parsedSettings && typeof parsedSettings === 'object') {
                            dispatch(setBannerSettings(parsedSettings))
                        }
                    } catch (e) {}
                }

                // Hydrate Hero Promotional Boxes for 0ms instantaneous render
                const storedPromos = localStorage.getItem('ukbl_cached_promotions')
                if (storedPromos) {
                    try {
                        const parsedPromos = JSON.parse(storedPromos)
                        if (parsedPromos && typeof parsedPromos === 'object') {
                            if (parsedPromos.mainCard?.image?.includes('hero_card_img1.png') || 
                                parsedPromos.sideCardTop?.image?.includes('hero_card_img2.png') ||
                                parsedPromos.sideCardBottom?.image?.includes('hero_card_img3.png')) {
                                localStorage.removeItem('ukbl_cached_promotions')
                            } else {
                                dispatch(setPromotions(parsedPromos))
                            }
                        }
                    } catch (e) {}
                }

                // Hydrate Products for 0ms instantaneous render
                const storedProds = localStorage.getItem('ukbl_cached_products')
                if (storedProds) {
                    if (storedProds.includes('prod_1') || storedProds.includes('CeraVe') || storedProds.includes('The Ordinary')) {
                        localStorage.removeItem('ukbl_cached_products')
                        dispatch(setProduct([]))
                    } else {
                        try {
                            const parsedProds = JSON.parse(storedProds)
                            if (Array.isArray(parsedProds)) {
                                dispatch(setProduct(parsedProds))
                            }
                        } catch (e) {}
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
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Expires': '0'
                    }
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.products)) {
                    dispatch(setProduct(data.products))
                    dispatch(sanitizeCartWithProducts(data.products))
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
                const res = await fetch(`/api/categories?all=true&_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.categories)) {
                    const activeNames = data.categories
                        .filter(c => c.isActive !== false)
                        .map(c => c.name)
                        .filter(Boolean)
                    dispatch(setCategories(activeNames))
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_cached_categories', JSON.stringify(activeNames))
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

        // 2d. FETCH LIVE HERO BANNERS & SETTINGS
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
                if (data.success) {
                    if (Array.isArray(data.banners) && data.banners.length > 0) {
                        dispatch(setBanners(data.banners))
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(data.banners))
                        }
                    }
                    if (data.settings && typeof data.settings === 'object') {
                        dispatch(setBannerSettings(data.settings))
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('ukbl_cached_hero_banner_settings', JSON.stringify(data.settings))
                        }
                    } else if (typeof data.autoplay === 'boolean') {
                        dispatch(setHeroBannerAutoplay(data.autoplay))
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('ukbl_cached_hero_banner_settings', JSON.stringify({ autoplay: data.autoplay, delay: 5000 }))
                        }
                    }
                }
            } catch (e) {
                // Silent fallback
            }
        }
        syncHeroBanners()

        // 2e. FETCH LIVE HERO PROMOTIONAL BOXES
        const syncHeroPromotions = async () => {
            try {
                const res = await fetch(`/api/promotions?_t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
                const data = await res.json()
                if (data.success && data.promotions) {
                    dispatch(setPromotions(data.promotions))
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_cached_promotions', JSON.stringify(data.promotions))
                    }
                }
            } catch (e) {
                // Silent fallback
            }
        }
        syncHeroPromotions()

        let unsubscribeRealtime = () => {}
        let versionCheckInterval = null
        let handleVisibilityOrFocus = () => {}
        let checkVersionSync = async () => {}

        if (typeof window !== 'undefined') {
            // A. SUPABASE REALTIME MESH LISTENER (Sub-second cross-device, global push)
            unsubscribeRealtime = subscribeToStoreSync((payload) => {
                if (!payload || !payload.type) return
                const rawType = String(payload.type).trim().toLowerCase()
                const data = payload.data || {}

                if (rawType === 'banners' || rawType === 'hero_banners') {
                    if (Array.isArray(data.banners) && data.banners.length > 0) {
                        dispatch(setBanners(data.banners))
                        try {
                            localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(data.banners))
                        } catch {}
                    } else {
                        syncHeroBanners()
                    }
                    if (data.settings && typeof data.settings === 'object') {
                        dispatch(setBannerSettings(data.settings))
                    } else if (typeof data.autoplay === 'boolean') {
                        dispatch(setHeroBannerAutoplay(data.autoplay))
                    }
                    window.dispatchEvent(new CustomEvent('hero-banners-updated', { detail: data }))
                } else if (rawType === 'hero_banner_autoplay') {
                    if (typeof data.autoplay === 'boolean') {
                        dispatch(setHeroBannerAutoplay(data.autoplay))
                    } else {
                        syncHeroBanners()
                    }
                    window.dispatchEvent(new CustomEvent('hero-banner-autoplay-updated', { detail: data }))
                } else if (rawType === 'promotions' || rawType === 'hero_promotions') {
                    if (data.promotions && typeof data.promotions === 'object') {
                        dispatch(setPromotions(data.promotions))
                        try {
                            localStorage.setItem('ukbl_cached_promotions', JSON.stringify(data.promotions))
                        } catch {}
                    } else {
                        syncHeroPromotions()
                    }
                    window.dispatchEvent(new CustomEvent('hero-promotions-updated', { detail: data }))
                } else if (rawType === 'categories' || rawType === 'category-catalog-updated' || rawType === 'category-updated' || rawType === 'categories-updated') {
                    syncCategoryCatalog()
                    syncProductCatalog()
                    window.dispatchEvent(new CustomEvent('category-catalog-updated', { detail: data }))
                    window.dispatchEvent(new CustomEvent('categories-updated', { detail: data }))
                } else if (rawType === 'sections' || rawType === 'homepage_sections') {
                    if (data.sections && typeof data.sections === 'object') {
                        dispatch(setHomepageSections(data.sections))
                        try {
                            localStorage.setItem('ukbl_cached_homepage_sections', JSON.stringify(data.sections))
                        } catch {}
                    } else {
                        syncHomepageSections()
                    }
                    window.dispatchEvent(new CustomEvent('homepage-sections-updated', { detail: data }))
                } else if (rawType === 'products' || rawType === 'product') {
                    if (data.product && data.product.id) {
                        dispatch(setProduct([data.product]))
                        try {
                            const cached = JSON.parse(localStorage.getItem('ukbl_cached_products') || '[]')
                            const list = Array.isArray(cached) ? cached : []
                            const idx = list.findIndex(p => p.id === data.product.id)
                            if (idx >= 0) list[idx] = { ...list[idx], ...data.product }
                            else list.unshift(data.product)
                            localStorage.setItem('ukbl_cached_products', JSON.stringify(list))
                        } catch {}
                    }
                    syncProductCatalog()
                    window.dispatchEvent(new CustomEvent('product-catalog-updated', { detail: data }))
                } else if (rawType === 'settings') {
                    window.dispatchEvent(new CustomEvent('settings-updated', { detail: data }))
                } else if (rawType === 'coupons') {
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated', { detail: data }))
                } else if (rawType === 'orders') {
                    window.dispatchEvent(new CustomEvent('orders-updated', { detail: data }))
                } else if (rawType === 'inquiries') {
                    window.dispatchEvent(new CustomEvent('inquiries-updated', { detail: data }))
                }
            })

            // B. FALLBACK HEARTBEAT VERSION POLLER (Ensures reconnecting & sleeping clients catch up without page reload)
            checkVersionSync = async () => {
                try {
                    const res = await fetch(`/api/sync/version?_t=${Date.now()}`, {
                        cache: 'no-store',
                        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
                    })
                    const data = await res.json()
                    if (data.success && data.versions) {
                        const v = data.versions
                        const prev = knownVersionsRef.current

                        if (prev.banners === 0) {
                            knownVersionsRef.current = { ...v }
                            return
                        }

                        if (v.banners > prev.banners) {
                            syncHeroBanners()
                            prev.banners = v.banners
                        }
                        if (v.promotions > prev.promotions) {
                            syncHeroPromotions()
                            prev.promotions = v.promotions
                        }
                        if (v.categories > prev.categories) {
                            syncCategoryCatalog()
                            prev.categories = v.categories
                        }
                        if (v.products > prev.products) {
                            syncProductCatalog()
                            prev.products = v.products
                        }
                        if (v.sections > prev.sections) {
                            syncHomepageSections()
                            prev.sections = v.sections
                        }
                        if (v.coupons > prev.coupons) {
                            window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                            prev.coupons = v.coupons
                        }
                        if (v.orders > prev.orders) {
                            window.dispatchEvent(new CustomEvent('orders-updated'))
                            prev.orders = v.orders
                        }
                        if (v.inquiries > prev.inquiries) {
                            window.dispatchEvent(new CustomEvent('inquiries-updated'))
                            prev.inquiries = v.inquiries
                        }
                    }
                } catch (e) {}
            }

            // Initial version seeding
            checkVersionSync()

            // Run heartbeat check every 6 seconds for rapid real-time updates across all networks
            versionCheckInterval = setInterval(checkVersionSync, 6000)

            handleVisibilityOrFocus = () => {
                if (document.visibilityState === 'visible') {
                    checkVersionSync()
                }
            }
            document.addEventListener('visibilitychange', handleVisibilityOrFocus)
            window.addEventListener('focus', handleVisibilityOrFocus)
            window.addEventListener('online', checkVersionSync)

            const handleAutoplayUpdated = (e) => {
                if (typeof e?.detail?.autoplay === 'boolean') {
                    dispatch(setHeroBannerAutoplay(e.detail.autoplay))
                } else {
                    syncHeroBanners()
                }
            }

            const handleBannersUpdated = (e) => {
                if (Array.isArray(e?.detail?.banners) && e.detail.banners.length > 0) {
                    dispatch(setBanners(e.detail.banners))
                    try {
                        localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(e.detail.banners))
                    } catch {}
                } else {
                    syncHeroBanners()
                }
            }

            window.addEventListener('product-catalog-updated', syncProductCatalog)
            window.addEventListener('category-catalog-updated', syncCategoryCatalog)
            window.addEventListener('homepage-sections-updated', syncHomepageSections)
            window.addEventListener('hero-banners-updated', handleBannersUpdated)
            window.addEventListener('hero-banner-autoplay-updated', handleAutoplayUpdated)
            window.addEventListener('hero-promotions-updated', syncHeroPromotions)
            window.addEventListener('storage', (e) => {
                if (e.key === 'ukbl_categories_synced') syncCategoryCatalog()
                if (e.key === 'ukbl_products_synced') syncProductCatalog()
                if (e.key === 'ukbl_sections_synced') syncHomepageSections()
                if (e.key === 'ukbl_banners_synced') syncHeroBanners()
                if (e.key === 'ukbl_cached_hero_banner_settings' || e.key === 'ukbl_hero_banner_autoplay') {
                    try {
                        const parsed = JSON.parse(e.newValue || '{}')
                        if (typeof parsed?.autoplay === 'boolean') {
                            dispatch(setHeroBannerAutoplay(parsed.autoplay))
                        } else {
                            syncHeroBanners()
                        }
                    } catch {
                        syncHeroBanners()
                    }
                }
                if (e.key === 'ukbl_promotions_synced') syncHeroPromotions()
                if (e.key === 'ukbl_coupons_synced') {
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                }
            })
            try {
                const bc = new BroadcastChannel('ukbl_catalog_channel')
                bc.onmessage = (msg) => {
                    if (msg.data?.type === 'hero-banner-autoplay-updated') {
                        if (typeof msg.data?.autoplay === 'boolean') {
                            dispatch(setHeroBannerAutoplay(msg.data.autoplay))
                            try {
                                localStorage.setItem('ukbl_cached_hero_banner_settings', JSON.stringify({ autoplay: msg.data.autoplay, delay: 5000 }))
                            } catch {}
                        } else {
                            syncHeroBanners()
                        }
                    }
                    if (msg.data?.type === 'promotions-updated' && msg.data?.promotions) {
                        dispatch(setPromotions(msg.data.promotions))
                        try {
                            localStorage.setItem('ukbl_cached_promotions', JSON.stringify(msg.data.promotions))
                        } catch {}
                    }
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
                    if (msg.data?.type === 'category-updated' || msg.data?.type === 'category-catalog-updated') {
                        syncCategoryCatalog()
                        syncProductCatalog()
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

                            // Smart Merge: combine products, taking max quantity (strictly for existing products)
                            const validProductIds = new Set((productsList || []).map(p => p.id))
                            const mergedItems = {}
                            for (const [prodId, qty] of Object.entries(dbCartItems)) {
                                if ((!isProductsLoaded || validProductIds.has(prodId)) && typeof qty === 'number' && qty > 0) {
                                    mergedItems[prodId] = qty
                                }
                            }
                            for (const [prodId, qty] of Object.entries(localCartItems)) {
                                if ((!isProductsLoaded || validProductIds.has(prodId)) && typeof qty === 'number' && qty > 0) {
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
            if (typeof unsubscribeRealtime === 'function') unsubscribeRealtime()
            if (versionCheckInterval) clearInterval(versionCheckInterval)
            if (typeof window !== 'undefined') {
                document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
                window.removeEventListener('focus', handleVisibilityOrFocus)
                window.removeEventListener('online', checkVersionSync)
            }
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

