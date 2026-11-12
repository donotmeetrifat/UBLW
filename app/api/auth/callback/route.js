import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { createSessionToken, sanitizeUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') || 'signup';
    const next = searchParams.get('next') || '/';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'https://ukbrandlover.vercel.app';

    try {
        let verifiedEmail = null;

        if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.user?.email) {
                verifiedEmail = data.user.email.toLowerCase();
            }
        } else if (tokenHash) {
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: type === 'email' ? 'email' : 'signup'
            });
            if (!error && data?.user?.email) {
                verifiedEmail = data.user.email.toLowerCase();
            }
        }

        if (verifiedEmail && isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { email: verifiedEmail }
            });

            let activeUser = null;
            if (user) {
                activeUser = await prisma.user.update({
                    where: { email: verifiedEmail },
                    data: {
                        isVerified: true,
                        emailVerified: new Date(),
                        lastActiveAt: new Date()
                    }
                });
            } else {
                activeUser = await prisma.user.create({
                    data: {
                        name: verifiedEmail.split('@')[0],
                        email: verifiedEmail,
                        isVerified: true,
                        emailVerified: new Date(),
                        role: 'CUSTOMER',
                        cart: {},
                        lastActiveAt: new Date()
                    }
                });
            }

            const safeUser = sanitizeUser(activeUser);
            const token = createSessionToken(safeUser);

            const redirectResponse = NextResponse.redirect(new URL(next, baseUrl));
            redirectResponse.cookies.set('ukbl_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
                path: '/',
            });
            return redirectResponse;
        }

        // Redirect to login if token was missing or failed
        return NextResponse.redirect(new URL('/login?verified=1', baseUrl));
    } catch (err) {
        console.error('Auth callback verification error:', err);
        return NextResponse.redirect(new URL('/login?error=verification_failed', baseUrl));
    }
}
