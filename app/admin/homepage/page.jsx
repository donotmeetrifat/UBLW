'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
    PlusIcon,
    TrashIcon,
    GripVerticalIcon,
    SearchIcon,
    CloseIcon,
    CheckIcon,
    BagIcon
} from '@/components/icons'

const DEFAULT_SECTIONS = {
    newArrivals: {
        enabled: true,
        title: 'New UK Arrivals',
        description: 'Discover the latest authentic UK imported skincare, cult cosmetics, and personal care.',
        displayLimit: 4,
        productIds: []
    },
    bestSelling: {
        enabled: true,
        title: 'Best Selling Beauty',
        description: 'Discover the latest authentic UK imported skincare, cult cosmetics, and personal care.',
        displayLimit: 8,
        productIds: []
    }
}

export default function AdminHomepageSectionsPage() {
    const currency = '৳'

    const [activeTab, setActiveTab] = useState('newArrivals') // 'newArrivals' | 'bestSelling'
    const [sections, setSections] = useState(DEFAULT_SECTIONS)
    const [allProducts, setAllProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState(null)

    // Modal state for adding products
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [catalogSearch, setCatalogSearch] = useState('')
    const [catalogCategory, setCatalogCategory] = useState('All')

    // Live mini-preview toggle
    const [showLivePreview, setShowLivePreview] = useState(false)

    // 1. Fetch initial configuration & product catalog
    const fetchSectionsAndProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/homepage-sections?_t=${Date.now()}`, {
                cache: 'no-store'
            })
            const data = await res.json()

            if (data.success) {
                if (data.sections) {
                    setSections({
                        newArrivals: {
                            ...DEFAULT_SECTIONS.newArrivals,
                            ...(data.sections.newArrivals || {}),
                            productIds: Array.isArray(data.sections.newArrivals?.productIds)
                                ? data.sections.newArrivals.productIds
                                : []
                        },
                        bestSelling: {
                            ...DEFAULT_SECTIONS.bestSelling,
                            ...(data.sections.bestSelling || {}),
                            productIds: Array.isArray(data.sections.bestSelling?.productIds)
                                ? data.sections.bestSelling.productIds
                                : []
                        }
                    })
                }
                if (Array.isArray(data.products)) {
                    setAllProducts(data.products)
                }
            } else {
                toast.error(data.message || 'Failed to load homepage sections')
            }
        } catch (err) {
            console.error('Error fetching admin homepage sections:', err)
            toast.error('Network error loading homepage sections')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSectionsAndProducts()
    }, [])

    // Available categories derived from catalog
    const availableCategories = useMemo(() => {
        const set = new Set()
        allProducts.forEach(p => {
            if (p.category) set.add(p.category)
        })
        return ['All', ...Array.from(set)]
    }, [allProducts])

    // Current active section configuration
    const currentSectionConfig = sections[activeTab] || DEFAULT_SECTIONS[activeTab]

    // Map current section productIds to full product objects in exact priority order
    const curatedProducts = useMemo(() => {
        const list = []
        const productMap = new Map()
        allProducts.forEach(p => {
            if (p && p.id) productMap.set(p.id, p)
        })

        currentSectionConfig.productIds.forEach((id, index) => {
            const found = productMap.get(id)
            if (found) {
                list.push({ ...found, priorityOrder: index + 1 })
            } else {
                list.push({
                    id,
                    name: `Curated UK Product (${id.slice(0, 8)})`,
                    category: 'Beauty',
                    price: 0,
                    images: ['/product_img1.png'],
                    priorityOrder: index + 1,
                    isMissing: true
                })
            }
        })
        return list
    }, [allProducts, currentSectionConfig.productIds])

    // Filter catalog products inside the "Add Products" modal
    const filteredCatalog = useMemo(() => {
        const query = catalogSearch.toLowerCase().trim()
        const selectedIdSet = new Set(currentSectionConfig.productIds)

        return allProducts.filter(prod => {
            if (!prod) return false
            if (catalogCategory !== 'All' && prod.category !== catalogCategory) {
                return false
            }
            if (query) {
                const nameMatch = (prod.name || '').toLowerCase().includes(query)
                const brandMatch = (prod.brand || '').toLowerCase().includes(query)
                const catMatch = (prod.category || '').toLowerCase().includes(query)
                if (!nameMatch && !brandMatch && !catMatch) return false
            }
            return true
        }).map(prod => ({
            ...prod,
            isAlreadyAdded: selectedIdSet.has(prod.id),
            currentOrder: selectedIdSet.has(prod.id)
                ? currentSectionConfig.productIds.indexOf(prod.id) + 1
                : null
        }))
    }, [allProducts, catalogSearch, catalogCategory, currentSectionConfig.productIds])

    // --- Actions for Curated Priority List ---

    const handleUpdateSectionMeta = (field, value) => {
        setSections(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }))
    }

    const handleAddProduct = (productId) => {
        if (currentSectionConfig.productIds.includes(productId)) {
            toast('Product already in this section')
            return
        }

        const updatedIds = [...currentSectionConfig.productIds, productId]
        setSections(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                productIds: updatedIds
            }
        }))
        toast.success(`Product added to priority #${updatedIds.length}!`)
    }

    const handleRemoveProduct = (productId) => {
        const updatedIds = currentSectionConfig.productIds.filter(id => id !== productId)
        setSections(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                productIds: updatedIds
            }
        }))
        toast.success('Product removed from section')
    }

    const handleMoveProduct = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= currentSectionConfig.productIds.length) return
        const ids = [...currentSectionConfig.productIds]
        const [moved] = ids.splice(fromIndex, 1)
        ids.splice(toIndex, 0, moved)

        setSections(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                productIds: ids
            }
        }))
    }

    const handleDirectOrderChange = (fromIndex, newRank) => {
        const targetRank = parseInt(newRank, 10)
        if (isNaN(targetRank)) return
        const toIndex = Math.max(0, Math.min(targetRank - 1, currentSectionConfig.productIds.length - 1))
        if (fromIndex === toIndex) return
        handleMoveProduct(fromIndex, toIndex)
        toast.success(`Moved to position #${toIndex + 1}`)
    }

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, targetIndex) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null)
            return
        }
        handleMoveProduct(draggedIndex, targetIndex)
        setDraggedIndex(null)
        toast.success(`Product prioritized to position #${targetIndex + 1}`)
    }

    // Reset section to default
    const handleResetDefaults = () => {
        if (confirm(`Reset "${activeTab === 'newArrivals' ? 'New UK Arrivals' : 'Best Selling Beauty'}" to default automatic sorting?`)) {
            setSections(prev => ({
                ...prev,
                [activeTab]: {
                    ...DEFAULT_SECTIONS[activeTab],
                    productIds: []
                }
            }))
            toast.success('Section reset to default auto-sorting')
        }
    }

    // Save and Publish live across the entire website
    const handleSaveAndPublish = async () => {
        try {
            setSaving(true)
            const toastId = toast.loading('Publishing homepage showcase to database & server...')

            const res = await fetch('/api/admin/homepage-sections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sections)
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Homepage showcase published! All visitors now see your curated product order.', { id: toastId })

                // Synchronize locally and across all client browser windows & tabs
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('ukbl_cached_homepage_sections', JSON.stringify(data.sections))
                        localStorage.setItem('ukbl_sections_synced', Date.now().toString())
                        window.dispatchEvent(new CustomEvent('homepage-sections-updated'))

                        const bc = new BroadcastChannel('ukbl_catalog_channel')
                        bc.postMessage({
                            type: 'homepage-sections-updated',
                            sections: data.sections
                        })
                    } catch (syncErr) {
                        console.error('Client sync error:', syncErr)
                    }
                }
            } else {
                toast.error(data.message || 'Failed to publish changes', { id: toastId })
            }
        } catch (err) {
            console.error('Error saving homepage sections:', err)
            toast.error('Network error saving changes')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-[1520px] w-full mx-auto space-y-6">
            {/* Top Showcase Studio Hero & Actions Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-subtle flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-3xl">
                    {/* Studio Pill Sub-heading */}
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-50 text-plum font-semibold text-[11px] tracking-wide uppercase border border-purple-100">
                        <span>Homepage Showcase Studio</span>
                    </div>
                    {/* Page Title */}
                    <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                        Homepage Curated Sections & Priorities
                    </h1>
                </div>

                {/* Studio Actions Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 w-full xl:w-auto justify-start xl:justify-end">
                    {/* View Live Store */}
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs"
                    >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M2 3h20v14H2z"></path>
                            <path d="M8 21h8"></path>
                            <path d="M12 17v4"></path>
                        </svg>
                        <span>View Live Store</span>
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M7 17L17 7M17 7H7M17 7V17"></path>
                        </svg>
                    </Link>

                    {/* Reset Auto */}
                    <button
                        onClick={handleResetDefaults}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                        type="button"
                    >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        <span>Reset Auto</span>
                    </button>

                    {/* Save & Publish Showcase (Primary Action) */}
                    <button
                        onClick={handleSaveAndPublish}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 h-9 rounded-xl bg-plum hover:bg-plum-hover text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] disabled:opacity-75 cursor-pointer shrink-0"
                        type="button"
                    >
                        {saving ? (
                            <>
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                                <span>Publishing Showcase...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 text-white/90 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Save & Publish Showcase</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* BEGIN: SectionSwitcherCards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: New UK Arrivals */}
                <div
                    onClick={() => setActiveTab('newArrivals')}
                    className={`relative rounded-2xl p-5 cursor-pointer transition-all ${
                        activeTab === 'newArrivals'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                                activeTab === 'newArrivals'
                                    ? 'bg-plum text-white'
                                    : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-display font-bold text-base ${activeTab === 'newArrivals' ? 'text-slate-900' : 'text-slate-800'}`}>
                                        1. New UK Arrivals
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <span>{sections.newArrivals.title || 'New UK Arrivals'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>Placed directly beneath the Hero banner</span>
                                </p>
                            </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                            sections.newArrivals.productIds.length > 0
                                ? 'bg-purple-50 text-plum border-purple-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {sections.newArrivals.productIds.length > 0
                                ? `${sections.newArrivals.productIds.length} Curated`
                                : 'Auto Latest'}
                        </span>
                    </div>
                </div>

                {/* Card 2: Best Selling Beauty */}
                <div
                    onClick={() => setActiveTab('bestSelling')}
                    className={`relative rounded-2xl p-5 cursor-pointer transition-all ${
                        activeTab === 'bestSelling'
                            ? 'bg-white border-2 border-plum shadow-card'
                            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-subtle hover:shadow-card'
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                activeTab === 'bestSelling'
                                    ? 'bg-plum text-white shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className={`font-display font-bold text-base ${activeTab === 'bestSelling' ? 'text-slate-900' : 'text-slate-800'}`}>
                                    2. Best Selling Beauty
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <span>{sections.bestSelling.title || 'Best Selling Beauty'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>Signature high-converting storefront grid</span>
                                </p>
                            </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
                            sections.bestSelling.productIds.length > 0
                                ? 'bg-purple-50 text-plum border-purple-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {sections.bestSelling.productIds.length > 0
                                ? `${sections.bestSelling.productIds.length} Curated`
                                : 'Auto Bestsellers'}
                        </span>
                    </div>
                </div>
            </div>
            {/* END: SectionSwitcherCards */}

            {/* BEGIN: ConfigurationPanel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-subtle space-y-6">
                {/* Panel Header & Storefront Status Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                                Configure {activeTab === 'newArrivals' ? 'New UK Arrivals' : 'Best Selling Beauty'}
                            </h2>
                            {currentSectionConfig.enabled && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Active on Storefront
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Customize section heading, customer advisory description, and maximum display count.
                        </p>
                    </div>

                    {/* Custom Checkbox / Toggle */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={currentSectionConfig.enabled}
                            onChange={(e) => handleUpdateSectionMeta('enabled', e.target.checked)}
                            className="w-4 h-4 rounded text-plum accent-plum focus:ring-plum/30 border-slate-300 transition cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-800">Enable Section on Storefront</span>
                    </label>
                </div>

                {/* Section Configuration Inputs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Section Heading Title Input */}
                    <div className="lg:col-span-5 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700" htmlFor="sectionHeading">
                            Section Heading Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-plum/20 focus:border-plum transition placeholder-slate-400 focus:outline-hidden"
                                id="sectionHeading"
                                placeholder="e.g. New UK Arrivals"
                                type="text"
                                value={currentSectionConfig.title || ''}
                                onChange={(e) => handleUpdateSectionMeta('title', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Section Subtitle / Description Input */}
                    <div className="lg:col-span-7 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700" htmlFor="sectionSubtitle">
                            Section Subtitle / Description
                        </label>
                        <div className="relative">
                            <input
                                className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-plum/20 focus:border-plum transition placeholder-slate-400 focus:outline-hidden"
                                id="sectionSubtitle"
                                placeholder="Customer advisory headline or promotional context"
                                type="text"
                                value={currentSectionConfig.description || ''}
                                onChange={(e) => handleUpdateSectionMeta('description', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Display Limit Pills & Preview Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4">
                    {/* Max Storefront Display Limit Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700 mr-1.5">Max Storefront Display Limit:</span>
                        {[4, 6, 8, 12, 16].map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleUpdateSectionMeta('displayLimit', num)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    currentSectionConfig.displayLimit === num
                                        ? 'bg-plum text-white shadow-2xs'
                                        : 'font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {num} Products
                            </button>
                        ))}
                    </div>

                    {/* Mini Live Preview CTA */}
                    <button
                        type="button"
                        onClick={() => setShowLivePreview(prev => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-plum transition cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-plum" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>{showLivePreview ? 'Hide Live Mini-Preview' : 'Show Live Mini-Preview'}</span>
                    </button>
                </div>
            </div>
            {/* END: ConfigurationPanel */}

            {/* Optional Live Mini Preview */}
            {showLivePreview && (
                <div className="bg-[#FAF9FB] p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase text-plum tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 inline-block">
                                Live Customer Storefront Preview
                            </span>
                            <h3 className="text-lg font-bold font-display text-slate-900 mt-1.5">{currentSectionConfig.title}</h3>
                            <p className="text-xs text-slate-500">{currentSectionConfig.description}</p>
                        </div>
                        <button
                            onClick={() => setShowLivePreview(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                            type="button"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {curatedProducts.slice(0, currentSectionConfig.displayLimit).map((p, idx) => (
                            <div key={p.id || idx} className="bg-white p-3 rounded-xl border border-slate-200/80 text-center space-y-2 shadow-2xs">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-plum text-white">
                                    Priority #{idx + 1}
                                </span>
                                <div className="w-20 h-20 mx-auto relative rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    {p.images && p.images[0] ? (
                                        <Image
                                            src={p.images[0]}
                                            alt={p.name}
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    ) : (
                                        <BagIcon size={20} color="#94A3B8" />
                                    )}
                                </div>
                                <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                                    {p.name}
                                </h4>
                                <div className="text-xs font-bold text-plum">
                                    {currency}{Number(p.price || 0).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BEGIN: CuratedProductsSection */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-subtle space-y-6">
                {/* Products Area Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                                Curated Products & Serial Priorities
                            </h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {curatedProducts.length} Selected
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Products appear on the homepage exactly in the order shown below. Drag rows or use the Move buttons / Serial numbers to adjust priorities.
                        </p>
                    </div>

                    {/* Add Products CTA Button */}
                    <button
                        onClick={() => {
                            setCatalogSearch('')
                            setIsAddModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-plum hover:bg-plum-hover text-white text-xs font-semibold shadow-sm transition shrink-0 active:scale-[0.98] cursor-pointer"
                        type="button"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="12" x2="12" y1="5" y2="19"></line>
                            <line x1="5" x2="19" y1="12" y2="12"></line>
                        </svg>
                        <span>Add Products from Catalog</span>
                    </button>
                </div>

                {/* Empty State Container */}
                {curatedProducts.length === 0 ? (
                    <div className="py-16 px-6 border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/40">
                        {/* Sparkling Icon Badge */}
                        <div className="w-14 h-14 rounded-2xl bg-plum/10 text-plum flex items-center justify-center mb-4 shadow-2xs">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        {/* Empty State Headings */}
                        <h3 className="font-display font-bold text-base text-slate-900 mb-1.5">No Custom Products Assigned Yet</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
                            This section is currently using automatic catalog sorting ({activeTab === 'newArrivals' ? 'newest imports first' : 'highest customer reviews first'}). Click below to select specific authentic products and curate their exact display sequence.
                        </p>
                        {/* Center Call to Action */}
                        <button
                            onClick={() => {
                                setCatalogSearch('')
                                setIsAddModalOpen(true)
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-hover text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
                            type="button"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="12" x2="12" y1="5" y2="19"></line>
                                <line x1="5" x2="19" y1="12" y2="12"></line>
                            </svg>
                            <span>Select Products from Catalog</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-subtle">
                        {curatedProducts.map((prod, index) => (
                            <div
                                key={prod.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                                    draggedIndex === index
                                        ? 'bg-plum/5 border-2 border-dashed border-plum'
                                        : 'hover:bg-slate-50/60 bg-white'
                                }`}
                            >
                                {/* Left: Drag handle & Priority Rank */}
                                <div className="flex items-center gap-3 shrink-0">
                                    <div
                                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-plum p-1.5 rounded-lg transition"
                                        title="Drag to reorder priority"
                                    >
                                        <GripVerticalIcon size={18} />
                                    </div>

                                    {/* Priority Rank Badge */}
                                    <div className="w-10 h-10 rounded-xl bg-plum text-white flex flex-col items-center justify-center font-bold shadow-2xs shrink-0 font-display">
                                        <span className="text-[9px] uppercase tracking-tighter opacity-80">RANK</span>
                                        <span className="text-sm leading-none font-bold">#{index + 1}</span>
                                    </div>
                                </div>

                                {/* Center: Product Thumbnail & Meta */}
                                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white relative shrink-0 overflow-hidden flex items-center justify-center p-1">
                                        {prod.images && prod.images[0] ? (
                                            <Image
                                                src={prod.images[0]}
                                                alt={prod.name}
                                                fill
                                                className="object-contain p-1"
                                                unoptimized
                                            />
                                        ) : (
                                            <BagIcon size={20} color="#94A3B8" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-semibold text-plum bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 uppercase tracking-wide">
                                                {prod.category || 'Beauty'}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {prod.brand || 'UK Import'}
                                            </span>
                                            {index < currentSectionConfig.displayLimit ? (
                                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Visible on Storefront
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                    Queue #{index + 1}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                                            {prod.name}
                                        </h4>

                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="font-bold text-plum">
                                                {currency}{Number(prod.price || 0).toLocaleString()}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className={`font-medium text-[11px] ${prod.inStock !== false ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Priority Adjusters & Remove Action */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Direct Serial Input */}
                                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                                        <span className="text-[10px] font-semibold text-slate-500">Serial:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={curatedProducts.length}
                                            defaultValue={index + 1}
                                            key={`rank-${prod.id}-${index}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleDirectOrderChange(index, e.target.value)
                                                }
                                            }}
                                            onBlur={(e) => handleDirectOrderChange(index, e.target.value)}
                                            className="w-10 text-center text-xs font-bold text-slate-900 bg-white rounded-lg border border-slate-200 py-0.5 focus:ring-1 focus:ring-plum focus:border-plum focus:outline-hidden"
                                        />
                                    </div>

                                    {/* Move Up */}
                                    <button
                                        type="button"
                                        onClick={() => handleMoveProduct(index, index - 1)}
                                        disabled={index === 0}
                                        className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-xs transition shadow-2xs cursor-pointer"
                                        title="Move Priority Up"
                                    >
                                        ▲
                                    </button>

                                    {/* Move Down */}
                                    <button
                                        type="button"
                                        onClick={() => handleMoveProduct(index, index + 1)}
                                        disabled={index === curatedProducts.length - 1}
                                        className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-xs transition shadow-2xs cursor-pointer"
                                        title="Move Priority Down"
                                    >
                                        ▼
                                    </button>

                                    {/* Remove from Section */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(prod.id)}
                                        className="w-8 h-8 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                                        title="Remove from this showcase section"
                                    >
                                        <TrashIcon size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* END: CuratedProductsSection */}

            {/* Product Selector Catalog Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/40">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-50 text-plum font-semibold text-[10px] tracking-wide uppercase border border-purple-100">
                                    Catalog Product Selector
                                </div>
                                <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
                                    Add Products to {activeTab === 'newArrivals' ? 'New UK Arrivals' : 'Best Selling Beauty'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Search and select authentic UK beauty products from catalog to add to your showcase.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                                type="button"
                            >
                                <CloseIcon size={16} />
                            </button>
                        </div>

                        {/* Search & Category Filter Bar */}
                        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <div className="relative flex-1 w-full">
                                <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={catalogSearch}
                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                    placeholder="Search products by title, UK brand origin, or category..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-plum focus:ring-2 focus:ring-plum/20"
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar shrink-0">
                                {availableCategories.slice(0, 6).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCatalogCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 cursor-pointer ${
                                            catalogCategory === cat
                                                ? 'bg-plum text-white shadow-2xs font-semibold'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                        type="button"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Catalog Product Grid / List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
                            {filteredCatalog.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-xs">
                                    No products matching your search criteria.
                                </div>
                            ) : (
                                filteredCatalog.map(prod => (
                                    <div
                                        key={prod.id}
                                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                                            prod.isAlreadyAdded
                                                ? 'bg-emerald-50/40 border-emerald-200'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white relative shrink-0 overflow-hidden flex items-center justify-center p-1">
                                                {prod.images && prod.images[0] ? (
                                                    <Image
                                                        src={prod.images[0]}
                                                        alt={prod.name}
                                                        fill
                                                        className="object-contain p-1"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <BagIcon size={18} color="#94A3B8" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-semibold uppercase text-plum bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                                        {prod.category}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {prod.brand || 'UK Import'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-xs text-slate-900 truncate mt-1">
                                                    {prod.name}
                                                </h4>
                                                <div className="text-xs font-bold text-plum mt-0.5">
                                                    {currency}{Number(prod.price || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {prod.isAlreadyAdded ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300 shadow-2xs">
                                                        <CheckIcon size={13} />
                                                        <span>Added (Rank #{prod.currentOrder})</span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveProduct(prod.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                                        title="Remove from section"
                                                        type="button"
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddProduct(prod.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-plum hover:bg-plum-hover transition shadow-2xs cursor-pointer"
                                                    type="button"
                                                >
                                                    <PlusIcon size={14} />
                                                    <span>Add to Showcase</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
                            <span className="text-xs text-slate-500 font-medium">
                                {currentSectionConfig.productIds.length} products currently in this section
                            </span>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-plum hover:bg-plum-hover transition shadow-2xs cursor-pointer"
                                type="button"
                            >
                                Done Selecting
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
