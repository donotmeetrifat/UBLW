import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest, sanitizeUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, user: null }, { status: 401 });
        }

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
            });

            if (!user) {
                return NextResponse.json({ success: false, user: null }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                user: sanitizeUser(user),
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
