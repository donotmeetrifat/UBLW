/**
 * UK Brand Lover — Central Dynamic Site & SEO Configuration
 * 
 * Supports zero-downtime domain migration. When a custom paid domain is added,
 * simply setting NEXT_PUBLIC_SITE_URL (e.g. https://www.ukbrandlover.com) will
 * instantly update all sitemaps, canonical tags, OpenGraph cards, and schema JSON-LD.
 */

export function getSiteUrl() {
    // 1. Explicit Custom Domain environment variable
    if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim().length > 0) {
        return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, '');
    }

    // 2. Existing app URL variable in .env
    if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim().length > 0) {
        return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, '');
    }

    // 3. Vercel deployment production URL
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().length > 0) {
        const url = process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/+$/, '');
        return url.startsWith('http') ? url : `https://${url}`;
    }

    if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim().length > 0) {
        const url = process.env.VERCEL_URL.trim().replace(/\/+$/, '');
        return url.startsWith('http') ? url : `https://${url}`;
    }

    // 4. Default production fallback
    return 'https://ukbrandlover.vercel.app';
}

export const SITE_METADATA = {
    name: 'UK Brand LOVER',
    legalName: 'UK Brand Lover Flagship Bangladesh',
    tagline: 'Real UK Beauty. Delivered in Bangladesh.',
    shortDescription: 'Shop 100% authentic UK-imported skincare, haircare & cosmetics in Bangladesh. Every order includes the original UK physical store purchase receipt. CeraVe, E45, NIVEA, The Ordinary & more.',
    fullDescription: 'UK Brand LOVER is Bangladesh’s premier verified retailer of authentic UK-imported skincare, cosmetics, and personal care. We import directly from verified UK physical stores (Boots UK, Superdrug) via direct London air cargo with original purchase receipts and verifiable batch codes.',
    phone: '+880 1959-524393',
    whatsapp: '+880 1959-524393',
    email: 'ukbrandlover.shop@gmail.com',
    currency: 'BDT',
    currencySymbol: '৳',
    locale: 'en_BD',
    country: 'Bangladesh',
    city: 'Dhaka',
    social: {
        facebook: 'https://www.facebook.com/ukbrandlover',
        instagram: 'https://www.instagram.com/ukbrandlover',
        whatsapp: 'https://wa.me/8801959524393'
    }
};
