const CACHE_NAME = 'ukbl-v5';
const STATIC_CACHE = 'ukbl-static-v5';
const PAGES_CACHE = 'ukbl-pages-v5';
const API_CACHE = 'ukbl-api-v5';
const IMAGE_CACHE = 'ukbl-images-v5';

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

// Real-time cache invalidation message listener from Admin and Client events
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

// Fetch Event: Strategy Router
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

    const isCacheBusted = url.searchParams.has('_t') || 
                          request.headers.get('Cache-Control')?.includes('no-cache') || 
                          request.headers.get('Pragma') === 'no-cache';

    // 1. Navigation Requests (HTML Page Visits): Network-First with Cache Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
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

    // 2. Core Catalog APIs: Always fetch fresh live network data when cache-busted; offline cache fallback
    if (url.pathname.startsWith('/api/products') || 
        url.pathname.startsWith('/api/categories') || 
        url.pathname.startsWith('/api/banners') || 
        url.pathname.startsWith('/api/promotions') || 
        url.pathname.startsWith('/api/homepage-sections')) {
        
        // If explicitly cache-busted or no-cache, bypass cache lookup completely and hit live network
        if (isCacheBusted) {
            event.respondWith(
                fetch(request)
                    .then((apiResponse) => {
                        return apiResponse;
                    })
                    .catch(async () => {
                        // Offline emergency fallback
                        const cleanUrl = new URL(request.url);
                        cleanUrl.searchParams.delete('_t');
                        const cachedFallback = await caches.match(cleanUrl.toString());
                        if (cachedFallback) return cachedFallback;

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

        event.respondWith(
            fetch(request)
                .then((apiResponse) => {
                    if (apiResponse && apiResponse.status === 200) {
                        const copy = apiResponse.clone();
                        caches.open(API_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
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

    // 4. Images, Logos, and Banners: Network-First with Offline Cache Fallback (Ensures fresh live images & no ghost cached images)
    if (request.destination === 'image' || 
        url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|gif)$/i) || 
        url.pathname.startsWith('/banner/') || 
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/uploads/')) {
        
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(IMAGE_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
                        return networkResponse;
                    }
                    if (networkResponse && (networkResponse.status === 404 || networkResponse.status === 410)) {
                        // Image deleted or not found on server: immediately purge from cache so it never shows stale
                        caches.open(IMAGE_CACHE).then((cache) => cache.delete(request)).catch(() => {});
                        return networkResponse;
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Offline fallback: when device has no connection, serve cached image
                    const cachedImage = await caches.match(request);
                    if (cachedImage) return cachedImage;

                    const fallbackLogo = await caches.match('/icon.png');
                    return fallbackLogo || Response.error();
                })
        );
        return;
    }

    // 5. Default: Network with Cache Fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

