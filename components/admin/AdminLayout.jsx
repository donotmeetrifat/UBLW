'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, LockIcon } from "@/components/icons"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

// Sections strictly reserved for ADMIN (blocked for EMPLOYEE)
const ADMIN_ONLY_ROUTES = ['/admin/ai-bot', '/admin/settings', '/admin/team']

export default function AdminLayout({ children }) {
    const pathname = usePathname()

    const [userRole, setUserRole] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    const user = JSON.parse(saved)
                    if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') return user.role
                }
            } catch (e) {}
        }
        return null
    })

    const [currentUser, setCurrentUser] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) return JSON.parse(saved)
            } catch (e) {}
        }
        return null
    })

    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    const user = JSON.parse(saved)
                    if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') return false
                }
            } catch (e) {}
        }
        return true
    })

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const fetchUserRole = async () => {
        try {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('ukbl_current_user')
                if (saved) {
                    try {
                        const user = JSON.parse(saved)
                        if (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') {
                            setUserRole(user.role)
                            setCurrentUser(user)
                            setLoading(false)
                            return
                        }
                    } catch (e) {}
                }
            }

            const res = await fetch('/api/auth/me')
            const data = await res.json()
            if (data.success && (data.user?.role === 'ADMIN' || data.user?.role === 'EMPLOYEE')) {
                setUserRole(data.user.role)
                setCurrentUser(data.user)
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    } catch {}
                }
            } else {
                setUserRole(null)
                setCurrentUser(null)
            }
        } catch (error) {
            setUserRole(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserRole()
    }, [])

    if (loading) return <Loading />

    const isAuthorized = userRole === 'ADMIN' || userRole === 'EMPLOYEE'

    // Non-staff block
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#FAF6FA]/60 flex flex-col items-center justify-center text-center px-6">
                <div className="size-16 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mb-4 shadow-sm">
                    <LockIcon size={26} color="#6C306E" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224]">Staff Access Required</h1>
                <p className="text-xs text-slate-500 mt-2 max-w-md">
                    This portal is strictly reserved for UK Brand Lover administrators and employees to manage products, view authentic metrics, and analyze customer transactions.
                </p>
                <Link
                    href="/"
                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                    <span>Return to Storefront</span>
                    <ArrowRightIcon size={14} />
                </Link>
            </div>
        )
    }

    // Role-based route restriction for EMPLOYEE on admin-only routes
    const isRestrictedForEmployee = userRole === 'EMPLOYEE' && ADMIN_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))

    return (
        <div className="min-h-screen flex bg-[#FAF6FA]/30">
            {/* Mobile Backdrop */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* Sidebar with Role Awareness */}
            <AdminSidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                userRole={userRole}
                currentUser={currentUser}
            />

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {isRestrictedForEmployee ? (
                        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-xs">
                                <LockIcon size={24} color="currentColor" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-[#241224]">
                                Administrator Privileges Required
                            </h2>
                            <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
                                This section is restricted to Store Administrators. As an Employee, you have full access to Customer Orders, Products & Stock, Customer Inquiries, and Views & Analytics.
                            </p>
                            <div className="flex items-center gap-3 mt-6">
                                <Link
                                    href="/admin/orders"
                                    className="bg-[#6C306E] hover:bg-[#531e55] text-white flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                                >
                                    <span>Go to Customer Orders</span>
                                    <ArrowRightIcon size={14} />
                                </Link>
                                <Link
                                    href="/admin"
                                    className="border border-[#EFE0EF] hover:bg-white text-slate-700 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    )
}

