import { addressDummyData } from '@/assets/assets'
import { createSlice } from '@reduxjs/toolkit'

export const normalizeAddress = (addr) => {
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
        city: addr.city || 'Dhaka',
        area: addr.area || '',
        isDefault: !!addr.isDefault,
    };
};

const getInitialAddressList = () => {
    if (typeof window === 'undefined') {
        return [normalizeAddress(addressDummyData)];
    }
    try {
        const stored = localStorage.getItem('savedAddresses');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizeAddress);
            }
        }
    } catch (e) {
        console.error('Error loading addresses from localStorage:', e);
    }
    return [normalizeAddress(addressDummyData)];
};

const persistAddressesLocally = (list) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('savedAddresses', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('addresses-updated', { detail: list }));
    } catch (e) {
        console.error('Error persisting addresses:', e);
    }
};

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: getInitialAddressList(),
    },
    reducers: {
        setAddresses: (state, action) => {
            const list = Array.isArray(action.payload) && action.payload.length > 0
                ? action.payload.map(normalizeAddress)
                : [normalizeAddress(addressDummyData)];
            state.list = list;
            persistAddressesLocally(list);
        },

        addAddress: (state, action) => {
            const normalized = normalizeAddress(action.payload);
            if (normalized.isDefault) {
                state.list.forEach(a => a.isDefault = false);
            }
            state.list.push(normalized);
            persistAddressesLocally(state.list);

            // Background server sync
            if (typeof window !== 'undefined') {
                fetch('/api/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(normalized),
                }).catch(() => {});
            }
        },

        updateAddress: (state, action) => {
            const normalized = normalizeAddress(action.payload);
            const index = state.list.findIndex(a => a.id === normalized.id);
            if (index !== -1) {
                if (normalized.isDefault) {
                    state.list.forEach(a => a.isDefault = false);
                }
                state.list[index] = normalized;
                persistAddressesLocally(state.list);

                // Background server sync
                if (typeof window !== 'undefined') {
                    fetch('/api/addresses', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(normalized),
                    }).catch(() => {});
                }
            }
        },

        removeAddress: (state, action) => {
            const idToRemove = action.payload;
            state.list = state.list.filter(a => a.id !== idToRemove);
            if (state.list.length === 0) {
                state.list = [normalizeAddress(addressDummyData)];
            }
            persistAddressesLocally(state.list);

            // Background server sync
            if (typeof window !== 'undefined' && idToRemove) {
                fetch(`/api/addresses?id=${encodeURIComponent(idToRemove)}`, {
                    method: 'DELETE',
                }).catch(() => {});
            }
        },
    }
});

export const { setAddresses, addAddress, updateAddress, removeAddress } = addressSlice.actions;

export default addressSlice.reducer;
