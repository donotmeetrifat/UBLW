import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest, generatePasswordOtp, maskContact, verifyPassword } from '@/lib/auth';
import { sendPasswordOtpEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, message: 'Please sign in to request a password verification code.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { newPassword } = body;

        let user = null;
        if (isDatabaseConfigured()) {
            try {
                user = await prisma.user.findUnique({
                    where: { id: payload.id },
                    select: { id: true, name: true, email: true, passwordHash: true },
                });
            } catch (dbErr) {
                console.error('Database lookup error in OTP send:', dbErr);
            }
        }

        // STRICT SECURITY 1: Ensure new password is not identical to current account password
        if (newPassword && user?.passwordHash) {
            const isSamePassword = verifyPassword(newPassword, user.passwordHash);
            if (isSamePassword) {
                return NextResponse.json({
                    success: false,
                    message: 'New password cannot be the same as your current password. Please choose a different password.',
                }, { status: 400 });
            }
        }

        // STRICT SECURITY 2: Target MUST be registered email address (NOT WhatsApp/Phone)
        const targetEmail = user?.email || payload.email;
        if (!targetEmail || !targetEmail.includes('@')) {
            return NextResponse.json({
                success: false,
                message: 'No registered email address found for this account. Please contact support.',
            }, { status: 400 });
        }

        const { code, expiresAt } = generatePasswordOtp(payload.id, targetEmail);
        const masked = maskContact(targetEmail);

        // STRICT SECURITY 3: Dispatch OTP directly to user's registered email address
        try {
            await sendPasswordOtpEmail({
                to: targetEmail,
                name: user?.name || payload.name || 'Valued Customer',
                otp: code,
            });
        } catch (emailErr) {
            console.error('Failed to send OTP email:', emailErr);
        }

        // Return confirmation without exposing the verification code in any form
        return NextResponse.json({
            success: true,
            message: `A 6-digit verification code has been dispatched to your email (${masked}). Please check your inbox.`,
            target: masked,
            expiresAt,
        });
    } catch (error) {
        console.error('Error sending password change OTP:', error);
        return NextResponse.json({ success: false, message: 'Failed to generate verification code. Please try again.' }, { status: 500 });
    }
}
