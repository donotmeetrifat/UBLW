import CustomToaster from "@/components/CustomToaster";
import StoreProvider from "@/app/StoreProvider";
import DataSyncProvider from "@/components/DataSyncProvider";
import "./globals.css";

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: "#6C306E",
    viewportFit: "cover",
};

export const metadata = {
    title: {
        default: "UK Brand LOVER | Authentic UK-Imported Skincare & Beauty — Bangladesh",
        template: "%s | UK Brand LOVER"
    },
    description: "Shop authentic UK-imported skincare, haircare & cosmetics in Bangladesh. CeraVe, E45, NIVEA, Neutrogena & more — with original UK purchase receipts. Fast delivery nationwide.",
    keywords: [
        "UK imported skincare Bangladesh",
        "authentic UK beauty products",
        "CeraVe Bangladesh",
        "E45 cream Bangladesh",
        "NIVEA Bangladesh",
        "UK cosmetics shop",
        "online beauty shop Dhaka",
        "UK Brand LOVER",
        "original UK products Bangladesh"
    ],
    metadataBase: new URL("https://ukbrandlover.vercel.app"),
    openGraph: {
        title: "UK Brand LOVER | Real UK Beauty. Delivered in Bangladesh.",
        description: "Hand-picked skincare, haircare & cosmetics directly from UK stores. Every product includes the original UK purchase receipt. Shop CeraVe, E45, NIVEA & more.",
        url: "https://ukbrandlover.vercel.app",
        siteName: "UK Brand LOVER",
        locale: "en_BD",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "UK Brand LOVER | Real UK Beauty. Delivered in Bangladesh.",
        description: "Hand-picked skincare, haircare & cosmetics directly from UK stores. Every product includes the original UK purchase receipt. Shop CeraVe, E45, NIVEA & more.",
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
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Noto+Serif:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Noto+Serif+Bengali:wght@400;500;600;700;800&display=swap"
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
