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
    ChevronLeftIcon,
    ChevronRightIcon,
    StoreFrontIcon,
    UploadCloudIcon
} from '@/components/icons'
import ClassicLoader from '@/components/ui/classic-loader'

export default function AdminHeroBannersPage() {
    const [banners, setBanners] = useState([])
    const [savedBanners, setSavedBanners] = useState([])
    const [categories, setCategories] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_categories') || '[]')
                if (Array.isArray(cached) && cached.length > 0) return cached
            } catch {}
        }
        return []
    })
    const [hasPendingChanges, setHasPendingChanges] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState(null)

    // Storefront Preview & Autoplay
    const [previewActiveIndex, setPreviewActiveIndex] = useState(0)
    const [isAutoplay, setIsAutoplay] = useState(true)
    const [isTogglingAutoplay, setIsTogglingAutoplay] = useState(false)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState(null)
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

    // Fetch live banners from API
    const fetchBanners = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/banners?_t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.banners)) {
                setBanners(data.banners)
                setSavedBanners(data.banners)
                setHasPendingChanges(false)
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

    // Fetch live categories from API to populate destination link suggestions
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
            }
        } catch (err) {
            console.error('Error fetching live categories for hero banners:', err)
        }
    }

    useEffect(() => {
        fetchBanners()
        fetchLiveCategories()

        // Real-time listener for category changes from /admin/categories
        const onCategoryUpdate = () => {
            fetchLiveCategories()
        }
        const onStorage = (e) => {
            if (e.key === 'ukbl_categories_synced') {
                fetchLiveCategories()
            }
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
            const name = (typeof c === 'string' ? c : c?.name || '').trim()
            if (name && !seenNames.has(name.toLowerCase())) {
                seenNames.add(name.toLowerCase())
                links.push({
                    label: name,
                    url: `/shop?category=${encodeURIComponent(name)}`
                })
            }
        })

        // Also ensure baseline defaults exist
        const defaultNames = ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care', 'Beauty Tools']
        defaultNames.forEach(name => {
            if (!seenNames.has(name.toLowerCase())) {
                seenNames.add(name.toLowerCase())
                links.push({
                    label: name,
                    url: `/shop?category=${encodeURIComponent(name)}`
                })
            }
        })

        links.push({ label: 'Contact', url: '/contact' })
        return links
    }, [categories])

    // Preview Autoplay
    useEffect(() => {
        if (!isAutoplay || banners.length <= 1) return
        const timer = setInterval(() => {
            setPreviewActiveIndex(prev => (prev + 1) % banners.length)
        }, 4500)
        return () => clearInterval(timer)
    }, [isAutoplay, banners.length])

    // Broadcast sync across all devices and tabs
    const syncBroadcast = (newBanners) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('ukbl_cached_hero_banners', JSON.stringify(newBanners))
                localStorage.setItem('ukbl_banners_synced', Date.now().toString())
                window.dispatchEvent(new CustomEvent('hero-banners-updated', { detail: { banners: newBanners } }))

                const bc = new BroadcastChannel('ukbl_catalog_channel')
                bc.postMessage({
                    type: 'hero-banners-updated',
                    banners: newBanners,
                    timestamp: Date.now()
                })
                bc.close()
            } catch (syncErr) {
                console.error('Broadcast sync error:', syncErr)
            }
        }
    }

    // Toggle Autoplay
    const handleToggleAutoplay = async () => {
        if (isTogglingAutoplay) return
        setIsTogglingAutoplay(true)
        const nextState = !isAutoplay
        setIsAutoplay(nextState)

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
                toast.success(finalAutoplay ? 'Autoplay turned ON' : 'Autoplay turned OFF')

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_cached_hero_banner_settings', JSON.stringify({ autoplay: finalAutoplay, delay: 5000 }))
                    localStorage.setItem('ukbl_banners_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('hero-banner-autoplay-updated', { detail: { autoplay: finalAutoplay } }))
                    try {
                        const bc = new BroadcastChannel('ukbl_catalog_channel')
                        bc.postMessage({ type: 'hero-banner-autoplay-updated', autoplay: finalAutoplay })
                        bc.close()
                    } catch {}
                }
            } else {
                setIsAutoplay(!nextState)
                toast.error(data.message || 'Failed to update autoplay')
            }
        } catch (err) {
            setIsAutoplay(!nextState)
            toast.error('Network error toggling autoplay')
        } finally {
            setIsTogglingAutoplay(false)
        }
    }

    // Save All Banners to Database
    const handleSaveAllBanners = async (customList = null) => {
        const listToSave = customList || banners
        if (!Array.isArray(listToSave)) return

        const normalized = listToSave.map((b, idx) => ({
            ...b,
            displayOrder: idx + 1
        }))

        try {
            setSaving(true)
            const res = await fetch('/api/admin/banners', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banners: normalized })
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.banners)) {
                setBanners(data.banners)
                setSavedBanners(data.banners)
                setHasPendingChanges(false)
                syncBroadcast(data.banners)
                toast.success('Banners saved and published live!')
            } else {
                toast.error(data.message || 'Failed to save banners')
            }
        } catch (err) {
            console.error('Failed to save banners:', err)
            toast.error('Network error saving banners')
        } finally {
            setSaving(false)
        }
    }

    // Client-side image compression for files > 2MB to prevent payload errors
    const compressImageIfNeeded = async (file) => {
        if (!file.type.startsWith('image/') || file.size < 2 * 1024 * 1024) {
            return file
        }
        return new Promise((resolve) => {
            const img = new window.Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(url)
                const maxDim = 2560
                let width = img.width
                let height = img.height
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width)
                        width = maxDim
                    } else {
                        width = Math.round((width * maxDim) / height)
                        height = maxDim
                    }
                }
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob((blob) => {
                    if (blob && blob.size < file.size) {
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' }))
                    } else {
                        resolve(file)
                    }
                }, 'image/jpeg', 0.92)
            }
            img.onerror = () => resolve(file)
            img.src = url
        })
    }

    const uploadSingleFile = async (file) => {
        const compressed = await compressImageIfNeeded(file)
        const uploadData = new FormData()
        uploadData.append('file', compressed)
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData
        })
        const data = await res.json()
        if (data.success && data.url) {
            return data.url
        }
        throw new Error(data.message || 'Upload failed')
    }

    // Image Upload Handler (Supports single or multiple file upload)
    const handleImageFileSelect = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setIsUploadingImage(true)
        const toastId = toast.loading(files.length > 1 ? `Uploading ${files.length} images...` : 'Uploading banner image...')

        try {
            if (files.length === 1) {
                const url = await uploadSingleFile(files[0])
                setFormData(prev => ({
                    ...prev,
                    image: url,
                    imageAlt: prev.imageAlt || files[0].name.replace(/\.[^/.]+$/, '')
                }))
                toast.success('Image uploaded successfully!', { id: toastId })
            } else {
                const uploaded = []
                for (const file of files) {
                    try {
                        const url = await uploadSingleFile(file)
                        uploaded.push({ url, name: file.name.replace(/\.[^/.]+$/, '') })
                    } catch (err) {
                        console.error('File upload error:', file.name, err)
                    }
                }

                if (uploaded.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        image: uploaded[0].url,
                        imageAlt: prev.imageAlt || uploaded[0].name
                    }))

                    // Add remaining images as new slides automatically
                    if (uploaded.length > 1) {
                        const extraSlides = uploaded.slice(1).map((item, idx) => ({
                            id: `hero-banner-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
                            title: '',
                            subtitle: '',
                            image: item.url,
                            imageAlt: item.name || 'Banner promotion',
                            link: '/shop',
                            isActive: true,
                            displayOrder: banners.length + idx + 1
                        }))
                        const merged = [...banners, ...extraSlides].map((b, i) => ({ ...b, displayOrder: i + 1 }))
                        setBanners(merged)
                        setHasPendingChanges(true)
                        toast.success(`${uploaded.length} images uploaded! Additional slides added to list.`, { id: toastId })
                    } else {
                        toast.success('Image uploaded successfully!', { id: toastId })
                    }
                } else {
                    toast.error('Failed to upload images', { id: toastId })
                }
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error(err.message || 'Image upload failed', { id: toastId })
        } finally {
            setIsUploadingImage(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Save banner from modal directly
    const handleSaveBanner = async () => {
        if (!formData.image.trim()) {
            toast.error('Please upload an image or provide an image URL')
            return
        }

        let updatedList = [...banners]
        const targetOrder = Math.max(1, Number(formData.displayOrder) || (updatedList.length + 1))

        if (editingBanner) {
            const existingIndex = updatedList.findIndex(b => b.id === editingBanner.id)
            if (existingIndex >= 0) {
                const updatedItem = {
                    ...updatedList[existingIndex],
                    ...formData,
                    id: editingBanner.id,
                    displayOrder: targetOrder
                }
                updatedList.splice(existingIndex, 1)
                const targetIdx = Math.min(targetOrder - 1, updatedList.length)
                updatedList.splice(targetIdx, 0, updatedItem)
            }
        } else {
            const newId = `hero-banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
            const newBanner = {
                id: newId,
                title: formData.title.trim(),
                subtitle: formData.subtitle.trim(),
                image: formData.image.trim(),
                imageAlt: formData.imageAlt.trim() || formData.title.trim() || 'Hero Banner',
                link: formData.link.trim(),
                isActive: formData.isActive !== false,
                displayOrder: targetOrder
            }
            const targetIdx = Math.min(targetOrder - 1, updatedList.length)
            updatedList.splice(targetIdx, 0, newBanner)
        }

        const normalized = updatedList.map((b, idx) => ({ ...b, displayOrder: idx + 1 }))
        setBanners(normalized)
        setIsModalOpen(false)

        // Save immediately to DB and publish
        await handleSaveAllBanners(normalized)
    }

    // Delete Banner
    const handleDeleteBanner = async (bannerId) => {
        if (!confirm('Are you sure you want to delete this banner?')) return
        const updated = banners.filter(b => b.id !== bannerId).map((b, idx) => ({ ...b, displayOrder: idx + 1 }))
        setBanners(updated)
        await handleSaveAllBanners(updated)
    }

    // Toggle Active on row
    const handleToggleActiveRow = async (bannerId) => {
        const updated = banners.map(b => b.id === bannerId ? { ...b, isActive: !b.isActive } : b)
        setBanners(updated)
        await handleSaveAllBanners(updated)
    }

    // Move Banner Order
    const handleMoveBanner = async (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= banners.length || fromIndex === toIndex) return
        const reordered = [...banners]
        const [moved] = reordered.splice(fromIndex, 1)
        reordered.splice(toIndex, 0, moved)
        const normalized = reordered.map((b, idx) => ({ ...b, displayOrder: idx + 1 }))
        setBanners(normalized)
        setHasPendingChanges(true)
    }

    // Open Modal Handlers
    const handleOpenAddModal = () => {
        setEditingBanner(null)
        setFormData({
            title: '',
            subtitle: '',
            image: '',
            imageAlt: '',
            link: '/shop',
            isActive: true,
            displayOrder: banners.length + 1
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

    const activePreviewBanner = banners[previewActiveIndex] || banners[0]

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C306E] bg-[#FAF6FA] px-2.5 py-0.5 rounded-full border border-[#EFE0EF]">
                            Homepage Slider
                        </span>
                        <span className="text-xs text-slate-400">• {banners.length} Banners</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#241224] tracking-tight">
                        Hero Banners
                    </h1>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 h-9 rounded-full text-xs font-bold text-slate-600 bg-white border border-[#EFE0EF] hover:text-[#6C306E] transition shadow-2xs shrink-0"
                    >
                        <StoreFrontIcon size={14} color="#6C306E" />
                        <span>View Store</span>
                    </Link>

                    {/* Autoplay Toggle */}
                    <button
                        type="button"
                        onClick={handleToggleAutoplay}
                        disabled={isTogglingAutoplay}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 h-9 rounded-full text-xs font-bold transition shadow-2xs border cursor-pointer shrink-0 ${
                            isAutoplay
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        }`}
                    >
                        <span className={`size-2 rounded-full ${isAutoplay ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{isAutoplay ? 'Autoplay ON' : 'Autoplay OFF'}</span>
                    </button>

                    {/* Save Changes button if order dragged */}
                    {hasPendingChanges && (
                        <button
                            type="button"
                            onClick={() => handleSaveAllBanners()}
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 h-9 min-w-[120px] rounded-full text-xs font-extrabold text-white bg-linear-to-r from-[#6C306E] to-[#4A1D4C] hover:from-[#5A255C] hover:to-[#381439] shadow-md transition cursor-pointer shrink-0 disabled:opacity-75"
                        >
                            {saving ? (
                                <>
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <CheckIcon size={14} className="shrink-0" />
                                    <span>Save Order</span>
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-5 py-2 h-9 rounded-full text-xs font-extrabold text-white bg-[#6C306E] hover:bg-[#4A1D4C] shadow-md shadow-[#6C306E]/20 transition cursor-pointer shrink-0"
                    >
                        <PlusIcon size={14} />
                        <span>Add Banner</span>
                    </button>
                </div>
            </div>

            {/* Live Storefront Preview */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE0EF]">
                    <h2 className="text-sm font-bold text-[#241224] uppercase tracking-wide">
                        Storefront Preview
                    </h2>
                    <span className="text-xs text-slate-400">
                        Slide {previewActiveIndex + 1} of {banners.length}
                    </span>
                </div>

                {banners.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                        No banners added yet. Click &quot;Add Banner&quot; to create your first slide.
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-sm select-none">
                        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[26/9] min-h-[160px] max-h-[460px] overflow-hidden flex items-center justify-center">
                            {activePreviewBanner && activePreviewBanner.image ? (
                                <>
                                    <Image
                                        src={activePreviewBanner.image}
                                        alt={activePreviewBanner.title || 'Hero Banner'}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />

                                    {/* Campaign Title & Subtitle Overlay on Live Preview */}
                                    {(activePreviewBanner.title || activePreviewBanner.subtitle) && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-6 sm:p-10 z-10 pointer-events-none">
                                            <div className="max-w-xl text-white space-y-1 sm:space-y-2">
                                                {activePreviewBanner.title && (
                                                    <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                                                        {activePreviewBanner.title}
                                                    </h2>
                                                )}
                                                {activePreviewBanner.subtitle && (
                                                    <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2 drop-shadow-sm">
                                                        {activePreviewBanner.subtitle}
                                                    </p>
                                                )}
                                                {activePreviewBanner.link && (
                                                    <div className="pt-1">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                                                            <span>Explore</span>
                                                            <ChevronRightIcon size={11} color="#FFFFFF" />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center p-6 text-slate-400 text-xs">
                                    No image available
                                </div>
                            )}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            type="button"
                            onClick={() => setPreviewActiveIndex((previewActiveIndex - 1 + banners.length) % banners.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[#6C306E] flex items-center justify-center shadow-md transition hover:scale-110 cursor-pointer z-20"
                            title="Previous slide"
                        >
                            <ChevronLeftIcon size={14} color="#6C306E" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setPreviewActiveIndex((previewActiveIndex + 1) % banners.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[#6C306E] flex items-center justify-center shadow-md transition hover:scale-110 cursor-pointer z-20"
                            title="Next slide"
                        >
                            <ChevronRightIcon size={14} color="#6C306E" />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md z-20">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setPreviewActiveIndex(idx)}
                                    className={`transition-all rounded-full cursor-pointer ${
                                        previewActiveIndex === idx ? 'w-4 h-1.5 bg-white' : 'size-1.5 bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Slides List Table */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-[#EFE0EF] flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-[#241224]">
                            Slider Priority &amp; Reorder
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Drag rows or use arrows to change the presentation sequence.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#6C306E] hover:bg-[#4A1D4C] transition shadow-2xs cursor-pointer"
                    >
                        <PlusIcon size={13} />
                        <span>Add Slide</span>
                    </button>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <ClassicLoader className="mx-auto" />
                        <p className="text-xs text-slate-500 mt-2">Loading banners...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs">
                        No banners configured. Click &quot;Add Slide&quot; to create one.
                    </div>
                ) : (
                    <div className="divide-y divide-[#EFE0EF]">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                draggable
                                onDragStart={() => setDraggedIndex(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    if (draggedIndex !== null && draggedIndex !== index) {
                                        handleMoveBanner(draggedIndex, index)
                                    }
                                    setDraggedIndex(null)
                                }}
                                className={`p-4 flex items-center justify-between gap-4 transition-all ${
                                    draggedIndex === index
                                        ? 'bg-[#FAF6FA] border-2 border-dashed border-[#6C306E]'
                                        : 'hover:bg-[#FAF6FA]/50 bg-white'
                                }`}
                            >
                                {/* Left: Drag handle & Priority Rank */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div
                                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#6C306E] p-1 rounded transition"
                                        title="Drag to reorder"
                                    >
                                        <GripVerticalIcon size={16} />
                                    </div>

                                    <div className="size-8 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center font-black text-xs shrink-0">
                                        #{index + 1}
                                    </div>
                                </div>

                                {/* Center: Thumbnail & Meta */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-24 sm:w-28 aspect-[21/9] rounded-lg border border-[#EFE0EF] bg-slate-50 relative shrink-0 overflow-hidden shadow-2xs">
                                        {banner.image ? (
                                            <Image
                                                src={banner.image}
                                                alt={banner.title || 'Banner'}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-extrabold text-xs sm:text-sm text-[#241224] truncate">
                                                {banner.title || `Slide #${index + 1}`}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActiveRow(banner.id)}
                                                className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full cursor-pointer transition ${
                                                    banner.isActive !== false
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}
                                            >
                                                {banner.isActive !== false ? 'Active' : 'Hidden'}
                                            </button>
                                        </div>

                                        {banner.subtitle && (
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                {banner.subtitle}
                                            </p>
                                        )}

                                        {banner.link && (
                                            <p className="text-[10px] text-[#6C306E] truncate font-medium mt-0.5">
                                                🔗 {banner.link}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Reorder arrows & Edit/Delete */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => handleMoveBanner(index, index - 1)}
                                        className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600 hover:text-[#6C306E] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                                        title="Move up"
                                    >
                                        ▲
                                    </button>

                                    <button
                                        type="button"
                                        disabled={index === banners.length - 1}
                                        onClick={() => handleMoveBanner(index, index + 1)}
                                        className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600 hover:text-[#6C306E] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                                        title="Move down"
                                    >
                                        ▼
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(banner)}
                                        className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600 hover:text-[#6C306E] flex items-center justify-center hover:bg-white transition cursor-pointer ml-1"
                                        title="Edit banner"
                                    >
                                        <EditIcon size={12} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        className="size-7 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] text-slate-400 hover:text-rose-600 flex items-center justify-center hover:bg-rose-50 transition cursor-pointer"
                                        title="Delete banner"
                                    >
                                        <TrashIcon size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Clean, Modern Edit / Add Banner Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#EFE0EF] flex items-center justify-between shrink-0 bg-[#FAF6FA]/50">
                            <div>
                                <h3 className="text-lg font-extrabold text-[#241224]">
                                    {editingBanner ? 'Edit Hero Banner' : 'Add Hero Banner'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Configure image, text overlay, and redirection link.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-8 rounded-full bg-white border border-[#EFE0EF] text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                            >
                                <CloseIcon size={14} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left: Form Inputs */}
                                <div className="space-y-3.5">
                                    {/* Upload Dropzone */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Banner Image
                                        </label>
                                        
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-[#EFE0EF] hover:border-[#6C306E] bg-[#FAF6FA]/60 rounded-2xl p-4 text-center cursor-pointer transition group"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageFileSelect}
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                            />
                                            <div className="size-9 rounded-xl bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] shadow-2xs mb-1.5 group-hover:scale-105 transition">
                                                {isUploadingImage ? (
                                                    <div className="w-4 h-4 rounded-full border-2 border-[#6C306E]/30 border-t-[#6C306E] animate-spin shrink-0" />
                                                ) : (
                                                    <UploadCloudIcon size={18} />
                                                )}
                                            </div>
                                            <p className="text-xs font-extrabold text-[#241224]">
                                                {isUploadingImage ? 'Uploading Image...' : 'Click to Upload Image(s)'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                PNG, JPG, WEBP (Supports multiple files)
                                            </p>
                                        </div>

                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                                placeholder="Or paste image URL"
                                                className="w-full px-3 py-1.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                            />
                                        </div>
                                    </div>

                                    {/* Campaign Title */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Campaign Title (Displays on Banner)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g. Summer Glow Collection"
                                            className="w-full px-3 py-2 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                        />
                                    </div>

                                    {/* Subtitle */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Subtitle (Displays on Banner)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                            placeholder="e.g. Authentic UK beauty imported directly"
                                            className="w-full px-3 py-2 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                        />
                                    </div>

                                    {/* Destination Link */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-slate-700">
                                                Destination Link (Where click redirects)
                                            </label>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Click any category below to auto-fill link
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.link}
                                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                            placeholder="e.g. /shop, /shop?category=Skincare or https://..."
                                            className="w-full px-3 py-2 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E] focus:bg-white transition"
                                        />

                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            {quickLinks.map((item, idx) => {
                                                const isSelected = formData.link === item.url
                                                return (
                                                    <button
                                                        key={`${item.label}-${idx}`}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, link: item.url }))}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-[#6C306E] text-white border-[#6C306E] shadow-2xs'
                                                                : 'text-[#6C306E] bg-[#FAF6FA] border-[#EFE0EF] hover:bg-[#EFE0EF] hover:border-[#6C306E]/30'
                                                        }`}
                                                        title={`Set destination to: ${item.url}`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Order & Active */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold text-slate-700">Display Order:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.displayOrder}
                                                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                                                className="w-16 px-2.5 py-1 rounded-lg border border-[#EFE0EF] text-xs font-black text-[#6C306E] text-center"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                className="accent-[#6C306E] size-3.5 rounded cursor-pointer"
                                            />
                                            <span>Active on Storefront</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Right: Live Preview Box */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Live Preview
                                    </label>

                                    <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-2xl overflow-hidden bg-[#FAF6FA] border border-[#EFE0EF] shadow-sm flex items-center justify-center">
                                        {formData.image ? (
                                            <>
                                                <Image
                                                    src={formData.image}
                                                    alt={formData.title || 'Preview'}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />

                                                {/* Live Overlay of Title & Subtitle */}
                                                {(formData.title || formData.subtitle) && (
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-4 z-10 pointer-events-none">
                                                        <div className="text-white space-y-0.5">
                                                            {formData.title && (
                                                                <h4 className="text-sm font-extrabold text-white drop-shadow-md">
                                                                    {formData.title}
                                                                </h4>
                                                            )}
                                                            {formData.subtitle && (
                                                                <p className="text-[10px] text-white/90 font-medium line-clamp-2 drop-shadow-sm">
                                                                    {formData.subtitle}
                                                                </p>
                                                            )}
                                                            {formData.link && (
                                                                <div className="pt-0.5">
                                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
                                                                        <span>Explore</span>
                                                                        <ChevronRightIcon size={9} color="#FFFFFF" />
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center p-6 text-slate-400 space-y-1">
                                                <CameraIcon size={24} className="mx-auto text-slate-300" />
                                                <p className="text-xs text-slate-400 font-medium">Upload an image to see preview</p>
                                            </div>
                                        )}
                                    </div>

                                    {formData.link && (
                                        <p className="text-[10px] text-slate-500 truncate">
                                            Target URL: <span className="font-semibold text-[#6C306E]">{formData.link}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer with ONE Single Clear Action Button */}
                        <div className="px-6 py-3.5 border-t border-[#EFE0EF] bg-[#FAF6FA] flex items-center justify-between shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 bg-white border border-[#EFE0EF] hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveBanner}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-extrabold text-white bg-[#6C306E] hover:bg-[#4A1D4C] shadow-md shadow-[#6C306E]/20 transition disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon size={14} />
                                        <span>Save Banner</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
