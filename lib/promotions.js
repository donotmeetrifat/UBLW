import prisma, { isDatabaseConfigured } from './prisma.js';

export const DEFAULT_PROMOTIONS = {
    mainCard: {
        id: 'main-promo-card',
        badge: '100% Original UK Imports',
        title: 'Curated UK Beauty.',
        titleHighlight: 'Delivered in Bangladesh.',
        description: 'Authentic dermatological skincare, cult cosmetics, and hair perfectors imported directly from the UK.',
        priceLabel: 'Prices start at',
        priceValue: '1,650',
        buttonText: 'Explore Collection',
        buttonLink: '/shop',
        image: '/images/hero/hero_card_img1.png',
        imageAlt: 'Curated UK Beauty - Delivered in Bangladesh',
        isActive: true
    },
    sideCardTop: {
        id: 'side-promo-top',
        tag: 'TOP SELECTED',
        title: 'Skincare',
        buttonText: 'Shop Skincare',
        buttonLink: '/shop?category=Skincare',
        image: '/images/hero/hero_card_img2.png',
        imageAlt: 'Skincare Top Selected',
        isActive: true
    },
    sideCardBottom: {
        id: 'side-promo-bottom',
        tag: 'EXCLUSIVE DEALS',
        title: 'Cosmetics',
        buttonText: 'Shop Makeup',
        buttonLink: '/shop?category=Makeup',
        image: '/images/hero/hero_card_img3.png',
        imageAlt: 'Cosmetics Exclusive Deals',
        isActive: true
    }
};

let memoryPromotionsCache = { ...DEFAULT_PROMOTIONS };
let lastFetchedAt = 0;

/**
 * Fetch promotional cards configuration from database or memory cache
 */
export async function getPromotions() {
    if (isDatabaseConfigured()) {
        try {
            let row = null;

            if (prisma.setting) {
                try {
                    row = await prisma.setting.findUnique({
                        where: { key: 'hero_promotions' }
                    });
                } catch (prismaErr) {
                    // Fallback to raw query
                }
            }

            if (!row) {
                try {
                    const rows = await prisma.$queryRawUnsafe(
                        `SELECT key, value FROM "Setting" WHERE key = 'hero_promotions' LIMIT 1`
                    );
                    if (Array.isArray(rows) && rows.length > 0) {
                        row = rows[0];
                    }
                } catch (sqlErr) {
                    // Ignore raw query error
                }
            }

            if (row?.value) {
                try {
                    const parsed = JSON.parse(row.value);
                    if (parsed && typeof parsed === 'object') {
                        memoryPromotionsCache = {
                            mainCard: {
                                ...DEFAULT_PROMOTIONS.mainCard,
                                ...(parsed.mainCard || {})
                            },
                            sideCardTop: {
                                ...DEFAULT_PROMOTIONS.sideCardTop,
                                ...(parsed.sideCardTop || {})
                            },
                            sideCardBottom: {
                                ...DEFAULT_PROMOTIONS.sideCardBottom,
                                ...(parsed.sideCardBottom || {})
                            }
                        };
                        lastFetchedAt = Date.now();
                    }
                } catch (jsonErr) {
                    console.error('Failed to parse hero_promotions JSON:', jsonErr.message);
                }
            }
        } catch (error) {
            console.error('Error fetching hero promotions from database:', error.message);
        }
    }

    return memoryPromotionsCache;
}

/**
 * Save promotional cards into PostgreSQL database and update server memory cache
 */
export async function savePromotions(incoming = {}) {
    const sanitizeCard = (card, defaultCard) => {
        if (!card || typeof card !== 'object') return { ...defaultCard };
        return {
            ...defaultCard,
            ...card,
            title: typeof card.title === 'string' ? card.title.trim() : defaultCard.title,
            image: typeof card.image === 'string' && card.image.trim() ? card.image.trim() : defaultCard.image,
            buttonText: typeof card.buttonText === 'string' ? card.buttonText.trim() : defaultCard.buttonText,
            buttonLink: typeof card.buttonLink === 'string' ? card.buttonLink.trim() : defaultCard.buttonLink,
            isActive: card.isActive !== false
        };
    };

    const sanitized = {
        mainCard: sanitizeCard(incoming.mainCard, DEFAULT_PROMOTIONS.mainCard),
        sideCardTop: sanitizeCard(incoming.sideCardTop, DEFAULT_PROMOTIONS.sideCardTop),
        sideCardBottom: sanitizeCard(incoming.sideCardBottom, DEFAULT_PROMOTIONS.sideCardBottom)
    };

    // 1. Immediately update in-memory cache for 0ms server response
    memoryPromotionsCache = sanitized;
    lastFetchedAt = Date.now();

    // 2. Persist to PostgreSQL database
    if (isDatabaseConfigured()) {
        const jsonValue = JSON.stringify(sanitized);
        let persisted = false;

        if (prisma.setting) {
            try {
                await prisma.setting.upsert({
                    where: { key: 'hero_promotions' },
                    update: { value: jsonValue },
                    create: { key: 'hero_promotions', value: jsonValue }
                });
                persisted = true;
            } catch (err) {
                console.warn('Prisma setting upsert note for hero_promotions, attempting raw SQL:', err.message);
            }
        }

        if (!persisted) {
            try {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                    'hero_promotions',
                    jsonValue
                );
                persisted = true;
            } catch (sqlErr) {
                console.error('Direct SQL hero_promotions persistence error:', sqlErr.message);
            }
        }
    }

    return memoryPromotionsCache;
}
