import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 S3-Compatible Storage Client
// 10 GB Free Storage Forever with $0 Egress/Bandwidth Fees

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ukbrandlover-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // e.g. https://pub-xxx.r2.dev or https://media.ukbrandlover.com

export const isR2Configured = () => {
    return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
};

let s3ClientInstance = null;

export const getR2Client = () => {
    if (!isR2Configured()) {
        return null;
    }

    if (!s3ClientInstance) {
        s3ClientInstance = new S3Client({
            region: "auto",
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });
    }

    return s3ClientInstance;
};

/**
 * Uploads a file buffer directly to Cloudflare R2
 * @param {Object} params
 * @param {Buffer} params.buffer File bytes
 * @param {string} params.filename Target file name (e.g. products/cerave-hydrating-cleanser.webp)
 * @param {string} params.contentType MIME type
 * @returns {Promise<string>} Public accessible URL
 */
export async function uploadToR2({ buffer, filename, contentType = 'image/webp' }) {
    if (!isR2Configured()) {
        console.warn("⚠️ Cloudflare R2 credentials not configured. Using base64 data preview.");
        const base64 = buffer.toString('base64');
        return `data:${contentType};base64,${base64}`;
    }

    const s3 = getR2Client();
    const cleanFileName = filename.replace(/[^a-zA-Z0-9.\-_/]/g, '_');
    const key = `products/${Date.now()}-${cleanFileName}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable', // 1-year browser cache for ultra-fast CDN speed
    });

    await s3.send(command);

    if (R2_PUBLIC_URL) {
        return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    }

    // Default R2 dev public URL pattern if custom domain is not set
    return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

