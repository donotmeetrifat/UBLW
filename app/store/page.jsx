'use client'

import { dummyStoreDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { BagIcon, CardPaymentIcon, StarIcon, TagIcon } from "@/components/icons"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Total UK Products', value: dashboardData.totalProducts, icon: BagIcon },
        { title: 'Total Earnings', value: `${currency}${dashboardData.totalEarnings.toLocaleString()}`, icon: CardPaymentIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagIcon },
        { title: 'Customer Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        setDashboardData(dummyStoreDashboardData)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl font-bold text-[#241224]">Seller <span className="text-[#6C306E]">Dashboard</span></h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
                {dashboardCardsData.map((card, index) => (
                    <div key={index} className="flex items-center justify-between border border-[#EFE0EF] bg-white p-5 rounded-2xl shadow-2xs">
                        <div className="flex flex-col gap-1.5 text-xs">
                            <p className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">{card.title}</p>
                            <b className="text-2xl font-extrabold text-[#241224]">{card.value}</b>
                        </div>
                        <div className="size-12 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                            <card.icon size={22} color="#6C306E" />
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-lg font-bold text-[#241224] mt-10 mb-4">Verified Customer Reviews</h2>

            <div className="space-y-4">
                {dashboardData.ratings.map((review, index) => (
                    <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between p-6 rounded-2xl bg-white border border-[#EFE0EF] text-sm text-slate-600 max-w-4xl shadow-2xs">
                        <div>
                            <div className="flex gap-3 items-center">
                                <Image src={review.user.image} alt="" className="size-10 rounded-full object-cover border border-[#EFE0EF]" width={100} height={100} />
                                <div>
                                    <p className="font-bold text-[#241224]">{review.user.name}</p>
                                    <p className="font-medium text-xs text-slate-400">{new Date(review.createdAt).toDateString()}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-slate-600 max-w-lg leading-relaxed text-xs sm:text-sm italic">
                                "{review.review}"
                            </p>
                        </div>
                        <div className="flex flex-col justify-between gap-4 sm:items-end">
                            <div className="flex flex-col sm:items-end">
                                <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-wider">{review.product?.category}</span>
                                <p className="font-bold text-[#241224] text-xs max-w-xs sm:text-right">{review.product?.name}</p>
                                <div className='flex items-center gap-0.5 mt-1'>
                                    {Array(5).fill('').map((_, idx) => (
                                        <StarIcon 
                                            key={idx} 
                                            size={14} 
                                            filled={review.rating >= idx + 1}
                                            color="#D8B56D"
                                            emptyColor="#E8DFE9"
                                        />
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push(`/product/${review.product.id}`)} 
                                className="bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] px-4 py-2 hover:bg-[#6C306E] hover:text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                            >
                                View Product
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
