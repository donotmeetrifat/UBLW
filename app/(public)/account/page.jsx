'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
    UserIcon, 
    LockIcon, 
    MapPinIcon, 
    PlusIcon, 
    EditIcon, 
    TrashIcon, 
    CheckIcon, 
    ShieldCheckIcon,
    PhoneIcon,
    MailIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import AddressModal from '@/components/AddressModal'
import { removeAddress } from '@/lib/features/address/addressSlice'
import { isInsideDhaka } from '@/lib/settings'

export default function AccountPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const addressList = useSelector(state => state.address.list)

    const [currentUser, setCurrentUser] = useState(null)
    const [activeTab, setActiveTab] = useState('profile') // 'profile', 'security', 'addresses'
    
    // Profile form state
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [profileSaving, setProfileSaving] = useState(false)

    // Password form state
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    useEffect(() => {
        const loadUser = () => {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('ukbl_current_user')
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored)
                        setCurrentUser(parsed)
                        setName(parsed.name || '')
                        setPhone(parsed.phone || parsed.whatsapp || '')
                        setEmail(parsed.email || '')
                    } catch (e) {
                        console.error('Failed to parse user:', e)
                    }
                }
            }
        }
        loadUser()

        // Also fetch fresh from API
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setCurrentUser(data.user)
                    setName(data.user.name || '')
                    setPhone(data.user.phone || data.user.whatsapp || '')
                    setEmail(data.user.email || '')
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('ukbl_current_user', JSON.stringify(data.user))
                    }
                }
            })
            .catch(() => {})
    }, [])

    // Update Profile Handler
    const handleUpdateProfile = async (e) => {
        e.preventDefault()

        if (!name.trim() || name.trim().length < 2) {
            toast.error('Please enter your full name (at least 2 characters)')
            return
        }

        setProfileSaving(true)

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Unable to update profile')
                return
            }

            const updated = { ...currentUser, ...data.user }
            setCurrentUser(updated)
            if (typeof window !== 'undefined') {
                localStorage.setItem('ukbl_current_user', JSON.stringify(updated))
                window.dispatchEvent(new Event('auth-change'))
            }

            toast.success('Personal profile details updated successfully!')
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setProfileSaving(false)
        }
    }

    // Update Password Handler
    const handleUpdatePassword = async (e) => {
        e.preventDefault()

        if (!password || password.length < 6) {
            toast.error('New password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setPasswordSaving(true)

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                toast.error(data.message || 'Unable to update password')
                return
            }

            setPassword('')
            setConfirmPassword('')
            toast.success('Account password updated successfully!')
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setPasswordSaving(false)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Personal Details', icon: UserIcon },
        { id: 'addresses', label: 'Delivery Addresses', icon: MapPinIcon },
        { id: 'security', label: 'Password & Security', icon: LockIcon },
    ]

    return (
        <div className="min-h-[80vh] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-800">
            {/* Header */}
            <div className="pb-6 border-b border-[#EFE0EF]">
                <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-widest bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full">
                    Customer Account Management
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] mt-2">
                    Manage My Account
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Update your contact information, delivery addresses, and login credentials.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 my-6 p-1.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl max-w-lg">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                isActive 
                                    ? 'bg-gradient-to-r from-[#6C306E] to-[#401242] text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-[#6C306E] hover:bg-white'
                            }`}
                        >
                            <Icon size={14} color={isActive ? '#FFFFFF' : 'currentColor'} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* TAB 1: PERSONAL DETAILS */}
            {activeTab === 'profile' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-8 max-w-2xl shadow-2xs"
                >
                    <h2 className="text-base font-bold text-[#241224] mb-1">Personal & Contact Information</h2>
                    <p className="text-xs text-slate-500 mb-6">Manage how your name and contact info appear on orders</p>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1.5">Full Name</label>
                            <div className="relative">
                                <UserIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-3 outline-none text-[#241224] text-xs font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1.5">
                                WhatsApp / Mobile Contact Number
                            </label>
                            <div className="relative">
                                <PhoneIcon size={14} color="#059669" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="019XXXXXXXX or 017XXXXXXXX"
                                    className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-3 outline-none text-[#241224] text-xs font-mono font-bold"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Used for courier delivery updates & dispatch notices</p>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
                            <div className="relative">
                                <MailIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="customer@email.com"
                                    className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-3 outline-none text-[#241224] text-xs font-medium"
                                />
                            </div>
                        </div>

                        <div className="pt-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={profileSaving}
                                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                <CheckIcon size={14} color="#FFFFFF" />
                                <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* TAB 2: SAVED DELIVERY ADDRESSES */}
            {activeTab === 'addresses' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 max-w-3xl"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-[#241224]">Saved Delivery Addresses</h2>
                            <p className="text-xs text-slate-500">Manage addresses for faster 1-click checkout</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#6C306E] text-white text-xs font-bold hover:bg-[#521C54] transition cursor-pointer shadow-xs"
                        >
                            <PlusIcon size={13} color="#FFFFFF" />
                            <span>Add New Address</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addressList && addressList.length > 0 ? (
                            addressList.map((address, idx) => {
                                const addrIsDhaka = isInsideDhaka(address)
                                return (
                                    <div
                                        key={address.id || idx}
                                        className="bg-white border border-[#EFE0EF] rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between pb-2 border-b border-[#EFE0EF]">
                                                <p className="font-bold text-xs text-[#241224]">{address.fullName || address.name}</p>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                    addrIsDhaka 
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                                }`}>
                                                    {addrIsDhaka ? '📍 Inside Dhaka' : '🚚 Outside Dhaka'}
                                                </span>
                                            </div>

                                            <p className="text-[11px] font-mono font-bold text-[#6C306E] mt-2">
                                                {address.phoneNumber || address.phone}
                                            </p>
                                            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                                                {address.address || address.street}, {address.city}, {address.region || address.state}
                                            </p>
                                        </div>

                                        <div className="pt-4 mt-3 border-t border-[#EFE0EF]/60 flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingAddress(address)
                                                    setShowAddressModal(true)
                                                }}
                                                className="px-3 py-1.5 rounded-lg border border-[#EFE0EF] hover:border-[#6C306E] text-slate-600 hover:text-[#6C306E] text-xs font-medium flex items-center gap-1 transition"
                                            >
                                                <EditIcon size={12} color="currentColor" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => dispatch(removeAddress(address.id))}
                                                className="px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1 transition"
                                            >
                                                <TrashIcon size={12} color="currentColor" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="sm:col-span-2 text-center py-12 border border-dashed border-[#EFE0EF] rounded-3xl bg-[#FAF6FA]">
                                <MapPinIcon size={24} color="#6C306E" className="mx-auto mb-2 opacity-50" />
                                <h3 className="font-bold text-sm text-[#241224]">No Saved Addresses</h3>
                                <p className="text-xs text-slate-500 mt-1 mb-4">Add your shipping address for fast checkout</p>
                                <button
                                    type="button"
                                    onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                                    className="px-5 py-2 rounded-full bg-[#6C306E] text-white text-xs font-bold"
                                >
                                    + Add Address
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* TAB 3: PASSWORD & SECURITY */}
            {activeTab === 'security' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-8 max-w-2xl shadow-2xs"
                >
                    <h2 className="text-base font-bold text-[#241224] mb-1">Change Account Password</h2>
                    <p className="text-xs text-slate-500 mb-6">Choose a secure password of at least 6 characters</p>

                    <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1.5">New Password</label>
                            <div className="relative">
                                <LockIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter at least 6 characters"
                                    className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-3 outline-none text-[#241224] text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <LockIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-3 outline-none text-[#241224] text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={passwordSaving}
                                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                <CheckIcon size={14} color="#FFFFFF" />
                                <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    editingAddress={editingAddress}
                />
            )}
        </div>
    )
}
