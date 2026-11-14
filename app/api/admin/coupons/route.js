import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            let coupons = [];
            try {
                coupons = await prisma.coupon.findMany({
                    orderBy: { createdAt: 'desc' }
                });
            } catch (queryErr) {
                console.warn('Prisma coupon.findMany note, using direct SQL fallback:', queryErr.message);
                const rows = await prisma.$queryRawUnsafe(`
                    SELECT * FROM "Coupon" ORDER BY "createdAt" DESC
                `);
                coupons = Array.isArray(rows) ? rows : [];
            }

            let customers = [];
            try {
                customers = await prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
            } catch (userErr) {
                try {
                    const uRows = await prisma.$queryRawUnsafe(`
                        SELECT id, name, email, phone, role, "createdAt"
                        FROM "User"
                        ORDER BY "createdAt" DESC
                    `);
                    customers = Array.isArray(uRows) ? uRows : [];
                } catch {}
            }

            const totalCoupons = coupons.length;
            const activeCoupons = coupons.filter(c => c.isActive).length;
            const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

            return NextResponse.json({
                success: true,
                coupons,
                customers,
                stats: {
                    totalCoupons,
                    activeCoupons,
                    totalRedemptions,
                    registeredUsers: customers.length
                }
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store'
                }
            });
        }

        // Memory Store Fallback
        const coupons = memoryStore.getCoupons();
        const totalCoupons = coupons.length;
        const activeCoupons = coupons.filter(c => c.isActive).length;
        const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

        return NextResponse.json({
            success: true,
            coupons,
            customers: [],
            stats: {
                totalCoupons,
                activeCoupons,
                totalRedemptions,
                registeredUsers: 0
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error('Error fetching admin coupons:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch coupons', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            code,
            description,
            discountType = 'PERCENTAGE',
            discount,
            minOrderAmount = 0,
            maxDiscount = null,
            isLifetime = false,
            startsAt = null,
            expiresAt = null,
            usageLimit = null,
            perUserLimit = 1,
            forNewUserOnly = false,
            allowedUserEmails = [],
            isActive = true
        } = body;

        if (!code || typeof code !== 'string' || !code.trim()) {
            return NextResponse.json({ success: false, message: 'Please enter a coupon code' }, { status: 400 });
        }

        const normalizedCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (!normalizedCode) {
            return NextResponse.json({ success: false, message: 'Please enter a valid alphanumeric coupon code (e.g. VIP20, EID500)' }, { status: 400 });
        }

        const parsedDiscount = parseFloat(discount);
        if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
            return NextResponse.json({ success: false, message: 'Please enter a valid discount amount greater than 0' }, { status: 400 });
        }

        if (discountType === 'PERCENTAGE' && parsedDiscount > 100) {
            return NextResponse.json({ success: false, message: 'Percentage discount cannot exceed 100%' }, { status: 400 });
        }

        // Validate and sanitize dates safely
        let parsedStartsAt = null;
        if (startsAt) {
            const d = new Date(startsAt);
            if (!isNaN(d.getTime())) parsedStartsAt = d;
        }

        let parsedExpiresAt = null;
        if (!isLifetime && expiresAt) {
            const d = new Date(expiresAt);
            if (!isNaN(d.getTime())) parsedExpiresAt = d;
        }

        // Sanitize allowed user emails (trim and lower-case)
        const sanitizedEmails = Array.isArray(allowedUserEmails)
            ? allowedUserEmails
                .map(e => String(e).trim().toLowerCase())
                .filter(e => e.length > 3 && e.includes('@'))
            : [];

        const parsedUsageLimit = usageLimit !== null && usageLimit !== '' && !isNaN(parseInt(usageLimit, 10))
            ? parseInt(usageLimit, 10)
            : null;
        const parsedMinOrder = !isNaN(parseFloat(minOrderAmount)) ? parseFloat(minOrderAmount) : 0;
        const parsedMaxDiscount = maxDiscount !== null && maxDiscount !== '' && !isNaN(parseFloat(maxDiscount))
            ? parseFloat(maxDiscount)
            : null;

        const couponPayload = {
            code: normalizedCode,
            description: (description || `${normalizedCode} Special Promotion`).trim(),
            discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
            discount: parsedDiscount,
            minOrderAmount: Math.max(0, parsedMinOrder),
            maxDiscount: parsedMaxDiscount ? Math.max(0, parsedMaxDiscount) : null,
            isLifetime: Boolean(isLifetime),
            startsAt: parsedStartsAt,
            expiresAt: parsedExpiresAt,
            usageLimit: (parsedUsageLimit && parsedUsageLimit > 0) ? parsedUsageLimit : null,
            perUserLimit: Math.max(1, parseInt(perUserLimit, 10) || 1),
            forNewUserOnly: Boolean(forNewUserOnly),
            allowedUserEmails: sanitizedEmails,
            isActive: Boolean(isActive),
            usedCount: 0
        };

        if (isDatabaseConfigured()) {
            let existing = null;
            try {
                existing = await prisma.coupon.findUnique({
                    where: { code: normalizedCode }
                });
            } catch (checkErr) {
                const rows = await prisma.$queryRawUnsafe(
                    `SELECT id FROM "Coupon" WHERE code = $1 LIMIT 1`,
                    normalizedCode
                );
                existing = rows && rows[0] ? rows[0] : null;
            }

            if (existing) {
                return NextResponse.json(
                    { success: false, message: `Coupon code "${normalizedCode}" already exists. Please choose a different code.` },
                    { status: 409 }
                );
            }

            let coupon = null;
            try {
                coupon = await prisma.coupon.create({
                    data: couponPayload
                });
            } catch (createErr) {
                console.warn('Prisma coupon.create note, executing direct SQL insert fallback:', createErr.message);
                const couponId = 'cmw' + randomUUID().replace(/-/g, '').slice(0, 21);
                const rows = await prisma.$queryRawUnsafe(`
                    INSERT INTO "Coupon" (
                        "id", "code", "description", "discountType", "discount",
                        "forNewUserOnly", "minOrderAmount", "maxDiscount", "isLifetime",
                        "startsAt", "expiresAt", "usageLimit", "usedCount", "perUserLimit",
                        "allowedUserEmails", "isActive", "createdAt", "updatedAt"
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9,
                        $10, $11, $12, $13, $14,
                        $15, $16, NOW(), NOW()
                    ) RETURNING *
                `,
                    couponId,
                    normalizedCode,
                    couponPayload.description,
                    couponPayload.discountType,
                    couponPayload.discount,
                    couponPayload.forNewUserOnly,
                    couponPayload.minOrderAmount,
                    couponPayload.maxDiscount,
                    couponPayload.isLifetime,
                    couponPayload.startsAt,
                    couponPayload.expiresAt,
                    couponPayload.usageLimit,
                    0,
                    couponPayload.perUserLimit,
                    couponPayload.allowedUserEmails,
                    couponPayload.isActive
                );
                coupon = rows && rows[0] ? rows[0] : null;
            }

            if (!coupon) {
                throw new Error('Failed to create coupon in database');
            }

            // Also keep memoryStore synchronized for real-time fallback
            try {
                memoryStore.addCoupon(coupon);
            } catch {}

            return NextResponse.json({
                success: true,
                message: `Coupon code ${normalizedCode} created and published live!`,
                coupon
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store'
                }
            });
        }

        // Memory Store Fallback
        const memoryExisting = memoryStore.getCouponByCode(normalizedCode);
        if (memoryExisting) {
            return NextResponse.json(
                { success: false, message: `Coupon code "${normalizedCode}" already exists.` },
                { status: 409 }
            );
        }

        const coupon = memoryStore.addCoupon(couponPayload);
        return NextResponse.json({
            success: true,
            message: `Coupon code ${normalizedCode} created successfully!`,
            coupon
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create coupon' },
            { status: 500 }
        );
    }
}
