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

// Global in-memory store for password change OTP verification
if (!global.__UKBL_PASSWORD_OTPS) {
    global.__UKBL_PASSWORD_OTPS = new Map();
}

/**
 * Generate a 6-digit OTP for password change/verification.
 * Valid for 10 minutes.
 */
export function generatePasswordOtp(userId, target = '') {
    // Generate secure 6-digit numeric string
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    global.__UKBL_PASSWORD_OTPS.set(userId, {
        code,
        target,
        expiresAt,
        attempts: 0,
    });

    return { code, expiresAt };
}

/**
 * Verify a 6-digit password OTP.
 */
export function verifyPasswordOtp(userId, inputOtp) {
    if (!userId || !inputOtp) return false;
    const record = global.__UKBL_PASSWORD_OTPS.get(userId);
    if (!record) return false;

    // Check expiration
    if (Date.now() > record.expiresAt) {
        global.__UKBL_PASSWORD_OTPS.delete(userId);
        return false;
    }

    // Check rate limit on attempts (max 5)
    record.attempts += 1;
    if (record.attempts > 5) {
        global.__UKBL_PASSWORD_OTPS.delete(userId);
        return false;
    }

    const cleanInput = String(inputOtp).trim().replace(/\s+/g, '');
    if (cleanInput === record.code) {
        // Successful verification - clear OTP
        global.__UKBL_PASSWORD_OTPS.delete(userId);
        return true;
    }

    return false;
}

/**
 * Mask phone number or email for privacy display.
 * e.g., 01959524393 -> 0195****93, test@example.com -> t***@example.com
 */
export function maskContact(contact) {
    if (!contact || typeof contact !== 'string') return 'your registered contact';
    if (contact.includes('@')) {
        const [local, domain] = contact.split('@');
        if (local.length <= 2) return `${local[0]}*@${domain}`;
        return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
    }
    const clean = contact.replace(/[^0-9+]/g, '');
    if (clean.length >= 8) {
        return `${clean.slice(0, 4)}****${clean.slice(-2)}`;
    }
    return clean;
}

