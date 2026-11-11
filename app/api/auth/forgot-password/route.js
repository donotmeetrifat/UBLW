import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        const trimmedEmail = (email || '').trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { email: trimmedEmail },
            });

            // Even if user doesn't exist, don't leak account existence to potential attackers
            return NextResponse.json({
                success: true,
                message: user
                    ? 'Password recovery link dispatched! Please check your inbox or spam folder.'
                    : 'If an account exists with this email, password recovery instructions have been sent.',
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Password recovery link dispatched! Please check your inbox.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, message: 'Unable to process password reset. Please try again later.' },
            { status: 500 }
        );
    }
}

