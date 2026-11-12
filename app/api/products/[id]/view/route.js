import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing product ID' }, { status: 400 });
        }

        if (isDatabaseConfigured()) {
            let viewsCount = 1;
            try {
                const product = await prisma.product.update({
                    where: { id },
                    data: { views: { increment: 1 } },
                    select: { id: true, views: true }
                });
                viewsCount = product.views;
            } catch (err) {
                try {
                    await prisma.$executeRawUnsafe(
                        `UPDATE "Product" SET "views" = COALESCE("views", 0) + 1 WHERE "id" = $1`,
                        id
                    );
                    const prod = await prisma.product.findUnique({ where: { id }, select: { views: true } });
                    if (prod) viewsCount = prod.views;
                } catch (rawErr) {
                    console.warn('Raw view count update note:', rawErr.message);
                }
            }
            return NextResponse.json({ success: true, views: viewsCount });
        }

        const product = memoryStore.getProductById(id);
        if (product) {
            product.views = (product.views || 0) + 1;
            return NextResponse.json({ success: true, views: product.views });
        }

        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    } catch (error) {
        console.error('Error tracking product view:', error);
        return NextResponse.json({ success: false, message: 'Failed to record view' }, { status: 500 });
    }
}

