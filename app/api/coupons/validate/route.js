import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function POST(request) {
    try {
        const { code, subtotal = 0 } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
        }

        const normalizedCode = code.trim().toUpperCase();

        if (isDatabaseConfigured()) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: normalizedCode },
            });

            if (!coupon || !coupon.isActive) {
                return NextResponse.json({ success: false, message: 'Invalid or expired coupon code' }, { status: 404 });
            }

            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
                return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
            }

            if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
                return NextResponse.json({
                    success: false,
                    message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount.toLocaleString()}`
                }, { status: 400 });
            }

            let discountAmount = Math.round((subtotal * coupon.discount) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }

            return NextResponse.json({
                success: true,
                coupon: {
                    code: coupon.code,
                    description: coupon.description,
                    discount: coupon.discount,
                    discountAmount,
                }
            });
        }

        const coupon = memoryStore.getCouponByCode(normalizedCode);
        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Invalid coupon code. Try NEW20, OFF10, or EID25' }, { status: 404 });
        }

        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return NextResponse.json({
                success: false,
                message: `Minimum order amount for ${coupon.code} is ৳${coupon.minOrderAmount.toLocaleString()}`
            }, { status: 400 });
        }

        const discountAmount = Math.round((subtotal * coupon.discount) / 100);

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
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

