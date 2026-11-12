import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        const trimmedEmail = (email || '').trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ukbrandlover.vercel.app';
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: trimmedEmail,
            options: {
                emailRedirectTo: `${appUrl}/api/auth/callback`
            }
        });

        if (error) {
            console.error('Supabase resend error:', error);
            return NextResponse.json(
                { success: false, message: error.message || 'Unable to resend verification email. Please try again in a moment.' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `A new verification email has been sent from Supabase to ${trimmedEmail}.`
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to resend verification message.' },
            { status: 500 }
        );
    }
}
