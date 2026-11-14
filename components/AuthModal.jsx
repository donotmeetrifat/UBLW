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
    CheckIcon,
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
    const [successMsg, setSuccessMsg] = useState(null)

    // Email verification state
    const [verificationStep, setVerificationStep] = useState(false)
    const [verificationEmail, setVerificationEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [resending, setResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    useEffect(() => {
        if (initialMode === 'register' || initialMode === 'signup') {
            setMode('signup')
        } else {
            setMode('signin')
        }
        setErrorMsg(null)
        setSuccessMsg(null)
        setVerificationStep(false)
        setOtpCode('')
    }, [initialMode, isOpen])

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCooldown])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)
        setLoading(true)

        try {
            // 1. SIGN UP (Requires email verification via Supabase)
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
                    setErrorMsg('Please enter an 11-digit phone number (e.g. 01XXXXXXXXX) for parcel tracking.')
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

                // Check for email verification requirement
                if (data.requireVerification) {
                    setVerificationEmail(data.email || rawEmail)
                    setVerificationStep(true)
                    setOtpCode('')
                    setResendCooldown(60)
                    toast.success('Verification code sent to your email!')
                    setSuccessMsg(data.message || `Verification code sent to ${data.email || rawEmail}.`)
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

            // 2. SIGN IN (Email & Password strictly; enforces verification)
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
                if (data.requireVerification) {
                    setVerificationEmail(data.email || rawEmail)
                    setVerificationStep(true)
                    setOtpCode('')
                    setErrorMsg(data.message || 'Please verify your email address before signing in.')
                    setLoading(false)
                    return
                }
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

    // Verify OTP code handler
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        const cleanToken = otpCode.trim()
        if (!cleanToken || cleanToken.length < 6) {
            setErrorMsg('Please enter the full 6-digit verification code.')
            return
        }

        setVerifying(true)
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: verificationEmail,
                    token: cleanToken
                })
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Invalid or expired code. Please check your email or request a new code.')
                return
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                window.dispatchEvent(new Event('auth-change'))
            }

            toast.success('Email verified successfully! Welcome to UK Brand Lover.')
            if (onLoginSuccess) onLoginSuccess(data.user)
            onClose()
        } catch (err) {
            setErrorMsg('Unable to verify code. Please check your connection.')
        } finally {
            setVerifying(false)
        }
    }

    // Resend verification code handler
    const handleResendVerification = async () => {
        if (resendCooldown > 0 || resending) return
        setErrorMsg(null)
        setResending(true)

        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verificationEmail })
            })

            const data = await res.json()
            if (data.success) {
                setResendCooldown(60)
                toast.success('New verification code sent!')
                setSuccessMsg(data.message || `A new verification email has been sent to ${verificationEmail}.`)
            } else {
                setErrorMsg(data.message || 'Failed to resend verification email.')
            }
        } catch (err) {
            setErrorMsg('Unable to resend verification code. Please try again.')
        } finally {
            setResending(false)
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
                <div className="text-center mb-4">
                    <div className="flex justify-center mb-3">
                        <Image
                            src={assets.webLogo}
                            alt="UK Brand Lover Logo"
                            className="h-10 sm:h-11 w-auto object-contain mx-auto"
                            priority
                        />
                    </div>

                    <h3 className="text-xl font-black text-[#241224] tracking-tight">
                        {verificationStep
                            ? 'Verify Your Email'
                            : mode === 'signin'
                            ? 'Sign In to Your Account'
                            : 'Create an Account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {verificationStep
                            ? 'Please verify your email address to activate your account.'
                            : mode === 'signin'
                            ? 'Sign in with your email to add products, checkout, and track orders.'
                            : 'Join UK Brand Lover for 100% authentic UK imported beauty.'}
                    </p>
                </div>

                {/* Prompt Banner (if triggered by Add to Cart or Order) */}
                {!verificationStep && promptMessage && (
                    <div className="mb-4 py-2 px-3 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl text-center text-[11px] font-bold text-[#6C306E] flex items-center justify-center gap-1.5">
                        <BagIcon size={13} color="#6C306E" />
                        <span>{promptMessage}</span>
                    </div>
                )}

                {/* Mode Selector Tabs with Spring Pill (Hidden during verification) */}
                {!verificationStep && (
                    <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1 rounded-2xl mb-4 text-xs font-bold relative">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('signin')
                                setErrorMsg(null)
                                setSuccessMsg(null)
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
                                setSuccessMsg(null)
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
                )}

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                        <CheckIcon size={13} color="#059669" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Verification View */}
                {verificationStep ? (
                    <div className="space-y-4">
                        <div className="text-center p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl">
                            <div className="size-10 rounded-xl bg-[#6C306E]/10 border border-[#6C306E]/20 text-[#6C306E] flex items-center justify-center mx-auto mb-2">
                                <MailIcon size={18} color="#6C306E" />
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                                A verification email has been sent to:
                            </p>
                            <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EFE0EF] text-xs font-bold text-[#6C306E]">
                                <span>{verificationEmail}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVerificationStep(false)
                                        setErrorMsg(null)
                                        setSuccessMsg(null)
                                    }}
                                    className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold ml-1 cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                            <div>
                                <label className="block text-center text-xs font-bold text-[#241224] mb-1.5">
                                    Enter 6-Digit Verification Code
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    autoFocus
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="••••••"
                                    className="w-full text-center tracking-[0.45em] font-mono text-2xl font-black py-3 bg-[#FAF6FA]/80 border-2 border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl outline-none text-[#241224] placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300 transition"
                                />
                                <p className="text-[11px] text-center text-slate-400 mt-1.5">
                                    You can also click the confirmation link in your email.
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={verifying || otpCode.trim().length < 6}
                                className="w-full bg-[#6C306E] hover:bg-[#521C54] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>{verifying ? 'Verifying Code...' : 'Verify & Activate'}</span>
                                {!verifying && <ShieldCheckIcon size={14} />}
                            </motion.button>
                        </form>

                        <div className="pt-1 text-center space-y-2">
                            <div className="text-[11px] text-slate-500 font-medium">
                                Didn’t receive the code?{' '}
                                <button
                                    type="button"
                                    disabled={resendCooldown > 0 || resending}
                                    onClick={handleResendVerification}
                                    className="font-bold text-[#6C306E] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {resending
                                        ? 'Sending...'
                                        : resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : 'Resend Code'}
                                </button>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVerificationStep(false)
                                        setErrorMsg(null)
                                        setSuccessMsg(null)
                                    }}
                                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    ← Back to {mode === 'signup' ? 'Registration' : 'Sign In'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Form */
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
                                        className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-3 h-8.5 text-xs outline-none text-[#241224] placeholder:text-slate-400 transition"
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
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-3 h-8.5 text-xs outline-none text-[#241224] placeholder:text-slate-400 transition"
                                />
                            </div>
                        </div>

                        {/* PHONE NUMBER (Sign Up only) */}
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-[#241224] font-bold mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <PhoneIcon size={15} color="#6C306E" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="01XXXXXXXXX"
                                        className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-3 h-8.5 text-xs outline-none text-[#241224] font-medium placeholder:text-slate-400 transition"
                                    />
                                </div>
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
                                    className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-9 pr-9 h-8.5 text-xs outline-none text-[#241224] placeholder:text-slate-400 transition"
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
                                    ? 'Processing...'
                                    : mode === 'signin'
                                    ? 'Sign In to Account'
                                    : 'Create Account'}
                            </span>
                            {!loading && <ArrowRightIcon size={13} />}
                        </motion.button>
                    </form>
                )}

                {/* Footer Trust Note */}
                <div className="mt-4 pt-3.5 border-t border-[#EFE0EF] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheckIcon size={13} color="#059669" />
                    <span>100% Authentic UK Imported Skincare & Cosmetics</span>
                </div>
            </motion.div>
        </div>
    )
}
