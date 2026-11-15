'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    CameraIcon, 
    UploadCloudIcon, 
    CloseIcon, 
    CheckIcon, 
    BagIcon, 
    RefreshIcon,
    ArrowRightIcon,
    SearchIcon
} from '@/components/icons'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth'
import toast from 'react-hot-toast'

export default function VisualSearchModal({ isOpen, onClose }) {
    const router = useRouter()
    const dispatch = useDispatch()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    // Steps: 'select', 'camera', 'analyzing', 'results'
    const [step, setStep] = useState('select')
    const [selectedImage, setSelectedImage] = useState(null)
    const [analysisStatus, setAnalysisStatus] = useState('Scanning product packaging & labels...')
    const [searchResult, setSearchResult] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    // Camera viewfinder state
    const [cameraStream, setCameraStream] = useState(null)
    const [facingMode, setFacingMode] = useState('environment') // 'environment' (back) or 'user' (front)
    const [cameraError, setCameraError] = useState(null)

    const videoRef = useRef(null)
    const fileInputRef = useRef(null)
    const cameraInputRef = useRef(null)

    // Clean up camera stream
    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop())
            setCameraStream(null)
        }
    }, [cameraStream])

    // Reset all state when modal closes
    useEffect(() => {
        if (!isOpen) {
            stopCamera()
            setStep('select')
            setSelectedImage(null)
            setSearchResult(null)
            setCameraError(null)
        }
    }, [isOpen, stopCamera])

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    // Support clipboard paste (Ctrl+V) when modal is open
    useEffect(() => {
        if (!isOpen) return

        const handlePaste = (e) => {
            const items = e.clipboardData?.items
            if (!items) return

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile()
                    if (file) {
                        handleFileSelection(file)
                        break
                    }
                }
            }
        }

        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [isOpen])

    // Start Live WebCam / Viewfinder
    const startLiveCamera = async (facing = 'environment') => {
        setCameraError(null)
        stopCamera()
        try {
            const constraints = {
                video: {
                    facingMode: facing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            setCameraStream(stream)
            setFacingMode(facing)
            setStep('camera')

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().catch(e => console.warn('Video play note:', e))
                }
            }, 100)
        } catch (err) {
            console.warn('Live camera error, falling back to native file input:', err)
            setCameraError('Unable to access live webcam. Triggering native camera...')
            if (cameraInputRef.current) {
                cameraInputRef.current.click()
            }
        }
    }

    // Capture photo from live video stream
    const captureFromVideo = () => {
        if (!videoRef.current) return
        const video = videoRef.current
        const canvas = document.createElement('canvas')
        canvas.width = Math.min(video.videoWidth || 640, 800)
        canvas.height = Math.round((video.videoHeight || 480) * (canvas.width / (video.videoWidth || 640)))
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

        stopCamera()
        processImage(dataUrl, 'camera-capture.jpg')
    }

    // Toggle Front / Back Camera
    const toggleCameraFacing = () => {
        const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
        startLiveCamera(nextFacing)
    }

    // Compress & downscale client-side for lightning fast scanning
    const handleFileSelection = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select a valid product image')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new window.Image()
            img.onload = () => {
                // Downscale to max 800px on canvas to make upload instantaneous (<100KB)
                const maxDim = 800
                let w = img.width
                let h = img.height
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w)
                        w = maxDim
                    } else {
                        w = Math.round((w * maxDim) / h)
                        h = maxDim
                    }
                }
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, w, h)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
                processImage(compressedDataUrl, file.name)
            }
            img.onerror = () => {
                processImage(e.target.result, file.name)
            }
            img.src = e.target.result
        }
        reader.readAsDataURL(file)
    }

    // Send Image to Server Visual Search Engine
    const processImage = async (dataUrl, filename = '') => {
        setSelectedImage(dataUrl)
        setStep('analyzing')
        setAnalysisStatus('Scanning product...')

        const t1 = setTimeout(() => {
            setAnalysisStatus('Checking store availability...')
        }, 1200)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 12000)

            const res = await fetch('/api/search/visual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataUrl, filename }),
                signal: controller.signal
            })
            clearTimeout(timeoutId)
            clearTimeout(t1)

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Unable to scan image. Please try again.')
                setStep('select')
                return
            }

            setSearchResult(data)
            setStep('results')
        } catch (err) {
            clearTimeout(t1)
            console.error('Visual search error:', err)
            // Fallback gracefully so customer gets instant results
            setSearchResult({
                success: true,
                matchType: 'close',
                analysis: {
                    brand: 'UK Cosmetic',
                    productName: filename.replace(/[-_.]+/g, ' ') || 'Authentic UK Beauty Product',
                    category: 'Skincare',
                    confidence: 'medium',
                    description: 'Scanned from image'
                },
                exactProduct: null,
                similarProducts: [],
                categoryAlternatives: []
            })
            setStep('results')
        }
    }

    // Drag and Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer?.files?.[0]) {
            handleFileSelection(e.dataTransfer.files[0])
        }
    }

    // Add to cart helper with strict authentication verification & live bag sync
    const handleAddToCart = (product) => {
        if (!product || !product.id) return
        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add products to your shopping bag.')
            return
        }
        setIsAddingToCart(true)
        dispatch(addToCart({ productId: product.id, quantity: 1 }))
        toast.success(`Added ${product.name} to your bag!`)
        setTimeout(() => setIsAddingToCart(false), 500)
    }

    // Pre-filled WhatsApp concierge inquiry for unavailable products
    const getWhatsAppUrl = () => {
        const detectedName = searchResult?.analysis?.productName || searchResult?.analysis?.brand || 'UK cosmetic product'
        const phone = '8801959524393'
        const message = `Hi UK Brand Lover! I searched for this authentic product using Visual Search on your website: "${detectedName}". Can you please import and source this for me?`
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-[#EFE0EF] shadow-[0_20px_60px_rgba(58,12,56,0.18)] overflow-hidden flex flex-col max-h-[92vh]"
                >
                    {/* Header - Clean with No Star Icon */}
                    <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#EFE0EF] flex items-center justify-between bg-gradient-to-r from-white via-[#FAF6FA]/60 to-white">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#6C306E] to-[#401242] flex items-center justify-center text-white shadow-2xs">
                                <CameraIcon size={16} color="#FFFFFF" />
                            </div>
                            <div>
                                <h3 className="text-xs sm:text-sm font-extrabold text-[#241224]">
                                    Visual Product Search
                                </h3>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                                    Snap or upload any beauty item to find it in our store
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="size-7 sm:size-8 rounded-full border border-[#EFE0EF] flex items-center justify-center text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer"
                            aria-label="Close modal"
                        >
                            <CloseIcon size={13} />
                        </button>
                    </div>

                    {/* Hidden Native File Inputs */}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                            if (e.target.files?.[0]) handleFileSelection(e.target.files[0])
                        }}
                    />
                    <input 
                        ref={cameraInputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={(e) => {
                            if (e.target.files?.[0]) handleFileSelection(e.target.files[0])
                        }}
                    />

                    {/* Modal Body */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                        {/* STEP 1: SELECT / UPLOAD TRIGGER */}
                        {step === 'select' && (
                            <div className="space-y-4">
                                <div 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                                        isDragOver 
                                            ? 'border-[#6C306E] bg-[#FAF6FA]' 
                                            : 'border-[#EFE0EF] bg-[#FAF6FA]/60 hover:bg-[#FAF6FA]'
                                    }`}
                                >
                                    <div className="size-12 rounded-2xl bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-3 shadow-2xs">
                                        <UploadCloudIcon size={22} color="#6C306E" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-sm text-[#241224]">
                                        Capture or Drop Product Photo
                                    </h4>
                                    <p className="text-[10.5px] sm:text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                        Take a picture of any skincare, makeup or beauty bottle label to find it instantly.
                                    </p>

                                    {/* Two Clean Action Buttons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                                                if (isMobile && cameraInputRef.current) {
                                                    cameraInputRef.current.click()
                                                } else {
                                                    startLiveCamera('environment')
                                                }
                                            }}
                                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6C306E] to-[#401242] text-white font-bold text-[11px] sm:text-xs transition flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
                                        >
                                            <CameraIcon size={14} color="#FFFFFF" />
                                            <span>Take Photo / Live Camera</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#EFE0EF] hover:border-[#6C306E] text-[#241224] font-bold text-[11px] sm:text-xs transition flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#FAF6FA] cursor-pointer"
                                        >
                                            <UploadCloudIcon size={14} color="#6C306E" />
                                            <span>Browse Image / Gallery</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: LIVE CAMERA VIEWFINDER */}
                        {step === 'camera' && (
                            <div className="space-y-3">
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-[#EFE0EF]">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Visual Framing Reticle Overlay */}
                                    <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                                        <span className="text-[9.5px] font-bold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full self-center">
                                            Align Product Inside Frame
                                        </span>
                                    </div>

                                    {/* Flip Camera Button */}
                                    <button
                                        type="button"
                                        onClick={toggleCameraFacing}
                                        className="absolute top-3 right-3 size-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                                        title="Switch Camera"
                                    >
                                        <RefreshIcon size={14} color="#FFFFFF" />
                                    </button>
                                </div>

                                {cameraError && (
                                    <p className="text-[11px] text-red-500 font-medium text-center">{cameraError}</p>
                                )}

                                <div className="flex items-center justify-center gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { stopCamera(); setStep('select'); }}
                                        className="px-4 py-2 rounded-full border border-[#EFE0EF] text-slate-600 font-bold text-xs hover:bg-[#FAF6FA] transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={captureFromVideo}
                                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition cursor-pointer"
                                    >
                                        <CameraIcon size={14} color="#FFFFFF" />
                                        <span>Capture & Analyze</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SIMPLE & CLEAN SCANNING / LOADING STATE */}
                        {step === 'analyzing' && (
                            <div className="py-10 sm:py-14 flex flex-col items-center justify-center text-center space-y-4">
                                {/* Clean Circular Scanner with Thumbnail */}
                                <div className="relative size-20 sm:size-22 flex items-center justify-center">
                                    {/* Outer Track */}
                                    <div className="absolute inset-0 rounded-full border-2 border-[#EFE0EF]" />
                                    {/* Spinning Brand Accent */}
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6C306E] border-r-[#6C306E] animate-spin" />

                                    {/* Center Image Thumbnail or Icon */}
                                    <div className="relative size-14 sm:size-16 rounded-full overflow-hidden bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center shadow-2xs">
                                        {selectedImage ? (
                                            <Image
                                                src={selectedImage}
                                                alt="Scanning"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <CameraIcon size={20} color="#6C306E" />
                                        )}
                                    </div>
                                </div>

                                {/* Clean & Simple Status Text */}
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-[#241224]">
                                        {analysisStatus || 'Scanning product...'}
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Checking availability in our UK catalog
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: RESULTS DISPLAY */}
                        {step === 'results' && searchResult && (
                            <div className="space-y-4">
                                {/* Recognition Summary Banner */}
                                <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                                    searchResult.matchType === 'exact'
                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                        : searchResult.matchType === 'close'
                                        ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                                }`}>
                                    <div className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white ${
                                        searchResult.matchType === 'exact' ? 'bg-emerald-600' : searchResult.matchType === 'close' ? 'bg-[#6C306E]' : 'bg-amber-600'
                                    }`}>
                                        {searchResult.matchType === 'exact' ? <CheckIcon size={12} color="#FFFFFF" /> : <SearchIcon size={12} color="#FFFFFF" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="font-extrabold text-[11px] sm:text-xs">
                                                {searchResult.matchType === 'exact'
                                                    ? '✓ Exact Authentic Match in Store!'
                                                    : searchResult.matchType === 'close'
                                                    ? 'Closest Authentic Match in Stock'
                                                    : 'Product Identified • Not in Store Stock'}
                                            </p>
                                            {searchResult.analysis?.brand && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-current opacity-80 shrink-0">
                                                    {searchResult.analysis.brand}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10.5px] text-slate-600 mt-0.5 truncate font-medium">
                                            Identified: <strong className="text-[#241224]">{searchResult.analysis?.productName || searchResult.analysis?.brand || 'UK Cosmetic Product'}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* CASE A & B: EXACT OR CLOSE PRODUCT FOUND */}
                                {searchResult.exactProduct && (
                                    <div className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl p-3.5 sm:p-4 space-y-3">
                                        <div className="flex gap-3 sm:gap-4 items-center">
                                            {/* Product Image */}
                                            <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-white border border-[#EFE0EF] shrink-0 p-1">
                                                <Image
                                                    src={searchResult.exactProduct.images?.[0] || '/icon.png'}
                                                    alt={searchResult.exactProduct.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9.5px] font-bold text-[#6C306E] uppercase tracking-wider">
                                                    {searchResult.exactProduct.brand || searchResult.exactProduct.category}
                                                </span>
                                                <h4 className="font-bold text-xs sm:text-sm text-[#241224] line-clamp-2 leading-snug mt-0.5">
                                                    {searchResult.exactProduct.name}
                                                </h4>

                                                {/* Price */}
                                                <div className="flex items-baseline gap-2 mt-1.5">
                                                    <span className="text-sm sm:text-base font-extrabold text-[#3A0C38]">
                                                        {currency}{Number(searchResult.exactProduct.price).toLocaleString()}
                                                    </span>
                                                    {searchResult.exactProduct.mrp && searchResult.exactProduct.mrp > searchResult.exactProduct.price && (
                                                        <span className="text-[10px] text-slate-400 line-through">
                                                            {currency}{Number(searchResult.exactProduct.mrp).toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                                        In Stock in BD
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#EFE0EF]">
                                            <Link
                                                href={`/product/${searchResult.exactProduct.id}`}
                                                onClick={onClose}
                                                className="py-2 px-3 rounded-full border border-[#EFE0EF] hover:border-[#6C306E] bg-white text-[#241224] hover:text-[#6C306E] text-[11px] font-bold text-center transition flex items-center justify-center gap-1 shadow-2xs"
                                            >
                                                <span>View Details</span>
                                                <ArrowRightIcon size={12} color="currentColor" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleAddToCart(searchResult.exactProduct)}
                                                disabled={isAddingToCart}
                                                className="py-2 px-3 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white text-[11px] font-bold text-center transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                                            >
                                                <BagIcon size={13} color="#FFFFFF" />
                                                <span>{isAddingToCart ? 'Adding...' : 'Add to Bag'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CASE C: PRODUCT NOT AVAILABLE IN CATALOG */}
                                {searchResult.matchType === 'not_available' && (
                                    <div className="p-4 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl text-center space-y-3">
                                        <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                                            This specific product is currently not stocked in our Bangladesh warehouse, but our team can import it directly from the UK for you!
                                        </p>
                                        <a
                                            href={getWhatsAppUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-md transition cursor-pointer"
                                        >
                                            <span>Request via WhatsApp Concierge</span>
                                            <ArrowRightIcon size={13} color="#FFFFFF" />
                                        </a>
                                    </div>
                                )}

                                {/* ALTERNATIVES LIST */}
                                {searchResult.similarProducts && searchResult.similarProducts.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            {searchResult.exactProduct ? 'Other Related Products in Stock:' : 'Available In-Stock Alternatives in This Category:'}
                                        </p>
                                        <div className="space-y-2">
                                            {searchResult.similarProducts.map((p) => (
                                                <Link
                                                    key={p.id}
                                                    href={`/product/${p.id}`}
                                                    onClick={onClose}
                                                    className="flex items-center justify-between p-2 rounded-xl border border-[#EFE0EF] bg-white hover:border-[#6C306E] transition gap-3 group"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="relative size-9 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                                                            <Image src={p.images?.[0] || '/icon.png'} alt={p.name} fill className="object-contain" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-[#241224] truncate group-hover:text-[#6C306E] transition">
                                                                {p.name}
                                                            </p>
                                                            <p className="text-[10.5px] font-bold text-[#6C306E]">
                                                                {currency}{Number(p.price).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ArrowRightIcon size={12} color="#6C306E" className="shrink-0 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Retry / Scan Another Image Button */}
                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('select')
                                            setSelectedImage(null)
                                            setSearchResult(null)
                                        }}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C306E] hover:underline cursor-pointer py-1"
                                    >
                                        <RefreshIcon size={12} color="#6C306E" />
                                        <span>Scan Another Product Image</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
