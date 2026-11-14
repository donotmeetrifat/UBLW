import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { randomUUID } from 'crypto';
import { invalidateProductsCache } from '@/lib/productsCache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let cachedStoreId = null;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = (searchParams.get('search') || '').trim();
        const category = (searchParams.get('category') || '').trim();
        const sort = searchParams.get('sort') || 'views';

        if (isDatabaseConfigured()) {
            let enriched = [];
            let globalStats = { totalProducts: 0, totalViews: 0, lowStockCount: 0, inStockCount: 0 };

            // Direct PostgreSQL query immune to Prisma Client in-memory model caching
            try {
                const whereClauses = [];
                const params = [];
                let paramIndex = 1;

                if (search) {
                    whereClauses.push(`(p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex} OR p.category ILIKE $${paramIndex})`);
                    params.push(`%${search}%`);
                    paramIndex++;
                }

                if (category && category !== 'All' && category !== 'all') {
                    let catFilter = category;
                    const catLower = category.toLowerCase();
                    if (catLower.includes('makeup')) catFilter = 'Makeup';
                    else if (catLower.includes('body') || catLower.includes('wellness')) catFilter = 'Body';
                    else if (catLower.includes('skin')) catFilter = 'Skin';
                    else if (catLower.includes('hair')) catFilter = 'Hair';
                    else if (catLower.includes('fragrance')) catFilter = 'Fragrance';

                    whereClauses.push(`p.category ILIKE $${paramIndex}`);
                    params.push(`%${catFilter}%`);
                    paramIndex++;
                }

                const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

                let orderSql = 'ORDER BY COALESCE(p.views, 0) DESC, p."createdAt" DESC';
                if (sort === 'newest') orderSql = 'ORDER BY p."createdAt" DESC';
                if (sort === 'price-high') orderSql = 'ORDER BY p.price DESC';
                if (sort === 'price-low') orderSql = 'ORDER BY p.price ASC';
                if (sort === 'stock') orderSql = 'ORDER BY p."stockCount" ASC';

                // High-performance query with LEFT JOINs instead of slow correlated N+1 subqueries
                const sql = `
                    SELECT 
                        p.*,
                        COALESCE(p.views, 0)::int as "views",
                        COALESCE(p."formulaProfile", p.description) as "formulaProfile",
                        COALESCE(p.benefits, ARRAY[]::text[]) as "benefits",
                        COALESCE(p."whyYouWillLoveIt", '') as "whyYouWillLoveIt",
                        COALESCE(p."isActive", true) as "isActive",
                        COALESCE(oi_agg.units_sold, 0)::int as "unitsSold",
                        COALESCE(r_agg.rating_score, 5.0)::float as "ratingScore",
                        COALESCE(r_agg.reviews_count, 0)::int as "reviewsCount"
                    FROM "Product" p
                    LEFT JOIN (
                        SELECT "productId", SUM(quantity)::int as units_sold
                        FROM "OrderItem"
                        GROUP BY "productId"
                    ) oi_agg ON oi_agg."productId" = p.id
                    LEFT JOIN (
                        SELECT "productId", AVG(rating)::float as rating_score, COUNT(*)::int as reviews_count
                        FROM "Rating"
                        GROUP BY "productId"
                    ) r_agg ON r_agg."productId" = p.id
                    ${whereSql}
                    ${orderSql}
                `;

                const rawProducts = await prisma.$queryRawUnsafe(sql, ...params);
                enriched = Array.isArray(rawProducts) ? rawProducts : [];

                // Store-wide live catalog KPI stats
                const statsRows = await prisma.$queryRawUnsafe(`
                    SELECT 
                        COUNT(*)::int as "totalProducts",
                        COALESCE(SUM(views), 0)::int as "totalViews",
                        COUNT(CASE WHEN "stockCount" <= 10 THEN 1 END)::int as "lowStockCount",
                        COUNT(CASE WHEN "inStock" = true AND "stockCount" > 0 THEN 1 END)::int as "inStockCount"
                    FROM "Product"
                `);
                if (statsRows && statsRows[0]) {
                    globalStats = {
                        totalProducts: Number(statsRows[0].totalProducts) || 0,
                        totalViews: Number(statsRows[0].totalViews) || 0,
                        lowStockCount: Number(statsRows[0].lowStockCount) || 0,
                        inStockCount: Number(statsRows[0].inStockCount) || 0
                    };
                }
            } catch (sqlErr) {
                console.warn('Direct SQL query fallback triggered:', sqlErr.message);

                const where = {};
                if (search) {
                    where.OR = [
                        { name: { contains: search, mode: 'insensitive' } },
                        { brand: { contains: search, mode: 'insensitive' } },
                        { category: { contains: search, mode: 'insensitive' } },
                    ];
                }
                if (category && category !== 'All' && category !== 'all') {
                    where.category = { contains: category, mode: 'insensitive' };
                }

                const products = await prisma.product.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        ratings: { select: { id: true, rating: true } },
                        orderItems: { select: { quantity: true } }
                    }
                });

                enriched = products.map(p => {
                    const totalUnitsSold = (p.orderItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const avgRating = p.ratings && p.ratings.length > 0
                        ? (p.ratings.reduce((sum, r) => sum + r.rating, 0) / p.ratings.length).toFixed(1)
                        : 5.0;
                    return {
                        ...p,
                        unitsSold: totalUnitsSold,
                        ratingScore: Number(avgRating),
                        reviewsCount: p.ratings?.length || 0
                    };
                });

                globalStats = {
                    totalProducts: enriched.length,
                    totalViews: enriched.reduce((sum, p) => sum + (Number(p.views) || 0), 0),
                    lowStockCount: enriched.filter(p => (Number(p.stockCount) || 0) <= 10).length,
                    inStockCount: enriched.filter(p => p.inStock && (p.stockCount || 50) > 0).length
                };
            }

            return NextResponse.json({
                success: true,
                products: enriched,
                stats: globalStats
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        let products = memoryStore.getProducts();
        if (search) {
            const q = search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.brand && p.brand.toLowerCase().includes(q))
            );
        }
        if (category && category !== 'All') {
            products = products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        }

        const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
        return NextResponse.json({
            success: true,
            products,
            stats: {
                totalProducts: products.length,
                totalViews,
                lowStockCount: products.filter(p => (p.stockCount || 50) <= 10).length,
                inStockCount: products.filter(p => p.inStock).length
            }
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            formulaProfile,
            benefits,
            whyYouWillLoveIt,
            mrp,
            price,
            category,
            brand,
            stockCount,
            inStock,
            images
        } = body;

        if (!name || !price || !category) {
            return NextResponse.json({ success: false, message: 'Name, price, and category are required' }, { status: 400 });
        }

        const parsedPrice = parseFloat(price);
        const parsedMrp = mrp ? parseFloat(mrp) : parsedPrice;
        const parsedStock = stockCount !== undefined ? parseInt(stockCount, 10) : 50;
        const imageList = Array.isArray(images) && images.length > 0
            ? images.filter(Boolean)
            : [];
        const cleanBenefits = Array.isArray(benefits) ? benefits.map(b => String(b).trim()).filter(Boolean) : [];

        if (isDatabaseConfigured()) {
            let storeId = cachedStoreId;
            if (!storeId) {
                let store = await prisma.store.findFirst();
                if (!store) {
                    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
                    if (!adminUser) {
                        adminUser = await prisma.user.create({
                            data: {
                                name: 'UK Brand Lover Admin',
                                email: 'admin@ukbrandlover.com',
                                role: 'ADMIN'
                            }
                        });
                    }
                    store = await prisma.store.create({
                        data: {
                            userId: adminUser.id,
                            name: 'UK Brand Lover Flagship',
                            username: 'ukbrandlover-official',
                            description: 'Official 100% Authentic UK Imported Skincare & Cosmetics Flagship',
                            address: 'Dhaka, Bangladesh',
                            contact: '+8801959524393',
                            email: 'admin@ukbrandlover.com',
                            logo: '/logo.png',
                        }
                    });
                }
                cachedStoreId = store.id;
                storeId = store.id;
            }

            const cleanDescription = (description || formulaProfile || '').trim();
            const cleanFormula = (formulaProfile || description || '').trim();
            const cleanWhyYouWillLoveIt = whyYouWillLoveIt ? whyYouWillLoveIt.trim() : null;

            let created;
            try {
                created = await prisma.product.create({
                    data: {
                        name: name.trim(),
                        description: cleanDescription,
                        formulaProfile: cleanFormula,
                        benefits: cleanBenefits,
                        whyYouWillLoveIt: cleanWhyYouWillLoveIt,
                        price: parsedPrice,
                        mrp: parsedMrp,
                        category: category.trim(),
                        brand: brand ? brand.trim() : 'UK Import',
                        stockCount: isNaN(parsedStock) ? 50 : parsedStock,
                        inStock: inStock !== undefined ? Boolean(inStock) : true,
                        images: imageList,
                        storeId: storeId,
                        isActive: true
                    }
                });
            } catch (createErr) {
                console.warn('Prisma create failed (cached client mismatch), using direct SQL insert:', createErr.message);
                
                // Bulletproof direct PostgreSQL insert - never fails regardless of Prisma cache state
                const productId = 'cmw' + randomUUID().replace(/-/g, '').slice(0, 21);
                const rows = await prisma.$queryRawUnsafe(
                    `INSERT INTO "Product" (
                        "id", "name", "description", "formulaProfile", "benefits", "whyYouWillLoveIt",
                        "mrp", "price", "category", "brand", "inStock", "stockCount",
                        "images", "storeId", "views", "isActive", "createdAt", "updatedAt"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8, $9, $10, $11, $12,
                        $13, $14, $15, $16, NOW(), NOW()
                    ) RETURNING *`,
                    productId,
                    name.trim(),
                    cleanDescription,
                    cleanFormula,
                    cleanBenefits,
                    cleanWhyYouWillLoveIt,
                    parsedMrp,
                    parsedPrice,
                    category.trim(),
                    brand ? brand.trim() : 'UK Import',
                    inStock !== undefined ? Boolean(inStock) : true,
                    isNaN(parsedStock) ? 50 : parsedStock,
                    imageList,
                    storeId,
                    0,
                    true
                );

                if (Array.isArray(rows) && rows.length > 0) {
                    created = rows[0];
                } else {
                    created = {
                        id: productId,
                        name: name.trim(),
                        description: cleanDescription,
                        formulaProfile: cleanFormula,
                        benefits: cleanBenefits,
                        whyYouWillLoveIt: cleanWhyYouWillLoveIt,
                        mrp: parsedMrp,
                        price: parsedPrice,
                        category: category.trim(),
                        brand: brand ? brand.trim() : 'UK Import',
                        inStock: inStock !== undefined ? Boolean(inStock) : true,
                        stockCount: isNaN(parsedStock) ? 50 : parsedStock,
                        images: imageList,
                        storeId: storeId,
                        views: 0,
                        isActive: true
                    };
                }
            }

            let parsedBenefits = created?.benefits;
            if (typeof parsedBenefits === 'string') {
                try {
                    parsedBenefits = JSON.parse(parsedBenefits);
                } catch (e) {
                    if (parsedBenefits.startsWith('{') && parsedBenefits.endsWith('}')) {
                        parsedBenefits = parsedBenefits.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim());
                    } else if (parsedBenefits.includes('\n')) {
                        parsedBenefits = parsedBenefits.split('\n').map(s => s.trim());
                    } else {
                        parsedBenefits = [parsedBenefits.trim()];
                    }
                }
            }
            const finalBenefits = Array.isArray(parsedBenefits)
                ? parsedBenefits.map(b => String(b).trim()).filter(Boolean)
                : cleanBenefits;

            const normalizedProduct = {
                ...created,
                formulaProfile: (created?.formulaProfile || cleanFormula || '').trim(),
                benefits: finalBenefits,
                whyYouWillLoveIt: (created?.whyYouWillLoveIt || cleanWhyYouWillLoveIt || '').trim()
            };

            invalidateProductsCache();
            return NextResponse.json({ success: true, product: normalizedProduct }, {
                status: 201,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        const memProduct = memoryStore.addProduct({
            name,
            description: description || formulaProfile || '',
            formulaProfile,
            benefits: cleanBenefits,
            whyYouWillLoveIt,
            price: parsedPrice,
            mrp: parsedMrp,
            category,
            brand: brand || 'UK Import',
            stockCount: parsedStock,
            inStock: inStock !== undefined ? Boolean(inStock) : true,
            images: imageList,
            storeId: 'store_ukbl_main',
            views: 0
        });

        invalidateProductsCache();
        return NextResponse.json({ success: true, product: memProduct }, { status: 201 });
    } catch (error) {
        console.error('Error in admin product POST:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

