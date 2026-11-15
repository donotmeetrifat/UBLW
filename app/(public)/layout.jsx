'use client'

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import AiChatWidget from "@/components/AiChatWidget";

export default function PublicLayout({ children }) {
    const pathname = usePathname();
    const isBeautyAdvisor = pathname === '/beauty-advisor';

    if (isBeautyAdvisor) {
        return (
            <div className="h-screen w-full flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 min-h-0 w-full overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pb-16 md:pb-0 min-h-[calc(100vh-80px)]">{children}</main>
            <Footer />
            <MobileBottomNav />
            <AiChatWidget />
        </>
    );
}
