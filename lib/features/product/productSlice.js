import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        isLoaded: false,
        categories: [],
        homepageSections: null,
        banners: null,
        bannerSettings: {
            autoplay: true,
            delay: 5000,
        },
        promotions: null,
    },
    reducers: {
        setProduct: (state, action) => {
            if (Array.isArray(action.payload)) {
                // Safeguard against accidentally overwriting the full catalog with a single item
                if (action.payload.length === 1 && state.list.length > 1) {
                    const single = action.payload[0];
                    if (single && single.id) {
                        const idx = state.list.findIndex(p => p.id === single.id);
                        if (idx >= 0) {
                            state.list[idx] = { ...state.list[idx], ...single };
                        } else {
                            state.list.unshift(single);
                        }
                    }
                    state.isLoaded = true;
                    return;
                }
                state.list = action.payload;
                state.isLoaded = true;
            }
        },
        upsertProduct: (state, action) => {
            const items = Array.isArray(action.payload) ? action.payload : [action.payload];
            items.forEach(item => {
                if (!item || !item.id) return;
                const idx = state.list.findIndex(p => p.id === item.id);
                if (idx >= 0) {
                    state.list[idx] = { ...state.list[idx], ...item };
                } else {
                    state.list.unshift(item);
                }
            });
            state.isLoaded = true;
        },
        removeProduct: (state, action) => {
            const idToRemove = typeof action.payload === 'object' ? action.payload?.id : action.payload;
            if (idToRemove) {
                state.list = state.list.filter(p => p.id !== idToRemove);
            }
        },
        setCategories: (state, action) => {
            if (Array.isArray(action.payload)) {
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
        setBannerSettings: (state, action) => {
            if (action.payload && typeof action.payload === 'object') {
                state.bannerSettings = {
                    ...state.bannerSettings,
                    ...action.payload
                };
            }
        },
        setHeroBannerAutoplay: (state, action) => {
            if (typeof action.payload === 'boolean') {
                state.bannerSettings = {
                    ...state.bannerSettings,
                    autoplay: action.payload
                };
            }
        },
        setPromotions: (state, action) => {
            if (action.payload && typeof action.payload === 'object') {
                state.promotions = action.payload;
            }
        },
        clearProduct: (state) => {
            state.list = [];
            state.isLoaded = true;
        }
    }
})

export const { 
    setProduct, 
    upsertProduct,
    removeProduct,
    setCategories, 
    setHomepageSections, 
    setBanners, 
    setBannerSettings, 
    setHeroBannerAutoplay, 
    setPromotions, 
    clearProduct 
} = productSlice.actions
export default productSlice.reducer
