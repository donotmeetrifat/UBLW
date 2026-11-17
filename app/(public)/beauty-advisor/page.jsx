import BeautyAdvisorClient from "@/components/BeautyAdvisorClient";
import { getSiteUrl } from "@/lib/siteConfig";

const siteUrl = getSiteUrl();

export const metadata = {
    title: "Emma AI Beauty Advisor | Free Personalized UK Skincare Routine Consultation",
    description: "Consult with Emma, our intelligent UK beauty advisor. Get instant customized skincare and haircare routines for acne, pigmentation, dry skin, and Bangladeshi weather with 100% genuine UK products.",
    alternates: {
        canonical: `${siteUrl}/beauty-advisor`,
    },
    openGraph: {
        title: "Emma AI Beauty Advisor | UK Brand LOVER",
        description: "Get personalized UK skincare and haircare advice tailored for your skin type with verified authentic UK imports.",
        url: `${siteUrl}/beauty-advisor`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Emma AI Beauty Advisor | UK Brand LOVER",
        description: "Personalized UK skincare consultation powered by AI.",
    }
};

export default function BeautyAdvisorPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Emma AI Beauty Advisor",
        "url": `${siteUrl}/beauty-advisor`,
        "applicationCategory": "HealthApplication",
        "operatingSystem": "All modern web browsers",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BDT"
        },
        "provider": {
            "@type": "Organization",
            "name": "UK Brand Lover",
            "url": siteUrl
        },
        "description": "Free AI skincare consultation providing customized product routines and ingredient analysis from 100% authentic UK cosmetics imported to Bangladesh.",
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
                    "name": "Emma AI Beauty Advisor",
                    "item": `${siteUrl}/beauty-advisor`
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
            <BeautyAdvisorClient />
        </>
    );
}
