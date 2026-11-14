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
    CalendarIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon
} from "@/components/icons"
import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
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

    const [isDurationOpen, setIsDurationOpen] = useState(false)
    const [showCustomCalendar, setShowCustomCalendar] = useState(false)
    const [calendarMonth, setCalendarMonth] = useState(() => new Date())
    const [calendarPickingPhase, setCalendarPickingPhase] = useState('start')
    const durationDropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (durationDropdownRef.current && !durationDropdownRef.current.contains(e.target)) {
                setIsDurationOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelectPeriod = (periodId) => {
        setSelectedPeriod(periodId)
        setIsDurationOpen(false)
        setShowCustomCalendar(false)
        if (periodId !== 'custom') {
            fetchDashboardData(true, periodId)
        }
    }

    const handlePrevMonth = (e) => {
        if (e) e.stopPropagation()
        setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }

    const handleNextMonth = (e) => {
        if (e) e.stopPropagation()
        setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }

    const handleDayClick = (dayNum) => {
        const y = calendarMonth.getFullYear()
        const m = calendarMonth.getMonth()
        const clickedDate = new Date(y, m, dayNum)
        const formatted = formatDateForInput(clickedDate)

        if (calendarPickingPhase === 'start' || !customStartDate) {
            setCustomStartDate(formatted)
            setCalendarPickingPhase('end')
        } else {
            if (new Date(formatted) < new Date(customStartDate)) {
                setCustomEndDate(customStartDate)
                setCustomStartDate(formatted)
            } else {
                setCustomEndDate(formatted)
            }
            setCalendarPickingPhase('start')
        }
    }

    const applyPresetRange = (type) => {
        const today = new Date()
        const end = formatDateForInput(today)
        let start = ''
        if (type === '7d') {
            const d = new Date()
            d.setDate(d.getDate() - 6)
            start = formatDateForInput(d)
        } else if (type === '30d') {
            const d = new Date()
            d.setDate(d.getDate() - 29)
            start = formatDateForInput(d)
        } else if (type === 'this_month') {
            const d = new Date(today.getFullYear(), today.getMonth(), 1)
            start = formatDateForInput(d)
        } else if (type === 'last_month') {
            const s = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const e = new Date(today.getFullYear(), today.getMonth(), 0)
            setCustomStartDate(formatDateForInput(s))
            setCustomEndDate(formatDateForInput(e))
            return
        }
        setCustomStartDate(start)
        setCustomEndDate(end)
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
        setSelectedPeriod('custom')
        setIsDurationOpen(false)
        fetchDashboardData(true, 'custom', customStartDate, customEndDate)
    }

    const currentPeriodButtonLabel = (() => {
        if (selectedPeriod === 'all_time') return 'All Time'
        if (selectedPeriod === 'daily') return 'Daily (Today)'
        if (selectedPeriod === 'three_days') return '3 Days'
        if (selectedPeriod === 'weekly') return 'Weekly (7 Days)'
        if (selectedPeriod === 'monthly') return 'Monthly (30 Days)'
        if (selectedPeriod === 'three_months') return '3 Months'
        if (selectedPeriod === 'six_months') return '6 Months'
        if (selectedPeriod === 'one_year') return '1 Year'
        if (selectedPeriod === 'custom') {
            if (customStartDate && customEndDate) {
                const s = new Date(customStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                const e = new Date(customEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                return `${s} – ${e}`
            }
            return 'Custom Date'
        }
        return 'Duration'
    })()

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

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {/* 1. Duration Dropdown Button */}
                    <div className="relative" ref={durationDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDurationOpen(!isDurationOpen)}
                            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs cursor-pointer select-none border ${
                                selectedPeriod !== 'all_time'
                                    ? 'bg-[#FAF6FA] text-[#6C306E] border-[#6C306E] shadow-xs'
                                    : 'bg-white hover:bg-[#FAF6FA] text-slate-700 border-[#EFE0EF]'
                            }`}
                        >
                            <CalendarIcon size={14} color={selectedPeriod !== 'all_time' ? "#6C306E" : "#64748B"} />
                            <span>{currentPeriodButtonLabel}</span>
                            <ChevronDownIcon size={13} color={selectedPeriod !== 'all_time' ? "#6C306E" : "#64748B"} className={`transition-transform duration-200 ${isDurationOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Duration Dropdown & Calendar UI */}
                        <AnimatePresence>
                            {isDurationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 z-50 bg-white border border-[#EFE0EF] rounded-2xl shadow-xl w-72 sm:w-80 overflow-hidden text-xs"
                                >
                                    {/* Dropdown Header */}
                                    <div className="px-3.5 py-2.5 bg-[#FAF6FA] border-b border-[#EFE0EF] flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-extrabold text-[#241224] text-[11px] uppercase tracking-wider">
                                            <CalendarIcon size={13} color="#6C306E" />
                                            <span>Select Duration</span>
                                        </div>
                                        {selectedPeriod !== 'all_time' && (
                                            <button
                                                type="button"
                                                onClick={() => handleSelectPeriod('all_time')}
                                                className="text-[10px] font-bold text-[#6C306E] hover:underline cursor-pointer"
                                            >
                                                Reset to All Time
                                            </button>
                                        )}
                                    </div>

                                    {!showCustomCalendar ? (
                                        /* Presets List */
                                        <div className="p-2 space-y-0.5 max-h-[380px] overflow-y-auto">
                                            {PERIOD_OPTIONS.filter(p => p.id !== 'custom').map((p) => {
                                                const isSelected = selectedPeriod === p.id
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handleSelectPeriod(p.id)}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                                                            isSelected
                                                                ? 'bg-[#FAF6FA] text-[#6C306E] font-bold shadow-2xs'
                                                                : 'text-slate-700 hover:bg-slate-50 hover:text-[#241224] font-medium'
                                                        }`}
                                                    >
                                                        <span>{p.label}</span>
                                                        {isSelected && <CheckIcon size={14} color="#6C306E" strokeWidth={2.5} />}
                                                    </button>
                                                )
                                            })}

                                            <div className="border-t border-[#EFE0EF] my-1 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomCalendar(true)}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                                                        selectedPeriod === 'custom'
                                                            ? 'bg-[#FAF6FA] text-[#6C306E] font-bold'
                                                            : 'text-slate-700 hover:bg-slate-50 hover:text-[#241224] font-medium'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon size={13} color="#6C306E" />
                                                        <span>Custom Date Range</span>
                                                    </div>
                                                    <ChevronRightIcon size={13} color="#6C306E" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Clean Interactive Calendar UI View */
                                        <div className="p-3.5 space-y-3">
                                            {/* Calendar Header with Navigation */}
                                            <div className="flex items-center justify-between pb-1 border-b border-[#EFE0EF]">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomCalendar(false)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6C306E] hover:underline cursor-pointer"
                                                >
                                                    <ChevronLeftIcon size={12} color="#6C306E" />
                                                    <span>Back</span>
                                                </button>
                                                <span className="text-xs font-bold text-[#241224]">
                                                    {calendarMonth.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={handlePrevMonth}
                                                        className="p-1 rounded-lg hover:bg-[#FAF6FA] text-slate-600 cursor-pointer"
                                                        title="Previous Month"
                                                    >
                                                        <ChevronLeftIcon size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleNextMonth}
                                                        className="p-1 rounded-lg hover:bg-[#FAF6FA] text-slate-600 cursor-pointer"
                                                        title="Next Month"
                                                    >
                                                        <ChevronRightIcon size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Days of Week Header */}
                                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                                                    <div key={i} className="py-1">{d}</div>
                                                ))}
                                            </div>

                                            {/* Calendar Days Grid */}
                                            <div className="grid grid-cols-7 gap-1 text-center">
                                                {Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="size-7" />
                                                ))}
                                                {Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                                    const curDateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                                    const isStart = customStartDate === curDateStr
                                                    const isEnd = customEndDate === curDateStr
                                                    const isInRange = customStartDate && customEndDate && curDateStr > customStartDate && curDateStr < customEndDate

                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            onClick={() => handleDayClick(day)}
                                                            className={`size-7 rounded-lg flex items-center justify-center text-[11px] transition cursor-pointer mx-auto ${
                                                                isStart || isEnd
                                                                    ? 'bg-[#6C306E] text-white font-bold shadow-2xs'
                                                                    : isInRange
                                                                        ? 'bg-[#FAF6FA] text-[#6C306E] font-bold'
                                                                        : 'text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] font-medium'
                                                            }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Quick Range Presets */}
                                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#EFE0EF]">
                                                {['7d', '30d', 'this_month', 'last_month'].map(preset => {
                                                    const labels = {
                                                        '7d': 'Last 7D',
                                                        '30d': 'Last 30D',
                                                        'this_month': 'This Month',
                                                        'last_month': 'Last Month'
                                                    }
                                                    return (
                                                        <button
                                                            key={preset}
                                                            type="button"
                                                            onClick={() => applyPresetRange(preset)}
                                                            className="px-2 py-1 bg-[#FAF6FA] hover:bg-[#EFE0EF] text-[#6C306E] rounded-md text-[10px] font-bold transition cursor-pointer"
                                                        >
                                                            {labels[preset]}
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Manual Start & End Inputs */}
                                            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                                <div>
                                                    <span className="text-slate-500 font-semibold block mb-0.5">Start Date</span>
                                                    <input
                                                        type="date"
                                                        value={customStartDate}
                                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-semibold block mb-0.5">End Date</span>
                                                    <input
                                                        type="date"
                                                        value={customEndDate}
                                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomCalendar(false)}
                                                    className="w-1/2 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCustomDate}
                                                    className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-2xs cursor-pointer"
                                                >
                                                    Apply Range
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 2. Manual Refresh Button */}
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

                    {/* 3. Manage Products */}
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1.5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs"
                    >
                        <PlusIcon size={14} />
                        <span>Manage Products</span>
                    </Link>

                    {/* 4. Views Analytics */}
                    <Link
                        href="/admin/analytics"
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs"
                    >
                        <TrendIcon size={14} color="#6C306E" />
                        <span>Views Analytics</span>
                    </Link>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                {kpiCards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        className="block bg-white border border-[#EFE0EF] p-3 sm:p-4 rounded-2xl shadow-2xs hover:border-[#6C306E]/40 hover:shadow-xs transition group"
                    >
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                {card.title}
                            </span>
                            <div className={`size-6 sm:size-7 rounded-lg ${card.bg} border border-[#EFE0EF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                <card.icon size={12} color={card.color} />
                            </div>
                        </div>
                        <div className="text-base sm:text-xl font-black text-[#241224] tracking-tight">
                            {card.value}
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium mt-1 truncate" title={card.subtext}>
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
                        <table className="w-full min-w-[620px] text-left border-collapse text-xs">
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
