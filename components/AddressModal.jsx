'use client'

import { bangladeshLocations } from '@/lib/constants/bangladeshLocations'
import { addAddress, updateAddress } from '@/lib/features/address/addressSlice'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import PremiumSelect from './PremiumSelect'

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
                city: '', // Reset city when region changes
                area: ''  // Reset area when region changes
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
            toast.error("Please choose your region.")
            return
        }
        if (!address.city) {
            toast.error("Please choose your city.")
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
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#EFE0EF] relative max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#EFE0EF] bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-[#241224]">
                        {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="text-[#7B667B] hover:text-[#6C306E] p-1.5 rounded-full hover:bg-[#FAF6FA] transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 sm:col-span-2 sm:grid-cols-1">
                            <label className="font-semibold text-[#241224]">Full Name <span className="text-red-500">*</span></label>
                            <input
                                name="fullName"
                                onChange={handleAddressChange}
                                value={address.fullName}
                                className="p-3 outline-none border border-[#EFE0EF] rounded-xl w-full focus:border-[#6C306E] bg-[#FAF6FA] text-slate-800 transition"
                                type="text"
                                placeholder="Enter recipient full name"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2 sm:grid-cols-1">
                            <label className="font-semibold text-[#241224]">Phone Number <span className="text-red-500">*</span></label>
                            <input
                                name="phoneNumber"
                                onChange={handleAddressChange}
                                value={address.phoneNumber}
                                className="p-3 outline-none border border-[#EFE0EF] rounded-xl w-full focus:border-[#6C306E] bg-[#FAF6FA] text-slate-800 transition"
                                type="text"
                                placeholder="e.g. 01959524393"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-[#241224]">Region <span className="text-red-500">*</span></label>
                            <PremiumSelect
                                name="region"
                                onChange={handleAddressChange}
                                value={address.region}
                                options={REGIONS.map(r => ({ label: r, value: r }))}
                                placeholder="Please choose your region"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-[#241224]">City <span className="text-red-500">*</span></label>
                            <PremiumSelect
                                name="city"
                                onChange={handleAddressChange}
                                value={address.city}
                                options={availableCities.map(c => ({ label: c, value: c }))}
                                disabled={!address.region}
                                placeholder={address.region ? "Please choose your city" : "Choose region first"}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="font-semibold text-[#241224]">Area / Zone</label>
                            <PremiumSelect
                                name="area"
                                onChange={handleAddressChange}
                                value={address.area}
                                options={DEFAULT_AREAS.map(a => ({ label: a, value: a }))}
                                placeholder="Please select area (Optional)"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="font-semibold text-[#241224]">Full Address <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                onChange={handleAddressChange}
                                value={address.address}
                                className="p-3 outline-none border border-[#EFE0EF] rounded-xl w-full focus:border-[#6C306E] bg-[#FAF6FA] text-slate-800 transition min-h-[75px] resize-none"
                                placeholder="House no, Street name, Landmark..."
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-[#EFE0EF]">
                        <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF6FA] text-[#3A0C38] border border-[#EFE0EF] hover:bg-slate-100 font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:flex-1 px-6 py-3 rounded-full bg-[#6C306E] text-white hover:bg-[#3A0C38] font-semibold transition shadow-md active:scale-95"
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddressModal