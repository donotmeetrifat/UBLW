import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.DIRECT_URL || 'ukbl_auth_secret_key_2026_flagship_secure';
const TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Hash a plain password using Node.js crypto.scryptSync with unique salt.
 * Output format: "salt:hash"
 */
export function hashPassword(password) {
    if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

/**
 * Verify a plain password against stored "salt:hash" using constant-time comparison.
 */
export function verifyPassword(password, storedPasswordHash) {
    if (!password || !storedPasswordHash || typeof storedPasswordHash !== 'string') {
        return false;
    }
    const parts = storedPasswordHash.split(':');
    if (parts.length !== 2) {
        return false;
    }
    const [salt, expectedHashHex] = parts;
    try {
        const expectedBuffer = Buffer.from(expectedHashHex, 'hex');
        const actualBuffer = crypto.scryptSync(password, salt, 64);
        if (expectedBuffer.length !== actualBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
        return false;
    }
}

/**
 * Create a signed JWT-like session token (HMAC-SHA256).
 */
export function createSessionToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'CUSTOMER',
        phone: user.phone || null,
        iat: Date.now(),
        exp: Date.now() + TOKEN_MAX_AGE_SECONDS * 1000,
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}

/**
 * Verify a session token and return its payload if valid and not expired.
 */
export function verifySessionToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');

    try {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }

        const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (data.exp && Date.now() > data.exp) {
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

/**
 * Extract authenticated user payload from Next.js request.
 */
export function getUserFromRequest(request) {
    try {
        const cookieToken = request.cookies?.get('ukbl_token')?.value;
        if (cookieToken) {
            const user = verifySessionToken(cookieToken);
            if (user) return user;
        }

        const authHeader = request.headers?.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const bearerToken = authHeader.substring(7);
            const user = verifySessionToken(bearerToken);
            if (user) return user;
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Helper to get clean, safe user representation (no passwords or sensitive data).
 */
export function sanitizeUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        whatsapp: user.whatsapp || user.phone || null,
        role: user.role || 'CUSTOMER',
        image: user.image || null,
        createdAt: user.createdAt || new Date().toISOString(),
    };
}

