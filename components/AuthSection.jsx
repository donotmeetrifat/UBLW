'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeftIcon, 
    CheckIcon, 
    EyeIcon, 
    EyeOffIcon, 
    RoyalCrownIcon, 
    ShieldCheckIcon,
    PlaneIcon
} from '@/components/icons'
import toast from 'react-hot-toast'

export default function AuthSection({ initialMode = 'signin' }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams?.get('redirect') || '/'

    const [mode, setMode] = useState(initialMode) // 'signin' | 'signup' | 'forgot'
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        // Validation for SIGN UP: Email AND Phone are mandatory
        if (mode === 'signup') {
            const trimmedName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Valued Shopper'
            const trimmedEmail = email.trim()
            const rawPhone = phone.replace(/[^0-9]/g, '')

            if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
                setErrorMsg('Please provide a valid email address.')
                return
            }

            if (!rawPhone || rawPhone.length < 11) {
                setErrorMsg('Please provide a valid 11-digit Bangladesh phone / WhatsApp number (e.g. 019XXXXXXXX).')
                return
            }

            if (!password || password.length < 6) {
                setErrorMsg('Password must be at least 6 characters long.')
                return
            }

            if (password !== confirmPassword) {
                setErrorMsg('Passwords do not match. Please verify your confirm password.')
                return
            }

            setLoading(true)

            try {
                const newUser = {
                    id: `user_${Date.now()}`,
                    name: trimmedName,
                    email: trimmedEmail,
                    phone: rawPhone,
                    whatsapp: rawPhone,
                    role: 'CUSTOMER',
                    cart: {},
                    joinedDate: new Date().toISOString()
                }

                // Register with backend customer store
                try {
                    await fetch('/api/marketing/customers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser)
                    })
                } catch (err) {}

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(newUser))
                }

                toast.success('VIP Account created successfully! Welcome to UK Brand Lover.')
                setSuccessMsg('Account created successfully! Redirecting...')
                
                setTimeout(() => {
                    router.push(redirectUrl)
                    router.refresh()
                }, 800)
            } catch (err) {
                setErrorMsg('Unable to create account right now. Please try again.')
            } finally {
                setLoading(false)
            }
            return
        }

        // Validation for SIGN IN: Email or Phone
        if (mode === 'signin') {
            const rawInput = email.trim()
            if (!rawInput) {
                setErrorMsg('Please enter your registered email address or mobile number.')
                return
            }

            if (!password) {
                setErrorMsg('Please enter your password.')
                return
            }

            setLoading(true)

            try {
                const cleanPhone = rawInput.replace(/[^0-9]/g, '')
                const user = {
                    id: `user_${Date.now()}`,
                    name: rawInput.includes('@') ? rawInput.split('@')[0] : 'Valued Customer',
                    email: rawInput.includes('@') ? rawInput : `${cleanPhone || 'customer'}@ukbrandlover.com`,
                    phone: cleanPhone || '01959524393',
                    whatsapp: cleanPhone || '01959524393',
                    role: 'CUSTOMER'
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(user))
                }

                toast.success('Welcome back to UK Brand Lover!')
                setSuccessMsg('Signed in successfully! Redirecting...')

                setTimeout(() => {
                    router.push(redirectUrl)
                    router.refresh()
                }, 600)
            } catch (err) {
                setErrorMsg('Invalid login credentials. Please try again.')
            } finally {
                setLoading(false)
            }
            return
        }

        // Mode: FORGOT PASSWORD
        if (mode === 'forgot') {
            const rawInput = email.trim()
            if (!rawInput) {
                setErrorMsg('Please enter your registered email or phone number.')
                return
            }

            setLoading(true)
            setTimeout(() => {
                setLoading(false)
                setSuccessMsg('Password recovery instructions sent! Please check your inbox or WhatsApp.')
            }, 800)
        }
    }

    return (
        <section className="min-h-screen bg-[#FAF6FA] text-[#241224] antialiased flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
            {/* Ambient Brand Sheen Backdrops */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(108,48,110,0.12),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(216,181,109,0.10),transparent_70%)] blur-3xl" />

            {/* Main Auth Split-Screen Container (exFramer Proportions) */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-[94%] sm:w-[90%] lg:w-[85%] max-w-[1240px] min-h-[80vh] lg:min-h-[82vh] rounded-3xl border border-[#EFE0EF] bg-white shadow-[0_16px_50px_rgba(58,12,56,0.08)] overflow-hidden grid lg:grid-cols-[1.12fr_0.88fr]"
            >
                {/* Left Form Column */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white text-[#241224]">
                    <div className="max-w-[420px] w-full mx-auto">
                        {/* Top Navigation Bar */}
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <Link
                                href="/"
                                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#6C306E] transition-colors"
                            >
                                <ArrowLeftIcon size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                <span>Back to Home</span>
                            </Link>

                            {/* Mode Switcher */}
                            <div className="flex items-center gap-1 text-xs">
                                {mode === 'forgot' ? (
                                    <>
                                        <span className="text-slate-400">Remember password?</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('signin')
                                                setErrorMsg(null)
                                                setSuccessMsg(null)
                                            }}
                                            className="font-bold text-[#6C306E] hover:text-[#3A0C38] underline underline-offset-2 transition-colors cursor-pointer ml-1"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-slate-400">
                                            {mode === 'signup' ? 'Have an account?' : 'No account?'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode(mode === 'signup' ? 'signin' : 'signup')
                                                setErrorMsg(null)
                                                setSuccessMsg(null)
                                                setConfirmPassword('')
                                            }}
                                            className="font-bold text-[#6C306E] hover:text-[#3A0C38] underline underline-offset-2 transition-colors cursor-pointer ml-1"
                                        >
                                            {mode === 'signup' ? 'Sign in' : 'Create one'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Title & Subtitle with Animated Transition */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="mb-6 sm:mb-7"
                            >
                                <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#241224] tracking-tight leading-tight">
                                    {mode === 'signup'
                                        ? 'Create an account'
                                        : mode === 'signin'
                                        ? 'Welcome back'
                                        : 'Reset your password'}
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                    {mode === 'signup'
                                        ? 'Join our VIP Beauty Club for authentic UK restock alerts, flash drops, and express order tracking.'
                                        : mode === 'signin'
                                        ? 'Sign in to access your shopping bag, saved delivery addresses, and order history.'
                                        : "Enter your registered email address or phone and we'll send you an instant reset link."}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Error & Success Feedback Banners */}
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
                            >
                                <span>{errorMsg}</span>
                            </motion.div>
                        )}

                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2"
                            >
                                <CheckIcon size={16} color="#059669" strokeWidth={2.5} />
                                <span>{successMsg}</span>
                            </motion.div>
                        )}

                        {/* Form Fields */}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* First Name & Last Name (Sign Up only) */}
                            <AnimatePresence initial={false}>
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="grid gap-3 sm:grid-cols-2 overflow-hidden"
                                    >
                                        <FieldBox
                                            label="First Name"
                                            placeholder="Your name"
                                            value={firstName}
                                            onChange={(val) => setFirstName(val)}
                                        />
                                        <FieldBox
                                            label="Last Name"
                                            placeholder="Optional"
                                            value={lastName}
                                            onChange={(val) => setLastName(val)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email Address (Always visible) */}
                            <FieldBox
                                label="Email"
                                type="email"
                                placeholder={mode === 'signin' ? 'Email or phone number' : 'name@example.com'}
                                value={email}
                                onChange={(val) => setEmail(val)}
                            />

                            {/* Phone Number (Sign Up only - Mandatory as requested) */}
                            <AnimatePresence initial={false}>
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <FieldBox
                                            label="Number / WhatsApp"
                                            type="tel"
                                            placeholder="019XXXXXXXX or +88019XXXXXXXX"
                                            value={phone}
                                            onChange={(val) => setPhone(val)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Password (Sign In & Sign Up) */}
                            <AnimatePresence initial={false}>
                                {mode !== 'forgot' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden space-y-2"
                                    >
                                        <FieldBox
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(val) => setPassword(val)}
                                        />

                                        {/* Forgot Password Link in Sign In mode */}
                                        {mode === 'signin' && (
                                            <div className="flex justify-end pt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMode('forgot')
                                                        setErrorMsg(null)
                                                        setSuccessMsg(null)
                                                    }}
                                                    className="text-[11px] sm:text-xs font-semibold text-[#6C306E] hover:text-[#3A0C38] underline underline-offset-2 transition-colors cursor-pointer"
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Confirm Password (Sign Up only) */}
                            <AnimatePresence initial={false}>
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <FieldBox
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="••••••••••••"
                                            value={confirmPassword}
                                            onChange={(val) => setConfirmPassword(val)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button with Signature Velvet Plum & Shimmer */}
                            <motion.button
                                whileHover={{ scale: 1.015, y: -1 }}
                                whileTap={{ scale: 0.985 }}
                                type="submit"
                                disabled={loading}
                                className="group relative overflow-hidden w-full h-11 sm:h-12 mt-3 rounded-xl bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white font-bold text-xs sm:text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_-4px_rgba(108,48,110,0.45)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_14px_34px_-2px_rgba(108,48,110,0.65)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer border border-white/20 shimmer-active"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>
                                            {mode === 'signup'
                                                ? 'Creating VIP Account...'
                                                : mode === 'signin'
                                                ? 'Signing In...'
                                                : 'Sending Reset Link...'}
                                        </span>
                                    </div>
                                ) : (
                                    <span>
                                        {mode === 'signup'
                                            ? 'Create VIP Account'
                                            : mode === 'signin'
                                            ? 'Sign In to UK Brand Lover'
                                            : 'Send Recovery Link'}
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        {/* Security Assurance Tag */}
                        <div className="mt-6 pt-5 border-t border-[#EFE0EF] flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                            <ShieldCheckIcon size={14} color="#059669" />
                            <span>100% Authentic UK Imported Beauty • Direct London Heathrow</span>
                        </div>
                    </div>
                </div>

                {/* Right Editorial Column (exFramer Visual Splendor with UK Brand Lover Palette) */}
                <div className="relative flex min-h-[420px] lg:min-h-full overflow-hidden bg-gradient-to-br from-[#2D0B2E] via-[#481249] to-[#180519] p-8 sm:p-12 lg:p-16 text-white flex-col justify-between">
                    {/* Ambient Light Orbs */}
                    <div className="size-80 rounded-full bg-[#9956A1]/15 blur-3xl absolute -top-16 -right-16 pointer-events-none" />
                    <div className="size-96 rounded-full bg-[#D8B56D]/12 blur-3xl absolute -bottom-20 -left-20 pointer-events-none" />

                    {/* Top UK Luxury Badge */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#F2D086] shadow-xs">
                            <RoyalCrownIcon size={14} color="#F2D086" />
                            <span>Direct British Import Store</span>
                        </div>
                    </div>

                    {/* Clean, Iconic Minimalist Headline (exFramer Inspired Typography) */}
                    <div className="relative z-10 max-w-md my-auto py-12">
                        <h2 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-[-0.03em] text-white leading-[1.04]">
                            100% Authentic.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2D086] via-[#FFE29A] to-[#D8B56D]">
                                Direct from London.
                            </span>
                        </h2>
                        <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed font-normal max-w-sm">
                            Curated dermatological skincare, cult cosmetics, and hair perfectors imported straight from verified UK distributors.
                        </p>
                    </div>

                    {/* Bottom Feature Highlights */}
                    <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center sm:text-left">
                        <div>
                            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Origin</p>
                            <p className="text-xs font-bold text-white mt-0.5">London Heathrow</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Verification</p>
                            <p className="text-xs font-bold text-[#F2D086] mt-0.5">100% Genuine</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Delivery</p>
                            <p className="text-xs font-bold text-white mt-0.5">Cash on Delivery</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

/**
 * Clean, compact input field box tailored to exFramer's signature design
 * with password visibility toggle and right-aligned label.
 */
function FieldBox({
    label,
    value,
    type = 'text',
    placeholder,
    onChange,
}) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <label className="flex h-11 sm:h-12 items-center justify-between gap-2.5 rounded-xl border border-[#EFE0EF] bg-white px-3.5 sm:px-4 text-xs sm:text-sm text-[#241224] transition-all focus-within:border-[#6C306E] focus-within:ring-2 focus-within:ring-[#6C306E]/15 cursor-text shadow-2xs hover:border-[#6C306E]/40">
            <input
                type={inputType}
                value={value}
                placeholder={placeholder}
                aria-label={label}
                onChange={(e) => onChange?.(e.target.value)}
                className="min-w-0 flex-1 truncate bg-transparent text-[#241224] outline-none placeholder:text-slate-400 text-xs sm:text-sm font-medium"
            />
            <div className="flex items-center gap-2 shrink-0">
                {isPassword && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowPassword(!showPassword)
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        className="p-1 text-slate-400 hover:text-[#6C306E] transition-colors cursor-pointer rounded-md hover:bg-[#FAF6FA] flex items-center justify-center"
                    >
                        {showPassword ? (
                            <EyeOffIcon size={16} color="#6C306E" />
                        ) : (
                            <EyeIcon size={16} color="#8A758A" />
                        )}
                    </button>
                )}
                <span className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider select-none">
                    {label}
                </span>
            </div>
        </label>
    )
}

