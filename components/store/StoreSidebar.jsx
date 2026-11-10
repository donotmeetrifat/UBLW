'use client'

import { usePathname } from "next/navigation"
import { AddSquareIcon, DashboardIcon, ProductListIcon, TruckIcon } from "@/components/icons"
import Image from "next/image"
import Link from "next/link"

const StoreSidebar = ({ storeInfo }) => {
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: DashboardIcon },
        { name: 'Add Product', href: '/store/add-product', icon: AddSquareIcon },
        { name: 'Manage Products', href: '/store/manage-product', icon: ProductListIcon },
        { name: 'Store Orders', href: '/store/orders', icon: TruckIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-[#EFE0EF] sm:min-w-60 bg-[#FAF6FA]/40">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-2xl border border-[#EFE0EF] object-cover shadow-2xs" src={storeInfo?.logo} alt="" width={80} height={80} />
                <p className="text-[#241224] font-bold text-xs uppercase tracking-wider">{storeInfo?.name}</p>
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

export default StoreSidebar
