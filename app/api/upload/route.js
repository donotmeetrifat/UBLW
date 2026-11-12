import { NextResponse } from 'next/server';
import { uploadMedia } from '@/lib/storage';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const filesList = formData.getAll('files');
        const fileListAlt = formData.getAll('file');
        const rawFiles = filesList.length > 0 ? filesList : (fileListAlt.length > 0 ? fileListAlt : [formData.get('file')].filter(Boolean));

        if (!rawFiles || rawFiles.length === 0) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        const urls = [];
        for (const file of rawFiles) {
            if (typeof file === 'object' && typeof file.arrayBuffer === 'function') {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const result = await uploadMedia({
                    buffer,
                    filename: file.name || 'product_image.jpg',
                    contentType: file.type || 'image/jpeg'
                });
                if (result?.url) {
                    urls.push(result.url);
                }
            }
        }

        if (urls.length === 0) {
            return NextResponse.json({ success: false, message: 'Failed to process image files' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            urls,
            url: urls[0],
            count: urls.length,
            message: 'Images uploaded in full high resolution!'
        });
    } catch (error) {
        console.error('Error in /api/upload:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
