import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

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
                where.category = { equals: category, mode: 'insensitive' };
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

            const products = await prisma.product.findMany({
                where,
                orderBy,
                include: { ratings: true },
            });

            return NextResponse.json({ success: true, products });
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
        const { name, description, mrp, price, images, category, brand, inStock, stockCount } = body;

        if (!name || !price || !category) {
            return NextResponse.json(
                { success: false, message: 'Name, price, and category are required' },
                { status: 400 }
            );
        }

        const productData = {
            name,
            description: description || '',
            mrp: Number(mrp) || Number(price),
            price: Number(price),
            images: Array.isArray(images) && images.length > 0 ? images : ['/product_img1.png'],
            category,
            brand: brand || 'UK Import',
            inStock: inStock !== undefined ? inStock : true,
            stockCount: Number(stockCount) || 50,
        };

        if (isDatabaseConfigured()) {
            // Find default store
            const store = await prisma.store.findFirst();
            if (!store) {
                return NextResponse.json({ success: false, message: 'Store not configured' }, { status: 500 });
            }

            const product = await prisma.product.create({
                data: {
                    ...productData,
                    storeId: store.id,
                },
            });

            return NextResponse.json({ success: true, product }, { status: 201 });
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

