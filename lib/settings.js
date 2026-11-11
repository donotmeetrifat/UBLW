import prisma, { isDatabaseConfigured } from '@/lib/prisma';

export const DEFAULT_DELIVERY_SETTINGS = {
    insideDhaka: 80,
    outsideDhaka: 150,
    isFreeDeliveryEnabled: false,
    freeDeliveryThreshold: 0,
};

export const DEFAULT_PAYMENT_SETTINGS = {
    cod: {
        enabled: true,
        label: 'Cash on Delivery',
        sub: 'Pay cash upon product inspection (Nationwide)',
    },
    bkash: {
        enabled: true,
        label: 'bKash Send Money',
        number: '01959-524393',
        type: 'Personal',
        sub: '01959-524393 (Personal Account)',
        instructions: 'Please Send Money to our official bKash Personal account. Enter your Transaction ID (TrxID) below for instant verification.',
        qrCode: '', // QR Code image URL or base64
    },
    nagad: {
        enabled: true,
        label: 'Nagad Wallet',
        number: '01959-524393',
        type: 'Personal',
        sub: '01959-524393 (Personal Account)',
        instructions: 'Please Send Money to our official Nagad Personal account. Enter your Transaction ID (TrxID) below for instant verification.',
        qrCode: '', // QR Code image URL or base64
    },
    card: {
        enabled: true,
        label: 'Debit / Credit Card',
        sub: 'Visa, Mastercard & online banking',
        instructions: 'Card payment & online banking support. Our beauty concierge will provide direct SSL secure checkout links upon order confirmation.',
    },
};

// In-memory cache for ultra-fast response and local fallback
let memorySettingsCache = {
    delivery: { ...DEFAULT_DELIVERY_SETTINGS },
    payments: { ...DEFAULT_PAYMENT_SETTINGS },
    lastFetched: 0,
};

/**
 * Strict, foolproof verification of whether an address is Inside Dhaka Metro
 * or Outside Dhaka (Sub-districts & All other 63 districts of Bangladesh).
 */
export function isInsideDhaka(address) {
    if (!address) return true; // Default fallback to inside Dhaka

    // 1. Explicit user/system zone override
    if (address.zone === 'inside_dhaka' || address.deliveryZone === 'inside_dhaka') {
        return true;
    }
    if (address.zone === 'outside_dhaka' || address.deliveryZone === 'outside_dhaka') {
        return false;
    }

    const region = (address.region || '').trim().toLowerCase();
    const city = (address.city || '').trim().toLowerCase();

    // 2. Any region other than Dhaka division is 100% Outside Dhaka
    if (region && region !== 'dhaka') {
        return false;
    }

    // 3. Known Outside-Dhaka districts/sub-districts within Dhaka Division:
    // In Bangladesh logistics, these sub-districts are charged the outside Dhaka courier rate (150 BDT):
    const outsideDhakaDistricts = [
        'gazipur',
        'narayanganj',
        'savar',
        'tongi',
        'keraniganj',
        'faridpur',
        'gopalganj',
        'kishoreganj',
        'madaripur',
        'manikganj',
        'munshiganj',
        'narsingdi',
        'nawabganj',
        'rajbari',
        'shariatpur',
        'tangail',
    ];

    for (const outDist of outsideDhakaDistricts) {
        if (city.includes(outDist)) {
            return false;
        }
    }

    // 4. Exact Inside-Dhaka City identifications:
    if (
        city === 'dhaka - north' ||
        city === 'dhaka - south' ||
        city === 'dhaka' ||
        city === 'dhaka city' ||
        city === 'dhaka metro' ||
        city === 'dhaka north' ||
        city === 'dhaka south'
    ) {
        return true;
    }

    // 5. If city starts with 'dhaka' and does not match any outside list:
    if (city.startsWith('dhaka')) {
        return true;
    }

    // 6. If city has any other district name, it is outside Dhaka
    if (city && city.length > 0) {
        return false;
    }

    return true;
}

