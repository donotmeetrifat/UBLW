import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const { code, subtotal = 0, userEmail = null, userId = null } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
        }

        const normalizedCode = code.trim().toUpperCase();
        const parsedSubtotal = Math.max(0, parseFloat(subtotal) || 0);

        if (isDatabaseConfigured()) {
            let coupon = null;
            try {
                coupon = await prisma.coupon.findUnique({
                    where: { code: normalizedCode },
                });
            } catch (findErr) {
                const rows = await prisma.$queryRawUnsafe(
                    `SELECT * FROM "Coupon" WHERE UPPER(code) = $1 LIMIT 1`,
                    normalizedCode
                );
                coupon = rows && rows[0] ? rows[0] : null;
            }

            if (!coupon || !coupon.isActive) {
                return NextResponse.json({ success: false, message: 'Invalid or inactive coupon code' }, { status: 404 });
            }

            const now = new Date();

            // 1. Check Scheduled Start Date
            if (coupon.startsAt && new Date(coupon.startsAt) > now) {
                const startDateStr = new Date(coupon.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                return NextResponse.json({
                    success: false,
                    message: `This coupon will be active starting on ${startDateStr}.`
                }, { status: 400 });
            }

            // 2. Check Expiration (unless it is marked as Lifetime)
            if (!coupon.isLifetime && coupon.expiresAt && new Date(coupon.expiresAt) < now) {
                return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
            }

            // 3. Check Overall Usage Limit (e.g. First 5 or first 10 customers)
            if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
                return NextResponse.json({
                    success: false,
                    message: `This promotion was limited to the first ${coupon.usageLimit} redemptions and is now closed.`
                }, { status: 400 });
            }

            // 4. Check Exclusive Allowed Users Restriction
            if (Array.isArray(coupon.allowedUserEmails) && coupon.allowedUserEmails.length > 0) {
                if (!userEmail) {
                    return NextResponse.json({
                        success: false,
                        message: 'This coupon is exclusively reserved for selected customer accounts. Please sign in to verify eligibility.'
                    }, { status: 401 });
                }

                const normalizedUserEmail = String(userEmail).trim().toLowerCase();
                const isAllowed = coupon.allowedUserEmails.some(
                    e => String(e).trim().toLowerCase() === normalizedUserEmail
                );

                if (!isAllowed) {
                    return NextResponse.json({
                        success: false,
                        message: 'This exclusive discount is not available for this account.'
                    }, { status: 403 });
                }
            }

            // 5. Check Minimum Order Amount Requirement
            if (coupon.minOrderAmount && parsedSubtotal < coupon.minOrderAmount) {
                return NextResponse.json({
                    success: false,
                    message: `Minimum order amount for ${coupon.code} is ৳${coupon.minOrderAmount.toLocaleString()}`
                }, { status: 400 });
            }

            // 6. Calculate Precise Discount
            let discountAmount = 0;
            if (coupon.discountType === 'FIXED') {
                discountAmount = Math.min(coupon.discount, parsedSubtotal);
            } else {
                // PERCENTAGE
                discountAmount = Math.round((parsedSubtotal * coupon.discount) / 100);
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            }

            return NextResponse.json({
                success: true,
                coupon: {
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType || 'PERCENTAGE',
                    discount: coupon.discount,
                    discountAmount,
                    minOrderAmount: coupon.minOrderAmount,
                    maxDiscount: coupon.maxDiscount,
                    isLifetime: coupon.isLifetime,
                    usageLimit: coupon.usageLimit,
                    usedCount: coupon.usedCount || 0
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
        const coupon = memoryStore.getCouponByCode(normalizedCode);
        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Invalid coupon code. Try NEW20, OFF10, or EID25' }, { status: 404 });
        }

        if (coupon.minOrderAmount && parsedSubtotal < coupon.minOrderAmount) {
            return NextResponse.json({
                success: false,
                message: `Minimum order amount for ${coupon.code} is ৳${coupon.minOrderAmount.toLocaleString()}`
            }, { status: 400 });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'FIXED') {
            discountAmount = Math.min(coupon.discount, parsedSubtotal);
        } else {
            discountAmount = Math.round((parsedSubtotal * coupon.discount) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType || 'PERCENTAGE',
                discount: coupon.discount,
                discountAmount,
            }
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to validate coupon', error: error.message },
            { status: 500 }
        );
    }
}
