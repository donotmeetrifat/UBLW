import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
    try {
        let id = null;
        if (context?.params) {
            const resolvedParams = await Promise.resolve(context.params);
            id = resolvedParams?.id;
        }
        if (!id) {
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const couponIdx = pathParts.indexOf('coupons');
            if (couponIdx !== -1 && pathParts[couponIdx + 1]) {
                id = pathParts[couponIdx + 1];
            }
        }

        if (!id) {
            return NextResponse.json({ success: false, message: 'Coupon ID required' }, { status: 400 });
        }

        if (isDatabaseConfigured()) {
            let coupon = null;
            try {
                coupon = await prisma.coupon.findUnique({
                    where: { id }
                });
            } catch (queryErr) {
                const rows = await prisma.$queryRawUnsafe(
                    `SELECT * FROM "Coupon" WHERE id = $1 LIMIT 1`,
                    id
                );
                coupon = rows && rows[0] ? rows[0] : null;
            }

            if (!coupon) {
                return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, coupon }, {
                headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
            });
        }

        const coupon = memoryStore.getCoupons().find(c => c.id === id);
        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, coupon }, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error retrieving coupon', error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request, context) {
    try {
        const updates = await request.json().catch(() => ({}));
        let id = updates.id;

        if (!id && context?.params) {
            const resolvedParams = await Promise.resolve(context.params);
            id = resolvedParams?.id;
        }

        if (!id) {
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const couponIdx = pathParts.indexOf('coupons');
            if (couponIdx !== -1 && pathParts[couponIdx + 1]) {
                id = pathParts[couponIdx + 1];
            }
        }

        if (!id) {
            return NextResponse.json({ success: false, message: 'Coupon ID required for update' }, { status: 400 });
        }

        const cleanedData = { ...updates };
        delete cleanedData.id;
        delete cleanedData.createdAt;

        if (cleanedData.code) {
            cleanedData.code = cleanedData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        }

        if (cleanedData.discount !== undefined) {
            cleanedData.discount = parseFloat(cleanedData.discount);
        }

        if (cleanedData.minOrderAmount !== undefined) {
            cleanedData.minOrderAmount = Math.max(0, parseFloat(cleanedData.minOrderAmount) || 0);
        }

        if (cleanedData.maxDiscount !== undefined) {
            cleanedData.maxDiscount = cleanedData.maxDiscount !== null && cleanedData.maxDiscount !== ''
                ? Math.max(0, parseFloat(cleanedData.maxDiscount))
                : null;
        }

        if (cleanedData.usageLimit !== undefined) {
            cleanedData.usageLimit = cleanedData.usageLimit !== null && cleanedData.usageLimit !== ''
                ? parseInt(cleanedData.usageLimit, 10)
                : null;
        }

        if (cleanedData.isLifetime !== undefined) {
            cleanedData.isLifetime = Boolean(cleanedData.isLifetime);
            if (cleanedData.isLifetime) {
                cleanedData.expiresAt = null;
            }
        }

        if (cleanedData.startsAt !== undefined) {
            cleanedData.startsAt = cleanedData.startsAt ? new Date(cleanedData.startsAt) : null;
        }

        if (cleanedData.expiresAt !== undefined && !cleanedData.isLifetime) {
            cleanedData.expiresAt = cleanedData.expiresAt ? new Date(cleanedData.expiresAt) : null;
        }

        if (Array.isArray(cleanedData.allowedUserEmails)) {
            cleanedData.allowedUserEmails = cleanedData.allowedUserEmails
                .map(e => String(e).trim().toLowerCase())
                .filter(e => e.length > 3 && e.includes('@'));
        }

        if (cleanedData.isActive !== undefined) {
            cleanedData.isActive = Boolean(cleanedData.isActive);
        }

        if (isDatabaseConfigured()) {
            // Check if changing code collides with another coupon
            if (cleanedData.code) {
                try {
                    const existing = await prisma.coupon.findFirst({
                        where: {
                            code: cleanedData.code,
                            NOT: { id }
                        }
                    });
                    if (existing) {
                        return NextResponse.json(
                            { success: false, message: `Coupon code "${cleanedData.code}" is already in use.` },
                            { status: 409 }
                        );
                    }
                } catch (collisionErr) {
                    // Fallback raw collision check
                    const collRows = await prisma.$queryRawUnsafe(
                        `SELECT id FROM "Coupon" WHERE code = $1 AND id != $2 LIMIT 1`,
                        cleanedData.code,
                        id
                    );
                    if (Array.isArray(collRows) && collRows.length > 0) {
                        return NextResponse.json(
                            { success: false, message: `Coupon code "${cleanedData.code}" is already in use.` },
                            { status: 409 }
                        );
                    }
                }
            }

            let coupon = null;
            try {
                coupon = await prisma.coupon.update({
                    where: { id },
                    data: {
                        ...cleanedData,
                        updatedAt: new Date()
                    }
                });
            } catch (updateErr) {
                console.warn('Prisma coupon update note, executing direct SQL update fallback:', updateErr.message);

                const setClauses = [];
                const values = [];
                let paramIndex = 1;

                const allowedCols = [
                    'code', 'description', 'discountType', 'discount', 'forNewUserOnly',
                    'minOrderAmount', 'maxDiscount', 'isLifetime', 'startsAt', 'expiresAt',
                    'usageLimit', 'perUserLimit', 'allowedUserEmails', 'isActive'
                ];

                for (const col of allowedCols) {
                    if (cleanedData[col] !== undefined) {
                        setClauses.push(`"${col}" = $${paramIndex}`);
                        values.push(cleanedData[col]);
                        paramIndex++;
                    }
                }

                if (setClauses.length > 0) {
                    setClauses.push(`"updatedAt" = NOW()`);
                    values.push(id);
                    const sql = `UPDATE "Coupon" SET ${setClauses.join(', ')} WHERE "id" = $${paramIndex} RETURNING *`;
                    const rows = await prisma.$queryRawUnsafe(sql, ...values);
                    coupon = rows && rows[0] ? rows[0] : null;
                }
            }

            if (!coupon) {
                try {
                    coupon = await prisma.coupon.findUnique({ where: { id } });
                } catch {
                    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "Coupon" WHERE id = $1 LIMIT 1`, id);
                    coupon = rows && rows[0] ? rows[0] : null;
                }
            }

            // Sync memoryStore
            try {
                memoryStore.updateCoupon(id, cleanedData);
            } catch {}

            return NextResponse.json({
                success: true,
                message: `Coupon ${coupon?.code || id} updated successfully!`,
                coupon
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        // Memory Store Fallback
        const coupons = memoryStore.getCoupons();
        const index = coupons.findIndex(c => c.id === id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        }

        coupons[index] = {
            ...coupons[index],
            ...cleanedData,
            updatedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            message: `Coupon updated successfully!`,
            coupon: coupons[index]
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update coupon', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, context) {
    try {
        let id = null;
        if (context?.params) {
            const resolvedParams = await Promise.resolve(context.params);
            id = resolvedParams?.id;
        }

        if (!id) {
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const couponIdx = pathParts.indexOf('coupons');
            if (couponIdx !== -1 && pathParts[couponIdx + 1]) {
                id = pathParts[couponIdx + 1];
            }
        }

        if (!id) {
            const body = await request.json().catch(() => ({}));
            id = body.id;
        }

        if (!id) {
            return NextResponse.json({ success: false, message: 'Coupon ID required to delete' }, { status: 400 });
        }

        if (isDatabaseConfigured()) {
            let coupon = null;
            try {
                coupon = await prisma.coupon.findUnique({ where: { id } });
            } catch {
                const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "Coupon" WHERE id = $1 LIMIT 1`, id);
                coupon = rows && rows[0] ? rows[0] : null;
            }

            if (!coupon) {
                return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
            }

            try {
                await prisma.coupon.delete({ where: { id } });
            } catch (delErr) {
                await prisma.$executeRawUnsafe(`DELETE FROM "Coupon" WHERE id = $1`, id);
            }

            try {
                memoryStore.deleteCoupon(id);
            } catch {}

            return NextResponse.json({
                success: true,
                message: `Coupon ${coupon.code} removed successfully.`
            });
        }

        const coupons = memoryStore.getCoupons();
        const index = coupons.findIndex(c => c.id === id);
        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        }

        const removed = coupons.splice(index, 1)[0];
        return NextResponse.json({
            success: true,
            message: `Coupon ${removed.code} removed successfully.`
        });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete coupon', error: error.message },
            { status: 500 }
        );
    }
}

