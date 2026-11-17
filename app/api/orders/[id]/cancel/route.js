import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to cancel an order.' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const { reason = 'Cancelled by customer', customReason = '', cancelledBy = 'CUSTOMER' } = body;

        const mainReason = (reason || 'Cancelled by customer').trim();
        const detail = (customReason || '').trim();
        const finalReason = detail && detail !== mainReason ? `${mainReason} (${detail})` : mainReason;

        if (isDatabaseConfigured()) {
            const existingOrder = await prisma.order.findFirst({
                where: {
                    OR: [{ id }, { orderNumber: id }]
                },
                include: {
                    orderItems: { include: { product: true } },
                    address: true,
                    user: true
                }
            });

            if (!existingOrder) {
                return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
            }

            // Authorization: Staff with orders permission OR the customer who owns the order
            const isStaff = currentUser.role === 'ADMIN' || 
                (currentUser.role === 'EMPLOYEE' && (currentUser.permissions?.includes('orders') || currentUser.permissions?.includes('*')));
            const isOwner = (existingOrder.userId && existingOrder.userId === currentUser.id) ||
                (existingOrder.userEmail && currentUser.email && existingOrder.userEmail.toLowerCase() === currentUser.email.toLowerCase());

            if (!isStaff && !isOwner) {
                return NextResponse.json(
                    { success: false, error: 'FORBIDDEN', message: 'You do not have permission to cancel this order.' },
                    { status: 403 }
                );
            }

            if (existingOrder.status === 'CANCELLED') {
                return NextResponse.json({ 
                    success: true, 
                    order: existingOrder, 
                    message: 'Order is already cancelled' 
                });
            }

            // Customer cannot cancel if order has already arrived/delivered
            if (existingOrder.status === 'DELIVERED' && cancelledBy === 'CUSTOMER') {
                return NextResponse.json({ 
                    success: false, 
                    message: 'Delivered orders cannot be cancelled directly. Please contact customer care for returns/exchanges.' 
                }, { status: 400 });
            }

            // 1. Restore product stock counts in database
            for (const item of existingOrder.orderItems) {
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
                        console.warn('Stock restore error for', item.productId, stockErr.message);
                    }
                }
            }

            // 2. Decrement coupon usage if coupon was used
            if (existingOrder.isCouponUsed && existingOrder.couponCode) {
                try {
                    await prisma.coupon.updateMany({
                        where: { code: { equals: existingOrder.couponCode, mode: 'insensitive' } },
                        data: { usedCount: { decrement: 1 } }
                    });
                } catch (coupErr) {
                    console.warn('Coupon counter restore note:', coupErr.message);
                }
            }

            // 3. Update order status to CANCELLED with audit reason
            const updatedOrder = await prisma.order.update({
                where: { id: existingOrder.id },
                data: {
                    status: 'CANCELLED',
                    cancelReason: finalReason,
                    cancelledAt: new Date()
                },
                include: {
                    orderItems: { include: { product: true } },
                    address: true,
                    user: true
                }
            });

            return NextResponse.json({
                success: true,
                order: updatedOrder,
                message: 'Order has been successfully cancelled and stock restored to inventory.'
            });
        }

        // Memory store fallback
        const updatedMem = memoryStore.updateOrder(id, {
            status: 'CANCELLED',
            cancelReason: finalReason,
            cancelledAt: new Date().toISOString()
        });

        if (!updatedMem) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            order: updatedMem,
            message: 'Order has been successfully cancelled.'
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to cancel order', error: error.message },
            { status: 500 }
        );
    }
}
