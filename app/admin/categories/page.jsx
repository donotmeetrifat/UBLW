'use client'

import { useEffect, useState, useMemo } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import Link from "next/link"
import {
    TagIcon,
    SearchIcon,
    PlusIcon,
    EditIcon,
    TrashIcon,
    CloseIcon,
    CheckIcon,
    BagIcon,
    ArrowRightIcon
} from "@/components/icons"

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'ACTIVE' | 'INACTIVE'
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formName, setFormName] = useState('')
    const [formSlug, setFormSlug] = useState('')
    const [formDesc, setFormDesc] = useState('')
    const [formOrder, setFormOrder] = useState(0)
    const [formIsActive, setFormIsActive] = useState(true)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/categories?all=true&_t=' + Date.now())
            const data = await res.json()
            if (data.success && Array.isArray(data.categories)) {
                setCategories(data.categories)
            } else {
                setCategories([])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to load categories')
            setCategories([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleOpenAddModal = () => {
        setFormName('')
        setFormSlug('')
        setFormDesc('')
        setFormOrder(categories.length + 1)
        setFormIsActive(true)
        setIsAddModalOpen(true)
    }

    const handleOpenEditModal = (cat) => {
        setEditingCategory(cat)
        setFormName(cat.name || '')
        setFormSlug(cat.slug || '')
        setFormDesc(cat.description || '')
        setFormOrder(cat.displayOrder || 0)
        setFormIsActive(cat.isActive !== false)
    }

    const handleNameChange = (val) => {
        setFormName(val)
        // Auto generate slug if creating new
        if (isAddModalOpen) {
            const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            setFormSlug(autoSlug)
        }
    }

    // Save Category (Create or Edit)
    const handleSaveCategory = async (e) => {
        e.preventDefault()
        const trimmedName = formName.trim()
        if (!trimmedName || trimmedName.length < 2) {
            toast.error('Category name must be at least 2 characters.')
            return
        }

        const trimmedSlug = (formSlug || trimmedName).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        setSubmitting(true)
        try {
            const isEditing = Boolean(editingCategory)
            const url = isEditing ? `/api/categories/${editingCategory.id}` : '/api/categories'
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: trimmedName,
                    slug: trimmedSlug,
                    description: formDesc.trim(),
                    displayOrder: Number(formOrder) || 0,
                    isActive: formIsActive
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Failed to save category')
                return
            }

            toast.success(data.message || (isEditing ? 'Category updated!' : 'Category created!'))
            setIsAddModalOpen(false)
            setEditingCategory(null)
            fetchCategories()
        } catch (error) {
            console.error('Error saving category:', error)
            toast.error('Network error saving category.')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete Category
    const handleDeleteCategory = async (cat) => {
        if (!confirm(`Are you sure you want to delete category "${cat.name}"? Products currently assigned to this category will be preserved.`)) {
            return
        }

        try {
            const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Failed to delete category')
                return
            }

            toast.success(data.message || 'Category deleted successfully')
            fetchCategories()
        } catch (error) {
            toast.error('Failed to delete category')
        }
    }

    const filteredCategories = useMemo(() => {
        let list = categories
        if (statusFilter === 'ACTIVE') {
            list = list.filter(c => c.isActive)
        } else if (statusFilter === 'INACTIVE') {
            list = list.filter(c => !c.isActive)
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            list = list.filter(c => 
                (c.name || '').toLowerCase().includes(q) ||
                (c.slug || '').toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q)
            )
        }
        return list
    }, [categories, searchQuery, statusFilter])

    // KPI Metrics
    const totalCategories = categories.length
    const activeCategories = categories.filter(c => c.isActive).length
    const totalProductsCount = categories.reduce((sum, c) => sum + (c.count || 0), 0)

    if (loading && categories.length === 0) return <Loading />

    return (
        <div className="space-y-6 pb-24 text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Category & Catalog</span>
                        <span className="text-[#6C306E]">Management</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Create, edit, organize, and manage authentic UK product categories live across storefront filters and product listings
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        onClick={fetchCategories}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                    >
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-2 bg-[#6C306E] hover:bg-[#521C54] text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                        <PlusIcon size={14} color="#FFFFFF" />
                        <span>Add New Category</span>
                    </button>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Total Categories
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#241224]">
                        {totalCategories}
                    </div>
                </div>

                <div className="bg-white border border-emerald-200 bg-emerald-50/20 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                        Active on Storefront
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600">
                        {activeCategories}
                    </div>
                </div>

                <div className="bg-white border border-purple-200 bg-purple-50/20 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-wider block mb-1">
                        Total Categorized Products
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#6C306E]">
                        {totalProductsCount}
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
                {/* Search */}
                <div className="relative flex-1">
                    <SearchIcon size={16} color="#94a3b8" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search categories by name, slug, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#241224] focus:border-[#6C306E] focus:bg-white outline-none transition placeholder:text-slate-400"
                    />
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto">
                    {[
                        { label: 'All', value: 'ALL' },
                        { label: 'Active', value: 'ACTIVE' },
                        { label: 'Hidden', value: 'INACTIVE' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === tab.value
                                    ? 'bg-[#6C306E] text-white shadow-xs'
                                    : 'text-slate-600 hover:text-[#6C306E]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white border border-[#EFE0EF] rounded-3xl overflow-hidden shadow-2xs">
                {filteredCategories.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="size-16 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mx-auto mb-3">
                            <TagIcon size={28} color="#6C306E" />
                        </div>
                        <h3 className="text-base font-bold text-[#241224]">No categories found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {searchQuery ? 'No categories matched your search query.' : 'Click "Add New Category" above to create your first category.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF6FA] text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#EFE0EF]">
                                <tr>
                                    <th className="py-3.5 px-4">Order</th>
                                    <th className="py-3.5 px-4">Category Name & Details</th>
                                    <th className="py-3.5 px-4">Catalog Products</th>
                                    <th className="py-3.5 px-4">Storefront Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]/60">
                                {filteredCategories.map((cat, idx) => (
                                    <tr key={cat.id || idx} className="hover:bg-[#FAF6FA]/60 transition-colors">
                                        {/* Display Order */}
                                        <td className="py-4 px-4 align-middle">
                                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                                #{cat.displayOrder || idx + 1}
                                            </span>
                                        </td>

                                        {/* Category Name & Slug */}
                                        <td className="py-4 px-4 align-middle">
                                            <div className="font-extrabold text-[#241224] text-xs sm:text-sm">
                                                {cat.name}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                slug: {cat.slug}
                                            </div>
                                            {cat.description && (
                                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-md">
                                                    {cat.description}
                                                </p>
                                            )}
                                        </td>

                                        {/* Products count and link */}
                                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                                            <Link
                                                href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                                                className="inline-flex items-center gap-1.5 font-bold text-xs text-[#6C306E] hover:underline bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full shadow-2xs"
                                            >
                                                <BagIcon size={13} color="#6C306E" />
                                                <span>{cat.count || 0} products</span>
                                                <ArrowRightIcon size={10} color="#6C306E" />
                                            </Link>
                                        </td>

                                        {/* Storefront Active Status */}
                                        <td className="py-4 px-4 align-middle whitespace-nowrap">
                                            {cat.isActive !== false ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                                                    <span className="size-1.5 rounded-full bg-slate-400" />
                                                    <span>Hidden</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(cat)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-white border border-[#EFE0EF] text-slate-700 hover:text-[#6C306E] hover:border-[#6C306E]/40 shadow-2xs transition cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <EditIcon size={13} />
                                                    <span>Edit</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                    title="Delete Category"
                                                >
                                                    <TrashIcon size={14} color="currentColor" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Category Modal */}
            {(isAddModalOpen || editingCategory) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-md bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 sm:p-7 text-[#241224] my-6">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddModalOpen(false)
                                setEditingCategory(null)
                            }}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <CloseIcon size={16} />
                        </button>

                        <div className="mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B56D] block">
                                Catalog Management
                            </span>
                            <h3 className="text-xl font-black text-[#241224] tracking-tight mt-0.5">
                                {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {editingCategory 
                                    ? 'Updating this category will immediately update product associations and storefront filters.' 
                                    : 'Add a new authentic UK beauty category to your store.'}
                            </p>
                        </div>

                        <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
                            {/* Category Name */}
                            <div>
                                <label className="block font-bold text-[#241224] mb-1">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Skincare, Makeup, Haircare"
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none transition"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block font-bold text-[#241224] mb-1">
                                    URL Slug
                                </label>
                                <input
                                    type="text"
                                    value={formSlug}
                                    onChange={(e) => setFormSlug(e.target.value)}
                                    placeholder="e.g. skincare"
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-bold text-[#241224] mb-1">
                                    Description / Tagline
                                </label>
                                <textarea
                                    rows={2}
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="e.g. Dermatologist-recommended UK skincare essentials"
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3.5 py-2 text-xs outline-none transition resize-none"
                                />
                            </div>

                            {/* Display Order & Active Toggle */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block font-bold text-[#241224] mb-1">
                                        Display Priority
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formOrder}
                                        onChange={(e) => setFormOrder(e.target.value)}
                                        className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-[#241224] mb-1">
                                        Storefront Status
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setFormIsActive(!formIsActive)}
                                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            formIsActive
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                : 'bg-slate-100 border-slate-200 text-slate-500'
                                        }`}
                                    >
                                        <span className={`size-2 rounded-full ${formIsActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span>{formIsActive ? 'Active on Store' : 'Hidden'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Notice if editing */}
                            {editingCategory && (
                                <p className="text-[10px] text-slate-400 italic">
                                    Note: If you change the category name, all {editingCategory.count || 0} existing products assigned to this category will automatically be updated to the new name.
                                </p>
                            )}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="w-full bg-[#6C306E] hover:bg-[#521C54] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    <span>{submitting ? 'Saving Category...' : (editingCategory ? 'Update Category' : 'Save & Publish Category')}</span>
                                    {!submitting && <CheckIcon size={14} color="#FFFFFF" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
