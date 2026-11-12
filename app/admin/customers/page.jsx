'use client'

import { useEffect, useState, useMemo } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import {
    UserIcon,
    SearchIcon,
    BagIcon,
    TagIcon,
    WhatsAppIcon,
    CloseIcon,
    EyeIcon,
    ArrowRightIcon,
    CheckIcon
} from "@/components/icons"

export default function AdminCustomersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/customers')
            const data = await res.json()
            if (data.success && Array.isArray(data.customers)) {
                setCustomers(data.customers)
            } else {
                setCustomers([])
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
            toast.error('Failed to load customers list')
            setCustomers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers
        const q = searchQuery.toLowerCase().trim()
        return customers.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.whatsapp || '').toLowerCase().includes(q)
        )
    }, [customers, searchQuery])

    // Summary statistics
    const stats = useMemo(() => {
        const total = customers.length
        const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
        const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)
        const buyers = customers.filter(c => (c.totalOrders || 0) > 0).length
        return { total, totalRevenue, totalOrders, buyers }
    }, [customers])

    if (loading) return <Loading />

    return (
        <div className="space-y-6 pb-24 text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Customer Purchase</span>
                        <span className="text-[#6C306E]">Intelligence</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Track verified registered customer accounts, order history, and detailed product purchase breakdown
                    </p>
                </div>

                <button
                    onClick={fetchCustomers}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] text-xs font-bold text-slate-700 shadow-2xs transition self-start sm:self-auto"
                >
                    <span>Refresh Customers</span>
                </button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Total Registered Users
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#241224]">
                        {stats.total}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Active accounts</div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Active Buyers
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#6C306E]">
                        {stats.buyers}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Placed ≥ 1 order</div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Total Customer Orders
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#241224]">
                        {stats.totalOrders}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Dispatched & confirmed</div>
                </div>

                <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Lifetime Customer Spend
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-700">
                        {currency}{Number(stats.totalRevenue).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Gross revenue</div>
                </div>
            </div>

            {/* Search Filter */}
            <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon size={16} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customer by name, email address, or phone number..."
                        className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white border border-[#EFE0EF] rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#EFE0EF] bg-[#FAF6FA]/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Customer Details</th>
                                <th className="py-3.5 px-4">Contact & WhatsApp</th>
                                <th className="py-3.5 px-4">Joined Date</th>
                                <th className="py-3.5 px-4 text-center">Orders</th>
                                <th className="py-3.5 px-4 text-center">Units Bought</th>
                                <th className="py-3.5 px-4">Total Spent</th>
                                <th className="py-3.5 px-4 text-right">Purchase Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((cust) => {
                                    const rawPhone = (cust.phone || cust.whatsapp || '').replace(/[^0-9]/g, '')
                                    const whatsappUrl = rawPhone ? `https://wa.me/880${rawPhone.startsWith('0') ? rawPhone.slice(1) : rawPhone}` : null

                                    return (
                                        <tr key={cust.id} className="hover:bg-[#FAF6FA]/30 transition">
                                            {/* Customer Name & Email */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-[#241224]">
                                                    {cust.name || 'Valued Customer'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                    {cust.email}
                                                </div>
                                            </td>

                                            {/* Phone & WhatsApp Link */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">
                                                        {cust.phone || cust.whatsapp || 'No Phone'}
                                                    </span>
                                                    {whatsappUrl && (
                                                        <a
                                                            href={whatsappUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="size-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center transition"
                                                            title="Message on WhatsApp"
                                                        >
                                                            <WhatsAppIcon size={12} color="#059669" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Joined Date */}
                                            <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                                                {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </td>

                                            {/* Total Orders */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    cust.totalOrders > 0
                                                        ? 'bg-purple-50 text-[#6C306E] border border-purple-200'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {cust.totalOrders || 0} order(s)
                                                </span>
                                            </td>

                                            {/* Units Bought */}
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                                {cust.totalUnitsBought || 0}
                                            </td>

                                            {/* Lifetime Spend */}
                                            <td className="py-3.5 px-4 font-black text-[#241224] whitespace-nowrap">
                                                {currency}{Number(cust.totalSpent || 0).toLocaleString()}
                                            </td>

                                            {/* Purchase Breakdown Action */}
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(cust)
                                                        setIsModalOpen(true)
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white text-[#6C306E] border border-[#EFE0EF] text-xs font-bold transition"
                                                >
                                                    <EyeIcon size={13} />
                                                    <span>View Bought Products</span>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                        No registered customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CUSTOMER PURCHASE DETAILS MODAL */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="relative w-full max-w-2xl bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 sm:p-7 text-[#241224] max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer"
                        >
                            <CloseIcon size={16} />
                        </button>

                        {/* Customer Header */}
                        <div className="border-b border-[#EFE0EF] pb-4 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C306E]">
                                Customer Purchase Intelligence
                            </span>
                            <h3 className="text-xl font-black text-[#241224] mt-0.5">
                                {selectedCustomer.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                <span>Email: <strong className="text-slate-700">{selectedCustomer.email}</strong></span>
                                <span>Phone: <strong className="text-slate-700">{selectedCustomer.phone || selectedCustomer.whatsapp || 'N/A'}</strong></span>
                                <span>Total Spent: <strong className="text-[#6C306E]">{currency}{Number(selectedCustomer.totalSpent || 0).toLocaleString()}</strong></span>
                            </div>
                        </div>

                        {/* Which Products Did This Customer Buy? (Exact User Request) */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-extrabold text-[#241224] flex items-center gap-1.5">
                                    <BagIcon size={15} color="#6C306E" />
                                    <span>Products Bought by this Customer</span>
                                </h4>
                                <span className="text-xs text-slate-500 font-semibold">
                                    {(selectedCustomer.purchasedProducts || []).length} unique item(s)
                                </span>
                            </div>

                            {selectedCustomer.purchasedProducts && selectedCustomer.purchasedProducts.length > 0 ? (
                                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                    {selectedCustomer.purchasedProducts.map((p, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6FA]/70 border border-[#EFE0EF]"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-11 rounded-xl bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0">
                                                    <img
                                                        src={p.image || '/product_img1.png'}
                                                        alt={p.name}
                                                        className="max-h-9 w-auto object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs text-[#241224] truncate">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                        Category: {p.category || 'Beauty'} • Unit: {currency}{Number(p.unitPrice || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 ml-3">
                                                <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6C306E] font-black text-xs border border-purple-200">
                                                    Qty: {p.totalQuantity}
                                                </div>
                                                <div className="font-black text-xs text-[#241224] mt-1">
                                                    {currency}{Number(p.totalSpentOnItem || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] text-xs text-slate-400">
                                    This customer has not purchased any products yet.
                                </div>
                            )}
                        </div>

                        {/* Customer Orders History */}
                        <div>
                            <h4 className="text-sm font-extrabold text-[#241224] flex items-center gap-1.5 mb-3">
                                <TagIcon size={15} color="#6C306E" />
                                <span>Orders Placed ({(selectedCustomer.orders || []).length})</span>
                            </h4>

                            {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {selectedCustomer.orders.map((o) => (
                                        <div
                                            key={o.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#EFE0EF] text-xs"
                                        >
                                            <div>
                                                <span className="font-mono font-bold text-[#241224]">
                                                    {o.orderNumber || o.id.slice(0, 8)}
                                                </span>
                                                <span className="text-slate-400 text-[10px] ml-2">
                                                    {new Date(o.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {(o.orderItems || []).length} item(s) • {o.paymentMethod || 'COD'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-[#241224]">
                                                    {currency}{Number(o.total || 0).toLocaleString()}
                                                </div>
                                                <span className="inline-block px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600 mt-0.5">
                                                    {o.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No previous order history.</p>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#EFE0EF] flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-[#6C306E] hover:bg-[#3A0C38] text-white text-xs font-bold transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
