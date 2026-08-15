'use client'

import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const PremiumSelect = ({ value, onChange, options, placeholder = "Select an option", disabled = false, name = "" }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)
    
    const selectedOption = options.find(opt => opt.value === value)

    // Close when clicking outside
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
                className={`flex w-full items-center justify-between rounded-[16px] border bg-white px-4 h-[48px] text-[14px] outline-none transition-all duration-200
                    ${disabled 
                        ? 'border-[#EFE0EF] bg-[#FAF6FA] text-[#7B667B] opacity-70 cursor-not-allowed' 
                        : 'border-[#EFE0EF] text-[#241224] shadow-[0_2px_12px_rgba(58,12,56,0.03)] hover:border-[#9956A1] hover:shadow-[0_4px_16px_rgba(108,48,110,0.08)] focus:border-[#6C306E] focus:ring-4 focus:ring-[#6C306E]/10'
                    }`}
            >
                <span className={`truncate ${!selectedOption ? 'text-[#7B667B]' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} strokeWidth={2.5} className={`text-[#6C306E] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute left-0 top-full z-[100] w-full mt-2 max-h-[300px] overflow-y-auto rounded-[16px] border border-[#EFE0EF] bg-white py-2 shadow-[0_8px_30px_rgba(58,12,56,0.12)] origin-top animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                // Mimic native event for existing handlers
                                onChange({ target: { name, value: option.value } })
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
                    {options.length === 0 && (
                        <div className="px-4 py-2.5 text-[14px] text-[#7B667B]">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PremiumSelect
