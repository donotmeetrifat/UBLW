'use client'

import { usePathname } from "next/navigation"
import {
    DashboardIcon,
    TrendIcon,
    BagIcon,
    TagIcon,
    TruckIcon,
    UserIcon,
    MailIcon,
    CloseIcon
} from "@/components/icons"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"

const navSections = [
    {
        section: 'Overview',
        items: [
            { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
            { name: 'Views & Analytics', href: '/admin/analytics', icon: TrendIcon },
        ]
    },
    {
        section: 'Catalog',
        items: [
            { name: 'Products & Stock', href: '/admin/products', icon: BagIcon },
            { name: 'Category Catalog', href: '/admin/categories', icon: TagIcon },
        ]
    },
    {
        section: 'Orders & Sales',
        items: [
            { name: 'Customer Orders', href: '/admin/orders', icon: TagIcon },
        ]
    },
    {
        section: 'Customer Intelligence',
        items: [
            { name: 'Customers & Purchases', href: '/admin/customers', icon: UserIcon },
            { name: 'Customer Inquiries', href: '/admin/inquiries', icon: MailIcon },
        ]
    },
    {
        section: 'Store Settings',
        items: [
            { name: 'Delivery & Payments', href: '/admin/settings', icon: TruckIcon },
        ]
    }
]

export default function AdminSidebar({ mobileOpen = false, onClose = () => {} }) {
    const pathname = usePathname()

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EFE0EF] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
            }`}
        >
            {/* Brand Header */}
            <div className="h-16 px-4 border-b border-[#EFE0EF] flex items-center justify-between shrink-0 bg-[#FAF6FA]/50">
                <Link href="/admin" className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shadow-xs">
                        <Image
                            src={assets.webLogo}
                            alt="UK Brand Lover Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <span className="font-extrabold text-sm text-[#241224] tracking-tight">
                        UK Brand Lover
                    </span>
                </Link>

                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label="Close sidebar"
                >
                    <CloseIcon size={18} />
                </button>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 no-scrollbar">
                {navSections.map((sec, secIdx) => (
                    <div key={secIdx}>
                        <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                            {sec.section}
                        </div>
                        <div className="space-y-1">
                            {sec.items.map((item, itemIdx) => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={itemIdx}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-[#FAF6FA] text-[#6C306E] font-bold border border-[#EFE0EF] shadow-2xs'
                                                : 'text-slate-600 hover:bg-[#FAF6FA]/80 hover:text-[#241224]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`size-7 rounded-lg flex items-center justify-center transition-colors ${
                                                    isActive
                                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                                        : 'bg-slate-100/80 text-slate-500 group-hover:bg-[#FAF6FA] group-hover:text-[#6C306E]'
                                                }`}
                                            >
                                                <Icon size={14} color="currentColor" />
                                            </div>
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar Footer with Admin Profile */}
            <div className="p-3 border-t border-[#EFE0EF] bg-[#FAF6FA]/40 shrink-0">
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-[#EFE0EF]">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="size-8 rounded-full bg-[#6C306E] text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#D8B56D]/40">
                            A
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-[#241224] truncate">
                                Admin Flagship
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                                admin@ukbrandlover.com
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/"
                        target="_blank"
                        className="text-[10px] font-bold text-[#6C306E] hover:underline bg-[#FAF6FA] px-2 py-1 rounded-md border border-[#EFE0EF] shrink-0"
                        title="View Live Storefront"
                    >
                        Store ↗
                    </Link>
                </div>
            </div>
        </aside>
    )
}
