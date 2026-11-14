'use client'

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="pb-16 md:pb-0 min-h-[calc(100vh-80px)]">{children}</main>
            <Footer />
            <MobileBottomNav />
        </>
    );
}
