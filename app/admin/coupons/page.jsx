'use client'

import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { TrashIcon, TagIcon, SparklesIcon, PlusIcon } from "@/components/icons"
import { couponDummyData } from "@/assets/assets"

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([])
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
    })

    const fetchCoupons = async () => {
        setCoupons(couponDummyData)
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        const code = newCoupon.code.trim().toUpperCase()
        const discount = Number(newCoupon.discount)

        if (!code || !discount) {
            toast.error("Please provide valid code and discount percentage")
            return
        }

        const created = {
            code,
            description: newCoupon.description || `${discount}% Promotional Discount`,
            discount,
            forNewUser: newCoupon.forNewUser,
            forMember: newCoupon.forMember,
            isPublic: newCoupon.isPublic,
            expiresAt: new Date(newCoupon.expiresAt).toISOString(),
            createdAt: new Date().toISOString()
        }

        setCoupons(prev => [created, ...prev])
        setNewCoupon({
            code: '',
            description: '',
            discount: '',
            forNewUser: false,
            forMember: false,
            isPublic: false,
            expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
        })
        toast.success(`Coupon ${code} added successfully!`)
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setNewCoupon({
            ...newCoupon,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const deleteCoupon = async (code) => {
        setCoupons(prev => prev.filter(c => c.code !== code))
        toast.success(`Coupon ${code} removed`)
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    return (
        <div className="text-slate-800 pb-20">
            <h1 className="text-2xl font-extrabold text-[#241224] mb-1">
                Admin <span className="text-[#6C306E]">Coupons</span>
            </h1>
            <p className="text-xs text-slate-500 mb-6">
                Create and manage customer discount vouchers and seasonal promotions
            </p>

            {/* Add Coupon Form */}
            <form onSubmit={handleAddCoupon} className="max-w-xl bg-white p-6 rounded-3xl border border-[#EFE0EF] mb-8 shadow-[0_4px_24px_rgba(58,12,56,0.04)]">
                <h2 className="text-sm font-extrabold text-[#241224] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TagIcon size={16} color="#6C306E" />
                    <span>Create New Promo Voucher</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                        type="text"
                        placeholder="Coupon Code (e.g. EID25)"
                        className="w-full p-2.5 px-3.5 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-xl text-xs uppercase font-mono font-bold bg-[#FAF6FA]"
                        name="code"
                        value={newCoupon.code}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Discount Percentage (%)"
                        min={1}
                        max={100}
                        className="w-full p-2.5 px-3.5 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-xl text-xs bg-[#FAF6FA]"
                        name="discount"
                        value={newCoupon.discount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <input
                    type="text"
                    placeholder="Description (e.g. 25% Off Eid Festival Privilege)"
                    className="w-full p-2.5 px-3.5 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-xl text-xs bg-[#FAF6FA] mb-3"
                    name="description"
                    value={newCoupon.description}
                    onChange={handleChange}
                    required
                />

                <div className="mb-4">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Expiration Date</label>
                    <input
                        type="date"
                        className="w-full p-2.5 px-3.5 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-xl text-xs bg-[#FAF6FA]"
                        name="expiresAt"
                        value={newCoupon.expiresAt}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="forNewUser"
                            checked={newCoupon.forNewUser}
                            onChange={handleChange}
                            className="rounded text-[#6C306E]"
                        />
                        <span>New Customers Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="forMember"
                            checked={newCoupon.forMember}
                            onChange={handleChange}
                            className="rounded text-[#6C306E]"
                        />
                        <span>VIP Members Only</span>
                    </label>
                </div>

                <button
                    type="submit"
                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                >
                    Add Coupon
                </button>
            </form>

            {/* Coupons Table */}
            <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_4px_24px_rgba(58,12,56,0.04)] border border-[#EFE0EF] max-w-4xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6FA] text-[#241224] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#EFE0EF]">
                        <tr>
                            <th className="px-5 py-4">Code</th>
                            <th className="px-4 py-4">Description</th>
                            <th className="px-4 py-4">Discount</th>
                            <th className="px-4 py-4">Audience</th>
                            <th className="px-4 py-4">Expires</th>
                            <th className="px-4 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE0EF]/60">
                        {coupons.map((coupon) => (
                            <tr key={coupon.code} className="hover:bg-[#FAF6FA]/70 transition-colors">
                                <td className="px-5 py-3.5 font-mono font-extrabold text-[#6C306E]">
                                    {coupon.code}
                                </td>
                                <td className="px-4 py-3.5 font-medium text-[#241224]">
                                    {coupon.description}
                                </td>
                                <td className="px-4 py-3.5 font-extrabold text-[#3A0C38] text-sm">
                                    {coupon.discount}% OFF
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600">
                                        {coupon.forNewUser ? "New Users" : coupon.forMember ? "VIP Members" : "All Shoppers"}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                                    {coupon.expiresAt ? format(new Date(coupon.expiresAt), "dd MMM yyyy") : "No Expiry"}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                    <button
                                        onClick={() => deleteCoupon(coupon.code)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                        title="Delete coupon"
                                    >
                                        <TrashIcon size={14} color="currentColor" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
