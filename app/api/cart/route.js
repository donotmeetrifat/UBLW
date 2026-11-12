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
            return NextResponse.json({
                success: true,
                cartItems: cartObj,
                total: calculateTotal(cartObj),
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
            const cartItems = (body.cartItems && typeof body.cartItems === 'object') ? body.cartItems : {};
            const total = typeof body.total === 'number' ? body.total : calculateTotal(cartItems);

            const hasItems = Object.keys(cartItems).length > 0 && total > 0;
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    cart: cartItems,
                    abandonedCartAt: hasItems ? new Date() : null,
                    lastActiveAt: new Date(),
                }
            });

            const response = NextResponse.json({
                success: true,
                cartItems,
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

