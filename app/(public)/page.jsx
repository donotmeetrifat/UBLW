import dynamic from 'next/dynamic'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import LatestProducts from "@/components/LatestProducts";
import { getSiteUrl, SITE_METADATA } from "@/lib/siteConfig";

const OurSpecs = dynamic(() => import("@/components/OurSpec"));
const Newsletter = dynamic(() => import("@/components/Newsletter"));

const siteUrl = getSiteUrl();

export const metadata = {
    title: "100% Authentic UK Skincare & Cosmetics in Bangladesh",
    description: "Bangladesh's premier destination for 100% original UK cosmetics, skincare, and haircare. Direct air-shipments from London with verified physical store receipts and batch codes.",
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: "UK Brand LOVER | Real UK Beauty. Delivered in Bangladesh.",
        description: "Buy original CeraVe, The Ordinary, E45, NIVEA, Simple, and UK beauty brands in Bangladesh with genuine store receipts and 24-48h Dhaka delivery.",
        url: siteUrl,
        type: "website",
    },
};

export default function Home() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Are all cosmetics and skincare products at UK Brand Lover 100% authentic?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, 100% guaranteed. Every item in our catalog is imported directly from Boots UK, Superdrug, and official brand retailers in London. Customers receive verifiable physical retail store purchase receipts and authentic manufacturer batch codes."
                }
            },
            {
                "@type": "Question",
                "name": "How fast is delivery in Dhaka and across Bangladesh?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We deliver within 24 to 48 hours inside Dhaka City, and 48 to 72 hours nationwide across all districts in Bangladesh with Cash on Delivery (COD) available."
                }
            },
            {
                "@type": "Question",
                "name": "How can I verify the batch code of my imported skincare product?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Every bottle and box features a stamped UK manufacturer batch code. You can verify the batch code on global cosmetic databases such as checkfresh.com to verify production date, batch authenticity, and shelf life."
                }
            },
            {
                "@type": "Question",
                "name": "Can I get personalized skincare advice for my skin type?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! You can speak directly with Emma, our intelligent AI Beauty Advisor, for personalized product routines tailored specifically for Bangladeshi climate, skin sensitivity, acne, pigmentation, or barrier repair."
                }
            }
        ]
    };

    const storeJsonLd = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": SITE_METADATA.name,
        "url": siteUrl,
        "image": `${siteUrl}/images/web-logo.png`,
        "description": SITE_METADATA.shortDescription,
        "priceRange": "৳৳",
        "currenciesAccepted": "BDT",
        "paymentAccepted": "Cash on Delivery, bKash, Nagad, Visa, Mastercard",
        "areaServed": {
            "@type": "Country",
            "name": "Bangladesh"
        },
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BD",
            "addressLocality": "Dhaka"
        }
    };

    return (
        <div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
            />
            <Hero />
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
