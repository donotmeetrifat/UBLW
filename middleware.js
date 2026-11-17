import { NextResponse } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.DIRECT_URL || 'ukbl_auth_secret_key_2026_flagship_secure';

/**
 * High-performance cryptographic HS256 JWT verification using Web Crypto API
 * Runs natively in Next.js Edge Runtime with zero external dependencies.
 */
async function verifyEdgeToken(token, secret) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    try {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Convert base64url signature to binary Uint8Array
        const base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
        const padLen = (4 - (base64.length % 4)) % 4;
        const paddedBase64 = base64 + '='.repeat(padLen);
        const binarySig = atob(paddedBase64);
        const sigBytes = new Uint8Array(binarySig.length);
        for (let i = 0; i < binarySig.length; i++) {
            sigBytes[i] = binarySig.charCodeAt(i);
        }

        const dataBytes = enc.encode(`${headerB64}.${payloadB64}`);
        const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
        if (!isValid) return null;

        // Parse payload
        const payloadBase64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadPadLen = (4 - (payloadBase64.length % 4)) % 4;
        const paddedPayload = payloadBase64 + '='.repeat(payloadPadLen);
        const payloadJson = atob(paddedPayload);
        const data = JSON.parse(payloadJson);

        if (data.exp && Date.now() > data.exp) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('ukbl_token')?.value;
    const user = await verifyEdgeToken(token, AUTH_SECRET);

    // 1. Boundary Protection: /admin and all /admin/* sub-paths
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        // Unauthenticated or customer trying to load admin portal
        if (!user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            loginUrl.searchParams.set('error', 'STAFF_REQUIRED');
            return NextResponse.redirect(loginUrl);
        }

        // Strict Edge Boundary for Employees: Instantly block access to Admin-Only pages
        if (user.role === 'EMPLOYEE') {
            const forbiddenPrefixes = ['/admin/coupons', '/admin/ai-bot', '/admin/team', '/admin/settings'];
            const isBlocked = forbiddenPrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
            if (isBlocked) {
                const adminUrl = new URL('/admin', request.url);
                adminUrl.searchParams.set('error', 'ADMIN_ONLY');
                return NextResponse.redirect(adminUrl);
            }
        }
    }

    // 2. Boundary Protection: /checkout
    if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', '/checkout');
            loginUrl.searchParams.set('error', 'SIGNIN_REQUIRED');
            return NextResponse.redirect(loginUrl);
        }
    }

    // 3. Boundary Protection: Customer Private Portals (/account, /orders)
    if (pathname === '/account' || pathname.startsWith('/account/') ||
        pathname === '/orders' || pathname.startsWith('/orders/')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Pass request through with strict HTTP security headers
    const response = NextResponse.next();

    // Defense-in-Depth HTTP Headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Protect admin, checkout, account, and orders.
         * Exclude static files, images, sitemap, robots, favicon.
         */
        '/admin/:path*',
        '/admin',
        '/checkout/:path*',
        '/checkout',
        '/account/:path*',
        '/account',
        '/orders/:path*',
        '/orders',
    ],
};
