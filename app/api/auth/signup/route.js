import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { hashPassword, createSessionToken, sanitizeUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, password, confirmPassword } = body;

        // 1. Validation
        const trimmedName = (name || '').trim();
        if (!trimmedName || trimmedName.length < 2) {
            return NextResponse.json(
                { success: false, message: 'Please enter your full name (at least 2 characters).' },
                { status: 400 }
            );
        }

        const trimmedEmail = (email || '').trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        // Clean phone number: remove any non-digit characters
        let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
        // If it starts with Bangladesh country code 880, extract the local 11 digits:
        if (cleanPhone.startsWith('880') && cleanPhone.length === 13) {
            cleanPhone = '0' + cleanPhone.slice(3);
        }
        if (!cleanPhone || cleanPhone.length < 11) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid 11-digit phone number (e.g. 01XXXXXXXXX).' },
                { status: 400 }
            );
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters long.' },
                { status: 400 }
            );
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: 'Passwords do not match. Please verify and try again.' },
                { status: 400 }
            );
        }

        // 2. Database verification & persistence
        if (isDatabaseConfigured()) {
            // Check if email already registered
            const existingEmail = await prisma.user.findUnique({
                where: { email: trimmedEmail },
            });

            if (existingEmail) {
                return NextResponse.json(
                    { success: false, message: 'An account with this email address already exists. Please sign in instead.' },
                    { status: 409 }
                );
            }

            // 3. Create user in database (Phone is customer contact/tracking data and does not restrict multiple accounts)
            const passwordHash = hashPassword(password);
            const user = await prisma.user.create({
                data: {
                    name: trimmedName,
                    email: trimmedEmail,
                    phone: cleanPhone,
                    whatsapp: cleanPhone,
                    passwordHash,
                    role: 'CUSTOMER',
                    cart: {},
                    lastActiveAt: new Date(),
                },
            });

            const safeUser = sanitizeUser(user);
            const token = createSessionToken(safeUser);

            const response = NextResponse.json(
                {
                    success: true,
                    message: 'Account created successfully! Welcome to UK Brand Lover.',
                    user: safeUser,
                    token,
                },
                { status: 201 }
            );

            // Set secure auth cookie
            response.cookies.set('ukbl_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });

            return response;
        }

        // Fallback for offline/local environment without database
        const passwordHash = hashPassword(password);
        const fallbackUser = {
            id: `user_${Date.now()}`,
            name: trimmedName,
            email: trimmedEmail,
            phone: cleanPhone,
            whatsapp: cleanPhone,
            role: 'CUSTOMER',
            createdAt: new Date().toISOString(),
        };

        const safeUser = sanitizeUser(fallbackUser);
        const token = createSessionToken(safeUser);

        const response = NextResponse.json(
            {
                success: true,
                message: 'Account created successfully! Welcome to UK Brand Lover.',
                user: safeUser,
                token,
            },
            { status: 201 }
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
        console.error('Sign-up API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'An unexpected error occurred during registration. Please try again.' },
            { status: 500 }
        );
    }
}

