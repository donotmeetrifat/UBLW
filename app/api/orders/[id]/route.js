import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getCurrentUser, requireStaff } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to view this order.' },
                { status: 401 }
            );
        }

        const { id } = await params;

        let order = null;
        if (isDatabaseConfigured()) {
            order = await prisma.order.findFirst({
                where: {
                    OR: [{ id }, { orderNumber: id }]
                },
                include: {
                    orderItems: { include: { product: true } },
                    address: true,
                    user: true,
                }
            });
        } else {
            order = memoryStore.getOrderById(id);
        }

        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // Authorization check: Staff with orders permission OR the customer who owns the order
        const isStaff = currentUser.role === 'ADMIN' || 
            (currentUser.role === 'EMPLOYEE' && (currentUser.permissions?.includes('orders') || currentUser.permissions?.includes('*')));
        const isOwner = (order.userId && order.userId === currentUser.id) ||
            (order.userEmail && currentUser.email && order.userEmail.toLowerCase() === currentUser.email.toLowerCase());

        if (!isStaff && !isOwner) {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'You do not have permission to view this order.' },
                { status: 403 }
            );
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
        // Enforce Staff Authentication with 'orders' permission
        const auth = await requireStaff(request, 'orders');
        if (!auth.authorized) {
            return auth.response;
        }

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

