'use client'

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import {
    AnimatePresence,
    MotionConfig,
    motion,
    useReducedMotion,
} from 'framer-motion'
import { cn } from '@/lib/utils'

/** Whether `file` matches an `accept` string like `"image/*,.pdf"`. */
export function accepts(file, accept) {
    return accept
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .some((rule) => {
            if (!rule) return false
            if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule)
            if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1))
            return file.type === rule
        })
}

export function newId() {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
}

/** The pill's lift, and the island's float: shadows set in style so the
 * layout animation corrects them as the shapes scale. */
const PILL_SHADOW = '0 1px 3px rgba(108, 48, 110, 0.08)'
const ISLAND_SHADOW =
    '0 0 0 1px rgba(108, 48, 110, 0.12), 0 4px 12px rgba(108, 48, 110, 0.08), 0 24px 48px -18px rgba(58, 12, 56, 0.35)'

/** Tallest the island's image gets, and the island's inset from the prompt. */
const ISLAND_HEIGHT = 280
const INSET = 8

/** One spring for every moving part, so they read as one movement. */
const spring = {
    type: 'spring',
    visualDuration: 0.38,
    bounce: 0.14,
}

function useControllable(value, fallback, onChange) {
    const [inner, setInner] = useState(fallback)
    const controlled = value !== undefined
    const current = controlled ? value : inner
    const set = useCallback(
        (next) => {
            if (!controlled) setInner(next)
            onChange?.(next)
        },
        [controlled, onChange]
    )
    return [current, set, controlled]
}

/**
 * A luxury prompt field for Emma AI consultant, set in a soft rounded shell.
 * Images attach as interactive pills; clicking one opens it large in an Island preview.
 * While a reply is in progress, the send button transitions to stop.
 */
