'use client'

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { 
    StoreIcon, 
    ShieldCheckIcon, 
    WhatsAppIcon, 
    CheckIcon,
    ArrowRightIcon,
    UploadIcon
} from "@/components/icons"

export default function CreateStore() {
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [logoFile, setLogoFile] = useState(null)
    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!storeInfo.name || !storeInfo.username || !storeInfo.contact) {
            toast.error("Please fill in store name, username, and WhatsApp number")
            return
        }

        const cleanContact = storeInfo.contact.replace(/[^0-9]/g, '')
        if (cleanContact.length < 11) {
            toast.error("Please enter a valid 11-digit Bangladesh WhatsApp number (e.g. 017XXXXXXXX)")
            return
        }

        setLoading(true)
        try {
            // Upload logo if provided
            let logoUrl = null
            if (logoFile) {
                const fd = new FormData()
                fd.append('file', logoFile)
                const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
                const upData = await upRes.json()
                if (upData.success && upData.url) {
                    logoUrl = upData.url
                }
            }

            // In production, save to Store table or admin queue
            // Simulated submission
            await new Promise(r => setTimeout(r, 800))

            setAlreadySubmitted(true)
            toast.success("Merchant partner application submitted successfully!")
        } catch (error) {
            console.error("Store application error:", error)
            toast.error("Failed to submit store application. Please contact our WhatsApp concierge.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF6FA] py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {!alreadySubmitted ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-[#EFE0EF] p-8 sm:p-12 shadow-2xs"
                    >
                        {/* Header */}
                        <div className="text-center max-w-xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C306E]/10 border border-[#6C306E]/20 text-[#6C306E] text-xs font-bold uppercase tracking-wider mb-3">
                                <StoreIcon size={14} color="#6C306E" />
                                <span>Official Merchant Partnership</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-[#241224] tracking-tight mb-2">
                                Become an Approved <span className="text-[#6C306E]">UK Brand Partner</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                Join Bangladesh's most trusted authentic British beauty network. All stores are verified to ensure 100% genuine UK imports.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={onSubmitHandler} className="space-y-6">
                            {/* Logo Upload */}
                            <div className="p-6 bg-[#FAF6FA] rounded-2xl border border-dashed border-[#EFE0EF] flex flex-col items-center justify-center text-center">
                                <label className="cursor-pointer flex flex-col items-center">
                                    <div className="size-20 rounded-2xl bg-white border border-[#EFE0EF] flex items-center justify-center overflow-hidden mb-2 shadow-2xs hover:border-[#6C306E] transition">
                                        {logoFile ? (
                                            <Image 
                                                src={URL.createObjectURL(logoFile)} 
                                                alt="Store preview" 
                                                width={80} 
                                                height={80} 
                                                className="object-contain size-full p-2" 
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <StoreIcon size={28} color="#6C306E" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-[#6C306E] hover:underline flex items-center gap-1.5">
                                        <UploadIcon size={13} color="#6C306E" />
                                        <span>{logoFile ? "Change Store Logo" : "Upload Store Brand Logo"}</span>
                                    </span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setLogoFile(e.target.files[0])} 
                                        hidden 
                                    />
                                </label>
                                <span className="text-[10px] text-slate-400 mt-1">Recommended: PNG / WebP with white background</span>
                            </div>

                            {/* Store Name & Slug */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                        Store Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={storeInfo.name}
                                        onChange={onChangeHandler}
                                        placeholder="e.g. London Glow Boutique"
                                        className="w-full text-xs p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                        Store Username / URL Slug <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl px-3 focus-within:border-[#6C306E]">
                                        <span className="text-xs text-slate-400 select-none">ukbrandlover.com/shop/</span>
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            value={storeInfo.username}
                                            onChange={onChangeHandler}
                                            placeholder="londonglow"
                                            className="w-full text-xs p-3.5 bg-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email & WhatsApp */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                        Official Business Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={storeInfo.email}
                                        onChange={onChangeHandler}
                                        placeholder="partner@yourbrand.com"
                                        className="w-full text-xs p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                        WhatsApp Hotline Number <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact"
                                        required
                                        value={storeInfo.contact}
                                        onChange={onChangeHandler}
                                        placeholder="01XXXXXXXXX"
                                        className="w-full text-xs p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Used for order alerts and courier dispatch coordination</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                    Store Bio & UK Sourcing Credentials
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={storeInfo.description}
                                    onChange={onChangeHandler}
                                    placeholder="Explain the UK brands you import, flight cargo frequency, and authenticity guarantees..."
                                    className="w-full text-xs p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl outline-none resize-none"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                    Physical Store or Warehouse Location (Dhaka / Bangladesh)
                                </label>
                                <textarea
                                    name="address"
                                    rows={2}
                                    value={storeInfo.address}
                                    onChange={onChangeHandler}
                                    placeholder="House, Road, Block, Area (e.g. Road 11, Banani, Dhaka)"
                                    className="w-full text-xs p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl outline-none resize-none"
                                />
                            </div>

                            {/* Verification Policy Notice */}
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                                <ShieldCheckIcon size={20} color="#059669" />
                                <div className="text-xs text-emerald-900 leading-relaxed">
                                    <span className="font-bold">Authenticity Commitment:</span> By submitting, you certify that all items listed in your store are 100% original British products with verified batch codes.
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-full bg-[#6C306E] hover:bg-[#3A0C38] text-white font-bold text-xs uppercase tracking-wider transition shadow-[0_4px_16px_rgba(108,48,110,0.25)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <span>{loading ? "Submitting Application..." : "Submit Store for Verification"}</span>
                                <ArrowRightIcon size={14} color="#FFFFFF" />
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-[#EFE0EF] p-12 text-center max-w-lg mx-auto shadow-2xs space-y-5"
                    >
                        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckIcon size={32} color="#059669" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-[#241224]">Application Received!</h2>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Thank you for applying to partner with UK Brand Lover. Our admin team will verify your business details and contact you via WhatsApp (<b>{storeInfo.contact}</b>) within 24 hours.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/"
                                className="flex-1 py-3 px-4 rounded-full border border-[#EFE0EF] text-xs font-bold text-slate-700 hover:bg-[#FAF6FA] transition text-center"
                            >
                                Back to Home
                            </Link>
                            <a
                                href={`https://wa.me/8801959524393?text=${encodeURIComponent(`Assalamu Alaikum! I just submitted a store application for "${storeInfo.name}". Please review my verification.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                                <WhatsAppIcon size={14} color="#FFFFFF" />
                                <span>WhatsApp Admin</span>
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
