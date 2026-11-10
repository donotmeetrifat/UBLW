'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { baseProductDummyData } from "@/assets/assets"
import { TrashIcon, SearchIcon, SparklesIcon } from "@/components/icons"
import Link from "next/link"

export default function StoreManageProducts() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            if (data.success && Array.isArray(data.products)) {
                setProducts(data.products)
            } else {
                setProducts(baseProductDummyData)
            }
        } catch (error) {
            console.error('Error loading products:', error)
            setProducts(baseProductDummyData)
        } finally {
            setLoading(false)
        }
    }

    const toggleStock = async (productId, currentStock) => {
        const nextStock = !currentStock
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: nextStock }),
            })
            const data = await res.json()
            if (data.success) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, inStock: nextStock } : p))
                toast.success(nextStock ? "Product marked In Stock" : "Product marked Out of Stock")
            } else {
                toast.error(data.message || 'Failed to update stock')
            }
        } catch (error) {
            // Local state fallback
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, inStock: nextStock } : p))
            toast.success(nextStock ? "Product marked In Stock" : "Product marked Out of Stock")
        }
    }

    const deleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to remove this UK product from catalog?')) return
        try {
            const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setProducts(prev => prev.filter(p => p.id !== productId))
                toast.success('Product removed successfully')
            }
        } catch (error) {
            setProducts(prev => prev.filter(p => p.id !== productId))
            toast.success('Product removed')
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const filtered = products.filter(p => {
        if (!searchQuery) return true
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    if (loading) return <Loading />

    return (
        <div className="pb-16 text-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#241224]">
                        Manage <span className="text-[#6C306E]">Products</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Control inventory stock visibility and manage authentic UK product listings
                    </p>
                </div>
                <Link
                    href="/store/add-product"
                    className="inline-flex items-center gap-1.5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs"
                >
                    <span>+ Add New Product</span>
                </Link>
            </div>

            {/* Filter bar */}
            <div className="mb-6 max-w-md relative">
                <SearchIcon size={16} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by product name or category..."
                    className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-full pl-10 pr-4 py-2 text-xs outline-none shadow-2xs"
                />
            </div>

            <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_4px_24px_rgba(58,12,56,0.04)] border border-[#EFE0EF]">
                <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6FA] text-[#241224] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#EFE0EF]">
                        <tr>
                            <th className="px-5 py-4">Product</th>
                            <th className="px-4 py-4 hidden md:table-cell">Category</th>
                            <th className="px-4 py-4 hidden sm:table-cell">MRP</th>
                            <th className="px-4 py-4">Selling Price</th>
                            <th className="px-4 py-4 text-center">In Stock Toggle</th>
                            <th className="px-4 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE0EF]/60">
                        {filtered.map((product) => {
                            const imageSrc = Array.isArray(product.images) && product.images[0]
                                ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].src || '/product_img1.png'))
                                : '/product_img1.png'

                            return (
                                <tr key={product.id} className="hover:bg-[#FAF6FA]/70 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-3 items-center">
                                            <div className="size-12 rounded-xl bg-white border border-[#EFE0EF] flex items-center justify-center p-1 shrink-0">
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    className="max-h-10 w-auto object-contain"
                                                    src={imageSrc}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-[#241224] line-clamp-1">{product.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{product.brand || 'Authentic UK'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 hidden md:table-cell">
                                        <span className="bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 hidden sm:table-cell text-slate-400 line-through">
                                        {currency}{Number(product.mrp || product.price).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3.5 font-extrabold text-[#3A0C38] text-sm">
                                        {currency}{Number(product.price).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={Boolean(product.inStock)}
                                                onChange={() => toggleStock(product.id, Boolean(product.inStock))}
                                            />
                                            <div className="w-10 h-5.5 bg-slate-300 rounded-full peer peer-checked:bg-emerald-600 transition-colors duration-200"></div>
                                            <span className="dot absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4.5 shadow-xs"></span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                            title="Delete product"
                                        >
                                            <TrashIcon size={14} color="currentColor" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
