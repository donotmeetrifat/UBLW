import { NextResponse } from 'next/server';
import { uploadMedia, isSupabaseStorageConfigured } from '@/lib/storage';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await uploadMedia({
            buffer,
            filename: file.name || 'product_image.webp',
            contentType: file.type || 'image/webp'
        });

        return NextResponse.json({
            success: true,
            url: result.url,
            provider: result.provider,
            message: result.provider === 'SUPABASE_STORAGE'
                ? 'Uploaded to Supabase Storage (100% Free, No Card Required)'
                : result.provider === 'CLOUDFLARE_R2'
                    ? 'Uploaded to Cloudflare R2'
                    : 'Processed in preview mode'
        });
    } catch (error) {
        console.error('Error in /api/upload:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
