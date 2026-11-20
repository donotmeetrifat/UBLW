import prisma, { isDatabaseConfigured } from './prisma.js';

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
    rocket: {
        enabled: true,
        label: 'Rocket App',
        number: '01959-524393',
        type: 'Personal',
        sub: '01959-524393 (Personal Account)',
        instructions: 'Please Send Money to our official Rocket Personal account. Enter your Transaction ID (TrxID) below for instant verification.',
        qrCode: '', // QR Code image URL or base64
    },
    card: {
        enabled: true,
        label: 'Debit / Credit Card',
        sub: 'Visa, Mastercard & online banking',
        instructions: 'Card payment & online banking support. Our beauty concierge will provide direct SSL secure checkout links upon order confirmation.',
    },
};

export const DEFAULT_WHATSAPP_SETTINGS = {
    phone: '+880 1959-524393',
    raw: '8801959524393',
    url: 'https://wa.me/8801959524393',
};

// In-memory cache for ultra-fast response and local fallback
let memorySettingsCache = {
    delivery: { ...DEFAULT_DELIVERY_SETTINGS },
    payments: { ...DEFAULT_PAYMENT_SETTINGS },
    whatsapp: { ...DEFAULT_WHATSAPP_SETTINGS },
    lastFetched: 0,
};

export function updateMemoryWhatsApp(phone) {
    if (!phone || typeof phone !== 'string') return;
    const cleanDigits = phone.replace(/[^\d]/g, '');
    const raw = cleanDigits.startsWith('880')
        ? cleanDigits
        : cleanDigits.startsWith('0')
            ? `88${cleanDigits}`
            : `880${cleanDigits}`;

    memorySettingsCache.whatsapp = {
        phone: phone.trim(),
        raw: raw || DEFAULT_WHATSAPP_SETTINGS.raw,
        url: `https://wa.me/${raw || DEFAULT_WHATSAPP_SETTINGS.raw}`,
    };
    memorySettingsCache.lastFetched = Date.now();
}

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
    // High-performance server memory cache (30s TTL)
    if (memorySettingsCache.lastFetched && Date.now() - memorySettingsCache.lastFetched < 30000 && memorySettingsCache.delivery) {
        return memorySettingsCache;
    }

    if (isDatabaseConfigured()) {
        try {
            let deliveryRow = null;
            let paymentRow = null;
            let whatsappRow = null;

            if (prisma.setting) {
                try {
                    [deliveryRow, paymentRow, whatsappRow] = await Promise.all([
                        prisma.setting.findUnique({ where: { key: 'delivery_settings' } }),
                        prisma.setting.findUnique({ where: { key: 'payment_settings' } }),
                        prisma.setting.findUnique({ where: { key: 'whatsapp_hotline' } }),
                    ]);
                } catch (prismaErr) {
                    // Fallback to raw query
                }
            }

            if (!deliveryRow && !paymentRow) {
                try {
                    const rows = await prisma.$queryRawUnsafe(`SELECT key, value FROM "Setting" WHERE key IN ('delivery_settings', 'payment_settings', 'whatsapp_hotline')`);
                    if (Array.isArray(rows)) {
                        deliveryRow = rows.find(r => r.key === 'delivery_settings');
                        paymentRow = rows.find(r => r.key === 'payment_settings');
                        whatsappRow = rows.find(r => r.key === 'whatsapp_hotline');
                    }
                } catch (sqlErr) {
                    // ignore raw query error
                }
            }

            const delivery = deliveryRow?.value ? JSON.parse(deliveryRow.value) : null;
            const payments = paymentRow?.value ? JSON.parse(paymentRow.value) : null;

            let liveWhatsapp = { ...DEFAULT_WHATSAPP_SETTINGS };
            if (whatsappRow?.value && whatsappRow.value.trim()) {
                const phone = whatsappRow.value.trim();
                const cleanDigits = phone.replace(/[^\d]/g, '');
                const raw = cleanDigits.startsWith('880')
                    ? cleanDigits
                    : cleanDigits.startsWith('0')
                        ? `88${cleanDigits}`
                        : `880${cleanDigits}`;
                liveWhatsapp = {
                    phone,
                    raw: raw || DEFAULT_WHATSAPP_SETTINGS.raw,
                    url: `https://wa.me/${raw || DEFAULT_WHATSAPP_SETTINGS.raw}`,
                };
            }

            if (delivery || payments || whatsappRow?.value) {
                memorySettingsCache = {
                    delivery: { ...DEFAULT_DELIVERY_SETTINGS, ...(delivery || {}) },
                    payments: { ...DEFAULT_PAYMENT_SETTINGS, ...(payments || {}) },
                    whatsapp: liveWhatsapp,
                    lastFetched: Date.now(),
                };
            }

            return memorySettingsCache;
        } catch (error) {
            console.error('Error fetching settings from database:', error.message);
        }
    }

    return memorySettingsCache;
}