export function PromptBox({
    value,
    defaultValue = '',
    onValueChange,
    onSubmit,
    placeholder = 'Ask Emma anything, or drop product photos...',
    attachments,
    defaultAttachments = [],
    onAttachmentsChange,
    accept = 'image/*',
    maxAttachments = 4,
    busy = false,
    onStop,
    disabled = false,
    toolbar,
    minRows = 1,
    maxRows = 6,
    className,
}) {
    const [text, setText, textControlled] = useControllable(
        value,
        defaultValue,
        onValueChange
    )
    const [files, setFiles, filesControlled] = useControllable(
        attachments,
        defaultAttachments,
        onAttachmentsChange
    )
    const reduce = useReducedMotion()
    const scope = useId()
    const [armed, setArmed] = useState(false)
    const arm = () => setArmed(true)
    const rootRef = useRef(null)
    const shellRef = useRef(null)
    const areaRef = useRef(null)
    const pickerRef = useRef(null)
    const dragDepth = useRef(0)
    const [dragging, setDragging] = useState(false)
    const [openId, setOpenId] = useState(null)
    const [anchor, setAnchor] = useState(0)
    const [sizes, setSizes] = useState({})
    const ownUrls = useRef(new Set())
    const filesRef = useRef(files)

    const open = files.find((file) => file.id === openId) ?? null
    const layoutKey = `${open?.id ?? ''}:${files.map((file) => file.id).join()}`

    useEffect(() => {
        filesRef.current = files
    }, [files])

    useEffect(() => {
        const owned = ownUrls.current
        return () => {
            for (const file of filesRef.current) {
                if (owned.has(file.url)) URL.revokeObjectURL(file.url)
            }
        }
    }, [])

    useEffect(() => {
        if (!open) return
        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpenId(null)
        }
        document.addEventListener('pointerdown', onPointerDown)
        return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open])

    useLayoutEffect(() => {
        const area = areaRef.current
        if (!area) return
        const s = getComputedStyle(area)
        const line = parseFloat(s.lineHeight) || 20
        const pad = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom)
        area.style.height = '0px'
        const fit = Math.min(
            Math.max(area.scrollHeight, line * minRows + pad),
            line * maxRows + pad
        )
        area.style.height = `${fit}px`
    }, [text, minRows, maxRows])

    const room = Math.max(0, maxAttachments - files.length)
    const ready = files.every((file) => file.progress === undefined && !file.error)
    const canSend = !disabled && ready && (text.trim().length > 0 || files.length > 0)

    const addFiles = (list) => {
        const picked = [...list].filter((file) => accepts(file, accept)).slice(0, room)
        if (picked.length === 0) return false
        const next = picked.map((file) => {
            const url = URL.createObjectURL(file)
            ownUrls.current.add(url)
            return { id: newId(), name: file.name, url, file }
        })
        setFiles([...files, ...next])
        return true
    }

    const remove = (id) => {
        const gone = files.find((file) => file.id === id)
        if (gone && ownUrls.current.has(gone.url)) {
            URL.revokeObjectURL(gone.url)
            ownUrls.current.delete(gone.url)
        }
        setFiles(files.filter((file) => file.id !== id))
        areaRef.current?.focus()
    }

    const submit = () => {
        if (!canSend || busy) return
        for (const file of files) ownUrls.current.delete(file.url)
        onSubmit?.({ text: text.trimEnd(), attachments: files })
        setOpenId(null)
        if (!textControlled) setText('')
        if (!filesControlled) setFiles([])
    }

    const onKeyDown = (event) => {
        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
            return
        }
        event.preventDefault()
        submit()
    }

    const onPaste = (event) => {
        if (event.clipboardData.files.length === 0) return
        if (addFiles(event.clipboardData.files) && !event.clipboardData.getData('text')) {
            event.preventDefault()
        }
    }

    const hasFiles = (event) => !disabled && [...event.dataTransfer.types].includes('Files')

    const dragProps = {
        onDragEnter(event) {
            if (!hasFiles(event)) return
            event.preventDefault()
            dragDepth.current++
            setDragging(true)
        },
        onDragOver(event) {
            if (!hasFiles(event)) return
            event.preventDefault()
            event.dataTransfer.dropEffect = room > 0 ? 'copy' : 'none'
        },
        onDragLeave(event) {
            if (!hasFiles(event)) return
            dragDepth.current = Math.max(0, dragDepth.current - 1)
            if (dragDepth.current === 0) setDragging(false)
        },
        onDrop(event) {
            if (!hasFiles(event)) return
            event.preventDefault()
            dragDepth.current = 0
            setDragging(false)
            addFiles(event.dataTransfer.files)
            areaRef.current?.focus()
        },
    }

    return (
        <MotionConfig
            transition={reduce ? { duration: 0 } : spring}
            reducedMotion="user"
        >
            <div
                ref={rootRef}
                {...dragProps}
                data-slot="prompt-box"
                data-busy={busy || undefined}
                onPointerEnter={arm}
                onPointerDownCapture={arm}
                onFocusCapture={arm}
                onKeyDown={(event) => {
                    if (event.key === 'Escape' && open) {
                        event.stopPropagation()
                        setOpenId(null)
                    }
                }}
                className={cn('relative w-full', className)}
            >
                {/* Floating Island preview */}
                <AnimatePresence initial={false}>
                    {open ? (
                        <Island
                            key={open.id}
                            file={open}
                            size={sizes[open.id]}
                            anchor={anchor}
                            scope={scope}
                            onClose={() => setOpenId(null)}
                            onRemove={disabled ? undefined : () => remove(open.id)}
                        />
                    ) : null}
                </AnimatePresence>

                {/* Outer Shell */}
                <motion.div
                    ref={shellRef}
                    layout
                    layoutDependency={layoutKey}
                    style={{ borderRadius: 26 }}
                    className={cn(
                        'relative bg-[#FAF6FA] border border-[#EFE0EF] p-2 transition-all',
                        disabled && 'opacity-60'
                    )}
                >
                    {/* Attachment Pills */}
                    {files.length > 0 ? (
                        <motion.ul
                            layout="position"
                            layoutDependency={layoutKey}
                            aria-label="Attachments"
                            className="relative flex flex-wrap gap-1.5 px-1 pt-0.5 pb-2"
                        >
                            <AnimatePresence initial={false} mode="popLayout">
                                {files.map((file) => (
                                    <Pill
                                        key={file.id}
                                        file={file}
                                        layoutKey={layoutKey}
                                        shared={armed ? scope : undefined}
                                        open={file.id === open?.id}
                                        onToggle={(pill) => {
                                            const root = rootRef.current
                                            if (root) {
                                                setAnchor(
                                                    pill.getBoundingClientRect().left -
                                                    root.getBoundingClientRect().left
                                                )
                                            }
                                            setOpenId((id) => (id === file.id ? null : file.id))
                                        }}
                                        onSize={(size) =>
                                            setSizes((prev) =>
                                                prev[file.id]?.w === size.w &&
                                                prev[file.id]?.h === size.h
                                                    ? prev
                                                    : { ...prev, [file.id]: size }
                                            )
                                        }
                                        onRemove={disabled ? undefined : () => remove(file.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.ul>
                    ) : null}

                    {/* Inner White Field Box */}
                    <motion.div
                        layout="position"
                        layoutDependency={layoutKey}
                        style={{ borderRadius: 20 }}
                        onClick={(event) => {
                            if (event.target === event.currentTarget) areaRef.current?.focus()
                        }}
                        className="relative bg-white border border-[#EFE0EF]/70 shadow-[0_1px_3px_rgba(108,48,110,0.05),0_6px_20px_-10px_rgba(108,48,110,0.12)] transition-shadow duration-200 focus-within:shadow-[0_2px_8px_rgba(108,48,110,0.08),0_8px_24px_-8px_rgba(108,48,110,0.22)] focus-within:border-[#6C306E]/40"
                    >
                        <div className="p-2 sm:p-2.5">
                            <textarea
                                ref={areaRef}
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                                onKeyDown={onKeyDown}
                                onPaste={onPaste}
                                placeholder={placeholder}
                                aria-label={placeholder}
                                disabled={disabled}
                                rows={minRows}
                                className="block w-full resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-[13.5px] leading-5 text-[#241224] outline-none placeholder:text-slate-400 disabled:cursor-not-allowed font-medium"
                            />

                            {/* Toolbar & Send Actions */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                                <div className="flex min-w-0 flex-1 items-center gap-1">
                                    {/* Attach Image (+) Button - NO AUTO BUTTON */}
                                    <button
                                        type="button"
                                        aria-label="Attach product photo"
                                        title="Attach product photo"
                                        disabled={disabled || room === 0}
                                        onClick={() => pickerRef.current?.click()}
                                        className="size-8 sm:size-8.5 rounded-xl hover:bg-[#6C306E]/10 text-slate-500 hover:text-[#6C306E] flex items-center justify-center transition-colors outline-none cursor-pointer disabled:opacity-40"
                                    >
                                        <PlusIcon />
                                    </button>
                                    {toolbar}
                                </div>

                                {/* Send Button */}
                                <button
                                    type="button"
                                    aria-label={busy ? 'Stop' : 'Send'}
                                    disabled={busy ? disabled : !canSend}
                                    onClick={busy ? onStop : submit}
                                    className={cn(
                                        'relative grid size-8.5 sm:size-9 shrink-0 place-items-center overflow-hidden rounded-[14px] transition-all duration-150 outline-none active:scale-95 cursor-pointer shadow-2xs',
                                        busy || canSend
                                            ? 'bg-[#6C306E] text-white hover:bg-[#562258]'
                                            : 'cursor-not-allowed bg-slate-100 text-slate-400'
                                    )}
                                >
                                    <AnimatePresence initial={false} mode="popLayout">
                                        <motion.span
                                            key={busy ? 'stop' : 'send'}
                                            initial={{ opacity: 0, scale: 0.6 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.6 }}
                                            className="grid size-8.5 sm:size-9 place-items-center"
                                        >
                                            {busy ? <StopIcon /> : <ArrowUpIcon />}
                                        </motion.span>
                                    </AnimatePresence>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dragging Overlay */}
                    <AnimatePresence>
                        {dragging ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-[20px] border-2 border-dashed border-[#6C306E] bg-white/95 backdrop-blur-xs shadow-md"
                            >
                                <span className="flex items-center gap-2 text-xs font-bold text-[#6C306E]">
                                    <ImageIcon />
                                    {room > 0
                                        ? 'Drop product photo to attach'
                                        : `Up to ${maxAttachments} photos attached`}
                                </span>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </motion.div>

                {/* Hidden File Picker */}
                <input
                    ref={pickerRef}
                    type="file"
                    accept={accept}
                    multiple
                    hidden
                    tabIndex={-1}
                    onChange={(event) => {
                        if (event.target.files) addFiles(event.target.files)
                        event.target.value = ''
                        areaRef.current?.focus()
                    }}
                />
            </div>
        </MotionConfig>
    )
}

function Pill({
    ref,
    file,
    layoutKey,
    shared,
    open,
    onToggle,
    onSize,
    onRemove,
}) {
    const uploading = file.progress !== undefined && !file.error
    const pct = Math.round((file.progress ?? 0) * 100)

    return (
        <motion.li
            ref={ref}
            layout="position"
            layoutDependency={layoutKey}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className={cn(
                'relative flex h-7.5 sm:h-8 max-w-full items-center rounded-full transition-colors duration-200 select-none shadow-2xs',
                open ? 'bg-[#6C306E] text-white' : 'bg-white text-[#241224] border border-[#EFE0EF]',
                file.error && 'text-rose-600 border-rose-200 bg-rose-50'
            )}
        >
            {open ? null : (
                <motion.span
                    key={shared ? 'shared' : 'still'}
                    aria-hidden="true"
                    layoutId={shared && `${shared}-island-${file.id}`}
                    layoutDependency={layoutKey}
                    layoutCrossfade={false}
                    className="absolute inset-0 bg-white"
                    style={{ borderRadius: 16, boxShadow: PILL_SHADOW }}
                />
            )}

            <button
                type="button"
                onClick={(event) =>
                    onToggle(event.currentTarget.closest('li') ?? event.currentTarget)
                }
                aria-expanded={open}
                aria-label={`${open ? 'Close' : 'Open'} ${file.name}`}
                title={file.name}
                className="relative flex h-full min-w-0 items-center gap-1.5 rounded-full ps-1 pe-1.5 outline-none cursor-pointer"
            >
                {open ? (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid size-5 shrink-0 place-items-center rounded-full bg-white/20"
                    >
                        <ShownIcon />
                    </motion.span>
                ) : (
                    <motion.img
                        key={shared ? 'shared' : 'still'}
                        layoutId={shared && `${shared}-image-${file.id}`}
                        layoutDependency={layoutKey}
                        layoutCrossfade={false}
                        src={file.url}
                        alt=""
                        draggable={false}
                        onLoad={(event) => {
                            const img = event.currentTarget
                            if (img.naturalWidth && img.naturalHeight) {
                                onSize({ w: img.naturalWidth, h: img.naturalHeight })
                            }
                        }}
                        style={{ borderRadius: 10 }}
                        className="relative z-10 size-5.5 sm:size-6 shrink-0 bg-slate-100 object-cover"
                    />
                )}
                <span className="max-w-[7.5rem] sm:max-w-[9rem] min-w-0 truncate text-[11px] sm:text-xs font-semibold opacity-90">
                    {file.name}
                </span>
            </button>

            {onRemove ? (
                <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={onRemove}
                    className={cn(
                        'relative me-1 grid size-5 shrink-0 place-items-center rounded-full transition-colors outline-none cursor-pointer',
                        open
                            ? 'text-white/70 hover:bg-white/20 hover:text-white'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    )}
                >
                    <XIcon className="size-2.5" />
                </button>
            ) : null}
        </motion.li>
    )
}

function Island({
    ref,
    file,
    size,
    anchor,
    scope,
    onClose,
    onRemove,
}) {
    const ratio = size ? size.w / size.h : 4 / 3
    const width = `min(100% - ${INSET * 2}px, ${
        Math.round(ISLAND_HEIGHT * ratio) + INSET * 2
    }px)`
    const [landed, setLanded] = useState(false)

    useEffect(() => {
        const id = window.setTimeout(
            () => setLanded(true),
            spring.visualDuration * 900
        )
        return () => window.clearTimeout(id)
    }, [])

    return (
        <motion.div
            ref={ref}
            role="dialog"
            aria-label={file.name}
            layoutId={`${scope}-island-${file.id}`}
            layoutCrossfade={false}
            exit={{ pointerEvents: 'none' }}
            className="absolute bottom-full z-30 mb-2.5 bg-white p-1.5 border border-[#EFE0EF]"
            style={{
                borderRadius: 24,
                boxShadow: ISLAND_SHADOW,
                width,
                left: `clamp(${INSET}px, ${anchor}px, calc(100% - ${INSET}px - ${width}))`,
            }}
        >
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio, borderRadius: 20 }}>
                <motion.img
                    layoutId={`${scope}-image-${file.id}`}
                    layoutCrossfade={false}
                    src={file.url}
                    alt={file.name}
                    draggable={false}
                    onLayoutAnimationComplete={() => setLanded(true)}
                    className="absolute inset-0 size-full bg-slate-100 object-cover"
                />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={`Close ${file.name}`}
                    className="absolute inset-0 z-10 cursor-zoom-out outline-none"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={
                        landed
                            ? { opacity: 1, scale: 1, transition: { duration: 0.2 } }
                            : { opacity: 0, scale: 0.9 }
                    }
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                    className="absolute top-2 right-2 z-20 flex origin-top-right gap-1.5"
                >
                    <GlassButton label="Close preview" onClick={onClose}>
                        <CollapseIcon />
                    </GlassButton>
                    {onRemove ? (
                        <GlassButton label={`Remove ${file.name}`} onClick={onRemove}>
                            <XIcon className="size-3" />
                        </GlassButton>
                    ) : null}
                </motion.div>
            </div>
        </motion.div>
    )
}

function GlassButton({ label, onClick, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="grid size-7 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-md transition-colors outline-none hover:bg-black/75 cursor-pointer shadow-sm"
        >
            {children}
        </button>
    )
}

function ShownIcon() {
    return (
        <svg viewBox="0 0 16 16" className="size-2.5" fill="none" aria-hidden>
            <path
                d="M5 10.5 8 7.5l3 3M5 6.5 8 3.5l3 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function PlusIcon() {
    return (
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
            <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    )
}

function ArrowUpIcon() {
    return (
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
            <path
                d="M8 13V3.5M3.75 7.5 8 3.25l4.25 4.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function StopIcon() {
    return (
        <span className="relative grid size-5 place-items-center">
            <svg
                viewBox="0 0 24 24"
                className="absolute inset-0 size-5 animate-spin"
                fill="none"
                aria-hidden
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="2.5"
                />
                <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
            <span className="size-2 rounded-[2px] bg-current" />
        </span>
    )
}

function XIcon({ className }) {
    return (
        <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
            <path
                d="m4.5 4.5 7 7m0-7-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    )
}

function CollapseIcon() {
    return (
        <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden>
            <path
                d="M9.5 3v3.5H13M6.5 13V9.5H3M9.5 6.5 13.5 2.5M6.5 9.5l-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function ImageIcon() {
    return (
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
            <rect
                x="2"
                y="2.5"
                width="12"
                height="11"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <circle cx="5.75" cy="6.25" r="1.25" fill="currentColor" />
            <path
                d="m2.5 12 3.75-3.5 2.5 2.25L11 8.5l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
            />
        </svg>
    )
}
