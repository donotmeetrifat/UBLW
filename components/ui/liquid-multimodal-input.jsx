'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    IconPhoto,
    IconArrowUp,
    IconX,
    IconFileDescription,
} from '@tabler/icons-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const LIQUID_MATTE_NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.65 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`

export function LiquidMultimodalInput({
    placeholder = 'Ask Emma AI anything, or drop product photos…',
    maxHeight = 250,
    accept = 'image/*',
    onSubmit,
    onChange,
    className,
    disabled = false,
}) {
    const [value, setValue] = React.useState('')
    const [files, setFiles] = React.useState([])
    const [dragOver, setDragOver] = React.useState(false)
    const taRef = React.useRef(null)
    const fileInputRef = React.useRef(null)
    const dragCounter = React.useRef(0)

    React.useEffect(() => {
        const ta = taRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = Math.min(Math.max(ta.scrollHeight, 80), maxHeight) + 'px'
    }, [value, maxHeight])

    function addFiles(list) {
        if (disabled) return
        const arr = Array.from(list).map((f) => ({
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
            file: f,
            preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        }))
        setFiles((prev) => [...prev, ...arr])
    }

    function removeFile(id) {
        setFiles((prev) => {
            const f = prev.find((x) => x.id === id)
            if (f?.preview) URL.revokeObjectURL(f.preview)
            return prev.filter((x) => x.id !== id)
        });
    }

    function submit() {
        if (disabled) return
        if (!value.trim() && files.length === 0) return
        onSubmit?.(value, files.map((f) => f.file))
        setValue('')
        files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
        setFiles([])
        if (taRef.current) taRef.current.style.height = '80px'
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
    }

    function onDragEnter(e) {
        e.preventDefault()
        dragCounter.current++
        if (e.dataTransfer.types.includes('Files')) setDragOver(true)
    }
    function onDragLeave(e) {
        e.preventDefault()
        dragCounter.current--
        if (dragCounter.current === 0) setDragOver(false)
    }
    function onDrop(e) {
        e.preventDefault()
        dragCounter.current = 0
        setDragOver(false)
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
    }

    return (
        <div
            className={cn('w-full max-w-3xl', className)}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            style={{ willChange: 'transform' }}
        >
            <div className="relative w-full flex flex-col items-center">
                {/* Outer Aurora Glow (Drop target) */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-0 blur-[10px]"
                    animate={{ opacity: dragOver ? 0.9 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        background:
                            'conic-gradient(from 0deg, #6C306E, #E879F9, #6C306E, #562258, #6C306E)',
                        willChange: 'opacity',
                    }}
                />

                {/* Main Form Container */}
                <div
                    className={cn(
                        'group relative isolate flex w-full flex-col gap-2 overflow-hidden rounded-[28px] p-3 transition-all duration-150 ease-in-out',
                        // Light Mode Styles (Website luxury theme)
                        'border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#FAF6FA_72%)] text-base',
                        'shadow-[0_1px_2px_rgba(108,48,110,.06),0_8px_24px_-12px_rgba(108,48,110,.12)]',
                        'hover:border-[#6C306E]/30 focus-within:border-[#6C306E]/40',
                        // Active Drop Override
                        dragOver && 'border-[#6C306E]/60'
                    )}
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
                        style={{
                            backgroundImage: LIQUID_MATTE_NOISE,
                            backgroundSize: '240px 240px',
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(108,48,110,0.025)_0%,transparent_30%,transparent_72%,rgba(108,48,110,0.045)_100%)]"
                    />

                    {/* Animated Gradient Thin Inner Edge (1px) */}
                    <div
                        aria-hidden
                        className="lmi-border pointer-events-none absolute inset-0 z-10 rounded-[28px] opacity-50 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
                        style={{
                            padding: '1px',
                            WebkitMask:
                                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            background:
                                'conic-gradient(from var(--lmi-angle, 0deg), transparent 65%, rgba(108,48,110,0.6) 80%, #E879F9 95%, transparent 100%)',
                        }}
                    />
                    <style>{`
            @property --lmi-angle {
              syntax: '<angle>';
              initial-value: 0deg;
              inherits: false;
            }
            .lmi-border {
              animation: lmi-spin 4s linear infinite;
            }
            @keyframes lmi-spin {
              to { --lmi-angle: 360deg; }
            }
          `}</style>

                    <div className="w-full min-w-0 relative z-20">
                        <div className="relative grid w-full flex-1">
                            {/* Attachments Gallery */}
                            <AnimatePresence initial={false}>
                                {files.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-wrap gap-3 px-2 pt-1 pb-4"
                                    >
                                        {files.map((f) => (
                                            <motion.div
                                                key={f.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                                className="group/file relative flex shrink-0 items-center justify-center"
                                            >
                                                {f.preview ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(f.preview, '_blank')}
                                                        className="relative h-20 w-20 overflow-hidden rounded-xl border border-black/5 shadow-sm cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#6C306E]/50"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={f.preview}
                                                            alt={f.file.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover/file:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-200 group-hover/file:opacity-100" />
                                                    </button>
                                                ) : (
                                                    <div className="flex h-14 max-w-[160px] items-center gap-2 rounded-xl border border-black/5 bg-black/5 px-3 shadow-sm">
                                                        <IconFileDescription
                                                            size={20}
                                                            className="shrink-0 text-slate-400"
                                                        />
                                                        <span className="truncate text-xs font-medium text-slate-700">
                                                            {f.file.name}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Floating Remove Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeFile(f.id)
                                                    }}
                                                    aria-label={`Remove ${f.file.name}`}
                                                    className={cn(
                                                        'absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-white shadow-md transition-all duration-200 cursor-pointer',
                                                        'opacity-70 hover:bg-rose-600 hover:opacity-100 focus:opacity-100'
                                                    )}
                                                >
                                                    <IconX size={14} stroke={2.5} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Textarea */}
                            <textarea
                                ref={taRef}
                                value={value}
                                disabled={disabled}
                                onChange={(e) => {
                                    setValue(e.target.value)
                                    onChange?.(e.target.value)
                                }}
                                onKeyDown={handleKey}
                                placeholder={placeholder}
                                aria-label="Chat input"
                                className="w-full resize-none bg-transparent px-3 py-1 text-[15px] sm:text-[16px] leading-snug text-[#241224] outline-none placeholder:text-slate-400 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ minHeight: '80px', maxHeight }}
                            />
                        </div>
                    </div>

                    {/* Toolbar Container */}
                    <div className="relative z-20 flex items-center justify-between mt-auto w-full px-1">
                        {/* Only Image Upload Button (Upload/Paperclip button removed as requested) */}
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="Attach product photo"
                                title="Attach product bottle photo"
                                className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-black/5 hover:text-[#6C306E] cursor-pointer"
                            >
                                <IconPhoto size={18} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={accept}
                                hidden
                                onChange={(e) => {
                                    if (e.target.files?.length) addFiles(e.target.files)
                                    e.target.value = ''
                                }}
                            />
                        </div>

                        {/* Send Action (Pro model dropdown removed as requested) */}
                        <div className="flex items-center">
                            <motion.button
                                type="button"
                                onClick={submit}
                                disabled={disabled || (!value.trim() && files.length === 0)}
                                aria-label="Send message"
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                className={cn(
                                    'grid h-8 w-8 place-items-center rounded-full transition-all shrink-0 cursor-pointer',
                                    'bg-[#6C306E] text-white shadow-[0_2px_8px_-2px_rgba(108,48,110,0.4)]',
                                    'hover:bg-[#562258] hover:shadow-[0_4px_12px_-2px_rgba(108,48,110,0.6)]',
                                    'disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed'
                                )}
                                style={{ willChange: 'transform' }}
                            >
                                <IconArrowUp size={16} stroke={2.5} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Drop overlay */}
                    <AnimatePresence>
                        {dragOver && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-[28px] bg-white/60 backdrop-blur-[2px]"
                                style={{ willChange: 'opacity' }}
                            >
                                <div className="flex items-center gap-2 rounded-full border border-[#6C306E]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#6C306E] shadow-xl">
                                    <IconPhoto size={16} />
                                    Drop product photo here
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
