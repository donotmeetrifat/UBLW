import prisma, { isDatabaseConfigured } from './prisma.js';

export const DEFAULT_HOMEPAGE_SECTIONS = {
    newArrivals: {
        enabled: true,
        title: 'New UK Arrivals',
        description: 'Discover the latest authentic UK imported skincare, cult cosmetics, and personal care.',
        displayLimit: 4,
        productIds: []
    },
    bestSelling: {
        enabled: true,
        title: 'Best Selling Beauty',
        description: 'Explore our most-loved UK imported skincare, cosmetics, and haircare essentials.',
        displayLimit: 8,
        productIds: []
    }
};

let memorySectionsCache = {
    ...DEFAULT_HOMEPAGE_SECTIONS,
    lastFetched: 0
};

/**
 * Fetch homepage curated sections configuration from database or cache
 */
export async function getHomepageSections() {
    // High-performance server memory cache (30s TTL)
    if (memorySectionsCache.lastFetched && Date.now() - memorySectionsCache.lastFetched < 30000 && memorySectionsCache.newArrivals) {
        return memorySectionsCache;
    }

    if (isDatabaseConfigured()) {
        try {
            let row = null;

            if (prisma.setting) {
                try {
                    row = await prisma.setting.findUnique({
                        where: { key: 'homepage_sections' }
                    });
                } catch (prismaErr) {
                    // Fallback to raw query below
                }
            }

            if (!row) {
                try {
                    const rows = await prisma.$queryRawUnsafe(
                        `SELECT key, value FROM "Setting" WHERE key = 'homepage_sections' LIMIT 1`
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
                    memorySectionsCache = {
                        newArrivals: {
                            ...DEFAULT_HOMEPAGE_SECTIONS.newArrivals,
                            ...(parsed.newArrivals || {}),
                            productIds: Array.isArray(parsed.newArrivals?.productIds)
                                ? parsed.newArrivals.productIds.filter(Boolean)
                                : []
                        },
                        bestSelling: {
                            ...DEFAULT_HOMEPAGE_SECTIONS.bestSelling,
                            ...(parsed.bestSelling || {}),
                            productIds: Array.isArray(parsed.bestSelling?.productIds)
                                ? parsed.bestSelling.productIds.filter(Boolean)
                                : []
                        },
                        lastFetched: Date.now()
                    };
                } catch (jsonErr) {
                    console.error('Failed to parse homepage_sections JSON:', jsonErr.message);
                }
            }
        } catch (error) {
            console.error('Error fetching homepage sections from database:', error.message);
        }
    }

    return memorySectionsCache;
}

/**
 * Save homepage curated sections configuration into database and memory cache
 */
export async function saveHomepageSections(incomingData = {}) {
    const sanitizeSection = (section, defaultSection) => {
        const productIds = Array.isArray(section?.productIds)
            ? Array.from(new Set(section.productIds.filter(id => typeof id === 'string' && id.trim()).map(id => id.trim())))
            : [];

        return {
            enabled: section?.enabled !== false,
            title: typeof section?.title === 'string' && section.title.trim() ? section.title.trim() : defaultSection.title,
            description: typeof section?.description === 'string' && section.description.trim() ? section.description.trim() : defaultSection.description,
            displayLimit: Math.min(24, Math.max(1, Number(section?.displayLimit) || defaultSection.displayLimit)),
            productIds
        };
    };

    const sanitized = {
        newArrivals: sanitizeSection(incomingData.newArrivals, DEFAULT_HOMEPAGE_SECTIONS.newArrivals),
        bestSelling: sanitizeSection(incomingData.bestSelling, DEFAULT_HOMEPAGE_SECTIONS.bestSelling)
    };

    // 1. Immediately update in-memory cache for 0ms server response
    memorySectionsCache = {
        ...sanitized,
        lastFetched: Date.now()
    };

    // 2. Persist to PostgreSQL database
    if (isDatabaseConfigured()) {
        const jsonValue = JSON.stringify(sanitized);
        let persisted = false;

        if (prisma.setting) {
            try {
                await prisma.setting.upsert({
                    where: { key: 'homepage_sections' },
                    update: { value: jsonValue },
                    create: { key: 'homepage_sections', value: jsonValue }
                });
                persisted = true;
            } catch (err) {
                console.warn('Prisma setting upsert note for homepage_sections, attempting SQL fallback:', err.message);
            }
        }

        if (!persisted) {
            try {
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
                    'homepage_sections',
                    jsonValue
                );
                persisted = true;
            } catch (sqlErr) {
                console.error('Direct SQL homepage_sections persistence error:', sqlErr.message);
            }
        }

        // 3. Keep Product flags (isFeatured & isBestSeller) synchronized in database
        try {
            const newArrivalIds = sanitized.newArrivals.productIds;
            const bestSellerIds = sanitized.bestSelling.productIds;

            if (newArrivalIds.length > 0) {
                await prisma.product.updateMany({
                    where: { id: { in: newArrivalIds } },
                    data: { isFeatured: true }
                }).catch(() => {});
                await prisma.product.updateMany({
                    where: { id: { notIn: newArrivalIds } },
                    data: { isFeatured: false }
                }).catch(() => {});
            } else {
                await prisma.product.updateMany({
                    data: { isFeatured: false }
                }).catch(() => {});
            }

            if (bestSellerIds.length > 0) {
                await prisma.product.updateMany({
                    where: { id: { in: bestSellerIds } },
                    data: { isBestSeller: true }
                }).catch(() => {});
                await prisma.product.updateMany({
                    where: { id: { notIn: bestSellerIds } },
                    data: { isBestSeller: false }
                }).catch(() => {});
            } else {
                await prisma.product.updateMany({
                    data: { isBestSeller: false }
                }).catch(() => {});
            }
        } catch (syncErr) {
            // Non-blocking sync note
        }
    }

    return memorySectionsCache;
}

