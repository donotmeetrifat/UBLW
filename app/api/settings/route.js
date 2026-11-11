import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const settings = await getStoreSettings();
        return NextResponse.json({
            success: true,
            delivery: settings.delivery,
            payments: settings.payments,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            }
        });
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to load settings', error: error.message },
            { status: 500 }
        );
    }
}
