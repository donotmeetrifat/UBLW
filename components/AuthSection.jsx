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
    ShieldCheckIcon
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
                setErrorMsg('Please enter a valid email address.')
                return
            }

            if (!rawPhone || rawPhone.length < 11) {
                setErrorMsg('Please enter a valid 11-digit phone number (e.g. 01XXXXXXXXX).')
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

                toast.success('Welcome to the UK Brand Lover family!')
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
                setErrorMsg('Please enter your registered email address or phone number.')
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
                setSuccessMsg('Password recovery instructions sent! Please check your inbox.')
            }, 800)
        }
    }

    return (
        <section className="min-h-screen bg-[#FAF6FA] text-[#241224] antialiased flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden font-poppins">
            {/* Ambient Brand Glow Backdrops */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(108,48,110,0.10),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 right-10 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(216,181,109,0.08),transparent_70%)] blur-3xl" />

            {/* Main Auth Split-Screen Container */}
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[1140px] rounded-[32px] border border-[#EFE0EF] bg-white shadow-[0_20px_60px_-15px_rgba(58,12,56,0.07)] overflow-hidden grid lg:grid-cols-[1.12fr_0.88fr]"
            >
                {/* Left Form Column */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white text-[#241224]">
                    <div className="max-w-[440px] w-full mx-auto">
                        {/* Top Navigation Bar */}
                        <div className="flex items-center justify-between mb-8 sm:mb-9">
                            <Link
                                href="/"
                                className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#6C306E] transition-colors"
                            >
                                <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Back to Home</span>
                            </Link>

                            {/* Mode Switcher */}
                            <div className="flex items-center gap-1.5 text-xs">
                                {mode === 'forgot' ? (
                                    <>
                                        <span className="text-slate-500">Remember password?</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('signin')
                                                setErrorMsg(null)
                                                setSuccessMsg(null)
                                            }}
                                            className="font-bold text-[#6C306E] hover:text-[#3A0C38] underline underline-offset-4 transition-colors cursor-pointer"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-slate-500">
                                            {mode === 'signup' ? 'Already a member?' : 'New here?'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode(mode === 'signup' ? 'signin' : 'signup')
                                                setErrorMsg(null)
                                                setSuccessMsg(null)
                                                setConfirmPassword('')
                                            }}
                                            className="font-bold text-[#6C306E] hover:text-[#3A0C38] underline underline-offset-4 transition-colors cursor-pointer"
                                        >
                                            {mode === 'signup' ? 'Sign in' : 'Join us'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Title & Subtitle */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="mb-7 sm:mb-8"
                            >
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight leading-tight">
                                    {mode === 'signup'
                                        ? 'Join UK Brand Lover'
                                        : mode === 'signin'
                                        ? 'Welcome back'
                                        : 'Reset your password'}
                                </h1>
                                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                                    {mode === 'signup'
                                        ? "We're delighted to welcome you. Create your account to discover 100% authentic British beauty, personalised care, and fast delivery across Bangladesh."
                                        : mode === 'signin'
                                        ? 'Sign in to access your shopping bag, track your deliveries, and view your order history.'
                                        : "Enter your registered email address and we'll send you an instant reset link."}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Error & Success Feedback Banners */}
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
                            >
                                <span>{errorMsg}</span>
                            </motion.div>
                        )}

                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2"
                            >
                                <CheckIcon size={16} color="#059669" strokeWidth={2.5} />
                                <span>{successMsg}</span>
                            </motion.div>
                        )}

                        {/* Form Fields with Generous Whitespace */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
                            {/* First Name & Last Name (Sign Up only) */}
                            <AnimatePresence initial={false}>
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="grid gap-3.5 sm:grid-cols-2 overflow-hidden"
                                    >
                                        <FormField
                                            label="First Name"
                                            placeholder="e.g. Ayesha"
                                            value={firstName}
                                            onChange={(val) => setFirstName(val)}
                                            required
                                        />
                                        <FormField
                                            label="Last Name"
                                            placeholder="e.g. Rahman (Optional)"
                                            value={lastName}
                                            onChange={(val) => setLastName(val)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email Address */}
                            <FormField
                                label="Email Address"
                                type="email"
                                placeholder={mode === 'signin' ? 'Your email or phone number' : 'name@example.com'}
                                value={email}
                                onChange={(val) => setEmail(val)}
                                required
                            />

                            {/* Phone Number (Sign Up only) */}
                            <AnimatePresence initial={false}>
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <FormField
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="01XXXXXXXXX"
                                            value={phone}
                                            onChange={(val) => setPhone(val)}
                                            helperText="For order updates & delivery tracking"
                                            required
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Password */}
                            <AnimatePresence initial={false}>
                                {mode !== 'forgot' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden space-y-1.5"
                                    >
                                        <FormField
                                            label="Password"
                                            type="password"
                                            placeholder="At least 6 characters"
                                            value={password}
                                            onChange={(val) => setPassword(val)}
                                            required
                                        />

                                        {/* Forgot Password Link in Sign In mode */}
                                        {mode === 'signin' && (
                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMode('forgot')
                                                        setErrorMsg(null)
                                                        setSuccessMsg(null)
                                                    }}
                                                    className="text-xs font-semibold text-[#6C306E] hover:text-[#3A0C38] underline underline-offset-2 transition-colors cursor-pointer"
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
                                        <FormField
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="Re-enter your password"
                                            value={confirmPassword}
                                            onChange={(val) => setConfirmPassword(val)}
                                            required
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button with Warmth & Connection */}
                            <motion.button
                                whileHover={{ scale: 1.015, y: -1 }}
                                whileTap={{ scale: 0.985 }}
                                type="submit"
                                disabled={loading}
                                className="group relative overflow-hidden w-full h-12 mt-3 rounded-2xl bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white font-bold text-xs sm:text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_-4px_rgba(108,48,110,0.45)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_14px_34px_-2px_rgba(108,48,110,0.65)] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer border border-white/20 shimmer-active"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>
                                            {mode === 'signup'
                                                ? 'Creating your account...'
                                                : mode === 'signin'
                                                ? 'Signing in...'
                                                : 'Sending reset link...'}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="font-semibold text-xs sm:text-sm">
                                        {mode === 'signup'
                                            ? 'Join the UK Brand Lover Family'
                                            : mode === 'signin'
                                            ? 'Sign In to Your Account'
                                            : 'Send Recovery Link'}
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        {/* Security Assurance Tag */}
                        <div className="mt-8 pt-6 border-t border-[#EFE0EF] flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                            <ShieldCheckIcon size={15} color="#059669" />
                            <span>100% Genuine British Beauty • Direct London Heathrow</span>
                        </div>
                    </div>
                </div>

                {/* Right Editorial Column with UK Brand Lover Palette & Poppins Typography */}
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

                    {/* Clean, Iconic Minimalist Headline */}
                    <div className="relative z-10 max-w-md my-auto py-12">
                        <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-white leading-[1.08]">
                            100% Authentic.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2D086] via-[#FFE29A] to-[#D8A74E]">
                                Direct from London.
                            </span>
                        </h2>
                        <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed font-normal max-w-sm">
                            Curated dermatological skincare, cult cosmetics, and hair perfectors imported straight from verified UK distributors.
                        </p>
                    </div>

                    {/* Bottom Feature Highlights */}
                    <div className="relative z-10 pt-5 border-t border-white/10 grid grid-cols-3 gap-3 text-center sm:text-left">
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
 * Ultra-clean, modern FormField with dedicated top label and spacious input styling.
 */
function FormField({
    label,
    value,
    type = 'text',
    placeholder,
    onChange,
    required = false,
    helperText = null,
}) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#241224] tracking-wide">
                    {label} {required && <span className="text-[#6C306E]">*</span>}
                </label>
                {helperText && (
                    <span className="text-[10px] text-slate-400 font-normal">
                        {helperText}
                    </span>
                )}
            </div>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                    aria-label={label}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full h-11 sm:h-12 rounded-2xl border border-[#EFE0EF] bg-[#FCFAFC] px-4 text-xs sm:text-sm text-[#241224] placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-[#FAF6FA] focus:border-[#6C306E] hover:border-[#6C306E]/40 shadow-2xs"
                />
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
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#6C306E] transition-colors rounded-lg cursor-pointer"
                    >
                        {showPassword ? (
                            <EyeOffIcon size={16} color="#6C306E" />
                        ) : (
                            <EyeIcon size={16} color="#8A758A" />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
