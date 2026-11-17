import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/siteConfig';

export default async function sitemap() {
    const siteUrl = getSiteUrl();
    const now = new Date();

    // 1. Core Static Storefront Pages
    const staticPages = [
        {
            url: `${siteUrl}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${siteUrl}/shop`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/beauty-advisor`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/reviews`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // 2. Dynamic Product Pages live from Database
    let productPages = [];
    try {
        if (isDatabaseConfigured()) {
            const products = await prisma.product.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: 'desc' },
            });

            productPages = products.map((product) => ({
                url: `${siteUrl}/product/${product.id}`,
                lastModified: product.updatedAt || now,
                changeFrequency: 'daily',
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error('[Sitemap] Database query fallback:', error);
    }

    return [...staticPages, ...productPages];
}
