import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import DataSyncProvider from "@/components/DataSyncProvider";
import "./globals.css";

export const metadata = {
    title: {
        default: "UK Brand Lover | 100% Authentic UK Imported Beauty in Bangladesh",
        template: "%s | UK Brand Lover"
    },
    description: "Shop 100% authentic UK imported beauty, skincare, haircare, and luxury cosmetics at UK Brand Lover in Bangladesh. Direct London Heathrow shipments, bKash & Cash on Delivery, and live 5-stage courier tracking.",
    keywords: [
        "UK Brand Lover",
        "UK cosmetics Bangladesh",
        "Authentic skincare Dhaka",
        "CeraVe UK Bangladesh",
        "The Ordinary Dhaka",
        "Charlotte Tilbury Bangladesh",
        "London Heathrow beauty",
        "100% original UK imported products",
        "UK beauty store Dhaka"
    ],
    metadataBase: new URL("https://ukbrandlover.vercel.app"),
    openGraph: {
        title: "UK Brand Lover | 100% Authentic UK Imported Beauty in Bangladesh",
        description: "Direct London shipments of CeraVe, The Ordinary, Pixi, Olaplex & luxury UK imported perfumes in Bangladesh.",
        url: "https://ukbrandlover.vercel.app",
        siteName: "UK Brand Lover",
        locale: "en_BD",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "UK Brand Lover | 100% Authentic UK Imported Beauty",
        description: "100% Authentic UK imported beauty, skincare & haircare in Bangladesh. Cash on Delivery & bKash.",
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.png", type: "image/png" },
        ],
        apple: "/apple-icon.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased text-[#241224] bg-white">
                <StoreProvider>
                    <DataSyncProvider>
                        <Toaster />
                        {children}
                    </DataSyncProvider>
                </StoreProvider>
            </body>
        </html>
    );
}
