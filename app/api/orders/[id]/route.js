import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (isDatabaseConfigured()) {
            const order = await prisma.order.findFirst({
                where: {
                    OR: [{ id }, { orderNumber: id }]
                },
                include: {
                    orderItems: { include: { product: true } },
                    address: true,
                    user: true,
                }
            });

            if (!order) {
                return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, order });
        }

        const order = memoryStore.getOrderById(id);
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order', error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const updates = await request.json();

        if (isDatabaseConfigured()) {
            const prevOrder = await prisma.order.findFirst({
                where: { OR: [{ id }, { orderNumber: id }] },
                include: { orderItems: true }
            });

            if (!prevOrder) {
                return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
            }

            // If transitioning to CANCELLED from an active status, restore stock
            if (updates.status === 'CANCELLED' && prevOrder.status !== 'CANCELLED') {
                for (const item of prevOrder.orderItems) {
                    if (item.productId) {
                        try {
                            const currentProd = await prisma.product.findUnique({
                                where: { id: item.productId },
                                select: { id: true, stockCount: true }
                            });
                            if (currentProd) {
                                const currentStock = currentProd.stockCount !== null && currentProd.stockCount !== undefined ? currentProd.stockCount : 50;
                                const newStock = currentStock + (item.quantity || 1);
                                await prisma.product.update({
                                    where: { id: item.productId },
                                    data: {
                                        stockCount: newStock,
                                        inStock: true
                                    }
                                });
                            }
                        } catch (stockErr) {
                            console.warn('Stock restore error during PATCH:', item.productId, stockErr.message);
                        }
                    }
                }
                if (!updates.cancelledAt) updates.cancelledAt = new Date();
                if (!updates.cancelReason && !prevOrder.cancelReason) {
                    updates.cancelReason = 'Cancelled by administrator';
                }
            }

            // If transitioning FROM CANCELLED back to active, re-deduct stock
            if (prevOrder.status === 'CANCELLED' && updates.status && updates.status !== 'CANCELLED') {
                for (const item of prevOrder.orderItems) {
                    if (item.productId) {
                        try {
                            const currentProd = await prisma.product.findUnique({
                                where: { id: item.productId },
                                select: { id: true, stockCount: true }
                            });
                            if (currentProd) {
                                const currentStock = currentProd.stockCount !== null && currentProd.stockCount !== undefined ? currentProd.stockCount : 50;
                                const newStock = Math.max(0, currentStock - (item.quantity || 1));
                                await prisma.product.update({
                                    where: { id: item.productId },
                                    data: {
                                        stockCount: newStock,
                                        inStock: newStock > 0
                                    }
                                });
                            }
                        } catch (stockErr) {
                            console.warn('Stock deduction error during PATCH:', item.productId, stockErr.message);
                        }
                    }
                }
            }

            const order = await prisma.order.update({
                where: { id: prevOrder.id },
                data: updates,
                include: {
                    orderItems: true,
                    address: true,
                }
            });
            return NextResponse.json({ success: true, order });
        }

        const order = memoryStore.updateOrder(id, updates);
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update order', error: error.message },
            { status: 500 }
        );
    }
}

