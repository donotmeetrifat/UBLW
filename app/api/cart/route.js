import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const calculateTotal = (cartItems) => {
    if (!cartItems || typeof cartItems !== 'object') return 0;
    return Object.values(cartItems).reduce((sum, qty) => sum + (typeof qty === 'number' && qty > 0 ? qty : 0), 0);
};

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);

        // Strict backend verification: unauthenticated visitors cannot access shopping bag
        if (!payload?.id) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to access your shopping bag.' },
                { status: 401 }
            );
        }

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, cart: true, isActive: true }
            });

            if (!user || user.isActive === false) {
                return NextResponse.json(
                    { success: false, error: 'UNAUTHORIZED', message: 'User account not found or deactivated.' },
                    { status: 401 }
                );
            }

            const cartObj = (user.cart && typeof user.cart === 'object') ? user.cart : {};
            const productIds = Object.keys(cartObj);

            let cleanCart = {};
            let isSanitized = false;

            if (productIds.length > 0) {
                // Verify all products exist and are active in the database
                const existingProducts = await prisma.product.findMany({
                    where: {
                        id: { in: productIds },
                        isActive: true
                    },
                    select: { id: true }
                });
                const validIdSet = new Set(existingProducts.map(p => p.id));

                for (const [id, qty] of Object.entries(cartObj)) {
                    if (validIdSet.has(id) && typeof qty === 'number' && qty > 0) {
                        cleanCart[id] = qty;
                    } else {
                        isSanitized = true;
                    }
                }

                // If ghost/deleted products were detected, automatically sanitize user's cart in database
                if (isSanitized) {
                    const cleanTotal = calculateTotal(cleanCart);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            cart: cleanCart,
                            abandonedCartAt: cleanTotal > 0 ? new Date() : null
                        }
                    });
                }
            }

            const verifiedTotal = calculateTotal(cleanCart);
            return NextResponse.json({
                success: true,
                cartItems: cleanCart,
                total: verifiedTotal,
                isGuest: false,
            });
        }

        return NextResponse.json({
            success: true,
            cartItems: {},
            total: 0,
            isGuest: false,
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json({ success: false, cartItems: {}, total: 0 }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = getUserFromRequest(request);

        // Strict backend verification: unauthenticated visitors cannot add items or update bag
        if (!payload?.id) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to add items to your shopping bag.' },
                { status: 401 }
            );
        }

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, isActive: true }
            });

            if (!user || user.isActive === false) {
                return NextResponse.json(
                    { success: false, error: 'UNAUTHORIZED', message: 'User account not found or deactivated.' },
                    { status: 401 }
                );
            }

            const body = await request.json();
            const rawCart = (body.cartItems && typeof body.cartItems === 'object') ? body.cartItems : {};
            const productIds = Object.keys(rawCart);

            let cleanCart = {};
            if (productIds.length > 0) {
                const existingProducts = await prisma.product.findMany({
                    where: {
                        id: { in: productIds },
                        isActive: true
                    },
                    select: { id: true }
                });
                const validIdSet = new Set(existingProducts.map(p => p.id));

                for (const [id, qty] of Object.entries(rawCart)) {
                    if (validIdSet.has(id) && typeof qty === 'number' && qty > 0) {
                        cleanCart[id] = qty;
                    }
                }
            }

            const total = calculateTotal(cleanCart);
            const hasItems = Object.keys(cleanCart).length > 0 && total > 0;
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    cart: cleanCart,
                    abandonedCartAt: hasItems ? new Date() : null,
                    lastActiveAt: new Date(),
                }
            });

            const response = NextResponse.json({
                success: true,
                cartItems: cleanCart,
                total,
                message: 'Cart synchronized successfully'
            });

            // Set lightweight cookie for fast server verification
            response.cookies.set('ukbl_cart_total', String(total), {
                path: '/',
                maxAge: 30 * 24 * 60 * 60,
                sameSite: 'lax',
            });

            return response;
        }

        return NextResponse.json({ success: true, message: 'Cart updated' });
    } catch (error) {
        console.error('Error saving cart:', error);
        return NextResponse.json({ success: false, message: 'Failed to sync cart' }, { status: 500 });
    }
}

