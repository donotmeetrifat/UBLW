import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const [productsCount, orders, customersCount, totalViewsAgg, topProducts] = await Promise.all([
                prisma.product.count(),
                prisma.order.findMany({
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        createdAt: true,
                        status: true,
                        paymentMethod: true,
                        user: {
                            select: { name: true, email: true, phone: true }
                        },
                        orderItems: {
                            select: { quantity: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where: { role: 'CUSTOMER' } }),
                prisma.product.aggregate({ _sum: { views: true } }),
                prisma.product.findMany({
                    take: 5,
                    orderBy: { views: 'desc' },
                    select: { id: true, name: true, category: true, price: true, views: true, images: true, stockCount: true }
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
                    customers: customersCount,
                    totalViews: totalViewsAgg._sum.views || 0,
                    topProducts: topProducts.map(p => ({
                        ...p,
                        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : '/product_img1.png'
                    })),
                    recentOrders: orders.slice(0, 8),
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
                customers: 1,
                totalViews,
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

