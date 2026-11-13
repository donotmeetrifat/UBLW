import { createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: productDummyData,
        categories: [],
        homepageSections: null,
        banners: null,
    },
    reducers: {
        setProduct: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.length > 0) {
                const map = new Map();
                // 1. Retain all currently loaded products in state
                (state.list || []).forEach(p => {
                    if (p && p.id) map.set(p.id, p);
                });
                // 2. Add dummy products as baseline fallback if not already present
                productDummyData.forEach(p => {
                    if (p && p.id && !map.has(p.id)) map.set(p.id, p);
                });
                // 3. Overlay fresh incoming database products with updated fields
                action.payload.forEach(p => {
                    if (p && p.id) {
                        map.set(p.id, { ...(map.get(p.id) || {}), ...p });
                    }
                });
                state.list = Array.from(map.values());
            }
        },
        setCategories: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.length > 0) {
                state.categories = action.payload;
            }
        },
        setHomepageSections: (state, action) => {
            if (action.payload && typeof action.payload === 'object') {
                state.homepageSections = action.payload;
            }
        },
        setBanners: (state, action) => {
            if (Array.isArray(action.payload)) {
                state.banners = action.payload;
            }
        },
        clearProduct: (state) => {
            state.list = productDummyData;
        }
    }
})

export const { setProduct, setCategories, setHomepageSections, setBanners, clearProduct } = productSlice.actions
export default productSlice.reducer
