import { getSiteUrl } from './siteConfig';

/**
 * Ping search engines (Google, Bing) when a new product is added or updated.
 * Runs non-blocking in the background so it never delays admin responses.
 */
export function pingSearchEngines() {
    try {
        const siteUrl = getSiteUrl();
        if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
            return;
        }

        const sitemapUrl = `${siteUrl}/sitemap.xml`;

        // 1. Google Sitemap Notification
        fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
            method: 'GET',
            headers: { 'User-Agent': 'UKBrandLover-Crawler-Ping/1.0' },
        }).catch(() => {});

        // 2. Bing Sitemap Notification
        fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
            method: 'GET',
            headers: { 'User-Agent': 'UKBrandLover-Crawler-Ping/1.0' },
        }).catch(() => {});
    } catch {
        // Silently continue if network fails
    }
}
