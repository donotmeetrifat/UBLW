import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const [
                productsCount,
                recentOrders,
                customersCount,
                totalViewsAgg,
                topProducts,
                revenueAgg,
                todayRevenueAgg,
                statusCounts
            ] = await Promise.all([
                prisma.product.count(),
                // Only fetch top 8 recent orders for display (massive performance boost)
                prisma.order.findMany({
                    take: 8,
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        subtotal: true,
                        deliveryCharge: true,
                        discount: true,
                        createdAt: true,
                        status: true,
                        paymentMethod: true,
                        paymentStatus: true,
                        user: {
                            select: { id: true, name: true, email: true, phone: true }
                        },
                        address: {
                            select: { fullName: true, phoneNumber: true, city: true, address: true, region: true }
                        },
                        orderItems: {
                            select: { quantity: true, name: true, price: true, image: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                // Count all genuine registered user accounts in the store
                prisma.user.count(),
                prisma.product.aggregate({ _sum: { views: true } }),
                prisma.product.findMany({
                    take: 5,
                    orderBy: [
                        { views: 'desc' },
                        { updatedAt: 'desc' }
                    ],
                    select: { 
                        id: true, 
                        name: true, 
                        category: true, 
                        brand: true, 
                        price: true, 
                        views: true, 
                        images: true, 
                        stockCount: true, 
                        inStock: true 
                    }
                }),
                // Fast direct DB aggregation for all-time non-cancelled revenue & count
                prisma.order.aggregate({
                    _sum: { total: true },
                    _count: { id: true },
                    where: { status: { not: 'CANCELLED' } }
                }),
                // Fast direct DB aggregation for today's revenue & count
                prisma.order.aggregate({
                    _sum: { total: true },
                    _count: { id: true },
                    where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfToday } }
                }),
                // Fast group count by status
                prisma.order.groupBy({
                    by: ['status'],
                    _count: { id: true }
                })
            ]);

            const totalOrdersCount = revenueAgg._count?.id || 0;
            const revenue = revenueAgg._sum?.total || 0;
            const todayOrdersCount = todayRevenueAgg._count?.id || 0;
            const todayRevenue = todayRevenueAgg._sum?.total || 0;

            // Status counts from single groupBy
            let pendingOrders = 0;
            let deliveredOrders = 0;
            (statusCounts || []).forEach(sc => {
                if (['ORDER_PLACED', 'CONFIRMED', 'PROCESSING'].includes(sc.status)) {
                    pendingOrders += sc._count?.id || 0;
                }
                if (sc.status === 'DELIVERED') {
                    deliveredOrders += sc._count?.id || 0;
                }
            });

            return NextResponse.json({
                success: true,
                timestamp: Date.now(),
                dashboardData: {
                    products: productsCount,
                    revenue: revenue.toFixed(2),
                    orders: totalOrdersCount,
                    customers: customersCount,
                    totalViews: totalViewsAgg._sum?.views || 0,
                    todayOrders: todayOrdersCount,
                    todayRevenue: todayRevenue.toFixed(2),
                    pendingOrders,
                    deliveredOrders,
                    topProducts: topProducts.map(p => ({
                        ...p,
                        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/product_img1.png'
                    })),
                    recentOrders: recentOrders.map(order => ({
                        ...order,
                        customerName: order.address?.fullName || order.user?.name || 'Valued Customer',
                        customerContact: order.address?.phoneNumber || order.user?.phone || order.user?.email || 'Direct Order'
                    })),
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
        const orders = memoryStore.getOrders();
        const products = memoryStore.getProducts();
        const nonCancelled = orders.filter(o => o.status !== 'CANCELLED');
        const revenue = nonCancelled.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            dashboardData: {
                products: products.length,
                revenue: revenue.toFixed(2),
                orders: orders.length,
                customers: 1,
                totalViews,
                todayOrders: 0,
                todayRevenue: '0.00',
                pendingOrders: orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
                deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
                topProducts: products.slice(0, 5),
                recentOrders: orders.slice(0, 8),
            }
        });
    } catch (error) {
        console.error('Error fetching admin dashboard metrics:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch admin metrics', error: error.message },
            { status: 500 }
        );
    }
}
