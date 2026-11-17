import CustomToaster from "@/components/CustomToaster";
import StoreProvider from "@/app/StoreProvider";
import DataSyncProvider from "@/components/DataSyncProvider";
import { Plus_Jakarta_Sans, Poppins, Noto_Serif, Noto_Serif_Bengali } from "next/font/google";
import { getSiteUrl, SITE_METADATA } from "@/lib/siteConfig";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-plus-jakarta-sans",
    display: "swap",
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-poppins",
    display: "swap",
});

const notoSerif = Noto_Serif({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    style: ["normal", "italic"],
    variable: "--font-noto-serif",
    display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
    subsets: ["bengali"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-noto-serif-bengali",
    display: "swap",
});

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: "#6C306E",
    viewportFit: "cover",
};

const siteUrl = getSiteUrl();

export const metadata = {
    title: {
        default: "UK Brand LOVER | Authentic UK-Imported Skincare & Beauty — Bangladesh",
        template: "%s | UK Brand LOVER"
    },
    description: SITE_METADATA.shortDescription,
    keywords: [
        "UK imported skincare Bangladesh",
        "authentic UK beauty products",
        "CeraVe Bangladesh",
        "E45 cream Bangladesh",
        "NIVEA Bangladesh",
        "The Ordinary Bangladesh",
        "UK cosmetics shop Dhaka",
        "online beauty shop Bangladesh",
        "UK Brand LOVER",
        "original UK products Bangladesh",
        "original UK receipts cosmetics"
    ],
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: "UK Brand LOVER | Real UK Beauty. Delivered in Bangladesh.",
        description: SITE_METADATA.shortDescription,
        url: siteUrl,
        siteName: SITE_METADATA.name,
        locale: "en_BD",
        type: "website",
        images: [
            {
                url: `${siteUrl}/images/web-logo.png`,
                width: 1200,
                height: 630,
                alt: "UK Brand LOVER — Authentic UK Imported Beauty Bangladesh",
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "UK Brand LOVER | Real UK Beauty. Delivered in Bangladesh.",
        description: SITE_METADATA.shortDescription,
        images: [`${siteUrl}/images/web-logo.png`],
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.png", type: "image/png" },
        ],
        apple: "/apple-icon.png",
    },
    manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
    const currentSiteUrl = getSiteUrl();

    // Global Structured Data: Organization & WebSite with Sitelinks SearchBox
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${currentSiteUrl}/#organization`,
        "name": SITE_METADATA.name,
        "legalName": SITE_METADATA.legalName,
        "url": currentSiteUrl,
        "logo": `${currentSiteUrl}/images/web-logo.png`,
        "description": SITE_METADATA.fullDescription,
        "email": SITE_METADATA.email,
        "telephone": SITE_METADATA.phone,
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": SITE_METADATA.phone,
                "contactType": "customer service",
                "areaServed": "BD",
                "availableLanguage": ["English", "Bengali"]
            }
        ],
        "sameAs": [
            SITE_METADATA.social.facebook,
            SITE_METADATA.social.instagram,
            SITE_METADATA.social.whatsapp
        ]
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${currentSiteUrl}/#website`,
        "url": currentSiteUrl,
        "name": SITE_METADATA.name,
        "description": SITE_METADATA.shortDescription,
        "publisher": {
            "@id": `${currentSiteUrl}/#organization`
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${currentSiteUrl}/shop?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <html 
            lang="en" 
            className={`${plusJakartaSans.variable} ${poppins.variable} ${notoSerif.variable} ${notoSerifBengali.variable}`}
        >
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
            </head>
            <body className="antialiased text-[#241224] bg-white">
                <StoreProvider>
                    <DataSyncProvider>
                        <CustomToaster />
                        {children}
                    </DataSyncProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
