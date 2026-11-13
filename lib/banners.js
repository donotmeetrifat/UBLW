import prisma, { isDatabaseConfigured } from './prisma.js';

export const DEFAULT_HERO_BANNERS = [
    {
        id: 'hero-banner-1',
        title: 'Welcome to Radiant You',
        subtitle: 'Where beauty meets care! Discover the finest in skincare and haircare',
        image: '/banner/1.png',
        imageAlt: 'UK Brand Lover curated skincare banner 1',
        link: '/shop',
        isActive: true,
        displayOrder: 1
    },
    {
        id: 'hero-banner-2',
        title: 'Authentic UK Dermatological Skincare',
        subtitle: 'Clinically proven formulas from trusted UK laboratories',
        image: '/banner/2.jpg',
        imageAlt: 'UK Brand Lover luxury skincare banner 2',
        link: '/shop?category=Skincare',
        isActive: true,
        displayOrder: 2
    },
    {
        id: 'hero-banner-3',
        title: 'Cult Cosmetics & Glamour',
        subtitle: 'Original British beauty directly imported for you',
        image: '/banner/3.jpg',
        imageAlt: 'UK Brand Lover premium beauty banner 3',
        link: '/shop?category=Makeup',
        isActive: true,
        displayOrder: 3
    },
    {
        id: 'hero-banner-4',
        title: 'Restorative Haircare Essentials',
        subtitle: 'Revitalize and nourish with certified salon treatments',
        image: '/banner/4.jpg',
        imageAlt: 'UK Brand Lover authentic cosmetics banner 4',
        link: '/shop?category=Haircare',
        isActive: true,
        displayOrder: 4
    },
    {
        id: 'hero-banner-5',
        title: 'Direct London Shipments',
        subtitle: 'Verified batch codes & authentic UK store packaging',
        image: '/banner/5.jpg',
        imageAlt: 'UK Brand Lover direct UK imports banner 5',
        link: '/shop',
        isActive: true,
        displayOrder: 5
    },
    {
        id: 'hero-banner-6',
        title: 'Dermatologically Tested Daily Care',
        subtitle: 'Gentle hydration tailored for sensitive skin',
        image: '/banner/6.jpg',
        imageAlt: 'UK Brand Lover hair repair treatment banner 6',
        link: '/shop',
        isActive: true,
        displayOrder: 6
    },
    {
        id: 'hero-banner-7',
        title: 'Signature Fragrances & Body Mist',
        subtitle: 'Long-lasting luxury scents crafted in the UK',
        image: '/banner/7.jpg',
        imageAlt: 'UK Brand Lover luxury fragrance banner 7',
        link: '/shop?category=Fragrance',
        isActive: true,
        displayOrder: 7
    },
    {
        id: 'hero-banner-8',
        title: 'Exclusive Deals & Festive Bundles',
        subtitle: 'Save up to 25% on selected premium sets',
        image: '/banner/8.jpg',
        imageAlt: 'UK Brand Lover beauty deals banner 8',
        link: '/shop',
        isActive: true,
        displayOrder: 8
    }
];

let memoryBannersCache = [...DEFAULT_HERO_BANNERS];
let lastFetchedAt = 0;

export const DEFAULT_BANNER_SETTINGS = {
    autoplay: true,
    delay: 5000
};

let memoryBannerSettings = { ...DEFAULT_BANNER_SETTINGS };
let lastSettingsFetchedAt = 0;

/**
 * Fetch hero banner slider settings (autoplay, delay) from database
 */
export async function getHeroBannerSettings() {
    if (isDatabaseConfigured()) {
        try {
            let row = null;
            if (prisma.setting) {
                try {
                    row = await prisma.setting.findUnique({
                        where: { key: 'hero_banners_settings' }
                    });
                } catch (prismaErr) {}
            }

            if (!row) {
                try {
                    const rows = await prisma.$queryRawUnsafe(
                        `SELECT key, value FROM "Setting" WHERE key = 'hero_banners_settings' LIMIT 1`
                    );
                    if (Array.isArray(rows) && rows.length > 0) {
                        row = rows[0];
                    }
                } catch (sqlErr) {}
            }

            if (row?.value) {
                try {
                    const parsed = JSON.parse(row.value);
                    if (parsed && typeof parsed === 'object') {
                        memoryBannerSettings = {
                            autoplay: parsed.autoplay !== false && parsed.autoplay !== 'false',
                            delay: Number(parsed.delay) || 5000
                        };
                        lastSettingsFetchedAt = Date.now();
                    }
                } catch (jsonErr) {}
            }
        } catch (error) {
            console.error('Error fetching hero banner settings:', error.message);
        }
    }

    return memoryBannerSettings;
}

/**
 * Save hero banner slider settings (autoplay, delay) to database and server cache
 */
