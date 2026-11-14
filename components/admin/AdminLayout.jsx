'use client'

import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, LockIcon } from "@/components/icons"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

export default function AdminLayout({ children }) {
    const [isAdmin, setIsAdmin] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    const user = JSON.parse(saved)
                    return user?.role === 'ADMIN'
                }
            } catch (e) {}
        }
        return false
    })
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    const user = JSON.parse(saved)
                    if (user?.role === 'ADMIN') return false
                }
            } catch (e) {}
        }
        return true
    })
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const fetchIsAdmin = async () => {
        try {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    try {
                        const user = JSON.parse(saved)
                        if (user?.role === 'ADMIN') {
                            setIsAdmin(true)
                            setLoading(false)
                            return
                        }
                    } catch (e) {}
                }
            }

            const res = await fetch('/api/auth/me')
            const data = await res.json()
            if (data.success && data.user?.role === 'ADMIN') {
                setIsAdmin(true)
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    } catch {}
                }
            } else {
                setIsAdmin(false)
            }
        } catch (error) {
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIsAdmin()
    }, [])

    if (loading) return <Loading />

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#FAF6FA]/60 flex flex-col items-center justify-center text-center px-6">
                <div className="size-16 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mb-4 shadow-sm">
                    <LockIcon size={26} color="#6C306E" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224]">Admin Access Required</h1>
                <p className="text-xs text-slate-500 mt-2 max-w-md">
                    This portal is strictly reserved for UK Brand Lover administrators to manage products, view authentic metrics, and analyze customer transactions.
                </p>
                <Link
                    href="/"
                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs"
                >
                    <span>Return to Storefront</span>
                    <ArrowRightIcon size={14} />
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-[#FAF6FA]/30">
            {/* Mobile Backdrop */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
