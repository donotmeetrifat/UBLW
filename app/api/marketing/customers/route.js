import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';

// Seeded / mock customer database for instant offline functionality
let memoryCustomers = [
    {
        id: "cust_101",
        name: "Ayesha Rahman",
        phone: "01959524393",
        whatsapp: "01959524393",
        email: "ayesha.rahman@gmail.com",
        city: "Dhaka North",
        totalOrders: 3,
        totalSpend: 9800,
        cartItems: [],
        lastActiveAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        abandonedCartAt: null,
    },
    {
        id: "cust_102",
        name: "Nusrat Jahan",
        phone: "01819283746",
        whatsapp: "01819283746",
        email: "nusrat.jahan@gmail.com",
        city: "Chattogram",
        totalOrders: 1,
        totalSpend: 3465,
        cartItems: [
            {
                productId: "prod_2",
                name: "The Ordinary Niacinamide 10% + Zinc 1% Serum",
                price: 1850,
                image: "/product_img2.png",
                addedAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago!
            }
        ],
        lastActiveAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        abandonedCartAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        id: "cust_103",
        name: "Sabrina Islam",
        phone: "01711223344",
        whatsapp: "01711223344",
        email: "sabrina.islam@gmail.com",
        city: "Sylhet",
        totalOrders: 0,
        totalSpend: 0,
        cartItems: [
            {
                productId: "prod_1",
                name: "CeraVe Foaming Cleanser 473ml",
                price: 2450,
                image: "/product_img1.png",
                addedAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago!
            }
        ],
        lastActiveAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        abandonedCartAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: "cust_104",
        name: "Meherun Nesa",
        phone: "01622334455",
        whatsapp: "01622334455",
        email: "meherun.nesa@yahoo.com",
        city: "Dhaka",
        totalOrders: 4,
        totalSpend: 15400,
        cartItems: [],
        lastActiveAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        abandonedCartAt: null,
    },
    {
        id: "cust_105",
        name: "Farhana Ahmed",
        phone: "01911998877",
        whatsapp: "01911998877",
        email: "farhana.ahmed@gmail.com",
        city: "Rajshahi",
        totalOrders: 0,
        totalSpend: 0,
        cartItems: [
            {
                productId: "prod_5",
                name: "Charlotte Tilbury Matte Revolution - Pillow Talk",
                price: 4350,
                image: "/product_img5.png",
                addedAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
            }
        ],
        lastActiveAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
        abandonedCartAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
    }
];

export async function GET() {
    try {
        if (isDatabaseConfigured()) {
            const users = await prisma.user.findMany({
                where: { role: 'CUSTOMER' },
                include: {
                    orders: { select: { total: true, status: true } },
                    addresses: { take: 1, select: { city: true, region: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            const formatted = users.map(u => ({
                id: u.id,
                name: u.name,
                phone: u.phone || u.whatsapp || '',
                whatsapp: u.whatsapp || u.phone || '',
                email: u.email,
                city: u.addresses[0]?.city || 'Dhaka',
                totalOrders: u.orders.length,
                totalSpend: u.orders
                    .filter(o => o.status !== 'CANCELLED')
                    .reduce((sum, o) => sum + (o.total || 0), 0),
                cartItems: typeof u.cart === 'object' && u.cart !== null ? Object.values(u.cart) : [],
                lastActiveAt: u.lastActiveAt || u.updatedAt,
                abandonedCartAt: u.abandonedCartAt,
            }));

            return NextResponse.json({ success: true, customers: formatted });
        }

        return NextResponse.json({ success: true, customers: memoryCustomers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ success: true, customers: memoryCustomers });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, whatsapp, phone, email } = body;

        const cleanPhone = (whatsapp || phone || '').replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            return NextResponse.json({ success: false, message: 'WhatsApp number is required' }, { status: 400 });
        }

        const newCustomer = {
            id: `cust_${Date.now()}`,
            name: name || 'Valued Shopper',
            phone: cleanPhone,
            whatsapp: cleanPhone,
            email: email || `${cleanPhone}@ukbrandlover.com`,
            city: 'Dhaka',
            totalOrders: 0,
            totalSpend: 0,
            cartItems: [],
            lastActiveAt: new Date().toISOString(),
            abandonedCartAt: null,
        };

        if (isDatabaseConfigured()) {
            await prisma.user.upsert({
                where: { email: newCustomer.email },
                update: {
                    name: newCustomer.name,
                    phone: cleanPhone,
                    whatsapp: cleanPhone,
                    lastActiveAt: new Date(),
                },
                create: {
                    name: newCustomer.name,
                    email: newCustomer.email,
                    phone: cleanPhone,
                    whatsapp: cleanPhone,
                    role: 'CUSTOMER',
                }
            });
        }

        memoryCustomers.unshift(newCustomer);
        return NextResponse.json({ success: true, customer: newCustomer });
    } catch (error) {
        console.error('Error saving customer:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
