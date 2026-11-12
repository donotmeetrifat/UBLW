import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const [productsCount, orders, storesCount, totalViewsAgg, topProducts] = await Promise.all([
                prisma.product.count(),
                prisma.order.findMany({
                    select: { total: true, createdAt: true, status: true },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.store.count(),
                prisma.product.aggregate({ _sum: { views: true } }),
                prisma.product.findMany({
                    take: 5,
                    orderBy: { views: 'desc' },
                    select: { id: true, name: true, category: true, price: true, views: true, images: true }
                })
            ]);

            const revenue = orders
                .filter(o => o.status !== 'CANCELLED')
                .reduce((acc, curr) => acc + (curr.total || 0), 0);

            return NextResponse.json({
                success: true,
                dashboardData: {
                    products: productsCount,
                    revenue: revenue.toFixed(2),
                    orders: orders.length,
                    stores: storesCount || 1,
                    totalViews: totalViewsAgg._sum.views || 0,
                    topProducts: topProducts.map(p => ({
                        ...p,
                        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/product_img1.png'
                    })),
                    allOrders: orders.slice(0, 10),
                }
            });
        }

        const orders = memoryStore.getOrders();
        const products = memoryStore.getProducts();
        const revenue = orders
            .filter(o => o.status !== 'CANCELLED')
            .reduce((acc, curr) => acc + (curr.total || 0), 0);
        const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);

        return NextResponse.json({
            success: true,
            dashboardData: {
                products: products.length,
                revenue: revenue.toFixed(2),
                orders: orders.length,
                stores: 1,
                totalViews,
                topProducts: products.slice(0, 5),
                allOrders: orders,
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

