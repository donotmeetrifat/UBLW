import { NextResponse } from 'next/server';
import { getStoreSettings, saveStoreSettings } from '@/lib/settings';
import { getUserFromRequest } from '@/lib/auth';

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
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch settings', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (currentUser && currentUser.role === 'EMPLOYEE') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Only Administrators can modify store payment & delivery settings.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { delivery, payments } = body;

        const updatedSettings = await saveStoreSettings({ delivery, payments });

        return NextResponse.json({
            success: true,
            message: 'Store settings updated successfully! All changes are live.',
            settings: updatedSettings,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Error saving store settings:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update settings', error: error.message },
            { status: 500 }
        );
    }
}

