'use client'

import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setCart, calculateCartTotal } from '@/lib/features/cart/cartSlice'
import { setAddresses } from '@/lib/features/address/addressSlice'
import { setProduct } from '@/lib/features/product/productSlice'

export default function DataSyncProvider({ children }) {
    const dispatch = useDispatch()
    const hasInitializedRef = useRef(false)

    useEffect(() => {
        // Prevent duplicate execution on fast dev re-renders
        if (hasInitializedRef.current) return
        hasInitializedRef.current = true

        // 1. INSTANT 0ms HYDRATION FROM LOCALSTORAGE
        if (typeof window !== 'undefined') {
            try {
                // Hydrate Cart
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
            } catch (e) {
                console.error('Initial storage hydration error:', e)
            }
        }

        // 2. FETCH LIVE PRODUCT CATALOG
        const syncProductCatalog = async () => {
            try {
                const res = await fetch('/api/products')
                const data = await res.json()
                if (data.success && Array.isArray(data.products) && data.products.length > 0) {
                    dispatch(setProduct(data.products))
                }
            } catch (e) {
                // Silent fallback: productDummyData remains active
            }
        }
        syncProductCatalog()

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

    return children
}

