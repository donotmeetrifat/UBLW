import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { hashPassword, sanitizeUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, password, confirmPassword } = body;

        // 1. Input Validation
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
        if (cleanPhone.startsWith('880') && cleanPhone.length === 13) {
            cleanPhone = '0' + cleanPhone.slice(3);
        }
        if (!cleanPhone || cleanPhone.length < 11) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid 11-digit phone number (e.g. 01XXXXXXXXX) for parcel tracking.' },
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
            // Check if account already exists AND is verified
            const existingUser = await prisma.user.findUnique({
                where: { email: trimmedEmail },
            });

            if (existingUser && (existingUser.isVerified || existingUser.emailVerified)) {
                return NextResponse.json(
                    { success: false, message: 'An account with this email address already exists. Please sign in instead.' },
                    { status: 409 }
                );
            }

            // 3. Trigger Supabase Email Verification
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ukbrandlover.vercel.app';
            const { data: supaData, error: supaError } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: password,
                options: {
                    data: {
                        name: trimmedName,
                        phone: cleanPhone,
                    },
                    emailRedirectTo: `${appUrl}/api/auth/callback`
                }
            });

            if (supaError) {
                console.error('Supabase signup error:', supaError);
                return NextResponse.json(
                    { success: false, message: supaError.message || 'Unable to send verification email. Please verify your email address.' },
                    { status: 400 }
                );
            }

            // 4. Stage user in PostgreSQL with isVerified = false (Strictly unverified until code or email link confirmed)
            const passwordHash = hashPassword(password);
            if (existingUser) {
                await prisma.user.update({
                    where: { email: trimmedEmail },
                    data: {
                        name: trimmedName,
                        phone: cleanPhone,
                        whatsapp: cleanPhone,
                        passwordHash,
                        isVerified: false,
                        emailVerified: null,
                        lastActiveAt: new Date()
                    }
                });
            } else {
                await prisma.user.create({
                    data: {
                        name: trimmedName,
                        email: trimmedEmail,
                        phone: cleanPhone,
                        whatsapp: cleanPhone,
                        passwordHash,
                        role: 'CUSTOMER',
                        isVerified: false,
                        emailVerified: null,
                        cart: {},
                        lastActiveAt: new Date(),
                    }
                });
            }

            // DO NOT issue session cookie or login token. User must verify email first!
            return NextResponse.json({
                success: true,
                requireVerification: true,
                email: trimmedEmail,
                message: `Verification message sent from Supabase to ${trimmedEmail}! Please check your email inbox to verify your account.`
            }, {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            });
        }

        // Fallback for offline/local environment without database
        return NextResponse.json({
            success: true,
            requireVerification: true,
            email: trimmedEmail,
            message: `Verification code sent to ${trimmedEmail}.`
        });
    } catch (error) {
        console.error('Sign-up API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'An unexpected error occurred during registration. Please try again.' },
            { status: 500 }
        );
    }
}
