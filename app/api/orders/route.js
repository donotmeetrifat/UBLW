import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getStoreSettings, calculateDeliveryCharge } from '@/lib/settings';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload?.id) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to view orders.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (isDatabaseConfigured()) {
            const where = payload.role === 'ADMIN' ? (userId ? { userId } : {}) : { userId: payload.id };

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
        orders = orders.filter(o => o.userId === payload.id);

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
        const payload = getUserFromRequest(request);
        if (!payload?.id) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to confirm and place an order.' },
                { status: 401 }
            );
        }

        let verifiedUser = null;
        if (isDatabaseConfigured()) {
            verifiedUser = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, email: true, name: true, phone: true, isActive: true }
            });

            if (!verifiedUser || verifiedUser.isActive === false) {
                return NextResponse.json(
                    { success: false, error: 'UNAUTHORIZED', message: 'User account not found or deactivated. Please sign in again.' },
                    { status: 401 }
                );
            }
        }

        const body = await request.json();
        const {
            items,
            address,
            paymentMethod = 'COD',
            transactionId = null,
            senderNumber = null,
            couponCode = null,
            customerNotes = '',
        } = body;

        const userId = verifiedUser?.id || payload.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Order must contain at least one item' }, { status: 400 });
        }

        if (!address) {
            return NextResponse.json({ success: false, message: 'Please provide a valid delivery address' }, { status: 400 });
        }

        // Normalize address fields (support all aliases: fullName/name, phoneNumber/phone, address/street, region/state)
        const recipientName = (address.fullName || address.name || address.recipientName || 'Valued Customer').trim();
        const recipientPhone = (address.phoneNumber || address.phone || address.mobile || address.contactNumber || '').trim();
        const streetAddress = (address.address || address.street || address.streetAddress || 'Address on file').trim();
        const region = (address.region || address.state || address.division || 'Dhaka').trim();
        const city = (address.city || address.district || 'Dhaka').trim();
        const area = (address.area || address.thana || '').trim();

        if (!recipientPhone) {
            return NextResponse.json({ success: false, message: 'Recipient contact phone number is required' }, { status: 400 });
        }

        const normalizedAddress = {
            ...address,
            fullName: recipientName,
            name: recipientName,
            phoneNumber: recipientPhone,
            phone: recipientPhone,
            address: streetAddress,
            street: streetAddress,
            region,
            state: region,
            city,
            area,
        };

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
        let appliedCouponId = null;

        if (couponCode) {
            const normalizedCode = couponCode.trim().toUpperCase();
            const coupon = isDatabaseConfigured()
                ? await prisma.coupon.findUnique({ where: { code: normalizedCode } })
                : memoryStore.getCouponByCode(normalizedCode);

            if (coupon && coupon.isActive) {
                const now = new Date();
                const startsValid = !coupon.startsAt || new Date(coupon.startsAt) <= now;
                const expiryValid = coupon.isLifetime || !coupon.expiresAt || new Date(coupon.expiresAt) >= now;
                const usageValid = !coupon.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit;
                
                let userValid = true;
                if (Array.isArray(coupon.allowedUserEmails) && coupon.allowedUserEmails.length > 0) {
                    const customerEmail = (verifiedUser?.email || payload.email || '').toLowerCase().trim();
                    userValid = coupon.allowedUserEmails.some(e => String(e).toLowerCase().trim() === customerEmail);
                }

                const minOrderValid = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;

                if (startsValid && expiryValid && usageValid && userValid && minOrderValid) {
                    if (coupon.discountType === 'FIXED') {
                        discount = Math.min(coupon.discount, subtotal);
                    } else {
                        discount = Math.round((subtotal * coupon.discount) / 100);
                        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                            discount = coupon.maxDiscount;
                        }
                    }
                    isCouponUsed = true;
                    verifiedCouponCode = coupon.code;
                    appliedCouponId = coupon.id;
                }
            }
        }

        const settings = await getStoreSettings();
        const deliveryCharge = calculateDeliveryCharge(normalizedAddress, subtotal, settings.delivery);
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
            senderNumber: senderNumber ? senderNumber.trim() : null,
            customerNotes: customerNotes || null,
            isCouponUsed,
            couponCode: verifiedCouponCode,
            address: normalizedAddress,
            orderItems: processedItems,
        };

        if (isDatabaseConfigured()) {
            try {
                // Attach order strictly to the verified customer account
                const user = verifiedUser;

                // Create address in DB
                const savedAddress = await prisma.address.create({
                    data: {
                        userId: user.id,
                        fullName: recipientName,
                        phoneNumber: recipientPhone,
                        region,
                        city,
                        area,
                        address: streetAddress,
                    }
                });

                // Find or link active store
                const store = await prisma.store.findFirst();
                const validStoreId = store ? store.id : 'store_ukbl_main';

                // Resolve each product ID against real DB products to prevent foreign key errors
                const allDbProducts = await prisma.product.findMany({ select: { id: true, name: true } });
                const resolvedOrderItems = processedItems.map(item => {
                    const matched = allDbProducts.find(p => p.id === item.productId) || 
                                    allDbProducts.find(p => p.name.toLowerCase() === (item.name || '').toLowerCase()) ||
                                    allDbProducts[0];
                    return {
                        productId: matched ? matched.id : item.productId,
                        name: item.name,
                        image: typeof item.image === 'string' ? item.image : '/product_img1.png',
                        price: item.price,
                        quantity: item.quantity,
                    };
                });

                const order = await prisma.order.create({
                    data: {
                        orderNumber,
                        userId: user.id,
                        storeId: validStoreId,
                        addressId: savedAddress.id,
                        subtotal,
                        discount,
                        deliveryCharge,
                        total,
                        status: 'ORDER_PLACED',
                        paymentMethod: paymentMethod.toUpperCase(),
                        paymentStatus: 'PENDING',
                        transactionId: transactionId ? transactionId.trim() : null,
                        senderNumber: senderNumber ? senderNumber.trim() : null,
                        customerNotes: customerNotes || null,
                        isCouponUsed,
                        couponCode: verifiedCouponCode,
                        orderItems: {
                            create: resolvedOrderItems,
                        }
                    },
                    include: {
                        orderItems: {
                            include: { product: true }
                        },
                        address: true,
                        user: {
                            select: { id: true, name: true, email: true, phone: true }
                        }
                    }
                });

                // If a coupon was successfully redeemed, increment its usage counter
                if (isCouponUsed && appliedCouponId) {
                    try {
                        await prisma.coupon.update({
                            where: { id: appliedCouponId },
                            data: { usedCount: { increment: 1 } }
                        });
                    } catch (coupErr) {
                        console.warn('Coupon counter increment note:', coupErr.message);
                    }
                }

                // Remove purchased items from user's bag in database
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        select: { cart: true }
                    });
                    const currentCart = (existingUser?.cart && typeof existingUser.cart === 'object') ? { ...existingUser.cart } : {};
                    for (const item of items) {
                        const pid = item.productId || item.id;
                        if (pid && currentCart[pid] !== undefined) {
                            delete currentCart[pid];
                        }
                    }
                    const remainingCount = Object.keys(currentCart).length;
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            cart: currentCart,
                            abandonedCartAt: remainingCount === 0 ? null : new Date()
                        }
                    });
                } catch (cartErr) {
                    console.error('Failed to update remaining user cart in DB:', cartErr);
                }

                return NextResponse.json({ success: true, order }, { status: 201 });
            } catch (dbError) {
                console.error('Database write error, falling back to memory store:', dbError);
                const newOrder = memoryStore.addOrder(orderData);
                return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
            }
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