export async function saveHeroBannerSettings(settings = {}) {
    const autoplay = settings.autoplay !== false && settings.autoplay !== 'false' && settings.autoplay !== 0;
    const delay = Number(settings.delay) || 5000;

    memoryBannerSettings = { autoplay, delay };
    lastSettingsFetchedAt = Date.now();

    if (isDatabaseConfigured()) {
        const jsonValue = JSON.stringify(memoryBannerSettings);
        let persisted = false;

        if (prisma.setting) {
            try {
                await prisma.setting.upsert({
                    where: { key: 'hero_banners_settings' },
                    update: { value: jsonValue },
                    create: { key: 'hero_banners_settings', value: jsonValue }
                });
                persisted = true;
            } catch (err) {
                console.warn('Prisma setting upsert note for hero_banners_settings:', err.message);
            }
        }

        if (!persisted) {
            try {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                    'hero_banners_settings',
                    jsonValue
                );
                persisted = true;
            } catch (sqlErr) {
                console.error('Direct SQL hero_banners_settings persistence error:', sqlErr.message);
            }
        }
    }

    return memoryBannerSettings;
}

/**
 * Fetch all hero slider banners from database with in-memory caching and baseline fallback
 */
export async function getHeroBanners(onlyActive = false) {
    if (isDatabaseConfigured()) {
        try {
            let row = null;

            if (prisma.setting) {
                try {
                    row = await prisma.setting.findUnique({
                        where: { key: 'hero_banners' }
                    });
                } catch (prismaErr) {
                    // Fallback to raw query
                }
            }

            if (!row) {
                try {
                    const rows = await prisma.$queryRawUnsafe(
                        `SELECT key, value FROM "Setting" WHERE key = 'hero_banners' LIMIT 1`
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
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        memoryBannersCache = parsed.map((item, idx) => ({
                            id: item.id || `banner-${idx + 1}`,
                            title: item.title || '',
                            subtitle: item.subtitle || '',
                            image: item.image || '/banner/1.png',
                            imageAlt: item.imageAlt || item.title || 'UK Brand Lover banner',
                            link: item.link || '',
                            isActive: item.isActive !== false,
                            displayOrder: Number(item.displayOrder) || (idx + 1)
                        })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                        lastFetchedAt = Date.now();
                    }
                } catch (jsonErr) {
                    console.error('Failed to parse hero_banners JSON:', jsonErr.message);
                }
            }
        } catch (error) {
            console.error('Error fetching hero banners from database:', error.message);
        }
    }

    if (onlyActive) {
        return memoryBannersCache.filter(b => b.isActive !== false);
    }

    return memoryBannersCache;
}

/**
 * Save hero slider banners into PostgreSQL database and update server memory cache
 */
export async function saveHeroBanners(bannersList = []) {
    if (!Array.isArray(bannersList)) {
        throw new Error('Invalid banners payload, array expected');
    }

    // Sanitize and ensure consecutive sequential ordering
    const sanitized = bannersList.map((item, idx) => {
        const id = typeof item.id === 'string' && item.id.trim()
            ? item.id.trim()
            : `hero-banner-${Date.now()}-${idx + 1}`;

        return {
            id,
            title: typeof item.title === 'string' ? item.title.trim() : '',
            subtitle: typeof item.subtitle === 'string' ? item.subtitle.trim() : '',
            image: typeof item.image === 'string' && item.image.trim() ? item.image.trim() : '/banner/1.png',
            imageAlt: typeof item.imageAlt === 'string' && item.imageAlt.trim()
                ? item.imageAlt.trim()
                : (item.title || 'UK Brand Lover promotion'),
            link: typeof item.link === 'string' ? item.link.trim() : '',
            isActive: item.isActive !== false,
            displayOrder: Number(item.displayOrder) || (idx + 1)
        };
    }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((item, index) => ({
        ...item,
        displayOrder: index + 1 // Normalizes to 1, 2, 3, 4...
    }));

    // 1. Immediately update in-memory cache for 0ms server response
    memoryBannersCache = sanitized;
    lastFetchedAt = Date.now();

    // 2. Persist to PostgreSQL database
    if (isDatabaseConfigured()) {
        const jsonValue = JSON.stringify(sanitized);
        let persisted = false;

        if (prisma.setting) {
            try {
                await prisma.setting.upsert({
                    where: { key: 'hero_banners' },
                    update: { value: jsonValue },
                    create: { key: 'hero_banners', value: jsonValue }
                });
                persisted = true;
            } catch (err) {
                console.warn('Prisma setting upsert note for hero_banners, attempting direct SQL:', err.message);
            }
        }

        if (!persisted) {
            try {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                    'hero_banners',
                    jsonValue
                );
                persisted = true;
            } catch (sqlErr) {
                console.error('Direct SQL hero_banners persistence error:', sqlErr.message);
            }
        }
    }

    return memoryBannersCache;
}

