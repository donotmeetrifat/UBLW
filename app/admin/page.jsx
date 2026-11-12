'use client'

import Loading from "@/components/Loading"
import {
    BagIcon,
    CardPaymentIcon,
    TagIcon,
    EyeIcon,
    TrendIcon,
    PlusIcon,
    ArrowRightIcon,
    UserIcon,
    TruckIcon,
    CheckIcon
} from "@/components/icons"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: '0.00',
        orders: 0,
        customers: 0,
        totalViews: 0,
        topProducts: [],
        recentOrders: [],
    })

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/dashboard')
            const data = await res.json()
            if (data.success && data.dashboardData) {
                setDashboardData(data.dashboardData)
            }
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error)
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
            value: dashboardData.products || 0,
            subtext: 'Catalog Inventory Items',
            icon: BagIcon,
            color: '#6C306E',
            bg: 'bg-[#FAF6FA]',
            href: '/admin/products'
        },
        {
            title: 'True Product Views',
            value: Number(dashboardData.totalViews || 0).toLocaleString(),
            subtext: 'Real Verified Visitor Views',
            icon: EyeIcon,
            color: '#059669',
            bg: 'bg-emerald-50',
            href: '/admin/analytics',
            isPulse: true
        },
        {
            title: 'Customer Orders',
            value: dashboardData.orders || 0,
            subtext: 'Total Customer Bookings',
            icon: TagIcon,
            color: '#D8B56D',
            bg: 'bg-amber-50',
            href: '/admin/orders'
        },
        {
            title: 'Total Revenue',
            value: `${currency}${Number(dashboardData.revenue || 0).toLocaleString()}`,
            subtext: 'Confirmed & Completed Sales',
            icon: CardPaymentIcon,
            color: '#241224',
            bg: 'bg-[#FAF6FA]',
            href: '/admin/orders'
        },
        {
            title: 'Registered Users',
            value: dashboardData.customers || 0,
            subtext: 'Active Customer Accounts',
            icon: UserIcon,
            color: '#2563EB',
            bg: 'bg-blue-50',
            href: '/admin/customers'
        },
    ]

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase()
        if (s === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
        if (s === 'SHIPPED') return 'bg-blue-50 text-blue-700 border-blue-200'
        if (s === 'CONFIRMED' || s === 'PROCESSING') return 'bg-purple-50 text-purple-700 border-purple-200'
        if (s === 'CANCELLED') return 'bg-rose-50 text-rose-700 border-rose-200'
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }

    return (
        <div className="space-y-6 pb-20 text-slate-800">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Admin</span>
                        <span className="text-[#6C306E]">Dashboard</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Executive live summary of products, genuine views, customer orders, and revenue
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1.5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs"
                    >
                        <PlusIcon size={14} />
                        <span>Manage Products</span>
                    </Link>
                    <Link
                        href="/admin/analytics"
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs"
                    >
                        <TrendIcon size={14} color="#6C306E" />
                        <span>Views Analytics</span>
                    </Link>
                </div>
            </div>

            {/* KPI Metric Cards (Titas Enterprise Design) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {kpiCards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        className="block bg-white border border-[#EFE0EF] p-4.5 rounded-2xl shadow-2xs hover:border-[#6C306E]/40 hover:shadow-xs transition"
                    >
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {card.title}
                            </span>
                            <div className={`size-8 rounded-xl ${card.bg} border border-[#EFE0EF] flex items-center justify-center shrink-0`}>
                                <card.icon size={15} color={card.color} />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-[#241224] tracking-tight">
                            {card.value}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">
                            {card.subtext}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid: Recent Orders & Top Viewed Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Customer Orders Table */}
                <div className="lg:col-span-2 bg-white border border-[#EFE0EF] rounded-2xl shadow-2xs overflow-hidden flex flex-col">
                    <div className="p-4 sm:p-5 border-b border-[#EFE0EF] flex items-center justify-between bg-[#FAF6FA]/30">
                        <div>
                            <h3 className="text-sm font-extrabold text-[#241224] flex items-center gap-2">
                                <TagIcon size={16} color="#6C306E" />
                                <span>Recent Customer Orders</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Real verified customer bookings from database</p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="text-xs font-bold text-[#6C306E] hover:text-[#3A0C38] flex items-center gap-1"
                        >
                            <span>View All Orders</span>
                            <ArrowRightIcon size={13} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#EFE0EF] bg-[#FAF6FA]/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Order #</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Items</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]">
                                {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                                    dashboardData.recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[#FAF6FA]/40 transition">
                                            <td className="py-3 px-4 font-mono font-bold text-[#241224]">
                                                <Link href="/admin/orders" className="hover:text-[#6C306E] hover:underline">
                                                    {order.orderNumber || order.id.slice(0, 8)}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-[#241224]">
                                                    {order.user?.name || 'Valued Customer'}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {order.user?.phone || order.user?.email || 'Direct Order'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">
                                                {order.orderItems?.length || 1} item(s)
                                            </td>
                                            <td className="py-3 px-4 font-black text-[#241224]">
                                                {currency}{Number(order.total || 0).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                                                    {order.status || 'ORDER_PLACED'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                                            No customer orders recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Viewed Products Widget */}
                <div className="bg-white border border-[#EFE0EF] rounded-2xl shadow-2xs p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EFE0EF]">
                            <div>
                                <h3 className="text-sm font-extrabold text-[#241224] flex items-center gap-1.5">
                                    <EyeIcon size={16} color="#059669" />
                                    <span>Top Viewed UK Products</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">True authentic visitor impressions</p>
                            </div>
                            <Link
                                href="/admin/analytics"
                                className="text-xs font-bold text-[#6C306E] hover:underline flex items-center gap-1"
                            >
                                <span>Full Report</span>
                                <ArrowRightIcon size={12} />
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
                                dashboardData.topProducts.map((p, idx) => (
                                    <div
                                        key={p.id || idx}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6FA]/50 border border-[#EFE0EF] hover:bg-[#FAF6FA] transition"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="font-extrabold text-xs text-slate-400 w-4 text-center shrink-0">
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
                                                <p className="font-bold text-xs text-[#241224] truncate" title={p.name}>
                                                    {p.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {currency}{Number(p.price).toLocaleString()} • {p.category || 'Skincare'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shrink-0 ml-2">
                                            <span className="font-bold text-[11px] text-emerald-800">
                                                {Number(p.views || 0).toLocaleString()} views
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    No product view metrics recorded yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <Link
                        href="/admin/analytics"
                        className="mt-4 w-full bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[#6C306E] py-2.5 rounded-xl text-xs font-bold text-center block transition border border-[#EFE0EF]"
                    >
                        View Complete Viewership Analytics →
                    </Link>
                </div>
            </div>
        </div>
    )
}
