import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const {
            code,
            subtotal = 0,
            userEmail = null,
            userId = null,
            currentlyAppliedCode = null
        } = body;

        if (!code || typeof code !== 'string' || !code.trim()) {
            return NextResponse.json({
                success: false,
                isReal: false,
                message: 'Please enter a coupon code.'
            }, { status: 400 });
        }

        const normalizedCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (!normalizedCode) {
            return NextResponse.json({
                success: false,
                isReal: false,
                message: 'Please enter a valid alphanumeric coupon code.'
            }, { status: 400 });
        }

        const parsedSubtotal = Math.max(0, parseFloat(subtotal) || 0);

        if (isDatabaseConfigured()) {
            let coupon = null;

            // 1. Backend Verification: Is the coupon real or fake?
            try {
                coupon = await prisma.coupon.findUnique({
                    where: { code: normalizedCode },
                });
            } catch (findErr) {
                try {
                    const rows = await prisma.$queryRawUnsafe(
                        `SELECT * FROM "Coupon" WHERE UPPER(code) = $1 LIMIT 1`,
                        normalizedCode
                    );
                    coupon = Array.isArray(rows) && rows[0] ? rows[0] : null;
                } catch (sqlErr) {
                    console.warn('Coupon direct SQL query note:', sqlErr.message);
                }
            }

            // Fake / Non-existent coupon code
            if (!coupon) {
                return NextResponse.json({
                    success: false,
                    isReal: false,
                    isOn: false,
                    message: `Coupon code "${normalizedCode}" is invalid. This coupon does not exist on our store.`
                }, { status: 404 });
            }

            // 2. Backend Verification: Is the coupon code ON or OFF?
            if (!coupon.isActive) {
                return NextResponse.json({
                    success: false,
                    isReal: true,
                    isOn: false,
                    message: `Coupon code "${coupon.code}" is currently disabled/inactive and cannot be used.`
                }, { status: 400 });
            }

            const now = new Date();

            // 3. Backend Verification: Scheduled Start Date
            if (coupon.startsAt && new Date(coupon.startsAt) > now) {
                const startDateStr = new Date(coupon.startsAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                return NextResponse.json({
                    success: false,
                    isReal: true,
                    isOn: false,
                    message: `Coupon "${coupon.code}" is scheduled to become active on ${startDateStr}.`
                }, { status: 400 });
            }

            // 4. Backend Verification: Expiration Date (unless marked as Lifetime)
            if (!coupon.isLifetime && coupon.expiresAt && new Date(coupon.expiresAt) < now) {
                const expiryDateStr = new Date(coupon.expiresAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                return NextResponse.json({
                    success: false,
                    isReal: true,
                    isOn: false,
                    isExpired: true,
                    message: `Coupon "${coupon.code}" expired on ${expiryDateStr}.`
                }, { status: 400 });
            }

            // 5. Backend Verification: Global Redemption / Usage Cap
            if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
                return NextResponse.json({
                    success: false,
                    isReal: true,
                    isOn: false,
                    isExhausted: true,
                    message: `Coupon "${coupon.code}" was limited to the first ${coupon.usageLimit} redemptions and is now closed.`
                }, { status: 400 });
            }

            // 6. Backend Verification: Customer Account Restriction (Target Audience)
            if (Array.isArray(coupon.allowedUserEmails) && coupon.allowedUserEmails.length > 0) {
                if (!userEmail) {
                    return NextResponse.json({
                        success: false,
                        isReal: true,
                        isOn: true,
                        requiresAuth: true,
                        message: `Coupon "${coupon.code}" is exclusively reserved for selected customer accounts. Please sign in to verify eligibility.`
                    }, { status: 401 });
                }

                const normalizedUserEmail = String(userEmail).trim().toLowerCase();
                const isAllowed = coupon.allowedUserEmails.some(
                    e => String(e).trim().toLowerCase() === normalizedUserEmail
                );

                if (!isAllowed) {
                    return NextResponse.json({
                        success: false,
                        isReal: true,
                        isOn: true,
                        message: `Coupon "${coupon.code}" is not available for this account.`
                    }, { status: 403 });
                }
            }

            // 7. Backend Verification: New Customer Only Restriction
            if (coupon.forNewUserOnly) {
                if (!userId && !userEmail) {
                    return NextResponse.json({
                        success: false,
                        isReal: true,
                        isOn: true,
                        requiresAuth: true,
                        message: `Coupon "${coupon.code}" is valid for first-time orders only. Please sign in to verify eligibility.`
                    }, { status: 401 });
                }

                try {
                    const priorOrders = await prisma.order.count({
                        where: {
                            OR: [
                                ...(userId ? [{ userId }] : []),
                                ...(userEmail ? [{ user: { email: String(userEmail).trim().toLowerCase() } }] : [])
                            ],
                            status: { not: 'CANCELLED' }
                        }
                    });
                    if (priorOrders > 0) {
                        return NextResponse.json({
                            success: false,
                            isReal: true,
                            isOn: true,
                            message: `Coupon "${coupon.code}" is valid for first-time orders only.`
                        }, { status: 400 });
                    }
                } catch (orderCheckErr) {
                    console.warn('Order check error:', orderCheckErr.message);
                }
            }

            // 8. Backend Verification: Per-User Usage Limit
            if (coupon.perUserLimit && (userId || userEmail)) {
                try {
                    const userCouponUses = await prisma.order.count({
                        where: {
                            isCouponUsed: true,
                            couponCode: coupon.code,
                            OR: [
                                ...(userId ? [{ userId }] : []),
                                ...(userEmail ? [{ user: { email: String(userEmail).trim().toLowerCase() } }] : [])
                            ],
                            status: { not: 'CANCELLED' }
                        }
                    });
                    if (userCouponUses >= coupon.perUserLimit) {
                        return NextResponse.json({
                            success: false,
                            isReal: true,
                            isOn: true,
                            message: `You have already used coupon "${coupon.code}" the maximum allowed number of times (${coupon.perUserLimit} use${coupon.perUserLimit > 1 ? 's' : ''}).`
                        }, { status: 400 });
                    }
                } catch (userLimitErr) {
                    console.warn('Per-user limit check error:', userLimitErr.message);
                }
            }

            // 9. Backend Verification: Minimum Order Subtotal Requirement
            if (coupon.minOrderAmount && parsedSubtotal < coupon.minOrderAmount) {
                const shortfall = Math.round(coupon.minOrderAmount - parsedSubtotal);
                return NextResponse.json({
                    success: false,
                    isReal: true,
                    isOn: true,
                    minOrderAmount: coupon.minOrderAmount,
                    currentSubtotal: parsedSubtotal,
                    shortfall,
                    message: `Minimum order amount of ৳${coupon.minOrderAmount.toLocaleString()} required for coupon "${coupon.code}". (Add ৳${shortfall.toLocaleString()} more to qualify)`
                }, { status: 400 });
            }

            // 10. Backend Verification: Calculate Precise Discount Amount & Percentage
            let discountAmount = 0;
            let discountPercentage = null;

            if (coupon.discountType === 'FIXED') {
                discountAmount = Math.min(coupon.discount, parsedSubtotal);
            } else {
                discountPercentage = coupon.discount;
                discountAmount = Math.round((parsedSubtotal * coupon.discount) / 100);
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            }

            const formattedDiscount = coupon.discountType === 'FIXED'
                ? `৳${coupon.discount.toLocaleString()} OFF`
                : `${coupon.discount}% OFF`;

            const summary = coupon.discountType === 'FIXED'
                ? `Flat ৳${coupon.discount.toLocaleString()} OFF`
                : `${coupon.discount}% OFF${coupon.maxDiscount ? ` (Capped at ৳${coupon.maxDiscount.toLocaleString()})` : ''}`;

            return NextResponse.json({
                success: true,
                isReal: true,
                isOn: true,
                message: `Coupon "${coupon.code}" verified and applied successfully! (${summary})`,
                coupon: {
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType || 'PERCENTAGE',
                    discount: coupon.discount,
                    discountPercentage,
                    discountAmount,
                    formattedDiscount,
                    summary,
                    minOrderAmount: coupon.minOrderAmount || 0,
                    maxDiscount: coupon.maxDiscount || null,
                    isLifetime: Boolean(coupon.isLifetime),
                    startsAt: coupon.startsAt,
                    expiresAt: coupon.expiresAt,
                    usageLimit: coupon.usageLimit,
                    usedCount: coupon.usedCount || 0,
                    subtotal: parsedSubtotal,
                    finalTotal: Math.max(0, parsedSubtotal - discountAmount),
                    verifiedAt: new Date().toISOString()
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
            return NextResponse.json({
                success: false,
                isReal: false,
                isOn: false,
                message: `Coupon code "${normalizedCode}" is invalid. This coupon does not exist.`
            }, { status: 404 });
        }

        if (coupon.isActive === false) {
            return NextResponse.json({
                success: false,
                isReal: true,
                isOn: false,
                message: `Coupon code "${coupon.code}" is currently disabled/inactive.`
            }, { status: 400 });
        }

        if (coupon.minOrderAmount && parsedSubtotal < coupon.minOrderAmount) {
            const shortfall = Math.round(coupon.minOrderAmount - parsedSubtotal);
            return NextResponse.json({
                success: false,
                isReal: true,
                isOn: true,
                message: `Minimum order amount of ৳${coupon.minOrderAmount.toLocaleString()} required for ${coupon.code}. Add ৳${shortfall.toLocaleString()} more to qualify.`
            }, { status: 400 });
        }

        let discountAmount = 0;
        let discountPercentage = null;
        if (coupon.discountType === 'FIXED') {
            discountAmount = Math.min(coupon.discount, parsedSubtotal);
        } else {
            discountPercentage = coupon.discount;
            discountAmount = Math.round((parsedSubtotal * coupon.discount) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }

        return NextResponse.json({
            success: true,
            isReal: true,
            isOn: true,
            message: `Coupon "${coupon.code}" verified and applied successfully!`,
            coupon: {
                id: coupon.id || coupon.code,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType || 'PERCENTAGE',
                discount: coupon.discount,
                discountPercentage,
                discountAmount,
                formattedDiscount: coupon.discountType === 'FIXED' ? `৳${coupon.discount} OFF` : `${coupon.discount}% OFF`,
                summary: coupon.discountType === 'FIXED' ? `Flat ৳${coupon.discount} OFF` : `${coupon.discount}% OFF`,
                minOrderAmount: coupon.minOrderAmount || 0,
                maxDiscount: coupon.maxDiscount || null,
                isLifetime: Boolean(coupon.isLifetime),
                subtotal: parsedSubtotal,
                finalTotal: Math.max(0, parsedSubtotal - discountAmount),
                verifiedAt: new Date().toISOString()
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
        console.error('Error validating coupon:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to validate coupon from server', error: error.message },
            { status: 500 }
        );
    }
}