/**
 * Save store settings into DB and update in-memory cache
 */
export async function saveStoreSettings({ delivery, payments, whatsapp }) {
    const updatedDelivery = { ...DEFAULT_DELIVERY_SETTINGS, ...(delivery || {}) };
    const updatedPayments = {
        cod: { ...DEFAULT_PAYMENT_SETTINGS.cod, ...(payments?.cod || {}) },
        bkash: { ...DEFAULT_PAYMENT_SETTINGS.bkash, ...(payments?.bkash || {}) },
        nagad: { ...DEFAULT_PAYMENT_SETTINGS.nagad, ...(payments?.nagad || {}) },
        rocket: { ...DEFAULT_PAYMENT_SETTINGS.rocket, ...(payments?.rocket || {}) },
        card: { ...DEFAULT_PAYMENT_SETTINGS.card, ...(payments?.card || {}) },
    };

    let updatedWhatsapp = memorySettingsCache.whatsapp || { ...DEFAULT_WHATSAPP_SETTINGS };
    if (whatsapp) {
        const phone = typeof whatsapp === 'string' ? whatsapp.trim() : (whatsapp.phone || '').trim();
        if (phone) {
            const cleanDigits = phone.replace(/[^\d]/g, '');
            const raw = cleanDigits.startsWith('880')
                ? cleanDigits
                : cleanDigits.startsWith('0')
                    ? `88${cleanDigits}`
                    : `880${cleanDigits}`;
            updatedWhatsapp = {
                phone,
                raw: raw || DEFAULT_WHATSAPP_SETTINGS.raw,
                url: `https://wa.me/${raw || DEFAULT_WHATSAPP_SETTINGS.raw}`,
            };
        }
    }

    // Sanitize delivery numbers
    updatedDelivery.insideDhaka = Math.max(0, Number(updatedDelivery.insideDhaka) || 0);
    updatedDelivery.outsideDhaka = Math.max(0, Number(updatedDelivery.outsideDhaka) || 0);
    updatedDelivery.freeDeliveryThreshold = Math.max(0, Number(updatedDelivery.freeDeliveryThreshold) || 0);
    updatedDelivery.isFreeDeliveryEnabled = Boolean(updatedDelivery.isFreeDeliveryEnabled);

    // 1. Immediately update memory cache so all APIs, checkouts, and customer views reflect changes instantly
    memorySettingsCache = {
        delivery: updatedDelivery,
        payments: updatedPayments,
        whatsapp: updatedWhatsapp,
        lastFetched: Date.now(),
    };

    // 2. Persist to PostgreSQL database with dual Prisma + raw SQL fallback
    if (isDatabaseConfigured()) {
        const deliveryJson = JSON.stringify(updatedDelivery);
        const paymentsJson = JSON.stringify(updatedPayments);
        const whatsappPhone = updatedWhatsapp.phone;

        let persisted = false;

        if (prisma.setting) {
            try {
                const upserts = [
                    prisma.setting.upsert({
                        where: { key: 'delivery_settings' },
                        update: { value: deliveryJson },
                        create: { key: 'delivery_settings', value: deliveryJson },
                    }),
                    prisma.setting.upsert({
                        where: { key: 'payment_settings' },
                        update: { value: paymentsJson },
                        create: { key: 'payment_settings', value: paymentsJson },
                    }),
                ];
                if (whatsappPhone) {
                    upserts.push(
                        prisma.setting.upsert({
                            where: { key: 'whatsapp_hotline' },
                            update: { value: whatsappPhone },
                            create: { key: 'whatsapp_hotline', value: whatsappPhone },
                        })
                    );
                }
                await Promise.all(upserts);
                persisted = true;
            } catch (err) {
                console.warn('Prisma setting upsert note, executing direct SQL fallback:', err.message);
            }
        }

        if (!persisted) {
            try {
                const sqlOps = [
                    prisma.$executeRawUnsafe(
                        `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                        'delivery_settings',
                        deliveryJson
                    ),
                    prisma.$executeRawUnsafe(
                        `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                        'payment_settings',
                        paymentsJson
                    ),
                ];
                if (whatsappPhone) {
                    sqlOps.push(
                        prisma.$executeRawUnsafe(
                            `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                            'whatsapp_hotline',
                            whatsappPhone
                        )
                    );
                }
                await Promise.all(sqlOps);
                persisted = true;
            } catch (sqlErr) {
                console.error('Direct SQL setting persistence error:', sqlErr.message);
            }
        }
    }

    return memorySettingsCache;
}

