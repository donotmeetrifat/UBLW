import { createClient } from '@supabase/supabase-js';
import { uploadToR2, isR2Configured } from './r2';

// 1. Zero-Card 100% Free Storage: Supabase Storage
// Requires NO Credit Card, NO Debit Card, NO Billing info.
// 1 GB Free Tier = Holds ~8,000 to 10,000 high-res WebP product images.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    process.env.SUPABASE_PUBLISHABLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'products';

export const isSupabaseStorageConfigured = () => {
    return Boolean(SUPABASE_URL && SUPABASE_KEY);
};

let supabaseClient = null;

export const getSupabaseClient = () => {
    if (!isSupabaseStorageConfigured()) return null;
    if (!supabaseClient) {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false }
        });
    }
    return supabaseClient;
};

/**
 * Universal Zero-Cost Product Media Uploader
 * 1. Checks Supabase Storage (100% Free, NO credit card needed)
 * 2. Checks Cloudflare R2 (If configured)
 * 3. Fallback to clean base64 data preview for testing
 */
export async function uploadMedia({ buffer, filename, contentType = 'image/jpeg' }) {
    // Priority 1: Supabase Storage (No Card Required)
    if (isSupabaseStorageConfigured()) {
        try {
            const supabase = getSupabaseClient();
            const cleanFileName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const path = `catalog/${Date.now()}-${cleanFileName}`;

            // Resolve exact MIME type matching uploaded file extension
            const ext = cleanFileName.split('.').pop()?.toLowerCase();
            let effectiveContentType = contentType;
            if (!effectiveContentType || effectiveContentType === 'application/octet-stream' || effectiveContentType === 'image/webp') {
                if (ext === 'png') effectiveContentType = 'image/png';
                else if (ext === 'jpg' || ext === 'jpeg') effectiveContentType = 'image/jpeg';
                else if (ext === 'webp') effectiveContentType = 'image/webp';
                else if (ext === 'avif') effectiveContentType = 'image/avif';
                else if (ext === 'svg') effectiveContentType = 'image/svg+xml';
                else if (ext === 'gif') effectiveContentType = 'image/gif';
            }

            const { data, error } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .upload(path, buffer, {
                    contentType: effectiveContentType,
                    upsert: true,
                    cacheControl: '31536000'
                });

            if (error) {
                console.error("Supabase storage upload error:", error);
                throw error;
            }

            const { data: publicData } = supabase.storage
                .from(SUPABASE_BUCKET)
                .getPublicUrl(path);

            return {
                url: publicData.publicUrl,
                provider: 'SUPABASE_STORAGE'
            };
        } catch (error) {
            console.error("Failed uploading to Supabase Storage, trying fallbacks:", error);
        }
    }

    // Priority 2: Cloudflare R2 (If card was added)
    if (isR2Configured()) {
        const url = await uploadToR2({ buffer, filename, contentType });
        return {
            url,
            provider: 'CLOUDFLARE_R2'
        };
    }

    // Priority 3: Local Public Disk Storage (Serves full high-quality image statically)
    try {
        const fs = await import('fs');
        const path = await import('path');
        const cleanFileName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
        const dir = path.join(process.cwd(), 'public', 'uploads', 'products');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, cleanFileName);
        fs.writeFileSync(filePath, buffer);
        return {
            url: `/uploads/products/${cleanFileName}`,
            provider: 'LOCAL_PUBLIC'
        };
    } catch (diskErr) {
        console.warn("Disk write fallback warning:", diskErr);
    }

    // Priority 4: Fallback data URI for local offline testing
    const base64 = buffer.toString('base64');
    return {
        url: `data:${contentType};base64,${base64}`,
        provider: 'LOCAL_PREVIEW'
    };
}

