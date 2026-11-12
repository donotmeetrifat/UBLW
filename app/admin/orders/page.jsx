'use client'

import { useEffect, useState, useMemo } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import {
    TagIcon,
    SearchIcon,
    TruckIcon,
    CheckIcon,
    CloseIcon,
    EyeIcon,
    WhatsAppIcon,
    DownloadIcon,
    SparklesIcon
} from "@/components/icons"
import InvoiceModal from "@/components/InvoiceModal"

const STATUSES = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'ORDER_PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
]

export default function AdminOrdersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [savingCourierId, setSavingCourierId] = useState(null)
    const [courierInputs, setCourierInputs] = useState({})

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders)
                const initialInputs = {}
                data.orders.forEach(o => {
                    initialInputs[o.id] = o.consignmentId || ''
                })
                setCourierInputs(initialInputs)
            } else {
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching admin orders:', error)
            toast.error('Failed to load orders from database')
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }))
                }
                toast.success(`Order marked as ${newStatus}`)
            } else {
                toast.error(data.message || 'Failed to update order status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Network error updating order')
        }
    }

    const handleSaveCourier = async (orderId) => {
        const consignmentId = (courierInputs[orderId] || '').trim()
        if (!consignmentId) {
            toast.error('Please enter a Steadfast consignment tracking ID')
            return
        }

        setSavingCourierId(orderId)
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courierName: 'Steadfast Courier',
                    consignmentId,
                    status: 'SHIPPED',
                }),
            })
            const data = await res.json()
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? {
                    ...o,
                    courierName: 'Steadfast Courier',
                    consignmentId,
                    status: 'SHIPPED'
                } : o))
                toast.success('Steadfast consignment ID saved! Order updated to SHIPPED.')
            } else {
                toast.error(data.message || 'Failed to update tracking ID')
            }
        } catch (error) {
            console.error('Error saving courier tracking:', error)
            toast.error('Network error saving tracking info')
        } finally {
            setSavingCourierId(null)
        }
    }

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (statusFilter !== 'ALL' && order.status !== statusFilter) return false
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                const orderNo = (order.orderNumber || order.id || '').toLowerCase()
                const custName = (order.user?.name || order.address?.fullName || '').toLowerCase()
                const custPhone = (order.user?.phone || order.address?.phoneNumber || '').toLowerCase()
                const city = (order.address?.city || '').toLowerCase()
                return orderNo.includes(q) || custName.includes(q) || custPhone.includes(q) || city.includes(q)
            }
            return true
        })
    }, [orders, statusFilter, searchQuery])

    const statusCounts = useMemo(() => {
        const counts = { ALL: orders.length }
        orders.forEach(o => {
            counts[o.status] = (counts[o.status] || 0) + 1
        })
        return counts
    }, [orders])

    const getStatusStyle = (status) => {
        const s = (status || '').toUpperCase()
        if (s === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
        if (s === 'SHIPPED') return 'bg-blue-50 text-blue-700 border-blue-200'
        if (s === 'CONFIRMED' || s === 'PROCESSING') return 'bg-purple-50 text-purple-700 border-purple-200'
        if (s === 'CANCELLED') return 'bg-rose-50 text-rose-700 border-rose-200'
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }

    if (loading) return <Loading />

    return (
        <div className="space-y-6 pb-24 text-slate-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Customer Orders &</span>
                        <span className="text-[#6C306E]">Fulfillment</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Real-time orders management, Steadfast consignment dispatch, and customer invoice generation
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchOrders}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] text-xs font-bold text-slate-700 shadow-2xs transition"
                    >
                        <span>Refresh Orders</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs space-y-4">
                {/* Status Segmented Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {STATUSES.map(tab => {
                        const count = statusCounts[tab.key] || 0
                        const active = statusFilter === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    active
                                        ? 'bg-[#6C306E] text-white shadow-xs'
                                        : 'bg-[#FAF6FA] hover:bg-[#EFE0EF] text-slate-600'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    active ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Search Input */}
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon size={16} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by order number, customer name, phone, or city..."
                        className="w-full bg-[#FAF6FA]/60 border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none transition font-medium text-[#241224] placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#EFE0EF] rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#EFE0EF] bg-[#FAF6FA]/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Order / Date</th>
                                <th className="py-3.5 px-4">Customer</th>
                                <th className="py-3.5 px-4">Items Ordered</th>
                                <th className="py-3.5 px-4">Payment</th>
                                <th className="py-3.5 px-4">Total</th>
                                <th className="py-3.5 px-4">Steadfast Tracking</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    const custName = order.user?.name || order.address?.fullName || 'Valued Customer'
                                    const custPhone = order.address?.phoneNumber || order.user?.phone || ''
                                    const rawPhone = custPhone.replace(/[^0-9]/g, '')
                                    const whatsappUrl = rawPhone ? `https://wa.me/880${rawPhone.startsWith('0') ? rawPhone.slice(1) : rawPhone}` : null

                                    return (
                                        <tr key={order.id} className="hover:bg-[#FAF6FA]/30 transition">
                                            {/* Order # and Date */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-mono font-bold text-[#241224]">
                                                    {order.orderNumber || order.id.slice(0, 8)}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                                                </div>
                                            </td>

                                            {/* Customer Details */}
                                            <td className="py-3.5 px-4 max-w-[200px]">
                                                <div className="font-bold text-[#241224] truncate">
                                                    {custName}
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <span>{custPhone || 'No Phone'}</span>
                                                    {whatsappUrl && (
                                                        <a
                                                            href={whatsappUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-600 hover:text-emerald-700 p-0.5"
                                                            title="Direct WhatsApp Message"
                                                        >
                                                            <WhatsAppIcon size={12} color="#059669" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate mt-0.5" title={order.address?.address}>
                                                    {order.address?.city || 'Dhaka'} {order.address?.area ? `• ${order.address.area}` : ''}
                                                </div>
                                            </td>

                                            {/* Items Ordered */}
                                            <td className="py-3.5 px-4 max-w-[220px]">
                                                <div className="space-y-1">
                                                    {(order.orderItems || []).slice(0, 2).map((item, i) => (
                                                        <div key={i} className="text-[11px] text-slate-700 truncate font-medium">
                                                            <span className="font-bold text-[#6C306E]">{item.quantity}x</span> {item.name || item.product?.name || 'UK Beauty Item'}
                                                        </div>
                                                    ))}
                                                    {(order.orderItems || []).length > 2 && (
                                                        <div className="text-[10px] text-slate-400 font-semibold">
                                                            +{(order.orderItems.length - 2)} more items
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Payment */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E]">
                                                    {order.paymentMethod || 'COD'}
                                                </span>
                                                {order.transactionId && (
                                                    <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                                                        Trx: {order.transactionId}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Total */}
                                            <td className="py-3.5 px-4 font-black text-[#241224] whitespace-nowrap">
                                                {currency}{Number(order.total || 0).toLocaleString()}
                                            </td>

                                            {/* Steadfast Courier Tracking Input */}
                                            <td className="py-3.5 px-4 min-w-[170px]">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        value={courierInputs[order.id] ?? ''}
                                                        onChange={(e) => setCourierInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                        placeholder="Consignment ID"
                                                        className="w-28 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-lg px-2 py-1 text-[11px] font-mono outline-none"
                                                    />
                                                    <button
                                                        onClick={() => handleSaveCourier(order.id)}
                                                        disabled={savingCourierId === order.id}
                                                        className="px-2 py-1 bg-[#6C306E] hover:bg-[#3A0C38] text-white rounded-lg text-[10px] font-bold transition shrink-0"
                                                    >
                                                        {savingCourierId === order.id ? '...' : 'Save'}
                                                    </button>
                                                </div>
                                                {order.consignmentId && (
                                                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                                                        <CheckIcon size={10} color="#059669" />
                                                        <span>Steadfast Linked</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Dropdown */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none cursor-pointer transition ${getStatusStyle(order.status)}`}
                                                >
                                                    <option value="ORDER_PLACED">ORDER PLACED</option>
                                                    <option value="CONFIRMED">CONFIRMED</option>
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setIsDetailModalOpen(true)
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#6C306E] hover:bg-[#FAF6FA] transition border border-transparent hover:border-[#EFE0EF]"
                                                        title="View Order Details"
                                                    >
                                                        <EyeIcon size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setIsInvoiceModalOpen(true)
                                                        }}
                                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white border border-[#EFE0EF] transition"
                                                    >
                                                        Invoice
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                                        No customer orders match the selected filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {isDetailModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 text-[#241224] max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setIsDetailModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer"
                        >
                            <CloseIcon size={16} />
                        </button>

                        <div className="border-b border-[#EFE0EF] pb-4 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Order Overview
                            </span>
                            <h3 className="text-lg font-black text-[#241224]">
                                #{selectedOrder.orderNumber || selectedOrder.id}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                            </p>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-[#FAF6FA] border border-[#EFE0EF] p-4 rounded-2xl mb-4 space-y-1.5 text-xs">
                            <div className="text-[10px] font-extrabold uppercase text-[#6C306E] tracking-wider mb-1">
                                Customer & Delivery Info
                            </div>
                            <div className="font-bold text-[#241224]">
                                {selectedOrder.user?.name || selectedOrder.address?.fullName || 'Valued Customer'}
                            </div>
                            <div className="text-slate-600">
                                Phone: {selectedOrder.address?.phoneNumber || selectedOrder.user?.phone || 'N/A'}
                            </div>
                            <div className="text-slate-600">
                                Email: {selectedOrder.user?.email || 'N/A'}
                            </div>
                            <div className="text-slate-600">
                                Address: {selectedOrder.address?.address}, {selectedOrder.address?.city} {selectedOrder.address?.region ? `, ${selectedOrder.address.region}` : ''}
                            </div>
                            {selectedOrder.deliveryNotes && (
                                <div className="text-slate-500 italic pt-1 border-t border-[#EFE0EF] mt-1">
                                    Notes: "{selectedOrder.deliveryNotes}"
                                </div>
                            )}
                        </div>

                        {/* Items List */}
                        <div className="mb-4">
                            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                                Ordered Products ({(selectedOrder.orderItems || []).length})
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {(selectedOrder.orderItems || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EFE0EF]">
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs text-[#241224] truncate">
                                                {item.name || item.product?.name || 'UK Beauty Item'}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                Qty: {item.quantity} × {currency}{Number(item.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="font-black text-xs text-[#241224] shrink-0">
                                            {currency}{Number(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-[#FAF6FA]/70 border border-[#EFE0EF] p-4 rounded-2xl space-y-1.5 text-xs mb-5">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{currency}{Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee</span>
                                <span>{currency}{Number(selectedOrder.deliveryCharge || 0).toLocaleString()}</span>
                            </div>
                            {Number(selectedOrder.discount || 0) > 0 && (
                                <div className="flex justify-between text-emerald-700">
                                    <span>Discount</span>
                                    <span>-{currency}{Number(selectedOrder.discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-sm text-[#241224] pt-2 border-t border-[#EFE0EF]">
                                <span>Total Payable</span>
                                <span>{currency}{Number(selectedOrder.total || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDetailModalOpen(false)
                                    setIsInvoiceModalOpen(true)
                                }}
                                className="flex-1 bg-[#6C306E] hover:bg-[#3A0C38] text-white py-2.5 rounded-xl text-xs font-bold text-center transition"
                            >
                                Generate Official Invoice
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-[#EFE0EF] text-xs font-bold text-slate-600 hover:bg-[#FAF6FA] transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INVOICE MODAL */}
            {isInvoiceModalOpen && selectedOrder && (
                <InvoiceModal
                    order={selectedOrder}
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                />
            )}
        </div>
    )
}
