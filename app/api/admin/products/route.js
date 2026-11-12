import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'views'; // 'views', 'newest', 'price-high', 'price-low', 'stock'

        if (isDatabaseConfigured()) {
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (category && category !== 'All') {
                where.category = { equals: category, mode: 'insensitive' };
            }

            let orderBy = { views: 'desc' };
            if (sort === 'newest') orderBy = { createdAt: 'desc' };
            if (sort === 'price-high') orderBy = { price: 'desc' };
            if (sort === 'price-low') orderBy = { price: 'asc' };
            if (sort === 'stock') orderBy = { stockCount: 'asc' };

            const [products, totalCount, totalViewsAgg, lowStockCount] = await Promise.all([
                prisma.product.findMany({
                    where,
                    orderBy,
                    include: {
                        ratings: { select: { id: true, rating: true } },
                        orderItems: { select: { quantity: true } }
                    }
                }),
                prisma.product.count(),
                prisma.product.aggregate({ _sum: { views: true } }),
                prisma.product.count({ where: { stockCount: { lte: 10 } } })
            ]);

            const enriched = products.map(p => {
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

            return NextResponse.json({
                success: true,
                products: enriched,
                stats: {
                    totalProducts: totalCount,
                    totalViews: totalViewsAgg._sum.views || 0,
                    lowStockCount,
                    inStockCount: products.filter(p => p.inStock && p.stockCount > 0).length
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
        const { name, description, mrp, price, category, brand, stockCount, inStock, images } = body;

        if (!name || !price || !category) {
            return NextResponse.json({ success: false, message: 'Name, price, and category are required' }, { status: 400 });
        }

        const parsedPrice = parseFloat(price);
        const parsedMrp = mrp ? parseFloat(mrp) : parsedPrice;
        const parsedStock = stockCount !== undefined ? parseInt(stockCount, 10) : 50;
        const imageList = Array.isArray(images) && images.length > 0
            ? images.filter(Boolean)
            : ['/product_img1.png'];

        if (isDatabaseConfigured()) {
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

            const created = await prisma.product.create({
                data: {
                    name: name.trim(),
                    description: description ? description.trim() : '',
                    price: parsedPrice,
                    mrp: parsedMrp,
                    category: category.trim(),
                    brand: brand ? brand.trim() : 'UK Import',
                    stockCount: isNaN(parsedStock) ? 50 : parsedStock,
                    inStock: inStock !== undefined ? Boolean(inStock) : true,
                    images: imageList,
                    storeId: store.id,
                    views: 0,
                    isActive: true
                }
            });

            return NextResponse.json({ success: true, product: created }, { status: 201 });
        }

        const memProduct = memoryStore.addProduct({
            name,
            description,
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

        return NextResponse.json({ success: true, product: memProduct }, { status: 201 });
    } catch (error) {
        console.error('Error in admin product POST:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

