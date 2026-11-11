'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloseIcon, UserIcon, PhoneIcon, MailIcon, LockIcon, CheckIcon, RoyalCrownIcon, ShieldCheckIcon, EyeIcon, EyeOffIcon } from '@/components/icons'
import toast from 'react-hot-toast'

export default function AccountModal({ isOpen, onClose, user, onUserUpdated }) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [otpStep, setOtpStep] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpTarget, setOtpTarget] = useState('')
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setPhone(user.phone || user.whatsapp || '')
            setEmail(user.email || '')
            setPassword('')
            setConfirmPassword('')
            setOtp('')
            setOtpStep(false)
        }
    }, [user, isOpen])

    if (!isOpen) return null

    const handleClose = () => {
        setOtpStep(false)
        setOtp('')
        setPassword('')
        setConfirmPassword('')
        onClose()
    }

    const requestOtp = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                toast.error(data.message || 'Failed to send OTP code')
                return false
            }
            setOtpTarget(data.target || 'your registered contact')
            setOtpStep(true)
            setCountdown(60)
            toast.success(data.message || 'Verification code sent!')
            if (data.devCode) {
                toast((t) => (
                    <span className="text-xs">
                        🔑 Code: <strong className="font-mono text-sm text-[#6C306E]">{data.devCode}</strong>
                    </span>
                ), { duration: 10000 })
            }
            return true
        } catch {
            toast.error('Network error. Please try again.')
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name.trim() || name.trim().length < 2) {
            toast.error('Please enter your full name')
            return
        }

        // If password is being changed, validate it and require OTP
        if (password) {
            if (password.length < 6) {
                toast.error('New password must be at least 6 characters')
                return
            }

            if (password !== confirmPassword) {
                toast.error('Passwords do not match')
                return
            }

            if (!otpStep) {
                // Request OTP first
                await requestOtp()
                return
            }

            if (!otp.trim() || otp.trim().length !== 6) {
                toast.error('Please enter the 6-digit OTP code')
                return
            }
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    password: password || undefined,
                    otp: password ? otp.trim() : undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Unable to update profile')
                return
            }

            const updatedUser = { ...user, ...data.user }
            if (typeof window !== 'undefined') {
                localStorage.setItem('ukbl_current_user', JSON.stringify(updatedUser))
                window.dispatchEvent(new Event('auth-change'))
            }

            toast.success(password ? 'Password and profile updated successfully!' : 'Account profile updated successfully!')
            if (onUserUpdated) onUserUpdated(updatedUser)
            handleClose()
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <div 
                onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md select-none transition-all duration-300"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-md bg-white rounded-3xl border border-[#EFE0EF] shadow-2xl p-6 sm:p-8 overflow-hidden text-xs"
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#FAF6FA] text-slate-400 hover:text-[#241224] transition cursor-pointer"
                        aria-label="Close Account Modal"
                    >
                        <CloseIcon size={14} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] shadow-2xs">
                            <RoyalCrownIcon size={22} color="#6C306E" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-[#241224] tracking-tight">Manage My Account</h3>
                            <p className="text-[11px] text-slate-500">View and update your personal details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#241224] uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <UserIcon size={15} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] focus:bg-white focus:border-[#6C306E] outline-none text-xs text-[#241224] transition font-medium"
                                />
                            </div>
                        </div>

                        {/* Email (Read-only identifier) */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#241224] uppercase tracking-wider mb-1.5">
                                Registered Email
                            </label>
                            <div className="relative">
                                <MailIcon size={15} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="email"
                                    disabled
                                    value={email}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE0EF] bg-slate-100/70 text-slate-500 outline-none text-xs cursor-not-allowed font-medium"
                                />
                            </div>
                        </div>

                        {/* Phone / WhatsApp */}
                        <div>
                            <label className="block text-[11px] font-bold text-[#241224] uppercase tracking-wider mb-1.5">
                                Contact Number
                            </label>
                            <div className="relative">
                                <PhoneIcon size={15} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] focus:bg-white focus:border-[#6C306E] outline-none text-xs text-[#241224] transition font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-2 border-t border-[#EFE0EF]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Change Password (Optional)</span>
                                {otpStep && <span className="text-[#6C306E] font-bold">OTP Required</span>}
                            </p>
                            {!otpStep ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] focus:bg-white focus:border-[#6C306E] outline-none text-xs text-[#241224] transition font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6C306E] transition cursor-pointer p-0.5"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password"
                                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] focus:bg-white focus:border-[#6C306E] outline-none text-xs text-[#241224] transition font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#6C306E] transition cursor-pointer p-0.5"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-[#6C306E]">
                                        <ShieldCheckIcon size={15} color="#6C306E" />
                                        <span className="font-bold text-[11px]">Verification code sent to {otpTarget}</span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        autoFocus
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full text-center py-2 rounded-xl border-2 border-[#EFE0EF] bg-white focus:border-[#6C306E] outline-none font-mono text-base font-black tracking-widest text-[#3A0C38]"
                                        required
                                    />
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        {countdown > 0 ? (
                                            <span>Resend in {countdown}s</span>
                                        ) : (
                                            <button type="button" onClick={requestOtp} className="text-[#6C306E] font-bold hover:underline cursor-pointer">
                                                Resend OTP
                                            </button>
                                        )}
                                        <button type="button" onClick={() => { setOtpStep(false); setOtp(''); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                            Edit Password
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="pt-3">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading || (otpStep && otp.length !== 6)}
                                className="w-full py-3 rounded-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white font-bold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                            >
                                {loading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>
                                            {password ? (otpStep ? 'Verify OTP & Save Password' : 'Send OTP & Save Changes') : 'Save Changes'}
                                        </span>
                                        <CheckIcon size={14} color="#FFFFFF" />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

