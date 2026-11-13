import { createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: productDummyData,
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
                // 3. Overlay fresh incoming database products with updated fields while strictly preserving custom benefits & conversion copy
                action.payload.forEach(p => {
                    if (p && p.id) {
                        const existing = map.get(p.id) || {};
                        
                        // Extract non-empty benefits from incoming product
                        let incomingBenefits = [];
                        if (Array.isArray(p.benefits) && p.benefits.length > 0) {
                            incomingBenefits = p.benefits.map(b => (typeof b === 'string' ? b.trim() : String(b || ''))).filter(Boolean);
                        } else if (typeof p.benefits === 'string' && p.benefits.trim()) {
                            try {
                                const parsed = JSON.parse(p.benefits);
                                if (Array.isArray(parsed)) incomingBenefits = parsed.map(b => String(b).trim()).filter(Boolean);
                            } catch {}
                        }

                        // Extract existing non-empty benefits from current state
                        let existingBenefits = [];
                        if (Array.isArray(existing.benefits) && existing.benefits.length > 0) {
                            existingBenefits = existing.benefits.map(b => (typeof b === 'string' ? b.trim() : String(b || ''))).filter(Boolean);
                        }

                        const mergedBenefits = incomingBenefits.length > 0 ? incomingBenefits : existingBenefits;

                        const incomingWhy = (p.whyYouWillLoveIt && String(p.whyYouWillLoveIt).trim().length > 0)
                            ? String(p.whyYouWillLoveIt).trim()
                            : '';
                        const existingWhy = (existing.whyYouWillLoveIt && String(existing.whyYouWillLoveIt).trim().length > 0)
                            ? String(existing.whyYouWillLoveIt).trim()
                            : '';
                        const mergedWhy = incomingWhy || existingWhy;

                        const incomingFormula = (p.formulaProfile && String(p.formulaProfile).trim().length > 0)
                            ? String(p.formulaProfile).trim()
                            : '';
                        const existingFormula = (existing.formulaProfile && String(existing.formulaProfile).trim().length > 0)
                            ? String(existing.formulaProfile).trim()
                            : '';
                        const mergedFormula = incomingFormula || existingFormula || p.description || existing.description || '';

                        map.set(p.id, {
                            ...existing,
                            ...p,
                            benefits: mergedBenefits,
                            whyYouWillLoveIt: mergedWhy,
                            formulaProfile: mergedFormula,
                            description: mergedFormula || p.description || existing.description || ''
                        });
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
            state.list = productDummyData;
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
