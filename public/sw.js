const CACHE_NAME = 'ukbl-v1';
const STATIC_CACHE = 'ukbl-static-v1';
const PAGES_CACHE = 'ukbl-pages-v1';
const API_CACHE = 'ukbl-api-v1';
const IMAGE_CACHE = 'ukbl-images-v1';

const PRECACHE_URLS = [
    '/',
    '/shop',
    '/cart',
    '/contact',
    '/offline.html',
    '/manifest.json',
    '/favicon.ico',
    '/icon.png',
    '/apple-icon.png',
    '/images/web-logo-optimized.png'
];

// Install Event: Pre-cache core shell resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(PRECACHE_URLS).catch((err) => {
                console.warn('[SW] Pre-cache partial failure:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old legacy caches
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

// Fetch Event: Strategy Router
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extension and external third-party tracking scripts
    if (url.origin !== self.location.origin && !url.hostname.includes('vercel') && !url.hostname.includes('supabase')) {
        return;
    }

    // 1. Navigation Requests (HTML Page Visits): Network-First with Cache Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Try page cache
                    const cachedPage = await caches.match(request);
                    if (cachedPage) return cachedPage;

                    // Fallback to home page or offline fallback
                    const cachedHome = await caches.match('/');
                    if (cachedHome) return cachedHome;

                    const offlinePage = await caches.match('/offline.html');
                    if (offlinePage) return offlinePage;

                    return new Response('You are offline. Please reconnect to access this page.', {
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                })
        );
        return;
    }

    // 2. Core Catalog APIs: Network-First with Offline API Cache Fallback
    if (url.pathname.startsWith('/api/products') || 
        url.pathname.startsWith('/api/categories') || 
        url.pathname.startsWith('/api/banners') || 
        url.pathname.startsWith('/api/promotions') || 
        url.pathname.startsWith('/api/homepage-sections')) {
        event.respondWith(
            fetch(request)
                .then((apiResponse) => {
                    if (apiResponse && apiResponse.status === 200) {
                        const copy = apiResponse.clone();
                        caches.open(API_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return apiResponse;
                })
                .catch(async () => {
                    const cachedApiResponse = await caches.match(request);
                    if (cachedApiResponse) return cachedApiResponse;

                    return new Response(JSON.stringify({
                        success: true,
                        isOfflineFallback: true,
                        message: 'Serving offline cached catalog'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // 3. Static Next.js Bundles, Scripts, and Stylesheets: Cache-First with Stale-While-Revalidate
    if (url.pathname.startsWith('/_next/static/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                }).catch(() => null);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 4. Images, Logos, and Banners: Cache-First
    if (request.destination === 'image' || 
        url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i) || 
        url.pathname.startsWith('/banner/') || 
        url.pathname.startsWith('/images/')) {
        event.respondWith(
            caches.match(request).then(async (cachedImage) => {
                if (cachedImage) return cachedImage;

                try {
                    const networkImage = await fetch(request);
                    if (networkImage && networkImage.status === 200) {
                        const copy = networkImage.clone();
                        caches.open(IMAGE_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return networkImage;
                } catch (err) {
                    // Fallback to cached default logo if available
                    const fallbackLogo = await caches.match('/icon.png');
                    return fallbackLogo || Response.error();
                }
            })
        );
        return;
    }

    // 5. Default: Network with Cache Fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
