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

        // Sanitize fields before database update
        const cleanedData = { ...updates };
        delete cleanedData.id;
        delete cleanedData.store;
        delete cleanedData.ratings;
        delete cleanedData.rating;
        delete cleanedData.orderItems;
        delete cleanedData.categoryRel;
        delete cleanedData.ratingScore;
        delete cleanedData.reviewsCount;
        delete cleanedData.unitsSold;
        delete cleanedData.createdAt;
        delete cleanedData.updatedAt;

        if (cleanedData.price !== undefined) cleanedData.price = parseFloat(cleanedData.price);
        if (cleanedData.mrp !== undefined) cleanedData.mrp = parseFloat(cleanedData.mrp);
        if (cleanedData.stockCount !== undefined) cleanedData.stockCount = parseInt(cleanedData.stockCount, 10);
        if (cleanedData.inStock !== undefined) cleanedData.inStock = Boolean(cleanedData.inStock);
        if (Array.isArray(cleanedData.benefits)) {
            cleanedData.benefits = cleanedData.benefits.map(b => String(b).trim()).filter(Boolean);
        }

        if (isDatabaseConfigured()) {
            let product;
            try {
                product = await prisma.product.update({
                    where: { id },
                    data: cleanedData,
                });
            } catch (updateErr) {
                if (updateErr.message && (
                    updateErr.message.includes('Unknown argument') ||
                    updateErr.message.includes('formulaProfile') ||
                    updateErr.message.includes('benefits') ||
                    updateErr.message.includes('whyYouWillLoveIt')
                )) {
                    console.warn('Prisma update fallback triggered:', updateErr.message);
                    const fallbackData = { ...cleanedData };
                    const formula = fallbackData.formulaProfile;
                    const bnf = fallbackData.benefits;
                    const whyLove = fallbackData.whyYouWillLoveIt;
                    delete fallbackData.formulaProfile;
                    delete fallbackData.benefits;
                    delete fallbackData.whyYouWillLoveIt;

                    product = await prisma.product.update({
                        where: { id },
                        data: fallbackData
                    });

                    try {
                        await prisma.$executeRawUnsafe(
                            `UPDATE "Product" SET "formulaProfile" = COALESCE($1, "formulaProfile"), "benefits" = COALESCE($2, "benefits"), "whyYouWillLoveIt" = COALESCE($3, "whyYouWillLoveIt") WHERE "id" = $4`,
                            formula || null,
                            bnf || null,
                            whyLove || null,
                            id
                        );
                        if (formula !== undefined) product.formulaProfile = formula;
                        if (bnf !== undefined) product.benefits = bnf;
                        if (whyLove !== undefined) product.whyYouWillLoveIt = whyLove;
                    } catch (rawErr) {
                        console.warn('Raw SQL patch warning:', rawErr.message);
                    }
                } else {
                    throw updateErr;
                }
            }
            return NextResponse.json({ success: true, product });
        }

        const product = memoryStore.updateProduct(id, cleanedData);
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
            const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
            if (orderItemsCount > 0) {
                // Preserve historical order records by soft-deleting
                await prisma.product.update({
                    where: { id },
                    data: { isActive: false, inStock: false }
                });
                return NextResponse.json({
                    success: true,
                    message: 'Product archived from active catalog (order history preserved)'
                });
            }

            await prisma.product.delete({ where: { id } });
            return NextResponse.json({ success: true, message: 'Product deleted permanently' });
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

