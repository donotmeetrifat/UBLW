import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getUserFromRequest } from '@/lib/auth';
import { insertCategoryWithOrder } from '@/lib/db/categoryOrdering';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let categoriesCache = {
    all: null,
    active: null,
    fetchedAt: 0
};

export function invalidateCategoriesCache() {
    categoriesCache = { all: null, active: null, fetchedAt: 0 };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        // High-performance server memory cache (25s TTL)
        if (categoriesCache.fetchedAt && Date.now() - categoriesCache.fetchedAt < 25000) {
            const cachedList = includeAll ? categoriesCache.all : categoriesCache.active;
            if (Array.isArray(cachedList)) {
                return NextResponse.json(
                    { success: true, categories: cachedList },
                    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
                );
            }
        }

        if (isDatabaseConfigured()) {
            const where = includeAll ? {} : { isActive: true };

            const categories = await prisma.category.findMany({
                where,
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: [
                    { displayOrder: 'asc' },
                    { createdAt: 'desc' }
                ]
            });

            // High-performance single aggregation query for all category product counts (replaces N+1 slow queries)
            let countMap = new Map();
            try {
                const productCounts = await prisma.product.groupBy({
                    by: ['category'],
                    _count: { id: true }
                });
                productCounts.forEach(item => {
                    if (item.category) {
                        countMap.set(item.category.toLowerCase().trim(), item._count.id);
                    }
                });
            } catch (groupByErr) {
                console.warn('Fast category groupBy fallback:', groupByErr.message);
            }

            const formatted = categories.map((c) => {
                const catLower = (c.name || '').toLowerCase().trim();
                const matchedCount = countMap.get(catLower) ?? c._count?.products ?? 0;
                return {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    description: c.description,
                    image: c.image,
                    displayOrder: c.displayOrder,
                    isActive: c.isActive,
                    count: matchedCount,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt
                };
            });

            if (includeAll) {
                categoriesCache.all = formatted;
                categoriesCache.active = formatted.filter(c => c.isActive !== false);
            } else {
                categoriesCache.active = formatted;
            }
            categoriesCache.fetchedAt = Date.now();

            return NextResponse.json(
                { success: true, categories: formatted },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                    }
                }
            );
        }

        const products = memoryStore.getProducts();
        const cats = memoryStore.getCategories().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        const filteredCats = includeAll ? cats : cats.filter(c => c.isActive !== false);
        const formatted = filteredCats.map(cat => ({
            ...cat,
            count: products.filter(p => (p.category || '').toLowerCase() === cat.name.toLowerCase()).length
        }));

        return NextResponse.json(
            { success: true, categories: formatted },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // Enforce Admin Authentication
        const payload = getUserFromRequest(request);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Admin access required to create categories.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, slug, description, image, displayOrder, isActive } = body;

        const trimmedName = (name || '').trim();
        if (!trimmedName || trimmedName.length < 2) {
            return NextResponse.json(
                { success: false, message: 'Category name must be at least 2 characters.' },
                { status: 400 }
            );
        }

        // Generate clean URL slug if not provided
        const finalSlug = (slug || trimmedName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (isDatabaseConfigured()) {
            // Check if name or slug already exists
            const existing = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { equals: trimmedName, mode: 'insensitive' } },
                        { slug: finalSlug }
                    ]
                }
            });

            if (existing) {
                return NextResponse.json(
                    { success: false, message: `A category named "${trimmedName}" or with slug "${finalSlug}" already exists.` },
                    { status: 409 }
                );
            }
        }

        const category = await insertCategoryWithOrder({
            name: trimmedName,
            slug: finalSlug,
            description: (description || '').trim() || null,
            image: image || null,
            targetOrder: typeof displayOrder === 'number' ? displayOrder : 1,
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });

        try {
            invalidateCategoriesCache();
            revalidatePath('/');
            revalidatePath('/shop');
            revalidatePath('/admin/categories');
            revalidatePath('/admin/promotions');
            revalidatePath('/admin/banners');
            revalidatePath('/admin/products');
        } catch {}

        return NextResponse.json({
            success: true,
            message: `Category "${trimmedName}" created successfully!`,
            category
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create category' },
            { status: 500 }
        );
    }
}
