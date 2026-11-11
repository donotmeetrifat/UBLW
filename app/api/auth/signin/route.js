import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { verifyPassword, hashPassword, createSessionToken, sanitizeUser } from '@/lib/auth';

export async function POST(request) {
    try {
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

        // Fallback for offline/local environment
        const cleanPhone = rawInput.replace(/[^0-9]/g, '');
        const fallbackUser = {
            id: `user_${Date.now()}`,
            name: rawInput.includes('@') ? rawInput.split('@')[0] : 'Valued Customer',
            email: rawInput.includes('@') ? rawInput : `${cleanPhone || 'customer'}@ukbrandlover.com`,
            phone: cleanPhone || '01959524393',
            whatsapp: cleanPhone || '01959524393',
            role: rawInput.includes('admin') ? 'ADMIN' : 'CUSTOMER',
        };

        const safeUser = sanitizeUser(fallbackUser);
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
    } catch (error) {
        console.error('Sign-in API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'An unexpected error occurred during sign in. Please try again.' },
            { status: 500 }
        );
    }
}
