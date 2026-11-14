'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
    ArrowRightIcon,
    CheckIcon,
    RefreshIcon,
    StoreFrontIcon,
    CameraIcon
} from '@/components/icons'
import { DEFAULT_PROMOTIONS } from '@/lib/promotions'

export default function AdminHeroPromotionsPage() {
    const currency = '৳'
    const [promotions, setPromotions] = useState(DEFAULT_PROMOTIONS)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('mainCard') // 'mainCard' | 'sideCardTop' | 'sideCardBottom'

    // Image uploading state per card
    const [uploadingTarget, setUploadingTarget] = useState(null)
    const mainFileInputRef = useRef(null)
    const topFileInputRef = useRef(null)
    const bottomFileInputRef = useRef(null)

    // 1. Fetch initial promotions from API
    const fetchPromotions = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/promotions?_t=${Date.now()}`, {
                cache: 'no-store'
            })
            const data = await res.json()
            if (data.success && data.promotions) {
                setPromotions({
                    mainCard: { ...DEFAULT_PROMOTIONS.mainCard, ...(data.promotions.mainCard || {}) },
                    sideCardTop: { ...DEFAULT_PROMOTIONS.sideCardTop, ...(data.promotions.sideCardTop || {}) },
                    sideCardBottom: { ...DEFAULT_PROMOTIONS.sideCardBottom, ...(data.promotions.sideCardBottom || {}) }
                })
            } else {
                toast.error(data.message || 'Failed to load promotional boxes')
            }
        } catch (err) {
            console.error('Error fetching admin promotions:', err)
            toast.error('Network error loading promotional boxes')
        } finally {
            setLoading(false)
        }
    }

    // 2. Fetch live shop categories for quick destination link auto-fill
    const fetchLiveCategories = async () => {
        try {
            const res = await fetch(`/api/categories?all=true&_t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.categories)) {
                setCategories(data.categories.filter(c => c.isActive !== false && Boolean(c.name)))
            }
        } catch (err) {
            console.error('Error fetching categories in promotions:', err)
        }
    }

    useEffect(() => {
        fetchPromotions()
        fetchLiveCategories()

        // Real-time synchronization when categories change in /admin/categories
        const onCategoryUpdate = () => fetchLiveCategories()
        const onStorage = (e) => {
            if (e.key === 'ukbl_categories_synced') fetchLiveCategories()
        }

        window.addEventListener('category-catalog-updated', onCategoryUpdate)
        window.addEventListener('storage', onStorage)

        let bc
        try {
            bc = new BroadcastChannel('ukbl_catalog_channel')
            bc.onmessage = (msg) => {
                if (msg.data?.type === 'category-updated' || msg.data?.type === 'category-catalog-updated') {
                    fetchLiveCategories()
                }
            }
        } catch {}

        return () => {
            window.removeEventListener('category-catalog-updated', onCategoryUpdate)
            window.removeEventListener('storage', onStorage)
            if (bc) bc.close()
        }
    }, [])

    // Dynamic destination suggestions including /shop, all database categories, and Contact
    const quickLinks = useMemo(() => {
        const links = [
            { label: '/shop', url: '/shop' }
        ]

        const seenNames = new Set()
        categories.forEach(c => {
            const name = (c.name || '').trim()
            if (name && !seenNames.has(name.toLowerCase())) {
                seenNames.add(name.toLowerCase())
                links.push({
                    label: name,
                    url: `/shop?category=${encodeURIComponent(name)}`
                })
            }
        })

        if (links.length === 1) {
            ['Skincare', 'Makeup', 'Haircare', 'Fragrance'].forEach(name => {
                links.push({
                    label: name,
                    url: `/shop?category=${encodeURIComponent(name)}`
                })
            })
        }

        links.push({ label: 'Contact', url: '/contact' })
        return links
    }, [categories])

    // --- Update Handler for Any Field in Any of the 3 Cards ---
    const handleUpdateCardField = (cardKey, field, value) => {
        setPromotions(prev => ({
            ...prev,
            [cardKey]: {
                ...prev[cardKey],
                [field]: value
            }
        }))
    }

    // --- Image Upload Handler ---
    const handleImageUpload = async (cardKey, file) => {
        if (!file) return

        try {
            setUploadingTarget(cardKey)
            const uploadToast = toast.loading('Uploading card image in full resolution...')

            const uploadData = new FormData()
            uploadData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            })
            const data = await res.json()

            if (data.success && data.url) {
                handleUpdateCardField(cardKey, 'image', data.url)
                toast.success('Image uploaded successfully!', { id: uploadToast })
            } else {
                toast.error(data.message || 'Failed to upload image', { id: uploadToast })
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('Image upload failed')
        } finally {
            setUploadingTarget(null)
        }
    }

    // --- Save & Publish All 3 Boxes to PostgreSQL Database & Broadcast Everywhere ---
    const handleSaveAndPublish = async () => {
        try {
            setSaving(true)
            const toastId = toast.loading('Publishing promotional cards to database & server...')

            const res = await fetch('/api/admin/promotions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promotions)
            })

            const data = await res.json()

            if (data.success && data.promotions) {
                setPromotions(data.promotions)
                toast.success('Promotional boxes published! All storefront visitors now see your updates.', { id: toastId })

                // Instant synchronization across all tabs and user windows
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('ukbl_cached_promotions', JSON.stringify(data.promotions))
                        localStorage.setItem('ukbl_promotions_synced', Date.now().toString())
                        window.dispatchEvent(new CustomEvent('hero-promotions-updated'))

                        const bc = new BroadcastChannel('ukbl_catalog_channel')
                        bc.postMessage({
                            type: 'promotions-updated',
                            promotions: data.promotions
                        })
                    } catch (syncErr) {
                        console.error('Client sync error:', syncErr)
                    }
                }
            } else {
                toast.error(data.message || 'Failed to publish changes', { id: toastId })
            }
        } catch (err) {
            console.error('Error saving promotions:', err)
            toast.error('Network error saving changes')
        } finally {
            setSaving(false)
        }
    }

    // Reset to initial brand defaults
    const handleResetDefaults = () => {
        if (confirm('Reset all 3 hero promotional cards to original UK Brand Lover default text and images?')) {
            setPromotions(DEFAULT_PROMOTIONS)
            toast.success('Reset to default values. Click "Save & Publish All" to commit.')
        }
    }

    const { mainCard, sideCardTop, sideCardBottom } = promotions
    const currentCard = promotions[activeTab] || mainCard

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                        Hero Promotional Boxes
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 h-9 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs shrink-0"
                    >
                        <StoreFrontIcon size={14} color="#6C306E" />
                        <span>View Storefront</span>
                        <ArrowRightIcon size={12} />
                    </Link>

                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="inline-flex items-center gap-1.5 px-4 py-2 h-9 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs cursor-pointer shrink-0"
                        title="Reset to default brand layout"
                    >
                        <RefreshIcon size={14} />
                        <span>Reset Defaults</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveAndPublish}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 h-9 rounded-xl text-xs font-semibold text-white bg-plum hover:bg-plum-hover transition shadow-sm disabled:opacity-75 cursor-pointer shrink-0 min-w-[150px]"
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                                <span>Publishing...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon size={14} className="shrink-0" />
                                <span>Save & Publish All</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* CARD SELECTOR TABS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                    type="button"
                    onClick={() => setActiveTab('mainCard')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === 'mainCard'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                                activeTab === 'mainCard' ? 'bg-plum text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}>
                                1
                            </span>
                            <span className="font-display font-bold text-sm text-slate-900">
                                Main Feature Box
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            mainCard.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                            {mainCard.isActive !== false ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 truncate">
                        {mainCard.title || 'Curated UK Beauty'} {mainCard.titleHighlight || ''}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('sideCardTop')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === 'sideCardTop'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                                activeTab === 'sideCardTop' ? 'bg-plum text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}>
                                2
                            </span>
                            <span className="font-display font-bold text-sm text-slate-900">
                                Top Side Box
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            sideCardTop.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                            {sideCardTop.isActive !== false ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 truncate">
                        {sideCardTop.tag ? `${sideCardTop.tag} • ` : ''}{sideCardTop.title || 'Skincare'}
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('sideCardBottom')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeTab === 'sideCardBottom'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                                activeTab === 'sideCardBottom' ? 'bg-plum text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}>
                                3
                            </span>
                            <span className="font-display font-bold text-sm text-slate-900">
                                Bottom Side Box
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            sideCardBottom.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                            {sideCardBottom.isActive !== false ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 truncate">
                        {sideCardBottom.tag ? `${sideCardBottom.tag} • ` : ''}{sideCardBottom.title || 'Cosmetics'}
                    </p>
                </button>
            </div>

            {/* TAB CONTENT EDITORS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-6">
                {/* 1. MAIN LARGE FEATURE CARD EDITOR */}
                {activeTab === 'mainCard' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold font-display text-slate-900">
                                    Edit Main Feature Box (Large Left Card)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Headline copy, sub-headline, price badge, and collection CTA button.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={mainCard.isActive !== false}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'isActive', e.target.checked)}
                                    className="w-4 h-4 rounded text-plum accent-plum focus:ring-plum/30 border-slate-300 transition cursor-pointer"
                                />
                                <span>Visible on Storefront</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Badge */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Top Badge Tag
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.badge || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'badge', e.target.value)}
                                    placeholder="e.g. 100% Original UK Imports"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            {/* Headline Line 1 */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Main Headline (Line 1) *
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.title || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'title', e.target.value)}
                                    placeholder="e.g. Curated UK Beauty."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            {/* Headline Line 2 Highlight */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Highlighted Sub-Headline (Gradient Line 2)
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.titleHighlight || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'titleHighlight', e.target.value)}
                                    placeholder="e.g. Delivered in Bangladesh."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-plum focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            {/* Starting Price Value */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Price Tag Label
                                    </label>
                                    <input
                                        type="text"
                                        value={mainCard.priceLabel || ''}
                                        onChange={(e) => handleUpdateCardField('mainCard', 'priceLabel', e.target.value)}
                                        placeholder="e.g. Prices start at"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Starting Price Amount (৳)
                                    </label>
                                    <input
                                        type="text"
                                        value={mainCard.priceValue || ''}
                                        onChange={(e) => handleUpdateCardField('mainCard', 'priceValue', e.target.value)}
                                        placeholder="e.g. 1,650"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-plum focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Description Paragraph
                            </label>
                            <textarea
                                rows={2}
                                value={mainCard.description || ''}
                                onChange={(e) => handleUpdateCardField('mainCard', 'description', e.target.value)}
                                placeholder="e.g. Authentic dermatological skincare, cult cosmetics, and hair perfectors imported directly from the UK."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                            />
                        </div>

                        {/* Button Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Button Text Label
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.buttonText || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'buttonText', e.target.value)}
                                    placeholder="e.g. Explore Collection"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Button Target Redirect URL
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Click suggestion to auto-fill
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={mainCard.buttonLink || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'buttonLink', e.target.value)}
                                    placeholder="e.g. /shop or /shop?category=Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />

                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {quickLinks.map((item, idx) => {
                                        const isSelected = (mainCard.buttonLink || '') === item.url
                                        return (
                                            <button
                                                key={`${item.label}-${idx}`}
                                                type="button"
                                                onClick={() => handleUpdateCardField('mainCard', 'buttonLink', item.url)}
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-plum text-white border-plum shadow-2xs'
                                                        : 'text-plum bg-purple-50/60 border-purple-100 hover:bg-purple-100 hover:border-plum/30'
                                                }`}
                                                title={`Set URL to: ${item.url}`}
                                            >
                                                {item.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Image Upload for Main Card */}
                        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3">
                            <label className="block text-xs font-semibold text-slate-700">
                                Feature Card Image (Model Photo or Transparent PNG)
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 relative shrink-0 overflow-hidden flex items-center justify-center shadow-2xs p-1">
                                    {mainCard.image ? (
                                        <Image
                                            src={mainCard.image}
                                            alt={mainCard.title || 'Main Card Image'}
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    ) : (
                                        <CameraIcon size={24} color="#94A3B8" />
                                    )}
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={mainFileInputRef}
                                            onChange={(e) => handleImageUpload('mainCard', e.target.files?.[0])}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => mainFileInputRef.current?.click()}
                                            disabled={uploadingTarget === 'mainCard'}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-plum hover:bg-plum-hover transition shadow-2xs disabled:opacity-50 cursor-pointer"
                                        >
                                            {uploadingTarget === 'mainCard' ? 'Uploading...' : 'Upload New Image'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCardField('mainCard', 'image', '/images/hero/hero_card_img1.png')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            Restore Default
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={mainCard.image || ''}
                                        onChange={(e) => handleUpdateCardField('mainCard', 'image', e.target.value)}
                                        placeholder="Or paste direct image URL (e.g. /images/hero/hero_card_img1.png)"
                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 focus:outline-hidden focus:border-plum"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TOP SMALL SIDE CARD EDITOR */}
                {activeTab === 'sideCardTop' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold font-display text-slate-900">
                                    Edit Top Side Box
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Appears in the upper right position of the hero promotional section.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={sideCardTop.isActive !== false}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'isActive', e.target.checked)}
                                    className="w-4 h-4 rounded text-plum accent-plum focus:ring-plum/30 border-slate-300 transition cursor-pointer"
                                />
                                <span>Visible on Storefront</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Eyebrow Tag
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.tag || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'tag', e.target.value)}
                                    placeholder="e.g. TOP SELECTED"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-plum focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Card Title *
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.title || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'title', e.target.value)}
                                    placeholder="e.g. Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Button / Link Text
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.buttonText || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'buttonText', e.target.value)}
                                    placeholder="e.g. Shop Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Button Target Redirect URL
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Click suggestion to auto-fill
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={sideCardTop.buttonLink || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'buttonLink', e.target.value)}
                                    placeholder="e.g. /shop?category=Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />

                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {quickLinks.map((item, idx) => {
                                        const isSelected = (sideCardTop.buttonLink || '') === item.url
                                        return (
                                            <button
                                                key={`${item.label}-${idx}`}
                                                type="button"
                                                onClick={() => handleUpdateCardField('sideCardTop', 'buttonLink', item.url)}
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-plum text-white border-plum shadow-2xs'
                                                        : 'text-plum bg-purple-50/60 border-purple-100 hover:bg-purple-100 hover:border-plum/30'
                                                }`}
                                                title={`Set URL to: ${item.url}`}
                                            >
                                                {item.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Image Upload for Top Side Card */}
                        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3">
                            <label className="block text-xs font-semibold text-slate-700">
                                Card Product Image
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 relative shrink-0 overflow-hidden flex items-center justify-center shadow-2xs p-1">
                                    {sideCardTop.image ? (
                                        <Image
                                            src={sideCardTop.image}
                                            alt={sideCardTop.title || 'Side Card Top'}
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    ) : (
                                        <CameraIcon size={24} color="#94A3B8" />
                                    )}
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={topFileInputRef}
                                            onChange={(e) => handleImageUpload('sideCardTop', e.target.files?.[0])}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => topFileInputRef.current?.click()}
                                            disabled={uploadingTarget === 'sideCardTop'}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-plum hover:bg-plum-hover transition shadow-2xs disabled:opacity-50 cursor-pointer"
                                        >
                                            {uploadingTarget === 'sideCardTop' ? 'Uploading...' : 'Upload New Image'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCardField('sideCardTop', 'image', '/images/hero/hero_card_img2.png')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            Restore Default
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={sideCardTop.image || ''}
                                        onChange={(e) => handleUpdateCardField('sideCardTop', 'image', e.target.value)}
                                        placeholder="Or paste direct image URL (e.g. /images/hero/hero_card_img2.png)"
                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 focus:outline-hidden focus:border-plum"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. BOTTOM SMALL SIDE CARD EDITOR */}
                {activeTab === 'sideCardBottom' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold font-display text-slate-900">
                                    Edit Bottom Side Box
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Appears in the lower right position of the hero promotional section.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={sideCardBottom.isActive !== false}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'isActive', e.target.checked)}
                                    className="w-4 h-4 rounded text-plum accent-plum focus:ring-plum/30 border-slate-300 transition cursor-pointer"
                                />
                                <span>Visible on Storefront</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Eyebrow Tag
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.tag || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'tag', e.target.value)}
                                    placeholder="e.g. EXCLUSIVE DEALS"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Card Title *
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.title || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'title', e.target.value)}
                                    placeholder="e.g. Cosmetics"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Button / Link Text
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.buttonText || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'buttonText', e.target.value)}
                                    placeholder="e.g. Shop Makeup"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Button Target Redirect URL
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        Click suggestion to auto-fill
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={sideCardBottom.buttonLink || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'buttonLink', e.target.value)}
                                    placeholder="e.g. /shop?category=Makeup"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20 transition"
                                />

                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                    {quickLinks.map((item, idx) => {
                                        const isSelected = (sideCardBottom.buttonLink || '') === item.url
                                        return (
                                            <button
                                                key={`${item.label}-${idx}`}
                                                type="button"
                                                onClick={() => handleUpdateCardField('sideCardBottom', 'buttonLink', item.url)}
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-plum text-white border-plum shadow-2xs'
                                                        : 'text-plum bg-purple-50/60 border-purple-100 hover:bg-purple-100 hover:border-plum/30'
                                                }`}
                                                title={`Set URL to: ${item.url}`}
                                            >
                                                {item.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Image Upload for Bottom Side Card */}
                        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-3">
                            <label className="block text-xs font-semibold text-slate-700">
                                Card Product Image
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 relative shrink-0 overflow-hidden flex items-center justify-center shadow-2xs p-1">
                                    {sideCardBottom.image ? (
                                        <Image
                                            src={sideCardBottom.image}
                                            alt={sideCardBottom.title || 'Side Card Bottom'}
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    ) : (
                                        <CameraIcon size={24} color="#94A3B8" />
                                    )}
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={bottomFileInputRef}
                                            onChange={(e) => handleImageUpload('sideCardBottom', e.target.files?.[0])}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => bottomFileInputRef.current?.click()}
                                            disabled={uploadingTarget === 'sideCardBottom'}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-plum hover:bg-plum-hover transition shadow-2xs disabled:opacity-50 cursor-pointer"
                                        >
                                            {uploadingTarget === 'sideCardBottom' ? 'Uploading...' : 'Upload New Image'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCardField('sideCardBottom', 'image', '/images/hero/hero_card_img3.png')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            Restore Default
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={sideCardBottom.image || ''}
                                        onChange={(e) => handleUpdateCardField('sideCardBottom', 'image', e.target.value)}
                                        placeholder="Or paste direct image URL (e.g. /images/hero/hero_card_img3.png)"
                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 focus:outline-hidden focus:border-plum"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
