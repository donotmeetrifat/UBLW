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

    // Normalize options into { value, label, dot }
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
        <div ref={containerRef} className={`relative inline-block ${fullWidth ? 'w-full' : ''} ${isOpen ? 'z-40' : 'z-10'} ${className}`}>
            {/* Dropdown Trigger Button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`w-full flex items-center justify-between gap-2 bg-[#FAF6FA]/70 hover:bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 focus:border-[#6C306E] rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer select-none text-left shadow-2xs outline-none ${buttonClassName}`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {selectedOption?.dot && (
                        <span className={`size-2 rounded-full shrink-0 ${selectedOption.dot}`} />
                    )}
                    <span className="truncate">{displayLabel}</span>
                </div>
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

            {/* Custom Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute z-50 mt-1.5 min-w-[160px] bg-white border border-[#EFE0EF] rounded-xl shadow-xl p-1.5 max-h-64 overflow-y-auto ${
                            align === 'right' ? 'right-0' : 'left-0'
                        } ${menuClassName}`}
                    >
                        <div className="space-y-0.5">
                            {normalizedOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={String(opt.value)}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(opt.value);
                                        }}
                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition cursor-pointer select-none whitespace-nowrap ${
                                            isSelected
                                                ? 'bg-[#FAF6FA] text-[#6C306E] font-bold'
                                                : 'text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] font-medium'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {opt.dot && (
                                                <span className={`size-2 rounded-full shrink-0 ${opt.dot}`} />
                                            )}
                                            <span className="truncate">{opt.label}</span>
                                        </div>
                                        {isSelected && (
                                            <svg className="size-3 text-[#6C306E] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 8 6.5 11.5 13 4.5" />
                                            </svg>
                                        )}
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
