'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDropdown({
    value,
    onChange,
    options = [],
    placeholder = 'Select option',
    className = '',
    buttonClassName = '',
    menuClassName = '',
    align = 'left',
    fullWidth = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Normalize options into { value, label }
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string' || typeof opt === 'number') {
            return { value: opt, label: String(opt) };
        }
        return opt;
    });

    const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative inline-block ${fullWidth ? 'w-full' : ''} ${className}`}>
            {/* Dropdown Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 bg-[#FAF6FA]/60 hover:bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 focus:border-[#6C306E] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition cursor-pointer select-none text-left shadow-2xs outline-none ${buttonClassName}`}
            >
                <span className="truncate">{displayLabel}</span>
                <svg
                    className={`size-3 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#6C306E]' : ''}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2.5 4.5L6 8L9.5 4.5" />
                </svg>
            </button>

            {/* Custom Dropdown Menu: Clean & Premium (Pure text only, NO icons, NO dots) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute z-50 mt-1.5 min-w-full bg-white border border-[#EFE0EF] rounded-xl shadow-xl p-1.5 max-h-64 overflow-y-auto ${
                            align === 'right' ? 'right-0' : 'left-0'
                        } ${menuClassName}`}
                        style={{ minWidth: '100%' }}
                    >
                        <div className="space-y-0.5">
                            {normalizedOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={String(opt.value)}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-3.5 py-2 rounded-lg text-xs transition cursor-pointer select-none whitespace-nowrap ${
                                            isSelected
                                                ? 'bg-[#FAF6FA] text-[#6C306E] font-bold'
                                                : 'text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] font-medium'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
