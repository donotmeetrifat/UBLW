'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { assets } from '@/assets/assets'
import {
    CloseIcon,
    MailIcon,
    LockIcon,
    UserIcon,
    PhoneIcon,
    EyeIcon,
    EyeOffIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowRightIcon,
    BagIcon
} from '@/components/icons'

export default function AuthModal({
    isOpen,
    onClose,
    onLoginSuccess,
    initialMode = 'login',
    promptMessage = ''
}) {
    const [mode, setMode] = useState(initialMode === 'register' ? 'signup' : 'signin')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        if (initialMode === 'register' || initialMode === 'signup') {
            setMode('signup')
        } else {
            setMode('signin')
        }
        setErrorMsg(null)
    }, [initialMode, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)

        try {
            // 1. SIGN UP (Name, Email, Phone, Password)
            if (mode === 'signup') {
                const trimmedName = name.trim()
                const rawEmail = email.trim().toLowerCase()
                const cleanPhone = phone.replace(/[^0-9]/g, '')

                if (!trimmedName || trimmedName.length < 2) {
                    setErrorMsg('Please enter your full name (at least 2 characters).')
                    setLoading(false)
                    return
                }

                if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
                    setErrorMsg('Please enter a valid email address.')
                    setLoading(false)
                    return
                }

                if (!cleanPhone || cleanPhone.length < 11) {
                    setErrorMsg('Please enter an 11-digit phone number (e.g. 01XXXXXXXXX) for product tracking.')
                    setLoading(false)
                    return
                }

                if (!password || password.length < 6) {
                    setErrorMsg('Password must be at least 6 characters.')
                    setLoading(false)
                    return
                }

                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: trimmedName,
                        email: rawEmail,
                        phone: cleanPhone,
                        password,
                    }),
                })
                const data = await res.json()

                if (!res.ok || !data.success) {
                    setErrorMsg(data.message || 'Unable to create account. Please try again.')
                    setLoading(false)
                    return
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    window.dispatchEvent(new Event('auth-change'))
                }

                toast.success('Account created successfully! Welcome to UK Brand Lover.')
                if (onLoginSuccess) onLoginSuccess(data.user)
                onClose()
                return
            }

            // 2. SIGN IN (Email & Password strictly)
            const rawEmail = email.trim().toLowerCase()
            if (!rawEmail) {
                setErrorMsg('Please enter your email address.')
                setLoading(false)
                return
            }

            if (!password) {
                setErrorMsg('Please enter your password.')
                setLoading(false)
                return
            }

            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: rawEmail,
                    email: rawEmail,
                    password,
                }),
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Invalid email or password.')
                setLoading(false)
                return
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                window.dispatchEvent(new Event('auth-change'))
            }

            toast.success('Signed in successfully!')
            if (onLoginSuccess) onLoginSuccess(data.user)
            onClose()
        } catch (error) {
            setErrorMsg('Authentication error. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            {/* Modal Card - Closes ONLY via Close Button per user strict rule */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 sm:p-7 my-6 text-[#241224]"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer"
                    aria-label="Close modal"
                >
                    <CloseIcon size={16} />
                </button>

                {/* Header Brand */}
                <div className="text-center mb-5">
                    <div className="size-11 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] p-1.5 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                        <Image
                            src={assets.webLogo}
                            alt="UK Brand Lover Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>

                    <h3 className="text-xl font-black text-[#241224] tracking-tight">
                        {mode === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {mode === 'signin'
                            ? 'Sign in with your email to add products, checkout, and track orders.'
                            : 'Join UK Brand Lover for 100% authentic UK imported beauty.'}
                    </p>
                </div>

                {/* Prompt Banner (if triggered by Add to Cart or Order) */}
                {promptMessage && (
                    <div className="mb-4 py-2 px-3 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl text-center text-[11px] font-bold text-[#6C306E] flex items-center justify-center gap-1.5">
                        <BagIcon size={13} color="#6C306E" />
                        <span>{promptMessage}</span>
                    </div>
                )}

                {/* Mode Selector Tabs with Spring Pill */}
                <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1 rounded-2xl mb-5 text-xs font-bold relative">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('signin')
                            setErrorMsg(null)
                        }}
                        className={`relative z-10 flex-1 py-1.5 rounded-xl transition-colors cursor-pointer text-center ${
                            mode === 'signin' ? 'text-white' : 'text-slate-600 hover:text-[#6C306E]'
                        }`}
                    >
                        {mode === 'signin' && (
                            <motion.div
                                layoutId="authModalTabIndicator"
                                className="absolute inset-0 bg-[#6C306E] rounded-xl shadow-xs -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        )}
                        <span>Sign In</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode('signup')
                            setErrorMsg(null)
                        }}
                        className={`relative z-10 flex-1 py-1.5 rounded-xl transition-colors cursor-pointer text-center ${
                            mode === 'signup' ? 'text-white' : 'text-slate-600 hover:text-[#6C306E]'
                        }`}
                    >
                        {mode === 'signup' && (
                            <motion.div
                                layoutId="authModalTabIndicator"
                                className="absolute inset-0 bg-[#6C306E] rounded-xl shadow-xs -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        )}
                        <span>Create Account</span>
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    {/* FULL NAME (Sign Up only) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-[#241224] font-bold mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <UserIcon size={15} color="#6C306E" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Ayesha Rahman"
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none text-[#241224] placeholder:text-slate-400 transition"
                                />
                            </div>
                        </div>
                    )}

                    {/* EMAIL ADDRESS (Strictly Email for Sign In and Sign Up) */}
                    <div>
                        <label className="block text-[#241224] font-bold mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <MailIcon size={15} color="#6C306E" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none text-[#241224] placeholder:text-slate-400 transition"
                            />
                        </div>
                    </div>

                    {/* PHONE NUMBER (Sign Up only - Mandatory for product tracking) */}
                    {mode === 'signup' && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[#241224] font-bold">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    For Product Tracking
                                </span>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <PhoneIcon size={15} color="#059669" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none text-[#241224] font-mono font-bold placeholder:text-slate-400 transition"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Required for parcel delivery tracking and courier SMS updates.
                            </p>
                        </div>
                    )}

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-[#241224] font-bold mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <LockIcon size={15} color="#6C306E" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-9 py-2.5 text-xs outline-none text-[#241224] placeholder:text-slate-400 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full mt-3 bg-[#6C306E] hover:bg-[#521C54] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>
                            {loading
                                ? 'Verifying...'
                                : mode === 'signin'
                                ? 'Sign In to Account'
                                : 'Create Account'}
                        </span>
                        {!loading && <ArrowRightIcon size={13} />}
                    </motion.button>
                </form>

                {/* Footer Trust Note */}
                <div className="mt-4 pt-3.5 border-t border-[#EFE0EF] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheckIcon size={13} color="#059669" />
                    <span>100% Authentic UK Imported Skincare & Cosmetics</span>
                </div>
            </motion.div>
        </div>
    )
}
