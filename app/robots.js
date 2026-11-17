import { getSiteUrl } from '@/lib/siteConfig';

export default function robots() {
    const siteUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/admin',
                    '/api/admin/',
                    '/api/auth/',
                    '/store/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/auth/'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/auth/'],
            },
            // AI Chatbot & Answer Engine Crawlers (ChatGPT, Perplexity, Claude, Gemini)
            {
                userAgent: 'OAI-SearchBot', // OpenAI ChatGPT Search citability crawler
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/auth/'],
            },
            {
                userAgent: 'PerplexityBot', // Perplexity AI search
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/auth/'],
            },
            {
                userAgent: 'Claude-SearchBot', // Anthropic Claude Search citability
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/auth/'],
            },
            {
                userAgent: 'Google-Extended', // Google Gemini grounding & Search AI Overviews
                allow: '/',
                disallow: ['/admin/', '/api/admin/', '/api/auth/'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
