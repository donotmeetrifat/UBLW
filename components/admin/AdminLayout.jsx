'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, LockIcon } from "@/components/icons"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

// Sections strictly reserved for Store Administrator (blocked for all Employees)
const ADMIN_ONLY_ROUTES = ['/admin/coupons', '/admin/ai-bot', '/admin/settings', '/admin/team']

// Granular route permissions mapping for operational employee modules
const ROUTE_PERMISSIONS = {
    '/admin/analytics': 'analytics',
    '/admin/products': 'products',
    '/admin/categories': 'categories',
    '/admin/homepage': 'homepage',
    '/admin/banners': 'banners',
    '/admin/promotions': 'promotions',
    '/admin/orders': 'orders',
    '/admin/customers': 'customers',
    '/admin/inquiries': 'inquiries',
}

const DEFAULT_EMPLOYEE_PERMISSIONS = [
    'analytics',
    'products',
    'categories',
    'homepage',
    'banners',
    'promotions',
    'orders',
    'customers',
    'inquiries',
]

export default function AdminLayout({ children }) {
    const pathname = usePathname()

    const [userRole, setUserRole] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    // Authoritative Server Session Verification: checks /api/auth/me directly
    const verifyServerSession = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('ukbl_auth_token') : null
            const headers = { 'Cache-Control': 'no-cache' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/auth/me', {
                cache: 'no-store',
                headers
            })
            const data = await res.json()
            if (data.success && (data.user?.role === 'ADMIN' || data.user?.role === 'EMPLOYEE')) {
                setUserRole(data.user.role)
                setCurrentUser(data.user)
                try {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    if (data.token) {
                        localStorage.setItem('ukbl_auth_token', data.token)
                    }
                } catch {}
            } else {
                setUserRole(null)
                setCurrentUser(null)
                try {
                    localStorage.removeItem('ukbl_current_user')
                    localStorage.removeItem('ukbl_auth_token')
                } catch {}
            }
        } catch {
            setUserRole(null)
            setCurrentUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        verifyServerSession()
    }, [pathname])

    if (loading) return <Loading />

    const isAuthorized = userRole === 'ADMIN' || userRole === 'EMPLOYEE'

    // Non-staff block
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#FAF6FA]/60 flex flex-col items-center justify-center text-center px-6 font-sans">
                <div className="size-16 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mb-4 shadow-sm">
                    <LockIcon size={26} color="#6C306E" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224]">Staff Access Required</h1>
                <p className="text-xs text-slate-500 mt-2 max-w-md">
                    This portal is strictly reserved for UK Brand Lover administrators and employees. Unauthenticated access is logged and blocked.
                </p>
                <Link
                    href="/login?redirect=/admin"
                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                    <span>Sign In to Staff Account</span>
                    <ArrowRightIcon size={14} />
                </Link>
            </div>
        )
    }

    // Role-based route restriction for EMPLOYEE on admin-only routes
    const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
    const isRestrictedAdminOnly = userRole === 'EMPLOYEE' && isAdminOnlyRoute

    // Granular permission check for EMPLOYEE
    let isMissingPermission = false
    let requiredPermName = ''
    if (userRole === 'EMPLOYEE' && !isRestrictedAdminOnly) {
        const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(
            route => pathname === route || pathname.startsWith(route + '/')
        )
        if (matchingRoute) {
            const requiredPerm = ROUTE_PERMISSIONS[matchingRoute]
            requiredPermName = requiredPerm
            const rawPerms = Array.isArray(currentUser?.permissions) && currentUser.permissions.length > 0
                ? currentUser.permissions
                : DEFAULT_EMPLOYEE_PERMISSIONS
            const userPerms = rawPerms.filter(p => DEFAULT_EMPLOYEE_PERMISSIONS.includes(p))
            if (!userPerms.includes(requiredPerm) && !userPerms.includes('*')) {
                isMissingPermission = true
            }
        }
    }

    return (
        <div className="min-h-screen flex bg-[#FAF6FA]/30 font-sans">
            {/* Mobile Backdrop */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* Sidebar with Role & Permission Awareness */}
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
                    {isRestrictedAdminOnly ? (
                        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-xs">
                                <LockIcon size={24} color="currentColor" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-[#241224]">
                                Administrator Privileges Required
                            </h2>
                            <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
                                This section is strictly restricted to Store Administrators.
                            </p>
                            <div className="flex items-center gap-3 mt-6">
                                <Link
                                    href="/admin"
                                    className="bg-[#6C306E] hover:bg-[#531e55] text-white flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                                >
                                    <span>Return to Dashboard</span>
                                    <ArrowRightIcon size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : isMissingPermission ? (
                        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                            <div className="size-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mb-4 shadow-xs">
                                <LockIcon size={24} color="currentColor" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-[#241224]">
                                Access Denied: Permission Required
                            </h2>
                            <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
                                You do not have permission to access the <span className="font-bold text-rose-600 uppercase tracking-wide">{requiredPermName}</span> module. Please contact your store administrator to request access.
                            </p>
                            <div className="flex items-center gap-3 mt-6">
                                <Link
                                    href="/admin"
                                    className="bg-[#6C306E] hover:bg-[#531e55] text-white flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                                >
                                    <span>Return to Dashboard</span>
                                    <ArrowRightIcon size={14} />
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
