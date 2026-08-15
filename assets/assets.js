import gs_logo from "./gs_logo.jpg"
import happy_store from "./happy_store.webp"
import upload_area from "./upload_area.svg"
import hero_model_img from "./hero_model_img.png"
import hero_product_img1 from "./hero_product_img1.png"
import hero_product_img2 from "./hero_product_img2.png"
import product_img1 from "./product_img1.png"
import product_img2 from "./product_img2.png"
import product_img3 from "./product_img3.png"
import product_img4 from "./product_img4.png"
import product_img5 from "./product_img5.png"
import product_img6 from "./product_img6.png"
import product_img7 from "./product_img7.png"
import product_img8 from "./product_img8.png"
import product_img9 from "./product_img9.png"
import product_img10 from "./product_img10.png"
import product_img11 from "./product_img11.png"
import product_img12 from "./product_img12.png"
import webLogo from "./Web Logo.png"
import logo1 from "./Logo 1.png"
import { ShieldCheck, Sparkles, LockKeyhole } from "lucide-react";
import hero_card_img1 from "./hero_card_img1.png"
import hero_card_img2 from "./hero_card_img2.png"
import hero_card_img3 from "./hero_card_img3.png"
import profile_pic1 from "./profile_pic1.jpg"
import profile_pic2 from "./profile_pic2.jpg"
import profile_pic3 from "./profile_pic3.jpg"

export const assets = {
    upload_area, hero_model_img,
    hero_product_img1, hero_product_img2, hero_card_img1, hero_card_img2, hero_card_img3, gs_logo: webLogo, logo1, logoWithoutBg: webLogo, webLogo,
    product_img1, product_img2, product_img3, product_img4, product_img5, product_img6,
    product_img7, product_img8, product_img9, product_img10, product_img11, product_img12,
}

export const categories = [
    "Skincare",
    "Makeup",
    "Haircare",
    "Fragrance",
    "Body Care",
    "Beauty Tools",
    "Accessories",
    "Lifestyle",
    "New Arrivals",
    "Best Sellers",
    "Premium Picks",
    "Sale"
];

