'use client'

import { ChevronDownIcon } from '@/components/icons'
import { useState, useRef, useEffect } from 'react'

const PremiumSelect = ({ value, onChange, options, placeholder = "Select an option", disabled = false, name = "" }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)
    
    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={selectRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between rounded-2xl border bg-white px-4 h-12 text-xs sm:text-sm outline-none transition-all duration-200 cursor-pointer
                    ${disabled 
                        ? 'border-[#EFE0EF] bg-[#FAF6FA] text-slate-400 opacity-70 cursor-not-allowed' 
                        : 'border-[#EFE0EF] text-[#241224] shadow-2xs hover:border-[#6C306E]/40 focus:border-[#6C306E] focus:ring-4 focus:ring-[#6C306E]/10'
                    }`}
            >
                <span className={`truncate ${!selectedOption ? 'text-slate-400' : 'font-semibold'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDownIcon size={14} color="#6C306E" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute left-0 top-full z-[100] w-full mt-2 max-h-[260px] overflow-y-auto rounded-2xl border border-[#EFE0EF] bg-white py-2 shadow-[0_10px_30px_rgba(58,12,56,0.12)]">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange({ target: { name, value: option.value } })
                                setIsOpen(false)
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                                value === option.value
                                    ? 'bg-[#FAF6FA] text-[#6C306E] font-bold'
                                    : 'text-[#503E50] hover:bg-[#FAF6FA] hover:text-[#6C306E]'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-2.5 text-xs text-slate-400">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PremiumSelect
