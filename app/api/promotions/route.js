import { NextResponse } from 'next/server';
import { getPromotions } from '@/lib/promotions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
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
            { success: false, message: 'Failed to fetch hero promotions', error: error.message },
            { status: 500 }
        );
    }
}
