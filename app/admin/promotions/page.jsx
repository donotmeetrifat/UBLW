'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
    RoyalCrownIcon,
    ArrowRightIcon,
    CloseIcon,
    CheckIcon,
    RefreshIcon,
    StoreFrontIcon,
    UploadCloudIcon,
    TagIcon,
    SparklesIcon,
    CameraIcon,
    TrashIcon,
    EyeIcon
} from '@/components/icons'
import ClassicLoader from '@/components/ui/classic-loader'
import { DEFAULT_PROMOTIONS } from '@/lib/promotions'

const QUICK_LINKS = [
    { label: 'All Shop Catalog', url: '/shop' },
    { label: 'Skincare Collection', url: '/shop?category=Skincare' },
    { label: 'Makeup & Cosmetics', url: '/shop?category=Makeup' },
    { label: 'Haircare Treatments', url: '/shop?category=Haircare' },
    { label: 'Fragrance & Body', url: '/shop?category=Fragrance' },
    { label: 'Contact Advisory', url: '/contact' }
]

export default function AdminHeroPromotionsPage() {
    const currency = '৳'
    const [promotions, setPromotions] = useState(DEFAULT_PROMOTIONS)
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

    useEffect(() => {
        fetchPromotions()
    }, [])

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
            const uploadToast = toast.loading('Uploading card image in full high resolution...')

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
            toast.success('Reset to default values. Click "Save & Publish" to commit.')
        }
    }

    const { mainCard, sideCardTop, sideCardBottom } = promotions

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#6C306E] bg-[#FAF6FA] px-2.5 py-1 rounded-full border border-[#EFE0EF]">
                            Hero Promotional Studio
                        </span>
                        <span className="text-slate-400 text-xs">• Live Database Sync</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">
                        Hero Promotional Boxes Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                        Edit all images, campaign titles, subtitles, price tags, button names, and click redirect URLs for the 3 homepage feature boxes. All changes publish live across the entire website instantly.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:text-[#6C306E] transition shadow-2xs"
                    >
                        <StoreFrontIcon size={14} color="#6C306E" />
                        <span>View Storefront</span>
                        <ArrowRightIcon size={12} />
                    </Link>

                    <button
                        onClick={handleResetDefaults}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-[#EFE0EF] transition"
                        title="Reset to default brand layout"
                    >
                        <RefreshIcon size={14} />
                        <span>Reset Defaults</span>
                    </button>

                    <button
                        onClick={handleSaveAndPublish}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-linear-to-r from-[#6C306E] to-[#4A1D4C] hover:from-[#5A255C] hover:to-[#381439] shadow-md shadow-[#6C306E]/20 transition disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <ClassicLoader />
                                <span>Publishing to Website...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon size={15} />
                                <span>Save & Publish All</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 1:1 LIVE STOREFRONT INTERACTIVE PREVIEW */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-[#241224]">
                                1:1 Live Storefront Preview
                            </h2>
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Real-Time Simulation
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Exact representation of the 3 promotional feature boxes as seen by visiting customers.
                        </p>
                    </div>

                    <div className="text-xs font-bold text-[#6C306E] bg-[#FAF6FA] px-3 py-1 rounded-full border border-[#EFE0EF]">
                        Interactive Card Links Active
                    </div>
                </div>

                {/* THE 3 STOREFRONT BOXES PREVIEW */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 pt-1">
                    {/* 1. Large Feature Card Preview */}
                    <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#FAF6FA] via-[#FCF8FC] to-[#F7EEF7] rounded-3xl p-6 sm:p-8 border border-[#EFE0EF] overflow-hidden min-h-[260px] sm:min-h-[320px] shadow-sm">
                        <div className="z-10 max-w-[58%]">
                            {mainCard.badge && (
                                <div className="inline-flex items-center gap-1.5 bg-white text-[#6C306E] border border-[#EFE0EF] px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-3 shadow-2xs">
                                    <RoyalCrownIcon size={12} color="#D8B56D" />
                                    <span>{mainCard.badge}</span>
                                </div>
                            )}

                            <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#241224] leading-snug tracking-tight">
                                {mainCard.title} <br className="hidden sm:inline" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C306E] to-[#9956A1]">
                                    {mainCard.titleHighlight}
                                </span>
                            </h3>

                            {mainCard.description && (
                                <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed line-clamp-2">
                                    {mainCard.description}
                                </p>
                            )}

                            {(mainCard.priceLabel || mainCard.priceValue) && (
                                <div className="flex items-baseline gap-2 mt-3">
                                    {mainCard.priceLabel && (
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                            {mainCard.priceLabel}
                                        </span>
                                    )}
                                    {mainCard.priceValue && (
                                        <span className="text-base sm:text-xl font-extrabold text-[#3A0C38]">
                                            {currency}{mainCard.priceValue.replace(/^[৳$£\s]+/, '')}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mt-4">
                                <span className="inline-flex items-center justify-center px-6 h-10 rounded-full text-xs font-bold text-white bg-linear-to-r from-[#6C306E] to-[#401242] shadow-sm">
                                    {mainCard.buttonText || 'Explore Collection'} →
                                </span>
                            </div>
                        </div>

                        {/* Large Image on Right */}
                        <div className="absolute right-0 bottom-0 top-0 w-[42%] max-w-[280px] flex items-end justify-end pointer-events-none z-0 overflow-hidden">
                            {mainCard.image ? (
                                <Image
                                    className="h-full max-h-full w-auto object-contain object-right-bottom"
                                    src={mainCard.image}
                                    alt={mainCard.imageAlt || 'Hero Feature'}
                                    width={260}
                                    height={320}
                                    unoptimized
                                />
                            ) : (
                                <div className="text-slate-300 text-xs p-4">No Image</div>
                            )}
                        </div>
                    </div>

                    {/* 2 & 3. Secondary Side Cards Preview */}
                    <div className="flex flex-col gap-4 justify-between">
                        {/* Top Side Card */}
                        <div className="flex items-center justify-between w-full bg-[#FAF6FA] rounded-3xl p-5 border border-[#EFE0EF] min-h-[145px] relative overflow-hidden">
                            <div className="z-10 max-w-[55%] pr-1">
                                {sideCardTop.tag && (
                                    <span className="text-[9px] font-extrabold text-[#6C306E] uppercase tracking-widest block mb-1">
                                        {sideCardTop.tag}
                                    </span>
                                )}
                                <h4 className="text-base sm:text-xl font-bold text-[#241224] tracking-tight">
                                    {sideCardTop.title}
                                </h4>
                                <p className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#6C306E]">
                                    <span>{sideCardTop.buttonText || 'Shop Skincare'}</span>
                                    <ArrowRightIcon size={12} color="#6C306E" />
                                </p>
                            </div>

                            <div className="w-[45%] h-full flex items-end justify-end relative shrink-0 overflow-hidden pointer-events-none">
                                {sideCardTop.image ? (
                                    <Image
                                        className="h-full max-h-full w-auto object-contain object-right-bottom"
                                        src={sideCardTop.image}
                                        alt={sideCardTop.title || 'Side Card 1'}
                                        width={140}
                                        height={130}
                                        unoptimized
                                    />
                                ) : (
                                    <div className="text-slate-300 text-xs">No Image</div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Side Card */}
                        <div className="flex items-center justify-between w-full bg-[#FAF6FA] rounded-3xl p-5 border border-[#EFE0EF] min-h-[145px] relative overflow-hidden">
                            <div className="z-10 max-w-[55%] pr-1">
                                {sideCardBottom.tag && (
                                    <span className="text-[9px] font-extrabold text-[#D8B56D] uppercase tracking-widest block mb-1">
                                        {sideCardBottom.tag}
                                    </span>
                                )}
                                <h4 className="text-base sm:text-xl font-bold text-[#241224] tracking-tight">
                                    {sideCardBottom.title}
                                </h4>
                                <p className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#6C306E]">
                                    <span>{sideCardBottom.buttonText || 'Shop Makeup'}</span>
                                    <ArrowRightIcon size={12} color="#6C306E" />
                                </p>
                            </div>

                            <div className="w-[45%] h-full flex items-end justify-end relative shrink-0 overflow-hidden pointer-events-none">
                                {sideCardBottom.image ? (
                                    <Image
                                        className="h-full max-h-full w-auto object-contain object-right-bottom"
                                        src={sideCardBottom.image}
                                        alt={sideCardBottom.title || 'Side Card 2'}
                                        width={140}
                                        height={130}
                                        unoptimized
                                    />
                                ) : (
                                    <div className="text-slate-300 text-xs">No Image</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Marquee Quick Status Banner */}
                <div className="mt-4 p-4 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-slate-600 font-semibold">
                            <strong>Running Category Slider:</strong> Placed directly beneath these 3 boxes. All categories update automatically from the Category Catalog.
                        </span>
                    </div>
                    <Link
                        href="/admin/categories"
                        className="inline-flex items-center gap-1 font-bold text-[#6C306E] hover:underline shrink-0"
                    >
                        <span>Manage Categories & Order</span>
                        <ArrowRightIcon size={12} />
                    </Link>
                </div>
            </div>

            {/* CARD SELECTOR TABS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                    onClick={() => setActiveTab('mainCard')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        activeTab === 'mainCard'
                            ? 'bg-white border-[#6C306E] shadow-sm ring-2 ring-[#6C306E]/20'
                            : 'bg-white/80 border-[#EFE0EF] hover:bg-white'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-[#6C306E] text-white flex items-center justify-center font-bold text-xs">
                            1
                        </span>
                        <span className="font-extrabold text-sm text-[#241224]">
                            Main Feature Box
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {mainCard.title} {mainCard.titleHighlight}
                    </p>
                </button>

                <button
                    onClick={() => setActiveTab('sideCardTop')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        activeTab === 'sideCardTop'
                            ? 'bg-white border-[#6C306E] shadow-sm ring-2 ring-[#6C306E]/20'
                            : 'bg-white/80 border-[#EFE0EF] hover:bg-white'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-[#6C306E] text-white flex items-center justify-center font-bold text-xs">
                            2
                        </span>
                        <span className="font-extrabold text-sm text-[#241224]">
                            Top Side Box
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {sideCardTop.tag} • {sideCardTop.title}
                    </p>
                </button>

                <button
                    onClick={() => setActiveTab('sideCardBottom')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                        activeTab === 'sideCardBottom'
                            ? 'bg-white border-[#6C306E] shadow-sm ring-2 ring-[#6C306E]/20'
                            : 'bg-white/80 border-[#EFE0EF] hover:bg-white'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-[#6C306E] text-white flex items-center justify-center font-bold text-xs">
                            3
                        </span>
                        <span className="font-extrabold text-sm text-[#241224]">
                            Bottom Side Box
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {sideCardBottom.tag} • {sideCardBottom.title}
                    </p>
                </button>
            </div>

            {/* TAB CONTENT EDITORS */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs space-y-6">
                {/* 1. MAIN LARGE FEATURE CARD EDITOR */}
                {activeTab === 'mainCard' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                            <div>
                                <h3 className="text-base font-extrabold text-[#241224]">
                                    Edit Main Feature Box (Large Left Card)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Prominently displays your British heritage guarantee, headline copy, starting price, and collection CTA button.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={mainCard.isActive !== false}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'isActive', e.target.checked)}
                                    className="accent-[#6C306E] size-4 rounded"
                                />
                                <span>Visible on Storefront</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Badge */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Top Badge Tag
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.badge || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'badge', e.target.value)}
                                    placeholder="e.g. 100% Original UK Imports"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                />
                            </div>

                            {/* Headline Line 1 */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Main Headline (Line 1) *
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.title || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'title', e.target.value)}
                                    placeholder="e.g. Curated UK Beauty."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                />
                            </div>

                            {/* Headline Line 2 Highlight */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Highlighted Sub-Headline (Gradient Line 2)
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.titleHighlight || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'titleHighlight', e.target.value)}
                                    placeholder="e.g. Delivered in Bangladesh."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#6C306E] focus:outline-hidden focus:border-[#6C306E]"
                                />
                            </div>

                            {/* Starting Price Value */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Price Tag Label
                                    </label>
                                    <input
                                        type="text"
                                        value={mainCard.priceLabel || ''}
                                        onChange={(e) => handleUpdateCardField('mainCard', 'priceLabel', e.target.value)}
                                        placeholder="e.g. Prices start at"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Starting Price Amount (৳)
                                    </label>
                                    <input
                                        type="text"
                                        value={mainCard.priceValue || ''}
                                        onChange={(e) => handleUpdateCardField('mainCard', 'priceValue', e.target.value)}
                                        placeholder="e.g. 1,650"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-black text-[#6C306E] focus:outline-hidden focus:border-[#6C306E]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Description Paragraph
                            </label>
                            <textarea
                                rows={2}
                                value={mainCard.description || ''}
                                onChange={(e) => handleUpdateCardField('mainCard', 'description', e.target.value)}
                                placeholder="e.g. Authentic dermatological skincare, cult cosmetics, and hair perfectors imported directly from the UK."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                            />
                        </div>

                        {/* Button Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Button Text Label
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.buttonText || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'buttonText', e.target.value)}
                                    placeholder="e.g. Explore Collection"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Button Target Redirect URL (When user clicks)
                                </label>
                                <input
                                    type="text"
                                    value={mainCard.buttonLink || ''}
                                    onChange={(e) => handleUpdateCardField('mainCard', 'buttonLink', e.target.value)}
                                    placeholder="e.g. /shop or /shop?category=Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                />
                            </div>
                        </div>

                        {/* Image Upload for Main Card */}
                        <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] space-y-3">
                            <label className="block text-xs font-bold text-slate-700">
                                Feature Card Image (Model Photo or Transparent PNG)
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-[#EFE0EF] relative shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
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
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-2xs disabled:opacity-50"
                                        >
                                            {uploadingTarget === 'mainCard' ? 'Uploading...' : 'Upload New Image'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCardField('mainCard', 'image', '/images/hero/hero_card_img1.png')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-[#EFE0EF] hover:bg-slate-50 transition"
                                        >
                                            Restore Default
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={mainCard.image || ''}
                                        onChange={(e) => handleUpdateCardField('mainCard', 'image', e.target.value)}
                                        placeholder="Or paste direct image URL (e.g. /images/hero/hero_card_img1.png)"
                                        className="w-full px-3 py-1.5 rounded-xl border border-[#EFE0EF] bg-white text-xs text-slate-600 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. TOP SMALL SIDE CARD EDITOR */}
                {activeTab === 'sideCardTop' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                            <div>
                                <h3 className="text-base font-extrabold text-[#241224]">
                                    Edit Top Side Box (e.g. Skincare)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Appears in the upper right position of the hero secondary section.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sideCardTop.isActive !== false}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'isActive', e.target.checked)}
                                    className="accent-[#6C306E] size-4 rounded"
                                />
                                <span>Visible on Storefront</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Eyebrow Tag
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.tag || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'tag', e.target.value)}
                                    placeholder="e.g. TOP SELECTED"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#6C306E] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Card Title *
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.title || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'title', e.target.value)}
                                    placeholder="e.g. Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-extrabold text-[#241224] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Button / Link Text
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.buttonText || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'buttonText', e.target.value)}
                                    placeholder="e.g. Shop Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#241224] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Button Target Redirect URL
                                </label>
                                <input
                                    type="text"
                                    value={sideCardTop.buttonLink || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardTop', 'buttonLink', e.target.value)}
                                    placeholder="e.g. /shop?category=Skincare"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden"
                                />
                            </div>
                        </div>

                        {/* Image Upload for Top Side Card */}
                        <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] space-y-3">
                            <label className="block text-xs font-bold text-slate-700">
                                Card Product Image
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-[#EFE0EF] relative shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
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
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-2xs disabled:opacity-50"
                                        >
                                            {uploadingTarget === 'sideCardTop' ? 'Uploading...' : 'Upload New Image'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCardField('sideCardTop', 'image', '/images/hero/hero_card_img2.png')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-[#EFE0EF] hover:bg-slate-50 transition"
                                        >
                                            Restore Default
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={sideCardTop.image || ''}
                                        onChange={(e) => handleUpdateCardField('sideCardTop', 'image', e.target.value)}
                                        placeholder="Or paste direct image URL (e.g. /images/hero/hero_card_img2.png)"
                                        className="w-full px-3 py-1.5 rounded-xl border border-[#EFE0EF] bg-white text-xs text-slate-600 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. BOTTOM SMALL SIDE CARD EDITOR */}
                {activeTab === 'sideCardBottom' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                            <div>
                                <h3 className="text-base font-extrabold text-[#241224]">
                                    Edit Bottom Side Box (e.g. Cosmetics)
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Appears in the lower right position of the hero secondary section.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sideCardBottom.isActive !== false}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'isActive', e.target.checked)}
                                    className="accent-[#6C306E] size-4 rounded"
                                />
                                <span>Visible on Storefront</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Eyebrow Tag
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.tag || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'tag', e.target.value)}
                                    placeholder="e.g. EXCLUSIVE DEALS"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#D8B56D] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Card Title *
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.title || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'title', e.target.value)}
                                    placeholder="e.g. Cosmetics"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-extrabold text-[#241224] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Button / Link Text
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.buttonText || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'buttonText', e.target.value)}
                                    placeholder="e.g. Shop Makeup"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#241224] focus:outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Button Target Redirect URL
                                </label>
                                <input
                                    type="text"
                                    value={sideCardBottom.buttonLink || ''}
                                    onChange={(e) => handleUpdateCardField('sideCardBottom', 'buttonLink', e.target.value)}
                                    placeholder="e.g. /shop?category=Makeup"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden"
                                />
                            </div>
                        </div>

                        {/* Image Upload for Bottom Side Card */}
                        <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] space-y-3">
                            <label className="block text-xs font-bold text-slate-700">
                                Card Product Image
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-24 h-24 rounded-2xl bg-white border border-[#EFE0EF] relative shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
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
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-2xs disabled:opacity-50"
                                        >
                                            {uploadingTarget === 'sideCardBottom' ? 'Uploading...' : 'Upload New Image'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCardField('sideCardBottom', 'image', '/images/hero/hero_card_img3.png')}
                                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-[#EFE0EF] hover:bg-slate-50 transition"
                                        >
                                            Restore Default
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={sideCardBottom.image || ''}
                                        onChange={(e) => handleUpdateCardField('sideCardBottom', 'image', e.target.value)}
                                        placeholder="Or paste direct image URL (e.g. /images/hero/hero_card_img3.png)"
                                        className="w-full px-3 py-1.5 rounded-xl border border-[#EFE0EF] bg-white text-xs text-slate-600 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Link Pills Bar */}
                <div className="pt-2 border-t border-[#EFE0EF] flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Quick Destination Links:</span>
                    {QUICK_LINKS.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleUpdateCardField(activeTab, 'buttonLink', item.url)}
                            className="text-[11px] font-bold text-[#6C306E] bg-[#FAF6FA] hover:bg-[#FAF6FA]/80 px-2.5 py-1 rounded-lg border border-[#EFE0EF] transition"
                        >
                            {item.label} ({item.url})
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
