import CustomToaster from "@/components/CustomToaster";
import StoreProvider from "@/app/StoreProvider";
import DataSyncProvider from "@/components/DataSyncProvider";
import OfflineNotice from "@/components/OfflineNotice";
import "./globals.css";

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
            <body className="antialiased text-[#241224] bg-white">
                <StoreProvider>
                    <DataSyncProvider>
                        <CustomToaster />
                        <OfflineNotice />
                        {children}
                    </DataSyncProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
