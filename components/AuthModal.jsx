'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CloseIcon,
    LockIcon,
    MailIcon,
    PhoneIcon,
    RoyalCrownIcon,
    ShieldCheckIcon,
    StoreFrontIcon,
    UserIcon,
    CheckIcon,
    WhatsAppIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const router = useRouter()
    const [mode, setMode] = useState('login') // 'login', 'register'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsappNumber: '',
        emailOrPhone: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (mode === 'register') {
                const rawWhatsApp = formData.whatsappNumber.replace(/[^0-9]/g, '')
                if (!rawWhatsApp || rawWhatsApp.length < 11) {
                    toast.error('Please enter a valid 11-digit phone number (e.g. 01XXXXXXXXX)')
                    setLoading(false)
                    return
                }

                const rawEmail = formData.email.trim() || `${rawWhatsApp}@ukbrandlover.com`
                const password = formData.password || '123456'

                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name.trim() || 'Valued Shopper',
                        email: rawEmail,
                        phone: rawWhatsApp,
                        password,
                    }),
                })
                const data = await res.json()

                if (!res.ok || !data.success) {
                    toast.error(data.message || 'Unable to register.')
                    setLoading(false)
                    return
                }

                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    window.dispatchEvent(new Event('auth-change'))
                }

                toast.success('VIP Account created successfully! Welcome to UK Brand Lover.')
                if (onLoginSuccess) onLoginSuccess(data.user)
                onClose()
                return
            }

            // Customer Login Mode
            if (!formData.emailOrPhone) {
                toast.error('Please enter your email or phone number')
                setLoading(false)
                return
            }

            if (!formData.password) {
                toast.error('Please enter your password')
                setLoading(false)
                return
            }

            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: formData.emailOrPhone,
                    password: formData.password,
                }),
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Invalid credentials.')
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
            toast.error('Authentication error. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md overflow-y-auto transition-all duration-300"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#EFE0EF] shadow-2xl relative my-6"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer"
                >
                    <CloseIcon size={16} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="size-14 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-3 shadow-2xs">
                        <RoyalCrownIcon size={24} color="#6C306E" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#241224]">
                        {mode === 'login' ? 'Customer Sign In' : 'Join VIP Beauty Club'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        {mode === 'register'
                            ? 'Provide your WhatsApp number to receive private secret discounts & priority parcel tracking'
                            : 'Sign in to view your bag, saved addresses, and live order tracking'}
                    </p>
                </div>

                {/* Mode Selector Tabs with Spring Pill */}
                <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1.5 rounded-2xl mb-6 text-xs font-bold relative">
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className={`relative z-10 flex-1 py-2 rounded-xl transition-colors cursor-pointer ${
                            mode === 'login' ? 'text-white' : 'text-slate-500 hover:text-[#6C306E]'
                        }`}
                    >
                        {mode === 'login' && (
                            <motion.div
                                layoutId="authModalTab"
                                className="absolute inset-0 bg-gradient-to-r from-[#6C306E] to-[#4A154A] rounded-xl shadow-xs -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        )}
                        <span>Sign In</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className={`relative z-10 flex-1 py-2 rounded-xl transition-colors cursor-pointer ${
                            mode === 'register' ? 'text-white' : 'text-slate-500 hover:text-[#6C306E]'
                        }`}
                    >
                        {mode === 'register' && (
                            <motion.div
                                layoutId="authModalTab"
                                className="absolute inset-0 bg-gradient-to-r from-[#6C306E] to-[#4A154A] rounded-xl shadow-xs -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        )}
                        <span>Create VIP Account</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    {mode === 'register' ? (
                        <>
                            <div>
                                <label className="block text-[#241224] font-bold mb-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Ayesha Rahman"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Mandatory WhatsApp Number Field */}
                            <div>
                                <label className="block text-[#241224] font-bold mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-emerald-800">
                                        <WhatsAppIcon size={14} color="#059669" />
                                        <span>WhatsApp Mobile Number (Mandatory)</span>
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-bold">Bangladesh (+880)</span>
                                </label>
                                <div className="relative">
                                    <PhoneIcon size={14} color="#059669" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="tel"
                                        placeholder="019XXXXXXXX or 017XXXXXXXX"
                                        value={formData.whatsappNumber}
                                        onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                        className="w-full bg-emerald-50/40 border border-emerald-300 focus:border-emerald-600 rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224] font-mono font-bold"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    💬 Used for parcel dispatch alerts, live courier tracking, & secret VIP member gifts.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[#241224] font-bold mb-1">Email Address (Optional)</label>
                                <div className="relative">
                                    <MailIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="email"
                                        placeholder="ayesha@gmail.com (Optional)"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224]"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-[#241224] font-bold mb-1">
                                WhatsApp Number or Email
                            </label>
                            <div className="relative">
                                <WhatsAppIcon size={14} color="#059669" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="019XXXXXXXX or customer@email.com"
                                    value={formData.emailOrPhone}
                                    onChange={e => setFormData({ ...formData, emailOrPhone: e.target.value })}
                                    className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224]"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[#241224] font-bold mb-1">
                            Account Password
                        </label>
                        <div className="relative">
                            <LockIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224]"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="group relative overflow-hidden w-full mt-2 bg-gradient-to-r from-[#5C235A] via-[#7B2E79] to-[#3A0C38] hover:from-[#6E2A70] hover:to-[#451245] text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_-4px_rgba(108,48,110,0.45)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_14px_34px_-2px_rgba(108,48,110,0.65)] cursor-pointer disabled:opacity-50 border border-white/20 shimmer-active flex items-center justify-center gap-2"
                    >
                        <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : 'Join VIP Club & Get Exclusive Offers'}</span>
                    </motion.button>
                </form>

                {/* Footer Security Badge */}
                <div className="mt-5 pt-4 border-t border-[#EFE0EF] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheckIcon size={14} color="#059669" />
                    <span>100% Original UK Imported Stock Guaranteed</span>
                </div>
            </motion.div>
        </div>
    )
}

export default AuthModal
