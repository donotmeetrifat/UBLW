import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { initialCategories, memoryStore } from '@/lib/db/initialData';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get('all') === 'true';

        if (isDatabaseConfigured()) {
            const where = includeAll ? {} : { isActive: true };

            const categories = await prisma.category.findMany({
                where,
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: { displayOrder: 'asc' }
            });

            // Map and count matching products
            const formatted = await Promise.all(categories.map(async (c) => {
                const productCount = await prisma.product.count({
                    where: { category: c.name }
                });
                return {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    description: c.description,
                    image: c.image,
                    displayOrder: c.displayOrder,
                    isActive: c.isActive,
                    count: productCount || c._count?.products || 0,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt
                };
            }));

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
        const cats = memoryStore.getCategories();
        const formatted = cats.map(cat => ({
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

            const currentCount = await prisma.category.count();
            const orderNum = typeof displayOrder === 'number' ? displayOrder : currentCount;

            const category = await prisma.category.create({
                data: {
                    name: trimmedName,
                    slug: finalSlug,
                    description: (description || '').trim() || null,
                    image: image || null,
                    displayOrder: orderNum,
                    isActive: isActive !== undefined ? Boolean(isActive) : true,
                }
            });

            return NextResponse.json({
                success: true,
                message: `Category "${trimmedName}" created successfully!`,
                category
            }, { status: 201 });
        }

        const newCat = memoryStore.addCategory({
            name: trimmedName,
            slug: finalSlug,
            description: (description || '').trim() || null,
            image: image || null,
            displayOrder: Number(displayOrder) || 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        });

        return NextResponse.json({
            success: true,
            message: `Category "${trimmedName}" created successfully!`,
            category: newCat
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create category' },
            { status: 500 }
        );
    }
}
