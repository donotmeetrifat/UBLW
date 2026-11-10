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
            const order = await prisma.order.update({
                where: { id },
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

