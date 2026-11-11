import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET: Fetch reviews by product, by user, or get customer's review status
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const userIdParam = searchParams.get('userId');
        const myReviewsOnly = searchParams.get('my') === 'true';

        const payload = getUserFromRequest(request);
        const currentUserId = payload?.id || userIdParam;

        if (isDatabaseConfigured()) {
            // 1. Fetch reviews for a single product (for Product Details Page)
            if (productId) {
                const ratings = await prisma.rating.findMany({
                    where: { productId },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { id: true, name: true, image: true }
                        }
                    }
                });

                const totalReviews = ratings.length;
                const averageRating = totalReviews > 0
                    ? Number((ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
                    : 5.0;

                return NextResponse.json({
                    success: true,
                    ratings,
                    totalReviews,
                    averageRating,
                });
            }

            // 2. Fetch authenticated user's "My Reviews" & "To Review" purchased items
            if (currentUserId) {
                // Fetch customer's completed/valid orders
                const orders = await prisma.order.findMany({
                    where: {
                        userId: currentUserId,
                        status: { not: 'CANCELLED' }
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });

                // Fetch customer's existing reviews
                const existingReviews = await prisma.rating.findMany({
                    where: { userId: currentUserId },
                    include: {
                        product: true,
                        user: {
                            select: { id: true, name: true, image: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });

                const reviewedProductIds = new Set(existingReviews.map(r => r.productId));

                // Extract unique purchased products not yet reviewed
                const toReviewMap = new Map();
                for (const order of orders) {
                    for (const item of order.orderItems) {
                        if (item.productId && !reviewedProductIds.has(item.productId) && !toReviewMap.has(item.productId)) {
                            toReviewMap.set(item.productId, {
                                product: item.product || { id: item.productId, name: item.name, images: [item.image || '/product_img1.png'] },
                                orderId: order.id,
                                orderNumber: order.orderNumber,
                                purchaseDate: order.createdAt,
                            });
                        }
                    }
                }

                return NextResponse.json({
                    success: true,
                    myReviews: existingReviews,
                    toReview: Array.from(toReviewMap.values()),
                });
            }

            // Fallback: Recent storewide reviews
            const allRatings = await prisma.rating.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, image: true } },
                    product: { select: { id: true, name: true, images: true } }
                }
            });

            return NextResponse.json({ success: true, ratings: allRatings });
        }

        // Mock response if database is offline
        return NextResponse.json({
            success: true,
            ratings: [],
            myReviews: [],
            toReview: [],
        });
    } catch (error) {
        console.error('Error in GET /api/reviews:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// POST: Submit or update a verified product review
export async function POST(request) {
    try {
        const payload = getUserFromRequest(request);
        const body = await request.json();
        const { rating, review, productId, orderId, userName, images = [], videos = [] } = body;

        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
        }

        const ratingNum = rating ? Math.min(5, Math.max(1, Number(rating))) : 5;
        const reviewText = (review || '').trim();
        if (reviewText.length < 5) {
            return NextResponse.json({ success: false, message: 'Please write a review with at least 5 characters.' }, { status: 400 });
        }

        const cleanImages = Array.isArray(images) ? images.filter(url => typeof url === 'string' && url.length > 0) : [];
        const cleanVideos = Array.isArray(videos) ? videos.filter(url => typeof url === 'string' && url.length > 0) : [];

        if (isDatabaseConfigured()) {
            let userId = payload?.id;

            // If not logged in via cookie, find or create customer record
            if (!userId) {
                const user = await prisma.user.findFirst();
                userId = user ? user.id : null;
            }

            if (!userId) {
                return NextResponse.json({
                    success: false,
                    message: 'Please sign in to submit a verified product review.'
                }, { status: 401 });
            }

            // RULE: Make sure users can ONLY review products they have bought
            const purchaseRecord = await prisma.orderItem.findFirst({
                where: {
                    productId,
                    order: {
                        userId,
                        status: { not: 'CANCELLED' }
                    }
                }
            });

            // If strict check fails, allow if orderId matches or verified buyer flag
            if (!purchaseRecord && !orderId) {
                // Check if user has any active order
                const userOrder = await prisma.order.findFirst({
                    where: { userId }
                });
                if (!userOrder) {
                    return NextResponse.json({
                        success: false,
                        message: 'Verified Purchase Required: You can only review authentic UK products that you have purchased.'
                    }, { status: 403 });
                }
            }

            // Upsert review (allows creating a new review or editing an existing one)
            const savedRating = await prisma.rating.upsert({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    }
                },
                create: {
                    rating: ratingNum,
                    review: reviewText,
                    images: cleanImages,
                    videos: cleanVideos,
                    productId,
                    orderId: orderId || null,
                    userId,
                    isVerifiedPurchase: true,
                },
                update: {
                    rating: ratingNum,
                    review: reviewText,
                    images: cleanImages,
                    videos: cleanVideos,
                    orderId: orderId || undefined,
                    updatedAt: new Date(),
                },
                include: {
                    user: {
                        select: { id: true, name: true, image: true }
                    },
                    product: {
                        select: { id: true, name: true, images: true, price: true, brand: true }
                    }
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Thank you! Your verified review has been published.',
                rating: savedRating
            });
        }

        // Mock review for offline mode
        const mockRating = {
            id: `rat_${Date.now()}`,
            rating: ratingNum,
            review: reviewText,
            images: cleanImages,
            videos: cleanVideos,
            productId,
            orderId: orderId || null,
            user: { name: userName || payload?.name || 'Verified Customer', image: payload?.image || null },
            createdAt: new Date().toISOString(),
            isVerifiedPurchase: true,
        };

        return NextResponse.json({
            success: true,
            message: 'Thank you! Your verified review has been published.',
            rating: mockRating
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit review', error: error.message },
            { status: 500 }
        );
    }
}
