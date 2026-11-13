import { NextResponse } from 'next/server';
import { getHeroBanners, saveHeroBanners } from '@/lib/banners';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const banners = await getHeroBanners(false); // return all (active + inactive) for admin
        return NextResponse.json({
            success: true,
            banners
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch admin banners', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, subtitle, image, imageAlt, link, isActive, displayOrder } = body;

        if (!image || typeof image !== 'string' || !image.trim()) {
            return NextResponse.json({ success: false, message: 'Banner image is required' }, { status: 400 });
        }

        const currentBanners = await getHeroBanners(false);
        const newId = `hero-banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const targetOrder = Math.max(1, Number(displayOrder) || (currentBanners.length + 1));

        const newBanner = {
            id: newId,
            title: title?.trim() || '',
            subtitle: subtitle?.trim() || '',
            image: image.trim(),
            imageAlt: imageAlt?.trim() || title?.trim() || 'UK Brand Lover banner promotion',
            link: link?.trim() || '',
            isActive: isActive !== false,
            displayOrder: targetOrder
        };

        // Insert at target position and shift subsequent items down (e.g. position 1 becomes 1st, shifting previous 1st to 2nd)
        const updatedList = [...currentBanners];
        const insertIndex = Math.min(targetOrder - 1, updatedList.length);
        updatedList.splice(insertIndex, 0, newBanner);

        // Reassign clean sequential order
        const reordered = updatedList.map((item, idx) => ({
            ...item,
            displayOrder: idx + 1
        }));

        const saved = await saveHeroBanners(reordered);

        return NextResponse.json({
            success: true,
            message: 'New hero banner published successfully!',
            banner: newBanner,
            banners: saved
        });
    } catch (error) {
        console.error('Error adding hero banner:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to add hero banner' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();

        // 1. Bulk reorder/save array of banners
        if (Array.isArray(body.banners)) {
            const saved = await saveHeroBanners(body.banners);
            return NextResponse.json({
                success: true,
                message: 'Hero banners order updated successfully!',
                banners: saved
            });
        }

        // 2. Single banner update
        const { id, title, subtitle, image, imageAlt, link, isActive, displayOrder } = body;
        if (!id) {
            return NextResponse.json({ success: false, message: 'Banner ID required for update' }, { status: 400 });
        }

        const currentBanners = await getHeroBanners(false);
        const existingIndex = currentBanners.findIndex(b => b.id === id);

        if (existingIndex === -1) {
            return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
        }

        const existing = currentBanners[existingIndex];
        const updatedBanner = {
            ...existing,
            title: title !== undefined ? String(title).trim() : existing.title,
            subtitle: subtitle !== undefined ? String(subtitle).trim() : existing.subtitle,
            image: image !== undefined ? String(image).trim() : existing.image,
            imageAlt: imageAlt !== undefined ? String(imageAlt).trim() : existing.imageAlt,
            link: link !== undefined ? String(link).trim() : existing.link,
            isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        };

        const targetOrder = displayOrder !== undefined ? Math.max(1, Number(displayOrder)) : existing.displayOrder;

        // Reorder if displayOrder changed
        const listWithout = currentBanners.filter(b => b.id !== id);
        const targetIndex = Math.min(targetOrder - 1, listWithout.length);
        listWithout.splice(targetIndex, 0, updatedBanner);

        const reordered = listWithout.map((item, idx) => ({
            ...item,
            displayOrder: idx + 1
        }));

        const saved = await saveHeroBanners(reordered);

        return NextResponse.json({
            success: true,
            message: 'Banner updated successfully!',
            banner: updatedBanner,
            banners: saved
        });
    } catch (error) {
        console.error('Error updating hero banner:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update banner' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        let id = searchParams.get('id');

        if (!id) {
            const body = await request.json().catch(() => ({}));
            id = body.id;
        }

        if (!id) {
            return NextResponse.json({ success: false, message: 'Banner ID required to delete' }, { status: 400 });
        }

        const currentBanners = await getHeroBanners(false);
        const filtered = currentBanners.filter(b => b.id !== id);

        if (filtered.length === currentBanners.length) {
            return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 });
        }

        const reordered = filtered.map((item, idx) => ({
            ...item,
            displayOrder: idx + 1
        }));

        const saved = await saveHeroBanners(reordered);

        return NextResponse.json({
            success: true,
            message: 'Banner deleted successfully!',
            banners: saved
        });
    } catch (error) {
        console.error('Error deleting hero banner:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete banner' },
            { status: 500 }
        );
    }
}
