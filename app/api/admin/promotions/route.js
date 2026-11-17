import { NextResponse } from 'next/server';
import { getPromotions, savePromotions } from '@/lib/promotions';
import { requireStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const auth = await requireStaff(request, 'promotions');
        if (!auth.authorized) return auth.response;

        const promotions = await getPromotions();
        return NextResponse.json({
            success: true,
            promotions
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch admin promotions', error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const auth = await requireStaff(request, 'promotions');
        if (!auth.authorized) return auth.response;

        const body = await request.json();
        const saved = await savePromotions(body);

        return NextResponse.json({
            success: true,
            message: 'Hero promotional boxes updated successfully!',
            promotions: saved
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Error saving hero promotions:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to save promotions' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    return PUT(request);
}
