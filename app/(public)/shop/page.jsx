'use client'

import { Suspense, useEffect, useMemo, useState, useCallback } from "react"
import Loading from "@/components/Loading"
import ProductCard from "@/components/ProductCard"
import ShopFilterPanel, { filterOptions } from "@/components/ShopFilterPanel"
import { ArrowLeftIcon, CloseIcon, FilterIcon, SparklesIcon } from "@/components/icons"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { setCategories } from "@/lib/features/product/productSlice"

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
    const dispatch = useDispatch()
    const products = useSelector(state => state.product.list)

    const [filters, setFilters] = useState(() => ({
        categories: categoryParam ? [categoryParam] : [],
        minPrice: '',
        maxPrice: '',
    }))
    const [sortBy, setSortBy] = useState('default')
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
    const reduxCategories = useSelector(state => state.product?.categories)

    // Fast 0ms hydration from cache or Redux:
    const [shopCategories, setShopCategories] = useState(() => {
        if (Array.isArray(reduxCategories) && reduxCategories.length > 0) return reduxCategories;
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_categories') || '[]');
                if (Array.isArray(cached) && cached.length > 0) return cached;
            } catch {}
        }
        return [];
    })

    // Fetch and sync live categories from PostgreSQL database
    const loadLiveCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories?_t=' + Date.now(), { cache: 'no-store' });
            const data = await res.json();
            if (data.success && Array.isArray(data.categories)) {
                const activeNames = data.categories
                    .filter(c => c.isActive !== false)
                    .map(c => c.name);
                setShopCategories(activeNames);
                dispatch(setCategories(activeNames));
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_cached_categories', JSON.stringify(activeNames));
                }
            }
        } catch (e) {
            console.error('Error syncing live categories on shop page:', e);
        }
    }, [dispatch]);

    useEffect(() => {
        loadLiveCategories();

        const onCategoryUpdate = () => loadLiveCategories();
        const onStorage = (e) => {
            if (e.key === 'ukbl_categories_synced') loadLiveCategories();
        };

        window.addEventListener('category-catalog-updated', onCategoryUpdate);
        window.addEventListener('storage', onStorage);

        try {
            const bc = new BroadcastChannel('ukbl_catalog_channel');
            bc.onmessage = (msg) => {
                if (msg.data?.type === 'category-updated') {
                    loadLiveCategories();
                }
            };
            return () => {
                bc.close();
                window.removeEventListener('category-catalog-updated', onCategoryUpdate);
                window.removeEventListener('storage', onStorage);
            };
        } catch {
            return () => {
                window.removeEventListener('category-catalog-updated', onCategoryUpdate);
                window.removeEventListener('storage', onStorage);
            };
        }
    }, [loadLiveCategories]);

    useEffect(() => {
        if (Array.isArray(reduxCategories) && reduxCategories.length > 0) {
            setShopCategories(reduxCategories);
        }
    }, [reduxCategories]);

    // Compute all available categories from active category catalog + live products
    const displayCategories = useMemo(() => {
        const productCategories = (products || []).map(p => p.category).filter(Boolean);
        const combined = Array.from(new Set([...(shopCategories || []), ...productCategories]));
        return combined;
    }, [shopCategories, products]);

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
            <div className="pt-6 sm:pt-10 pb-24">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EFE0EF] pb-6">
                    <div>
                        <div className="mb-1">
                            <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-widest">
                                100% ORIGINAL UK INVENTORY
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/shop')}
                            className="text-2xl sm:text-3xl font-extrabold text-[#241224] flex items-center gap-2.5 cursor-pointer hover:text-[#6C306E] transition-colors"
                        >
                            {search && <ArrowLeftIcon size={20} color="#6C306E" />}
                            All <span className="text-[#6C306E]">Beauty Collections</span>
                        </button>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} curated
                            {search && <span className="font-semibold text-slate-700"> for "{search}"</span>}
                        </p>
                    </div>

                    {/* Mobile Filter Button */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="bg-white/95 border border-[#6C306E]/30 hover:border-[#6C306E] text-[#6C306E] hover:bg-[#FAF6FA] flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-[0_4px_16px_rgba(108,48,110,0.18)] cursor-pointer"
                        >
                            <FilterIcon size={14} color="#6C306E" />
                            <span>Filter & Sort</span>
                        </motion.button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
                    {/* Desktop Filter Panel */}
                    <div className="hidden lg:block">
                        <ShopFilterPanel
                            filters={filters}
                            sortBy={sortBy}
                            categories={displayCategories}
                            onToggle={toggleFilter}
                            onPriceChange={updatePriceFilter}
                            onClear={clearFilters}
                            onSortChange={setSortBy}
                            onClose={() => setIsMobileFilterOpen(false)}
                        />
                    </div>

                    {/* Products Grid */}
                    <section aria-label="Product results">
                        {/* Active Filter Chips */}
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            {activeChips.map((chip) => (
                                <motion.button
                                    key={`${chip.key}-${chip.value}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    type="button"
                                    onClick={() => removeFilter(chip.key, chip.value)}
                                    className="flex items-center gap-1.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] px-3.5 py-1 text-xs font-bold text-[#6C306E] hover:bg-[#EFE0EF] transition cursor-pointer"
                                >
                                    <span>{chip.value}</span>
                                    <CloseIcon size={12} color="#6C306E" />
                                </motion.button>
                            ))}

                            {sortBy !== 'default' && (
                                <button
                                    type="button"
                                    onClick={() => setSortBy('default')}
                                    className="flex items-center gap-1.5 rounded-full bg-[#FAF6FA] px-3.5 py-1 text-xs font-bold text-[#6C306E] border border-[#EFE0EF] cursor-pointer"
                                >
                                    <span>{filterOptions.sortOptions.find((option) => option.value === sortBy)?.label}</span>
                                    <CloseIcon size={12} color="#6C306E" />
                                </button>
                            )}

                            {hasActiveFilters && (
                                <button 
                                    type="button" 
                                    onClick={clearFilters} 
                                    className="text-xs font-bold text-[#6C306E] hover:underline ml-2 cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        {filteredProducts.length ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6"
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="py-24 text-center rounded-3xl bg-[#FAF6FA] border border-[#EFE0EF] max-w-lg mx-auto">
                                <SparklesIcon size={24} color="#D8B56D" className="mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-[#241224]">No UK products match your search</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                    Try clearing your price filters or searching with different keywords.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-5 px-6 py-2.5 rounded-full bg-[#6C306E] text-white text-xs font-bold shadow-xs hover:bg-[#3A0C38] transition cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Mobile Filter Drawer with Framer Motion slide-in */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/60 backdrop-blur-md transition-all duration-300"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 shadow-2xl overflow-y-auto"
                        >
                            <ShopFilterPanel
                                filters={filters}
                                sortBy={sortBy}
                                categories={displayCategories}
                                onToggle={toggleFilter}
                                onPriceChange={updatePriceFilter}
                                onClear={clearFilters}
                                onSortChange={setSortBy}
                                onClose={() => setIsMobileFilterOpen(false)}
                                showCloseButton={true}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<Loading message="Curating authentic UK beauty catalog..." />}>
            <ShopContent />
        </Suspense>
    )
}
