// Initial Seed Data for UK Brand Lover
// 100% Authentic UK Imported Skincare, Makeup, Haircare & Fragrance

export const initialCategories = [
    { id: "cat_skincare", name: "Skincare", slug: "skincare", description: "Dermatologist-recommended UK skincare essentials" },
    { id: "cat_makeup", name: "Makeup", slug: "makeup", description: "Cult-favourite British cosmetics and formulations" },
    { id: "cat_haircare", name: "Haircare", slug: "haircare", description: "Salon-grade bond building and hair repair treatments" },
    { id: "cat_fragrance", name: "Fragrance", slug: "fragrance", description: "Iconic British colognes and luxury perfumes" },
    { id: "cat_bodycare", name: "Body Care", slug: "body-care", description: "Hydrating body butters, washes and exfoliators" },
    { id: "cat_tools", name: "Beauty Tools", slug: "beauty-tools", description: "Precision applicators, brushes and rollers" },
];

export const initialCoupons = [
    { code: "NEW20", description: "20% Off New Customer Welcome Privilege", discount: 20, forNewUserOnly: true, minOrderAmount: 1000, isActive: true, expiresAt: "2027-12-31T23:59:59.000Z" },
    { code: "OFF10", description: "10% Off Royal Luxury Privilege", discount: 10, forNewUserOnly: false, minOrderAmount: 500, isActive: true, expiresAt: "2027-12-31T23:59:59.000Z" },
    { code: "EID25", description: "25% Off Festive Eid Celebration Offer", discount: 25, forNewUserOnly: false, minOrderAmount: 3000, isActive: true, expiresAt: "2027-12-31T23:59:59.000Z" },
    { code: "PLUS15", description: "15% Off VIP Club Member Reward", discount: 15, forNewUserOnly: false, minOrderAmount: 2000, isActive: true, expiresAt: "2027-12-31T23:59:59.000Z" }
];

export const initialStore = {
    id: "store_ukbl_main",
    userId: "user_ukbl_admin",
    name: "UK Brand Lover Flagship",
    username: "ukbrandlover",
    description: "Bangladesh's premier destination for 100% authentic UK imported beauty, skincare, haircare, and personal care essentials.",
    address: "House 14, Road 7, Block C, Mirpur-2, Dhaka-1216, Bangladesh",
    contact: "+880 1959-524393",
    email: "support@ukbrandlover.com",
    logo: "/Web Logo.png",
    status: "APPROVED",
    isActive: true,
};

