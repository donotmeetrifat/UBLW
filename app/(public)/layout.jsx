'use client'

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingConcierge from "@/components/FloatingConcierge";

export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <FloatingConcierge />
        </>
    );
}
