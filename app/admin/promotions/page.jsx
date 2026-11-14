'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import {
    ArrowRightIcon,
    CheckIcon,
    RefreshIcon,
    StoreFrontIcon,
    CameraIcon,
    RoyalCrownIcon
} from '@/components/icons'
import { DEFAULT_PROMOTIONS } from '@/lib/promotions'
import { setPromotions as setReduxPromotions } from '@/lib/features/product/productSlice'
import { broadcastStoreChange } from '@/lib/realtimeSync'

function ImageScaleControlSection({ cardKey, cardData, onUpdate }) {
    const scale = cardData.imageScale || 100
    const offsetY = cardData.imageOffsetY || 0

    return (
        <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Image Size / Scale Adjustment
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#6C306E] text-white">
                        {scale}%
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        onUpdate(cardKey, 'imageScale', 100)
                        onUpdate(cardKey, 'imageOffsetY', 0)
                    }}
                    className="text-[11px] font-semibold text-[#6C306E] hover:underline cursor-pointer"
                >
                    Reset to 100%
                </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
                Adjust the size of the image/model inside this box. The card dimensions stay strictly fixed while the image scales larger or smaller.
            </p>

            {/* Slider and - / + Nudge Controls */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onUpdate(cardKey, 'imageScale', Math.max(50, scale - 5))}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center transition shadow-2xs cursor-pointer text-sm shrink-0"
                    title="Make image 5% smaller"
                >
                    -
                </button>

                <input
                    type="range"
                    min="50"
                    max="250"
                    step="1"
                    value={scale}
                    onChange={(e) => onUpdate(cardKey, 'imageScale', Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#6C306E]"
                />

                <button
                    type="button"
                    onClick={() => onUpdate(cardKey, 'imageScale', Math.min(250, scale + 5))}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center transition shadow-2xs cursor-pointer text-sm shrink-0"
                    title="Make image 5% larger"
                >
                    +
                </button>

                <div className="flex items-center gap-1 w-20 shrink-0">
                    <input
                        type="number"
                        min="50"
                        max="250"
                        value={scale}
                        onChange={(e) => onUpdate(cardKey, 'imageScale', Math.max(50, Math.min(250, Number(e.target.value) || 100)))}
                        className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-[#241224] focus:outline-none focus:border-[#6C306E]"
                    />
                    <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
                {[
                    { label: '75% Small', val: 75 },
                    { label: '100% Default', val: 100 },
                    { label: '125% Medium', val: 125 },
                    { label: '150% Large', val: 150 },
                    { label: '175% Extra Large', val: 175 },
                    { label: '200% Maximum', val: 200 }
                ].map((p) => (
                    <button
                        key={p.val}
                        type="button"
                        onClick={() => onUpdate(cardKey, 'imageScale', p.val)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${scale === p.val
                                ? 'bg-[#6C306E] text-white border-[#6C306E] shadow-2xs'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Vertical Position Fine-tuning */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">Vertical Alignment:</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                        {offsetY > 0 ? `+${offsetY}% (Down)` : offsetY < 0 ? `${offsetY}% (Up)` : '0% (Standard)'}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                    <span className="text-[10px] text-slate-400 font-semibold">Up</span>
                    <input
                        type="range"
                        min="-40"
                        max="40"
                        step="1"
                        value={offsetY}
                        onChange={(e) => onUpdate(cardKey, 'imageOffsetY', Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#6C306E]"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">Down</span>
                    <button
                        type="button"
                        onClick={() => onUpdate(cardKey, 'imageOffsetY', 0)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-1"
                        title="Reset vertical shift"
                    >
                        0
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminHeroPromotionsPage() {
    const currency = '৳'
    const dispatch = useDispatch()
    const reduxCategories = useSelector(state => state.product?.categories)
    const [promotions, setPromotions] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_promotions') || '{}')
                if (cached && cached.mainCard) return cached
            } catch { }
        }
        return DEFAULT_PROMOTIONS
    })
    const [categories, setCategories] = useState(() => {
        if (Array.isArray(reduxCategories) && reduxCategories.length > 0) {
            return reduxCategories
        }
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_categories') || '[]')
                if (Array.isArray(cached) && cached.length > 0) return cached
            } catch { }
        }
        return []
    })
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('ukbl_cached_promotions')
            if (cached && cached !== '{}') return false
        }
        return true
    })
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
            // Only show initial spinner if no cache is present
            if (!promotions?.mainCard) setLoading(true)
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
                const active = data.categories.filter(c => c.isActive !== false && Boolean(c.name))
                setCategories(active)
                const activeNames = active.map(c => c.name).filter(Boolean)
                if (typeof window !== 'undefined' && activeNames.length > 0) {
                    localStorage.setItem('ukbl_cached_categories', JSON.stringify(activeNames))
                }
            }
        } catch (err) {
            console.error('Error fetching categories in promotions:', err)
        }
    }

    useEffect(() => {
        if (Array.isArray(reduxCategories) && reduxCategories.length > 0) {
            setCategories(reduxCategories)
        }
    }, [reduxCategories])

    useEffect(() => {
        fetchPromotions()
        fetchLiveCategories()

        // Real-time synchronization when categories change in /admin/categories
        const onCategoryUpdate = () => fetchLiveCategories()
        const onStorage = (e) => {
            if (e.key === 'ukbl_categories_synced' || e.key === 'ukbl_cached_categories') fetchLiveCategories()
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
        } catch { }

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
        const allCandidates = [...categories, ...(Array.isArray(reduxCategories) ? reduxCategories : [])]

        allCandidates.forEach(c => {
            const name = (typeof c === 'string' ? c : c?.name || '').trim()
            if (name && !seenNames.has(name.toLowerCase())) {
                seenNames.add(name.toLowerCase())
                links.push({
                    label: name,
                    url: `/shop?category=${encodeURIComponent(name)}`
                })
            }
        })

        links.push({ label: 'Contact', url: '/contact' })
        return links
    }, [categories, reduxCategories])

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
                dispatch(setReduxPromotions(data.promotions))
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
                    // Global Supabase Realtime broadcast to all visitors worldwide
                    broadcastStoreChange('promotions', { promotions: data.promotions })
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

            {/* 1:1 LIVE STOREFRONT PREVIEW (Exact match with website) */}
            <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[#241224] uppercase tracking-wider">
                            Storefront Preview
                        </h2>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Live Simulation
                        </span>
                    </div>
                    <div className="text-xs text-slate-400">
                        Click any box below to edit its content
                    </div>
                </div>

                {/* 3 Promos Grid matching Hero.jsx */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 pt-1">
                    {/* 1. Large Feature Card Preview */}
                    {mainCard?.isActive !== false && (
                        <div
                            onClick={() => setActiveTab('mainCard')}
                            className={`relative flex flex-col justify-between bg-gradient-to-br from-[#FAF6FA] via-[#FCF8FC] to-[#F7EEF7] rounded-3xl p-6 sm:p-8 md:p-10 border overflow-hidden min-h-[260px] sm:min-h-[340px] shadow-sm cursor-pointer transition-all duration-300 ${activeTab === 'mainCard' ? 'border-[#6C306E] ring-2 ring-[#6C306E]/20' : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                                }`}
                        >
                            {/* Subtle ambient light orb */}
                            <div className="absolute -top-12 -left-12 size-48 rounded-full bg-[#6C306E]/4 blur-2xl pointer-events-none" />

                            <div className="z-10 relative max-w-[58%] min-[400px]:max-w-[60%] sm:max-w-md">
                                {mainCard.badge && (
                                    <div className="inline-flex items-center gap-1.5 bg-white text-[#6C306E] border border-[#EFE0EF] px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-2.5 sm:mb-3 shadow-2xs">
                                        <RoyalCrownIcon size={12} color="#D8B56D" />
                                        <span>{mainCard.badge}</span>
                                    </div>
                                )}

                                <h3 className="text-base min-[360px]:text-lg min-[420px]:text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#241224] leading-tight sm:leading-snug tracking-tight">
                                    {mainCard.title} <br className="hidden sm:inline" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C306E] to-[#9956A1] font-semibold">
                                        {mainCard.titleHighlight}
                                    </span>
                                </h3>

                                {mainCard.description && (
                                    <p className="text-[11px] sm:text-sm text-slate-500 mt-1.5 sm:mt-2 font-normal leading-relaxed max-w-sm line-clamp-2 sm:line-clamp-none">
                                        {mainCard.description}
                                    </p>
                                )}

                                {(mainCard.priceLabel || mainCard.priceValue) && (
                                    <div className="flex items-baseline gap-2 mt-3 sm:mt-4">
                                        {mainCard.priceLabel && (
                                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                {mainCard.priceLabel}
                                            </span>
                                        )}
                                        {mainCard.priceValue && (
                                            <span className="text-base sm:text-2xl font-extrabold text-[#3A0C38]">
                                                {currency}{mainCard.priceValue.replace(/^[৳$£\s]+/, '')}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="mt-3.5 sm:mt-5">
                                    <span className="inline-flex items-center justify-center px-6 sm:px-8 h-9 sm:h-11 text-xs sm:text-sm font-bold bg-[#6C306E] text-white rounded-full shadow-md transition">
                                        {mainCard.buttonText || "Explore Collection"}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute right-0 bottom-0 top-0 h-full flex items-end justify-end pointer-events-none z-0 overflow-hidden rounded-r-3xl">
                                {mainCard.image && (
                                    <div
                                        className="h-full flex items-end justify-end"
                                        style={{
                                            transform: `scale(${(mainCard.imageScale || 100) / 100}) translateY(${mainCard.imageOffsetY || 0}%)`,
                                            transformOrigin: 'right bottom'
                                        }}
                                    >
                                        <img
                                            src={mainCard.image}
                                            alt="Main Card Preview"
                                            className="h-full max-h-full w-auto object-contain object-right-bottom translate-y-0.5 transition-transform duration-100"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2 & 3. Side Cards Preview */}
                    <div className="flex flex-col gap-4 text-xs justify-between">
                        {/* Top Side Card */}
                        {sideCardTop?.isActive !== false && (
                            <div
                                onClick={() => setActiveTab('sideCardTop')}
                                className={`flex items-center justify-between w-full h-full bg-[#FAF6FA] hover:bg-[#FAF3FA] rounded-3xl p-5 sm:p-6 border transition-all duration-300 cursor-pointer relative overflow-hidden min-h-[155px] sm:min-h-[165px] ${activeTab === 'sideCardTop' ? 'border-[#6C306E] ring-2 ring-[#6C306E]/20' : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                                    }`}
                            >
                                <div className="z-10 max-w-[56%] pr-1">
                                    {sideCardTop.tag && (
                                        <span className="text-[9px] sm:text-[10px] font-extrabold text-[#6C306E] uppercase tracking-widest block mb-1">
                                            {sideCardTop.tag}
                                        </span>
                                    )}
                                    <h4 className="text-base sm:text-xl font-bold text-[#241224] tracking-tight">
                                        {sideCardTop.title}
                                    </h4>
                                    <p className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-[#6C306E]">
                                        {sideCardTop.buttonText || "Shop Skincare"}
                                        <ArrowRightIcon size={12} color="#6C306E" />
                                    </p>
                                </div>

                                <div className="w-[48%] h-full flex items-end justify-end relative shrink-0 pointer-events-none overflow-hidden">
                                    {sideCardTop.image && (
                                        <div
                                            className="h-full flex items-end justify-end"
                                            style={{
                                                transform: `scale(${(sideCardTop.imageScale || 100) / 100}) translateY(${sideCardTop.imageOffsetY || 0}%)`,
                                                transformOrigin: 'right bottom'
                                            }}
                                        >
                                            <img
                                                src={sideCardTop.image}
                                                alt="Top Card Preview"
                                                className="h-full max-h-full w-auto object-contain object-right-bottom translate-y-0.5 transition-transform duration-100"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bottom Side Card */}
                        {sideCardBottom?.isActive !== false && (
                            <div
                                onClick={() => setActiveTab('sideCardBottom')}
                                className={`flex items-center justify-between w-full h-full bg-[#FAF6FA] hover:bg-[#FAF3FA] rounded-3xl p-5 sm:p-6 border transition-all duration-300 cursor-pointer relative overflow-hidden min-h-[155px] sm:min-h-[165px] ${activeTab === 'sideCardBottom' ? 'border-[#6C306E] ring-2 ring-[#6C306E]/20' : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                                    }`}
                            >
                                <div className="z-10 max-w-[56%] pr-1">
                                    {sideCardBottom.tag && (
                                        <span className="text-[9px] sm:text-[10px] font-extrabold text-[#D8B56D] uppercase tracking-widest block mb-1">
                                            {sideCardBottom.tag}
                                        </span>
                                    )}
                                    <h4 className="text-base sm:text-xl font-bold text-[#241224] tracking-tight">
                                        {sideCardBottom.title}
                                    </h4>
                                    <p className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-[#6C306E]">
                                        {sideCardBottom.buttonText || "Shop Makeup"}
                                        <ArrowRightIcon size={12} color="#6C306E" />
                                    </p>
                                </div>

                                <div className="w-[48%] h-full flex items-end justify-end relative shrink-0 pointer-events-none overflow-hidden">
                                    {sideCardBottom.image && (
                                        <div
                                            className="h-full flex items-end justify-end"
                                            style={{
                                                transform: `scale(${(sideCardBottom.imageScale || 100) / 100}) translateY(${sideCardBottom.imageOffsetY || 0}%)`,
                                                transformOrigin: 'right bottom'
                                            }}
                                        >
                                            <img
                                                src={sideCardBottom.image}
                                                alt="Bottom Card Preview"
                                                className="h-full max-h-full w-auto object-contain object-right-bottom translate-y-0.5 transition-transform duration-100"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CARD SELECTOR TABS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                    type="button"
                    onClick={() => setActiveTab('mainCard')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${activeTab === 'mainCard'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${activeTab === 'mainCard' ? 'bg-plum text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                                }`}>
                                1
                            </span>
                            <span className="font-display font-bold text-sm text-slate-900">
                                Main Feature Box
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mainCard.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${activeTab === 'sideCardTop'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${activeTab === 'sideCardTop' ? 'bg-plum text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                                }`}>
                                2
                            </span>
                            <span className="font-display font-bold text-sm text-slate-900">
                                Top Side Box
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sideCardTop.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${activeTab === 'sideCardBottom'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs ${activeTab === 'sideCardBottom' ? 'bg-plum text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                                }`}>
                                3
                            </span>
                            <span className="font-display font-bold text-sm text-slate-900">
                                Bottom Side Box
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sideCardBottom.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
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
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${isSelected
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
                                            onClick={() => handleUpdateCardField('mainCard', 'image', '')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            Remove Image
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

                        {/* Image Size / Scale Adjustment */}
                        <ImageScaleControlSection cardKey="mainCard" cardData={mainCard} onUpdate={handleUpdateCardField} />
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
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${isSelected
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
                                            onClick={() => handleUpdateCardField('sideCardTop', 'image', '')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            Remove Image
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

                        {/* Image Size / Scale Adjustment */}
                        <ImageScaleControlSection cardKey="sideCardTop" cardData={sideCardTop} onUpdate={handleUpdateCardField} />
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
                                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${isSelected
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
                                            onClick={() => handleUpdateCardField('sideCardBottom', 'image', '')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                                        >
                                            Remove Image
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

                        {/* Image Size / Scale Adjustment */}
                        <ImageScaleControlSection cardKey="sideCardBottom" cardData={sideCardBottom} onUpdate={handleUpdateCardField} />
                    </div>
                )}
            </div>
        </div>
    )
}
