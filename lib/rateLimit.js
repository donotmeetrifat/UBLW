/**
 * In-Memory Sliding Window Rate Limiter
 * Provides robust brute-force, credential stuffing, and bot flooding protection
 * for sensitive endpoints (login, signup, OTP, checkout).
 */

const rateLimitStore = new Map();

// Periodic garbage collection every 5 minutes to prevent memory leaks
if (!global.__UKBL_RATE_LIMIT_CLEANUP) {
    global.__UKBL_RATE_LIMIT_CLEANUP = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of rateLimitStore.entries()) {
            if (record.resetTime < now) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

/**
 * Extract client IP address from standard HTTP headers
 */
export function getClientIp(request) {
    if (!request) return '127.0.0.1';
    try {
        const xForwardedFor = request.headers.get('x-forwarded-for');
        if (xForwardedFor) {
            return xForwardedFor.split(',')[0].trim();
        }
        const xRealIp = request.headers.get('x-real-ip');
        if (xRealIp) return xRealIp.trim();
        const cfConnectingIp = request.headers.get('cf-connecting-ip');
        if (cfConnectingIp) return cfConnectingIp.trim();
    } catch {
        // Fallback
    }
    return '127.0.0.1';
}

/**
 * Check and record a rate limit attempt
 * @param {string} identifier - Unique ID (e.g. `signin_${ip}` or `orders_${userId}`)
 * @param {number} maxAttempts - Allowed attempts within window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
        // Window expired or new key
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            allowed: true,
            remaining: maxAttempts - 1,
            retryAfter: 0,
        };
    }

    if (record.count >= maxAttempts) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            retryAfter,
        };
    }

    record.count += 1;
    return {
        allowed: true,
        remaining: maxAttempts - record.count,
        retryAfter: 0,
    };
}
