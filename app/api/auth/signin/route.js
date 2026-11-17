import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { verifyPassword, hashPassword, createSessionToken, sanitizeUser } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        const ip = getClientIp(request);
        const rateCheck = checkRateLimit(`signin_${ip}`, 5, 15 * 60 * 1000);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: `Too many sign-in attempts. Please wait ${rateCheck.retryAfter} seconds before trying again.`
                },
                { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter) } }
            );
        }

        const body = await request.json();
        const { identifier, email, phone, password } = body;

        const rawInput = (identifier || email || phone || '').trim();
        if (!rawInput) {
            return NextResponse.json(
                { success: false, message: 'Please enter your email address or phone number.' },
                { status: 400 }
            );
        }

        if (!password || typeof password !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Please enter your password.' },
                { status: 400 }
            );
        }

        if (isDatabaseConfigured()) {
            const isEmail = rawInput.includes('@');
            let user = null;

            if (isEmail) {
                user = await prisma.user.findUnique({
                    where: { email: rawInput.toLowerCase() },
                });
            } else {
                let cleanPhone = rawInput.replace(/[^0-9]/g, '');
                if (cleanPhone.startsWith('880') && cleanPhone.length === 13) {
                    cleanPhone = '0' + cleanPhone.slice(3);
                }
                user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { phone: cleanPhone },
                            { phone: rawInput },
                            { email: rawInput.toLowerCase() },
                        ],
                    },
                });
            }

            if (!user) {
                return NextResponse.json(
                    { success: false, message: 'No account found with this email or phone number. Please check your credentials or create a new account.' },
                    { status: 401 }
                );
            }

            if (user.isActive === false) {
                return NextResponse.json(
                    { success: false, error: 'DEACTIVATED', message: 'This account has been deactivated or blocked. Please contact customer support.' },
                    { status: 403 }
                );
            }

            // Check password
            let isPasswordValid = false;

            if (user.passwordHash) {
                isPasswordValid = verifyPassword(password, user.passwordHash);
            } else {
                // Legacy or initial admin seed user without passwordHash
                // If it's the admin or initial user, set their password on first successful sign in:
                const isSpecialSeed = user.role === 'ADMIN' || user.email === 'support@ukbrandlover.com';
                if (isSpecialSeed || password.length >= 6) {
                    const newHash = hashPassword(password);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { passwordHash: newHash },
                    });
                    isPasswordValid = true;
                }
            }

            if (!isPasswordValid) {
                return NextResponse.json(
                    { success: false, message: 'Incorrect password. Please verify and try again.' },
                    { status: 401 }
                );
            }

            // Enforce email verification for customers (Admins bypass)
            if (user.role !== 'ADMIN' && !user.isVerified && !user.emailVerified) {
                return NextResponse.json(
                    {
                        success: false,
                        requireVerification: true,
                        email: user.email,
                        message: 'Your email address is not verified yet. Please enter the verification code sent from Supabase to complete registration.'
                    },
                    { status: 403 }
                );
            }

            // Update user activity
            await prisma.user.update({
                where: { id: user.id },
                data: { lastActiveAt: new Date() },
            });

            const safeUser = sanitizeUser(user);
            const token = createSessionToken(safeUser);

            const response = NextResponse.json(
                {
                    success: true,
                    message: 'Welcome back to UK Brand Lover!',
                    user: safeUser,
                    token,
                },
                { status: 200 }
            );

            response.cookies.set('ukbl_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { success: false, message: 'Authentication service is temporarily unavailable. Please try again in a few moments.' },
            { status: 503 }
        );
    } catch (error) {
        console.error('Sign-in API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'An unexpected error occurred during sign in. Please try again.' },
            { status: 500 }
        );
    }
}

