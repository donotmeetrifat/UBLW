'use client'

import { useEffect, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { setProduct as updateReduxProduct } from "@/lib/features/product/productSlice"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import {
    BagIcon,
    SearchIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    EyeIcon,
    CheckIcon,
    CloseIcon,
    SparklesIcon,
    BoxIcon,
    GripVerticalIcon,
    UploadCloudIcon,
    RoyalCrownIcon,
    StarIcon,
    ShieldCheckIcon,
    TruckIcon,
    ChevronRightIcon
} from "@/components/icons"
import AdminDropdown from "@/components/admin/AdminDropdown"

const CATEGORIES = [
    'All',
    'Skincare',
    'Makeup & Cult Beauty',
    'Haircare',
    'Fragrance',
    'Body & Wellness'
]

const FORM_CATEGORIES = [
    'Skincare',
    'Makeup & Cult Beauty',
    'Haircare',
    'Fragrance',
    'Body & Wellness'
]

const STOCK_OPTIONS = [
    { value: 'all', label: 'All Stock Status' },
    { value: 'in_stock', label: 'In Stock Only' },
    { value: 'low_stock', label: 'Low Stock (≤10)' },
    { value: 'out_of_stock', label: 'Out of Stock' }
]

const SORT_OPTIONS = [
    { value: 'views', label: 'Most Viewed' },
    { value: 'newest', label: 'Newest Listed' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'stock', label: 'Stock Count' }
]

const DEFAULT_BENEFITS = [
    "100% Authentic UK Imported Formulation ensuring optimal potency and purity.",
    "Dermatologically tested daily care tailored for sensitive skin.",
    "Delivers visible, clinically-proven nourishment, hydration, and glow.",
    "Direct London shipments with verified batch codes and authentic UK store packaging."
]

export default function AdminProductsPage() {
    const dispatch = useDispatch()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalViews: 0,
        lowStockCount: 0,
        inStockCount: 0
    })

    // Search, filter & sort state
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [stockFilter, setStockFilter] = useState('all')
    const [sortBy, setSortBy] = useState('views')

    // Modal & Editor state
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [deletingProduct, setDeletingProduct] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingImages, setIsUploadingImages] = useState(false)
    const [activePreviewImage, setActivePreviewImage] = useState(0)
    const [draggedImageIndex, setDraggedImageIndex] = useState(null)

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Skincare',
        brand: 'The Ordinary',
        price: '',
        mrp: '',
        stockCount: 50,
        inStock: true,
        images: ['/product_img1.png'],
        formulaProfile: '',
        benefits: [...DEFAULT_BENEFITS],
        whyYouWillLoveIt: '',
        sizeVolume: '30ml'
    })

    const [dbCategories, setDbCategories] = useState([
        'Skincare',
        'Makeup',
        'Haircare',
        'Fragrance',
        'Body Care',
        'Beauty Tools'
    ])

    const fileInputRef = useRef(null)

    // Load live categories from catalog
    useEffect(() => {
        const loadCategories = () => {
            fetch('/api/categories?all=true&_t=' + Date.now(), { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
                        setDbCategories(data.categories.map(c => c.name))
                    }
                })
                .catch(() => {})
        }
        loadCategories()

        if (typeof window !== 'undefined') {
            window.addEventListener('category-catalog-updated', loadCategories)
            return () => window.removeEventListener('category-catalog-updated', loadCategories)
        }
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/products?sort=${sortBy}&category=${encodeURIComponent(selectedCategory)}&_t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products)
                if (data.stats) setStats(data.stats)
            } else if (data.message) {
                console.warn('Admin products fetch returned message:', data.message)
            }
        } catch (error) {
            console.error('Error fetching admin products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [sortBy, selectedCategory])

    const handleOpenAdd = () => {
        setEditingProduct(null)
        setFormData({
            name: '',
            category: dbCategories[0] || 'Skincare',
            brand: 'The Ordinary',
            price: '',
            mrp: '',
            stockCount: 50,
            inStock: true,
            images: ['/product_img1.png'],
            formulaProfile: 'A high-strength vitamin and mineral formula that targets visible congestion, enhances skin barrier resilience, and promotes a smoother complexion. Authentic UK formulation.',
            benefits: [...DEFAULT_BENEFITS],
            whyYouWillLoveIt: 'Sourced directly from authorized UK retailers and laboratories. Formulated to provide lasting hydration and barrier defense without clogging pores or causing irritation.',
            sizeVolume: '30ml'
        })
        setActivePreviewImage(0)
        setIsEditorOpen(true)
    }

    const handleOpenEdit = (prod) => {
        setEditingProduct(prod)
        const initialImages = Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images
            : ['/product_img1.png']
        const initialBenefits = Array.isArray(prod.benefits) && prod.benefits.length > 0
            ? prod.benefits
            : [...DEFAULT_BENEFITS]

        setFormData({
            name: prod.name || '',
            category: prod.category || 'Skincare',
            brand: prod.brand || 'UK Import',
            price: prod.price || '',
            mrp: prod.mrp || prod.price || '',
            stockCount: prod.stockCount !== undefined ? prod.stockCount : 50,
            inStock: prod.inStock !== undefined ? Boolean(prod.inStock) : true,
            images: initialImages,
            formulaProfile: prod.formulaProfile || prod.description || '',
            benefits: initialBenefits,
            whyYouWillLoveIt: prod.whyYouWillLoveIt || 'Sourced with direct traceability from authorized UK brands and laboratories. Formulated to provide lasting radiance, barrier protection, and hydration.',
            sizeVolume: prod.sizeVolume || 'Standard Size'
        })
        setActivePreviewImage(0)
        setIsEditorOpen(true)
    }

    // Direct Image Upload Handler (Multiple Files in Full High Quality)
    const handleImageFilesSelected = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setIsUploadingImages(true)
        const uploadToast = toast.loading(`Uploading ${files.length} high-resolution image(s)...`)

        try {
            const uploadFormData = new FormData()
            files.forEach(file => {
                uploadFormData.append('files', file)
            })

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            })
            const data = await res.json()

            if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
                // If existing images had only dummy placeholder, replace it; otherwise append
                setFormData(prev => {
                    const filteredPrev = prev.images.filter(img => !img.startsWith('/product_img'))
                    const updated = [...filteredPrev, ...data.urls]
                    return {
                        ...prev,
                        images: updated.length > 0 ? updated : data.urls
                    }
                })
                toast.success(`${data.urls.length} image(s) uploaded in full high resolution!`, { id: uploadToast })
            } else {
                toast.error(data.message || 'Image upload failed', { id: uploadToast })
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('Network error during image upload', { id: uploadToast })
        } finally {
            setIsUploadingImages(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Reorder Images (Move Left / Move Right / Set as Cover)
    const moveImage = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= formData.images.length) return
        setFormData(prev => {
            const list = [...prev.images]
            const [moved] = list.splice(fromIndex, 1)
            list.splice(toIndex, 0, moved)
            return { ...prev, images: list }
        })
        setActivePreviewImage(toIndex)
    }

    const removeImage = (indexToRemove) => {
        if (formData.images.length <= 1) {
            toast.error('At least one product image is required')
            return
        }
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }))
        if (activePreviewImage >= indexToRemove) {
            setActivePreviewImage(Math.max(0, activePreviewImage - 1))
        }
    }

    const setAsCover = (index) => {
        if (index === 0) return
        setFormData(prev => {
            const list = [...prev.images]
            const [selected] = list.splice(index, 1)
            list.unshift(selected)
            return { ...prev, images: list }
        })
        setActivePreviewImage(0)
        toast.success('Cover image set to #1!')
    }

    // Drag and Drop Image Handlers
    const handleDragStart = (e, index) => {
        setDraggedImageIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, targetIndex) => {
        e.preventDefault()
        if (draggedImageIndex === null || draggedImageIndex === targetIndex) return
        moveImage(draggedImageIndex, targetIndex)
        setDraggedImageIndex(null)
    }

    // Benefit bullet point change
    const handleBenefitChange = (index, value) => {
        setFormData(prev => {
            const updated = [...prev.benefits]
            updated[index] = value
            return { ...prev, benefits: updated }
        })
    }

    const addBenefitField = () => {
        if (formData.benefits.length >= 6) {
            toast.error('Maximum 6 key benefits recommended')
            return
        }
        setFormData(prev => ({
            ...prev,
            benefits: [...prev.benefits, '']
        }))
    }

    const removeBenefitField = (index) => {
        if (formData.benefits.length <= 1) {
            toast.error('At least 1 benefit is required')
            return
        }
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index)
        }))
    }

    // Save Product (Create or Edit)
    const handleSaveProduct = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            toast.error('Product title is required')
            return
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Valid price is required')
            return
        }
        if (!formData.images || formData.images.length === 0) {
            toast.error('Please upload at least one image')
            return
        }

        setIsSaving(true)
        const toastId = toast.loading(editingProduct ? 'Saving updates...' : 'Listing product...')

        const payload = {
            name: formData.name.trim(),
            category: formData.category,
            brand: formData.brand.trim() || 'UK Import',
            price: parseFloat(formData.price),
            mrp: formData.mrp ? parseFloat(formData.mrp) : parseFloat(formData.price),
            stockCount: parseInt(formData.stockCount, 10) || 50,
            inStock: Boolean(formData.inStock),
            images: formData.images,
            description: formData.formulaProfile.trim(),
            formulaProfile: formData.formulaProfile.trim(),
            benefits: formData.benefits.filter(b => b.trim().length > 0),
            whyYouWillLoveIt: formData.whyYouWillLoveIt.trim(),
            sizeVolume: formData.sizeVolume || 'Standard'
        }

        try {
            if (editingProduct) {
                const res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                const data = await res.json()
                if (data.success) {
                    toast.success('Product updated successfully!', { id: toastId })
                    if (data.product) {
                        dispatch(updateReduxProduct([data.product]))
                    }
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_products_synced', Date.now().toString())
                        window.dispatchEvent(new CustomEvent('product-updated', { detail: { product: data.product } }))
                        window.dispatchEvent(new CustomEvent('product-catalog-updated'))
                    }
                    setIsEditorOpen(false)
                    setEditingProduct(null)
                    fetchProducts()
                } else {
                    toast.error(data.message || 'Failed to update product', { id: toastId })
                }
            } else {
                const res = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                const data = await res.json()
                if (data.success) {
                    toast.success('New product listed successfully in catalog!', { id: toastId })
                    if (data.product) {
                        dispatch(updateReduxProduct([data.product]))
                    }
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_products_synced', Date.now().toString())
                        window.dispatchEvent(new CustomEvent('product-updated', { detail: { product: data.product } }))
                        window.dispatchEvent(new CustomEvent('product-catalog-updated'))
                    }
                    setIsEditorOpen(false)
                    fetchProducts()
                } else {
                    toast.error(data.message || 'Failed to list product', { id: toastId })
                }
            }
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error('Connection error occurred while saving', { id: toastId })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteProduct = async () => {
        if (!deletingProduct) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/products/${deletingProduct.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message || 'Product removed successfully')
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_products_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('product-catalog-updated'))
                }
                setDeletingProduct(null)
                fetchProducts()
            } else {
                toast.error(data.message || 'Failed to remove product')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to remove product')
        } finally {
            setIsSaving(false)
        }
    }

    const toggleQuickStock = async (prod) => {
        const nextState = !prod.inStock
        try {
            const res = await fetch(`/api/products/${prod.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: nextState })
            })
            const data = await res.json()
            if (data.success) {
                setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, inStock: nextState } : p))
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_products_synced', Date.now().toString())
                    window.dispatchEvent(new CustomEvent('product-catalog-updated'))
                }
                toast.success(nextState ? 'Marked In Stock' : 'Marked Out of Stock')
            }
        } catch (error) {
            toast.error('Failed to update stock state')
        }
    }

    // Filter products locally by search and stock filter
    const filteredProducts = products.filter(p => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            const matchName = (p.name || '').toLowerCase().includes(q)
            const matchBrand = (p.brand || '').toLowerCase().includes(q)
            const matchCat = (p.category || '').toLowerCase().includes(q)
            if (!matchName && !matchBrand && !matchCat) return false
        }
        if (stockFilter === 'in_stock') return p.inStock && (p.stockCount > 0)
        if (stockFilter === 'low_stock') return (p.stockCount || 0) <= 10 && (p.stockCount || 0) > 0
        if (stockFilter === 'out_of_stock') return !p.inStock || (p.stockCount || 0) === 0
        return true
    })

    // Calculated values for Live Preview
    const previewPrice = parseFloat(formData.price) || 0
    const previewMrp = parseFloat(formData.mrp) || previewPrice
    const previewDiscount = previewMrp > previewPrice
        ? Math.round(((previewMrp - previewPrice) / previewMrp) * 100)
        : 0
    const previewSavings = previewMrp > previewPrice ? (previewMrp - previewPrice) : 0

    if (loading && products.length === 0) return <Loading />

    return (
        <div className="space-y-6 pb-24 text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Product & Inventory</span>
                        <span className="text-[#6C306E]">Management</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Add, edit, upload high-res photos, and view authentic customer traffic per UK product
                    </p>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                    <PlusIcon size={16} />
                    <span>Add New UK Product</span>
                </button>
            </div>

            {/* KPI Cards in Titas Enterprise Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Total UK Products
                        </div>
                        <div className="text-2xl font-black text-[#241224] mt-1">
                            {stats.totalProducts || products.length}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                            {stats.inStockCount} active in catalog
                        </div>
                    </div>
                    <div className="size-10 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                        <BagIcon size={18} color="#6C306E" />
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            True Page Views
                        </div>
                        <div className="text-2xl font-black text-emerald-700 mt-1">
                            {Number(stats.totalViews || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                            100% Real verified impressions
                        </div>
                    </div>
                    <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <EyeIcon size={18} color="#059669" />
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Low Stock Alert
                        </div>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                            {stats.lowStockCount || 0}
                        </div>
                        <div className="text-[10px] text-amber-700 mt-0.5">
                            ≤ 10 items remaining
                        </div>
                    </div>
                    <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <BoxIcon size={18} color="#D97706" />
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Origin Assurance
                        </div>
                        <div className="text-sm font-extrabold text-[#241224] mt-1">
                            London, United Kingdom
                        </div>
                        <div className="text-[10px] text-[#6C306E] font-semibold mt-0.5">
                            100% Certified Authentic
                        </div>
                    </div>
                    <div className="size-10 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                        <SparklesIcon size={18} color="#6C306E" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <SearchIcon size={16} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, brand, or category..."
                            className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition font-medium"
                        />
                    </div>

                    {/* Category Filter Dropdown (Clean, Text-only, No Dots/Icons) */}
                    <AdminDropdown
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={[
                            { value: 'All', label: 'All Categories' },
                            ...dbCategories.map(cat => ({
                                value: cat,
                                label: `${cat} Products`
                            }))
                        ]}
                        className="w-full md:w-52"
                    />

                    {/* Stock Filter Dropdown */}
                    <AdminDropdown
                        value={stockFilter}
                        onChange={setStockFilter}
                        options={STOCK_OPTIONS}
                        className="w-full md:w-44"
                    />

                    {/* Sort Dropdown */}
                    <AdminDropdown
                        value={sortBy}
                        onChange={setSortBy}
                        options={SORT_OPTIONS}
                        className="w-full md:w-52"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#EFE0EF] rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#FAF6FA]/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-[#EFE0EF]">
                            <tr>
                                <th className="px-5 py-3.5">Product</th>
                                <th className="px-4 py-3.5">Category</th>
                                <th className="px-4 py-3.5">Price / MRP</th>
                                <th className="px-4 py-3.5 text-center">Stock</th>
                                <th className="px-4 py-3.5 text-center">True Views</th>
                                <th className="px-4 py-3.5 text-center">Units Sold</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                        <BagIcon size={32} color="#CBD5E1" className="mx-auto mb-2 opacity-50" />
                                        <p className="font-semibold text-xs">No products found matching your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((prod) => {
                                    const imageSrc = Array.isArray(prod.images) && prod.images[0]
                                        ? (typeof prod.images[0] === 'string' ? prod.images[0] : (prod.images[0].src || '/product_img1.png'))
                                        : '/product_img1.png'
                                    const isLow = (prod.stockCount || 0) <= 10 && (prod.stockCount || 0) > 0
                                    const isOut = !prod.inStock || (prod.stockCount || 0) <= 0

                                    return (
                                        <tr key={prod.id} className="hover:bg-[#FAF6FA]/40 transition">
                                            {/* Product Title & Thumbnail */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-xl bg-white border border-[#EFE0EF] shrink-0 overflow-hidden shadow-2xs">
                                                        <img
                                                            src={imageSrc}
                                                            alt={prod.name}
                                                            className="size-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 max-w-xs">
                                                        <p className="font-bold text-[#241224] text-xs line-clamp-1" title={prod.name}>
                                                            {prod.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                                {prod.brand || 'Authentic UK'}
                                                            </span>
                                                            {prod.ratingScore && (
                                                                <span className="text-[10px] text-slate-500 font-semibold">
                                                                    Rating: {prod.ratingScore}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3.5">
                                                <span className="inline-block bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                    {prod.category}
                                                </span>
                                            </td>

                                            {/* Pricing */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="font-black text-[#241224] text-xs">
                                                    {currency}{Number(prod.price).toLocaleString()}
                                                </div>
                                                {prod.mrp && Number(prod.mrp) > Number(prod.price) && (
                                                    <div className="text-[10px] text-slate-400 line-through">
                                                        {currency}{Number(prod.mrp).toLocaleString()}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Stock Status & Quick Toggle */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <div className="inline-flex flex-col items-center gap-0.5">
                                                    <span
                                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                            isOut
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : isLow
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                    >
                                                        {isOut ? 'Out of Stock' : `${prod.stockCount || 50} in stock`}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleQuickStock(prod)}
                                                        className="text-[10px] text-slate-400 hover:text-[#6C306E] underline cursor-pointer"
                                                    >
                                                        {prod.inStock ? 'Mark Out' : 'Mark In'}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* True Verified Views (Clean Text Only) */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className="font-bold text-xs text-slate-800">
                                                    {Number(prod.views || 0).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Units Sold */}
                                            <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                                                {prod.unitsSold || 0}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(prod)}
                                                        className="p-1.5 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[#6C306E] transition border border-[#EFE0EF] cursor-pointer"
                                                        title="Edit Product Details & Photos"
                                                    >
                                                        <EditIcon size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingProduct(prod)}
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200 cursor-pointer"
                                                        title="Delete Product"
                                                    >
                                                        <TrashIcon size={13} color="#DC2626" />
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

            {/* FULL-POWER SPLIT-SCREEN PRODUCT EDITOR WITH 1:1 LIVE WEBSITE PREVIEW */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-7xl bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[#EFE0EF] flex items-center justify-between bg-[#FAF6FA]/80 shrink-0">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C306E]">
                                    {editingProduct ? 'Update UK Product' : 'Catalog Listing Studio'}
                                </span>
                                <h2 className="text-base sm:text-lg font-black text-[#241224] flex items-center gap-2">
                                    <span>{editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Authentic UK Product'}</span>
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsEditorOpen(false)}
                                className="p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-white transition cursor-pointer"
                                aria-label="Close editor"
                            >
                                <CloseIcon size={16} />
                            </button>
                        </div>

                        {/* Modal Body: Split Screen (Left: Form Inputs | Right: Exact Live Website Preview) */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EFE0EF]">
                            {/* LEFT COLUMN: FORM CONTROLS (7 Cols on desktop) */}
                            <form onSubmit={handleSaveProduct} id="productForm" className="lg:col-span-6 p-5 sm:p-6 space-y-6">
                                {/* SECTION 1: CORE INFORMATION */}
                                <div className="space-y-4">
                                    <div className="text-xs font-black text-[#241224] uppercase tracking-wider border-b border-[#EFE0EF] pb-2 flex items-center gap-1.5">
                                        <BagIcon size={14} color="#6C306E" />
                                        <span>1. Core Details & Pricing</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                            Product Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. CeraVe Foaming Cleanser for Normal to Oily Skin 473ml"
                                            className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <AdminDropdown
                                                value={formData.category}
                                                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                                options={dbCategories.map(cat => ({ value: cat, label: cat }))}
                                                fullWidth
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                                Brand Origin / Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.brand}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                placeholder="e.g. The Ordinary, CeraVe"
                                                className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                                Selling Price ({currency}) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="1850"
                                                className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-black outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                                Regular Price / MRP ({currency})
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.mrp}
                                                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                                placeholder="2200"
                                                className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                                Stock Count
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.stockCount}
                                                onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                                                placeholder="50"
                                                className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#241224]">
                                            <input
                                                type="checkbox"
                                                checked={formData.inStock}
                                                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                                className="size-4 rounded text-[#6C306E] focus:ring-[#6C306E]"
                                            />
                                            <span>Display as Available In Stock on Website</span>
                                        </label>
                                    </div>
                                </div>

                                {/* SECTION 2: HIGH QUALITY MULTIPLE IMAGE UPLOAD & DRAGGABLE REORDERING */}
                                <div className="space-y-4 pt-2">
                                    <div className="text-xs font-black text-[#241224] uppercase tracking-wider border-b border-[#EFE0EF] pb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <UploadCloudIcon size={15} color="#6C306E" />
                                            <span>2. High-Res Photos & Drag Serial Reorder</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-semibold lowercase">
                                            #1 is Cover Photo
                                        </span>
                                    </div>

                                    {/* Upload Dropzone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#EFE0EF] hover:border-[#6C306E] bg-[#FAF6FA]/70 hover:bg-[#FAF6FA] rounded-2xl p-5 text-center cursor-pointer transition group"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageFilesSelected}
                                            className="hidden"
                                        />
                                        <div className="size-10 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto mb-2 text-[#6C306E] group-hover:scale-110 transition shadow-2xs">
                                            <UploadCloudIcon size={18} color="#6C306E" />
                                        </div>
                                        <p className="text-xs font-bold text-[#241224]">
                                            {isUploadingImages ? 'Uploading in Full High Resolution...' : 'Click or Drag & Drop Multiple High-Res Images'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            Supports PNG, JPG, WEBP • Direct full-quality upload to CDN
                                        </p>
                                    </div>

                                    {/* Draggable Photos List with Serial Number */}
                                    <div className="space-y-2">
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Uploaded Photos ({formData.images.length}): Drag photos to change display order or use buttons.
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {formData.images.map((imgUrl, idx) => {
                                                const isCover = idx === 0
                                                return (
                                                    <div
                                                        key={idx}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, idx)}
                                                        onDragOver={(e) => handleDragOver(e, idx)}
                                                        onDrop={(e) => handleDrop(e, idx)}
                                                        className={`relative rounded-2xl border bg-white p-2 flex flex-col justify-between group transition-all cursor-grab active:cursor-grabbing ${
                                                            isCover
                                                                ? 'border-[#6C306E] ring-2 ring-[#6C306E]/20 shadow-xs'
                                                                : 'border-[#EFE0EF] hover:border-slate-300'
                                                        }`}
                                                    >
                                                        {/* Serial Number Badge */}
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                                                isCover
                                                                    ? 'bg-[#6C306E] text-white'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {isCover ? '★ #1 Cover' : `#${idx + 1}`}
                                                            </span>

                                                            <div className="text-slate-300 group-hover:text-slate-600 transition">
                                                                <GripVerticalIcon size={12} />
                                                            </div>
                                                        </div>

                                                        {/* Thumbnail Preview (1:1 Ratio Full-Filled) */}
                                                        <div className="aspect-square rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] overflow-hidden mb-2">
                                                            <img
                                                                src={imgUrl}
                                                                alt={`Product image ${idx + 1}`}
                                                                className="size-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Ordering Control Buttons */}
                                                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#EFE0EF]">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    disabled={idx === 0}
                                                                    onClick={() => moveImage(idx, idx - 1)}
                                                                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold disabled:opacity-30"
                                                                    title="Move Left"
                                                                >
                                                                    ←
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={idx === formData.images.length - 1}
                                                                    onClick={() => moveImage(idx, idx + 1)}
                                                                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold disabled:opacity-30"
                                                                    title="Move Right"
                                                                >
                                                                    →
                                                                </button>
                                                                {!isCover && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAsCover(idx)}
                                                                        className="px-1.5 py-0.5 rounded bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[#6C306E] text-[10px] font-bold border border-[#EFE0EF]"
                                                                        title="Make Cover Image"
                                                                    >
                                                                        Cover
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(idx)}
                                                                className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                                                                title="Delete Image"
                                                            >
                                                                <TrashIcon size={12} color="#DC2626" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: FORMULATION, PROVEN BENEFITS & SALES COPY */}
                                <div className="space-y-4 pt-2">
                                    <div className="text-xs font-black text-[#241224] uppercase tracking-wider border-b border-[#EFE0EF] pb-2 flex items-center gap-1.5">
                                        <RoyalCrownIcon size={14} color="#6C306E" />
                                        <span>3. Formulation, Benefits & Details</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                            Formulation & Profile (Overview Description)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.formulaProfile}
                                            onChange={(e) => setFormData({ ...formData, formulaProfile: e.target.value })}
                                            placeholder="Detailed description of active ingredients, clinical formulation, and target skin types..."
                                            className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl p-3 text-xs outline-none transition leading-relaxed font-normal"
                                        />
                                    </div>

                                    {/* Key Proven Benefits */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-[#241224]">
                                                Key Proven Benefits (Checklist Cards)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addBenefitField}
                                                className="text-[10px] font-bold text-[#6C306E] hover:underline"
                                            >
                                                + Add Benefit Point
                                            </button>
                                        </div>

                                        {formData.benefits.map((benefit, bIdx) => (
                                            <div key={bIdx} className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-purple-50 text-[#6C306E] flex items-center justify-center font-bold text-[10px] shrink-0 border border-purple-200">
                                                    ✓
                                                </div>
                                                <input
                                                    type="text"
                                                    value={benefit}
                                                    onChange={(e) => handleBenefitChange(bIdx, e.target.value)}
                                                    placeholder={`Proven benefit #${bIdx + 1}`}
                                                    className="flex-1 bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3 py-2 text-xs outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeBenefitField(bIdx)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                                                >
                                                    <CloseIcon size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Why You'll Love It */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                            Why You'll Love It (Conversion Copy)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.whyYouWillLoveIt}
                                            onChange={(e) => setFormData({ ...formData, whyYouWillLoveIt: e.target.value })}
                                            placeholder="Explain why this authentic UK product delivers unparalleled results..."
                                            className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl p-3 text-xs outline-none transition leading-relaxed font-normal"
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* RIGHT COLUMN: 1:1 LIVE WEBSITE PREVIEW (Matches Screenshot 2 Exactly) */}
                            <div className="lg:col-span-6 bg-[#FAF6FA]/40 p-5 sm:p-6 lg:overflow-y-auto">
                                <div className="sticky top-0 z-10 flex items-center justify-between pb-3 mb-4 border-b border-[#EFE0EF] bg-white/80 backdrop-blur-xs p-2 rounded-xl shadow-2xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-extrabold text-[#6C306E] uppercase tracking-wider">
                                            Live Website Preview
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        Exact Customer View
                                    </span>
                                </div>

                                {/* Preview Card Frame */}
                                <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
                                    {/* Breadcrumbs Preview */}
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                        <span>Home</span>
                                        <ChevronRightIcon size={10} color="#8A758A" />
                                        <span>Collection</span>
                                        <ChevronRightIcon size={10} color="#8A758A" />
                                        <span className="text-[#6C306E] font-bold">{formData.category}</span>
                                    </div>

                                    {/* Main Showcase Layout */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                                        {/* Gallery Column (Thumbnails + Main Photo) */}
                                        <div className="sm:col-span-6 flex gap-2.5">
                                            {/* Thumbnails strip */}
                                            <div className="flex flex-col gap-2 shrink-0">
                                                {formData.images.map((img, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setActivePreviewImage(i)}
                                                        className={`size-12 rounded-xl border p-0 bg-white overflow-hidden transition ${
                                                            activePreviewImage === i
                                                                ? 'border-[#6C306E] ring-2 ring-[#6C306E]/20'
                                                                : 'border-[#EFE0EF] hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <img src={img} alt="" className="size-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Main Image with Discount Tag (1:1 Ratio Full-Filled) */}
                                            <div className="relative aspect-square flex-1 bg-white border border-[#EFE0EF] rounded-2xl overflow-hidden shadow-2xs">
                                                {previewDiscount > 0 && (
                                                    <span className="absolute top-2.5 left-2.5 bg-[#6C306E] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-xs z-10">
                                                        {previewDiscount}% OFF
                                                    </span>
                                                )}
                                                <img
                                                    src={formData.images[activePreviewImage] || formData.images[0] || '/product_img1.png'}
                                                    alt="Preview"
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Detail Column */}
                                        <div className="sm:col-span-6 space-y-3">
                                            <span className="inline-block text-[10px] font-black text-[#6C306E] uppercase tracking-wider bg-[#FAF6FA] border border-[#EFE0EF] px-2.5 py-0.5 rounded-full">
                                                {formData.category}
                                            </span>

                                            <h3 className="text-sm font-black text-[#241224] leading-snug">
                                                {formData.name || 'Your Product Title Will Appear Here'}
                                            </h3>

                                            {/* Ratings */}
                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                <div className="flex text-[#D8B56D]">
                                                    {'★★★★★'}
                                                </div>
                                                <span className="font-bold text-[#241224]">5.0</span>
                                                <span className="text-slate-400">(24 Verified Reviews)</span>
                                            </div>

                                            {/* Price Block */}
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-black text-[#241224]">
                                                        {currency}{previewPrice.toLocaleString()}
                                                    </span>
                                                    {previewMrp > previewPrice && (
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {currency}{previewMrp.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                {previewSavings > 0 && (
                                                    <div className="text-[10px] font-bold text-[#6C306E] flex items-center gap-1">
                                                        <SparklesIcon size={11} color="#6C306E" />
                                                        <span>Save {currency}{previewSavings.toLocaleString()} ({previewDiscount}% OFF) today</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Summary */}
                                            <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                                                {formData.formulaProfile || 'Product formulation description will be displayed here for all visiting customers.'}
                                            </p>

                                            {/* Action Buttons Mock */}
                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    className="flex-1 bg-[#6C306E] text-white py-2 rounded-xl text-xs font-bold text-center pointer-events-none"
                                                >
                                                    Add to Bag
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex-1 border border-[#EFE0EF] bg-white text-slate-700 py-2 rounded-xl text-xs font-bold text-center pointer-events-none"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>

                                            {/* Trust Badges */}
                                            <div className="pt-2 grid grid-cols-3 gap-1.5 text-center text-[9px] text-slate-500 font-semibold border-t border-[#EFE0EF]">
                                                <div className="p-1 rounded bg-[#FAF6FA]">100% Genuine UK</div>
                                                <div className="p-1 rounded bg-[#FAF6FA]">Fast Delivery</div>
                                                <div className="p-1 rounded bg-[#FAF6FA]">Cash on Delivery</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Description Tabs Preview */}
                                    <div className="pt-4 border-t border-[#EFE0EF] space-y-4">
                                        <div className="flex items-center gap-4 text-xs font-bold border-b border-[#EFE0EF] pb-2">
                                            <span className="text-[#6C306E] border-b-2 border-[#6C306E] pb-2 -mb-2.5">
                                                Product Details & Specs
                                            </span>
                                            <span className="text-slate-400">
                                                Customer Reviews (4)
                                            </span>
                                        </div>

                                        {/* FORMULATION & PROFILE */}
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider">
                                                FORMULATION & PROFILE
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                                {formData.formulaProfile || 'A high-strength vitamin and mineral blemish formula that targets skin congestion and visible pores. Authentic UK Formula.'}
                                            </p>
                                        </div>

                                        {/* KEY PROVEN BENEFITS (2x2 Grid with Crown) */}
                                        <div className="bg-[#FAF6FA] border border-[#EFE0EF] p-4 rounded-2xl space-y-2.5">
                                            <div className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider flex items-center gap-1.5">
                                                <RoyalCrownIcon size={13} color="#6C306E" />
                                                <span>KEY PROVEN BENEFITS</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                                                {formData.benefits.filter(b => b.trim().length > 0).map((b, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <span className="size-4 rounded-full bg-white border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                                                            ✓
                                                        </span>
                                                        <span className="leading-snug">{b}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* WHY YOU'LL LOVE IT */}
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-wider">
                                                WHY YOU'LL LOVE IT
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                                {formData.whyYouWillLoveIt || 'Sourced with direct traceability from authorized UK brands and laboratories. Formulated to provide lasting radiance and barrier protection.'}
                                            </p>
                                        </div>

                                        {/* PRODUCT SPECIFICATIONS */}
                                        <div className="border border-[#EFE0EF] rounded-xl p-3 bg-white grid grid-cols-4 gap-2 text-center text-[10px]">
                                            <div>
                                                <span className="text-slate-400 block">Brand Origin</span>
                                                <strong className="text-[#241224]">{formData.brand || 'UK Import'}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Category</span>
                                                <strong className="text-[#241224]">{formData.category}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Price</span>
                                                <strong className="text-[#6C306E]">{currency}{previewPrice.toLocaleString()}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Authenticity</span>
                                                <strong className="text-emerald-700">100% Certified</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="px-6 py-4 border-t border-[#EFE0EF] bg-white flex items-center justify-between shrink-0">
                            <span className="text-xs text-slate-400">
                                Changes will be immediately live across all customer pages.
                            </span>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditorOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-[#EFE0EF] text-xs font-bold text-slate-600 hover:bg-[#FAF6FA] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="productForm"
                                    disabled={isSaving || isUploadingImages}
                                    className="px-6 py-2.5 rounded-xl bg-[#6C306E] hover:bg-[#3A0C38] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckIcon size={14} color="#FFFFFF" />
                                    <span>{isSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Publish Product to Store')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE PRODUCT CONFIRMATION MODAL */}
            {deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="relative w-full max-w-md bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 text-center text-[#241224]">
                        <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
                            <TrashIcon size={20} color="#DC2626" />
                        </div>
                        <h3 className="text-base font-black text-[#241224]">Remove Product?</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                            Are you sure you want to remove <strong>"{deletingProduct.name}"</strong> from your active UK catalog?
                        </p>

                        <div className="flex items-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setDeletingProduct(null)}
                                className="flex-1 py-2.5 rounded-xl border border-[#EFE0EF] text-xs font-bold text-slate-600 hover:bg-[#FAF6FA] transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteProduct}
                                disabled={isSaving}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
                            >
                                {isSaving ? 'Removing...' : 'Yes, Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
