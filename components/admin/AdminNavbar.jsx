'use client'

import Link from "next/link"
import { MenuIcon, ShieldCheckIcon, BagIcon, ArrowRightIcon } from "@/components/icons"

export default function AdminNavbar({ onToggleSidebar = () => {} }) {
    return (
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[#EFE0EF] bg-white flex items-center justify-between shrink-0 shadow-2xs">
            {/* Left section */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-[#241224] hover:bg-[#FAF6FA] border border-[#EFE0EF] transition"
                    aria-label="Toggle navigation menu"
                >
                    <MenuIcon size={18} />
                </button>

                {/* Portal Live Pill matching Titas Enterprise style */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF]">
                    <span className="relative flex size-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6C306E]">
                        Admin Command Portal
                    </span>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Storefront Link */}
                <Link
                    href="/"
                    target="_blank"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#6C306E] bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 px-3 py-1.5 rounded-full transition shadow-2xs"
                >
                    <BagIcon size={14} color="#6C306E" />
                    <span>Storefront</span>
                    <ArrowRightIcon size={12} />
                </Link>

                {/* Role Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6C306E] text-white text-[11px] font-extrabold tracking-wider shadow-2xs">
                    <span className="size-1.5 rounded-full bg-[#D8B56D]" />
                    <span>SUPER ADMIN</span>
                </span>
            </div>
        </header>
    )
}
