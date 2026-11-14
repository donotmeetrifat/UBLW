import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const url = request ? new URL(request.url) : null;
        const period = url?.searchParams.get('period') || 'all_time';
        const customStartDate = url?.searchParams.get('startDate');
        const customEndDate = url?.searchParams.get('endDate');

        const now = new Date();
        let startDate = null;
        let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        let periodLabel = 'All Time';

        switch (period) {
            case 'daily':
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                periodLabel = 'Today (24 Hours)';
                break;
            case 'three_days':
            case '3d':
                startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                periodLabel = 'Last 3 Days';
                break;
            case 'weekly':
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                periodLabel = 'Weekly (Last 7 Days)';
                break;
            case 'monthly':
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                periodLabel = 'Monthly (Last 30 Days)';
                break;
            case 'three_months':
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                periodLabel = 'Last 3 Months';
                break;
            case 'six_months':
            case '180d':
                startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                periodLabel = 'Last 6 Months';
                break;
            case 'one_year':
            case '365d':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                periodLabel = 'Last 1 Year';
                break;
            case 'custom':
                if (customStartDate) {
                    startDate = new Date(customStartDate);
                    startDate.setHours(0, 0, 0, 0);
                }
                if (customEndDate) {
                    endDate = new Date(customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                }
                periodLabel = customStartDate && customEndDate
                    ? `${customStartDate} to ${customEndDate}`
                    : 'Custom Period';
                break;
            case 'all_time':
            default:
                startDate = null;
                periodLabel = 'All Time History';
                break;
        }

        const dateFilter = startDate ? {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        } : {};

        if (isDatabaseConfigured()) {
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

            const [
                productsCount,
                recentOrders,
                totalCustomersCount,
                periodCustomersCount,
                totalViewsAgg,
                topProducts,
                revenueAgg,
                todayRevenueAgg,
                statusCounts,
                allTimeRevenueAgg
            ] = await Promise.all([
                // 1. Total Catalog Products in store inventory
                prisma.product.count(),

                // 2. Orders placed within the selected duration
                prisma.order.findMany({
                    where: dateFilter,
                    take: 12,
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
                        cancelReason: true,
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

                // 3. Total customers in store
                prisma.user.count(),

                // 4. New customers registered during this duration
                prisma.user.count({
                    where: dateFilter
                }),

                // 5. Total product views in store
                prisma.product.aggregate({ _sum: { views: true } }),

                // 6. Top viewed products
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

                // 7. Non-cancelled revenue & orders within this selected duration
                prisma.order.aggregate({
                    _sum: { total: true },
                    _count: { id: true },
                    where: {
                        status: { not: 'CANCELLED' },
                        ...dateFilter
                    }
                }),

                // 8. Today's revenue & orders
                prisma.order.aggregate({
                    _sum: { total: true },
                    _count: { id: true },
                    where: {
                        status: { not: 'CANCELLED' },
                        createdAt: { gte: startOfToday }
                    }
                }),

                // 9. Status counts within this selected duration
                prisma.order.groupBy({
                    by: ['status'],
                    _count: { id: true },
                    where: dateFilter
                }),

                // 10. All-time non-cancelled revenue & orders
                prisma.order.aggregate({
                    _sum: { total: true },
                    _count: { id: true },
                    where: { status: { not: 'CANCELLED' } }
                })
            ]);

            const periodOrdersCount = revenueAgg._count?.id || 0;
            const periodRevenue = Number(revenueAgg._sum?.total || 0);
            const todayOrdersCount = todayRevenueAgg._count?.id || 0;
            const todayRevenue = Number(todayRevenueAgg._sum?.total || 0);
            const allTimeRevenue = Number(allTimeRevenueAgg._sum?.total || 0);
            const allTimeOrders = Number(allTimeRevenueAgg._count?.id || 0);

            // Status counts from single groupBy within the selected duration
            let pendingOrders = 0;
            let deliveredOrders = 0;
            let cancelledOrders = 0;
            (statusCounts || []).forEach(sc => {
                if (['ORDER_PLACED', 'CONFIRMED', 'PROCESSING'].includes(sc.status)) {
                    pendingOrders += sc._count?.id || 0;
                }
                if (sc.status === 'DELIVERED') {
                    deliveredOrders += sc._count?.id || 0;
                }
                if (sc.status === 'CANCELLED') {
                    cancelledOrders += sc._count?.id || 0;
                }
            });

            // Average Order Value (AOV)
            const aov = periodOrdersCount > 0 ? (periodRevenue / periodOrdersCount).toFixed(2) : '0.00';

            const dashboardResultData = {
                products: productsCount,
                revenue: periodRevenue.toFixed(2),
                orders: periodOrdersCount,
                customers: totalCustomersCount,
                newCustomersInPeriod: periodCustomersCount,
                totalViews: totalViewsAgg._sum?.views || 0,
                todayOrders: todayOrdersCount,
                todayRevenue: todayRevenue.toFixed(2),
                allTimeRevenue: allTimeRevenue.toFixed(2),
                allTimeOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                averageOrderValue: aov,
                periodInfo: {
                    key: period,
                    label: periodLabel,
                    startDate: startDate ? startDate.toISOString() : null,
                    endDate: endDate.toISOString()
                },
                topProducts: topProducts.map(p => ({
                    ...p,
                    image: Array.isArray(p.images) && p.images[0] ? p.images[0] : null
                })),
                recentOrders: recentOrders.map(order => ({
                    ...order,
                    customerName: order.address?.fullName || order.user?.name || 'Valued Customer',
                    customerContact: order.address?.phoneNumber || order.user?.phone || order.user?.email || 'Direct Order'
                })),
            };

            return NextResponse.json({
                success: true,
                timestamp: Date.now(),
                dashboardData: dashboardResultData
            }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        }

        // Memory Store Fallback
        const memOrders = memoryStore.getOrders();
        const memProducts = memoryStore.getProducts();
        const nonCancelled = memOrders.filter(o => o.status !== 'CANCELLED');
        const revenue = nonCancelled.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const totalViews = memProducts.reduce((acc, p) => acc + (p.views || 0), 0);

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            dashboardData: {
                products: memProducts.length,
                revenue: revenue.toFixed(2),
                orders: memOrders.length,
                customers: 1,
                newCustomersInPeriod: 1,
                totalViews,
                todayOrders: 0,
                todayRevenue: '0.00',
                allTimeRevenue: revenue.toFixed(2),
                allTimeOrders: memOrders.length,
                pendingOrders: memOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
                deliveredOrders: memOrders.filter(o => o.status === 'DELIVERED').length,
                cancelledOrders: memOrders.filter(o => o.status === 'CANCELLED').length,
                averageOrderValue: memOrders.length > 0 ? (revenue / memOrders.length).toFixed(2) : '0.00',
                periodInfo: {
                    key: period,
                    label: periodLabel,
                    startDate: startDate ? startDate.toISOString() : null,
                    endDate: endDate.toISOString()
                },
                topProducts: memProducts.slice(0, 5),
                recentOrders: memOrders.slice(0, 8),
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
