import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { rating, review, productId, orderId, userName } = body;

        if (!rating || !productId) {
            return NextResponse.json({ success: false, message: 'Rating and productId are required' }, { status: 400 });
        }

        const ratingNum = Math.min(5, Math.max(1, Number(rating)));

        if (isDatabaseConfigured()) {
            // Find or create customer
            const user = await prisma.user.findFirst();

            const savedRating = await prisma.rating.create({
                data: {
                    rating: ratingNum,
                    review: review || '100% authentic UK product, highly satisfied!',
                    productId,
                    orderId: orderId || null,
                    userId: user ? user.id : 'user_guest',
                    isVerifiedPurchase: true,
                }
            });

            return NextResponse.json({ success: true, rating: savedRating });
        }

        const mockRating = {
            id: `rat_${Date.now()}`,
            rating: ratingNum,
            review: review || 'Authentic UK beauty product, delivered quickly!',
            productId,
            orderId: orderId || null,
            user: { name: userName || 'Verified Customer' },
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, rating: mockRating });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit review', error: error.message },
            { status: 500 }
        );
    }
}

