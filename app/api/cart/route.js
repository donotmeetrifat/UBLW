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

        // If authenticated user
        if (payload?.id && isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, cart: true }
            });

            if (user) {
                const cartObj = (user.cart && typeof user.cart === 'object') ? user.cart : {};
                return NextResponse.json({
                    success: true,
                    cartItems: cartObj,
                    total: calculateTotal(cartObj),
                    isGuest: false,
                });
            }
        }

        // Guest visitor fallback
        return NextResponse.json({
            success: true,
            cartItems: {},
            total: 0,
            isGuest: true,
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json({ success: false, cartItems: {}, total: 0 }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = getUserFromRequest(request);
        const body = await request.json();
        const cartItems = (body.cartItems && typeof body.cartItems === 'object') ? body.cartItems : {};
        const total = typeof body.total === 'number' ? body.total : calculateTotal(cartItems);

        const response = NextResponse.json({
            success: true,
            cartItems,
            total,
            message: 'Cart synchronized successfully'
        });

        // If authenticated, persist to user's database record
        if (payload?.id && isDatabaseConfigured()) {
            try {
                const hasItems = Object.keys(cartItems).length > 0 && total > 0;
                await prisma.user.update({
                    where: { id: payload.id },
                    data: {
                        cart: cartItems,
                        abandonedCartAt: hasItems ? new Date() : null,
                        lastActiveAt: new Date(),
                    }
                });
            } catch (dbErr) {
                console.error('Failed to update cart in database:', dbErr);
            }
        }

        // Set lightweight cookie for guest / fast server verification
        response.cookies.set('ukbl_cart_total', String(total), {
            path: '/',
            maxAge: 30 * 24 * 60 * 60,
            sameSite: 'lax',
        });

        return response;
    } catch (error) {
        console.error('Error saving cart:', error);
        return NextResponse.json({ success: false, message: 'Failed to sync cart' }, { status: 500 });
    }
}

