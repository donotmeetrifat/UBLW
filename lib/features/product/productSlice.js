import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
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
                state.list = action.payload;
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
        }
    }
})

export const { 
    setProduct, 
    setCategories, 
    setHomepageSections, 
    setBanners, 
    setBannerSettings, 
    setHeroBannerAutoplay, 
    setPromotions, 
    clearProduct 
} = productSlice.actions
export default productSlice.reducer
