'use client'

import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import {
    BagIcon,
    CardPaymentIcon,
    StoreFrontIcon,
    TagIcon,
    EyeIcon,
    TrendIcon,
    SparklesIcon,
    PlusIcon,
    ArrowRightIcon
} from "@/components/icons"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        totalViews: 0,
        topProducts: [],
        allOrders: [],
    })

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/dashboard')
            const data = await res.json()
            if (data.success && data.dashboardData) {
                setDashboardData(data.dashboardData)
            } else {
                setDashboardData(dummyAdminDashboardData)
            }
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error)
            setDashboardData(dummyAdminDashboardData)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    const kpiCards = [
        {
            title: 'Total UK Products',
            value: dashboardData.products,
            subtext: 'Catalog Inventory',
            icon: BagIcon,
            color: '#6C306E',
            bg: 'bg-[#FAF6FA]',
            href: '/admin/products'
        },
        {
            title: 'True Product Views',
            value: Number(dashboardData.totalViews || 0).toLocaleString(),
            subtext: 'Verified Visitor Visits',
            icon: EyeIcon,
            color: '#059669',
            bg: 'bg-emerald-50',
            href: '/admin/analytics',
            isPulse: true
        },
        {
            title: 'Total Revenue',
            value: `${currency}${Number(dashboardData.revenue).toLocaleString()}`,
            subtext: 'Completed Transactions',
            icon: CardPaymentIcon,
            color: '#241224',
            bg: 'bg-[#FAF6FA]',
            href: '/admin/orders'
        },
        {
            title: 'Customer Orders',
            value: dashboardData.orders,
            subtext: 'Orders Dispatched & In-Flight',
            icon: TagIcon,
            color: '#D8B56D',
            bg: 'bg-amber-50',
            href: '/admin/orders'
        },
    ]

    return (
        <div className="space-y-6 pb-20 text-slate-800">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Executive</span>
                        <span className="text-[#6C306E]">Dashboard</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Live operational overview of UK Brand Lover flagship sales, genuine product traffic, and catalog status
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1.5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2.5 rounded-full text-xs font-bold transition shadow-2xs"
                    >
                        <PlusIcon size={14} />
                        <span>Manage Products</span>
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] px-4 py-2.5 rounded-full text-xs font-bold transition shadow-2xs"
                    >
                        <TrendIcon size={14} color="#6C306E" />
                        <span>Product Views</span>
                    </Link>
                </div>
            </div>

            {/* KPI Metric Cards (Titas Enterprise Design) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        className="block bg-white border border-[#EFE0EF] p-5 rounded-2xl shadow-2xs hover:border-[#6C306E]/40 hover:shadow-xs transition"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>{card.title}</span>
                                {card.isPulse && (
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                            </span>
                            <div className={`size-10 rounded-xl ${card.bg} border border-[#EFE0EF] flex items-center justify-center`}>
                                <card.icon size={18} color={card.color} />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-[#241224]">
                            {card.value}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1">
                            {card.subtext}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Middle Section: Top Viewed Products & Quick Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Area Chart */}
                <div className="lg:col-span-2 bg-white border border-[#EFE0EF] p-6 rounded-3xl shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-[#241224]">Sales & Order Analytics (BDT)</h3>
                            <p className="text-xs text-slate-400">Order revenue generated across recent dispatches</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                            Live Revenue
                        </span>
                    </div>
                    <OrdersAreaChart allOrders={dashboardData.allOrders} />
                </div>

                {/* Top Viewed Products Widget */}
                <div className="bg-white border border-[#EFE0EF] p-6 rounded-3xl shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-[#241224] flex items-center gap-1.5">
                                    <EyeIcon size={16} color="#059669" />
                                    <span>Top Viewed UK Items</span>
                                </h3>
                                <p className="text-xs text-slate-400">Products most loved & visited</p>
                            </div>
                            <Link
                                href="/admin/analytics"
                                className="text-[11px] font-bold text-[#6C306E] hover:underline flex items-center gap-1"
                            >
                                <span>Leaderboard</span>
                                <ArrowRightIcon size={12} />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
                                dashboardData.topProducts.map((p, idx) => (
                                    <div
                                        key={p.id || idx}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6FA]/50 border border-[#EFE0EF] hover:bg-[#FAF6FA] transition"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="font-extrabold text-xs text-slate-400 w-4 text-center">
                                                #{idx + 1}
                                            </span>
                                            <div className="size-9 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0">
                                                <img
                                                    src={p.image || '/product_img1.png'}
                                                    alt={p.name}
                                                    className="max-h-7 w-auto object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-extrabold text-xs text-[#241224] truncate" title={p.name}>
                                                    {p.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {currency}{Number(p.price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
                                            <EyeIcon size={11} color="#059669" />
                                            <span className="font-black text-[11px] text-emerald-800">
                                                {Number(p.views || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-6">No product view metrics recorded yet</p>
                            )}
                        </div>
                    </div>

                    <Link
                        href="/admin/analytics"
                        className="mt-4 w-full bg-[#FAF6FA] hover:bg-[#EFE0EF] text-[#6C306E] py-2 rounded-xl text-xs font-bold text-center block transition border border-[#EFE0EF]"
                    >
                        View Full Viewership Intelligence →
                    </Link>
                </div>
            </div>
        </div>
    )
}
