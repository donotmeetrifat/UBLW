import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const [coupons, customers] = await Promise.all([
                prisma.coupon.findMany({
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                })
            ]);

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
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
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
            return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
        }

        const normalizedCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (!normalizedCode) {
            return NextResponse.json({ success: false, message: 'Please enter a valid alphanumeric coupon code' }, { status: 400 });
        }

        const parsedDiscount = parseFloat(discount);
        if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
            return NextResponse.json({ success: false, message: 'Please enter a valid discount value greater than 0' }, { status: 400 });
        }

        if (discountType === 'PERCENTAGE' && parsedDiscount > 100) {
            return NextResponse.json({ success: false, message: 'Percentage discount cannot exceed 100%' }, { status: 400 });
        }

        // Sanitize allowed user emails (trim and lower-case)
        const sanitizedEmails = Array.isArray(allowedUserEmails)
            ? allowedUserEmails
                .map(e => String(e).trim().toLowerCase())
                .filter(e => e.length > 3 && e.includes('@'))
            : [];

        const parsedUsageLimit = usageLimit !== null && usageLimit !== '' ? parseInt(usageLimit, 10) : null;
        const parsedMinOrder = parseFloat(minOrderAmount) || 0;
        const parsedMaxDiscount = maxDiscount !== null && maxDiscount !== '' ? parseFloat(maxDiscount) : null;

        const couponPayload = {
            code: normalizedCode,
            description: (description || `${normalizedCode} Special Promotion`).trim(),
            discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
            discount: parsedDiscount,
            minOrderAmount: Math.max(0, parsedMinOrder),
            maxDiscount: parsedMaxDiscount ? Math.max(0, parsedMaxDiscount) : null,
            isLifetime: Boolean(isLifetime),
            startsAt: startsAt ? new Date(startsAt) : null,
            expiresAt: (!isLifetime && expiresAt) ? new Date(expiresAt) : null,
            usageLimit: (parsedUsageLimit && parsedUsageLimit > 0) ? parsedUsageLimit : null,
            perUserLimit: Math.max(1, parseInt(perUserLimit, 10) || 1),
            forNewUserOnly: Boolean(forNewUserOnly),
            allowedUserEmails: sanitizedEmails,
            isActive: Boolean(isActive),
            usedCount: 0
        };

        if (isDatabaseConfigured()) {
            const existing = await prisma.coupon.findUnique({
                where: { code: normalizedCode }
            });

            if (existing) {
                return NextResponse.json(
                    { success: false, message: `Coupon code "${normalizedCode}" already exists. Please choose a different code.` },
                    { status: 409 }
                );
            }

            const coupon = await prisma.coupon.create({
                data: couponPayload
            });

            return NextResponse.json({
                success: true,
                message: `Coupon code ${normalizedCode} created and active!`,
                coupon
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
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create coupon', error: error.message },
            { status: 500 }
        );
    }
}

