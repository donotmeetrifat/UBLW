import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (isDatabaseConfigured()) {
            const coupon = await prisma.coupon.findUnique({
                where: { id }
            });

            if (!coupon) {
                return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, coupon });
        }

        const coupon = memoryStore.getCoupons().find(c => c.id === id);
        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, coupon });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error retrieving coupon', error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const updates = await request.json();

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
            }

            const coupon = await prisma.coupon.update({
                where: { id },
                data: {
                    ...cleanedData,
                    updatedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: `Coupon ${coupon.code} updated successfully!`,
                coupon
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
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update coupon', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (isDatabaseConfigured()) {
            const coupon = await prisma.coupon.findUnique({ where: { id } });
            if (!coupon) {
                return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
            }

            await prisma.coupon.delete({ where: { id } });

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

