'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CouponTicketIcon,
    SearchIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    CloseIcon,
    CheckIcon,
    SparklesIcon,
    UserIcon,
    BagIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'

export default function AdminCouponsPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [coupons, setCoupons] = useState([])
    const [customers, setCustomers] = useState([])
    const [stats, setStats] = useState({
        totalCoupons: 0,
        activeCoupons: 0,
        totalRedemptions: 0,
        registeredUsers: 0
    })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterTab, setFilterTab] = useState('ALL') // 'ALL' | 'ACTIVE' | 'LIFETIME' | 'RESTRICTED' | 'EXPIRED'

    // Modal & Editor states
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingCoupon, setDeletingCoupon] = useState(null)

    // Form fields
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE', // 'PERCENTAGE' | 'FIXED'
        discount: 10,
        minOrderAmount: 0,
        maxDiscount: '',
        isLifetime: true,
        startsAt: '',
        expiresAt: '',
        usageLimit: '',
        perUserLimit: 1,
        forNewUserOnly: false,
        targetingMode: 'ALL', // 'ALL' | 'SPECIFIC'
        allowedUserEmails: [],
        isActive: true
    })

    // Search query for customer picker
    const [customerSearch, setCustomerSearch] = useState('')
    const [customEmailInput, setCustomEmailInput] = useState('')

    const fetchCoupons = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/coupons?_t=' + Date.now(), { cache: 'no-store' })
            const data = await res.json()
            if (data.success) {
                setCoupons(data.coupons || [])
                setCustomers(data.customers || [])
                if (data.stats) setStats(data.stats)
            } else {
                toast.error(data.message || 'Failed to load coupons')
            }
        } catch (error) {
            console.error('Error fetching coupons:', error)
            toast.error('Unable to connect to coupons database')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleOpenCreate = () => {
        setEditingCoupon(null)
        setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discount: 15,
            minOrderAmount: 0,
            maxDiscount: '',
            isLifetime: true,
            startsAt: '',
            expiresAt: '',
            usageLimit: '',
            perUserLimit: 1,
            forNewUserOnly: false,
            targetingMode: 'ALL',
            allowedUserEmails: [],
            isActive: true
        })
        setCustomerSearch('')
        setCustomEmailInput('')
        setIsEditorOpen(true)
    }

    const handleOpenEdit = (c) => {
        setEditingCoupon(c)
        const hasSpecificUsers = Array.isArray(c.allowedUserEmails) && c.allowedUserEmails.length > 0
        setFormData({
            code: c.code || '',
            description: c.description || '',
            discountType: c.discountType || 'PERCENTAGE',
            discount: c.discount || 10,
            minOrderAmount: c.minOrderAmount || 0,
            maxDiscount: c.maxDiscount || '',
            isLifetime: Boolean(c.isLifetime),
            startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : '',
            expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : '',
            usageLimit: c.usageLimit !== null && c.usageLimit !== undefined ? c.usageLimit : '',
            perUserLimit: c.perUserLimit || 1,
            forNewUserOnly: Boolean(c.forNewUserOnly),
            targetingMode: hasSpecificUsers ? 'SPECIFIC' : 'ALL',
            allowedUserEmails: c.allowedUserEmails || [],
            isActive: c.isActive !== false
        })
        setCustomerSearch('')
        setCustomEmailInput('')
        setIsEditorOpen(true)
    }

    const handleToggleActive = async (coupon) => {
        const nextState = !coupon.isActive
        try {
            const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: nextState })
            })
            const data = await res.json()
            if (data.success) {
                setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: nextState } : c))
                toast.success(`Coupon ${coupon.code} marked ${nextState ? 'Active' : 'Inactive'}`)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_coupons_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                }
            } else {
                toast.error(data.message || 'Failed to update coupon status')
            }
        } catch (error) {
            toast.error('Error connecting to server')
        }
    }

    const handleSaveCoupon = async (e) => {
        e.preventDefault()
        if (!formData.code.trim()) {
            toast.error('Please enter a coupon code')
            return
        }

        const parsedDiscount = parseFloat(formData.discount)
        if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
            toast.error('Please enter a valid discount value')
            return
        }

        if (formData.discountType === 'PERCENTAGE' && parsedDiscount > 100) {
            toast.error('Percentage discount cannot exceed 100%')
            return
        }

        if (!formData.isLifetime && !formData.expiresAt) {
            toast.error('Please set an expiration date or mark as Lifetime')
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                description: formData.description.trim() || `${formData.code.toUpperCase()} Special Privilege`,
                discountType: formData.discountType,
                discount: parsedDiscount,
                minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
                isLifetime: formData.isLifetime,
                startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
                expiresAt: (!formData.isLifetime && formData.expiresAt) ? new Date(formData.expiresAt).toISOString() : null,
                usageLimit: formData.usageLimit !== '' ? parseInt(formData.usageLimit, 10) : null,
                perUserLimit: parseInt(formData.perUserLimit, 10) || 1,
                forNewUserOnly: formData.forNewUserOnly,
                allowedUserEmails: formData.targetingMode === 'SPECIFIC' ? formData.allowedUserEmails : [],
                isActive: formData.isActive
            }

            let res, data
            if (editingCoupon) {
                res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            } else {
                res = await fetch('/api/admin/coupons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            data = await res.json()
            if (data.success) {
                toast.success(editingCoupon ? 'Coupon updated successfully!' : 'New coupon launched live!')
                setIsEditorOpen(false)
                fetchCoupons()
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_coupons_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                }
            } else {
                toast.error(data.message || 'Failed to save coupon')
            }
        } catch (error) {
            console.error('Error saving coupon:', error)
            toast.error('Connection error occurred while saving')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteCoupon = async () => {
        if (!deletingCoupon) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/coupons/${deletingCoupon.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message || 'Coupon removed successfully')
                setDeletingCoupon(null)
                fetchCoupons()
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_coupons_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                }
            } else {
                toast.error(data.message || 'Failed to delete coupon')
            }
        } catch (error) {
            toast.error('Error deleting coupon')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCopyCode = (code) => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(code)
            toast.success(`Copied "${code}" to clipboard!`)
        }
    }

    const toggleCustomerEmail = (email) => {
        const normalized = email.toLowerCase().trim()
        setFormData(prev => {
            const exists = prev.allowedUserEmails.includes(normalized)
            return {
                ...prev,
                allowedUserEmails: exists
                    ? prev.allowedUserEmails.filter(e => e !== normalized)
                    : [...prev.allowedUserEmails, normalized]
            }
        })
    }

    const handleAddCustomEmail = (e) => {
        e.preventDefault()
        if (!customEmailInput.trim() || !customEmailInput.includes('@')) {
            toast.error('Please enter a valid email address')
            return
        }
        const normalized = customEmailInput.trim().toLowerCase()
        if (formData.allowedUserEmails.includes(normalized)) {
            toast.error('Email is already in the allowed list')
            return
        }
        setFormData(prev => ({
            ...prev,
            allowedUserEmails: [...prev.allowedUserEmails, normalized]
        }))
        setCustomEmailInput('')
    }

    // Filtered customer list for modal
    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return customers
        const q = customerSearch.toLowerCase()
        return customers.filter(c =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            (c.phone && c.phone.includes(q))
        )
    }, [customers, customerSearch])

    // Filtered coupons list for main table
    const filteredCoupons = useMemo(() => {
        const now = new Date()
        return coupons.filter(c => {
            // Text search
            const q = searchQuery.toLowerCase()
            const matchesSearch = !q ||
                c.code.toLowerCase().includes(q) ||
                (c.description && c.description.toLowerCase().includes(q)) ||
                (Array.isArray(c.allowedUserEmails) && c.allowedUserEmails.some(e => e.toLowerCase().includes(q)))

            if (!matchesSearch) return false

            // Filter tabs
            if (filterTab === 'ACTIVE') return c.isActive
            if (filterTab === 'LIFETIME') return Boolean(c.isLifetime)
            if (filterTab === 'RESTRICTED') return Array.isArray(c.allowedUserEmails) && c.allowedUserEmails.length > 0
            if (filterTab === 'EXPIRED') {
                const isExpiredDate = !c.isLifetime && c.expiresAt && new Date(c.expiresAt) < now
                const isDepleted = c.usageLimit && (c.usedCount || 0) >= c.usageLimit
                return isExpiredDate || isDepleted || !c.isActive
            }

            return true
        })
    }, [coupons, searchQuery, filterTab])

    if (loading && coupons.length === 0) return <Loading />

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">
                        Coupons & Voucher Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Create, schedule, and monitor authentic UK beauty discount codes across public and restricted customer campaigns.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={fetchCoupons}
                        className="px-3.5 py-2 rounded-full border border-[#EFE0EF] hover:border-[#6C306E]/40 bg-white text-xs font-bold text-slate-600 hover:text-[#6C306E] transition shadow-2xs"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2 rounded-full bg-[#6C306E] hover:bg-[#531E55] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                        <PlusIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
                        <span>Create Coupon</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Vouchers</span>
                        <div className="size-8 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                            <CouponTicketIcon size={16} color="#6C306E" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#241224]">{stats.totalCoupons}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Configured in store catalog</p>
                </div>

                <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Live</span>
                        <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <SparklesIcon size={16} color="#059669" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-700">{stats.activeCoupons}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Available for redemption</p>
                </div>

                <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Redemptions</span>
                        <div className="size-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#8C3494]">
                            <BagIcon size={16} color="#8C3494" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#6C306E]">{stats.totalRedemptions}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Total orders discounted</p>
                </div>

                <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Base</span>
                        <div className="size-8 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                            <UserIcon size={16} color="#6C306E" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#241224]">{stats.registeredUsers}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Accounts eligible for targeting</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#EFE0EF] rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by coupon code, description, or assigned user email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-full text-xs text-[#241224] outline-none transition"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF6FA] border border-[#EFE0EF] rounded-full">
                        {[
                            { key: 'ALL', label: 'All Coupons' },
                            { key: 'ACTIVE', label: 'Active Live' },
                            { key: 'LIFETIME', label: 'Lifetime' },
                            { key: 'RESTRICTED', label: 'Specific Users' },
                            { key: 'EXPIRED', label: 'Expired / Closed' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterTab(tab.key)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                    filterTab === tab.key
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-[#241224]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Coupons Data Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#EFE0EF]">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF6FA] border-b border-[#EFE0EF] text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3 px-4">Coupon Code & Campaign</th>
                                <th className="py-3 px-4">Discount Value</th>
                                <th className="py-3 px-4">Min Order & Cap</th>
                                <th className="py-3 px-4">Timing & Expiration</th>
                                <th className="py-3 px-4">Target Audience</th>
                                <th className="py-3 px-4">Redemptions</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF] bg-white">
                            {filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <div className="size-12 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mx-auto mb-2">
                                            <CouponTicketIcon size={20} color="#6C306E" />
                                        </div>
                                        <p className="font-bold text-xs text-slate-600">No coupons found matching your criteria</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Click &ldquo;Create Coupon&rdquo; to launch a new promotional code.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => {
                                    const now = new Date()
                                    const isExpired = !coupon.isLifetime && coupon.expiresAt && new Date(coupon.expiresAt) < now
                                    const isDepleted = coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit
                                    const isSpecific = Array.isArray(coupon.allowedUserEmails) && coupon.allowedUserEmails.length > 0

                                    return (
                                        <tr key={coupon.id} className="hover:bg-[#FAF6FA]/50 transition">
                                            {/* Code & Description */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-sm text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2.5 py-1 rounded-lg">
                                                        {coupon.code}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyCode(coupon.code)}
                                                        className="text-[10px] text-slate-400 hover:text-[#6C306E] transition cursor-pointer"
                                                        title="Copy coupon code"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] truncate" title={coupon.description}>
                                                    {coupon.description || 'Special Promotion'}
                                                </p>
                                            </td>

                                            {/* Discount Value */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-[#6C306E] border border-purple-200">
                                                    {coupon.discountType === 'FIXED' ? `${currency}${coupon.discount} FLAT OFF` : `${coupon.discount}% OFF`}
                                                </span>
                                            </td>

                                            {/* Min Order & Max Cap */}
                                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                                                <div className="font-medium text-[11px]">
                                                    {coupon.minOrderAmount > 0 ? `Min: ${currency}${coupon.minOrderAmount.toLocaleString()}` : 'No Minimum'}
                                                </div>
                                                {coupon.maxDiscount && (
                                                    <div className="text-[10px] text-slate-400">
                                                        Cap: {currency}{coupon.maxDiscount.toLocaleString()}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Timing & Expiration */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {coupon.isLifetime ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        <SparklesIcon size={11} color="#047857" />
                                                        <span>Lifetime</span>
                                                    </span>
                                                ) : isExpired ? (
                                                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                                        Expired ({new Date(coupon.expiresAt).toLocaleDateString('en-GB')})
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-slate-700">
                                                        Expires {new Date(coupon.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                )}
                                                {coupon.startsAt && new Date(coupon.startsAt) > now && (
                                                    <p className="text-[10px] text-amber-600 mt-0.5">
                                                        Starts {new Date(coupon.startsAt).toLocaleDateString('en-GB')}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Target Audience */}
                                            <td className="py-3.5 px-4">
                                                {isSpecific ? (
                                                    <div>
                                                        <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E]">
                                                            {coupon.allowedUserEmails.length} Selected Customer{coupon.allowedUserEmails.length > 1 ? 's' : ''}
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]" title={coupon.allowedUserEmails.join(', ')}>
                                                            {coupon.allowedUserEmails.join(', ')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-slate-600">
                                                        All Customers (Public)
                                                    </span>
                                                )}
                                            </td>

                                            {/* Redemptions / Limits */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="font-bold text-[#241224]">
                                                    {coupon.usedCount || 0}
                                                    {coupon.usageLimit ? ` / ${coupon.usageLimit} max` : ' used'}
                                                </div>
                                                {coupon.usageLimit && (
                                                    <div className="w-20 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isDepleted ? 'bg-rose-500' : 'bg-[#6C306E]'}`}
                                                            style={{ width: `${Math.min(100, ((coupon.usedCount || 0) / coupon.usageLimit) * 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={coupon.isActive && !isExpired && !isDepleted}
                                                        onChange={() => handleToggleActive(coupon)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                                                </label>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(coupon)}
                                                        className="p-1.5 rounded-lg border border-[#EFE0EF] hover:border-[#6C306E] text-slate-500 hover:text-[#6C306E] hover:bg-[#FAF6FA] transition cursor-pointer"
                                                        title="Edit coupon"
                                                    >
                                                        <EditIcon size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingCoupon(coupon)}
                                                        className="p-1.5 rounded-lg border border-rose-200 hover:border-rose-400 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                                        title="Delete coupon"
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create & Edit Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative my-8"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-[#EFE0EF]">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-9 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                        <CouponTicketIcon size={18} color="#6C306E" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-[#241224]">
                                            {editingCoupon ? `Edit Coupon "${editingCoupon.code}"` : 'Create New Coupon Voucher'}
                                        </h3>
                                        <p className="text-[11px] text-slate-500">Configure discount value, timing restrictions, and targeted customer accounts.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditorOpen(false)}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <CloseIcon size={18} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSaveCoupon} className="space-y-4 pt-4 text-xs">
                                {/* Row 1: Code & Campaign Description */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Coupon Code <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. VIP20 or EID500"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            required
                                            className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2 font-mono font-black text-sm uppercase text-[#241224] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Campaign Description
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 20% Off Eid Luxury Skincare Offer"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2 text-[#241224] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Discount Type & Amount */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#FAF6FA]/70 p-3.5 rounded-2xl border border-[#EFE0EF]">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Discount Type</label>
                                        <select
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-2 font-bold text-[#241224] outline-none"
                                        >
                                            <option value="PERCENTAGE">Percentage (% Off)</option>
                                            <option value="FIXED">Fixed Amount (৳ Off)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Discount Value <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="any"
                                            placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                                            value={formData.discount}
                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                            required
                                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-2 font-black text-[#241224] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            {formData.discountType === 'PERCENTAGE' ? 'Max Discount Cap (৳)' : 'Max Cap'}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Optional (e.g. 500)"
                                            value={formData.maxDiscount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                            disabled={formData.discountType === 'FIXED'}
                                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-2 text-[#241224] outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Minimum Order & Usage Limit */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Minimum Order Subtotal (৳)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0 for no minimum"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                            className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2 text-[#241224] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Total Redemptions Limit (First X Customers)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="e.g. 5 or 10 (Leave empty for unlimited)"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                            className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2 text-[#241224] outline-none"
                                        />
                                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                                            Example: enter 5 so only the first 5 customers can use this coupon.
                                        </span>
                                    </div>
                                </div>

                                {/* Row 4: Timing & Expiration */}
                                <div className="p-3.5 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">Coupon Duration & Expiration</p>
                                            <p className="text-[10px] text-slate-500">Configure whether coupon runs forever or during a set time window</p>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isLifetime}
                                                onChange={(e) => setFormData({ ...formData, isLifetime: e.target.checked })}
                                                className="accent-[#6C306E] size-4 rounded"
                                            />
                                            <span className="text-[11px] font-bold text-[#6C306E]">Lifetime (Never Expires)</span>
                                        </label>
                                    </div>

                                    {!formData.isLifetime && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Starts At (Optional)</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.startsAt}
                                                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                                                    className="w-full bg-white border border-[#EFE0EF] rounded-xl px-3 py-1.5 text-xs text-[#241224] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                                    Expires At <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.expiresAt}
                                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                                    required={!formData.isLifetime}
                                                    className="w-full bg-white border border-[#EFE0EF] rounded-xl px-3 py-1.5 text-xs text-[#241224] outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Row 5: Customer Targeting (Specific Users) */}
                                <div className="p-3.5 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF] space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">Customer Target Audience</p>
                                            <p className="text-[10px] text-slate-500">Allow public access or restrict discount to specific customer accounts</p>
                                        </div>

                                        <div className="flex items-center gap-1.5 p-0.5 bg-white border border-[#EFE0EF] rounded-full">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, targetingMode: 'ALL' })}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                                    formData.targetingMode === 'ALL'
                                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                                        : 'text-slate-600 hover:text-[#241224]'
                                                }`}
                                            >
                                                All Customers (Public)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, targetingMode: 'SPECIFIC' })}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                                    formData.targetingMode === 'SPECIFIC'
                                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                                        : 'text-slate-600 hover:text-[#241224]'
                                                }`}
                                            >
                                                Specific Users Only
                                            </button>
                                        </div>
                                    </div>

                                    {formData.targetingMode === 'SPECIFIC' && (
                                        <div className="space-y-3 pt-2 border-t border-[#EFE0EF]">
                                            {/* Currently Selected Customer Chips */}
                                            {formData.allowedUserEmails.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-[#EFE0EF]">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C306E] self-center mr-1">
                                                        Selected ({formData.allowedUserEmails.length}):
                                                    </span>
                                                    {formData.allowedUserEmails.map((email) => (
                                                        <span
                                                            key={email}
                                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-[11px] font-bold text-[#6C306E]"
                                                        >
                                                            <span>{email}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleCustomerEmail(email)}
                                                                className="text-slate-400 hover:text-rose-600 transition"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Manual Email Input */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="email"
                                                    placeholder="Add customer by email (e.g. customer@example.com)..."
                                                    value={customEmailInput}
                                                    onChange={(e) => setCustomEmailInput(e.target.value)}
                                                    className="flex-1 bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-1.5 text-xs text-[#241224] outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomEmail}
                                                    className="px-3 py-1.5 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] hover:border-[#6C306E] text-xs font-bold text-[#6C306E] transition cursor-pointer"
                                                >
                                                    Add Email
                                                </button>
                                            </div>

                                            {/* Registered Customer Selection Table/List */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        Registered Store Customers ({customers.length})
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder="Filter registered customers..."
                                                        value={customerSearch}
                                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                                        className="px-2.5 py-1 bg-white border border-[#EFE0EF] rounded-lg text-[10px] text-[#241224] outline-none max-w-[200px]"
                                                    />
                                                </div>

                                                <div className="max-h-36 overflow-y-auto bg-white border border-[#EFE0EF] rounded-xl divide-y divide-[#EFE0EF]">
                                                    {filteredCustomers.length === 0 ? (
                                                        <p className="p-3 text-center text-slate-400 text-[11px]">No registered customers match search</p>
                                                    ) : (
                                                        filteredCustomers.map((c) => {
                                                            const isSelected = formData.allowedUserEmails.includes(c.email.toLowerCase())
                                                            return (
                                                                <div
                                                                    key={c.id || c.email}
                                                                    onClick={() => toggleCustomerEmail(c.email)}
                                                                    className={`flex items-center justify-between p-2 hover:bg-[#FAF6FA] transition cursor-pointer ${
                                                                        isSelected ? 'bg-purple-50/60' : ''
                                                                    }`}
                                                                >
                                                                    <div className="min-w-0 pr-2">
                                                                        <p className="font-bold text-xs text-[#241224] truncate">
                                                                            {c.name || 'Customer'}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-500 truncate">{c.email}</p>
                                                                    </div>
                                                                    <div className={`size-4.5 rounded-md border flex items-center justify-center shrink-0 ${
                                                                        isSelected ? 'bg-[#6C306E] border-[#6C306E] text-white' : 'border-slate-300 bg-white'
                                                                    }`}>
                                                                        {isSelected && <CheckIcon size={11} color="#FFFFFF" strokeWidth={2.5} />}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="font-bold text-xs text-[#241224]">Publish Status</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="accent-[#6C306E] size-4 rounded"
                                        />
                                        <span className="font-bold text-xs text-slate-700">
                                            {formData.isActive ? 'Active on Storefront' : 'Disabled / Inactive'}
                                        </span>
                                    </label>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EFE0EF]">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditorOpen(false)}
                                        className="px-4 py-2 rounded-full border border-[#EFE0EF] hover:bg-slate-50 text-slate-600 text-xs font-bold transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2 rounded-full bg-[#6C306E] hover:bg-[#531E55] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create & Publish Coupon')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingCoupon && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-[#EFE0EF] rounded-3xl shadow-xl max-w-sm w-full p-6 text-center space-y-4"
                        >
                            <div className="size-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                                <TrashIcon size={20} color="#E11D48" />
                            </div>
                            <div>
                                <h4 className="font-black text-base text-[#241224]">Delete Coupon?</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Are you sure you want to permanently remove coupon <span className="font-mono font-bold text-rose-600">&ldquo;{deletingCoupon.code}&rdquo;</span>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2.5 pt-2">
                                <button
                                    onClick={() => setDeletingCoupon(null)}
                                    className="px-4 py-2 rounded-full border border-[#EFE0EF] text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteCoupon}
                                    disabled={isSaving}
                                    className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {isSaving ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
