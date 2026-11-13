import { NextResponse } from 'next/server';
import { getHeroBanners, getHeroBannerSettings } from '@/lib/banners';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const [banners, settings] = await Promise.all([
            getHeroBanners(true), // onlyActive = true for public storefront
            getHeroBannerSettings()
        ]);

        return NextResponse.json({
            success: true,
            banners: banners && banners.length > 0 ? banners : [],
            settings,
            autoplay: settings?.autoplay !== false
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch hero banners', error: error.message },
            { status: 500 }
        );
    }
}

