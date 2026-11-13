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
 */
export default function LuxuryDatePicker({
    label,
    value,
    onChange,
    minDate = new Date(),
    required = false,
    placeholder = 'Select date & time'
}) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    // Parse incoming value or default to current date
    const initialDate = value ? new Date(value) : null
    const validInitial = initialDate && !isNaN(initialDate.getTime()) ? initialDate : new Date()

    const [viewDate, setViewDate] = useState(new Date(validInitial.getFullYear(), validInitial.getMonth(), 1))
    const [selectedDate, setSelectedDate] = useState(initialDate && !isNaN(initialDate.getTime()) ? initialDate : null)
    
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

    // Days grid calculation
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate()

    const formattedDisplay = selectedDate ? (
        <span className="flex items-center gap-1.5 font-bold text-[#241224] text-xs">
            <span>
                {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[#6C306E] font-medium">•</span>
            <span className="text-[#6C306E]">
                {selectedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
        </span>
    ) : (
        <span className="text-slate-400 text-xs">{placeholder}</span>
    )

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            {/* Clickable Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white border ${
                    isOpen ? 'border-[#6C306E] ring-2 ring-[#6C306E]/10' : 'border-[#EFE0EF]'
                } hover:border-[#6C306E] rounded-xl px-3.5 py-2 text-left transition cursor-pointer shadow-2xs`}
            >
                <div className="flex items-center gap-2">
                    <div className="text-[#6C306E]">
                        <CalendarIcon size={14} color="#6C306E" />
                    </div>
                    {formattedDisplay}
                </div>
                <div className="text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] px-2 py-0.5 rounded-md border border-[#EFE0EF]">
                    {isOpen ? 'Close' : 'Choose'}
                </div>
            </button>

            {/* Luxury Calendar & Time Dropdown Popover */}
            {isOpen && (
                <div className="absolute z-50 left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-[320px] bg-white border border-[#EFE0EF] rounded-2xl shadow-2xl p-3.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center justify-between gap-1 pb-2.5 mb-2.5 border-b border-[#EFE0EF] overflow-x-auto no-scrollbar">
                        <button
                            type="button"
                            onClick={() => handleQuickPreset(7)}
                            className="px-2 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-slate-600 transition shrink-0"
                        >
                            +7 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickPreset(14)}
                            className="px-2 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-slate-600 transition shrink-0"
                        >
                            +14 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickPreset(30)}
                            className="px-2 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-slate-600 transition shrink-0"
                        >
                            +30 Days
                        </button>
                        <button
                            type="button"
                            onClick={handleEndOfMonth}
                            className="px-2 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[10px] font-bold text-[#6C306E] transition shrink-0"
                        >
                            Month End
                        </button>
                    </div>

                    {/* Month & Year Navigation Header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="font-bold text-xs text-[#241224]">
                            {MONTH_NAMES[month]} {year}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#241224] transition cursor-pointer"
                                aria-label="Previous month"
                            >
                                <ChevronLeftIcon size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-[#241224] transition cursor-pointer"
                                aria-label="Next month"
                            >
                                <ChevronRightIcon size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 text-center mb-1">
                        {DAY_NAMES.map(d => (
                            <span key={d} className="text-[10px] font-bold text-slate-400 py-1">
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-3">
                        {/* Leading Empty Cells */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-7 w-7" />
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
                                    className={`h-7 w-7 rounded-lg text-xs font-bold transition flex items-center justify-center mx-auto cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#6C306E] text-white shadow-xs'
                                            : isToday
                                            ? 'bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF]'
                                            : 'text-[#241224] hover:bg-purple-50 hover:text-[#6C306E]'
                                    }`}
                                >
                                    {dayNum}
                                </button>
                            )
                        })}
                    </div>

                    {/* Time Picker Row */}
                    <div className="pt-2.5 border-t border-[#EFE0EF] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <ClockIcon size={13} color="#6C306E" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Time:</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                            {/* Hour Select */}
                            <select
                                value={hour12}
                                onChange={(e) => handleTimeChange(parseInt(e.target.value, 10), minute, ampm)}
                                className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-md px-1.5 py-0.5 font-bold text-[#241224] outline-none text-xs"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                                ))}
                            </select>

                            <span className="font-bold text-slate-400">:</span>

                            {/* Minute Select */}
                            <select
                                value={minute}
                                onChange={(e) => handleTimeChange(hour12, parseInt(e.target.value, 10), ampm)}
                                className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-md px-1.5 py-0.5 font-bold text-[#241224] outline-none text-xs"
                            >
                                <option value={0}>00</option>
                                <option value={15}>15</option>
                                <option value={30}>30</option>
                                <option value={45}>45</option>
                                <option value={59}>59</option>
                            </select>

                            {/* AM / PM Toggle */}
                            <div className="flex rounded-md border border-[#EFE0EF] p-0.5 bg-[#FAF6FA]">
                                <button
                                    type="button"
                                    onClick={() => handleTimeChange(hour12, minute, 'AM')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        ampm === 'AM' ? 'bg-[#6C306E] text-white' : 'text-slate-500'
                                    }`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTimeChange(hour12, minute, 'PM')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        ampm === 'PM' ? 'bg-[#6C306E] text-white' : 'text-slate-500'
                                    }`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Done Button */}
                    <div className="pt-2.5 mt-2.5 border-t border-[#EFE0EF] flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1 bg-[#6C306E] hover:bg-[#521C54] text-white text-[11px] font-bold rounded-lg transition shadow-2xs"
                        >
                            Apply Selection
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
