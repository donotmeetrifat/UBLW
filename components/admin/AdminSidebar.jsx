'use client'

import { usePathname } from "next/navigation"
import { CouponTicketIcon, DashboardIcon, ShieldCheckIcon, StoreFrontIcon } from "@/components/icons"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"

const AdminSidebar = () => {
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
        { name: 'Live Stores', href: '/admin/stores', icon: StoreFrontIcon },
        { name: 'Approve Stores', href: '/admin/approve', icon: ShieldCheckIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: CouponTicketIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-[#EFE0EF] sm:min-w-60 bg-[#FAF6FA]/40">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-16 h-16 object-contain rounded-2xl bg-white p-2 border border-[#EFE0EF] shadow-2xs" src={assets.webLogo} alt="UK Brand Lover Admin" width={80} height={80} />
                <p className="text-[#241224] font-bold text-xs uppercase tracking-wider">UK Brand Lover Admin</p>
            </div>

            <div className="max-sm:mt-6 space-y-1 px-3">
                {sidebarLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link 
                            key={index} 
                            href={link.href} 
                            className={`relative flex items-center gap-3 p-3 rounded-2xl font-bold text-xs transition-all ${
                                isActive 
                                    ? 'bg-[#6C306E] text-white shadow-2xs' 
                                    : 'text-[#503E50] hover:bg-[#FAF6FA] hover:text-[#6C306E]'
                            }`}
                        >
                            <link.icon size={18} color={isActive ? '#FFFFFF' : '#6C306E'} className="sm:ml-2" />
                            <p className="max-sm:hidden">{link.name}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}

export default AdminSidebar
