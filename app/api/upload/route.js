import { NextResponse } from 'next/server';
import { uploadToR2, isR2Configured } from '@/lib/r2';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const url = await uploadToR2({
            buffer,
            filename: file.name || 'product_image.webp',
            contentType: file.type || 'image/webp'
        });

        return NextResponse.json({
            success: true,
            url,
            isR2Active: isR2Configured(),
            message: isR2Configured() 
                ? 'Uploaded to Cloudflare R2' 
                : 'Processed in preview mode (configure R2 credentials in production)'
        });
    } catch (error) {
        console.error('Error in /api/upload:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

