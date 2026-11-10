'use client'

import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { BagIcon, CardPaymentIcon, StoreFrontIcon, TagIcon } from "@/components/icons"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total UK Products', value: dashboardData.products, icon: BagIcon },
        { title: 'Total Revenue', value: `${currency}${Number(dashboardData.revenue).toLocaleString()}`, icon: CardPaymentIcon },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagIcon },
        { title: 'Active Stores', value: dashboardData.stores, icon: StoreFrontIcon },
    ]

    const fetchDashboardData = async () => {
        setDashboardData(dummyAdminDashboardData)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl font-bold text-[#241224]">Admin <span className="text-[#6C306E]">Dashboard</span></h1>

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

            {/* Area Chart */}
            <div className="bg-white border border-[#EFE0EF] p-6 rounded-3xl shadow-2xs">
                <h3 className="text-base font-bold text-[#241224] mb-4">Sales & Order Analytics (BDT)</h3>
                <OrdersAreaChart allOrders={dashboardData.allOrders} />
            </div>
        </div>
    )
}