export const dummyRatingsData = [
    { id: "rat_1", rating: 5.0, review: "100% authentic UK import! My skin feels hydrated and glowing after using this cleanser. Truly premium quality.", user: { name: 'Ayesha Rahman', image: profile_pic1 }, productId: "prod_1", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', product: { name: 'CeraVe Foaming Facial Cleanser', category:'Skincare', id:'prod_1'} },
    { id: "rat_2", rating: 4.8, review: "Fast delivery in Dhaka and original product guaranteed. Highly recommended shop for genuine cosmetics!", user: { name: 'Nusrat Jahan', image: profile_pic2 }, productId: "prod_2", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', product: { name: 'The Ordinary Niacinamide 10% + Zinc 1%', category:'Skincare', id:'prod_2'} },
    { id: "rat_3", rating: 4.9, review: "Amazing hair transformation. Solved my dry ends in just two weeks. Excellent customer support!", user: { name: 'Tania Akter', image: profile_pic3 }, productId: "prod_3", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', product: { name: 'Olaplex No.3 Hair Perfector', category:'Haircare', id:'prod_3'} },
    { id: "rat_4", rating: 5.0, review: "The scent is heavenly and long-lasting! So glad to find authentic UK fragrance imported directly to Bangladesh.", user: { name: 'Sabrina Islam', image: profile_pic1 }, productId: "prod_4", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', product: { name: 'Jo Malone English Pear Cologne', category:'Fragrance', id:'prod_4'} },
    { id: "rat_5", rating: 4.7, review: "Smooth texture and beautiful shade. Great packaging and authentic UK stock.", user: { name: 'Farhana Ahmed', image: profile_pic2 }, productId: "prod_5", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', product: { name: 'Charlotte Tilbury Matte Revolution', category:'Makeup', id:'prod_5'} },
    { id: "rat_6", rating: 5.0, review: "Super fast shipping and top notch customer care. UK Brand Lover is my go-to shop for skincare!", user: { name: 'Meherun Nesa', image: profile_pic3 }, productId: "prod_6", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)', product: { name: 'Paula\'s Choice 2% BHA Exfoliant', category:'Skincare', id:'prod_6'} },
]

export const dummyStoreData = {
    id: "store_1",
    userId: "user_1",
    name: "UK Brand Lover",
    description: "UK Brand Lover is a Bangladesh-focused e-commerce business selling 100% authentic/original UK-imported beauty, skincare, haircare, and personal-care products.",
    username: "ukbrandlover",
    address: "Mirpur, Dhaka, Bangladesh",
    status: "approved",
    isActive: true,
    logo: webLogo,
    email: "support@ukbrandlover.com",
    contact: "+880 1959-524393",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
        id: "user_ukbrandlover_admin",
        name: "UK Brand Lover",
        email: "support@ukbrandlover.com",
        image: webLogo,
    }
}

const productFilterMetadata = [
    { brand: "UK Brand Lover", category: "Skincare",     inStock: true,  sale: true,  isBestSeller: true },
    { brand: "Glow Care",      category: "Skincare",    inStock: true,  sale: true,  isBestSeller: true },
    { brand: "Luxe Hair",      category: "Haircare",     inStock: true,  sale: false, isBestSeller: true },
    { brand: "Luxe Beauty",    category: "Fragrance",    inStock: true,  sale: true },
    { brand: "Skin Pure",      category: "Makeup",       inStock: true,  sale: true,  isBestSeller: true },
    { brand: "Smart Essentials",category: "Skincare",   inStock: true,  sale: false },
    { brand: "UK Brand Lover", category: "Body Care",   inStock: true,  sale: true },
    { brand: "Beauty Pro",     category: "Makeup",       inStock: true,  sale: true },
    { brand: "Glow Care",      category: "Skincare",     inStock: true,  sale: false },
    { brand: "Luxe Beauty",    category: "Fragrance",    inStock: true,  sale: true },
    { brand: "Skin Pure",      category: "Skincare",     inStock: true,  sale: false },
    { brand: "Smart Essentials",category: "Beauty Tools", inStock: true,  sale: true },
]

export const baseProductDummyData = [
    {
        id: "prod_1",
        name: "CeraVe Foaming Cleanser for Normal to Oily Skin 473ml",
        description: "Developed with dermatologists, CeraVe Foaming Cleanser features 3 essential ceramides, hyaluronic acid, and niacinamide to help restore the protective skin barrier. Gently refreshes and removes excess oil without drying out your skin. 100% authentic UK import.",
        mrp: 2800,
        price: 2450,
        images: [product_img1, product_img2, product_img3, product_img4],
        category: "Skincare",
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_2",
        name: "The Ordinary Niacinamide 10% + Zinc 1% High-Strength Serum",
        description: "A high-strength vitamin and mineral blemish formula that targets skin congestion, regulates sebum production, and minimizes visible pores for a smoother, clearer complexion. Authentic UK formula.",
        mrp: 2200,
        price: 1850,
        images: [product_img2],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Skincare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_3",
        name: "Olaplex No. 3 Hair Perfector Repairing Treatment 100ml",
        description: "An at-home bond-building treatment proven to repair, strengthen, and protect compromised hair structure caused by heat, chemical treatments, and coloring. Suitable for all hair types.",
        mrp: 4200,
        price: 3850,
        images: [product_img3],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Haircare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_4",
        name: "Jo Malone London English Pear & Freesia Cologne 30ml",
        description: "The essence of autumn. The sensuous freshness of just-ripe pears is wrapped in a bouquet of white freesias, and mellowed by amber, patchouli and woods. Luscious and golden fragrance from UK.",
        mrp: 14000,
        price: 12500,
        images: [product_img4],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Fragrance",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_5",
        name: "Charlotte Tilbury Matte Revolution Lipstick - Pillow Talk",
        description: "The iconic, award-winning nude-pink shade that flatters every skin tone. Enriched with Lipstick Tree and Orchid extracts for hydrated, soft, and velvety matte lips that last all day.",
        mrp: 4400,
        price: 3900,
        images: [product_img5],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Makeup",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_6",
        name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant",
        description: "A gentle leave-on exfoliant with salicylic acid that unclogs pores, smooths wrinkles, and evens out skin tone. Unveils radiant, youthful-looking skin. Direct UK shipment.",
        mrp: 4500,
        price: 3950,
        images: [product_img6],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Skincare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_7",
        name: "Sol de Janeiro Brazilian Bum Bum Cream 150ml",
        description: "Fast-absorbing body cream with an addictive Cheirosa 62 scent. Infused with Guaraná extract to visibly tighten and smooth the appearance of skin while delivering deep hydration.",
        mrp: 5200,
        price: 4650,
        images: [product_img7],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Body Care",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_8",
        name: "Rare Beauty Soft Pinch Liquid Blush - Joy",
        description: "A weightless, long-lasting liquid blush that blends and builds beautifully for a soft, healthy flush. Infused with long-lasting pigments that stay color-true all day.",
        mrp: 3600,
        price: 3200,
        images: [product_img8],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Makeup",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_9",
        name: "COSRX Advanced Snail 96 Mucin Power Essence 100ml",
        description: "Lightweight essence that absorbs quickly into the skin to give it a natural glow from the inside out. Formulated with 96.3% Snail Secretion Filtrate for intense repair and hydration.",
        mrp: 2300,
        price: 1950,
        images: [product_img9],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Skincare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_10",
        name: "La Roche-Posay Anthelios UVMune 400 Invisible Fluid SPF50+",
        description: "Ultra-high broad spectrum UVA/UVB protection with Mexoryl 400 filter. Non-greasy, invisible finish designed for sensitive skin under hot and humid climates.",
        mrp: 3000,
        price: 2650,
        images: [product_img10],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Skincare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_11",
        name: "Elemis Pro-Collagen Cleansing Balm 100g",
        description: "Nourishing cleansing balm that melts away makeup, daily pollutants, and impurities for a glowing, petal-soft complexion. Infused with 9 essential oils.",
        mrp: 6200,
        price: 5600,
        images: [product_img11],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Skincare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)',
    },
    {
        id: "prod_12",
        name: "Garnier SkinActive 3.5% Vitamin C Anti-Dark Spot Serum 30ml",
        description: "Formulated with Vitamin C, Niacinamide, and Salicylic Acid to reduce dark spots and enhance skin radiance in 6 days. Authentic UK formula.",
        mrp: 1900,
        price: 1650,
        images: [product_img12],
        storeId: "seller_1",
        inStock: true,
        store: dummyStoreData,
        category: "Skincare",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
        updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
    }
];

export const productDummyData = baseProductDummyData.map((product, index) => ({
    ...product,
    ...productFilterMetadata[index % productFilterMetadata.length],
    sale: productFilterMetadata[index % productFilterMetadata.length].sale || product.mrp > product.price,
}))

export const ourSpecsData = [
    { title: "100% Original UK Imported", description: "Authentic beauty and lifestyle products sourced from trusted UK suppliers.", icon: ShieldCheck, accent: '#6C306E' },
    { title: "Premium Quality Picks", description: "Carefully selected products chosen for quality, beauty, lifestyle, and everyday use.", icon: Sparkles, accent: '#6C306E' },
    { title: "Secure & Trusted Support", description: "Safe payment options, responsive support, and a smooth shopping experience.", icon: LockKeyhole, accent: '#6C306E' }
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
    street: "House 12, Road 5, Block B",
    city: "Dhaka - North",
    state: "Dhaka",
    zip: "1216",
    country: "Bangladesh",
    phone: "01959524393",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0600 (Bangladesh Standard Time)',
}

export const couponDummyData = [
    { code: "NEW20", description: "20% Off for New Users", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
    { code: "NEW10", description: "10% Off for New Users", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
    { code: "OFF20", description: "20% Off for All Users", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
    { code: "OFF10", description: "10% Off for All Users", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.279Z" },
    { code: "PLUS10", description: "20% Off for Members", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: "2027-03-06T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" }
]

export const dummyUserData = {
    id: "user_ukbrandlover_customer",
    name: "Ayesha Rahman",
    email: "customer@ukbrandlover.com",
    image: webLogo,
    cart: {}
}

export const orderDummyData = [
    {
        id: "order_ukbl_1001",
        total: 4300,
        status: "DELIVERED",
        userId: "user_ukbrandlover_customer",
        storeId: "seller_1",
        addressId: "addr_1",
        isPaid: true,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:15:03.929Z",
        updatedAt: "2025-08-22T09:15:50.723Z",
        isCouponUsed: false,
        coupon: null,
        orderItems: [
            { orderId: "order_ukbl_1001", productId: "prod_1", quantity: 1, price: 2450, product: productDummyData[0], },
            { orderId: "order_ukbl_1001", productId: "prod_2", quantity: 1, price: 1850, product: productDummyData[1], }
        ],
        address: addressDummyData,
        user: dummyUserData
    }
]

export const storesDummyData = [
    {
        id: "seller_1",
        userId: "user_ukbrandlover_admin",
        name: "UK Brand Lover",
        description: "UK Brand Lover is a Bangladesh-focused e-commerce business selling 100% authentic/original UK-imported beauty and personal-care products.",
        username: "ukbrandlover",
        address: "Mirpur, Dhaka, Bangladesh",
        status: "approved",
        isActive: true,
        logo: webLogo,
        email: "support@ukbrandlover.com",
        contact: "+880 1959-524393",
        createdAt: "2025-08-22T08:22:16.189Z",
        updatedAt: "2025-08-22T08:22:44.273Z",
        user: dummyUserData,
    }
]

export const dummyAdminDashboardData = {
    "orders": 12,
    "stores": 1,
    "products": 12,
    "revenue": "48500.00",
    "allOrders": [
        { "createdAt": "2025-08-20T08:46:58.239Z", "total": 4300 },
        { "createdAt": "2025-08-22T08:46:21.818Z", "total": 3850 },
        { "createdAt": "2025-08-22T08:45:59.587Z", "total": 5600 },
        { "createdAt": "2025-08-23T09:15:03.929Z", "total": 2450 },
        { "createdAt": "2025-08-23T09:14:35.923Z", "total": 7800 },
        { "createdAt": "2025-08-24T11:44:29.713Z", "total": 3950 }
    ]
}

export const dummyStoreDashboardData = {
    "ratings": dummyRatingsData,
    "totalOrders": 12,
    "totalEarnings": 48500,
    "totalProducts": 12
}