import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (isDatabaseConfigured()) {
            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    ratings: {
                        include: {
                            user: {
                                select: { id: true, name: true, image: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    store: true
                },
            });
            if (!product) {
                return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, product });
        }

        const product = memoryStore.getProductById(id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product', error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const updates = await request.json();

        if (isDatabaseConfigured()) {
            const product = await prisma.product.update({
                where: { id },
                data: updates,
            });
            return NextResponse.json({ success: true, product });
        }

        const product = memoryStore.updateProduct(id, updates);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update product', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (isDatabaseConfigured()) {
            await prisma.product.delete({ where: { id } });
            return NextResponse.json({ success: true, message: 'Product deleted' });
        }

        const deleted = memoryStore.deleteProduct(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete product', error: error.message },
            { status: 500 }
        );
    }
}

