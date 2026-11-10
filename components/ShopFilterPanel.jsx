'use client'

import { ChevronDownIcon, CloseIcon, FilterIcon } from '@/components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export const filterOptions = {
    categories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care', 'Beauty Tools', 'Accessories', 'Lifestyle', 'New Arrivals', 'Best Sellers', 'Premium Picks', 'Sale'],
    sortOptions: [
        { label: 'Featured (Default)', value: 'default' },
        { label: 'Newest Arrivals', value: 'newest' },
        { label: 'Price: Low to High', value: 'price-low-high' },
        { label: 'Price: High to Low', value: 'price-high-low' },
        { label: 'Best Selling Beauty', value: 'best-selling' },
        { label: 'Top Customer Rated', value: 'top-rated' },
    ],
}

const filterGroups = [
    { title: 'Category', key: 'categories', options: filterOptions.categories.map((label) => ({ label, value: label })) },
]

const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(opt => opt.value === value) || options[0]

    return (
        <div className="relative mt-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#EFE0EF] bg-white px-4 h-11 text-xs sm:text-sm text-[#241224] font-medium outline-none shadow-2xs hover:border-[#6C306E]/40 transition-all duration-200 cursor-pointer"
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDownIcon size={14} color="#6C306E" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)}
                            aria-hidden="true"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full z-50 w-full mt-1.5 overflow-hidden rounded-2xl border border-[#EFE0EF] bg-white py-1.5 shadow-[0_10px_30px_rgba(58,12,56,0.12)]"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                        value === option.value
                                            ? 'bg-[#FAF6FA] text-[#6C306E] font-bold'
                                            : 'text-[#503E50] hover:bg-[#FAF6FA] hover:text-[#6C306E]'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

const FilterGroup = ({ group, filters, onToggle }) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border-b border-[#EFE0EF] py-4 last:border-b-0">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-bold text-[#241224] cursor-pointer"
                aria-expanded={isOpen}
            >
                <span>{group.title}</span>
                <ChevronDownIcon size={14} color="#6C306E" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="mt-3.5 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {group.options.map((option) => {
                        const inputId = `${group.key}-${option.value}`.replaceAll(' ', '-').toLowerCase()
                        const checked = filters[group.key].includes(option.value)

                        return (
                            <label key={option.value} htmlFor={inputId} className="flex cursor-pointer items-center gap-2.5 text-xs text-[#503E50] hover:text-[#6C306E] transition-colors">
                                <input
                                    id={inputId}
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggle(group.key, option.value)}
                                    className="size-4 rounded border-[#EFE0EF] accent-[#6C306E] cursor-pointer"
                                />
                                <span className={checked ? 'font-bold text-[#6C306E]' : 'font-medium'}>
                                    {option.label}
                                </span>
                            </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const ShopFilterPanel = ({ filters, sortBy, onToggle, onPriceChange, onClear, onSortChange, onClose, showCloseButton = false }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    return (
        <aside className="bg-white border border-[#EFE0EF] rounded-3xl p-5 lg:sticky lg:top-24 shadow-2xs">
            <div className="flex items-center justify-between gap-4 border-b border-[#EFE0EF] pb-4">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                        <FilterIcon size={16} color="#6C306E" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-bold">REFINE</p>
                        <h2 className="text-base font-bold text-[#241224]">Filters</h2>
                    </div>
                </div>

                {showCloseButton && (
                    <button
                        type="button"
                        aria-label="Close filters"
                        onClick={onClose}
                        className="flex size-8 items-center justify-center rounded-full border border-[#EFE0EF] text-slate-500 hover:text-[#6C306E] hover:bg-[#FAF6FA] transition cursor-pointer"
                    >
                        <CloseIcon size={14} />
                    </button>
                )}
            </div>

            {/* Sort Selection */}
            <div className="mt-4 mb-2">
                <label className="block text-xs font-bold text-[#241224] tracking-wide" htmlFor="sort-products-sidebar">
                    Sort Collection
                </label>
                <CustomSelect 
                    value={sortBy} 
                    onChange={onSortChange} 
                    options={filterOptions.sortOptions} 
                />
            </div>

            {/* Price Filter with Currency */}
            <div className="border-b border-[#EFE0EF] py-4">
                <h3 className="text-xs sm:text-sm font-bold text-[#241224]">Price Range ({currency})</h3>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <label className="text-[11px] font-medium text-slate-500" htmlFor="minimum-price">
                        Min ({currency})
                        <input
                            id="minimum-price"
                            type="number"
                            min="0"
                            inputMode="decimal"
                            value={filters.minPrice}
                            onChange={(event) => onPriceChange('minPrice', event.target.value)}
                            placeholder="0"
                            className="mt-1 w-full rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] px-3 py-2 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition"
                        />
                    </label>
                    <label className="text-[11px] font-medium text-slate-500" htmlFor="maximum-price">
                        Max ({currency})
                        <input
                            id="maximum-price"
                            type="number"
                            min="0"
                            inputMode="decimal"
                            value={filters.maxPrice}
                            onChange={(event) => onPriceChange('maxPrice', event.target.value)}
                            placeholder="15000"
                            className="mt-1 w-full rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] px-3 py-2 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition"
                        />
                    </label>
                </div>
            </div>

            {/* Category Groups */}
            <div className="mt-2">
                {filterGroups.map((group) => (
                    <FilterGroup key={group.key} group={group} filters={filters} onToggle={onToggle} />
                ))}
            </div>
        </aside>
    )
}

export default ShopFilterPanel