/**
 * Add or remove a specific product from New Arrivals or Best Selling sections
 */
export async function updateProductHomepagePlacement(productId, { addToNewArrivals, addToBestSelling }) {
    if (!productId) return null;
    const current = await getHomepageSections();
    let newArrivalIds = Array.isArray(current.newArrivals?.productIds) ? [...current.newArrivals.productIds] : [];
    let bestSellingIds = Array.isArray(current.bestSelling?.productIds) ? [...current.bestSelling.productIds] : [];

    if (addToNewArrivals !== undefined) {
        if (addToNewArrivals) {
            if (!newArrivalIds.includes(productId)) {
                newArrivalIds.unshift(productId); // Prioritize at top of New Arrivals
            }
        } else {
            newArrivalIds = newArrivalIds.filter(id => id !== productId);
        }
    }

    if (addToBestSelling !== undefined) {
        if (addToBestSelling) {
            if (!bestSellingIds.includes(productId)) {
                bestSellingIds.unshift(productId); // Prioritize at top of Best Selling
            }
        } else {
            bestSellingIds = bestSellingIds.filter(id => id !== productId);
        }
    }

    const updated = await saveHomepageSections({
        newArrivals: {
            ...current.newArrivals,
            productIds: newArrivalIds
        },
        bestSelling: {
            ...current.bestSelling,
            productIds: bestSellingIds
        }
    });

    return updated;
}

/**
 * Remove product from all homepage sections when deleted
 */
export async function removeProductFromHomepageSections(productId) {
    if (!productId) return null;
    const current = await getHomepageSections();
    const newArrivalIds = (current.newArrivals?.productIds || []).filter(id => id !== productId);
    const bestSellingIds = (current.bestSelling?.productIds || []).filter(id => id !== productId);

    return await saveHomepageSections({
        newArrivals: {
            ...current.newArrivals,
            productIds: newArrivalIds
        },
        bestSelling: {
            ...current.bestSelling,
            productIds: bestSellingIds
        }
    });
}
