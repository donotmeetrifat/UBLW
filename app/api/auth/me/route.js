import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest, sanitizeUser, hashPassword, verifyPassword, createSessionToken, verifyPasswordOtp } from '@/lib/auth';

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, user: null }, { status: 401 });
        }

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                include: {
                    addresses: {
                        where: { isDefault: true },
                        take: 1,
                    },
                },
            });

            if (!user || (user.role !== 'ADMIN' && !user.isVerified && !user.emailVerified)) {
                return NextResponse.json({ success: false, user: null }, { status: 401 });
            }

            const safe = sanitizeUser(user);
            if (user.addresses && user.addresses[0]) {
                safe.defaultAddress = user.addresses[0];
            }

            return NextResponse.json({
                success: true,
                user: safe,
            });
        }

        return NextResponse.json({
            success: true,
            user: payload,
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ success: false, user: null }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, email, password, otp } = body;

        // Retrieve existing registered user to check immutable email constraint
        let currentEmail = payload.email;
        let existingUser = null;
        if (isDatabaseConfigured()) {
            existingUser = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { email: true, passwordHash: true }
            });
            if (existingUser?.email) {
                currentEmail = existingUser.email;
            }
        }

        // STRICT BACKEND SECURITY: Email address cannot be changed under any circumstances
        if (email && typeof email === 'string' && currentEmail) {
            const submittedEmail = email.trim().toLowerCase();
            const registeredEmail = currentEmail.trim().toLowerCase();
            if (submittedEmail !== registeredEmail) {
                return NextResponse.json({
                    success: false,
                    message: 'Account email address cannot be changed. It is permanently linked to your registered account.',
                }, { status: 400 });
            }
        }

        const updateData = {};
        if (name && typeof name === 'string' && name.trim().length >= 2) {
            updateData.name = name.trim();
        }

        // NOTE: Email update is strictly prohibited on the backend.
        // Account email is permanently immutable once registered.

        if (phone && typeof phone === 'string') {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            if (cleanPhone.length >= 11) {
                updateData.phone = cleanPhone;
                updateData.whatsapp = cleanPhone;
            }
        }

        if (password && typeof password === 'string' && password.length >= 6) {
            // STRICT SECURITY 1: Ensure new password is not identical to current account password
            if (existingUser?.passwordHash && verifyPassword(password, existingUser.passwordHash)) {
                return NextResponse.json({
                    success: false,
                    message: 'New password cannot be the same as your current password. Please choose a different password.',
                }, { status: 400 });
            }

            // STRICT SECURITY 2: Require valid 6-digit OTP from email
            if (!otp || String(otp).trim().length !== 6) {
                return NextResponse.json({
                    success: false,
                    message: 'A 6-digit OTP verification code from your email is required to change your password.',
                    requiresOtp: true,
                }, { status: 400 });
            }

            const isValidOtp = verifyPasswordOtp(payload.id, otp);
            if (!isValidOtp) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid or expired OTP verification code. Please check your email and enter the correct code.',
                    requiresOtp: true,
                }, { status: 400 });
            }

            updateData.passwordHash = hashPassword(password);
        }

        if (isDatabaseConfigured()) {
            const updatedUser = await prisma.user.update({
                where: { id: payload.id },
                data: updateData,
            });

            const safeUser = sanitizeUser(updatedUser);
            const token = createSessionToken(safeUser);

            const response = NextResponse.json({
                success: true,
                message: 'Profile updated successfully!',
                user: safeUser,
            });

            response.cookies.set('ukbl_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });

            return response;
        }

        const updatedPayload = { ...payload, ...updateData, email: currentEmail || payload.email };
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully!',
            user: updatedPayload,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Unable to update profile' }, { status: 500 });
    }
}

