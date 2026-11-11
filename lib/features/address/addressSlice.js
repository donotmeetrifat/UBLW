import { addressDummyData } from '@/assets/assets'
import { createSlice } from '@reduxjs/toolkit'

const normalizeAddress = (addr) => {
    if (!addr) return addr;
    const fullName = addr.fullName || addr.name || '';
    const phoneNumber = addr.phoneNumber || addr.phone || '';
    const street = addr.address || addr.street || '';
    const region = addr.region || addr.state || 'Dhaka';
    return {
        ...addr,
        fullName,
        name: fullName,
        phoneNumber,
        phone: phoneNumber,
        address: street,
        street,
        region,
        state: region,
    };
};

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [normalizeAddress(addressDummyData)],
    },
    reducers: {
        setAddresses: (state, action) => {
            state.list = Array.isArray(action.payload) ? action.payload.map(normalizeAddress) : [];
        },
        addAddress: (state, action) => {
            const normalized = normalizeAddress(action.payload);
            state.list.push(normalized);
            if (typeof window !== 'undefined') {
                localStorage.setItem('savedAddresses', JSON.stringify(state.list));
            }
        },
        updateAddress: (state, action) => {
            const normalized = normalizeAddress(action.payload);
            const index = state.list.findIndex(a => a.id === normalized.id);
            if (index !== -1) {
                state.list[index] = normalized;
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