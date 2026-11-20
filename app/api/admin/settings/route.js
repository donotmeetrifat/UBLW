import { NextResponse } from 'next/server';
import { getStoreSettings, saveStoreSettings } from '@/lib/settings';
import { requireStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const auth = await requireStaff(request);
        if (!auth.authorized) return auth.response;
        if (auth.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Forbidden: Admin privileges required to view store delivery & payment settings.' },
                { status: 403 }
            );
        }

        const settings = await getStoreSettings();
        return NextResponse.json({
            success: true,
            delivery: settings.delivery,
            payments: settings.payments,
            whatsapp: settings.whatsapp,
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
        const auth = await requireStaff(request);
        if (!auth.authorized) return auth.response;
        if (auth.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Only Administrators can modify store payment & delivery settings.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { delivery, payments, whatsapp } = body;

        const updatedSettings = await saveStoreSettings({ delivery, payments, whatsapp });

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

