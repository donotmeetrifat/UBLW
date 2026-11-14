// Initial Seed Data for UK Brand Lover
// 100% Authentic UK Imported Skincare, Makeup, Haircare & Fragrance

export const initialCategories = [];

export const initialCoupons = [];

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

export const initialProducts = [];

export const initialOrders = [];

// In-Memory Data Store (Provides instantaneous, stateful CRUD fallback)
let memoryProducts = [];
let memoryOrders = [];
let memoryCoupons = [];
let memoryCategories = [];
let memoryInquiries = [];

export const memoryStore = {
    getCategories: () => memoryCategories,
    setCategories: (cats) => { memoryCategories = cats; },
    addCategory: (cat) => {
        const newCat = {
            id: `cat_${Date.now()}`,
            isActive: true,
            displayOrder: memoryCategories.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...cat,
        };
        memoryCategories.push(newCat);
        return newCat;
    },
    updateCategory: (id, updates) => {
        const index = memoryCategories.findIndex(c => c.id === id);
        if (index === -1) return null;
        memoryCategories[index] = { ...memoryCategories[index], ...updates, updatedAt: new Date().toISOString() };
        return memoryCategories[index];
    },
    deleteCategory: (id) => {
        const initialLen = memoryCategories.length;
        memoryCategories = memoryCategories.filter(c => c.id !== id);
        return memoryCategories.length < initialLen;
    },
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
    },
    getInquiries: () => memoryInquiries,
    addInquiry: (inquiry) => {
        const newInq = {
            id: `inq_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'UNREAD',
            ...inquiry,
        };
        memoryInquiries.unshift(newInq);
        return newInq;
    },
    updateInquiry: (id, updates) => {
        const index = memoryInquiries.findIndex(i => i.id === id);
        if (index === -1) return null;
        memoryInquiries[index] = { ...memoryInquiries[index], ...updates, updatedAt: new Date().toISOString() };
        return memoryInquiries[index];
    },
    deleteInquiry: (id) => {
        const initialLen = memoryInquiries.length;
        memoryInquiries = memoryInquiries.filter(i => i.id !== id);
        return memoryInquiries.length < initialLen;
    }
};

