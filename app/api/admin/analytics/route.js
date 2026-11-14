import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const [products, ordersAgg, orderItems, usersWithCart] = await Promise.all([
                prisma.product.findMany({
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        brand: true,
                        price: true,
                        mrp: true,
                        images: true,
                        stockCount: true,
                        inStock: true,
                        views: true,
                        ratings: { select: { rating: true } }
                    },
                    orderBy: [
                        { views: 'desc' },
                        { updatedAt: 'desc' }
                    ]
                }),
                // Total non-cancelled orders count & revenue directly aggregated
                prisma.order.aggregate({
                    _sum: { total: true },
                    _count: { id: true },
                    where: { status: { not: 'CANCELLED' } }
                }),
                // All non-cancelled order items for precise product-level sales & revenue
                prisma.orderItem.findMany({
                    where: {
                        order: { status: { not: 'CANCELLED' } }
                    },
                    select: {
                        productId: true,
                        price: true,
                        quantity: true,
                        orderId: true
                    }
                }).catch(() => []),
                // User carts to calculate active in-bag additions
                prisma.user.findMany({
                    select: { cart: true },
                    take: 500
                }).catch(() => [])
            ]);

            // Map product sales
            const salesMap = {};
            (orderItems || []).forEach(item => {
                if (item.productId) {
                    if (!salesMap[item.productId]) {
                        salesMap[item.productId] = {
                            unitsBought: 0,
                            revenue: 0,
                            orderIds: new Set()
                        };
                    }
                    const q = Number(item.quantity) || 1;
                    const pr = Number(item.price) || 0;
                    salesMap[item.productId].unitsBought += q;
                    salesMap[item.productId].revenue += q * pr;
                    salesMap[item.productId].orderIds.add(item.orderId);
                }
            });

            // Calculate active in-cart additions per product from real users
            const cartCounts = {};
            (usersWithCart || []).forEach(u => {
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
                const sales = salesMap[p.id] || { unitsBought: 0, revenue: 0, orderIds: new Set() };
                const unitsBought = sales.unitsBought;
                const ordersCount = sales.orderIds.size;
                const revenue = sales.revenue;
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

                const firstImage = Array.isArray(p.images) && p.images.length > 0
                    ? p.images[0]
                    : (typeof p.images === 'string' ? p.images : null);

                return {
                    id: p.id,
                    name: p.name,
                    category: p.category || 'General',
                    brand: p.brand || 'UK Import',
                    price: p.price,
                    mrp: p.mrp,
                    image: firstImage,
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
            const totalRevenue = Number(ordersAgg?._sum?.total || 0);
            const totalOrders = Number(ordersAgg?._count?.id || 0);
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
                        totalOrders,
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
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : null,
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
