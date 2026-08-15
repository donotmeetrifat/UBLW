import { addressDummyData } from '@/assets/assets'
import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [addressDummyData],
    },
    reducers: {
        setAddresses: (state, action) => {
            state.list = action.payload;
        },
        addAddress: (state, action) => {
            state.list.push(action.payload);
            if (typeof window !== 'undefined') {
                localStorage.setItem('savedAddresses', JSON.stringify(state.list));
            }
        },
        updateAddress: (state, action) => {
            const index = state.list.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('savedAddresses', JSON.stringify(state.list));
                }
            }
        },
        removeAddress: (state, action) => {
            state.list = state.list.filter(a => a.id !== action.payload);
            if (typeof window !== 'undefined') {
                localStorage.setItem('savedAddresses', JSON.stringify(state.list));
            }
        },
    }
})

export const { setAddresses, addAddress, updateAddress, removeAddress } = addressSlice.actions

export default addressSlice.reducer