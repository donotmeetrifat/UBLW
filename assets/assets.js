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
    "Beauty Tools"
];

export const dummyRatingsData = [];

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

export const baseProductDummyData = [];

export const productDummyData = [];

export const ourSpecsData = [
    { title: "100% Original UK Imported", description: "Authentic beauty and lifestyle products sourced from trusted UK suppliers.", accent: '#6C306E' },
    { title: "Premium Quality Picks", description: "Carefully selected products chosen for quality, beauty, lifestyle, and everyday use.", accent: '#6C306E' },
    { title: "Secure & Trusted Support", description: "Safe payment options, responsive support, and a smooth shopping experience.", accent: '#6C306E' }
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "Customer",
    fullName: "Customer",
    email: "",
    street: "House 12, Road 5, Block B",
    address: "House 12, Road 5, Block B",
    city: "Dhaka - North",
    state: "Dhaka",
    region: "Dhaka",
    zip: "1216",
    country: "Bangladesh",
    phone: "01959524393",
    phoneNumber: "01959524393",
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