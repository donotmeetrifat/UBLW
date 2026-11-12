const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting UK Brand Lover database seed...');

    // 1. Create Default Flagship Store & Admin
    const adminUser = await prisma.user.upsert({
        where: { email: 'support@ukbrandlover.com' },
        update: {},
        create: {
            name: 'UK Brand Lover Flagship',
            email: 'support@ukbrandlover.com',
            phone: '01959524393',
            whatsapp: '01959524393',
            role: 'ADMIN',
            image: '/Web Logo.png',
        },
    });

    const flagshipStore = await prisma.store.upsert({
        where: { username: 'ukbrandlover' },
        update: {},
        create: {
            userId: adminUser.id,
            name: 'UK Brand Lover Flagship',
            username: 'ukbrandlover',
            description: 'Bangladesh\'s premier destination for 100% authentic UK imported beauty, skincare, haircare, and personal care essentials.',
            address: 'House 14, Road 7, Block C, Mirpur-2, Dhaka-1216, Bangladesh',
            contact: '+880 1959-524393',
            email: 'support@ukbrandlover.com',
            logo: '/Web Logo.png',
            status: 'APPROVED',
            isActive: true,
        },
    });

    // 2. Categories
    const categories = [
        { name: 'Skincare', slug: 'skincare', description: 'Dermatologist-recommended UK skincare essentials' },
        { name: 'Makeup', slug: 'makeup', description: 'Cult-favourite UK cosmetics and formulations' },
        { name: 'Haircare', slug: 'haircare', description: 'Salon-grade bond building and hair repair treatments' },
        { name: 'Fragrance', slug: 'fragrance', description: 'Iconic UK colognes and luxury perfumes' },
        { name: 'Body Care', slug: 'body-care', description: 'Hydrating body butters, washes and exfoliators' },
        { name: 'Beauty Tools', slug: 'beauty-tools', description: 'Precision applicators, brushes and rollers' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    // 3. Coupons
    const coupons = [
        { code: 'NEW20', description: '20% Off New Customer Welcome Privilege', discount: 20, forNewUserOnly: true, minOrderAmount: 1000, isActive: true, expiresAt: new Date('2027-12-31') },
        { code: 'OFF10', description: '10% Off Royal Luxury Privilege', discount: 10, forNewUserOnly: false, minOrderAmount: 500, isActive: true, expiresAt: new Date('2027-12-31') },
        { code: 'EID25', description: '25% Off Festive Eid Celebration Offer', discount: 25, forNewUserOnly: false, minOrderAmount: 3000, isActive: true, expiresAt: new Date('2027-12-31') },
        { code: 'PLUS15', description: '15% Off VIP Club Member Reward', discount: 15, forNewUserOnly: false, minOrderAmount: 2000, isActive: true, expiresAt: new Date('2027-12-31') },
        { code: 'VIP15', description: '15% Off Secret VIP Abandoned Cart Voucher', discount: 15, forNewUserOnly: false, minOrderAmount: 1500, isActive: true, expiresAt: new Date('2027-12-31') }
    ];

    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: c,
        });
    }

    // 4. Authentic UK Products
    const products = [
        {
            name: "CeraVe Foaming Cleanser for Normal to Oily Skin 473ml",
            description: "Developed with dermatologists, CeraVe Foaming Cleanser features 3 essential ceramides, hyaluronic acid, and niacinamide to help restore the protective skin barrier. Gently refreshes and removes excess oil without drying out your skin. 100% authentic UK import.",
            mrp: 2800,
            price: 2450,
            images: ["/product_img1.png", "/product_img2.png"],
            category: "Skincare",
            brand: "CeraVe UK",
            inStock: true,
            stockCount: 85,
            isFeatured: true,
            isBestSeller: true,
            storeId: flagshipStore.id,
        },
        {
            name: "The Ordinary Niacinamide 10% + Zinc 1% High-Strength Serum",
            description: "A high-strength vitamin and mineral blemish formula that targets skin congestion, regulates sebum production, and minimizes visible pores for a smoother, clearer complexion. Authentic UK formula.",
            mrp: 2200,
            price: 1850,
            images: ["/product_img2.png"],
            category: "Skincare",
            brand: "The Ordinary UK",
            inStock: true,
            stockCount: 120,
            isFeatured: true,
            isBestSeller: true,
            storeId: flagshipStore.id,
        },
        {
            name: "Olaplex No. 3 Hair Perfector Repairing Treatment 100ml",
            description: "An at-home bond-building treatment proven to repair, strengthen, and protect compromised hair structure caused by heat, chemical treatments, and coloring. Suitable for all hair types.",
            mrp: 4200,
            price: 3850,
            images: ["/product_img3.png"],
            category: "Haircare",
            brand: "Olaplex UK",
            inStock: true,
            stockCount: 45,
            isFeatured: true,
            isBestSeller: true,
            storeId: flagshipStore.id,
        },
        {
            name: "Jo Malone London English Pear & Freesia Cologne 100ml",
            description: "The essence of autumn. The sensuous freshness of just-ripe pears wrapped in a bouquet of white freesias, and mellowed by amber, patchouli and woods. Luscious and golden.",
            mrp: 18500,
            price: 16900,
            images: ["/product_img4.png"],
            category: "Fragrance",
            brand: "Jo Malone London",
            inStock: true,
            stockCount: 18,
            isFeatured: true,
            isBestSeller: false,
            storeId: flagshipStore.id,
        },
        {
            name: "Charlotte Tilbury Matte Revolution Lipstick - Pillow Talk",
            description: "The iconic, universally flattering nude-pink lipstick that enhances the natural hue of your lips. Formulated with 3D glowing pigments and tree extract for cashmere-soft finish.",
            mrp: 4800,
            price: 4350,
            images: ["/product_img5.png"],
            category: "Makeup",
            brand: "Charlotte Tilbury UK",
            inStock: true,
            stockCount: 60,
            isFeatured: true,
            isBestSeller: true,
            storeId: flagshipStore.id,
        },
        {
            name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant 118ml",
            description: "A clinically proven gentle leave-on exfoliant with salicylic acid that unclogs pores, smooths wrinkles, and evens out skin tone. Rapidly reveals radiant, healthy skin.",
            mrp: 4600,
            price: 4150,
            images: ["/product_img6.png"],
            category: "Skincare",
            brand: "Paula's Choice UK",
            inStock: true,
            stockCount: 55,
            isFeatured: false,
            isBestSeller: true,
            storeId: flagshipStore.id,
        },
        {
            name: "Sol de Janeiro Brazilian Bum Bum Body Cream 240ml",
            description: "Award-winning, visibly tightening body cream with irresistible Cheirosa 62 pistacchio and salted caramel fragrance. Fast-absorbing with Guaraná caffeine extract.",
            mrp: 6500,
            price: 5800,
            images: ["/product_img7.png"],
            category: "Body Care",
            brand: "Sol de Janeiro",
            inStock: true,
            stockCount: 30,
            isFeatured: false,
            isBestSeller: true,
            storeId: flagshipStore.id,
        },
        {
            name: "La Roche-Posay Anthelios UVMune 400 Invisible Fluid SPF50+",
            description: "The ultimate UK dermatological sun protection with Mexoryl 400 filter. Protects against ultra-long UVA rays. Lightweight, non-greasy, water-resistant formula suitable for sensitive skin.",
            mrp: 3200,
            price: 2750,
            images: ["/product_img9.png"],
            category: "Skincare",
            brand: "La Roche-Posay UK",
            inStock: true,
            stockCount: 95,
            isFeatured: true,
            isBestSeller: true,
            storeId: flagshipStore.id,
        }
    ];

    for (const prod of products) {
        const existing = await prisma.product.findFirst({
            where: { name: prod.name }
        });
        if (!existing) {
            await prisma.product.create({
                data: prod
            });
        }
    }

    console.log('✅ UK Brand Lover database seeded successfully with products, categories, coupons, and flagship store!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
