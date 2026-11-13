import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getHomepageSections, saveHomepageSections } from '@/lib/homepageSections';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const sections = await getHomepageSections();

        let products = [];
        if (isDatabaseConfigured()) {
            try {
                products = await prisma.product.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    include: { ratings: { select: { rating: true } } }
                });
            } catch (err) {
                products = await prisma.$queryRawUnsafe(`
                    SELECT p.*,
                        COALESCE(p.views, 0)::int as "views",
                        COALESCE(p."isActive", true) as "isActive"
                    FROM "Product" p
                    ORDER BY p."createdAt" DESC
                `).catch(() => []);
            }
        }

        if (!Array.isArray(products) || products.length === 0) {
            products = memoryStore.getProducts();
        }

        return NextResponse.json({
            success: true,
            sections,
            products: products || []
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch admin homepage sections', error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const updatedSections = await saveHomepageSections(body);

        return NextResponse.json({
            success: true,
            message: 'Homepage showcase updated successfully! All visitors now see your curated product priority order.',
            sections: updatedSections
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Error saving homepage sections in admin API:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to save homepage sections', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    return PUT(request);
}

