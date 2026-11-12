'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
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
    TrendIcon,
    BoxIcon
} from "@/components/icons"

const CATEGORIES = [
    'All',
    'Skincare',
    'Makeup & Cult Beauty',
    'Haircare',
    'Fragrance',
    'Body & Wellness'
]

export default function AdminProductsPage() {
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
    const [stockFilter, setStockFilter] = useState('all') // 'all', 'in_stock', 'low_stock', 'out_of_stock'
    const [sortBy, setSortBy] = useState('views') // 'views', 'newest', 'price-high', 'price-low', 'stock'

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [deletingProduct, setDeletingProduct] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: 'Skincare',
        brand: 'UK Import',
        stockCount: 50,
        inStock: true,
        images: ['/product_img1.png']
    })

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/products?sort=${sortBy}&category=${selectedCategory}`)
            const data = await res.json()
            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products)
                if (data.stats) setStats(data.stats)
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
        setFormData({
            name: '',
            description: '',
            price: '',
            mrp: '',
            category: 'Skincare',
            brand: 'UK Import',
            stockCount: 50,
            inStock: true,
            images: ['/product_img1.png']
        })
        setShowAddModal(true)
    }

    const handleOpenEdit = (prod) => {
        setEditingProduct(prod)
        setFormData({
            name: prod.name || '',
            description: prod.description || '',
            price: prod.price || '',
            mrp: prod.mrp || prod.price || '',
            category: prod.category || 'Skincare',
            brand: prod.brand || 'UK Import',
            stockCount: prod.stockCount !== undefined ? prod.stockCount : 50,
            inStock: Boolean(prod.inStock),
            images: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : ['/product_img1.png']
        })
    }

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

        setIsSaving(true)
        try {
            if (editingProduct) {
                // Update
                const res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                const data = await res.json()
                if (data.success) {
                    toast.success('Product updated successfully!')
                    setEditingProduct(null)
                    fetchProducts()
                } else {
                    toast.error(data.message || 'Failed to update product')
                }
            } else {
                // Create
                const res = await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                const data = await res.json()
                if (data.success) {
                    toast.success('New product listed successfully!')
                    setShowAddModal(false)
                    fetchProducts()
                } else {
                    toast.error(data.message || 'Failed to create product')
                }
            }
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error('Connection error occurred')
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

    if (loading && products.length === 0) return <Loading />

    return (
        <div className="space-y-6 pb-20 text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Product & Inventory</span>
                        <span className="text-[#6C306E]">Management</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Edit, organize, and monitor authentic UK product listings and genuine customer page views
                    </p>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                    <PlusIcon size={16} />
                    <span>Add New UK Product</span>
                </button>
            </div>

            {/* KPI Cards in Titas Enterprise Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Products
                        </div>
                        <div className="text-2xl font-black text-[#241224] mt-1">
                            {stats.totalProducts || products.length}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                            {stats.inStockCount} currently available
                        </div>
                    </div>
                    <div className="size-11 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                        <BagIcon size={20} color="#6C306E" />
                    </div>
                </div>

                {/* Real Views KPI Card */}
                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <span>True Page Views</span>
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-2xl font-black text-emerald-700 mt-1">
                            {Number(stats.totalViews || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold mt-1">
                            100% Genuine visitor counts
                        </div>
                    </div>
                    <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <EyeIcon size={20} color="#059669" />
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Low Stock Alert
                        </div>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                            {stats.lowStockCount || 0}
                        </div>
                        <div className="text-[10px] text-amber-700 mt-1">
                            Under 10 items remaining
                        </div>
                    </div>
                    <div className="size-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <BoxIcon size={20} color="#D97706" />
                    </div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between">
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Import Source
                        </div>
                        <div className="text-base font-extrabold text-[#241224] mt-1 flex items-center gap-1.5">
                            <span>Heathrow, London</span>
                        </div>
                        <div className="text-[10px] text-[#6C306E] font-semibold mt-1">
                            100% Verified UK Stock
                        </div>
                    </div>
                    <div className="size-11 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                        <SparklesIcon size={20} color="#6C306E" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <SearchIcon size={16} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, brand, or category..."
                            className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-full pl-10 pr-4 py-2 text-xs outline-none transition"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full md:w-48 bg-[#FAF6FA]/50 border border-[#EFE0EF] rounded-full px-4 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat} Products</option>
                        ))}
                    </select>

                    {/* Stock Filter */}
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full md:w-40 bg-[#FAF6FA]/50 border border-[#EFE0EF] rounded-full px-4 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                    >
                        <option value="all">All Stock Status</option>
                        <option value="in_stock">In Stock Only</option>
                        <option value="low_stock">Low Stock (≤10)</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-48 bg-[#FAF6FA]/50 border border-[#EFE0EF] rounded-full px-4 py-2 text-xs font-bold text-[#6C306E] outline-none cursor-pointer"
                    >
                        <option value="views">🔥 Sort: Most Viewed</option>
                        <option value="newest">✨ Sort: Newest Listed</option>
                        <option value="price-high">💰 Sort: Price (High → Low)</option>
                        <option value="price-low">🏷️ Sort: Price (Low → High)</option>
                        <option value="stock">📦 Sort: Stock Count</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#EFE0EF] rounded-3xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF6FA] text-[#241224] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#EFE0EF]">
                            <tr>
                                <th className="px-5 py-4">Product</th>
                                <th className="px-4 py-4">Category</th>
                                <th className="px-4 py-4">Price / MRP</th>
                                <th className="px-4 py-4 text-center">Stock</th>
                                <th className="px-4 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-emerald-800">
                                        <EyeIcon size={14} color="#059669" />
                                        <span>True Views</span>
                                    </span>
                                </th>
                                <th className="px-4 py-4 text-center">Units Sold</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]/60">
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
                                        <tr key={prod.id} className="hover:bg-[#FAF6FA]/70 transition-colors">
                                            {/* Product Title & Thumbnail */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-12 rounded-xl bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-xs">
                                                        <img
                                                            src={imageSrc}
                                                            alt={prod.name}
                                                            className="max-h-10 w-auto object-contain"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 max-w-xs">
                                                        <p className="font-extrabold text-[#241224] text-xs line-clamp-1" title={prod.name}>
                                                            {prod.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                                {prod.brand || 'Authentic UK'}
                                                            </span>
                                                            {prod.ratingScore && (
                                                                <span className="text-[10px] text-[#D8B56D] font-bold flex items-center gap-0.5">
                                                                    ★ {prod.ratingScore}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3.5">
                                                <span className="inline-block bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                    {prod.category}
                                                </span>
                                            </td>

                                            {/* Pricing */}
                                            <td className="px-4 py-3.5">
                                                <div className="font-extrabold text-[#241224] text-sm">
                                                    {currency}{Number(prod.price).toLocaleString()}
                                                </div>
                                                {prod.mrp && Number(prod.mrp) > Number(prod.price) && (
                                                    <div className="text-[10px] text-slate-400 line-through">
                                                        {currency}{Number(prod.mrp).toLocaleString()}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Stock Status & Quick Toggle */}
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex flex-col items-center gap-1">
                                                    <span
                                                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                                            isOut
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : isLow
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                    >
                                                        {isOut ? 'Out of Stock' : `${prod.stockCount || 50} in stock`}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleQuickStock(prod)}
                                                        className="text-[10px] text-slate-500 hover:text-[#6C306E] underline cursor-pointer"
                                                    >
                                                        {prod.inStock ? 'Mark Out' : 'Mark In Stock'}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* True Verified Views */}
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                                                    <EyeIcon size={13} color="#059669" />
                                                    <span className="font-black text-xs text-emerald-800">
                                                        {Number(prod.views || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-600 font-medium">views</span>
                                                </div>
                                            </td>

                                            {/* Units Sold */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-bold text-[#6C306E]">
                                                    {prod.unitsSold || 0} sold
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEdit(prod)}
                                                        className="p-1.5 rounded-lg bg-[#FAF6FA] hover:bg-[#EFE0EF] text-[#6C306E] transition border border-[#EFE0EF] cursor-pointer"
                                                        title="Edit Product Details"
                                                    >
                                                        <EditIcon size={14} color="#6C306E" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingProduct(prod)}
                                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition border border-red-200 cursor-pointer"
                                                        title="Remove Product"
                                                    >
                                                        <TrashIcon size={14} color="#DC2626" />
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

            {/* ADD / EDIT PRODUCT MODAL (CLOSES ONLY VIA EXPLICIT CLOSE BUTTON PER USER RULE) */}
            {(showAddModal || editingProduct) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-2xl bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#EFE0EF] mb-6">
                            <div className="flex items-center gap-2.5">
                                <div className="size-9 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                    {editingProduct ? <EditIcon size={18} /> : <PlusIcon size={18} />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-[#241224]">
                                        {editingProduct ? 'Edit UK Product Details' : 'Add New UK Product'}
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        {editingProduct ? 'Modify pricing, stock level, or description' : 'List an authentic imported UK item in catalog'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false)
                                    setEditingProduct(null)
                                }}
                                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                aria-label="Close modal"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                            {/* Product Title */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Product Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. CeraVe Foaming Cleanser for Normal to Oily Skin 473ml"
                                    className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none"
                                />
                            </div>

                            {/* Category & Brand */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none"
                                    >
                                        <option value="Skincare">Skincare</option>
                                        <option value="Makeup & Cult Beauty">Makeup & Cult Beauty</option>
                                        <option value="Haircare">Haircare</option>
                                        <option value="Fragrance">Fragrance</option>
                                        <option value="Body & Wellness">Body & Wellness</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="e.g. CeraVe, The Ordinary, Olaplex"
                                        className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Selling Price (BDT) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="1"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g. 2450"
                                        className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Original MRP (BDT)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.mrp}
                                        onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                        placeholder="e.g. 2850"
                                        className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.stockCount}
                                        onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                                        placeholder="e.g. 50"
                                        className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            {/* In Stock Checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="inStockCheck"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                    className="size-4 accent-[#6C306E] rounded"
                                />
                                <label htmlFor="inStockCheck" className="font-bold text-slate-700 cursor-pointer">
                                    Display as In Stock on Storefront
                                </label>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Product Image Path or URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.images[0] || ''}
                                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                                    placeholder="/product_img1.png or https://..."
                                    className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Product Description & Formulation Highlights
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Write verified authentic details, formula benefits, and genuine UK barcode notes..."
                                    className="w-full bg-[#FAF6FA]/50 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs outline-none resize-y"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE0EF]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingProduct(null)
                                    }}
                                    className="px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 font-bold text-slate-600 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-6 py-2.5 rounded-full font-bold transition shadow-2xs disabled:opacity-60 cursor-pointer"
                                >
                                    {isSaving ? 'Saving Changes...' : editingProduct ? 'Save Product Changes' : 'Publish Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL (CLOSES ONLY VIA EXPLICIT BUTTON CLICK PER USER RULE) */}
            {deletingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="relative w-full max-w-md bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 sm:p-7">
                        <div className="size-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <TrashIcon size={22} color="#DC2626" />
                        </div>
                        <h3 className="text-center text-lg font-black text-[#241224]">
                            Remove UK Product?
                        </h3>
                        <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
                            Are you sure you want to remove <b>{deletingProduct.name}</b> from the catalog?
                            If this item is already in customer orders, it will be safely archived without losing past sales records.
                        </p>

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setDeletingProduct(null)}
                                className="px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 font-bold text-slate-600 transition cursor-pointer text-xs"
                            >
                                Keep Product
                            </button>
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={handleDeleteProduct}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold transition shadow-2xs disabled:opacity-60 cursor-pointer text-xs"
                            >
                                {isSaving ? 'Removing...' : 'Confirm Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

