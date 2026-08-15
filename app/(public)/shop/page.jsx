'use client'

import { Suspense, useEffect, useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"
import ShopFilterPanel, { filterOptions } from "@/components/ShopFilterPanel"
import { Filter, MoveLeftIcon, SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

const emptyFilters = {
    categories: [],
    minPrice: '',
    maxPrice: '',
}

const getAverageRating = (product) => {
    if (!product.rating?.length) return 0
    return product.rating.reduce((total, item) => total + item.rating, 0) / product.rating.length
}

const matchesCustomPrice = (product, filters) => {
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice)
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice)

    if (minPrice !== null && product.price < minPrice) return false
    if (maxPrice !== null && product.price > maxPrice) return false
    return true
}

const getActiveFilterChips = (filters) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const chips = filters.categories.map((value) => ({ key: 'categories', value }))
    if (filters.minPrice !== '') chips.push({ key: 'minPrice', value: `Min ${currency}${filters.minPrice}` })
    if (filters.maxPrice !== '') chips.push({ key: 'maxPrice', value: `Max ${currency}${filters.maxPrice}` })
    return chips
}

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search') || ''
    const categoryParam = searchParams.get('category') || ''
    const router = useRouter()
    const products = useSelector(state => state.product.list)

    const [filters, setFilters] = useState(() => ({
        categories: categoryParam ? [categoryParam] : [],
        minPrice: '',
        maxPrice: '',
    }))
    const [sortBy, setSortBy] = useState('default')
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

    // Sync URL ?category= param into filter state whenever it changes
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            categories: categoryParam ? [categoryParam] : [],
        }))
    }, [categoryParam])

    const activeChips = getActiveFilterChips(filters)
    const hasActiveFilters = activeChips.length > 0 || sortBy !== 'default'

    const toggleFilter = (filterKey, value) => {
        setFilters((currentFilters) => {
            const currentValues = currentFilters[filterKey]
            const nextValues = currentValues.includes(value)
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value]

            return { ...currentFilters, [filterKey]: nextValues }
        })
    }

    const removeFilter = (filterKey, value) => {
        if (filterKey === 'minPrice' || filterKey === 'maxPrice') {
            setFilters((currentFilters) => ({ ...currentFilters, [filterKey]: '' }))
            return
        }

        setFilters((currentFilters) => ({
            ...currentFilters,
            [filterKey]: currentFilters[filterKey].filter((item) => item !== value),
        }))
    }

    const updatePriceFilter = (filterKey, value) => {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [filterKey]: value,
        }))
    }

    const clearFilters = () => {
        setFilters(emptyFilters)
        setSortBy('default')
    }

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        const matchingProducts = products.filter((product) => {
            const matchesSearch = normalizedSearch
                ? [product.name, product.brand, product.category, product.description].some((field) => field?.toLowerCase().includes(normalizedSearch))
                : true

            const matchesCategory = filters.categories.length ? filters.categories.includes(product.category) : true

            return matchesSearch
                && matchesCategory
                && matchesCustomPrice(product, filters)
        })

        return [...matchingProducts].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
            if (sortBy === 'price-low-high') return a.price - b.price
            if (sortBy === 'price-high-low') return b.price - a.price
            if (sortBy === 'best-selling') return (b.rating?.length || 0) - (a.rating?.length || 0)
            if (sortBy === 'top-rated') return getAverageRating(b) - getAverageRating(a)
            return 0
        })
    }, [products, search, filters, sortBy])

    return (
        <div className="min-h-[70vh] px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="pt-8 pb-24">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => router.push('/shop')}
                            className="text-2xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:text-[#6C306E] transition"
                        >
                            {search && <MoveLeftIcon size={20} />}
                            All <span className="text-[#6C306E]">Beauty Products</span>
                        </button>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                            {search && <span className="font-semibold text-slate-700"> for "{search}"</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition"
                        >
                            <Filter size={14} /> Filter Products
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                    <div className="hidden lg:block">
                        <ShopFilterPanel
                            filters={filters}
                            sortBy={sortBy}
                            onToggle={toggleFilter}
                            onPriceChange={updatePriceFilter}
                            onClear={clearFilters}
                            onSortChange={setSortBy}
                            onClose={() => setIsMobileFilterOpen(false)}
                        />
                    </div>

                    <section aria-label="Product results">
                        <div className="mb-6 flex flex-wrap items-center gap-2.5">
                            {activeChips.map((chip) => (
                                <button
                                    key={`${chip.key}-${chip.value}`}
                                    type="button"
                                    onClick={() => removeFilter(chip.key, chip.value)}
                                    className="flex items-center gap-1.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] px-3.5 py-1 text-xs font-semibold text-[#6C306E] hover:bg-[#EFE0EF] transition"
                                >
                                    {chip.value}
                                    <X size={12} />
                                </button>
                            ))}

                            {sortBy !== 'default' && (
                                <button
                                    type="button"
                                    onClick={() => setSortBy('default')}
                                    className="flex items-center gap-1.5 rounded-full bg-[#FAF6FA] px-3.5 py-1 text-xs font-semibold text-[#6C306E] border border-[#EFE0EF]"
                                >
                                    {filterOptions.sortOptions.find((option) => option.value === sortBy)?.label}
                                    <X size={12} />
                                </button>
                            )}

                            {hasActiveFilters && (
                                <button type="button" onClick={clearFilters} className="text-xs font-bold text-[#6C306E] hover:underline ml-2">
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        {filteredProducts.length ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
                                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                        ) : (
                            <div className="bg-[#FAF6FA] border border-[#EFE0EF] flex min-h-80 flex-col items-center justify-center rounded-3xl px-6 text-center">
                                <SlidersHorizontal className="text-[#6C306E]" size={36} />
                                <h2 className="mt-4 text-xl font-bold text-slate-800">No products found</h2>
                                <p className="mt-1 text-xs text-slate-500">Try selecting a different category or adjusting your search</p>
                                <button type="button" onClick={clearFilters} className="bg-[#6C306E] hover:bg-[#3A0C38] text-white mt-5 rounded-full px-6 py-2.5 text-xs font-semibold transition">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
                    <button
                        type="button"
                        aria-label="Close filter overlay"
                        className="absolute inset-0 bg-[#241224]/40 backdrop-blur-xs"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                    <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
                        <ShopFilterPanel
                            filters={filters}
                            sortBy={sortBy}
                            onToggle={toggleFilter}
                            onPriceChange={updatePriceFilter}
                            onClear={clearFilters}
                            onSortChange={setSortBy}
                            onClose={() => setIsMobileFilterOpen(false)}
                            showCloseButton
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-500 text-sm">Loading UK Brand Lover Shop...</div>}>
            <ShopContent />
        </Suspense>
    )
}