'use client'

import { bangladeshLocations } from '@/lib/constants/bangladeshLocations'
import { addAddress, updateAddress } from '@/lib/features/address/addressSlice'
import { CloseIcon, SparklesIcon } from '@/components/icons'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import PremiumSelect from './PremiumSelect'
import { motion, AnimatePresence } from 'framer-motion'

const REGIONS = Object.keys(bangladeshLocations)
const DEFAULT_AREAS = ["City Center / Main Area", "Residential Area", "Commercial Zone", "Suburban Area", "Other"]

const AddressModal = ({ setShowAddressModal, editingAddress = null }) => {
    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        id: Date.now().toString(),
        fullName: '',
        phoneNumber: '',
        region: '',
        city: '',
        area: '',
        address: '',
    })

    useEffect(() => {
        if (editingAddress) {
            setAddress(editingAddress)
        }
    }, [editingAddress])

    const handleAddressChange = (e) => {
        const { name, value } = e.target

        if (name === "region") {
            setAddress(prev => ({
                ...prev,
                region: value,
                city: '',
                area: ''
            }))
        } else if (name === "city") {
            setAddress(prev => ({
                ...prev,
                city: value,
                area: ''
            }))
        } else {
            setAddress(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const availableCities = address.region ? bangladeshLocations[address.region] || [] : []

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!address.fullName.trim()) {
            toast.error("Please enter your full name.")
            return
        }
        if (!address.phoneNumber.trim()) {
            toast.error("Please enter your phone number.")
            return
        }
        if (!address.region) {
            toast.error("Please choose your division / region.")
            return
        }
        if (!address.city) {
            toast.error("Please choose your city / district.")
            return
        }
        if (!address.address.trim()) {
            toast.error("Please enter your street address.")
            return
        }

        if (editingAddress) {
            dispatch(updateAddress(address))
            toast.success("Address updated successfully!")
        } else {
            dispatch(addAddress(address))
            toast.success("Address added successfully!")
        }
        setShowAddressModal(false)
    }

    return (
        <div className="fixed inset-0 z-50 bg-[#241224]/50 backdrop-blur-xs h-screen flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#EFE0EF] relative max-h-[92vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#EFE0EF] bg-white sticky top-0 z-10">
                    <div>
                        <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-widest block mb-0.5">
                            BANGLADESH SHIPPING
                        </span>
                        <h2 className="text-xl font-bold text-[#241224]">
                            {editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="text-slate-400 hover:text-[#241224] p-2 rounded-full hover:bg-[#FAF6FA] transition cursor-pointer"
                        aria-label="Close address modal"
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="font-bold text-[#241224] text-xs">Recipient Full Name <span className="text-red-500">*</span></label>
                            <input
                                name="fullName"
                                onChange={handleAddressChange}
                                value={address.fullName}
                                className="p-3 outline-none border border-[#EFE0EF] rounded-2xl w-full focus:border-[#6C306E] bg-[#FAF6FA] text-slate-800 transition text-xs"
                                type="text"
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="font-bold text-[#241224] text-xs">Phone Number (Bangladeshi Mobile) <span className="text-red-500">*</span></label>
                            <input
                                name="phoneNumber"
                                onChange={handleAddressChange}
                                value={address.phoneNumber}
                                className="p-3 outline-none border border-[#EFE0EF] rounded-2xl w-full focus:border-[#6C306E] bg-[#FAF6FA] text-slate-800 transition text-xs"
                                type="text"
                                placeholder="e.g. 01959524393"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-[#241224] text-xs">Division / Region <span className="text-red-500">*</span></label>
                            <PremiumSelect
                                name="region"
                                onChange={handleAddressChange}
                                value={address.region}
                                options={REGIONS.map(r => ({ label: r, value: r }))}
                                placeholder="Select Division"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-bold text-[#241224] text-xs">City / District <span className="text-red-500">*</span></label>
                            <PremiumSelect
                                name="city"
                                onChange={handleAddressChange}
                                value={address.city}
                                options={availableCities.map(c => ({ label: c, value: c }))}
                                disabled={!address.region}
                                placeholder={address.region ? "Select City / District" : "Choose Division First"}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="font-bold text-[#241224] text-xs">Area / Thana (Optional)</label>
                            <PremiumSelect
                                name="area"
                                onChange={handleAddressChange}
                                value={address.area}
                                options={DEFAULT_AREAS.map(a => ({ label: a, value: a }))}
                                placeholder="Select Area Type"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="font-bold text-[#241224] text-xs">Street Address / House / Flat <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                onChange={handleAddressChange}
                                value={address.address}
                                className="p-3 outline-none border border-[#EFE0EF] rounded-2xl w-full focus:border-[#6C306E] bg-[#FAF6FA] text-slate-800 transition min-h-[75px] resize-none text-xs"
                                placeholder="House / Flat no, Road name, Area landmark in Bangladesh..."
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-[#EFE0EF]">
                        <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF6FA] text-[#3A0C38] border border-[#EFE0EF] hover:bg-slate-100 font-bold transition text-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:flex-1 px-6 py-3 rounded-full bg-[#6C306E] text-white hover:bg-[#3A0C38] font-bold transition shadow-md active:scale-95 text-xs cursor-pointer"
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default AddressModal