/**
 * Calculate the exact delivery charge according to admin settings and address location
 */
export function calculateDeliveryCharge(address, subtotal = 0, deliverySettings = DEFAULT_DELIVERY_SETTINGS) {
    const settings = { ...DEFAULT_DELIVERY_SETTINGS, ...deliverySettings };

    // 1. If admin turned on 100% free delivery
    if (settings.isFreeDeliveryEnabled || settings.insideDhaka === 0 && settings.outsideDhaka === 0) {
        return 0;
    }

    // 2. If free delivery threshold is met
    if (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold) {
        return 0;
    }

    // 3. Automated check: Inside Dhaka vs Outside Dhaka
    const inside = isInsideDhaka(address);
    if (inside) {
        return Number(settings.insideDhaka) ?? 80;
    } else {
        return Number(settings.outsideDhaka) ?? 150;
    }
}

/**
 * Fetch store settings from DB or in-memory fallback
 */
export async function getStoreSettings() {
    try {
        if (isDatabaseConfigured()) {
            const [deliverySetting, paymentSetting] = await Promise.all([
                prisma.setting.findUnique({ where: { key: 'delivery_settings' } }),
                prisma.setting.findUnique({ where: { key: 'payment_settings' } }),
            ]);

            const delivery = deliverySetting ? JSON.parse(deliverySetting.value) : DEFAULT_DELIVERY_SETTINGS;
            const payments = paymentSetting ? JSON.parse(paymentSetting.value) : DEFAULT_PAYMENT_SETTINGS;

            memorySettingsCache = {
                delivery: { ...DEFAULT_DELIVERY_SETTINGS, ...delivery },
                payments: { ...DEFAULT_PAYMENT_SETTINGS, ...payments },
                lastFetched: Date.now(),
            };

            return memorySettingsCache;
        }
    } catch (error) {
        console.error('Error fetching settings from database:', error);
    }

    return memorySettingsCache;
}

/**
 * Save store settings into DB and update in-memory cache
 */
export async function saveStoreSettings({ delivery, payments }) {
    const updatedDelivery = { ...DEFAULT_DELIVERY_SETTINGS, ...(delivery || {}) };
    const updatedPayments = {
        cod: { ...DEFAULT_PAYMENT_SETTINGS.cod, ...(payments?.cod || {}) },
        bkash: { ...DEFAULT_PAYMENT_SETTINGS.bkash, ...(payments?.bkash || {}) },
        nagad: { ...DEFAULT_PAYMENT_SETTINGS.nagad, ...(payments?.nagad || {}) },
        card: { ...DEFAULT_PAYMENT_SETTINGS.card, ...(payments?.card || {}) },
    };

    // Sanitize delivery numbers
    updatedDelivery.insideDhaka = Math.max(0, Number(updatedDelivery.insideDhaka) || 0);
    updatedDelivery.outsideDhaka = Math.max(0, Number(updatedDelivery.outsideDhaka) || 0);
    updatedDelivery.freeDeliveryThreshold = Math.max(0, Number(updatedDelivery.freeDeliveryThreshold) || 0);
    updatedDelivery.isFreeDeliveryEnabled = Boolean(updatedDelivery.isFreeDeliveryEnabled);

    memorySettingsCache = {
        delivery: updatedDelivery,
        payments: updatedPayments,
        lastFetched: Date.now(),
    };

    if (isDatabaseConfigured()) {
        await Promise.all([
            prisma.setting.upsert({
                where: { key: 'delivery_settings' },
                update: { value: JSON.stringify(updatedDelivery) },
                create: { key: 'delivery_settings', value: JSON.stringify(updatedDelivery) },
            }),
            prisma.setting.upsert({
                where: { key: 'payment_settings' },
                update: { value: JSON.stringify(updatedPayments) },
                create: { key: 'payment_settings', value: JSON.stringify(updatedPayments) },
            }),
        ]);
    }

    return memorySettingsCache;
}

