import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
    subsets: ["latin"], 
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

export const metadata = {
    title: "UK Brand Lover - Premium Imported UK Beauty, Skincare, Haircare & Baby Care",
    description: "Shop 100% authentic UK imported beauty, skincare, haircare, cosmetics, and body care products at UK Brand Lover in Bangladesh. Guaranteed original quality, best deals, and fast delivery.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${plusJakartaSans.className} antialiased text-[#241224] bg-white`}>
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
