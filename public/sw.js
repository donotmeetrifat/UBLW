const CACHE_NAME = 'ukbl-v7';
const STATIC_CACHE = 'ukbl-static-v7';
const PAGES_CACHE = 'ukbl-pages-v7';
const API_CACHE = 'ukbl-api-v7';
const IMAGE_CACHE = 'ukbl-images-v7';

const PRECACHE_URLS = [
    '/',
    '/shop',
    '/cart',
    '/checkout',
    '/orders',
    '/contact',
    '/reviews',
    '/account',
    '/offline.html',
    '/manifest.json',
    '/favicon.ico',
    '/icon.png',
    '/apple-icon.png',
    '/images/web-logo-optimized.png',
    '/api/products',
    '/api/categories',
    '/api/banners',
    '/api/promotions',
    '/api/homepage-sections'
];

// Install Event: Pre-cache core shell pages, static resources, and catalog APIs
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(async (cache) => {
            // Pre-cache URLs individually so one failure does not abort the rest
            await Promise.allSettled(
                PRECACHE_URLS.map((url) =>
                    fetch(url, { cache: 'no-cache' })
                        .then((res) => {
                            if (res && res.status === 200) {
                                return cache.put(url, res);
                            }
                        })
                        .catch((err) => {
                            console.warn('[SW] Pre-cache item skipped:', url, err);
                        })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
    const validCaches = [STATIC_CACHE, PAGES_CACHE, API_CACHE, IMAGE_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (!validCaches.includes(name)) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Real-time cache invalidation listener
self.addEventListener('message', (event) => {
    if (event.data && (
        event.data.type === 'CLEAR_API_CACHE' || 
        event.data.type === 'PRODUCT_UPDATED' || 
        event.data.type === 'CLEAR_ALL_CACHES' ||
        event.data.type === 'CLEAR_IMAGE_CACHE' ||
        event.data.type === 'STORE_UPDATED' ||
        event.data.type === 'FORCE_UPDATE'
    )) {
        caches.keys().then((keys) => {
            return Promise.all(keys.map(k => caches.delete(k)));
        }).then(() => {
            caches.open(STATIC_CACHE);
            caches.open(PAGES_CACHE);
            caches.open(API_CACHE);
            caches.open(IMAGE_CACHE);
            if (event.source) {
                event.source.postMessage({ type: 'CACHES_CLEARED' });
            }
        });
    }
});

// Fetch Event: Comprehensive Strategy Router for 100% Offline Resilience
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Never intercept or cache the service worker script itself
    if (url.pathname === '/sw.js') {
        return;
    }

    // Never intercept or cache admin API routes or admin portal pages
    if (url.pathname.startsWith('/api/admin') || url.pathname.startsWith('/admin')) {
        return;
    }

    // Skip Chrome extension and external third-party tracking scripts
    if (url.origin !== self.location.origin && !url.hostname.includes('vercel') && !url.hostname.includes('supabase')) {
        return;
    }

    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('_t');
    cleanUrl.searchParams.delete('v');

    const isRSC = url.searchParams.has('_rsc') || request.headers.get('RSC') === '1';

    // 1. Next.js RSC (React Server Component) Route Payloads
    // Ensures client-side route transitions (<Link href="...">) work seamlessly offline
    if (isRSC) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(PAGES_CACHE).then((cache) => {
                            cache.put(request, copy.clone());
                            cleanUrl.searchParams.delete('_rsc');
                            cache.put(cleanUrl.toString(), copy);
                        }).catch(() => {});
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Try exact match
                    let cached = await caches.match(request);
                    if (cached) return cached;

                    // Try clean URL without _rsc token
                    cleanUrl.searchParams.delete('_rsc');
                    cached = await caches.match(cleanUrl.toString());
                    if (cached) return cached;

                    cached = await caches.match(cleanUrl.pathname);
                    if (cached) return cached;

                    // Fallback to empty text/x-component so client router transitions cleanly without failing
                    return new Response('', {
                        status: 200,
                        headers: { 'Content-Type': 'text/x-component' }
                    });
                })
        );
        return;
    }

    // 2. Navigation Requests (Full HTML Page Visits): Network-First with Comprehensive Cache Fallbacks
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(PAGES_CACHE).then((cache) => {
                            cache.put(request, copy.clone());
                            cache.put(cleanUrl.pathname, copy);
                        }).catch(() => {});
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Match exact page URL
                    const cachedPage = await caches.match(request);
                    if (cachedPage) return cachedPage;

                    // Match clean path
                    const cachedPath = await caches.match(cleanUrl.pathname);
                    if (cachedPath) return cachedPath;

                    // If visiting a product page offline, serve the cached shop or app shell
                    if (cleanUrl.pathname.startsWith('/product/')) {
                        const cachedShop = await caches.match('/shop');
                        if (cachedShop) return cachedShop;
                    }

                    // Fallback to cached home page
                    const cachedHome = await caches.match('/');
                    if (cachedHome) return cachedHome;

                    // Offline fallback
                    const offlinePage = await caches.match('/offline.html');
                    if (offlinePage) return offlinePage;

                    return new Response('You are offline. UK Brand Lover is running in offline mode.', {
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // 3. Core Store Catalog APIs: Always cache when online, synthesize offline product data from catalog
    if (url.pathname.startsWith('/api/products') || 
        url.pathname.startsWith('/api/categories') || 
        url.pathname.startsWith('/api/banners') || 
        url.pathname.startsWith('/api/promotions') || 
        url.pathname.startsWith('/api/homepage-sections') ||
        url.pathname.startsWith('/api/orders')) {
        
        event.respondWith(
            fetch(request)
                .then((apiResponse) => {
                    if (apiResponse && apiResponse.status === 200) {
                        const copy = apiResponse.clone();
                        caches.open(API_CACHE).then((cache) => {
                            cache.put(cleanUrl.toString(), copy.clone());
                            cache.put(cleanUrl.pathname, copy);
                        }).catch(() => {});
                    }
                    return apiResponse;
                })
                .catch(async () => {
                    // 1. Try clean URL match
                    let cachedFallback = await caches.match(cleanUrl.toString());
                    if (cachedFallback) return cachedFallback;

                    // 2. Try pathname match
                    cachedFallback = await caches.match(cleanUrl.pathname);
                    if (cachedFallback) return cachedFallback;

                    // 3. Special Offline Detail Resolver:
                    // If requesting a single product /api/products/[id], synthesize from cached /api/products catalog
                    if (cleanUrl.pathname.startsWith('/api/products/')) {
                        const productId = cleanUrl.pathname.replace('/api/products/', '').split('/')[0];
                        if (productId) {
                            try {
                                const catalogResponse = await caches.match('/api/products');
                                if (catalogResponse) {
                                    const catalogData = await catalogResponse.clone().json();
                                    if (catalogData && Array.isArray(catalogData.products)) {
                                        const found = catalogData.products.find(p => p && p.id === productId);
                                        if (found) {
                                            return new Response(JSON.stringify({
                                                success: true,
                                                product: found,
                                                isOfflineFallback: true
                                            }), {
                                                headers: { 'Content-Type': 'application/json' }
                                            });
                                        }
                                    }
                                }
                            } catch (e) {}
                        }
                    }

                    // 4. Return graceful empty JSON structure so UI never crashes
                    return new Response(JSON.stringify({
                        success: true,
                        isOfflineFallback: true,
                        products: [],
                        categories: [],
                        banners: [],
                        sections: {},
                        orders: []
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // 4. Static Next.js Bundles, Scripts, Fonts, and Stylesheets: Cache-First with Stale-While-Revalidate
    if (url.pathname.startsWith('/_next/static/') || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.woff2') || 
        url.pathname.endsWith('.woff')) {
        
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
                    }
                    return networkResponse;
                }).catch(() => null);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 5. Images, Logos, and Banners: Cache-First with Network Revalidation & Fallback
    if (request.destination === 'image' || 
        url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i) || 
        url.pathname.startsWith('/banner/') || 
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/uploads/')) {
        
        event.respondWith(
            caches.match(request).then((cachedImage) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const copy = networkResponse.clone();
                            caches.open(IMAGE_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
                            return networkResponse;
                        }
                        if (networkResponse && (networkResponse.status === 404 || networkResponse.status === 410)) {
                            caches.open(IMAGE_CACHE).then((cache) => cache.delete(request)).catch(() => {});
                        }
                        return networkResponse;
                    })
                    .catch(async () => {
                        if (cachedImage) return cachedImage;
                        const fallbackLogo = await caches.match('/icon.png');
                        return fallbackLogo || Response.error();
                    });

                return cachedImage || fetchPromise;
            })
        );
        return;
    }

    // 6. Default: Network with Cache Fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
