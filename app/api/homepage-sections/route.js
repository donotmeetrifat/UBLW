import { NextResponse } from 'next/server';
import { getHomepageSections } from '@/lib/homepageSections';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const sections = await getHomepageSections();
        return NextResponse.json({
            success: true,
            sections
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch homepage sections', error: error.message },
            { status: 500 }
        );
    }
}

