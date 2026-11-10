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
        { name: 'Makeup', slug: 'makeup', description: 'Cult-favourite British cosmetics and formulations' },
        { name: 'Haircare', slug: 'haircare', description: 'Salon-grade bond building and hair repair treatments' },
        { name: 'Fragrance', slug: 'fragrance', description: 'Iconic British colognes and luxury perfumes' },
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
        { code: 'PLUS15', description: '15% Off VIP Club Member Reward', discount: 15, forNewUserOnly: false, minOrderAmount: 2000, isActive: true, expiresAt: new Date('2027-12-31') }
    ];

    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: c,
        });
    }

    console.log('✅ UK Brand Lover database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
