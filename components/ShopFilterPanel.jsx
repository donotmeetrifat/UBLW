'use client'

import { ChevronDown, X } from 'lucide-react'
import { useState } from 'react'

export const filterOptions = {
    categories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care', 'Beauty Tools', 'Accessories', 'Lifestyle', 'New Arrivals', 'Best Sellers', 'Premium Picks', 'Sale'],
    sortOptions: [
        { label: 'Default', value: 'default' },
        { label: 'Newest', value: 'newest' },
        { label: 'Price: Low to High', value: 'price-low-high' },
        { label: 'Price: High to Low', value: 'price-high-low' },
        { label: 'Best Selling', value: 'best-selling' },
        { label: 'Top Rated', value: 'top-rated' },
    ],
}

const filterGroups = [
    { title: 'Category', key: 'categories', options: filterOptions.categories.map((label) => ({ label, value: label })) },
]

const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false)
    
    const selectedOption = options.find(opt => opt.value === value) || options[0]

    return (
        <div className="relative mt-2.5">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#EFE0EF] bg-white px-4 h-[48px] text-[14px] text-[#241224] outline-none shadow-[0_2px_12px_rgba(58,12,56,0.03)] hover:border-[#9956A1] hover:shadow-[0_4px_16px_rgba(108,48,110,0.08)] focus:border-[#6C306E] focus:ring-4 focus:ring-[#6C306E]/10 transition-all duration-200"
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDown size={16} strokeWidth={2.5} className={`text-[#6C306E] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Invisible overlay to catch clicks outside */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full z-50 w-full mt-2 overflow-hidden rounded-[16px] border border-[#EFE0EF] bg-white py-2 shadow-[0_8px_30px_rgba(58,12,56,0.12)] origin-top animate-in fade-in zoom-in-95 duration-200">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full px-4 py-2.5 text-left text-[14px] transition-colors ${
                                    value === option.value
                                        ? 'bg-[#FAF6FA] text-[#3A0C38] font-medium'
                                        : 'text-[#7B667B] hover:bg-[#FAF6FA] hover:text-[#3A0C38]'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}


const FilterGroup = ({ group, filters, onToggle }) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border-b border-[#EFE0EF] py-5 last:border-b-0">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#3A0C38]"
                aria-expanded={isOpen}
            >
                {group.title}
                <ChevronDown className={`transition ${isOpen ? 'rotate-180' : ''}`} size={17} />
            </button>

            {isOpen && (
                <div className="mt-4 space-y-3">
                    {group.options.map((option) => {
                        const inputId = `${group.key}-${option.value}`.replaceAll(' ', '-').toLowerCase()
                        const checked = filters[group.key].includes(option.value)

                        return (
                            <label key={option.value} htmlFor={inputId} className="flex cursor-pointer items-center gap-3 text-sm text-[#7B667B]">
                                <input
                                    id={inputId}
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggle(group.key, option.value)}
                                    className="size-4 rounded border-[#C599CB] accent-[#6C306E]"
                                />
                                <span>{option.label}</span>
                            </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const ShopFilterPanel = ({ filters, sortBy, onToggle, onPriceChange, onClear, onSortChange, onClose, showCloseButton = false }) => {
    return (
        <aside className="brand-card rounded-3xl p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4 border-b border-[#EFE0EF] pb-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#D8B56D]">Refine</p>
                    <h2 className="text-xl font-semibold text-[#3A0C38]">Filters</h2>
                </div>
                {showCloseButton && (
                    <button
                        type="button"
                        aria-label="Close filters"
                        onClick={onClose}
                        className="flex size-9 items-center justify-center rounded-full border border-[#EFE0EF] text-[#3A0C38]"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="mt-5 mb-2">
                <label className="block text-[13px] font-bold text-[#3A0C38] tracking-wide" htmlFor="sort-products-sidebar">
                    Sort By
                </label>
                <CustomSelect 
                    value={sortBy} 
                    onChange={onSortChange} 
                    options={filterOptions.sortOptions} 
                />
            </div>

            <div className="border-b border-[#EFE0EF] py-5">
                <h3 className="text-sm font-semibold text-[#3A0C38]">Price</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="text-xs font-medium text-[#7B667B]" htmlFor="minimum-price">
                        Minimum
                        <input
                            id="minimum-price"
                            type="number"
                            min="0"
                            inputMode="decimal"
                            value={filters.minPrice}
                            onChange={(event) => onPriceChange('minPrice', event.target.value)}
                            placeholder="$0"
                            className="mt-2 w-full rounded-2xl border border-[#EFE0EF] bg-white px-3 py-2.5 text-sm text-[#241224] outline-none focus:border-[#6C306E]"
                        />
                    </label>
                    <label className="text-xs font-medium text-[#7B667B]" htmlFor="maximum-price">
                        Maximum
                        <input
                            id="maximum-price"
                            type="number"
                            min="0"
                            inputMode="decimal"
                            value={filters.maxPrice}
                            onChange={(event) => onPriceChange('maxPrice', event.target.value)}
                            placeholder="$100"
                            className="mt-2 w-full rounded-2xl border border-[#EFE0EF] bg-white px-3 py-2.5 text-sm text-[#241224] outline-none focus:border-[#6C306E]"
                        />
                    </label>
                </div>
            </div>

            <div className="mt-2">
                {filterGroups.map((group) => (
                    <FilterGroup key={group.key} group={group} filters={filters} onToggle={onToggle} />
                ))}
            </div>

        </aside>
    )
}

export default ShopFilterPanel
