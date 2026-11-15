'use client'

import { useEffect, useState, useCallback, useRef } from "react"
import Loading from "@/components/Loading"
import {
    TrendIcon,
    EyeIcon,
    BagIcon,
    TagIcon,
    SparklesIcon,
    RoyalCrownIcon,
    StarIcon,
    SearchIcon,
    CheckIcon,
    RefreshIcon
} from "@/components/icons"
import Link from "next/link"
import AdminDropdown from "@/components/admin/AdminDropdown"
import { subscribeToStoreSync } from "@/lib/realtimeSync"

export default function AdminAnalyticsPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [analytics, setAnalytics] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const isFirstLoad = useRef(true)

    const fetchAnalytics = useCallback(async (isManual = false) => {
        try {
            if (isManual) setIsRefreshing(true)
            const res = await fetch(`/api/admin/analytics?_t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            })
            const data = await res.json()
            if (data.success && data.analytics) {
                setAnalytics(data.analytics)
            }
        } catch (error) {
            console.error('Error fetching analytics real data:', error)
        } finally {
            if (isFirstLoad.current) {
                setLoading(false)
                isFirstLoad.current = false
            }
            if (isManual) setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()

        // 1. Instant Realtime synchronization across all devices and tabs
        const unsubscribe = subscribeToStoreSync((payload) => {
            const t = payload?.type?.toLowerCase()
            if (t === 'analytics' || t === 'orders' || t === 'products' || t === 'cart' || t === 'store_updated') {
                fetchAnalytics(false)
            }
        })

        // 2. Custom window events for local instant updates
        const handleLocalSync = () => fetchAnalytics(false)
        window.addEventListener('orders-updated', handleLocalSync)
        window.addEventListener('products-updated', handleLocalSync)
        window.addEventListener('cart-updated', handleLocalSync)
        window.addEventListener('analytics-updated', handleLocalSync)
        window.addEventListener('focus', handleLocalSync)

        // 3. Storage synchronization across tabs
        const handleStorageSync = (e) => {
            if (
                e.key === 'ukbl_analytics_updated' ||
                e.key === 'ukbl_orders_synced' ||
                e.key === 'ukbl_products_synced' ||
                e.key === 'ukbl_sync_event'
            ) {
                fetchAnalytics(false)
            }
        }
        window.addEventListener('storage', handleStorageSync)

        // 4. Background sync interval (20s)
        const intervalId = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                fetchAnalytics(false)
            }
        }, 20000)

        return () => {
            unsubscribe()
            window.removeEventListener('orders-updated', handleLocalSync)
            window.removeEventListener('products-updated', handleLocalSync)
            window.removeEventListener('cart-updated', handleLocalSync)
            window.removeEventListener('analytics-updated', handleLocalSync)
            window.removeEventListener('focus', handleLocalSync)
            window.removeEventListener('storage', handleStorageSync)
            clearInterval(intervalId)
        }
    }, [fetchAnalytics])

    if (loading) return <Loading />

    const summary = analytics?.summary || {
        totalViews: 0,
        totalUnitsSold: 0,
        totalOrders: 0,
        totalCartItems: 0,
        totalRevenue: 0,
        overallConversion: 0,
        topViewedProduct: null,
        secondTopViewed: null,
        thirdTopViewed: null,
    }

    const topProducts = analytics?.topProducts || []
    const categories = ['All', ...new Set(topProducts.map(p => p.category).filter(Boolean))]

    const filteredProducts = topProducts.filter(p => {
        if (categoryFilter !== 'All' && p.category !== categoryFilter) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            return (p.name || '').toLowerCase().includes(q) ||
                   (p.brand || '').toLowerCase().includes(q) ||
                   (p.category || '').toLowerCase().includes(q)
        }
        return true
    })

    return (
        <div className="space-y-6 pb-24 text-slate-800">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Product Views & Engagement</span>
                        <span className="text-[#6C306E]">Analytics</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Track customer impressions, interest, and conversion metrics
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => fetchAnalytics(true)}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF6FA] text-slate-700 border border-[#EFE0EF] px-3.5 py-2 rounded-2xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-60"
                    >
                        <RefreshIcon size={14} className={isRefreshing ? "animate-spin text-[#6C306E]" : "text-slate-600"} />
                        <span>{isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
                    </button>
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1.5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-3.5 py-2 rounded-2xl text-xs font-bold transition shadow-2xs"
                    >
                        <span>Manage Products</span>
                    </Link>
                </div>
            </div>

            {/* TOP 3 PODIUM LEADERBOARD (Top #1, Second #2, Third #3 Views) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* #1 TOP VIEWED PRODUCT */}
                <div className="bg-gradient-to-b from-[#FAF6FA] to-white border-2 border-[#D8B56D] p-5 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#D8B56D] text-[#241224] text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                        <span>Rank #1 Top Views</span>
                    </div>

                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="size-16 rounded-2xl bg-white border border-[#EFE0EF] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                            {summary.topViewedProduct?.image ? (
                                <img
                                    src={summary.topViewedProduct.image}
                                    alt={summary.topViewedProduct.name || ''}
                                    className="max-h-13 w-auto object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <SparklesIcon size={22} color="#D8B56D" />
                            )}
                        </div>
                        <div className="min-w-0 pr-12">
                            <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-wider block">
                                Most Viewed Product
                            </span>
                            <h3 className="font-extrabold text-xs text-[#241224] line-clamp-2 mt-0.5" title={summary.topViewedProduct?.name}>
                                {summary.topViewedProduct?.name || 'Awaiting product traffic'}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-[#EFE0EF] rounded-2xl text-center">
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Real Views</div>
                            <div className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                                <EyeIcon size={13} color="#059669" />
                                <span>{Number(summary.topViewedProduct?.views || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">In Cart</div>
                            <div className="text-base font-black text-[#6C306E] mt-0.5">
                                {summary.topViewedProduct?.inCart || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Purchased</div>
                            <div className="text-base font-black text-[#241224] mt-0.5">
                                {summary.topViewedProduct?.unitsBought || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* #2 SECOND TOP VIEWED PRODUCT */}
                <div className="bg-gradient-to-b from-[#FAF6FA]/60 to-white border border-[#EFE0EF] p-5 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-slate-200 text-slate-700 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        <span>Rank #2 Second Views</span>
                    </div>

                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="size-16 rounded-2xl bg-white border border-[#EFE0EF] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                            {summary.secondTopViewed?.image ? (
                                <img
                                    src={summary.secondTopViewed.image}
                                    alt={summary.secondTopViewed.name || ''}
                                    className="max-h-13 w-auto object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <SparklesIcon size={22} color="#94A3B8" />
                            )}
                        </div>
                        <div className="min-w-0 pr-12">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Runner Up Viewed
                            </span>
                            <h3 className="font-extrabold text-xs text-[#241224] line-clamp-2 mt-0.5" title={summary.secondTopViewed?.name}>
                                {summary.secondTopViewed?.name || 'Awaiting second product traffic'}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-[#EFE0EF] rounded-2xl text-center">
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Real Views</div>
                            <div className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                                <EyeIcon size={13} color="#059669" />
                                <span>{Number(summary.secondTopViewed?.views || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">In Cart</div>
                            <div className="text-base font-black text-[#6C306E] mt-0.5">
                                {summary.secondTopViewed?.inCart || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Purchased</div>
                            <div className="text-base font-black text-[#241224] mt-0.5">
                                {summary.secondTopViewed?.unitsBought || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* #3 THIRD TOP VIEWED PRODUCT */}
                <div className="bg-gradient-to-b from-[#FAF6FA]/60 to-white border border-[#EFE0EF] p-5 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        <span>Rank #3 Third Views</span>
                    </div>

                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="size-16 rounded-2xl bg-white border border-[#EFE0EF] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                            {summary.thirdTopViewed?.image ? (
                                <img
                                    src={summary.thirdTopViewed.image}
                                    alt={summary.thirdTopViewed.name || ''}
                                    className="max-h-13 w-auto object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <SparklesIcon size={22} color="#D97706" />
                            )}
                        </div>
                        <div className="min-w-0 pr-12">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                                Third Most Viewed
                            </span>
                            <h3 className="font-extrabold text-xs text-[#241224] line-clamp-2 mt-0.5" title={summary.thirdTopViewed?.name}>
                                {summary.thirdTopViewed?.name || 'Awaiting third product traffic'}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-[#EFE0EF] rounded-2xl text-center">
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Real Views</div>
                            <div className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                                <EyeIcon size={13} color="#059669" />
                                <span>{Number(summary.thirdTopViewed?.views || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">In Cart</div>
                            <div className="text-base font-black text-[#6C306E] mt-0.5">
                                {summary.thirdTopViewed?.inCart || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Purchased</div>
                            <div className="text-base font-black text-[#241224] mt-0.5">
                                {summary.thirdTopViewed?.unitsBought || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EXECUTIVE METRICS SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-white border border-[#EFE0EF] p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                            Total Page Impressions
                        </div>
                        <div className="size-8 sm:size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 aspect-square">
                            <EyeIcon size={16} color="#059669" className="sm:size-5" />
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                        <div className="text-xl sm:text-2xl font-black text-[#241224] tracking-tight">
                            {Number(summary.totalViews || 0).toLocaleString()}
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-emerald-600 font-semibold mt-0.5 truncate" title="True database verified visits">
                            True database verified visits
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                            Active In-Bag Items
                        </div>
                        <div className="size-8 sm:size-10 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0 aspect-square">
                            <BagIcon size={16} color="#6C306E" className="sm:size-5" />
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                        <div className="text-xl sm:text-2xl font-black text-[#6C306E] tracking-tight">
                            {summary.totalCartItems || 0}
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-slate-400 mt-0.5 truncate" title="Units currently added in carts">
                            Units currently added in carts
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                            Total Units Purchased
                        </div>
                        <div className="size-8 sm:size-10 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shrink-0 aspect-square">
                            <TagIcon size={16} color="#6C306E" className="sm:size-5" />
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                        <div className="text-xl sm:text-2xl font-black text-[#241224] tracking-tight">
                            {summary.totalUnitsSold || 0}
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-slate-400 mt-0.5 truncate" title={`Across ${summary.totalOrders || 0} customer orders`}>
                            Across {summary.totalOrders || 0} customer orders
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                            View-to-Sale Conversion
                        </div>
                        <div className="size-8 sm:size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 aspect-square">
                            <TrendIcon size={16} color="#059669" className="sm:size-5" />
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3">
                        <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                            {summary.overallConversion || 0}%
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-emerald-800 font-semibold mt-0.5 truncate" title="Real conversion efficiency">
                            Real conversion efficiency
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH & CATEGORY FILTER BAR */}
            <div className="bg-white border border-[#EFE0EF] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                <div className="relative w-full sm:max-w-md">
                    <SearchIcon size={14} color="#6C306E" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none sm:size-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products or brand..."
                        className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-8.5 sm:pl-9 pr-3 py-1.5 sm:py-2 text-[11px] sm:text-xs outline-none transition font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 hidden sm:inline">Category:</span>
                    <AdminDropdown
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        options={categories.map(cat => ({ value: cat, label: cat }))}
                        className="w-full sm:w-52"
                        buttonClassName="py-1.5 sm:py-2 text-[11px] sm:text-xs rounded-xl"
                    />
                </div>
            </div>

            {/* FULL LEADERBOARD TABLE (RANKED BY TRUE VIEWS) */}
            <div className="bg-white border border-[#EFE0EF] rounded-3xl shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-[#EFE0EF] flex items-center justify-between bg-[#FAF6FA]/40">
                    <div>
                        <h2 className="text-base font-black text-[#241224] flex items-center gap-2">
                            <span>Top Viewed UK Products Leaderboard</span>
                            <span className="text-[10px] font-bold bg-[#6C306E] text-white px-2 py-0.5 rounded-full">
                                Real Traffic Ranked
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Live breakdown of genuine visitor impressions, bag additions, orders count, and sales revenue
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left text-xs">
                        <thead className="bg-[#FAF6FA] text-[#241224] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#EFE0EF]">
                            <tr>
                                <th className="px-5 py-4 text-center">Rank</th>
                                <th className="px-4 py-4">Product</th>
                                <th className="px-4 py-4">Category</th>
                                <th className="px-4 py-4 text-center">True Views</th>
                                <th className="px-4 py-4 text-center">In Bag</th>
                                <th className="px-4 py-4 text-center">Units Sold</th>
                                <th className="px-4 py-4 text-center">Conversion</th>
                                <th className="px-5 py-4 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]/60">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                                        <p className="text-xs font-semibold">No product analytics matching search</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((prod) => {
                                    const rankBadge = `#${prod.rank}`

                                    return (
                                        <tr key={prod.id} className="hover:bg-[#FAF6FA]/70 transition-colors">
                                            {/* Rank */}
                                            <td className="px-5 py-3.5 text-center">
                                                <span
                                                    className={`inline-block font-black text-xs px-2.5 py-1 rounded-full border ${
                                                        prod.rank === 1
                                                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                                                            : prod.rank === 2
                                                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                                                            : prod.rank === 3
                                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                            : 'bg-[#FAF6FA] text-slate-500 border-[#EFE0EF]'
                                                    }`}
                                                >
                                                    {rankBadge}
                                                </span>
                                            </td>

                                            {/* Product Info */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-xl bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-xs">
                                                        {prod.image ? (
                                                            <img
                                                                src={prod.image}
                                                                alt={prod.name || ''}
                                                                className="max-h-9 w-auto object-contain"
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <SparklesIcon size={16} color="#6C306E" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-xs">
                                                        <p className="font-extrabold text-[#241224] text-xs line-clamp-1" title={prod.name}>
                                                            {prod.name}
                                                        </p>
                                                        <div className="text-[10px] text-slate-400 font-semibold">
                                                            {currency}{Number(prod.price).toLocaleString()} • {prod.brand || 'Authentic UK'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3.5">
                                                <span className="inline-block bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {prod.category}
                                                </span>
                                            </td>

                                            {/* True Verified Views */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-bold text-xs text-slate-800">
                                                    {Number(prod.views || 0).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* In Cart Additions */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-bold text-[#6C306E]">
                                                    {prod.inCart || 0} in bag
                                                </span>
                                            </td>

                                            {/* Units Bought */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-extrabold text-[#241224]">
                                                    {prod.unitsBought || 0} units
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">
                                                    ({prod.ordersCount || 0} orders)
                                                </span>
                                            </td>

                                            {/* Conversion Rate */}
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-emerald-500 h-full rounded-full"
                                                            style={{ width: `${Math.min(prod.conversionRate || 0, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-xs">
                                                        {prod.conversionRate || 0}%
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Revenue */}
                                            <td className="px-5 py-3.5 text-right font-black text-[#241224]">
                                                {currency}{Number(prod.revenue || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
