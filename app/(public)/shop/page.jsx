import { Suspense } from "react";
import Loading from "@/components/Loading";
import ShopClient from "@/components/ShopClient";
import { getSiteUrl } from "@/lib/siteConfig";

const siteUrl = getSiteUrl();

export const metadata = {
    title: "100% Authentic UK Skincare & Cosmetics Catalog",
    description: "Browse original UK cosmetics, serums, moisturizers, sunscreens, and haircare imported straight from Boots & Superdrug London with physical store receipts. Delivered nationwide in Bangladesh.",
    alternates: {
        canonical: `${siteUrl}/shop`,
    },
    openGraph: {
        title: "Authentic UK Skincare & Cosmetics Catalog | UK Brand LOVER",
        description: "Curated genuine UK beauty and personal care essentials. London direct import with verified batch codes and cash on delivery in Bangladesh.",
        url: `${siteUrl}/shop`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Authentic UK Skincare & Cosmetics Catalog | UK Brand LOVER",
        description: "Curated genuine UK beauty essentials. London direct import with verified batch codes.",
    }
};

export default function ShopPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "100% Authentic UK Skincare & Cosmetics Collection",
        "description": "Original UK skincare, hair care, and cosmetics imported directly from verified London retail stores with physical store receipts.",
        "url": `${siteUrl}/shop`,
        "isPartOf": {
            "@type": "WebSite",
            "name": "UK Brand Lover",
            "url": siteUrl,
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": siteUrl
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Shop Catalog",
                    "item": `${siteUrl}/shop`
                }
            ]
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<Loading message="Curating authentic UK beauty catalog..." />}>
                <ShopClient />
            </Suspense>
        </>
    );
}
