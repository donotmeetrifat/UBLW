'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

export default function PublicLayout({ children }) {

    return (
        <>
            <Navbar />
            <Toast />
            {children}
            <Footer />
        </>
    );
}
