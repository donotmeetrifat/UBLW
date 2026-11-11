import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest, sanitizeUser, hashPassword, createSessionToken } from '@/lib/auth';

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

            if (!user) {
                return NextResponse.json({ success: false, user: null }, { status: 404 });
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
        const { name, phone, email, password } = body;

        const updateData = {};
        if (name && typeof name === 'string' && name.trim().length >= 2) {
            updateData.name = name.trim();
        }

        if (email && typeof email === 'string' && email.includes('@')) {
            updateData.email = email.trim().toLowerCase();
        }

        if (phone && typeof phone === 'string') {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            if (cleanPhone.length >= 11) {
                updateData.phone = cleanPhone;
                updateData.whatsapp = cleanPhone;
            }
        }

        if (password && typeof password === 'string' && password.length >= 6) {
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

        const updatedPayload = { ...payload, ...updateData };
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

