import { createSlice } from '@reduxjs/toolkit'

// Helper to compute exact total quantity of products in the bag
export const calculateCartTotal = (cartItems) => {
    if (!cartItems || typeof cartItems !== 'object') return 0;
    return Object.values(cartItems).reduce(
        (sum, qty) => sum + (typeof qty === 'number' && qty > 0 ? qty : 0),
        0
    );
};

// Safe loader from localStorage for instant client initialization
const getInitialCartState = () => {
    if (typeof window === 'undefined') {
        return { total: 0, cartItems: {} };
    }
    try {
        // Enforce: only authenticated users have shopping bag data
        const currentUser = localStorage.getItem('ukbl_current_user');
        if (!currentUser) {
            localStorage.removeItem('ukbl_cart');
            return { total: 0, cartItems: {} };
        }

        const stored = localStorage.getItem('ukbl_cart');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed.cartItems === 'object' && parsed.cartItems !== null) {
                const total = calculateCartTotal(parsed.cartItems);
                return { total, cartItems: parsed.cartItems };
            }
        }
    } catch (e) {
        console.error('Error loading initial cart from localStorage:', e);
    }
    return { total: 0, cartItems: {} };
};

// Safe persistence helper (localStorage + cross-tab event + background server sync)
let syncTimeout = null;
const persistCart = (cartItems, total) => {
    if (typeof window === 'undefined') return;

    // Enforce: strictly do NOT persist cart for unauthenticated visitors
    const currentUser = localStorage.getItem('ukbl_current_user');
    if (!currentUser) {
        localStorage.removeItem('ukbl_cart');
        return;
    }

    try {
        // 1. Instant LocalStorage Persistence
        localStorage.setItem('ukbl_cart', JSON.stringify({ cartItems, total }));

        // 2. Dispatch cross-component and cross-tab custom event
        window.dispatchEvent(new CustomEvent('cart-updated', {
            detail: { cartItems, total }
        }));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }

    // 3. Debounced Background Database Sync to /api/cart
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('ukbl_auth_token') : null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            fetch('/api/cart', {
                method: 'POST',
                headers,
                body: JSON.stringify({ cartItems, total }),
            }).catch(() => {});
        } catch {}
    }, 250);
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: getInitialCartState(),
    reducers: {
        setCart: (state, action) => {
            const payload = action.payload || {};
            const items = (payload.cartItems && typeof payload.cartItems === 'object') 
                ? payload.cartItems 
                : (typeof payload === 'object' && !payload.cartItems ? payload : {});
            
            state.cartItems = items;
            state.total = calculateCartTotal(items);

            persistCart(state.cartItems, state.total);
        },

        sanitizeCartWithProducts: (state, action) => {
            const validProducts = Array.isArray(action.payload) ? action.payload : [];
            // SAFETY: If validProducts is empty (e.g. offline mode or catalog still initializing), DO NOT wipe the cart!
            if (validProducts.length === 0) return;

            const validIdSet = new Set(validProducts.map(p => p.id));
            let changed = false;
            const cleaned = {};
            for (const [id, qty] of Object.entries(state.cartItems || {})) {
                if (validIdSet.has(id) && typeof qty === 'number' && qty > 0) {
                    cleaned[id] = qty;
                } else {
                    changed = true;
                }
            }
            if (changed) {
                state.cartItems = cleaned;
                state.total = calculateCartTotal(cleaned);
                persistCart(state.cartItems, state.total);
            }
        },

        addToCart: (state, action) => {
            const payload = action.payload || {};
            const pid = payload.productId || payload.id;
            if (!pid) return;

            const addQty = typeof payload.quantity === 'number' && payload.quantity > 0 ? payload.quantity : 1;
            if (state.cartItems[pid]) {
                state.cartItems[pid] += addQty;
            } else {
                state.cartItems[pid] = addQty;
            }
            state.total = calculateCartTotal(state.cartItems);

            persistCart(state.cartItems, state.total);
        },

        removeFromCart: (state, action) => {
            const payload = action.payload || {};
            const pid = payload.productId || payload.id;
            if (!pid || !state.cartItems[pid]) return;

            state.cartItems[pid] -= 1;
            if (state.cartItems[pid] <= 0) {
                delete state.cartItems[pid];
            }
            state.total = calculateCartTotal(state.cartItems);

            persistCart(state.cartItems, state.total);
        },

        deleteItemFromCart: (state, action) => {
            const payload = action.payload || {};
            const pid = payload.productId || payload.id;
            if (!pid) return;

            delete state.cartItems[pid];
            state.total = calculateCartTotal(state.cartItems);

            persistCart(state.cartItems, state.total);
        },

        removePurchasedItems: (state, action) => {
            const productIds = Array.isArray(action.payload) ? action.payload : [action.payload];
            for (const pid of productIds) {
                if (pid && state.cartItems[pid] !== undefined) {
                    delete state.cartItems[pid];
                }
            }
            state.total = calculateCartTotal(state.cartItems);
            persistCart(state.cartItems, state.total);
        },

        clearCart: (state) => {
            state.cartItems = {};
            state.total = 0;

            if (typeof window !== 'undefined') {
                try {
                    localStorage.removeItem('ukbl_cart');
                    localStorage.removeItem('ukbl_checkout_data');
                    window.dispatchEvent(new CustomEvent('cart-updated', {
                        detail: { cartItems: {}, total: 0 }
                    }));
                } catch (e) {
                    console.error('Error clearing cart storage:', e);
                }

                // Sync empty cart to database
                try {
                    fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cartItems: {}, total: 0 }),
                    }).catch(() => {});
                } catch {}
            }
        },
    }
});

export const { 
    setCart, 
    sanitizeCartWithProducts,
    addToCart, 
    removeFromCart, 
    deleteItemFromCart, 
    removePurchasedItems,
    clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;
