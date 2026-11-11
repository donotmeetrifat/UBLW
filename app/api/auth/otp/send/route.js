import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest, generatePasswordOtp, maskContact } from '@/lib/auth';

export async function POST(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, message: 'Please sign in to request an OTP.' }, { status: 401 });
        }

        let contactTarget = payload.phone || payload.whatsapp || payload.email || '';

        if (isDatabaseConfigured()) {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: payload.id },
                    select: { phone: true, whatsapp: true, email: true },
                });
                if (user) {
                    contactTarget = user.phone || user.whatsapp || user.email || contactTarget;
                }
            } catch (dbErr) {
                console.error('Database lookup error in OTP send, using session payload:', dbErr);
            }
        }

        const { code, expiresAt } = generatePasswordOtp(payload.id, contactTarget);
        const masked = maskContact(contactTarget);

        console.log(`[AUTH OTP] Password Change OTP for user ${payload.id} (${contactTarget}): ${code}`);

        return NextResponse.json({
            success: true,
            message: `A 6-digit verification code has been dispatched to ${masked}.`,
            target: masked,
            expiresAt,
            // Provide code in response for local / dev testing ease
            devCode: code,
        });
    } catch (error) {
        console.error('Error sending password change OTP:', error);
        return NextResponse.json({ success: false, message: 'Failed to generate verification code. Please try again.' }, { status: 500 });
    }
}
