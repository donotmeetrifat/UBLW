let productsCache = {
    data: null,
    fetchedAt: 0
};

export function getProductsCache() {
    return productsCache;
}

export function setProductsCache(data) {
    productsCache = {
        data,
        fetchedAt: Date.now()
    };
}

export function invalidateProductsCache() {
    productsCache = {
        data: null,
        fetchedAt: 0
    };
}
