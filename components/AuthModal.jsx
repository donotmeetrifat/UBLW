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
    CheckIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const router = useRouter()
    const [mode, setMode] = useState('login') // 'login', 'register', 'admin'
    const [formData, setFormData] = useState({
        name: '',
        emailOrPhone: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (mode === 'admin') {
                // Quick Admin Login
                const adminUser = {
                    id: 'user_ukbl_admin',
                    name: 'Flagship Admin',
                    email: 'support@ukbrandlover.com',
                    role: 'ADMIN',
                    phone: '01959524393'
                }
                if (typeof window !== 'undefined') {
                    localStorage.setItem('ukbl_current_user', JSON.stringify(adminUser))
                }
                toast.success('Welcome back, Admin!')
                if (onLoginSuccess) onLoginSuccess(adminUser)
                onClose()
                router.push('/store/orders')
                return
            }

            if (!formData.emailOrPhone) {
                toast.error('Please enter your mobile number or email')
                return
            }

            const user = {
                id: `user_${Date.now()}`,
                name: formData.name || 'Valued Customer',
                email: formData.emailOrPhone.includes('@') ? formData.emailOrPhone : `${formData.emailOrPhone}@ukbrandlover.com`,
                phone: formData.emailOrPhone.replace(/[^0-9]/g, '') || '01959524393',
                role: 'CUSTOMER'
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('ukbl_current_user', JSON.stringify(user))
            }

            toast.success(mode === 'register' ? 'Account created successfully! Welcome to UK Brand Lover.' : 'Signed in successfully!')
            if (onLoginSuccess) onLoginSuccess(user)
            onClose()
        } catch (error) {
            toast.error('Authentication error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#EFE0EF] shadow-2xl relative"
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
                        {mode === 'login' ? 'Customer Sign In' : mode === 'register' ? 'Join UK Brand Lover Club' : 'Store & Admin Portal'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        {mode === 'admin'
                            ? 'Manage inventory, verify bKash payments, and fulfill courier orders'
                            : 'Access saved delivery addresses, track packages, and unlock VIP beauty rewards'}
                    </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1 rounded-2xl mb-6 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                            mode === 'login' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-500 hover:text-[#6C306E]'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                            mode === 'register' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-500 hover:text-[#6C306E]'
                        }`}
                    >
                        Register
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('admin')}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                            mode === 'admin' ? 'bg-[#3A0C38] text-white shadow-2xs' : 'text-slate-500 hover:text-[#3A0C38]'
                        }`}
                    >
                        Staff / Admin
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    {mode === 'register' && (
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
                    )}

                    <div>
                        <label className="block text-[#241224] font-bold mb-1">
                            {mode === 'admin' ? 'Admin Email / Username' : 'Mobile Number or Email'}
                        </label>
                        <div className="relative">
                            {mode === 'admin' ? (
                                <MailIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            ) : (
                                <PhoneIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            )}
                            <input
                                type={mode === 'admin' ? 'email' : 'text'}
                                placeholder={mode === 'admin' ? 'support@ukbrandlover.com' : '019XXXXXXXX or email@domain.com'}
                                value={formData.emailOrPhone}
                                onChange={e => setFormData({ ...formData, emailOrPhone: e.target.value })}
                                className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224]"
                                required={mode !== 'admin'}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#241224] font-bold mb-1">
                            {mode === 'admin' ? 'Admin Security Key' : 'Password / Passcode'}
                        </label>
                        <div className="relative">
                            <LockIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="password"
                                placeholder={mode === 'admin' ? '••••••••' : 'Enter password (or leave blank for guest)'}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-[#6C306E] hover:bg-[#3A0C38] text-white py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-[0_4px_16px_rgba(108,48,110,0.25)] cursor-pointer disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : mode === 'register' ? 'Create Free Account' : 'Access Admin Portal'}
                    </button>
                </form>

                {/* Footer Security Badge */}
                <div className="mt-5 pt-4 border-t border-[#EFE0EF] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheckIcon size={14} color="#059669" />
                    <span>100% Authentic UK Products Guaranteed</span>
                </div>
            </motion.div>
        </div>
    )
}

export default AuthModal

