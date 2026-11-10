import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { initialCategories, memoryStore } from '@/lib/db/initialData';

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const categories = await prisma.category.findMany({
                where: { isActive: true },
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: { displayOrder: 'asc' }
            });

            const formatted = categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                count: c._count.products
            }));

            return NextResponse.json({ success: true, categories: formatted });
        }

        const products = memoryStore.getProducts();
        const formatted = initialCategories.map(cat => ({
            ...cat,
            count: products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length
        }));

        return NextResponse.json({ success: true, categories: formatted });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories', error: error.message },
            { status: 500 }
        );
    }
}
