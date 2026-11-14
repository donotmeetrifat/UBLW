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
    CheckIcon,
    RefreshIcon,
    CalendarIcon
} from "@/components/icons"
import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { subscribeToStoreSync } from "@/lib/realtimeSync"

const PERIOD_OPTIONS = [
    { id: 'daily', label: 'Daily (Today)' },
    { id: 'three_days', label: '3 Days' },
    { id: 'weekly', label: 'Weekly (7 Days)' },
    { id: 'monthly', label: 'Monthly (30 Days)' },
    { id: 'three_months', label: '3 Months' },
    { id: 'six_months', label: '6 Months' },
    { id: 'one_year', label: '1 Year' },
    { id: 'all_time', label: 'All Time' },
    { id: 'custom', label: 'Custom Date' }
]

const formatDateForInput = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [selectedPeriod, setSelectedPeriod] = useState('all_time')
    const [customStartDate, setCustomStartDate] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        return formatDateForInput(d)
    })
    const [customEndDate, setCustomEndDate] = useState(() => formatDateForInput(new Date()))

    const [dashboardData, setDashboardData] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_admin_dashboard') || '{}')
                if (cached && (cached.products || cached.revenue)) return cached
            } catch {}
        }
        return {
            products: 0,
            revenue: '0.00',
            orders: 0,
            customers: 0,
            newCustomersInPeriod: 0,
            totalViews: 0,
            todayOrders: 0,
            todayRevenue: '0.00',
            allTimeRevenue: '0.00',
            allTimeOrders: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            averageOrderValue: '0.00',
            periodInfo: {
                key: 'all_time',
                label: 'All Time History',
                startDate: null,
                endDate: new Date().toISOString()
            },
            topProducts: [],
            recentOrders: [],
        }
    })
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('ukbl_cached_admin_dashboard')
            if (cached && cached !== '{}') return false
        }
        return true
    })
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastSyncTime, setLastSyncTime] = useState(null)
    const isFirstLoad = useRef(true)

    const fetchDashboardData = useCallback(async (isManual = false, periodToUse = selectedPeriod, customStart = customStartDate, customEnd = customEndDate) => {
        try {
            if (isManual) setIsRefreshing(true)
            const params = new URLSearchParams({
                _t: Date.now().toString(),
                period: periodToUse
            })
            if (periodToUse === 'custom' && customStart && customEnd) {
                params.set('startDate', customStart)
                params.set('endDate', customEnd)
            }

            const res = await fetch(`/api/admin/dashboard?${params.toString()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            })
            const data = await res.json()
            if (data.success && data.dashboardData) {
                setDashboardData(data.dashboardData)
                setLastSyncTime(new Date())
                if (typeof window !== 'undefined' && periodToUse === 'all_time') {
                    try {
                        localStorage.setItem('ukbl_cached_admin_dashboard', JSON.stringify(data.dashboardData))
                    } catch {}
                }
            }
        } catch (error) {
            console.error('Error fetching admin dashboard real data:', error)
        } finally {
            if (isFirstLoad.current) {
                setLoading(false)
                isFirstLoad.current = false
            }
            if (isManual) setIsRefreshing(false)
        }
    }, [selectedPeriod, customStartDate, customEndDate])

    useEffect(() => {
        fetchDashboardData()

        // 1. Instant Realtime synchronization across all tabs and devices
        const unsubscribe = subscribeToStoreSync((payload) => {
            const t = payload?.type?.toLowerCase()
            if (t === 'orders' || t === 'products' || t === 'cart' || t === 'analytics' || t === 'store_updated') {
                fetchDashboardData(false)
            }
        })

        // 2. Custom window events for local instant updates
        const handleLocalSync = () => fetchDashboardData(false)
        window.addEventListener('orders-updated', handleLocalSync)
        window.addEventListener('products-updated', handleLocalSync)
        window.addEventListener('analytics-updated', handleLocalSync)
        window.addEventListener('focus', handleLocalSync)

        // 3. Periodic fallback poll (30s)
        const intervalId = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                fetchDashboardData(false)
            }
        }, 30000)

        // 4. Storage synchronization across tabs
        const handleStorageSync = (e) => {
            if (
                e.key === 'ukbl_analytics_updated' ||
                e.key === 'ukbl_orders_synced' ||
                e.key === 'ukbl_products_synced' ||
                e.key === 'ukbl_sync_event'
            ) {
                fetchDashboardData(false)
            }
        }
        window.addEventListener('storage', handleStorageSync)

        return () => {
            unsubscribe()
            window.removeEventListener('orders-updated', handleLocalSync)
            window.removeEventListener('products-updated', handleLocalSync)
            window.removeEventListener('analytics-updated', handleLocalSync)
            window.removeEventListener('focus', handleLocalSync)
            window.removeEventListener('storage', handleStorageSync)
            clearInterval(intervalId)
        }
    }, [fetchDashboardData])

    const handleSelectPeriod = (periodId) => {
        setSelectedPeriod(periodId)
        if (periodId !== 'custom') {
            fetchDashboardData(true, periodId)
        }
    }

    const handleApplyCustomDate = () => {
        if (!customStartDate || !customEndDate) {
            toast.error('Please select both start and end dates')
            return
        }
        if (new Date(customStartDate) > new Date(customEndDate)) {
            toast.error('Start date cannot be after end date')
            return
        }
        fetchDashboardData(true, 'custom', customStartDate, customEndDate)
    }

    if (loading) return <Loading />

    const isFiltered = selectedPeriod !== 'all_time'
    const periodLabel = dashboardData.periodInfo?.label || 'Selected Duration'

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
            title: isFiltered ? `${periodLabel} Revenue` : 'Total Sales Revenue',
            value: `${currency}${Number(dashboardData.revenue || 0).toLocaleString()}`,
            subtext: isFiltered 
                ? `Confirmed within ${periodLabel}` 
                : (dashboardData.todayOrders > 0 
                    ? `Today: +${currency}${Number(dashboardData.todayRevenue || 0).toLocaleString()} (${dashboardData.todayOrders})` 
                    : 'Confirmed Store Sales'),
            icon: CardPaymentIcon,
            color: '#241224',
            bg: 'bg-[#FAF6FA]',
            href: '/admin/orders',
            badge: isFiltered ? 'Duration Total' : null
        },
        {
            title: isFiltered ? `${periodLabel} Orders` : 'Customer Orders',
            value: dashboardData.orders || 0,
            subtext: `${dashboardData.pendingOrders || 0} active, ${dashboardData.deliveredOrders || 0} delivered${dashboardData.cancelledOrders > 0 ? `, ${dashboardData.cancelledOrders} cancelled` : ''}`,
            icon: TagIcon,
            color: '#D8B56D',
            bg: 'bg-amber-50',
            href: '/admin/orders'
        },
        {
            title: 'Average Order Value',
            value: `${currency}${Number(dashboardData.averageOrderValue || 0).toLocaleString()}`,
            subtext: dashboardData.orders > 0 ? `Across ${dashboardData.orders} orders in duration` : 'No orders in timeframe',
            icon: TrendIcon,
            color: '#059669',
            bg: 'bg-emerald-50',
            href: '/admin/orders'
        },
        {
            title: isFiltered ? 'New Customers' : 'Registered Users',
            value: isFiltered ? (dashboardData.newCustomersInPeriod || 0) : (dashboardData.customers || 0),
            subtext: isFiltered ? `${dashboardData.customers || 0} Total Lifetime Accounts` : 'Active Verified Accounts',
            icon: UserIcon,
            color: '#2563EB',
            bg: 'bg-blue-50',
            href: '/admin/customers'
        },
        {
            title: 'Live Product Views',
            value: Number(dashboardData.totalViews || 0).toLocaleString(),
            subtext: 'Genuine Real Impressions',
            icon: EyeIcon,
            color: '#059669',
            bg: 'bg-emerald-50',
            href: '/admin/analytics',
            isPulse: true
        }
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
                        Overview of store activity, orders, and sales performance
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Manual Refresh Button */}
                    <button
                        type="button"
                        onClick={() => fetchDashboardData(true)}
                        disabled={isRefreshing}
                        title="Fetch latest database metrics"
                        className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF6FA] text-slate-700 border border-[#EFE0EF] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-60"
                    >
                        <RefreshIcon size={14} className={isRefreshing ? "animate-spin text-[#6C306E]" : "text-slate-600"} />
                        <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                    </button>

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

            {/* DURATION & TIMEFRAME SELECTOR BAR */}
            <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-3xl shadow-2xs space-y-3.5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0">
                            <CalendarIcon size={17} color="#6C306E" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-extrabold text-[#241224] uppercase tracking-wider">
                                    Performance Duration
                                </h3>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#6C306E] text-white shadow-2xs">
                                    {periodLabel}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Select any timeframe to track orders, sales revenue, customers, and fulfillment metrics
                            </p>
                        </div>
                    </div>

                    {/* Date Span Summary */}
                    <div className="text-left md:text-right text-xs">
                        {dashboardData.periodInfo?.startDate ? (
                            <span className="text-[11px] text-slate-500 font-medium bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full inline-block">
                                From <b className="text-[#241224]">{new Date(dashboardData.periodInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b> to <b className="text-[#241224]">{new Date(dashboardData.periodInfo.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b>
                            </span>
                        ) : (
                            <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                                Full Storefront Lifetime History
                            </span>
                        )}
                    </div>
                </div>

                {/* Duration Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {PERIOD_OPTIONS.map((p) => {
                        const isSelected = selectedPeriod === p.id
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectPeriod(p.id)}
                                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                    isSelected
                                        ? 'bg-[#6C306E] text-white border-[#6C306E] shadow-2xs scale-[1.02]'
                                        : 'bg-[#FAF6FA]/80 hover:bg-[#FAF6FA] text-slate-700 border-[#EFE0EF] hover:border-[#6C306E]/30'
                                }`}
                            >
                                {p.label}
                            </button>
                        )
                    })}
                </div>

                {/* Custom Date Range Picker */}
                {selectedPeriod === 'custom' && (
                    <div className="pt-3.5 border-t border-[#EFE0EF] flex flex-wrap items-center gap-3 bg-[#FAF6FA]/50 p-3.5 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-600">Start Date:</span>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-600">End Date:</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleApplyCustomDate}
                            className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                            Apply Custom Date Range
                        </button>
                    </div>
                )}
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {kpiCards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        className="block bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs hover:border-[#6C306E]/40 hover:shadow-xs transition group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                {card.title}
                            </span>
                            <div className={`size-7 rounded-lg ${card.bg} border border-[#EFE0EF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                <card.icon size={13} color={card.color} />
                            </div>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-[#241224] tracking-tight">
                            {card.value}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1 truncate" title={card.subtext}>
                            {card.subtext}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid: Recent Orders & Top Viewed Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Orders Table for Selected Duration */}
                <div className="lg:col-span-2 bg-white border border-[#EFE0EF] rounded-3xl shadow-2xs overflow-hidden flex flex-col">
                    <div className="p-4 sm:p-5 border-b border-[#EFE0EF] flex items-center justify-between bg-[#FAF6FA]/30">
                        <div>
                            <h3 className="text-sm font-extrabold text-[#241224] flex items-center gap-2">
                                <TagIcon size={16} color="#6C306E" />
                                <span>{isFiltered ? `${periodLabel} Customer Orders` : 'Recent Customer Orders'}</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {dashboardData.orders} booking(s) recorded in database {isFiltered ? `for ${periodLabel}` : ''}
                            </p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="text-xs font-bold text-[#6C306E] hover:text-[#3A0C38] flex items-center gap-1"
                        >
                            <span>Manage All Orders</span>
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
                                                    {order.customerName || order.user?.name || order.address?.fullName || 'Customer'}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {order.customerContact || order.user?.phone || order.address?.phoneNumber || order.user?.email || 'Direct Order'}
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
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                            <p className="font-semibold text-slate-600">No customer orders recorded within {periodLabel}.</p>
                                            <p className="text-[11px] text-slate-400 mt-1">Select "All Time" or another timeframe to view data from other periods.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Viewed Products Widget */}
                <div className="bg-white border border-[#EFE0EF] rounded-3xl shadow-2xs p-5 flex flex-col justify-between">
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
                                                {p.image ? (
                                                    <img
                                                        src={p.image}
                                                        alt={p.name || ''}
                                                        className="max-h-7 w-auto object-contain"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs text-[#241224] truncate" title={p.name}>
                                                    {p.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {currency}{Number(p.price).toLocaleString()} • {p.category || 'General'}
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
                                    No product view metrics recorded in database yet.
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
