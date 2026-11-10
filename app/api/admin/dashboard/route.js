import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const [productsCount, orders, storesCount] = await Promise.all([
                prisma.product.count(),
                prisma.order.findMany({
                    select: { total: true, createdAt: true, status: true },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.store.count(),
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
                    allOrders: orders.slice(0, 10),
                }
            });
        }

        const orders = memoryStore.getOrders();
        const products = memoryStore.getProducts();
        const revenue = orders
            .filter(o => o.status !== 'CANCELLED')
            .reduce((acc, curr) => acc + (curr.total || 0), 0);

        return NextResponse.json({
            success: true,
            dashboardData: {
                products: products.length,
                revenue: revenue.toFixed(2),
                orders: orders.length,
                stores: 1,
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
