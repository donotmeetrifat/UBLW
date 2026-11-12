import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { createSessionToken, sanitizeUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, token } = body;

        const trimmedEmail = (email || '').trim().toLowerCase();
        const cleanToken = (token || '').trim();

        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        if (!cleanToken || cleanToken.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Please enter the 6-digit verification code sent to your email.' },
                { status: 400 }
            );
        }

        // Verify with Supabase Auth
        let supaError = null;
        let supaData = null;

        // Try type 'signup' first
        const signupRes = await supabase.auth.verifyOtp({
            email: trimmedEmail,
            token: cleanToken,
            type: 'signup'
        });

        if (!signupRes.error && signupRes.data?.user) {
            supaData = signupRes.data;
        } else {
            // Fallback: try type 'email'
            const emailRes = await supabase.auth.verifyOtp({
                email: trimmedEmail,
                token: cleanToken,
                type: 'email'
            });

            if (!emailRes.error && emailRes.data?.user) {
                supaData = emailRes.data;
            } else {
                supaError = signupRes.error || emailRes.error;
            }
        }

        if (supaError || !supaData) {
            console.warn('Supabase verifyOtp failed:', supaError?.message);
            return NextResponse.json(
                { success: false, message: supaError?.message || 'Invalid or expired verification code. Please verify and try again.' },
                { status: 400 }
            );
        }

        // Activate and mark user verified in PostgreSQL
        let safeUser = null;
        let sessionToken = null;

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { email: trimmedEmail }
            });

            if (!user) {
                // If user record wasn't staged, create it with verified status
                const meta = supaData.user?.user_metadata || {};
                const newUser = await prisma.user.create({
                    data: {
                        name: meta.name || trimmedEmail.split('@')[0],
                        email: trimmedEmail,
                        phone: meta.phone || null,
                        whatsapp: meta.phone || null,
                        isVerified: true,
                        emailVerified: new Date(),
                        role: 'CUSTOMER',
                        cart: {},
                        lastActiveAt: new Date()
                    }
                });
                safeUser = sanitizeUser(newUser);
            } else {
                const updatedUser = await prisma.user.update({
                    where: { email: trimmedEmail },
                    data: {
                        isVerified: true,
                        emailVerified: new Date(),
                        lastActiveAt: new Date()
                    }
                });
                safeUser = sanitizeUser(updatedUser);
            }

            sessionToken = createSessionToken(safeUser);
        } else {
            safeUser = {
                id: supaData.user.id,
                email: trimmedEmail,
                name: trimmedEmail.split('@')[0],
                role: 'CUSTOMER'
            };
            sessionToken = createSessionToken(safeUser);
        }

        const response = NextResponse.json({
            success: true,
            message: 'Email verified successfully! Welcome to UK Brand Lover.',
            user: safeUser,
            token: sessionToken
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });

        // Set secure auth cookie
        response.cookies.set('ukbl_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Verify OTP API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Verification failed. Please try again.' },
            { status: 500 }
        );
    }
}