export const initialProducts = [
    {
        id: "prod_1",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_2",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_3",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_4",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_5",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_6",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_7",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_8",
        name: "Urban Decay All Nighter Long-Lasting Makeup Setting Spray",
        description: "A cult makeup setting spray with patented Temperature Control Technology that lowers makeup temperature to keep it flawlessly in place for up to 16 hours without fading or settling into lines.",
        mrp: 4400,
        price: 3950,
        images: ["/product_img8.png"],
        category: "Makeup",
        brand: "Urban Decay UK",
        inStock: true,
        stockCount: 40,
        isFeatured: false,
        isBestSeller: false,
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_9",
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
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_10",
        name: "Maison Francis Kurkdjian Baccarat Rouge 540 Eau de Parfum",
        description: "A luminous and intense fragrance with amber and floral woody breezes. Poetic alchemy where aerial notes of jasmine and the radiance of saffron carry mineral facets of ambergris.",
        mrp: 36000,
        price: 33500,
        images: ["/product_img10.png"],
        category: "Fragrance",
        brand: "MFK Paris / UK",
        inStock: true,
        stockCount: 10,
        isFeatured: false,
        isBestSeller: false,
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_11",
        name: "Gisou Honey Infused Hair Oil 100ml",
        description: "Iconic multi-purpose hair oil formulated with sustainably sourced Mirsalehi Honey. Deeply conditions, locks in moisture, and adds mirror-like shine to tame flyaways.",
        mrp: 7200,
        price: 6600,
        images: ["/product_img11.png"],
        category: "Haircare",
        brand: "Gisou UK",
        inStock: true,
        stockCount: 25,
        isFeatured: false,
        isBestSeller: false,
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "prod_12",
        name: "Real Techniques Everyday Essentials Makeup Brush Set",
        description: "Professional UK makeup brush set including 400 Blush Brush, 300 Deluxe Crease, 402 Setting Brush, 200 Expert Face, and the Miracle Complexion Sponge for flawless coverage.",
        mrp: 3400,
        price: 2950,
        images: ["/product_img12.png"],
        category: "Beauty Tools",
        brand: "Real Techniques UK",
        inStock: true,
        stockCount: 70,
        isFeatured: false,
        isBestSeller: true,
        storeId: "store_ukbl_main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const initialOrders = [
    {
        id: "order_ukbl_1001",
        orderNumber: "UKBL-2026-1001",
        userId: "user_customer_1",
        storeId: "store_ukbl_main",
        subtotal: 4300,
        discount: 0,
        deliveryCharge: 0,
        total: 4300,
        status: "DELIVERED",
        paymentMethod: "COD",
        paymentStatus: "PAID",
        transactionId: null,
        courierName: "Steadfast Courier",
        consignmentId: "ST-882914-DH",
        customerNotes: "Please deliver between 2 PM to 6 PM",
        isCouponUsed: false,
        couponCode: null,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        orderItems: [
            { id: "item_1", orderId: "order_ukbl_1001", productId: "prod_1", name: "CeraVe Foaming Cleanser 473ml", price: 2450, quantity: 1, image: "/product_img1.png" },
            { id: "item_2", orderId: "order_ukbl_1001", productId: "prod_2", name: "The Ordinary Niacinamide 10%", price: 1850, quantity: 1, image: "/product_img2.png" }
        ],
        address: {
            fullName: "Ayesha Rahman",
            phoneNumber: "01959524393",
            region: "Dhaka",
            city: "Dhaka North",
            area: "Mirpur-2",
            address: "House 14, Road 7, Block C"
        },
        user: {
            name: "Ayesha Rahman",
            email: "ayesha.rahman@gmail.com"
        }
    },
    {
        id: "order_ukbl_1002",
        orderNumber: "UKBL-2026-1002",
        userId: "user_customer_2",
        storeId: "store_ukbl_main",
        subtotal: 3850,
        discount: 385,
        deliveryCharge: 0,
        total: 3465,
        status: "SHIPPED",
        paymentMethod: "BKASH",
        paymentStatus: "PAID",
        transactionId: "BK992817AX7",
        courierName: "Steadfast Courier",
        consignmentId: "ST-883019-CTG",
        customerNotes: "Call before reaching destination",
        isCouponUsed: true,
        couponCode: "OFF10",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        orderItems: [
            { id: "item_3", orderId: "order_ukbl_1002", productId: "prod_3", name: "Olaplex No. 3 Hair Perfector 100ml", price: 3850, quantity: 1, image: "/product_img3.png" }
        ],
        address: {
            fullName: "Nusrat Jahan",
            phoneNumber: "01819283746",
            region: "Chattogram",
            city: "Chattogram City",
            area: "Nasirabad",
            address: "Hill View Residential Area, House 42"
        },
        user: {
            name: "Nusrat Jahan",
            email: "nusrat.jahan@gmail.com"
        }
    }
];

// In-Memory Data Store (Provides instantaneous, stateful CRUD fallback)
let memoryProducts = [...initialProducts];
let memoryOrders = [...initialOrders];
let memoryCoupons = [...initialCoupons];

export const memoryStore = {
    getProducts: () => memoryProducts,
    getProductById: (id) => memoryProducts.find(p => p.id === id),
    addProduct: (product) => {
        const newProduct = {
            id: `prod_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...product,
        };
        memoryProducts.unshift(newProduct);
        return newProduct;
    },
    updateProduct: (id, updates) => {
        const index = memoryProducts.findIndex(p => p.id === id);
        if (index === -1) return null;
        memoryProducts[index] = { ...memoryProducts[index], ...updates, updatedAt: new Date().toISOString() };
        return memoryProducts[index];
    },
    deleteProduct: (id) => {
        const initialLen = memoryProducts.length;
        memoryProducts = memoryProducts.filter(p => p.id !== id);
        return memoryProducts.length < initialLen;
    },
    getOrders: () => memoryOrders,
    getOrderById: (id) => memoryOrders.find(o => o.id === id || o.orderNumber === id),
    addOrder: (order) => {
        const orderNumber = `UKBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrder = {
            id: `order_${Date.now()}`,
            orderNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "ORDER_PLACED",
            paymentStatus: order.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
            ...order,
        };
        memoryOrders.unshift(newOrder);
        return newOrder;
    },
    updateOrder: (id, updates) => {
        const index = memoryOrders.findIndex(o => o.id === id || o.orderNumber === id);
        if (index === -1) return null;
        memoryOrders[index] = { ...memoryOrders[index], ...updates, updatedAt: new Date().toISOString() };
        return memoryOrders[index];
    },
    getCoupons: () => memoryCoupons,
    getCouponByCode: (code) => memoryCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive),
    addCoupon: (coupon) => {
        const newCoupon = {
            id: `coup_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...coupon,
        };
        memoryCoupons.push(newCoupon);
        return newCoupon;
    }
};

