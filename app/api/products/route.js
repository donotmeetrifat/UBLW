import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const inStock = searchParams.get('inStock');
        const sortBy = searchParams.get('sortBy') || 'featured';

        if (isDatabaseConfigured()) {
            const where = {};
            if (category && category !== 'All' && category !== 'all') {
                where.category = { contains: category, mode: 'insensitive' };
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (inStock === 'true') {
                where.inStock = true;
            }

            let orderBy = { createdAt: 'desc' };
            if (sortBy === 'price-low-high' || sortBy === 'price_asc') orderBy = { price: 'asc' };
            if (sortBy === 'price-high-low' || sortBy === 'price_desc') orderBy = { price: 'desc' };
            if (sortBy === 'rating') orderBy = { createdAt: 'desc' };

            let products = [];
            try {
                products = await prisma.product.findMany({
                    where,
                    orderBy,
                    include: { ratings: { select: { rating: true } } },
                });
            } catch (queryErr) {
                console.warn('Prisma findMany query note, using direct SQL fallback:', queryErr.message);
                products = await prisma.$queryRawUnsafe(`
                    SELECT p.*,
                        COALESCE(p.views, 0)::int as "views",
                        COALESCE(p."formulaProfile", p.description) as "formulaProfile",
                        COALESCE(p.benefits, ARRAY[]::text[]) as "benefits",
                        COALESCE(p."whyYouWillLoveIt", '') as "whyYouWillLoveIt",
                        COALESCE(p."isActive", true) as "isActive"
                    FROM "Product" p
                    ORDER BY p."createdAt" DESC
                `);
            }

            // ALWAYS enrich from raw SQL to guarantee that benefits, whyYouWillLoveIt, and formulaProfile
            // are 100% populated directly from PostgreSQL columns, completely immune to any Prisma Client model caching
            try {
                const rawRows = await prisma.$queryRawUnsafe(`
                    SELECT 
                        p.id,
                        COALESCE(p.benefits, ARRAY[]::text[]) as "benefits",
                        COALESCE(p."whyYouWillLoveIt", '') as "whyYouWillLoveIt",
                        COALESCE(p."formulaProfile", p.description) as "formulaProfile"
                    FROM "Product" p
                `);
                if (Array.isArray(rawRows) && rawRows.length > 0) {
                    const rawMap = new Map();
                    rawRows.forEach(r => rawMap.set(r.id, r));
                    products = (products || []).map(p => {
                        const raw = rawMap.get(p.id);
                        if (!raw) return p;
                        const hasRawBenefits = raw.benefits && Array.isArray(raw.benefits) && raw.benefits.length > 0;
                        const hasRawWhy = raw.whyYouWillLoveIt && String(raw.whyYouWillLoveIt).trim().length > 0;
                        const hasRawFormula = raw.formulaProfile && String(raw.formulaProfile).trim().length > 0;
                        return {
                            ...p,
                            benefits: hasRawBenefits ? raw.benefits : p.benefits,
                            whyYouWillLoveIt: hasRawWhy ? String(raw.whyYouWillLoveIt).trim() : p.whyYouWillLoveIt,
                            formulaProfile: hasRawFormula ? String(raw.formulaProfile).trim() : p.formulaProfile
                        };
                    });
                }
            } catch (rawErr) {
                console.warn('Raw SQL bulk enrichment note:', rawErr.message);
            }

            const normalized = (products || []).map(p => {
                let parsedBenefits = p.benefits;
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
                const cleanBenefits = Array.isArray(parsedBenefits)
                    ? parsedBenefits.map(b => (typeof b === 'string' ? b.trim() : String(b || ''))).filter(Boolean)
                    : [];

                const cleanWhy = (p.whyYouWillLoveIt && String(p.whyYouWillLoveIt).trim().length > 0)
                    ? String(p.whyYouWillLoveIt).trim()
                    : '';

                const cleanFormula = (p.formulaProfile && String(p.formulaProfile).trim().length > 0)
                    ? String(p.formulaProfile).trim()
                    : (p.description || '').trim();

                return {
                    ...p,
                    formulaProfile: cleanFormula,
                    benefits: cleanBenefits,
                    whyYouWillLoveIt: cleanWhy
                };
            });

            return NextResponse.json({ success: true, products: normalized }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Surrogate-Control': 'no-store',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store'
                }
            });
        }

        // Graceful In-Memory fallback
        let products = memoryStore.getProducts();

        if (category && category !== 'All' && category !== 'all') {
            products = products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            const query = search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                (p.brand && p.brand.toLowerCase().includes(query))
            );
        }
        if (inStock === 'true') {
            products = products.filter(p => p.inStock);
        }

        if (sortBy === 'price-low-high' || sortBy === 'price_asc') {
            products = [...products].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high-low' || sortBy === 'price_desc') {
            products = [...products].sort((a, b) => b.price - a.price);
        }

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch products', error: error.message },
            { status: 500 }
        );
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
            images,
            category,
            brand,
            inStock,
            stockCount
        } = body;

        if (!name || !price || !category) {
            return NextResponse.json(
                { success: false, message: 'Name, price, and category are required' },
                { status: 400 }
            );
        }

        const cleanFormula = (formulaProfile || description || '').trim();
        const cleanWhy = (whyYouWillLoveIt || '').trim();
        const cleanBenefits = Array.isArray(benefits)
            ? benefits.map(b => String(b).trim()).filter(Boolean)
            : (typeof benefits === 'string' && benefits.trim() ? [benefits.trim()] : []);

        const productData = {
            name: name.trim(),
            description: cleanFormula,
            formulaProfile: cleanFormula,
            benefits: cleanBenefits,
            whyYouWillLoveIt: cleanWhy || null,
            mrp: Number(mrp) || Number(price),
            price: Number(price),
            images: Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : ['/product_img1.png'],
            category: category.trim(),
            brand: brand ? brand.trim() : 'UK Import',
            inStock: inStock !== undefined ? Boolean(inStock) : true,
            stockCount: Number(stockCount) || 50,
        };

        if (isDatabaseConfigured()) {
            // Find default store
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

            const product = await prisma.product.create({
                data: {
                    ...productData,
                    storeId: store.id,
                },
            });

            const normalizedProduct = {
                ...product,
                formulaProfile: cleanFormula,
                benefits: cleanBenefits,
                whyYouWillLoveIt: cleanWhy
            };

            return NextResponse.json({ success: true, product: normalizedProduct }, {
                status: 201,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        const product = memoryStore.addProduct({
            ...productData,
            storeId: 'store_ukbl_main',
        });

        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create product', error: error.message },
            { status: 500 }
        );
    }
}

