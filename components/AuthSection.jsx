'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { assets } from '@/assets/assets'
import {
    MailIcon,
    LockIcon,
    UserIcon,
    PhoneIcon,
    EyeIcon,
    EyeOffIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    CheckIcon,
    BagIcon
} from '@/components/icons'

export default function AuthSection({ initialMode = 'signin' }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams?.get('redirect') || '/'

    const [mode, setMode] = useState(initialMode) // 'signin' | 'signup' | 'forgot'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    useEffect(() => {
        const modeParam = searchParams?.get('mode')
        if (modeParam === 'forgot') {
            setMode('forgot')
        } else if (modeParam === 'signin') {
            setMode('signin')
        } else if (modeParam === 'signup') {
            setMode('signup')
        }
    }, [searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        // 1. FORGOT PASSWORD
        if (mode === 'forgot') {
            const rawEmail = email.trim().toLowerCase()
            if (!rawEmail || !rawEmail.includes('@')) {
                setErrorMsg('Please enter your registered email address.')
                return
            }
            setLoading(true)
            try {
                const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: rawEmail }),
                })
                const data = await res.json()
                if (data.success) {
                    setSuccessMsg(data.message || 'Password recovery instructions sent! Check your inbox.')
                } else {
                    setErrorMsg(data.message || 'Unable to process password reset.')
                }
            } catch (err) {
                setErrorMsg('Network error. Please check your connection.')
            } finally {
                setLoading(false)
            }
            return
        }

        // 2. SIGN UP (Name, Email, Phone, Password)
        if (mode === 'signup') {
            const trimmedName = name.trim()
            const rawEmail = email.trim().toLowerCase()
            const cleanPhone = phone.replace(/[^0-9]/g, '')

            if (!trimmedName || trimmedName.length < 2) {
                setErrorMsg('Please enter your full name (at least 2 characters).')
                return
            }

            if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
                setErrorMsg('Please enter a valid email address.')
                return
            }

            if (!cleanPhone || cleanPhone.length < 11) {
                setErrorMsg('Please enter a valid 11-digit phone number (e.g. 01XXXXXXXXX) for product tracking.')
                return
            }

            if (!password || password.length < 6) {
                setErrorMsg('Password must be at least 6 characters.')
                return
            }

            if (password !== confirmPassword) {
                setErrorMsg('Passwords do not match. Please verify and re-enter.')
                return
            }

            setLoading(true)

            try {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: trimmedName,
                        email: rawEmail,
                        phone: cleanPhone,
                        password,
                        confirmPassword,
                    }),
                })

                const data = await res.json()

                if (!res.ok || !data.success) {
                    setErrorMsg(data.message || 'Unable to create account. Please try again.')
                    return
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    window.dispatchEvent(new Event('auth-change'))
                }

                toast.success('Account created successfully! Welcome to UK Brand Lover.')
                setSuccessMsg('Account created successfully! Redirecting...')

                setTimeout(() => {
                    router.push(redirectUrl)
                    router.refresh()
                }, 600)
            } catch (err) {
                setErrorMsg('Unable to connect to authentication server. Please try again.')
            } finally {
                setLoading(false)
            }
            return
        }

        // 3. SIGN IN (Email & Password strictly)
        if (mode === 'signin') {
            const rawEmail = email.trim().toLowerCase()
            if (!rawEmail) {
                setErrorMsg('Please enter your email address.')
                return
            }

            if (!password) {
                setErrorMsg('Please enter your password.')
                return
            }

            setLoading(true)

            try {
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
                    setErrorMsg(data.message || 'Invalid email or password. Please verify and try again.')
                    return
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    window.dispatchEvent(new Event('auth-change'))
                }

                const firstName = (data.user?.name || 'Customer').split(' ')[0]
                toast.success(`Welcome back, ${firstName}!`)
                setSuccessMsg('Signed in successfully! Redirecting...')

                setTimeout(() => {
                    if (data.user?.role === 'ADMIN' && redirectUrl === '/') {
                        router.push('/admin')
                    } else {
                        router.push(redirectUrl)
                    }
                    router.refresh()
                }, 500)
            } catch (err) {
                setErrorMsg('Unable to connect to authentication server. Please try again.')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <section className="min-h-screen bg-[#FAF6FA]/70 text-[#241224] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
            {/* Subtle Ambient Luxury Glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(108,48,110,0.08),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(216,181,109,0.08),transparent_70%)] blur-3xl" />

            {/* Main Auth Card */}
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-xl bg-white border border-[#EFE0EF] rounded-3xl shadow-[0_16px_48px_-8px_rgba(36,18,36,0.08)] p-6 sm:p-10 my-6"
            >
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <Image
                                src={assets.webLogo}
                                alt="UK Brand Lover Logo"
                                className="h-11 sm:h-12 w-auto object-contain mx-auto"
                                priority
                            />
                        </Link>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-[#241224] tracking-tight">
                        {mode === 'signup'
                            ? 'Create Your Account'
                            : mode === 'signin'
                            ? 'Welcome Back'
                            : 'Reset Your Password'}
                    </h1>

                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {mode === 'signup'
                            ? 'Register to track orders, save authentic UK favorites, and access fast checkout.'
                            : mode === 'signin'
                            ? 'Sign in with your email address to access your shopping bag and orders.'
                            : 'Enter your registered email and we will send you a password recovery link.'}
                    </p>
                </div>

                {/* Segmented Mode Switcher (Sign In vs Create Account) */}
                {mode !== 'forgot' && (
                    <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1.5 rounded-2xl mb-6 relative">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('signin')
                                setErrorMsg(null)
                                setSuccessMsg(null)
                            }}
                            className={`relative z-10 flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                                mode === 'signin' ? 'text-white' : 'text-slate-600 hover:text-[#6C306E]'
                            }`}
                        >
                            {mode === 'signin' && (
                                <motion.div
                                    layoutId="authTabIndicator"
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
                            className={`relative z-10 flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                                mode === 'signup' ? 'text-white' : 'text-slate-600 hover:text-[#6C306E]'
                            }`}
                        >
                            {mode === 'signup' && (
                                <motion.div
                                    layoutId="authTabIndicator"
                                    className="absolute inset-0 bg-[#6C306E] rounded-xl shadow-xs -z-10"
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                />
                            )}
                            <span>Create Account</span>
                        </button>
                    </div>
                )}

                {/* Inline Error & Success Banners */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2"
                        >
                            <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                            <span>{errorMsg}</span>
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2"
                        >
                            <CheckIcon size={14} color="#059669" />
                            <span>{successMsg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* FULL NAME (Sign Up only) */}
                    {mode === 'signup' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <label className="block text-[#241224] font-bold mb-1.5">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <UserIcon size={16} color="#6C306E" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Ayesha Rahman"
                                    className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400 shadow-2xs"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* EMAIL ADDRESS (Strictly required for both Sign In and Sign Up) */}
                    <div>
                        <label className="block text-[#241224] font-bold mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <MailIcon size={16} color="#6C306E" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400 shadow-2xs"
                            />
                        </div>
                    </div>

                    {/* PHONE NUMBER (Sign Up only) */}
                    {mode === 'signup' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <label className="block text-[#241224] font-bold mb-1.5">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <PhoneIcon size={16} color="#6C306E" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400 shadow-2xs"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* PASSWORD (Sign In & Sign Up) */}
                    {mode !== 'forgot' && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[#241224] font-bold">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                {mode === 'signin' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode('forgot')
                                            setErrorMsg(null)
                                            setSuccessMsg(null)
                                        }}
                                        className="text-[11px] font-bold text-[#6C306E] hover:underline cursor-pointer"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <LockIcon size={16} color="#6C306E" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-2xl pl-10 pr-10 py-3 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400 shadow-2xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CONFIRM PASSWORD (Sign Up only) */}
                    {mode === 'signup' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <label className="block text-[#241224] font-bold mb-1.5">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <LockIcon size={16} color="#6C306E" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-2xl pl-10 pr-10 py-3 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400 shadow-2xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-[#6C306E] hover:bg-[#521C54] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>
                            {loading
                                ? 'Processing...'
                                : mode === 'signup'
                                ? 'Create Account'
                                : mode === 'signin'
                                ? 'Sign In'
                                : 'Send Recovery Link'}
                        </span>
                        {!loading && <ArrowRightIcon size={14} />}
                    </motion.button>
                </form>

                {/* Back Link for Forgot Password */}
                {mode === 'forgot' && (
                    <div className="text-center mt-5">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('signin')
                                setErrorMsg(null)
                                setSuccessMsg(null)
                            }}
                            className="text-xs font-bold text-[#6C306E] hover:underline cursor-pointer"
                        >
                            ← Back to Sign In
                        </button>
                    </div>
                )}

                {/* Bottom Trust Badge */}
                <div className="mt-8 pt-5 border-t border-[#EFE0EF] flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheckIcon size={15} color="#059669" />
                    <span>100% Genuine UK Imported Products Guaranteed</span>
                </div>
            </motion.div>
        </section>
    )
}
