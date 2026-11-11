import { createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: productDummyData,
    },
    reducers: {
        setProduct: (state, action) => {
            if (Array.isArray(action.payload) && action.payload.length > 0) {
                const map = new Map();
                // Keep dummy products as baseline fallback
                productDummyData.forEach(p => {
                    if (p && p.id) map.set(p.id, p);
                });
                // Overlay fresh database products
                action.payload.forEach(p => {
                    if (p && p.id) {
                        map.set(p.id, { ...(map.get(p.id) || {}), ...p });
                    }
                });
                state.list = Array.from(map.values());
            }
        },
        clearProduct: (state) => {
            state.list = productDummyData;
        }
    }
})

export const { setProduct, clearProduct } = productSlice.actions
export default productSlice.reducer
