import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (isDatabaseConfigured()) {
            let product;
            try {
                product = await prisma.product.findUnique({
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
            } catch (findErr) {
                console.warn('Prisma findUnique fallback to raw SQL:', findErr.message);
                const rows = await prisma.$queryRawUnsafe(`
                    SELECT p.*,
                        COALESCE(p.views, 0)::int as "views",
                        COALESCE(p."formulaProfile", p.description) as "formulaProfile",
                        COALESCE(p.benefits, ARRAY[]::text[]) as "benefits",
                        COALESCE(p."whyYouWillLoveIt", '') as "whyYouWillLoveIt",
                        COALESCE(p."isActive", true) as "isActive"
                    FROM "Product" p
                    WHERE p.id = $1
                `, id);
                product = rows && rows[0] ? rows[0] : null;
            }

            if (!product) {
                return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, product }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        const product = memoryStore.getProductById(id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
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
                console.warn('Prisma update failed, executing direct SQL update:', updateErr.message);

                const setClauses = [];
                const values = [];
                let paramIndex = 1;

                const allowedColumns = [
                    'name', 'description', 'formulaProfile', 'benefits', 'whyYouWillLoveIt',
                    'mrp', 'price', 'costPrice', 'images', 'category', 'categoryId',
                    'brand', 'inStock', 'stockCount', 'isFeatured', 'isBestSeller',
                    'views', 'isActive'
                ];

                for (const col of allowedColumns) {
                    if (cleanedData[col] !== undefined) {
                        setClauses.push(`"${col}" = $${paramIndex}`);
                        values.push(cleanedData[col]);
                        paramIndex++;
                    }
                }

                if (setClauses.length > 0) {
                    setClauses.push(`"updatedAt" = NOW()`);
                    values.push(id);
                    const sql = `UPDATE "Product" SET ${setClauses.join(', ')} WHERE "id" = $${paramIndex} RETURNING *`;
                    const rows = await prisma.$queryRawUnsafe(sql, ...values);
                    product = rows && rows[0] ? rows[0] : { id, ...cleanedData };
                } else {
                    product = await prisma.product.findUnique({ where: { id } });
                }
            }
            return NextResponse.json({ success: true, product }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        const product = memoryStore.updateProduct(id, cleanedData);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
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

