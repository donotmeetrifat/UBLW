'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
    SparklesIcon,
    RoyalCrownIcon,
    PlusIcon,
    TrashIcon,
    GripVerticalIcon,
    SearchIcon,
    CloseIcon,
    CheckIcon,
    RefreshIcon,
    ArrowRightIcon,
    EyeIcon,
    BagIcon,
    TagIcon,
    StoreFrontIcon,
    FilterIcon
} from '@/components/icons'
import ClassicLoader from '@/components/ui/classic-loader'

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
        description: 'Explore our most-loved UK imported skincare, cosmetics, and haircare essentials.',
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

    // Live preview view toggle
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
                // Product might have been deleted or from fallback dummy data
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
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#6C306E] bg-[#FAF6FA] px-2.5 py-1 rounded-full border border-[#EFE0EF]">
                            Homepage Showcase Studio
                        </span>
                        <span className="text-slate-400 text-xs">• Live Database Sync</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">
                        Homepage Curated Sections & Priorities
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                        Select which authentic UK imported products appear on the storefront homepage and set their exact serial rank (#1, #2, #3...). All changes publish instantly across frontend, backend, and database.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 hover:text-[#6C306E] transition shadow-2xs"
                    >
                        <StoreFrontIcon size={14} color="#6C306E" />
                        <span>View Live Store</span>
                        <ArrowRightIcon size={12} />
                    </Link>

                    <button
                        onClick={handleResetDefaults}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-[#EFE0EF] transition"
                        title="Reset current section to automatic sorting"
                    >
                        <RefreshIcon size={14} />
                        <span>Reset Auto</span>
                    </button>

                    <button
                        onClick={handleSaveAndPublish}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-linear-to-r from-[#6C306E] to-[#4A1D4C] hover:from-[#5A255C] hover:to-[#381439] shadow-md shadow-[#6C306E]/20 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <ClassicLoader />
                                <span>Publishing to Storefront...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon size={15} />
                                <span>Save & Publish Showcase</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Section Switcher Dual Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tab 1: New UK Arrivals */}
                <button
                    onClick={() => setActiveTab('newArrivals')}
                    className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-4 ${
                        activeTab === 'newArrivals'
                            ? 'bg-white border-[#6C306E] shadow-md shadow-[#6C306E]/10 ring-2 ring-[#6C306E]/20'
                            : 'bg-white/80 border-[#EFE0EF] hover:bg-white hover:border-[#6C306E]/40'
                    }`}
                >
                    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'newArrivals' ? 'bg-[#6C306E] text-white shadow-2xs' : 'bg-[#FAF6FA] text-[#6C306E]'
                    }`}>
                        <SparklesIcon size={22} color={activeTab === 'newArrivals' ? '#FFFFFF' : '#6C306E'} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-base text-[#241224]">
                                1. New UK Arrivals
                            </span>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                                sections.newArrivals.productIds.length > 0
                                    ? 'bg-[#6C306E]/10 text-[#6C306E] border border-[#6C306E]/20'
                                    : 'bg-slate-100 text-slate-500'
                            }`}>
                                {sections.newArrivals.productIds.length > 0
                                    ? `${sections.newArrivals.productIds.length} Curated`
                                    : 'Auto Latest'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {sections.newArrivals.title} • Placed directly beneath the Hero banner
                        </p>
                    </div>

                    {activeTab === 'newArrivals' && (
                        <div className="absolute top-0 right-0 w-2 h-full bg-[#6C306E]" />
                    )}
                </button>

                {/* Tab 2: Best Selling Beauty */}
                <button
                    onClick={() => setActiveTab('bestSelling')}
                    className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-4 ${
                        activeTab === 'bestSelling'
                            ? 'bg-white border-[#6C306E] shadow-md shadow-[#6C306E]/10 ring-2 ring-[#6C306E]/20'
                            : 'bg-white/80 border-[#EFE0EF] hover:bg-white hover:border-[#6C306E]/40'
                    }`}
                >
                    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'bestSelling' ? 'bg-[#6C306E] text-white shadow-2xs' : 'bg-[#FAF6FA] text-[#6C306E]'
                    }`}>
                        <RoyalCrownIcon size={22} color={activeTab === 'bestSelling' ? '#FFFFFF' : '#6C306E'} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-base text-[#241224]">
                                2. Best Selling Beauty
                            </span>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                                sections.bestSelling.productIds.length > 0
                                    ? 'bg-[#6C306E]/10 text-[#6C306E] border border-[#6C306E]/20'
                                    : 'bg-slate-100 text-slate-500'
                            }`}>
                                {sections.bestSelling.productIds.length > 0
                                    ? `${sections.bestSelling.productIds.length} Curated`
                                    : 'Auto Bestsellers'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {sections.bestSelling.title} • Signature high-converting storefront grid
                        </p>
                    </div>

                    {activeTab === 'bestSelling' && (
                        <div className="absolute top-0 right-0 w-2 h-full bg-[#6C306E]" />
                    )}
                </button>
            </div>

            {/* Section Settings Configuration Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE0EF]">
                    <div>
                        <h2 className="text-lg font-extrabold text-[#241224] flex items-center gap-2">
                            <span>Configure {activeTab === 'newArrivals' ? 'New UK Arrivals' : 'Best Selling Beauty'}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active on Homepage
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Customize section heading, customer advisory description, and maximum display count.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={currentSectionConfig.enabled}
                                onChange={(e) => handleUpdateSectionMeta('enabled', e.target.checked)}
                                className="accent-[#6C306E] size-4 rounded"
                            />
                            <span>Enable Section on Storefront</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Section Heading Title *
                        </label>
                        <input
                            type="text"
                            value={currentSectionConfig.title}
                            onChange={(e) => handleUpdateSectionMeta('title', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs font-bold text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                            placeholder="e.g. New UK Arrivals"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Section Subtitle / Description
                        </label>
                        <input
                            type="text"
                            value={currentSectionConfig.description}
                            onChange={(e) => handleUpdateSectionMeta('description', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                            placeholder="e.g. Discover the latest authentic UK imported skincare..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-slate-600">Max Storefront Display Limit:</span>
                        {[4, 6, 8, 12, 16].map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleUpdateSectionMeta('displayLimit', num)}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                    currentSectionConfig.displayLimit === num
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {num} Products
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowLivePreview(prev => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C306E] hover:underline"
                    >
                        <EyeIcon size={14} />
                        <span>{showLivePreview ? 'Hide Preview' : 'Show Live Mini-Preview'}</span>
                    </button>
                </div>
            </div>

            {/* Live Mini Preview (Optional Dropdown) */}
            {showLivePreview && (
                <div className="bg-[#FAF6FA] p-6 rounded-3xl border border-[#EFE0EF] shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#6C306E] tracking-wider">
                                Live Customer Storefront Preview
                            </span>
                            <h3 className="text-xl font-extrabold text-[#241224]">{currentSectionConfig.title}</h3>
                            <p className="text-xs text-slate-500">{currentSectionConfig.description}</p>
                        </div>
                        <button
                            onClick={() => setShowLivePreview(false)}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {curatedProducts.slice(0, currentSectionConfig.displayLimit).map((p, idx) => (
                            <div key={p.id || idx} className="bg-white p-3 rounded-2xl border border-[#EFE0EF] text-center space-y-2">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6C306E] text-white">
                                    Priority #{idx + 1}
                                </span>
                                <div className="size-20 mx-auto relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
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
                                <h4 className="text-[11px] font-bold text-[#241224] line-clamp-2 leading-tight">
                                    {p.name}
                                </h4>
                                <div className="text-xs font-black text-[#6C306E]">
                                    {currency}{Number(p.price || 0).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Product Priorities List */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-[#EFE0EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold text-[#241224]">
                                Curated Products & Serial Priorities
                            </h2>
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF]">
                                {curatedProducts.length} Selected
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Products appear on the homepage exactly in the order shown below. Drag rows or use the Move buttons / Serial numbers to adjust priorities.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setCatalogSearch('')
                            setIsAddModalOpen(true)
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-[#6C306E] hover:bg-[#3A0C38] shadow-xs transition shrink-0"
                    >
                        <PlusIcon size={15} />
                        <span>Add Products from Catalog</span>
                    </button>
                </div>

                {curatedProducts.length === 0 ? (
                    <div className="py-16 px-6 text-center max-w-md mx-auto space-y-3">
                        <div className="size-16 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E]">
                            <SparklesIcon size={28} color="#6C306E" />
                        </div>
                        <h3 className="text-base font-extrabold text-[#241224]">
                            No Custom Products Assigned Yet
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            This section is currently using automatic catalog sorting ({activeTab === 'newArrivals' ? 'newest imports first' : 'highest customer reviews first'}).
                            Click below to select specific authentic products and curate their exact display sequence.
                        </p>
                        <button
                            onClick={() => {
                                setCatalogSearch('')
                                setIsAddModalOpen(true)
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-xs mt-2"
                        >
                            <PlusIcon size={14} />
                            <span>Select Products from Catalog</span>
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-[#EFE0EF]">
                        {curatedProducts.map((prod, index) => (
                            <div
                                key={prod.id}
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
                                    <div className="size-10 rounded-xl bg-linear-to-br from-[#6C306E] to-[#3A0C38] text-white flex flex-col items-center justify-center font-extrabold shadow-2xs shrink-0">
                                        <span className="text-[9px] uppercase tracking-tighter opacity-70">RANK</span>
                                        <span className="text-sm leading-none">#{index + 1}</span>
                                    </div>
                                </div>

                                {/* Center: Product Thumbnail & Meta */}
                                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                    <div className="size-14 rounded-xl border border-[#EFE0EF] bg-slate-50 relative shrink-0 overflow-hidden flex items-center justify-center">
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-[#6C306E] bg-[#FAF6FA] px-2 py-0.5 rounded-full border border-[#EFE0EF]">
                                                {prod.category || 'Beauty'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {prod.brand || 'UK Import'}
                                            </span>
                                            {index < currentSectionConfig.displayLimit ? (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Visible on Homepage
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                    Queue #{index + 1}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-extrabold text-sm text-[#241224] truncate mt-0.5">
                                            {prod.name}
                                        </h3>

                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="font-extrabold text-[#6C306E]">
                                                {currency}{Number(prod.price || 0).toLocaleString()}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className={`font-semibold text-[11px] ${prod.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                {prod.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Priority Adjusters & Remove Action */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Direct Serial Input */}
                                    <div className="hidden sm:flex items-center gap-1 bg-[#FAF6FA] px-2 py-1 rounded-xl border border-[#EFE0EF]">
                                        <span className="text-[10px] font-bold text-slate-400">Serial:</span>
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
                                            className="w-10 text-center text-xs font-black text-[#6C306E] bg-white rounded-lg border border-[#EFE0EF] py-0.5 focus:outline-hidden"
                                        />
                                    </div>

                                    {/* Move Up */}
                                    <button
                                        type="button"
                                        onClick={() => handleMoveProduct(index, index - 1)}
                                        disabled={index === 0}
                                        className="size-8 rounded-xl border border-[#EFE0EF] bg-white hover:bg-[#FAF6FA] text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-sm transition shadow-2xs"
                                        title="Move Priority Up"
                                    >
                                        ▲
                                    </button>

                                    {/* Move Down */}
                                    <button
                                        type="button"
                                        onClick={() => handleMoveProduct(index, index + 1)}
                                        disabled={index === curatedProducts.length - 1}
                                        className="size-8 rounded-xl border border-[#EFE0EF] bg-white hover:bg-[#FAF6FA] text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-sm transition shadow-2xs"
                                        title="Move Priority Down"
                                    >
                                        ▼
                                    </button>

                                    {/* Remove from Section */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(prod.id)}
                                        className="size-8 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shadow-2xs"
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

            {/* Product Selector Catalog Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#EFE0EF] flex items-center justify-between shrink-0 bg-[#FAF6FA]/50">
                            <div>
                                <span className="text-[10px] font-black uppercase text-[#6C306E] tracking-wider">
                                    Catalog Product Selector
                                </span>
                                <h3 className="text-xl font-extrabold text-[#241224]">
                                    Add Products to {activeTab === 'newArrivals' ? 'New UK Arrivals' : 'Best Selling Beauty'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Search and select authentic UK beauty products from catalog to add to your showcase.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="size-9 rounded-full bg-white border border-[#EFE0EF] text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-2xs"
                            >
                                <CloseIcon size={16} />
                            </button>
                        </div>

                        {/* Search & Category Filter Bar */}
                        <div className="p-4 border-b border-[#EFE0EF] bg-white flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <div className="relative flex-1 w-full">
                                <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={catalogSearch}
                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                    placeholder="Search products by title, UK brand origin, or category..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA]/40 text-xs text-[#241224] focus:outline-hidden focus:border-[#6C306E]"
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar shrink-0">
                                {availableCategories.slice(0, 6).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCatalogCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                                            catalogCategory === cat
                                                ? 'bg-[#6C306E] text-white shadow-2xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
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
                                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                            prod.isAlreadyAdded
                                                ? 'bg-emerald-50/30 border-emerald-200'
                                                : 'bg-white border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA]/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="size-12 rounded-xl border border-[#EFE0EF] bg-white relative shrink-0 overflow-hidden flex items-center justify-center">
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
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-[#6C306E] bg-[#FAF6FA] px-2 py-0.5 rounded-full border border-[#EFE0EF]">
                                                        {prod.category}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {prod.brand || 'UK Import'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-xs text-[#241224] truncate mt-0.5">
                                                    {prod.name}
                                                </h4>
                                                <div className="text-xs font-black text-[#6C306E] mt-0.5">
                                                    {currency}{Number(prod.price || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {prod.isAlreadyAdded ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300 shadow-2xs">
                                                        <CheckIcon size={13} />
                                                        <span>Added (Rank #{prod.currentOrder})</span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveProduct(prod.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                                                        title="Remove from section"
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddProduct(prod.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#6C306E] hover:bg-[#3A0C38] transition shadow-2xs"
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
                        <div className="p-4 border-t border-[#EFE0EF] bg-[#FAF6FA] flex items-center justify-between shrink-0">
                            <span className="text-xs text-slate-500 font-semibold">
                                {currentSectionConfig.productIds.length} products currently in this section
                            </span>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2 rounded-full text-xs font-bold text-[#6C306E] bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] transition shadow-2xs"
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
