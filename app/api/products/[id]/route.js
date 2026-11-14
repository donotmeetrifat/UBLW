import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
    try {
        let id = null;
        if (context?.params) {
            try {
                const resolved = await Promise.resolve(context.params);
                id = resolved?.id;
            } catch {}
        }
        if (!id) {
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const prodIdx = pathParts.indexOf('products');
            if (prodIdx !== -1 && pathParts[prodIdx + 1]) {
                id = pathParts[prodIdx + 1].split('?')[0];
            }
        }

        if (!id) {
            return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
        }

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

            let parsedBenefits = product.benefits;
            if (typeof parsedBenefits === 'string') {
                try {
                    parsedBenefits = JSON.parse(parsedBenefits);
                } catch (e) {
                    if (parsedBenefits.startsWith('{') && parsedBenefits.endsWith('}')) {
                        parsedBenefits = parsedBenefits.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim());
                    } else if (parsedBenefits.includes('\n')) {
                        parsedBenefits = parsedBenefits.split('\n').map(s => s.trim());
                    } else {
                        parsedBenefits = [parsedBenefits.trim()];
                    }
                }
            }
            const cleanBenefits = Array.isArray(parsedBenefits)
                ? parsedBenefits.map(b => String(b).trim()).filter(Boolean)
                : [];

            const normalizedProduct = {
                ...product,
                formulaProfile: (product.formulaProfile || product.description || '').trim(),
                benefits: cleanBenefits,
                whyYouWillLoveIt: (product.whyYouWillLoveIt || '').trim()
            };

            return NextResponse.json({ success: true, product: normalizedProduct }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store'
                }
            });
        }

        const product = memoryStore.getProductById(id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store'
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

export async function PATCH(request, context) {
    try {
        let id = null;
        if (context?.params) {
            try {
                const resolved = await Promise.resolve(context.params);
                id = resolved?.id;
            } catch {}
        }
        if (!id) {
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const prodIdx = pathParts.indexOf('products');
            if (prodIdx !== -1 && pathParts[prodIdx + 1]) {
                id = pathParts[prodIdx + 1].split('?')[0];
            }
        }
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
        delete cleanedData.sizeVolume;
        delete cleanedData.stats;
        delete cleanedData._count;

        if (cleanedData.price !== undefined) cleanedData.price = parseFloat(cleanedData.price);
        if (cleanedData.mrp !== undefined) cleanedData.mrp = parseFloat(cleanedData.mrp);
        if (cleanedData.stockCount !== undefined) cleanedData.stockCount = parseInt(cleanedData.stockCount, 10);
        if (cleanedData.inStock !== undefined) cleanedData.inStock = Boolean(cleanedData.inStock);
        if (cleanedData.benefits !== undefined) {
            let parsed = cleanedData.benefits;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    parsed = parsed.split('\n');
                }
            }
            cleanedData.benefits = Array.isArray(parsed)
                ? parsed.map(b => String(b).trim()).filter(Boolean)
                : [];
        }
        if (cleanedData.whyYouWillLoveIt !== undefined) {
            cleanedData.whyYouWillLoveIt = String(cleanedData.whyYouWillLoveIt || '').trim();
        }
        if (cleanedData.formulaProfile !== undefined) {
            cleanedData.formulaProfile = String(cleanedData.formulaProfile || '').trim();
            cleanedData.description = cleanedData.formulaProfile;
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
            let parsedBenefits = product?.benefits;
            if (typeof parsedBenefits === 'string') {
                try {
                    parsedBenefits = JSON.parse(parsedBenefits);
                } catch (e) {
                    if (parsedBenefits.startsWith('{') && parsedBenefits.endsWith('}')) {
                        parsedBenefits = parsedBenefits.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim());
                    } else if (parsedBenefits.includes('\n')) {
                        parsedBenefits = parsedBenefits.split('\n').map(s => s.trim());
                    } else {
                        parsedBenefits = [parsedBenefits.trim()];
                    }
                }
            }
            const cleanBenefits = Array.isArray(parsedBenefits)
                ? parsedBenefits.map(b => String(b).trim()).filter(Boolean)
                : [];

            const normalizedProduct = {
                ...product,
                formulaProfile: (product?.formulaProfile || product?.description || '').trim(),
                benefits: cleanBenefits,
                whyYouWillLoveIt: (product?.whyYouWillLoveIt || '').trim()
            };

            return NextResponse.json({ success: true, product: normalizedProduct }, {
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

export async function DELETE(request, context) {
    try {
        let id = null;
        if (context?.params) {
            try {
                const resolved = await Promise.resolve(context.params);
                id = resolved?.id;
            } catch {}
        }
        if (!id) {
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const prodIdx = pathParts.indexOf('products');
            if (prodIdx !== -1 && pathParts[prodIdx + 1]) {
                id = pathParts[prodIdx + 1].split('?')[0];
            }
        }

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

