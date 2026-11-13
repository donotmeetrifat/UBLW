import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const [products, orders, usersWithCart] = await Promise.all([
                prisma.product.findMany({
                    include: {
                        orderItems: {
                            include: {
                                order: {
                                    select: { id: true, status: true, createdAt: true }
                                }
                            }
                        },
                        ratings: { select: { rating: true } }
                    },
                    orderBy: [
                        { views: 'desc' },
                        { updatedAt: 'desc' }
                    ]
                }),
                prisma.order.findMany({
                    where: { status: { not: 'CANCELLED' } },
                    select: { id: true, total: true, createdAt: true, status: true }
                }),
                prisma.user.findMany({
                    select: { cart: true }
                })
            ]);

            // Calculate active in-cart additions per product from real users
            const cartCounts = {};
            usersWithCart.forEach(u => {
                if (u.cart && typeof u.cart === 'object') {
                    Object.entries(u.cart).forEach(([prodId, qty]) => {
                        const count = typeof qty === 'number' ? qty : (qty?.quantity || 1);
                        if (count > 0) {
                            cartCounts[prodId] = (cartCounts[prodId] || 0) + Number(count);
                        }
                    });
                }
            });

            // Aggregate authentic metrics per product
            const rankedProducts = products.map((p) => {
                const nonCancelledItems = (p.orderItems || []).filter(
                    item => item.order && item.order.status !== 'CANCELLED'
                );
                const unitsBought = nonCancelledItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
                const ordersCount = nonCancelledItems.length;
                const revenue = nonCancelledItems.reduce((acc, item) => acc + ((item.price || p.price) * (item.quantity || 1)), 0);
                const inCart = cartCounts[p.id] || 0;
                const views = Number(p.views || 0);

                // Authentic conversion rate: units sold / page views
                let conversionRate = 0;
                if (views > 0) {
                    conversionRate = parseFloat(((unitsBought / views) * 100).toFixed(1));
                } else if (unitsBought > 0) {
                    conversionRate = 100.0;
                }

                // Authentic ratings: never show fake 5.0 if product has 0 reviews
                const hasReviews = p.ratings && p.ratings.length > 0;
                const avgRating = hasReviews
                    ? parseFloat((p.ratings.reduce((sum, r) => sum + r.rating, 0) / p.ratings.length).toFixed(1))
                    : null;
                const reviewCount = hasReviews ? p.ratings.length : 0;

                return {
                    id: p.id,
                    name: p.name,
                    category: p.category || 'General',
                    brand: p.brand || 'UK Import',
                    price: p.price,
                    mrp: p.mrp,
                    image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/product_img1.png',
                    stockCount: p.stockCount,
                    inStock: p.inStock,
                    views,
                    unitsBought,
                    ordersCount,
                    inCart,
                    revenue,
                    conversionRate,
                    avgRating,
                    reviewCount
                };
            });

            // Rank strictly by views first, then unitsBought, then revenue
            rankedProducts.sort((a, b) => {
                if (b.views !== a.views) return b.views - a.views;
                if (b.unitsBought !== a.unitsBought) return b.unitsBought - a.unitsBought;
                return (b.revenue || 0) - (a.revenue || 0);
            });

            // Assign 1-based ranks
            rankedProducts.forEach((p, idx) => {
                p.rank = idx + 1;
            });

            const totalViews = rankedProducts.reduce((acc, p) => acc + p.views, 0);
            const totalUnitsSold = rankedProducts.reduce((acc, p) => acc + p.unitsBought, 0);
            const totalCartItems = Object.values(cartCounts).reduce((a, b) => a + b, 0);
            const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
            const overallConversion = totalViews > 0 
                ? parseFloat(((totalUnitsSold / totalViews) * 100).toFixed(1)) 
                : (totalUnitsSold > 0 ? 100.0 : 0);

            // Group by real category
            const categoryMap = {};
            rankedProducts.forEach(p => {
                const cat = p.category || 'Other';
                if (!categoryMap[cat]) {
                    categoryMap[cat] = { category: cat, views: 0, sales: 0, revenue: 0, productsCount: 0 };
                }
                categoryMap[cat].views += p.views;
                categoryMap[cat].sales += p.unitsBought;
                categoryMap[cat].revenue += p.revenue;
                categoryMap[cat].productsCount += 1;
            });

            const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.views - a.views);

            return NextResponse.json({
                success: true,
                timestamp: Date.now(),
                analytics: {
                    summary: {
                        totalViews,
                        totalUnitsSold,
                        totalOrders: orders.length,
                        totalCartItems,
                        totalRevenue,
                        overallConversion,
                        topViewedProduct: rankedProducts[0] || null,
                        secondTopViewed: rankedProducts[1] || null,
                        thirdTopViewed: rankedProducts[2] || null
                    },
                    topProducts: rankedProducts,
                    categoryBreakdown
                }
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        }

        // Memory Store Fallback
        const memProducts = memoryStore.getProducts();
        const memOrders = memoryStore.getOrders();
        const totalViews = memProducts.reduce((acc, p) => acc + (p.views || 0), 0);

        const ranked = memProducts.map((p, idx) => ({
            id: p.id,
            rank: idx + 1,
            name: p.name,
            category: p.category,
            brand: p.brand || 'UK Import',
            price: p.price,
            mrp: p.mrp,
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/product_img1.png',
            stockCount: p.stockCount || 50,
            inStock: p.inStock,
            views: p.views || 0,
            unitsBought: 0,
            ordersCount: 0,
            inCart: 0,
            revenue: 0,
            conversionRate: 0,
            avgRating: null,
            reviewCount: 0
        })).sort((a, b) => b.views - a.views);

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            analytics: {
                summary: {
                    totalViews,
                    totalUnitsSold: 0,
                    totalOrders: memOrders.length,
                    totalCartItems: 0,
                    totalRevenue: 0,
                    overallConversion: 0,
                    topViewedProduct: ranked[0] || null,
                    secondTopViewed: ranked[1] || null,
                    thirdTopViewed: ranked[2] || null
                },
                topProducts: ranked,
                categoryBreakdown: []
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to calculate analytics', error: error.message },
            { status: 500 }
        );
    }
}
