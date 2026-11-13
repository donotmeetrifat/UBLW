'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@/components/icons'

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

/**
 * LuxuryDatePicker - Clean, Premium Branded Calendar & Time Selection Component
 * Eliminates standard clunky browser HTML5 datetime-local pickers.
 * Supports configurable left/right alignment and auto-scrolling to prevent viewport clipping.
 */
export default function LuxuryDatePicker({
    label,
    value,
    onChange,
    minDate = new Date(),
    required = false,
    placeholder = 'Select date & time',
    align = 'left' // 'left' | 'right'
}) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)
    const popoverRef = useRef(null)

    // Parse incoming value or default to current date
    const initialDate = value ? new Date(value) : null
    const validInitial = initialDate && !isNaN(initialDate.getTime()) ? initialDate : new Date()

    const [viewDate, setViewDate] = useState(new Date(validInitial.getFullYear(), validInitial.getMonth(), 1))
    const [selectedDate, setSelectedDate] = useState(initialDate && !isNaN(initialDate.getTime()) ? initialDate : null)
    
    // Sync when value prop changes externally
    useEffect(() => {
        if (value) {
            const d = new Date(value)
            if (!isNaN(d.getTime())) {
                setSelectedDate(d)
                setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))
                const h24 = d.getHours()
                setHour12(h24 % 12 || 12)
                setMinute(d.getMinutes())
                setAmpm(h24 >= 12 ? 'PM' : 'AM')
            }
        } else {
            setSelectedDate(null)
        }
    }, [value])

    // Time state (12-hour format for intuitive user control)
    const initialHours24 = validInitial.getHours()
    const initialMinutes = validInitial.getMinutes()
    const [hour12, setHour12] = useState(initialHours24 % 12 || 12)
    const [minute, setMinute] = useState(initialMinutes < 30 ? 0 : (initialMinutes < 45 ? 30 : 59))
    const [ampm, setAmpm] = useState(initialHours24 >= 12 ? 'PM' : 'AM')

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Auto-scroll when opened so popover is always 100% visible
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const timer = setTimeout(() => {
                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }, 60)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // Update parent when date or time changes
    const applyDateTime = (targetDate, h, m, period) => {
        if (!targetDate) return
        const d = new Date(targetDate)
        let hours24 = parseInt(h, 10)
        if (period === 'PM' && hours24 < 12) hours24 += 12
        if (period === 'AM' && hours24 === 12) hours24 = 0

        d.setHours(hours24, parseInt(m, 10), 0, 0)
        setSelectedDate(d)
        onChange(d.toISOString())
    }

    const handleSelectDay = (dayNum) => {
        const newD = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum)
        applyDateTime(newD, hour12, minute, ampm)
    }

    const handleTimeChange = (newH, newM, newAmpm) => {
        setHour12(newH)
        setMinute(newM)
        setAmpm(newAmpm)
        if (selectedDate) {
            applyDateTime(selectedDate, newH, newM, newAmpm)
        } else {
            const today = new Date()
            applyDateTime(today, newH, newM, newAmpm)
        }
    }

    const handleQuickPreset = (daysToAdd) => {
        const d = new Date()
        d.setDate(d.getDate() + daysToAdd)
        d.setHours(23, 59, 0, 0)
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))
        setHour12(11)
        setMinute(59)
        setAmpm('PM')
        setSelectedDate(d)
        onChange(d.toISOString())
    }

    const handleEndOfMonth = () => {
        const now = new Date()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 0)
        setViewDate(new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), 1))
        setHour12(11)
        setMinute(59)
        setAmpm('PM')
        setSelectedDate(endOfMonth)
        onChange(endOfMonth.toISOString())
    }

    const handleClear = (e) => {
        e?.stopPropagation()
        setSelectedDate(null)
        onChange('')
        setIsOpen(false)
    }

    // Days grid calculation
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate()

    const formatTimeDisplay = (date) => {
        if (!date) return ''
        let hours = date.getHours()
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const period = hours >= 12 ? 'PM' : 'AM'
        hours = hours % 12
        hours = hours ? hours : 12
        return `${hours}:${minutes} ${period}`
    }

    const formattedDisplay = selectedDate ? (
        <span className="flex items-center gap-1 font-bold text-[#241224] text-xs whitespace-nowrap">
            <span>
                {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[#6C306E]/70 font-semibold">•</span>
            <span className="text-[#6C306E] font-bold">
                {formatTimeDisplay(selectedDate)}
            </span>
        </span>
    ) : (
        <span className="text-slate-400 text-xs font-medium truncate block">{placeholder}</span>
    )

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            {/* Clickable Trigger Button */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between bg-white border ${
                        isOpen ? 'border-[#6C306E] ring-2 ring-[#6C306E]/15' : 'border-[#EFE0EF]'
                    } hover:border-[#6C306E] rounded-xl px-2.5 sm:px-3 py-2 text-left transition cursor-pointer shadow-2xs group`}
                >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="text-[#6C306E] shrink-0">
                            <CalendarIcon size={14} color="#6C306E" />
                        </div>
                        <div className="min-w-0 overflow-visible">
                            {formattedDisplay}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                        {selectedDate && !required && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                className="text-slate-400 hover:text-rose-600 size-4 flex items-center justify-center rounded-full hover:bg-rose-50 transition text-xs font-bold leading-none cursor-pointer"
                                title="Clear date"
                            >
                                ×
                            </span>
                        )}
                        <span className="text-[9.5px] font-bold text-[#6C306E] bg-[#FAF6FA] px-1.5 py-0.5 rounded border border-[#EFE0EF] group-hover:bg-[#6C306E] group-hover:text-white transition">
                            {isOpen ? 'Close' : 'Choose'}
                        </span>
                    </div>
                </button>
            </div>

            {/* Luxury Calendar & Time Dropdown Popover */}
            {isOpen && (
                <div 
                    ref={popoverRef}
                    className={`absolute z-50 mt-1.5 w-[305px] max-w-[calc(100vw-32px)] bg-white border border-[#EFE0EF] rounded-2xl shadow-2xl p-3 text-xs animate-in fade-in zoom-in-95 duration-150 ${
                        align === 'right' ? 'right-0' : 'left-0'
                    }`}
                >
                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1 pb-2 mb-2 border-b border-[#EFE0EF]">
                        <button
                            type="button"
                            onClick={() => handleQuickPreset(7)}
                            className="px-1.5 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-slate-600 transition text-center cursor-pointer"
                        >
                            +7 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickPreset(14)}
                            className="px-1.5 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-slate-600 transition text-center cursor-pointer"
                        >
                            +14 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickPreset(30)}
                            className="px-1.5 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-slate-600 transition text-center cursor-pointer"
                        >
                            +30 Days
                        </button>
                        <button
                            type="button"
                            onClick={handleEndOfMonth}
                            className="px-1.5 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-[#6C306E] transition text-center cursor-pointer"
                        >
                            Month End
                        </button>
                    </div>

                    {/* Month & Year Navigation Header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="font-extrabold text-xs text-[#241224] tracking-tight">
                            {MONTH_NAMES[month]} {year}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#241224] transition cursor-pointer"
                                aria-label="Previous month"
                            >
                                <ChevronLeftIcon size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date())}
                                className="px-1.5 py-0.5 rounded-md text-[9px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] hover:bg-[#6C306E] hover:text-white transition cursor-pointer"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#241224] transition cursor-pointer"
                                aria-label="Next month"
                            >
                                <ChevronRightIcon size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 text-center mb-1">
                        {DAY_NAMES.map(d => (
                            <span key={d} className="text-[10px] font-bold text-slate-400 py-0.5">
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
                        {/* Leading Empty Cells */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-6.5 w-6.5" />
                        ))}

                        {/* Calendar Day Cells */}
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const dayNum = i + 1
                            const isSelected = selectedDate &&
                                selectedDate.getDate() === dayNum &&
                                selectedDate.getMonth() === month &&
                                selectedDate.getFullYear() === year

                            const isToday = new Date().getDate() === dayNum &&
                                new Date().getMonth() === month &&
                                new Date().getFullYear() === year

                            return (
                                <button
                                    key={dayNum}
                                    type="button"
                                    onClick={() => handleSelectDay(dayNum)}
                                    className={`h-6.5 w-6.5 rounded-lg text-xs font-bold transition flex items-center justify-center mx-auto cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#6C306E] text-white shadow-xs'
                                            : isToday
                                            ? 'bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] font-black'
                                            : 'text-[#241224] hover:bg-[#FAF6FA] hover:text-[#6C306E]'
                                    }`}
                                >
                                    {dayNum}
                                </button>
                            )
                        })}
                    </div>

                    {/* Time Picker & Actions Footer in a Unified Compact Row */}
                    <div className="pt-2 border-t border-[#EFE0EF] flex items-center justify-between gap-1.5">
                        {/* Time Picker Controls */}
                        <div className="flex items-center gap-1">
                            <ClockIcon size={12} color="#6C306E" />
                            <select
                                value={hour12}
                                onChange={(e) => handleTimeChange(parseInt(e.target.value, 10), minute, ampm)}
                                className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-md px-1 py-0.5 font-bold text-[#241224] outline-none text-[11px] cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                                ))}
                            </select>

                            <span className="font-bold text-slate-400 text-xs">:</span>

                            <select
                                value={minute}
                                onChange={(e) => handleTimeChange(hour12, parseInt(e.target.value, 10), ampm)}
                                className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-md px-1 py-0.5 font-bold text-[#241224] outline-none text-[11px] cursor-pointer"
                            >
                                <option value={0}>00</option>
                                <option value={15}>15</option>
                                <option value={30}>30</option>
                                <option value={45}>45</option>
                                <option value={59}>59</option>
                            </select>

                            <div className="flex rounded-md border border-[#EFE0EF] p-0.5 bg-[#FAF6FA]">
                                <button
                                    type="button"
                                    onClick={() => handleTimeChange(hour12, minute, 'AM')}
                                    className={`px-1 py-0.2 rounded text-[9.5px] font-bold cursor-pointer transition ${
                                        ampm === 'AM' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-500 hover:text-[#241224]'
                                    }`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTimeChange(hour12, minute, 'PM')}
                                    className={`px-1 py-0.2 rounded text-[9.5px] font-bold cursor-pointer transition ${
                                        ampm === 'PM' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-500 hover:text-[#241224]'
                                    }`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>

                        {/* Done & Clear Actions */}
                        <div className="flex items-center gap-1">
                            {!required && selectedDate && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded-lg transition cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-2.5 py-1 bg-[#6C306E] hover:bg-[#521C54] text-white text-[10.5px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
