import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        if (isDatabaseConfigured()) {
            const users = await prisma.user.findMany({
                where: {
                    role: 'CUSTOMER',
                    ...(search ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                            { phone: { contains: search } },
                            { whatsapp: { contains: search } },
                        ]
                    } : {})
                },
                include: {
                    orders: {
                        orderBy: { createdAt: 'desc' },
                        include: {
                            orderItems: {
                                include: {
                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                            images: true,
                                            category: true,
                                            brand: true,
                                            price: true
                                        }
                                    }
                                }
                            },
                            address: true
                        }
                    },
                    addresses: {
                        orderBy: { isDefault: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const enriched = users.map(user => {
                const nonCancelledOrders = user.orders.filter(o => o.status !== 'CANCELLED');
                const totalSpent = nonCancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);

                // Aggregate every product bought by this customer
                const productsPurchasedMap = {};
                let totalUnitsBought = 0;

                nonCancelledOrders.forEach(order => {
                    (order.orderItems || []).forEach(item => {
                        const prodId = item.productId || item.name;
                        const qty = item.quantity || 1;
                        totalUnitsBought += qty;

                        if (!productsPurchasedMap[prodId]) {
                            const prodImg = (item.image && !item.image.startsWith('/product_img')) 
                                ? item.image 
                                : ((Array.isArray(item.product?.images) && item.product.images[0] && !item.product.images[0].startsWith('/product_img')) ? item.product.images[0] : null);
                            productsPurchasedMap[prodId] = {
                                productId: item.productId,
                                name: item.name || item.product?.name || 'UK Product',
                                image: prodImg,
                                category: item.product?.category || 'Beauty',
                                brand: item.product?.brand || 'UK Import',
                                unitPrice: item.price,
                                totalQuantity: 0,
                                totalSpentOnItem: 0,
                                ordersCount: 0,
                                lastPurchasedAt: order.createdAt
                            };
                        }

                        productsPurchasedMap[prodId].totalQuantity += qty;
                        productsPurchasedMap[prodId].totalSpentOnItem += (item.price * qty);
                        productsPurchasedMap[prodId].ordersCount += 1;
                    });
                });

                const purchasedProducts = Object.values(productsPurchasedMap).sort(
                    (a, b) => b.totalQuantity - a.totalQuantity
                );

                const primaryAddress = user.addresses[0] || (user.orders[0]?.address) || null;

                return {
                    id: user.id,
                    name: user.name || 'Valued Customer',
                    email: user.email,
                    phone: user.phone || user.whatsapp || '',
                    whatsapp: user.whatsapp || user.phone || '',
                    role: user.role,
                    createdAt: user.createdAt,
                    lastActiveAt: user.lastActiveAt,
                    city: primaryAddress?.city || primaryAddress?.region || 'Dhaka',
                    address: primaryAddress ? `${primaryAddress.address}, ${primaryAddress.city}` : '',
                    totalOrders: user.orders.length,
                    activeOrders: nonCancelledOrders.length,
                    totalSpent,
                    totalUnitsBought,
                    purchasedProducts,
                    orders: user.orders.map(o => ({
                        id: o.id,
                        orderNumber: o.orderNumber || o.id.slice(0, 8).toUpperCase(),
                        createdAt: o.createdAt,
                        status: o.status,
                        paymentMethod: o.paymentMethod,
                        paymentStatus: o.paymentStatus,
                        subtotal: o.subtotal,
                        deliveryCharge: o.deliveryCharge,
                        discount: o.discount,
                        total: o.total,
                        itemsCount: (o.orderItems || []).reduce((acc, it) => acc + it.quantity, 0),
                        items: (o.orderItems || []).map(it => ({
                            id: it.id,
                            productId: it.productId,
                            name: it.name,
                            price: it.price,
                            quantity: it.quantity,
                            image: (it.image && !it.image.startsWith('/product_img')) ? it.image : null
                        }))
                    }))
                };
            });

            return NextResponse.json({
                success: true,
                customers: enriched,
                totalCustomers: users.length
            });
        }

        return NextResponse.json({
            success: true,
            customers: [],
            totalCustomers: 0
        });
    } catch (error) {
        console.error('Error in /api/admin/customers:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

