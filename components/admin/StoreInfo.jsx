'use client'

import Image from "next/image"
import { MapPinIcon, MailIcon, PhoneIcon } from "@/components/icons"

const StoreInfo = ({ store }) => {
    return (
        <div className="flex-1 space-y-2 text-sm">
            <Image width={100} height={100} src={store.logo} alt={store.name} className="max-w-20 max-h-20 object-contain shadow rounded-2xl max-sm:mx-auto border border-[#EFE0EF]" />
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <h3 className="text-xl font-bold text-[#241224]"> {store.name} </h3>
                <span className="text-xs text-slate-400">@{store.username}</span>

                {/* Status Badge */}
                <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${store.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : store.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                        }`}
                >
                    {store.status}
                </span>
            </div>

            <p className="text-slate-600 my-4 max-w-2xl text-xs sm:text-sm leading-relaxed">{store.description}</p>
            <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2"> <MapPinIcon size={14} color="#6C306E" /> {store.address}</p>
                <p className="flex items-center gap-2"> <PhoneIcon size={14} color="#6C306E" /> {store.contact}</p>
                <p className="flex items-center gap-2"> <MailIcon size={14} color="#6C306E" />  {store.email}</p>
            </div>
            
            <p className="text-slate-500 mt-4 text-xs">Applied on <span className="font-bold text-slate-700">{new Date(store.createdAt).toLocaleDateString()}</span> by</p>
            <div className="flex items-center gap-2.5 text-xs pt-1">
                <Image width={36} height={36} src={store.user.image} alt={store.user.name} className="size-8 rounded-full border border-[#EFE0EF]" />
                <div>
                    <p className="font-bold text-[#241224]">{store.user.name}</p>
                    <p className="text-slate-400 text-[11px]">{store.user.email}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo
