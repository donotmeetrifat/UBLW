const OFFLINE_HTML_FALLBACK = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">\n    <title>Offline Mode | UK Brand Lover</title>\n    <link rel=\"icon\" href=\"/favicon.ico\">\n    <meta name=\"theme-color\" content=\"#6C306E\">\n    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"default\">\n    <style>\n        * {\n            box-sizing: border-box;\n            margin: 0;\n            padding: 0;\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n            -webkit-tap-highlight-color: transparent;\n        }\n\n        body {\n            background: linear-gradient(180deg, #FFFFFF 0%, #FAF6FA 50%, #F5EEF5 100%);\n            color: #241224;\n            min-height: 100vh;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            justify-content: center;\n            padding: 20px 16px;\n        }\n\n        .container {\n            width: 100%;\n            max-width: 440px;\n            background: #FFFFFF;\n            border: 1px solid #EFE0EF;\n            border-radius: 32px;\n            padding: 32px 24px;\n            box-shadow: 0 16px 48px rgba(58, 12, 56, 0.06), 0 4px 16px rgba(58, 12, 56, 0.03);\n            text-align: center;\n            position: relative;\n            overflow: hidden;\n        }\n\n        /* Subtle luxury aura background */\n        .container::before {\n            content: \"\";\n            position: absolute;\n            top: -60px;\n            left: 50%;\n            transform: translateX(-50%);\n            width: 220px;\n            height: 220px;\n            background: radial-gradient(circle, rgba(108, 48, 110, 0.08) 0%, rgba(216, 181, 109, 0.05) 50%, transparent 70%);\n            pointer-events: none;\n            z-index: 0;\n        }\n\n        .content {\n            position: relative;\n            z-index: 1;\n        }\n\n        /* Brand Header */\n        .brand-logo {\n            display: inline-block;\n            margin-bottom: 20px;\n        }\n\n        .brand-logo img {\n            width: 130px;\n            height: auto;\n            display: block;\n            margin: 0 auto;\n        }\n\n        /* Status Badge */\n        .status-pill {\n            display: inline-flex;\n            align-items: center;\n            gap: 8px;\n            background: #FAF6FA;\n            border: 1px solid #EFE0EF;\n            padding: 6px 14px;\n            border-radius: 999px;\n            font-size: 11px;\n            font-weight: 700;\n            color: #6C306E;\n            letter-spacing: 0.4px;\n            text-transform: uppercase;\n            margin-bottom: 20px;\n            transition: all 0.3s ease;\n        }\n\n        .status-dot {\n            width: 7px;\n            height: 7px;\n            border-radius: 50%;\n            background: #F59E0B;\n            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);\n            animation: pulseDot 2s infinite;\n        }\n\n        @keyframes pulseDot {\n            0% { transform: scale(1); opacity: 1; }\n            50% { transform: scale(1.3); opacity: 0.7; }\n            100% { transform: scale(1); opacity: 1; }\n        }\n\n        /* Icon Circle */\n        .icon-wrapper {\n            width: 68px;\n            height: 68px;\n            border-radius: 22px;\n            background: linear-gradient(135deg, #FAF6FA 0%, #F5EEF5 100%);\n            border: 1px solid #EFE0EF;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            margin: 0 auto 18px auto;\n            color: #6C306E;\n            box-shadow: 0 6px 16px rgba(108, 48, 110, 0.05);\n        }\n\n        h1 {\n            font-size: 22px;\n            font-weight: 800;\n            color: #241224;\n            line-height: 1.3;\n            margin-bottom: 8px;\n            letter-spacing: -0.3px;\n        }\n\n        .subtitle {\n            font-size: 13px;\n            color: #64748B;\n            line-height: 1.55;\n            margin-bottom: 24px;\n            padding: 0 4px;\n        }\n\n        /* Quick Feature Cards */\n        .features-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 10px;\n            margin-bottom: 22px;\n            text-align: left;\n        }\n\n        .feature-card {\n            background: #FAF6FA;\n            border: 1px solid #EFE0EF;\n            border-radius: 18px;\n            padding: 12px 14px;\n            text-decoration: none;\n            color: inherit;\n            display: flex;\n            flex-direction: column;\n            justify-content: space-between;\n            transition: all 0.2s ease;\n        }\n\n        .feature-card:active, .feature-card:hover {\n            background: #F5EEF5;\n            border-color: #6C306E;\n            transform: translateY(-1px);\n        }\n\n        .feature-top {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 6px;\n        }\n\n        .feature-icon {\n            color: #6C306E;\n        }\n\n        .feature-title {\n            font-size: 12px;\n            font-weight: 800;\n            color: #241224;\n            display: block;\n        }\n\n        .feature-sub {\n            font-size: 10px;\n            color: #64748B;\n            margin-top: 2px;\n            display: block;\n            font-weight: 500;\n        }\n\n        /* Actions */\n        .actions-stack {\n            display: flex;\n            flex-direction: column;\n            gap: 10px;\n        }\n\n        .btn-retry {\n            width: 100%;\n            background: linear-gradient(135deg, #6C306E 0%, #4A124C 100%);\n            color: #FFFFFF;\n            border: none;\n            border-radius: 999px;\n            padding: 14px 24px;\n            font-size: 13px;\n            font-weight: 700;\n            cursor: pointer;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            gap: 8px;\n            transition: all 0.2s ease;\n            box-shadow: 0 4px 16px rgba(108, 48, 110, 0.25);\n        }\n\n        .btn-retry:active {\n            transform: scale(0.98);\n            opacity: 0.95;\n        }\n\n        .btn-home {\n            width: 100%;\n            background: #FFFFFF;\n            color: #241224;\n            border: 1px solid #EFE0EF;\n            border-radius: 999px;\n            padding: 12px 24px;\n            font-size: 13px;\n            font-weight: 700;\n            text-decoration: none;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            gap: 6px;\n            transition: all 0.2s ease;\n        }\n\n        .btn-home:active, .btn-home:hover {\n            background: #FAF6FA;\n            border-color: #6C306E;\n        }\n\n        /* Footer Note */\n        .footer-note {\n            margin-top: 20px;\n            padding-top: 16px;\n            border-top: 1px solid #EFE0EF;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            gap: 6px;\n            font-size: 11px;\n            font-weight: 600;\n            color: #94A3B8;\n        }\n\n        .footer-note svg {\n            color: #D8B56D;\n            flex-shrink: 0;\n        }\n\n        /* Spinning animation for reconnect */\n        .spin {\n            animation: spin 1s linear infinite;\n        }\n\n        @keyframes spin {\n            from { transform: rotate(0deg); }\n            to { transform: rotate(360deg); }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"content\">\n            <!-- Brand Logo -->\n            <div class=\"brand-logo\">\n                <img src=\"/images/web-logo-optimized.png\" alt=\"UK Brand Lover\" onerror=\"this.onerror=null; this.src='/icon.png';\">\n            </div>\n\n            <!-- Status Pill -->\n            <div>\n                <div class=\"status-pill\" id=\"statusPill\">\n                    <span class=\"status-dot\" id=\"statusDot\"></span>\n                    <span id=\"statusText\">Offline Mode Active</span>\n                </div>\n            </div>\n\n            <!-- Illustration Icon -->\n            <div class=\"icon-wrapper\">\n                <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                    <line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"></line>\n                    <path d=\"M16.72 11.06A10.94 10.94 0 0 1 19 12.55\"></path>\n                    <path d=\"M5 12.55a10.94 10.94 0 0 1 5.17-2.39\"></path>\n                    <path d=\"M10.71 5.05A16 16 0 0 1 22.58 9\"></path>\n                    <path d=\"M1.42 9a15.91 15.91 0 0 1 4.7-2.88\"></path>\n                    <path d=\"M8.53 16.11a6 6 0 0 1 6.95 0\"></path>\n                    <line x1=\"12\" y1=\"20\" x2=\"12.01\" y2=\"20\"></line>\n                </svg>\n            </div>\n\n            <!-- Title & Subtitle -->\n            <h1>You're Browsing Offline</h1>\n            <p class=\"subtitle\">\n                No active internet connection was detected. But don't worry — your saved bag and cached UK beauty products remain available.\n            </p>\n\n            <!-- Organized Offline Shortcuts Grid -->\n            <div class=\"features-grid\">\n                <a href=\"/cart\" class=\"feature-card\">\n                    <div class=\"feature-top\">\n                        <span class=\"feature-title\">Shopping Bag</span>\n                        <svg class=\"feature-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                            <path d=\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\"></path>\n                            <path d=\"M3 6h18\"></path>\n                            <path d=\"M16 10a4 4 0 0 1-8 0\"></path>\n                        </svg>\n                    </div>\n                    <span class=\"feature-sub\" id=\"cartCountLabel\">Saved items accessible</span>\n                </a>\n\n                <a href=\"/shop\" class=\"feature-card\">\n                    <div class=\"feature-top\">\n                        <span class=\"feature-title\">Beauty Shop</span>\n                        <svg class=\"feature-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n                            <path d=\"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7\"></path>\n                            <path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"></path>\n                            <path d=\"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4\"></path>\n                            <path d=\"M2 7h20\"></path>\n                        </svg>\n                    </div>\n                    <span class=\"feature-sub\" id=\"productCountLabel\">Cached UK catalog</span>\n                </a>\n            </div>\n\n            <!-- Action Controls -->\n            <div class=\"actions-stack\">\n                <button type=\"button\" class=\"btn-retry\" id=\"retryBtn\" onclick=\"handleRetry()\">\n                    <svg id=\"retryIcon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n                        <path d=\"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path>\n                        <path d=\"M3 3v5h5\"></path>\n                        <path d=\"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16\"></path>\n                        <path d=\"M16 21h5v-5\"></path>\n                    </svg>\n                    <span id=\"retryText\">Try Reconnecting</span>\n                </button>\n\n                <a href=\"/\" class=\"btn-home\">\n                    <span>Return to Storefront</span>\n                </a>\n            </div>\n\n            <!-- Security & Guarantee Badge -->\n            <div class=\"footer-note\">\n                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n                    <path d=\"m12 2 8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z\"/>\n                </svg>\n                <span>100% Authentic UK Imported Beauty Flagship</span>\n            </div>\n        </div>\n    </div>\n\n    <script>\n        // Dynamic detection of cached products and bag items\n        try {\n            const rawCart = localStorage.getItem('ukbl_cart');\n            if (rawCart) {\n                const parsedCart = JSON.parse(rawCart);\n                const count = parsedCart.total || Object.keys(parsedCart.cartItems || {}).length || 0;\n                if (count > 0) {\n                    document.getElementById('cartCountLabel').textContent = count + (count === 1 ? ' saved item' : ' saved items');\n                }\n            }\n\n            const rawProducts = localStorage.getItem('ukbl_cached_products');\n            if (rawProducts) {\n                const parsed = JSON.parse(rawProducts);\n                if (Array.isArray(parsed) && parsed.length > 0) {\n                    document.getElementById('productCountLabel').textContent = parsed.length + ' UK products ready';\n                }\n            }\n        } catch (e) {}\n\n        // Automatic Reconnection Detector\n        function setConnectedState() {\n            const pill = document.getElementById('statusPill');\n            const dot = document.getElementById('statusDot');\n            const text = document.getElementById('statusText');\n            if (!pill || !dot || !text) return;\n\n            pill.style.background = '#ECFDF5';\n            pill.style.borderColor = '#A7F3D0';\n            pill.style.color = '#065F46';\n            dot.style.background = '#10B981';\n            dot.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';\n            text.textContent = 'Connection Restored! Loading...';\n\n            setTimeout(() => {\n                window.location.href = '/';\n            }, 500);\n        }\n\n        window.addEventListener('online', setConnectedState);\n\n        // Manual Retry Button with Feedback\n        function handleRetry() {\n            const btn = document.getElementById('retryBtn');\n            const icon = document.getElementById('retryIcon');\n            const text = document.getElementById('retryText');\n\n            if (icon) icon.classList.add('spin');\n            if (text) text.textContent = 'Checking connection...';\n\n            fetch('/api/sync/version?_t=' + Date.now(), { cache: 'no-store' })\n                .then(res => {\n                    if (res.ok) {\n                        setConnectedState();\n                    } else {\n                        throw new Error('Not ready');\n                    }\n                })\n                .catch(() => {\n                    setTimeout(() => {\n                        if (icon) icon.classList.remove('spin');\n                        if (text) text.textContent = 'Still offline — Retry';\n                    }, 800);\n                });\n        }\n    </script>\n</body>\n</html>\n";

const CACHE_NAME = 'ukbl-v8';
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
    '/icon-192.png',
    '/icon-maskable.png',
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
            // Pre-cache URLs individually (both relative and absolute) so one failure does not abort the rest
            await Promise.allSettled(
                PRECACHE_URLS.map(async (url) => {
                    try {
                        const res = await fetch(url, { cache: 'no-cache' });
                        if (res && res.status === 200) {
                            await cache.put(url, res.clone());
                            try {
                                const absUrl = new URL(url, self.location.origin).toString();
                                await cache.put(absUrl, res);
                            } catch (e) {}
                        }
                    } catch (err) {
                        console.warn('[SW] Pre-cache item skipped:', url, err);
                    }
                })
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

                    // Guaranteed HTML offline page - never falls back to plain text or browser error
                    return new Response(OFFLINE_HTML_FALLBACK, {
                        status: 200,
                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
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
