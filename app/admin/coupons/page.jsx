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
    BagIcon,
    CalendarIcon,
    ClockIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import LuxuryDatePicker from '@/components/ui/LuxuryDatePicker'
import { broadcastStoreChange } from '@/lib/realtimeSync'

export default function AdminCouponsPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [coupons, setCoupons] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_admin_coupons') || '[]')
                if (Array.isArray(cached) && cached.length > 0) return cached
            } catch {}
        }
        return []
    })
    const [customers, setCustomers] = useState([])
    const [stats, setStats] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_admin_coupons_stats') || '{}')
                if (cached && cached.totalCoupons !== undefined) return cached
            } catch {}
        }
        return {
            totalCoupons: 0,
            activeCoupons: 0,
            totalRedemptions: 0,
            registeredUsers: 0
        }
    })
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('ukbl_cached_admin_coupons')
            if (cached && cached !== '[]') return false
        }
        return true
    })
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
            if (coupons.length === 0) setLoading(true)
            const res = await fetch('/api/admin/coupons?_t=' + Date.now(), {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Expires': '0'
                }
            })
            const data = await res.json()
            if (data.success) {
                setCoupons(data.coupons || [])
                setCustomers(data.customers || [])
                if (data.stats) setStats(data.stats)
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('ukbl_cached_admin_coupons', JSON.stringify(data.coupons || []))
                        if (data.stats) localStorage.setItem('ukbl_cached_admin_coupons_stats', JSON.stringify(data.stats))
                    } catch {}
                }
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
        // Optimistic UI state update
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: nextState } : c))

        try {
            const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: coupon.id, isActive: nextState })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Coupon ${coupon.code} marked ${nextState ? 'Active' : 'Inactive'}`)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_coupons_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                    try {
                        const channel = new BroadcastChannel('ukbl_catalog_channel')
                        channel.postMessage({ type: 'COUPON_UPDATED', id: coupon.id, isActive: nextState })
                        channel.close()
                    } catch (e) {
                        // ignore BroadcastChannel errors
                    }
                    broadcastStoreChange('coupons', { id: coupon.id, isActive: nextState })
                }
            } else {
                // Revert optimistic update on error
                setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !nextState } : c))
                toast.error(data.message || 'Failed to update coupon status')
            }
        } catch (error) {
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !nextState } : c))
            toast.error('Error connecting to server')
        }
    }

    // Live educational calculation preview for the modal
    const liveCalc = useMemo(() => {
        const isPct = formData.discountType === 'PERCENTAGE'
        const discVal = parseFloat(formData.discount) || 0
        const minOrder = parseFloat(formData.minOrderAmount) || 0
        const maxCap = (isPct && formData.maxDiscount !== '' && formData.maxDiscount !== null)
            ? parseFloat(formData.maxDiscount)
            : null

        // Sample cart amount to demonstrate
        const sampleCart = Math.max(3000, minOrder > 0 ? minOrder + 1000 : 3000)
        let sampleDiscount = 0
        let capApplied = false

        if (isPct) {
            sampleDiscount = (sampleCart * discVal) / 100
            if (maxCap && sampleDiscount > maxCap) {
                sampleDiscount = maxCap
                capApplied = true
            }
        } else {
            sampleDiscount = Math.min(sampleCart, discVal)
        }

        const sampleFinal = Math.max(0, sampleCart - sampleDiscount)

        return {
            isPct,
            discVal,
            minOrder,
            maxCap,
            sampleCart,
            sampleDiscount,
            sampleFinal,
            capApplied
        }
    }, [formData.discountType, formData.discount, formData.minOrderAmount, formData.maxDiscount])

    const generateSuggestedCode = () => {
        const prefixes = ['UKBL', 'ROYAL', 'VIP', 'GLOW', 'BEAUTY', 'EID', 'LUXURY']
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
        const num = formData.discountType === 'PERCENTAGE' 
            ? (formData.discount || 15) 
            : (formData.discount || 500)
        const code = `${prefix}${num}`
        setFormData(prev => ({ ...prev, code }))
    }

    const handleSaveCoupon = async (e) => {
        e.preventDefault()
        const cleanCode = (formData.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
        if (!cleanCode) {
            toast.error('Please enter a coupon code (e.g. VIP20, EID500)')
            return
        }

        const parsedDiscount = parseFloat(formData.discount)
        if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
            toast.error('Please enter a valid discount amount greater than 0')
            return
        }

        if (formData.discountType === 'PERCENTAGE' && parsedDiscount > 100) {
            toast.error('Percentage discount cannot exceed 100%')
            return
        }

        // Validate dates safely
        let validStartsAt = null
        if (formData.startsAt) {
            const d = new Date(formData.startsAt)
            if (!isNaN(d.getTime())) validStartsAt = d.toISOString()
        }

        let validExpiresAt = null
        if (!formData.isLifetime) {
            if (!formData.expiresAt) {
                toast.error('Please select an expiration date & time or enable Lifetime Voucher')
                return
            }
            const d = new Date(formData.expiresAt)
            if (!isNaN(d.getTime())) {
                validExpiresAt = d.toISOString()
            } else {
                toast.error('Please select a valid expiration date & time')
                return
            }
        }

        setIsSaving(true)
        try {
            const payload = {
                code: cleanCode,
                description: formData.description.trim() || `${cleanCode} Special Privilege Voucher`,
                discountType: formData.discountType,
                discount: parsedDiscount,
                minOrderAmount: Math.max(0, parseFloat(formData.minOrderAmount) || 0),
                maxDiscount: (formData.discountType === 'PERCENTAGE' && formData.maxDiscount !== '' && formData.maxDiscount !== null && !isNaN(parseFloat(formData.maxDiscount)))
                    ? Math.max(0, parseFloat(formData.maxDiscount))
                    : null,
                isLifetime: Boolean(formData.isLifetime),
                startsAt: validStartsAt,
                expiresAt: validExpiresAt,
                usageLimit: formData.usageLimit !== '' && formData.usageLimit !== null && !isNaN(parseInt(formData.usageLimit, 10))
                    ? Math.max(1, parseInt(formData.usageLimit, 10))
                    : null,
                perUserLimit: Math.max(1, parseInt(formData.perUserLimit, 10) || 1),
                forNewUserOnly: Boolean(formData.forNewUserOnly),
                allowedUserEmails: formData.targetingMode === 'SPECIFIC' ? formData.allowedUserEmails : [],
                isActive: Boolean(formData.isActive)
            }

            let res, data
            if (editingCoupon) {
                res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id: editingCoupon.id })
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
                toast.success(editingCoupon ? 'Coupon updated successfully!' : `Coupon ${cleanCode} published live!`)
                setIsEditorOpen(false)

                // Optimistically update state so the coupon is immediately visible in the table
                if (data.coupon) {
                    setCoupons(prev => {
                        const list = Array.isArray(prev) ? prev : []
                        const exists = list.some(c => c.id === data.coupon.id || c.code === data.coupon.code)
                        if (exists) {
                            return list.map(c => (c.id === data.coupon.id || c.code === data.coupon.code) ? { ...c, ...data.coupon } : c)
                        }
                        return [data.coupon, ...list]
                    })
                }

                // Reset search query and filter to ALL so the newly created/updated coupon is never hidden
                setSearchQuery('')
                setFilterTab('ALL')

                fetchCoupons()
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_coupons_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                    try {
                        const channel = new BroadcastChannel('ukbl_catalog_channel')
                        channel.postMessage({ type: 'COUPON_UPDATED', id: editingCoupon ? editingCoupon.id : data.coupon?.id })
                        channel.close()
                    } catch (e) {
                        // ignore
                    }
                    broadcastStoreChange('coupons', { coupon: data.coupon })
                }
            } else {
                toast.error(data.message || data.error || 'Failed to save coupon')
            }
        } catch (error) {
            console.error('Error saving coupon:', error)
            toast.error(error.message || 'Connection error occurred while saving')
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
                const deletedId = deletingCoupon.id
                setCoupons(prev => prev.filter(c => c.id !== deletedId))
                setDeletingCoupon(null)
                fetchCoupons()
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_coupons_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('coupon-catalog-updated'))
                    broadcastStoreChange('coupons', { id: deletedId, deleted: true })
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl max-w-5xl w-full relative my-3 sm:my-6 max-h-[94vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-5 sm:px-7 py-3.5 border-b border-[#EFE0EF] bg-[#FAF6FA]/80 flex items-center justify-between shrink-0 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-10 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs flex items-center justify-center text-[#6C306E] shrink-0">
                                        <CouponTicketIcon size={20} color="#6C306E" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-extrabold text-base text-[#241224] truncate">
                                                {editingCoupon ? `Edit Coupon "${editingCoupon.code}"` : 'Create New Coupon Voucher'}
                                            </h3>
                                            {formData.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                                                    Paused
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate">Configure discount value, timing restrictions, and targeted customer accounts.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setIsEditorOpen(false)}
                                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
                                        aria-label="Close"
                                    >
                                        <CloseIcon size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Form + Live Preview Body */}
                            <form onSubmit={handleSaveCoupon} className="flex-1 min-h-0 flex flex-col">
                                <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#EFE0EF]">
                                    
                                    {/* Left Column: Clean Organized Configuration Form */}
                                    <div className="lg:col-span-7 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs pb-32">
                                        
                                        {/* Card 1: Coupon Code & Campaign Info */}
                                        <div className="p-4 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF] space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-[#241224] flex items-center gap-1.5">
                                                    <span className="size-5 rounded-full bg-[#6C306E] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                                                    Coupon Code & Campaign
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">Customer Voucher Identifier</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Coupon Code <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. VIP20 or EID500"
                                                            value={formData.code}
                                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                            required
                                                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2 font-mono font-black text-sm uppercase text-[#241224] outline-none pr-20 transition"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={generateSuggestedCode}
                                                            className="absolute right-1.5 top-1.5 bottom-1.5 px-2 bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white border border-[#EFE0EF] text-[10px] font-bold text-[#6C306E] rounded-lg transition flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <SparklesIcon size={10} color="currentColor" />
                                                            <span>Suggest</span>
                                                        </button>
                                                    </div>
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
                                                        className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2 text-xs text-[#241224] outline-none transition"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: Discount Structure & Pricing Rules */}
                                        <div className="p-4 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs space-y-3.5">
                                            <span className="font-bold text-xs text-[#241224] flex items-center gap-1.5">
                                                <span className="size-5 rounded-full bg-[#6C306E] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                                                Discount Rules & Values
                                            </span>

                                            {/* Clean Segmented Switcher */}
                                            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF]">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                                        formData.discountType === 'PERCENTAGE'
                                                            ? 'bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]'
                                                            : 'text-slate-600 hover:text-[#241224]'
                                                    }`}
                                                >
                                                    <span className="size-5 rounded-md bg-[#FAF6FA] text-[#6C306E] flex items-center justify-center font-black text-[11px] border border-[#EFE0EF]">%</span>
                                                    <span>Percentage Off</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, discountType: 'FIXED' })}
                                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                                        formData.discountType === 'FIXED'
                                                            ? 'bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]'
                                                            : 'text-slate-600 hover:text-[#241224]'
                                                    }`}
                                                >
                                                    <span className="size-5 rounded-md bg-[#FAF6FA] text-[#6C306E] flex items-center justify-center font-black text-[11px] border border-[#EFE0EF]">{currency}</span>
                                                    <span>Fixed Amount Off</span>
                                                </button>
                                            </div>

                                            {/* Numeric Inputs */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        {formData.discountType === 'PERCENTAGE' ? 'Discount Rate (%)' : `Flat Amount (${currency})`} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="any"
                                                            placeholder={formData.discountType === 'PERCENTAGE' ? '15' : '500'}
                                                            value={formData.discount}
                                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                                            required
                                                            className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3 py-2 font-black text-sm text-[#241224] outline-none transition"
                                                        />
                                                        <span className="absolute right-3 top-2.5 font-bold text-xs text-slate-400">
                                                            {formData.discountType === 'PERCENTAGE' ? '%' : currency}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Max Cap ({currency})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder={formData.discountType === 'PERCENTAGE' ? 'Optional (e.g. 500)' : 'Not needed for fixed'}
                                                        value={formData.maxDiscount}
                                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                                        disabled={formData.discountType === 'FIXED'}
                                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#241224] outline-none disabled:opacity-40 transition"
                                                    />
                                                    <span className="text-[9.5px] text-slate-400 mt-0.5 block truncate">
                                                        {formData.discountType === 'PERCENTAGE' ? 'Ceiling limit for big orders' : 'Exact flat deduction'}
                                                    </span>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Min Subtotal ({currency})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0 for any order"
                                                        value={formData.minOrderAmount}
                                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#241224] outline-none transition"
                                                    />
                                                    <span className="text-[9.5px] text-slate-400 mt-0.5 block truncate">
                                                        0 = Valid on any order value
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 3: Validity & Scheduling (Fixed Calendar Alignment) */}
                                        <div className="p-4 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF] space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-[#241224] flex items-center gap-1.5">
                                                    <span className="size-5 rounded-full bg-[#6C306E] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                                                    Validity & Scheduling
                                                </span>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-full border border-[#EFE0EF] hover:border-[#6C306E] transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isLifetime}
                                                        onChange={(e) => setFormData({ ...formData, isLifetime: e.target.checked })}
                                                        className="accent-[#6C306E] size-3.5 rounded cursor-pointer"
                                                    />
                                                    <span className="text-[11px] font-bold text-[#6C306E]">Lifetime (Never Expires)</span>
                                                </label>
                                            </div>

                                            {formData.isLifetime ? (
                                                <div className="p-3.5 rounded-xl bg-white border border-[#EFE0EF] text-xs text-slate-700 shadow-2xs">
                                                    <p className="text-xs leading-relaxed text-slate-700">
                                                        <strong className="text-[#6C306E] font-bold">Lifetime Voucher Active:</strong> This coupon will run indefinitely on the storefront until you manually pause it.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                    <LuxuryDatePicker
                                                        label="Starts At (Optional)"
                                                        placeholder="Select start date & time"
                                                        value={formData.startsAt}
                                                        onChange={(val) => setFormData({ ...formData, startsAt: val })}
                                                        align="left"
                                                    />
                                                    <LuxuryDatePicker
                                                        label="Expires At"
                                                        placeholder="Select expiration date & time"
                                                        value={formData.expiresAt}
                                                        required={!formData.isLifetime}
                                                        onChange={(val) => setFormData({ ...formData, expiresAt: val })}
                                                        align="right"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Card 4: Usage Limit & Customer Target Audience */}
                                        <div className="p-4 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs space-y-3.5">
                                            <span className="font-bold text-xs text-[#241224] flex items-center gap-1.5">
                                                <span className="size-5 rounded-full bg-[#6C306E] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                                                Usage & Customer Targeting
                                            </span>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Total Redemptions Cap
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="e.g. 10 (or empty for unlimited)"
                                                        value={formData.usageLimit}
                                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2 text-xs text-[#241224] outline-none transition"
                                                    />
                                                    <span className="text-[9.5px] text-slate-400 mt-0.5 block">
                                                        e.g. First 10 shoppers get the discount
                                                    </span>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Target Audience
                                                    </label>
                                                    <div className="flex items-center gap-1 p-0.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl h-[38px]">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, targetingMode: 'ALL' })}
                                                            className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer text-center ${
                                                                formData.targetingMode === 'ALL'
                                                                    ? 'bg-[#6C306E] text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:text-[#241224]'
                                                            }`}
                                                        >
                                                            All Public
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, targetingMode: 'SPECIFIC' })}
                                                            className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer text-center ${
                                                                formData.targetingMode === 'SPECIFIC'
                                                                    ? 'bg-[#6C306E] text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:text-[#241224]'
                                                            }`}
                                                        >
                                                            Specific Users
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {formData.targetingMode === 'SPECIFIC' && (
                                                <div className="space-y-3 pt-2 border-t border-[#EFE0EF]">
                                                    {/* Selected Customer Email Chips */}
                                                    {formData.allowedUserEmails.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF]">
                                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C306E] self-center mr-1">
                                                                Allowed ({formData.allowedUserEmails.length}):
                                                            </span>
                                                            {formData.allowedUserEmails.map((email) => (
                                                                <span
                                                                    key={email}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EFE0EF] text-[11px] font-bold text-[#6C306E] shadow-2xs"
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
                                                            className="px-3.5 py-1.5 rounded-xl bg-[#6C306E] text-white hover:bg-[#521C54] text-xs font-bold transition cursor-pointer shadow-2xs"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>

                                                    {/* Registered Customers List */}
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                Registered Accounts ({customers.length})
                                                            </span>
                                                            <input
                                                                type="text"
                                                                placeholder="Search customers..."
                                                                value={customerSearch}
                                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                                                className="px-2.5 py-1 bg-white border border-[#EFE0EF] rounded-lg text-[10px] text-[#241224] outline-none max-w-[180px]"
                                                            />
                                                        </div>

                                                        <div className="max-h-32 overflow-y-auto bg-white border border-[#EFE0EF] rounded-xl divide-y divide-[#EFE0EF]">
                                                            {filteredCustomers.length === 0 ? (
                                                                <p className="p-3 text-center text-slate-400 text-[11px]">No matching registered customers</p>
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
                                                                                <p className="font-bold text-xs text-[#241224] truncate">{c.name || 'Customer'}</p>
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

                                        {/* Card 5: Publish Status Switch */}
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs">
                                            <div>
                                                <p className="font-bold text-xs text-[#241224]">Storefront Visibility</p>
                                                <p className="text-[10.5px] text-slate-400">Enable this coupon to allow customers to apply it at checkout immediately</p>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer bg-[#FAF6FA] px-3.5 py-1.5 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E] transition">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="accent-[#6C306E] size-4 rounded cursor-pointer"
                                                />
                                                <span className="font-bold text-xs text-[#6C306E]">
                                                    {formData.isActive ? 'Active on Storefront' : 'Draft / Inactive'}
                                                </span>
                                            </label>
                                        </div>

                                    </div>

                                    {/* Right Column: High-End Live Interactive Voucher Card & Simulator */}
                                    <div className="lg:col-span-5 bg-[#FAF6FA]/50 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-[#EFE0EF]">
                                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6C306E] flex items-center gap-1.5">
                                                    <SparklesIcon size={12} color="#6C306E" />
                                                    Live Voucher Preview
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    Interactive Storefront View
                                                </span>
                                            </div>

                                            {/* Luxury Voucher Ticket Pass */}
                                            <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#6C306E] via-[#521C54] to-[#241224] text-white shadow-xl overflow-hidden border border-[#6C306E]/40">
                                                {/* Background Accent Rings */}
                                                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/5 pointer-events-none" />
                                                <div className="absolute -left-8 -bottom-8 size-32 rounded-full bg-white/5 pointer-events-none" />

                                                {/* Top Pass Details */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                                                            <CouponTicketIcon size={14} color="#FFFFFF" />
                                                        </div>
                                                        <span className="text-[10px] font-extrabold tracking-widest uppercase text-white/90">
                                                            UK Brand Lover
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Big Discount Value */}
                                                <div className="mb-3">
                                                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                                        {formData.discount || 0}
                                                        {formData.discountType === 'PERCENTAGE' ? '% OFF' : ` ${currency} OFF`}
                                                    </div>
                                                    <p className="text-[11px] text-white/80 font-medium mt-0.5 line-clamp-1">
                                                        {formData.description || 'Exclusive Authentic UK Beauty Privilege'}
                                                    </p>
                                                </div>

                                                {/* Coupon Code Box with Dashed Border */}
                                                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-dashed border-white/30 flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Voucher Code</p>
                                                        <p className="font-mono font-black text-base tracking-wider text-white">
                                                            {formData.code || 'COUPON_CODE'}
                                                        </p>
                                                    </div>
                                                    <div className="px-2 py-1 rounded-md bg-white/20 text-[10px] font-bold text-white">
                                                        Valid Code
                                                    </div>
                                                </div>

                                                {/* Voucher Rules List */}
                                                <div className="grid grid-cols-2 gap-2 text-[10px] text-white/80 pt-2 border-t border-white/15">
                                                    <div>
                                                        <span className="text-white/50 block">Min Subtotal:</span>
                                                        <span className="font-bold text-white">
                                                            {formData.minOrderAmount > 0 ? `${currency}${Number(formData.minOrderAmount).toLocaleString()}` : 'No Minimum'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/50 block">Max Savings:</span>
                                                        <span className="font-bold text-white">
                                                            {formData.discountType === 'PERCENTAGE' && formData.maxDiscount
                                                                ? `${currency}${Number(formData.maxDiscount).toLocaleString()}`
                                                                : (formData.discountType === 'PERCENTAGE' ? 'No Cap' : `Flat ${currency}${formData.discount}`)}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-white/50 block">Validity Period:</span>
                                                        <span className="font-bold text-white">
                                                            {formData.isLifetime
                                                                ? 'Lifetime (Never Expires)'
                                                                : (formData.expiresAt
                                                                    ? `Until ${new Date(formData.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                                    : 'Set expiration date')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Live Cart Calculation Breakdown */}
                                            <div className="p-4 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-[11px] text-[#241224] flex items-center gap-1.5">
                                                        <span className="size-2 rounded-full bg-[#6C306E]" />
                                                        Simulated Checkout Cart
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        Automatic math check
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div className="p-2 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF]">
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">Cart Total</p>
                                                        <p className="text-xs font-black text-[#241224]">{currency}{liveCalc.sampleCart.toLocaleString()}</p>
                                                    </div>
                                                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                                                        <p className="text-[9px] text-[#6C306E] font-bold uppercase">Discount</p>
                                                        <p className="text-xs font-black text-[#6C306E]">-{currency}{liveCalc.sampleDiscount.toLocaleString()}</p>
                                                    </div>
                                                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                                                        <p className="text-[9px] text-emerald-700 font-bold uppercase">Customer Pays</p>
                                                        <p className="text-xs font-black text-emerald-700">{currency}{liveCalc.sampleFinal.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <p className="text-[10.5px] text-slate-500 leading-normal pt-1 border-t border-[#EFE0EF]">
                                                    {liveCalc.isPct ? (
                                                        <span>Customer saves <strong>{liveCalc.discVal}%</strong> on eligible items{liveCalc.maxCap ? ` (capped at ${currency}${liveCalc.maxCap.toLocaleString()})` : ''}.</span>
                                                    ) : (
                                                        <span>Customer gets an exact <strong>{currency}{liveCalc.discVal} flat deduction</strong>.</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions Footer */}
                                <div className="px-5 sm:px-7 py-3.5 bg-white border-t border-[#EFE0EF] flex items-center justify-between shrink-0 gap-3">
                                    <div className="text-[11px] text-slate-500 hidden sm:block">
                                        {formData.isActive ? (
                                            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                Active voucher will be usable immediately at checkout
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                                <span className="size-1.5 rounded-full bg-slate-300" />
                                                Saved as paused draft
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2.5 ml-auto">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditorOpen(false)}
                                            className="px-4 py-2 rounded-full border border-[#EFE0EF] hover:bg-[#FAF6FA] text-slate-600 text-xs font-bold transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-6 py-2 rounded-full bg-[#6C306E] hover:bg-[#531E55] text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSaving && <span className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                            <span>{isSaving ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create & Publish Coupon')}</span>
                                        </button>
                                    </div>
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

