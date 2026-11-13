'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
    CameraIcon,
    PlusIcon,
    TrashIcon,
    EditIcon,
    GripVerticalIcon,
    CloseIcon,
    CheckIcon,
    RefreshIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    StoreFrontIcon,
    UploadCloudIcon,
    EyeIcon
} from '@/components/icons'
import ClassicLoader from '@/components/ui/classic-loader'

const DEFAULT_BANNER_SUGGESTIONS = [
    { label: 'All Collections', url: '/shop' },
    { label: 'Skincare', url: '/shop?category=Skincare' },
    { label: 'Makeup', url: '/shop?category=Makeup' },
    { label: 'Haircare', url: '/shop?category=Haircare' },
    { label: 'Fragrance', url: '/shop?category=Fragrance' },
    { label: 'Contact Advisory', url: '/contact' }
]

export default function AdminHeroBannersPage() {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState(null)

    // Interactive Storefront Preview & Global Store Autoplay State
    const [previewActiveIndex, setPreviewActiveIndex] = useState(0)
    const [isAutoplay, setIsAutoplay] = useState(true)
    const [isTogglingAutoplay, setIsTogglingAutoplay] = useState(false)

    // Modal State (Add or Edit)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState(null) // null when adding
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const fileInputRef = useRef(null)

    // Form fields
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        imageAlt: '',
        link: '',
        isActive: true,
        displayOrder: 1
    })

    // 1. Fetch live banners & settings from API
    const fetchBanners = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/banners?_t=${Date.now()}`, {
                cache: 'no-store'
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.banners)) {
                setBanners(data.banners)
                if (data.settings && typeof data.settings.autoplay === 'boolean') {
                    setIsAutoplay(data.settings.autoplay)
                } else if (typeof data.autoplay === 'boolean') {
                    setIsAutoplay(data.autoplay)
                }
            } else {
                toast.error(data.message || 'Failed to load banners')
            }
        } catch (err) {
            console.error('Error fetching admin banners:', err)
            toast.error('Network error loading banners')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBanners()
    }, [])

    // Real-time Autoplay Toggle handler - updates DB, server, and all users instantly
    const handleToggleAutoplay = async () => {
        if (isTogglingAutoplay) return
        setIsTogglingAutoplay(true)
        const nextState = !isAutoplay

        // Optimistic UI update
        setIsAutoplay(nextState)
        const toastId = toast.loading(nextState ? 'Enabling Storefront Autoplay...' : 'Disabling Storefront Autoplay...')

        try {
            const res = await fetch('/api/admin/banners', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ autoplay: nextState })
            })
            const data = await res.json()

            if (data.success) {
                const finalAutoplay = data.autoplay !== undefined ? data.autoplay : nextState
                setIsAutoplay(finalAutoplay)
                toast.success(
                    finalAutoplay 
                        ? 'Hero slider Autoplay is now ON across the storefront!' 
                        : 'Hero slider Autoplay is now OFF across the storefront!',
                    { id: toastId }
                )

                // Multi-channel real-time synchronization across frontend, backend, server, and all users
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_cached_hero_banner_settings', JSON.stringify({ autoplay: finalAutoplay, delay: 5000 }))
                    localStorage.setItem('ukbl_banners_synced', Date.now().toString())

                    window.dispatchEvent(new CustomEvent('hero-banner-autoplay-updated', { detail: { autoplay: finalAutoplay } }))
                    window.dispatchEvent(new CustomEvent('hero-banners-updated'))

                    try {
                        const bc = new BroadcastChannel('ukbl_catalog_channel')
                        bc.postMessage({ type: 'hero-banner-autoplay-updated', autoplay: finalAutoplay })
                        bc.close()
                    } catch {}

                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHE' })
                    }
                    if ('caches' in window) {
                        caches.delete('ukbl-api-v1').catch(() => {})
                        caches.delete('ukbl-api-v2').catch(() => {})
                    }
                }
            } else {
                setIsAutoplay(!nextState)
                toast.error(data.message || 'Failed to update autoplay setting', { id: toastId })
            }
        } catch (err) {
            console.error('Error toggling autoplay:', err)
            setIsAutoplay(!nextState)
            toast.error('Network error toggling autoplay', { id: toastId })
        } finally {
            setIsTogglingAutoplay(false)
        }
    }

    // Autoplay for the Live Storefront Preview slider on the admin page (strictly syncs with isAutoplay)
    useEffect(() => {
        if (!isAutoplay || banners.length <= 1) return
        const timer = setInterval(() => {
            setPreviewActiveIndex(prev => (prev + 1) % banners.length)
        }, 4500)
        return () => clearInterval(timer)
    }, [isAutoplay, banners.length])

    // --- Modal Openers ---
    const handleOpenAddModal = () => {
        setEditingBanner(null)
        setFormData({
            title: '',
            subtitle: '',
            image: '',
            imageAlt: '',
            link: '/shop',
            isActive: true,
            displayOrder: 1 // Default to 1st (fast) position as requested
        })
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (banner) => {
        setEditingBanner(banner)
        setFormData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            image: banner.image || '',
            imageAlt: banner.imageAlt || banner.title || '',
            link: banner.link || '',
            isActive: banner.isActive !== false,
            displayOrder: banner.displayOrder || 1
        })
        setIsModalOpen(true)
    }

    // --- Image Upload Handler ---
    const handleImageFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploadingImage(true)
            const uploadToast = toast.loading('Uploading banner image in full high resolution...')

            const uploadData = new FormData()
            uploadData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            })
            const data = await res.json()

            if (data.success && data.url) {
                setFormData(prev => ({
                    ...prev,
                    image: data.url,
                    imageAlt: prev.imageAlt || file.name.replace(/\.[^/.]+$/, '')
                }))
                toast.success('Banner image uploaded successfully!', { id: uploadToast })
            } else {
                toast.error(data.message || 'Failed to upload image', { id: uploadToast })
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('Image upload failed')
        } finally {
            setIsUploadingImage(false)
        }
    }

    // --- Save Single Banner (Add or Edit) ---
    const handleSaveBannerModal = async (e) => {
        e.preventDefault()

        if (!formData.image.trim()) {
            toast.error('Please upload or provide a banner image URL')
            return
        }

        try {
            setSaving(true)
            const toastId = toast.loading(editingBanner ? 'Updating hero banner...' : 'Publishing new hero banner...')

            let res
            if (editingBanner) {
                // Update
                res = await fetch('/api/admin/banners', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingBanner.id,
                        ...formData
                    })
                })
            } else {
                // Create
                res = await fetch('/api/admin/banners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            }

            const data = await res.json()

            if (data.success && Array.isArray(data.banners)) {
                setBanners(data.banners)
                setIsModalOpen(false)
                toast.success(data.message || 'Banner saved successfully!', { id: toastId })
                syncBroadcast(data.banners)
            } else {
                toast.error(data.message || 'Failed to save banner', { id: toastId })
            }
        } catch (err) {
            console.error('Error saving banner:', err)
            toast.error('Failed to save banner')
        } finally {
            setSaving(false)
        }
    }

    // --- Delete Banner ---
    const handleDeleteBanner = async (bannerId) => {
        if (!confirm('Are you sure you want to permanently delete this hero banner?')) return

        try {
            const toastId = toast.loading('Deleting banner...')
            const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(bannerId)}`, {
                method: 'DELETE'
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.banners)) {
                setBanners(data.banners)
                toast.success('Hero banner deleted successfully!', { id: toastId })
                syncBroadcast(data.banners)
            } else {
                toast.error(data.message || 'Failed to delete banner', { id: toastId })
            }
        } catch (err) {
            console.error('Error deleting banner:', err)
            toast.error('Failed to delete banner')
        }
    }

    // --- Shift and Reorder Actions ---
    const handleMoveBanner = async (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= banners.length) return
        const updated = [...banners]
        const [moved] = updated.splice(fromIndex, 1)
        updated.splice(toIndex, 0, moved)

        const normalized = updated.map((b, idx) => ({ ...b, displayOrder: idx + 1 }))
        setBanners(normalized)
        await persistReorderedBanners(normalized)
    }

    const handleDirectOrderChange = async (fromIndex, targetRankStr) => {
        const targetRank = parseInt(targetRankStr, 10)
        if (isNaN(targetRank)) return
        const toIndex = Math.max(0, Math.min(targetRank - 1, banners.length - 1))
        if (fromIndex === toIndex) return

        const updated = [...banners]
        const [moved] = updated.splice(fromIndex, 1)
        updated.splice(toIndex, 0, moved)

        const normalized = updated.map((b, idx) => ({ ...b, displayOrder: idx + 1 }))
        setBanners(normalized)
        await persistReorderedBanners(normalized)
        toast.success(`Banner moved to rank #${toIndex + 1}!`)
    }

    // Drag and Drop
    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null)
            return
        }
        await handleMoveBanner(draggedIndex, targetIndex)
        setDraggedIndex(null)
        toast.success(`Banner prioritized to position #${targetIndex + 1}`)
    }

    // Persist bulk reordered list to backend & DB
    const persistReorderedBanners = async (reorderedList) => {
        try {
            setSaving(true)
            const res = await fetch('/api/admin/banners', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banners: reorderedList })
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.banners)) {
                syncBroadcast(data.banners)
            }
        } catch (err) {
            console.error('Failed to sync banner reorder:', err)
        } finally {
            setSaving(false)
        }
    }

    // Synchronize to local storage, custom event, and BroadcastChannel
    const syncBroadcast = (newBanners) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(newBanners))
                localStorage.setItem('ukbl_banners_synced', Date.now().toString())
                window.dispatchEvent(new CustomEvent('hero-banners-updated'))

                const bc = new BroadcastChannel('ukbl_catalog_channel')
                bc.postMessage({
                    type: 'hero-banners-updated',
                    banners: newBanners
                })
            } catch (syncErr) {
                console.error('Broadcast sync error:', syncErr)
            }
        }
    }

    // Current active banner in preview
    const activePreviewBanner = banners[previewActiveIndex] || banners[0]

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#6C306E] bg-[#FAF6FA] px-2.5 py-1 rounded-full border border-[#EFE0EF]">
                            Homepage Hero Studio
                        </span>
                        <span className="text-slate-400 text-xs">• Live Database Sync</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">
                        Hero Banner Slider Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                        Add, edit, delete, and reorder homepage promotional slider images. Set exact serial positions (#1, #2, #3...) and attach custom click redirect URLs. All updates go live instantly across the entire store.
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
                        onClick={fetchBanners}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-[#FAF6FA] border border-[#EFE0EF] hover:bg-[#FAF6FA]/80 transition"
                    >
                        <RefreshIcon size={14} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-linear-to-r from-[#6C306E] to-[#4A1D4C] hover:from-[#5A255C] hover:to-[#381439] shadow-md shadow-[#6C306E]/20 transition"
                    >
                        <PlusIcon size={15} />
                        <span>Add New Hero Banner</span>
                    </button>
                </div>
            </div>

            {/* LIVE 1:1 HERO BANNER SLIDER PREVIEW */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-[#241224]">
                                1:1 Live Storefront Hero Preview
                            </h2>
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Real-Time Simulation
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Exact simulation of the visitor slider with touch/mouse navigation, responsive aspect ratio, and click redirect testing.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleToggleAutoplay}
                            disabled={isTogglingAutoplay}
                            title={isAutoplay ? 'Click to turn OFF autoplay across the entire store' : 'Click to turn ON autoplay across the entire store'}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs border cursor-pointer ${
                                isAutoplay
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 ring-2 ring-emerald-500/15'
                                    : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 ring-2 ring-rose-500/15'
                            } ${isTogglingAutoplay ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <span className={`size-2 rounded-full ${isAutoplay ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span>{isAutoplay ? '▶ Autoplay ON' : '⏸ Autoplay OFF'}</span>
                            <span className="text-[10px] opacity-75 font-normal">
                                ({isAutoplay ? 'Storewide ON' : 'Storewide OFF'})
                            </span>
                        </button>
                    </div>
                </div>

                {banners.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                        No hero banners available. Click "+ Add New Hero Banner" to create your first slide.
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-sm select-none">
                        {/* Slide Display */}
                        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[26/9] min-h-[160px] max-h-[460px] overflow-hidden flex items-center justify-center">
                            {activePreviewBanner && activePreviewBanner.image ? (
                                <Image
                                    src={activePreviewBanner.image}
                                    alt={activePreviewBanner.imageAlt || activePreviewBanner.title || 'Hero Banner'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="text-center p-6 text-slate-400 text-xs">
                                    No Image Provided
                                </div>
                            )}

                            {/* Banner Meta Pill Overlay on Preview */}
                            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-20">
                                <span className="text-[10px] font-extrabold uppercase bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
                                    Slide #{previewActiveIndex + 1} of {banners.length} (Priority #{activePreviewBanner?.displayOrder})
                                </span>
                                {activePreviewBanner?.link ? (
                                    <span className="text-[10px] font-bold bg-[#6C306E]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
                                        🔗 Target: {activePreviewBanner.link}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold bg-black/40 backdrop-blur-md text-white/80 px-2.5 py-1 rounded-full">
                                        No link assigned
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            type="button"
                            onClick={() => setPreviewActiveIndex((previewActiveIndex - 1 + banners.length) % banners.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[#6C306E] flex items-center justify-center shadow-md transition hover:scale-110"
                            title="Previous slide"
                        >
                            <ChevronLeftIcon size={16} color="#6C306E" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setPreviewActiveIndex((previewActiveIndex + 1) % banners.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[#6C306E] flex items-center justify-center shadow-md transition hover:scale-110"
                            title="Next slide"
                        >
                            <ChevronRightIcon size={16} color="#6C306E" />
                        </button>

                        {/* Dots Capsule */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPreviewActiveIndex(idx)}
                                    className={`transition-all rounded-full ${
                                        previewActiveIndex === idx
                                            ? 'w-5 h-2 bg-white'
                                            : 'size-2 bg-white/60 hover:bg-white'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CURATED HERO BANNERS & SERIAL PRIORITY LIST */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-[#EFE0EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold text-[#241224]">
                                Hero Banner Slides & Display Priorities
                            </h2>
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF]">
                                {banners.length} Total Banners
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Banners slide on the storefront in the exact serial order shown below. Drag rows or use the Move buttons / Serial numbers to customize order.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-[#6C306E] hover:bg-[#3A0C38] shadow-xs transition shrink-0"
                    >
                        <PlusIcon size={14} />
                        <span>Add New Slide</span>
                    </button>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <ClassicLoader className="mx-auto" />
                        <p className="text-xs text-slate-500 mt-3 font-semibold">Loading hero banners...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="py-16 px-6 text-center max-w-md mx-auto space-y-3">
                        <div className="size-16 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E]">
                            <CameraIcon size={28} color="#6C306E" />
                        </div>
                        <h3 className="text-base font-extrabold text-[#241224]">
                            No Hero Banners Found
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Add promotional banners to showcase your authentic UK imports, seasonal deals, or new skincare arrivals right at the top of your homepage.
                        </p>
                        <button
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-xs mt-2"
                        >
                            <PlusIcon size={14} />
                            <span>Add Your First Banner</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-[#EFE0EF]">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                                    draggedIndex === index
                                        ? 'bg-[#FAF6FA]/80 border-2 border-dashed border-[#6C306E]'
                                        : 'hover:bg-[#FAF6FA]/50 bg-white'
                                }`}
                            >
                                {/* Left: Drag handle & Priority Rank */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div
                                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#6C306E] p-1 rounded transition"
                                        title="Drag to reorder priority"
                                    >
                                        <GripVerticalIcon size={18} />
                                    </div>

                                    {/* Priority Rank Badge */}
                                    <div className="size-11 rounded-xl bg-linear-to-br from-[#6C306E] to-[#3A0C38] text-white flex flex-col items-center justify-center font-extrabold shadow-2xs shrink-0">
                                        <span className="text-[9px] uppercase tracking-tighter opacity-70">RANK</span>
                                        <span className="text-sm leading-none">#{index + 1}</span>
                                    </div>
                                </div>

                                {/* Center: Banner Image Thumbnail & Meta */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-28 sm:w-36 aspect-[21/9] rounded-xl border border-[#EFE0EF] bg-slate-50 relative shrink-0 overflow-hidden shadow-2xs">
                                        {banner.image ? (
                                            <Image
                                                src={banner.image}
                                                alt={banner.title || 'Banner'}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                banner.isActive !== false
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                                {banner.isActive !== false ? 'Active on Storefront' : 'Hidden / Inactive'}
                                            </span>
                                            {index === 0 && (
                                                <span className="text-[10px] font-extrabold text-[#D8B56D] bg-[#FAF6FA] px-2 py-0.5 rounded-full border border-[#EFE0EF]">
                                                    ★ First Visible Slide
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-extrabold text-sm text-[#241224] truncate mt-1">
                                            {banner.title || `Promotional Slide #${index + 1}`}
                                        </h3>

                                        {banner.subtitle && (
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {banner.subtitle}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                                            <span className="text-slate-400 font-semibold">Redirect Link:</span>
                                            {banner.link ? (
                                                <span className="font-bold text-[#6C306E] bg-[#FAF6FA] px-2 py-0.5 rounded-md border border-[#EFE0EF] truncate max-w-xs">
                                                    {banner.link}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">None (Display Only)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Serial Adjusters & Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Direct Serial Input */}
                                    <div className="hidden sm:flex items-center gap-1 bg-[#FAF6FA] px-2 py-1 rounded-xl border border-[#EFE0EF]">
                                        <span className="text-[10px] font-bold text-slate-400">Serial:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={banners.length}
                                            defaultValue={index + 1}
                                            key={`rank-${banner.id}-${index}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleDirectOrderChange(index, e.target.value)
                                                }
                                            }}
                                            onBlur={(e) => handleDirectOrderChange(index, e.target.value)}
                                            className="w-10 text-center text-xs font-black text-[#6C306E] bg-white rounded-lg border border-[#EFE0EF] py-0.5 focus:outline-hidden"
                                        />
                                    </div>

                                    {/* Move Up */}
                                    <button
                                        type="button"
                                        onClick={() => handleMoveBanner(index, index - 1)}
                                        disabled={index === 0}
                                        className="size-8 rounded-xl border border-[#EFE0EF] bg-white hover:bg-[#FAF6FA] text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-sm transition shadow-2xs"
                                        title="Move Priority Up"
                                    >
                                        ▲
                                    </button>

                                    {/* Move Down */}
                                    <button
                                        type="button"
                                        onClick={() => handleMoveBanner(index, index + 1)}
                                        disabled={index === banners.length - 1}
                                        className="size-8 rounded-xl border border-[#EFE0EF] bg-white hover:bg-[#FAF6FA] text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-sm transition shadow-2xs"
                                        title="Move Priority Down"
                                    >
                                        ▼
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(banner)}
                                        className="size-8 rounded-xl border border-[#EFE0EF] bg-white hover:bg-[#FAF6FA] text-[#6C306E] flex items-center justify-center transition shadow-2xs"
                                        title="Edit Slide & Target URL"
                                    >
                                        <EditIcon size={14} />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        className="size-8 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shadow-2xs"
                                        title="Delete Banner Slide"
                                    >
                                        <TrashIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD / EDIT BANNER SLIDE MODAL WITH LIVE PREVIEW */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#EFE0EF] flex items-center justify-between shrink-0 bg-[#FAF6FA]/50">
                            <div>
                                <span className="text-[10px] font-black uppercase text-[#6C306E] tracking-wider">
                                    {editingBanner ? 'Update Existing Slide' : 'Create New Hero Slide'}
                                </span>
                                <h3 className="text-xl font-extrabold text-[#241224]">
                                    {editingBanner ? 'Edit Hero Banner & Link' : 'Add New Hero Banner Slide'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Configure high-resolution slide photo, target customer redirection URL, and initial display priority.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-9 rounded-full bg-white border border-[#EFE0EF] text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-2xs"
                            >
                                <CloseIcon size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSaveBannerModal} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column: Inputs */}
                                <div className="space-y-4">
                                    {/* Image Upload Box */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Banner Image * (Recommended: 21:9 or 24:9 widescreen high-res)
                                        </label>
                                        
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-[#EFE0EF] hover:border-[#6C306E] bg-[#FAF6FA]/60 rounded-2xl p-5 text-center cursor-pointer transition"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageFileSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <div className="size-11 rounded-xl bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] shadow-2xs mb-2">
                                                {isUploadingImage ? <ClassicLoader /> : <UploadCloudIcon size={20} />}
                                            </div>
                                            <p className="text-xs font-extrabold text-[#241224]">
                                                {isUploadingImage ? 'Uploading Image...' : 'Click to Upload High-Res Banner'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Supports PNG, JPG, WEBP • Uploads directly to CDN
                                            </p>
                                        </div>

                                        {/* Direct URL input alternative */}
                                        <div className="mt-2.5">
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                                placeholder="Or paste direct image URL (e.g. /banner/1.png or https://...)"
                                                className="w-full px-3.5 py-2 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                            />
                                        </div>
                                    </div>

                                    {/* Slide Title */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Banner Campaign Title (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g. Welcome to Radiant You"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                        />
                                    </div>

                                    {/* Subtitle / Alt Text */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Subtitle / Accessibility Alt Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                            placeholder="e.g. Where beauty meets care! Discover the finest in skincare..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                        />
                                    </div>

                                    {/* Target Redirection URL */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Target Click Redirection URL (When user clicks banner)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.link}
                                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                            placeholder="e.g. /shop?category=Skincare or /product/xxx"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                        />

                                        {/* Quick Suggestion Pills */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Links:</span>
                                            {DEFAULT_BANNER_SUGGESTIONS.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, link: item.url }))}
                                                    className="text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] hover:bg-[#FAF6FA]/80 px-2 py-0.5 rounded-md border border-[#EFE0EF] transition"
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Display Serial Position */}
                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Serial Display Order
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.displayOrder}
                                                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                                                className="w-full px-3.5 py-2 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-black text-[#6C306E] focus:outline-hidden"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Position 1 = First slide seen by visitors
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mt-3">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                    className="accent-[#6C306E] size-4 rounded"
                                                />
                                                <span>Active on Storefront</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Instant Live Preview Card */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-[#6C306E] tracking-wider">
                                            Exact Customer Slide Preview
                                        </span>
                                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            Priority #{formData.displayOrder || 1}
                                        </span>
                                    </div>

                                    <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden bg-[#FAF6FA] border border-[#EFE0EF] shadow-sm flex items-center justify-center">
                                        {formData.image ? (
                                            <Image
                                                src={formData.image}
                                                alt={formData.title || 'Preview'}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="text-center p-6 text-slate-400 space-y-1">
                                                <CameraIcon size={28} className="mx-auto text-slate-300" />
                                                <p className="text-xs font-bold text-slate-400">Live Preview Box</p>
                                                <p className="text-[10px] text-slate-400">Upload or enter image URL to see live preview</p>
                                            </div>
                                        )}

                                        {formData.link && (
                                            <div className="absolute bottom-2 left-2 z-10">
                                                <span className="text-[9px] font-bold bg-[#6C306E] text-white px-2 py-0.5 rounded-full shadow-md">
                                                    🔗 Click navigates to: {formData.link}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] space-y-1.5 text-xs">
                                        <h4 className="font-extrabold text-[#241224]">
                                            {formData.title || 'Untitled Promotional Banner'}
                                        </h4>
                                        <p className="text-slate-500 text-[11px]">
                                            {formData.subtitle || 'No subtitle description provided.'}
                                        </p>
                                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Display Serial: #{formData.displayOrder}</span>
                                            <span>Status: {formData.isActive ? 'Active' : 'Hidden'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-[#EFE0EF] bg-[#FAF6FA] -mx-6 -mb-6 flex items-center justify-between shrink-0 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-white border border-[#EFE0EF] hover:bg-slate-50 transition shadow-2xs"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-linear-to-r from-[#6C306E] to-[#4A1D4C] hover:from-[#5A255C] hover:to-[#381439] shadow-md shadow-[#6C306E]/20 transition disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <ClassicLoader />
                                            <span>Saving to Database...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon size={14} />
                                            <span>{editingBanner ? 'Update Banner' : 'Publish Banner to Storefront'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

