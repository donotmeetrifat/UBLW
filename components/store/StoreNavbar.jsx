'use client'
import Link from "next/link"

const StoreNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-2xl font-bold tracking-tight text-[#241224] flex items-center gap-1">
                <span>UK Brand Lover</span>
                <span className="text-[#D8B56D] text-3xl leading-none">.</span>
                <span className="ml-2 text-[10px] tracking-widest font-bold text-white bg-[#6C306E] px-2.5 py-0.5 rounded-full uppercase">
                    Store
                </span>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, Seller</p>
            </div>
        </div>
    )
}

export default StoreNavbar