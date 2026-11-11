'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    TruckIcon, 
    CardPaymentIcon, 
    MobileBankingIcon, 
    CashDeliveryIcon, 
    CheckIcon, 
    SparklesIcon, 
    ShieldCheckIcon,
    UploadIcon,
    TrashIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'

export default function AdminSettingsPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingQr, setUploadingQr] = useState(null) // 'bkash' | 'nagad' | null

    const handleQrUpload = async (provider, file) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (PNG, JPG, WEBP)')
            return
        }

        setUploadingQr(provider)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (data.success && data.url) {
                setPayments(prev => ({
                    ...prev,
                    [provider]: { ...prev[provider], qrCode: data.url }
                }))
                toast.success(`${provider === 'bkash' ? 'bKash' : 'Nagad'} QR code attached! Click Save to apply.`)
            } else {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setPayments(prev => ({
                        ...prev,
                        [provider]: { ...prev[provider], qrCode: e.target.result }
                    }))
                    toast.success(`${provider === 'bkash' ? 'bKash' : 'Nagad'} QR code attached! Click Save to apply.`)
                }
                reader.readAsDataURL(file)
            }
        } catch (err) {
            console.error('Error uploading QR code:', err)
            const reader = new FileReader()
            reader.onload = (e) => {
                setPayments(prev => ({
                    ...prev,
                    [provider]: { ...prev[provider], qrCode: e.target.result }
                }))
                toast.success(`${provider === 'bkash' ? 'bKash' : 'Nagad'} QR code attached! Click Save to apply.`)
            }
            reader.readAsDataURL(file)
        } finally {
            setUploadingQr(null)
        }
    }

    const [delivery, setDelivery] = useState({
        insideDhaka: 80,
        outsideDhaka: 150,
        isFreeDeliveryEnabled: false,
        freeDeliveryThreshold: 0,
    })

    const [payments, setPayments] = useState({
        cod: {
            enabled: true,
            label: 'Cash on Delivery',
            sub: 'Pay cash upon product inspection (Nationwide)',
        },
        bkash: {
            enabled: true,
            label: 'bKash Send Money',
            number: '01959-524393',
            type: 'Personal',
            sub: '01959-524393 (Personal Account)',
            instructions: 'Please Send Money to our official bKash Personal account. Enter your Transaction ID (TrxID) below for instant verification.',
        },
        nagad: {
            enabled: true,
            label: 'Nagad Wallet',
            number: '01959-524393',
            type: 'Personal',
            sub: '01959-524393 (Personal Account)',
            instructions: 'Please Send Money to our official Nagad Personal account. Enter your Transaction ID (TrxID) below for instant verification.',
        },
        card: {
            enabled: true,
            label: 'Debit / Credit Card',
            sub: 'Visa, Mastercard & online banking',
            instructions: 'Card payment & online banking support. Our beauty concierge will provide direct SSL secure checkout links upon order confirmation.',
        },
    })

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            const data = await res.json()
            if (data.success) {
                if (data.delivery) setDelivery(prev => ({ ...prev, ...data.delivery }))
                if (data.payments) setPayments(prev => ({ ...prev, ...data.payments }))
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Unable to fetch live store settings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delivery, payments }),
            })

            const data = await res.json()
            if (data.success) {
                toast.success('Settings updated! Rates and payment methods are live across website.')
            } else {
                toast.error(data.message || 'Failed to save settings')
            }
        } catch (error) {
            toast.error('Connection error while saving settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="text-slate-800 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFE0EF]">
                <div>
                    <h1 className="text-2xl font-bold text-[#241224]">
                        Delivery & Payment <span className="text-[#6C306E]">Settings</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Control courier delivery rates (Inside/Outside Dhaka) and active payment methods live across the store.
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="group relative overflow-hidden bg-gradient-to-r from-[#6C306E] to-[#401242] text-white px-7 py-3 rounded-full font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 shimmer-active flex items-center justify-center gap-2"
                >
                    <CheckIcon size={14} color="#FFFFFF" />
                    <span>{saving ? 'Saving Live Changes...' : 'Save & Publish Live'}</span>
                </motion.button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left 2 Cols: Main Controls */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* SECTION 1: DELIVERY CHARGES */}
                    <div className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                <TruckIcon size={20} color="#6C306E" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#241224]">Courier Delivery Charges (BDT)</h2>
                                <p className="text-xs text-slate-500">Automated location-based delivery calculation</p>
                            </div>
                        </div>

                        {/* Free Delivery Master Switch */}
                        <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-between">
                            <div>
                                <p className="font-bold text-xs text-[#241224]">100% Free Delivery (Store-Wide Promotion)</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    When enabled, all customers get free delivery regardless of their city or cart total.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={delivery.isFreeDeliveryEnabled}
                                    onChange={(e) => setDelivery({ ...delivery, isFreeDeliveryEnabled: e.target.checked })}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Rates Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-[#EFE0EF] bg-white">
                                <label className="block text-xs font-bold text-[#241224] mb-1">
                                    Inside Dhaka Metro Fee ({currency})
                                </label>
                                <p className="text-[10px] text-slate-400 mb-2">Standard rate for Dhaka City Corporation & Metro</p>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                        {currency}
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={delivery.insideDhaka}
                                        onChange={(e) => setDelivery({ ...delivery, insideDhaka: Number(e.target.value) })}
                                        disabled={delivery.isFreeDeliveryEnabled}
                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224] font-bold text-sm disabled:opacity-50"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-[#EFE0EF] bg-white">
                                <label className="block text-xs font-bold text-[#241224] mb-1">
                                    Outside Dhaka / Nationwide Fee ({currency})
                                </label>
                                <p className="text-[10px] text-slate-400 mb-2">Rate for all other 63 districts & sub-districts</p>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                        {currency}
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={delivery.outsideDhaka}
                                        onChange={(e) => setDelivery({ ...delivery, outsideDhaka: Number(e.target.value) })}
                                        disabled={delivery.isFreeDeliveryEnabled}
                                        className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2.5 outline-none text-[#241224] font-bold text-sm disabled:opacity-50"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Free Delivery Threshold */}
                        <div className="p-4 rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA]">
                            <label className="block text-xs font-bold text-[#241224] mb-1">
                                Free Delivery Order Minimum ({currency})
                            </label>
                            <p className="text-[11px] text-slate-500 mb-2">
                                Automatically offer free delivery when subtotal reaches this amount. Set to <b>0</b> to disable threshold.
                            </p>
                            <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                    {currency}
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    value={delivery.freeDeliveryThreshold}
                                    onChange={(e) => setDelivery({ ...delivery, freeDeliveryThreshold: Number(e.target.value) })}
                                    className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl pl-9 pr-3.5 py-2 outline-none text-[#241224] font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: PAYMENT METHODS */}
                    <div className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                <CardPaymentIcon size={20} color="#6C306E" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#241224]">Customer Payment Methods</h2>
                                <p className="text-xs text-slate-500">Enable/disable payment channels and update wallet numbers</p>
                            </div>
                        </div>

                        {/* 1. bKash Settings */}
                        <div className="p-4 rounded-2xl border border-pink-100 bg-pink-50/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-7 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                                        b
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-[#241224]">bKash Send Money</p>
                                        <p className="text-[10px] text-slate-500">Official bKash payment channel</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={payments.bkash?.enabled ?? true}
                                        onChange={(e) => setPayments({
                                            ...payments,
                                            bkash: { ...payments.bkash, enabled: e.target.checked }
                                        })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">bKash Mobile Number</label>
                                    <input
                                        type="text"
                                        value={payments.bkash?.number || ''}
                                        onChange={(e) => setPayments({
                                            ...payments,
                                            bkash: { ...payments.bkash, number: e.target.value }
                                        })}
                                        className="w-full bg-white border border-[#EFE0EF] focus:border-pink-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#241224]"
                                        placeholder="01959-524393"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Type</label>
                                    <input
                                        type="text"
                                        value={payments.bkash?.type || 'Personal'}
                                        onChange={(e) => setPayments({
                                            ...payments,
                                            bkash: { ...payments.bkash, type: e.target.value }
                                        })}
                                        className="w-full bg-white border border-[#EFE0EF] focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-[#241224]"
                                        placeholder="Personal / Merchant"
                                    />
                                </div>
                            </div>

                            {/* bKash QR Code Upload */}
                            <div className="pt-2 border-t border-pink-200/60">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    bKash QR Code (Optional)
                                </label>
                                {payments.bkash?.qrCode ? (
                                    <div className="flex items-center gap-3 p-3 bg-white border border-pink-200 rounded-xl">
                                        <div className="size-14 rounded-lg bg-pink-50 border border-pink-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                                            <img
                                                src={payments.bkash.qrCode}
                                                alt="bKash QR"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-[#241224] truncate">Active bKash QR Code</p>
                                            <p className="text-[10px] text-slate-500">Customers can scan this directly to pay</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPayments({
                                                ...payments,
                                                bkash: { ...payments.bkash, qrCode: '' }
                                            })}
                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <TrashIcon size={12} color="currentColor" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="bkash-qr-file"
                                            className="hidden"
                                            onChange={(e) => handleQrUpload('bkash', e.target.files?.[0])}
                                        />
                                        <label
                                            htmlFor="bkash-qr-file"
                                            className="px-4 py-2 rounded-xl bg-white border border-dashed border-pink-300 hover:border-pink-500 text-pink-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                            <UploadIcon size={13} color="currentColor" />
                                            <span>{uploadingQr === 'bkash' ? 'Uploading...' : 'Upload bKash QR'}</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Or paste QR Code image URL..."
                                            value={payments.bkash?.qrCode || ''}
                                            onChange={(e) => setPayments({
                                                ...payments,
                                                bkash: { ...payments.bkash, qrCode: e.target.value }
                                            })}
                                            className="flex-1 bg-white border border-[#EFE0EF] focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-[#241224]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Nagad Settings */}
                        <div className="p-4 rounded-2xl border border-orange-100 bg-orange-50/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                                        N
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-[#241224]">Nagad Wallet</p>
                                        <p className="text-[10px] text-slate-500">Official Nagad payment channel</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={payments.nagad?.enabled ?? true}
                                        onChange={(e) => setPayments({
                                            ...payments,
                                            nagad: { ...payments.nagad, enabled: e.target.checked }
                                        })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nagad Mobile Number</label>
                                    <input
                                        type="text"
                                        value={payments.nagad?.number || ''}
                                        onChange={(e) => setPayments({
                                            ...payments,
                                            nagad: { ...payments.nagad, number: e.target.value }
                                        })}
                                        className="w-full bg-white border border-[#EFE0EF] focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#241224]"
                                        placeholder="01959-524393"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Type</label>
                                    <input
                                        type="text"
                                        value={payments.nagad?.type || 'Personal'}
                                        onChange={(e) => setPayments({
                                            ...payments,
                                            nagad: { ...payments.nagad, type: e.target.value }
                                        })}
                                        className="w-full bg-white border border-[#EFE0EF] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-[#241224]"
                                        placeholder="Personal / Merchant"
                                    />
                                </div>
                            </div>

                            {/* Nagad QR Code Upload */}
                            <div className="pt-2 border-t border-orange-200/60">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    Nagad QR Code (Optional)
                                </label>
                                {payments.nagad?.qrCode ? (
                                    <div className="flex items-center gap-3 p-3 bg-white border border-orange-200 rounded-xl">
                                        <div className="size-14 rounded-lg bg-orange-50 border border-orange-100 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                                            <img
                                                src={payments.nagad.qrCode}
                                                alt="Nagad QR"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-[#241224] truncate">Active Nagad QR Code</p>
                                            <p className="text-[10px] text-slate-500">Customers can scan this directly to pay</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPayments({
                                                ...payments,
                                                nagad: { ...payments.nagad, qrCode: '' }
                                            })}
                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <TrashIcon size={12} color="currentColor" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="nagad-qr-file"
                                            className="hidden"
                                            onChange={(e) => handleQrUpload('nagad', e.target.files?.[0])}
                                        />
                                        <label
                                            htmlFor="nagad-qr-file"
                                            className="px-4 py-2 rounded-xl bg-white border border-dashed border-orange-300 hover:border-orange-500 text-orange-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                            <UploadIcon size={13} color="currentColor" />
                                            <span>{uploadingQr === 'nagad' ? 'Uploading...' : 'Upload Nagad QR'}</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Or paste QR Code image URL..."
                                            value={payments.nagad?.qrCode || ''}
                                            onChange={(e) => setPayments({
                                                ...payments,
                                                nagad: { ...payments.nagad, qrCode: e.target.value }
                                            })}
                                            className="flex-1 bg-white border border-[#EFE0EF] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-[#241224]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Cash on Delivery */}
                        <div className="p-4 rounded-2xl border border-[#EFE0EF] bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CashDeliveryIcon size={20} color="#059669" />
                                <div>
                                    <p className="font-bold text-xs text-[#241224]">Cash on Delivery (COD)</p>
                                    <p className="text-[10px] text-slate-500">Pay cash upon product inspection across Bangladesh</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={payments.cod?.enabled ?? true}
                                    onChange={(e) => setPayments({
                                        ...payments,
                                        cod: { ...payments.cod, enabled: e.target.checked }
                                    })}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6C306E]"></div>
                            </label>
                        </div>

                        {/* 4. Card / Online Banking */}
                        <div className="p-4 rounded-2xl border border-[#EFE0EF] bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardPaymentIcon size={20} color="#6C306E" />
                                <div>
                                    <p className="font-bold text-xs text-[#241224]">Debit / Credit Card</p>
                                    <p className="text-[10px] text-slate-500">Visa, Mastercard, & online banking support via concierge</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={payments.card?.enabled ?? true}
                                    onChange={(e) => setPayments({
                                        ...payments,
                                        card: { ...payments.card, enabled: e.target.checked }
                                    })}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6C306E]"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right 1 Col: Live Website Preview */}
                <div className="space-y-6">
                    <div className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-3xl p-6 sticky top-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4 text-[#6C306E] font-bold text-xs uppercase tracking-wider">
                            <SparklesIcon size={16} color="#6C306E" />
                            <span>Live Customer View</span>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-4">
                            Here is how shipping rates will appear to customers when placing an order:
                        </p>

                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#EFE0EF] text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-[#EFE0EF]">
                                <span className="font-medium text-slate-600">Inside Dhaka Metro:</span>
                                <span className="font-extrabold text-[#3A0C38]">
                                    {delivery.isFreeDeliveryEnabled || delivery.insideDhaka === 0 
                                        ? 'FREE' 
                                        : `${currency}${delivery.insideDhaka}`}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-2 border-b border-[#EFE0EF]">
                                <span className="font-medium text-slate-600">Outside Dhaka (63 Dists):</span>
                                <span className="font-extrabold text-[#3A0C38]">
                                    {delivery.isFreeDeliveryEnabled || delivery.outsideDhaka === 0 
                                        ? 'FREE' 
                                        : `${currency}${delivery.outsideDhaka}`}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-600">Free Shipping Threshold:</span>
                                <span className="font-bold text-emerald-700">
                                    {delivery.freeDeliveryThreshold > 0 
                                        ? `Orders over ${currency}${delivery.freeDeliveryThreshold.toLocaleString()}` 
                                        : 'None'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                                <ShieldCheckIcon size={14} color="#059669" />
                                <span>Zero-Mistake Auto Detection</span>
                            </div>
                            <p className="leading-relaxed opacity-90">
                                When a customer enters their delivery address, the system checks whether the city is inside Dhaka or outside Dhaka and applies the exact rate automatically.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={saving}
                            className="w-full mt-6 bg-[#6C306E] hover:bg-[#531E55] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                            {saving ? 'Publishing Changes...' : 'Save Settings'}
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    )
}

