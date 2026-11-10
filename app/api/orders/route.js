import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (isDatabaseConfigured()) {
            const where = {};
            if (userId) where.userId = userId;

            const orders = await prisma.order.findMany({
                where,
                include: {
                    orderItems: {
                        include: { product: true }
                    },
                    address: true,
                    user: true,
                },
                orderBy: { createdAt: 'desc' }
            });

            return NextResponse.json({ success: true, orders });
        }

        let orders = memoryStore.getOrders();
        if (userId) {
            orders = orders.filter(o => o.userId === userId);
        }

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch orders', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            items,
            address,
            paymentMethod = 'COD',
            transactionId = null,
            couponCode = null,
            customerNotes = '',
            userId = 'guest_customer'
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Order must contain at least one item' }, { status: 400 });
        }

        if (!address || !address.fullName || !address.phoneNumber) {
            return NextResponse.json({ success: false, message: 'Recipient name and phone number are required' }, { status: 400 });
        }

        // Calculate subtotal
        let subtotal = 0;
        const processedItems = items.map(item => {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            subtotal += price * qty;
            return {
                productId: item.productId || item.id,
                name: item.name,
                image: Array.isArray(item.images) ? item.images[0] : (item.image || '/product_img1.png'),
                price,
                quantity: qty,
            };
        });

        // Calculate coupon discount
        let discount = 0;
        let isCouponUsed = false;
        let verifiedCouponCode = null;

        if (couponCode) {
            const coupon = isDatabaseConfigured()
                ? await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } })
                : memoryStore.getCouponByCode(couponCode);

            if (coupon && coupon.isActive && (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)) {
                discount = Math.round((subtotal * coupon.discount) / 100);
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount;
                }
                isCouponUsed = true;
                verifiedCouponCode = coupon.code;
            }
        }

        const deliveryCharge = 0; // 100% Free Nationwide Delivery across Bangladesh
        const total = Math.max(0, subtotal - discount + deliveryCharge);
        const orderNumber = `UKBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const orderData = {
            orderNumber,
            userId,
            storeId: 'store_ukbl_main',
            subtotal,
            discount,
            deliveryCharge,
            total,
            status: 'ORDER_PLACED',
            paymentMethod: paymentMethod.toUpperCase(),
            paymentStatus: paymentMethod.toUpperCase() === 'COD' ? 'PENDING' : (transactionId ? 'PENDING' : 'PENDING'),
            transactionId: transactionId ? transactionId.trim() : null,
            customerNotes: customerNotes || null,
            isCouponUsed,
            couponCode: verifiedCouponCode,
            address,
            orderItems: processedItems,
        };

        if (isDatabaseConfigured()) {
            // Find or create user
            const user = await prisma.user.upsert({
                where: { email: address.email || `${address.phoneNumber}@ukbrandlover.com` },
                update: { name: address.fullName, phone: address.phoneNumber },
                create: {
                    name: address.fullName,
                    email: address.email || `${address.phoneNumber}@ukbrandlover.com`,
                    phone: address.phoneNumber,
                }
            });

            // Create address
            const savedAddress = await prisma.address.create({
                data: {
                    userId: user.id,
                    fullName: address.fullName,
                    phoneNumber: address.phoneNumber,
                    region: address.region || 'Dhaka',
                    city: address.city || 'Dhaka',
                    area: address.area || '',
                    address: address.address || address.street || 'Address not specified',
                }
            });

            // Find store
            const store = await prisma.store.findFirst();

            const order = await prisma.order.create({
                data: {
                    orderNumber,
                    userId: user.id,
                    storeId: store ? store.id : 'store_ukbl_main',
                    addressId: savedAddress.id,
                    subtotal,
                    discount,
                    deliveryCharge,
                    total,
                    status: 'ORDER_PLACED',
                    paymentMethod: paymentMethod.toUpperCase(),
                    paymentStatus: 'PENDING',
                    transactionId: transactionId ? transactionId.trim() : null,
                    customerNotes: customerNotes || null,
                    isCouponUsed,
                    couponCode: verifiedCouponCode,
                    orderItems: {
                        create: processedItems.map(item => ({
                            productId: item.productId,
                            name: item.name,
                            image: typeof item.image === 'string' ? item.image : '/product_img1.png',
                            price: item.price,
                            quantity: item.quantity,
                        }))
                    }
                },
                include: {
                    orderItems: true,
                    address: true,
                }
            });

            return NextResponse.json({ success: true, order }, { status: 201 });
        }

        const newOrder = memoryStore.addOrder(orderData);
        return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    } catch (error) {
        console.error('Error placing order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to place order', error: error.message },
            { status: 500 }
        );
    }
}
