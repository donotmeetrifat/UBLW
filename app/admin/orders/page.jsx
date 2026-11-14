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
    SparklesIcon,
    AlertCircleIcon
} from "@/components/icons"
import InvoiceModal from "@/components/InvoiceModal"
import AdminDropdown from "@/components/admin/AdminDropdown"
import { broadcastStoreChange } from "@/lib/realtimeSync"

const STATUSES = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'ORDER_PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
]

const ORDER_STATUS_OPTIONS = [
    { value: 'ORDER_PLACED', label: 'Order Placed', dot: 'bg-amber-500' },
    { value: 'CONFIRMED', label: 'Confirmed', dot: 'bg-[#6C306E]' },
    { value: 'PROCESSING', label: 'Processing', dot: 'bg-blue-500' },
    { value: 'SHIPPED', label: 'Shipped', dot: 'bg-indigo-500' },
    { value: 'DELIVERED', label: 'Delivered', dot: 'bg-emerald-500' },
    { value: 'CANCELLED', label: 'Cancelled', dot: 'bg-rose-500' }
]

const ADMIN_CANCEL_REASONS = [
    { id: 'customer_req', label: 'Customer requested cancellation via call / WhatsApp' },
    { id: 'phone_unreachable', label: 'Invalid or unreachable customer phone number' },
    { id: 'address_change', label: 'Customer requested address or item changes' },
    { id: 'damaged_stock', label: 'Product damaged or out of stock in warehouse' },
    { id: 'duplicate_order', label: 'Duplicate order placed by customer' },
    { id: 'fraud_risk', label: 'Suspected fraud or payment verification failed' },
    { id: 'other', label: 'Other admin reason (write below)' }
]

export default function AdminOrdersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    const [orders, setOrders] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_admin_orders') || '[]')
                if (Array.isArray(cached) && cached.length > 0) return cached
            } catch {}
        }
        return []
    })
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('ukbl_cached_admin_orders')
            if (cached && cached !== '[]') return false
        }
        return true
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [savingCourierId, setSavingCourierId] = useState(null)
    const [courierInputs, setCourierInputs] = useState({})

    // Admin Order Cancellation State
    const [cancelTargetOrder, setCancelTargetOrder] = useState(null)
    const [isAdminCancelModalOpen, setIsAdminCancelModalOpen] = useState(false)
    const [adminCancelReason, setAdminCancelReason] = useState(ADMIN_CANCEL_REASONS[0].label)
    const [adminCustomReason, setAdminCustomReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const fetchOrders = async () => {
        try {
            if (orders.length === 0) setLoading(true)
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders)
                if (typeof window !== 'undefined') {
                    try {
                        localStorage.setItem('ukbl_cached_admin_orders', JSON.stringify(data.orders))
                    } catch {}
                }
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
        const handleOrdersUpdated = () => fetchOrders()
        window.addEventListener('orders-updated', handleOrdersUpdated)
        return () => window.removeEventListener('orders-updated', handleOrdersUpdated)
    }, [])

    const handleUpdateStatus = async (orderId, newStatus) => {
        // If changing to CANCELLED, open the cancellation modal so admin can select reason and restore stock
        if (newStatus === 'CANCELLED') {
            const target = orders.find(o => o.id === orderId) || (selectedOrder?.id === orderId ? selectedOrder : null)
            if (target) {
                setCancelTargetOrder(target)
                setAdminCancelReason(ADMIN_CANCEL_REASONS[0].label)
                setAdminCustomReason('')
                setIsAdminCancelModalOpen(true)
                return
            }
        }

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
                broadcastStoreChange('orders', { orderId, status: newStatus })
            } else {
                toast.error(data.message || 'Failed to update order status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Network error updating order')
        }
    }

    const handleConfirmAdminCancel = async () => {
        if (!cancelTargetOrder) return
        setIsCancelling(true)
        try {
            const res = await fetch(`/api/orders/${cancelTargetOrder.id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: adminCancelReason,
                    customReason: adminCustomReason.trim(),
                    cancelledBy: 'ADMIN'
                })
            })
            const data = await res.json()
            if (data.success && data.order) {
                setOrders(prev => {
                    const updated = prev.map(o => o.id === cancelTargetOrder.id ? data.order : o)
                    if (typeof window !== 'undefined') {
                        try {
                            localStorage.setItem('ukbl_cached_admin_orders', JSON.stringify(updated))
                        } catch {}
                    }
                    return updated
                })
                if (selectedOrder && selectedOrder.id === cancelTargetOrder.id) {
                    setSelectedOrder(data.order)
                }
                toast.success(`Order #${cancelTargetOrder.orderNumber || cancelTargetOrder.id} cancelled & stock restored!`)
                broadcastStoreChange('orders', {
                    orderId: cancelTargetOrder.id,
                    status: 'CANCELLED',
                    cancelReason: data.order.cancelReason
                })
                broadcastStoreChange('products', { action: 'stock_restored' })
                setIsAdminCancelModalOpen(false)
                setCancelTargetOrder(null)
            } else {
                toast.error(data.message || 'Failed to cancel order')
            }
        } catch (e) {
            console.error('Error cancelling order:', e)
            toast.error('Network error cancelling order')
        } finally {
            setIsCancelling(false)
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
                broadcastStoreChange('orders', { orderId, status: 'SHIPPED', consignmentId })
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
                <div className="overflow-x-auto min-h-[400px] pb-32">
                    <table className="w-full min-w-[880px] text-left border-collapse text-xs">
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
                                                {order.status === 'CANCELLED' && order.cancelReason && (
                                                    <div className="text-[10px] text-rose-600 font-bold mt-1 truncate max-w-[150px]" title={order.cancelReason}>
                                                        Cancelled: {order.cancelReason}
                                                    </div>
                                                )}
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
                                                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                                                        <span>Steadfast Linked</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Dropdown (Standard Box Dropdown matching portal design) */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <AdminDropdown
                                                    value={order.status}
                                                    onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
                                                    options={ORDER_STATUS_OPTIONS}
                                                    className="w-[145px]"
                                                    align="right"
                                                />
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
                                                    {order.status !== 'CANCELLED' ? (
                                                        <button
                                                            onClick={() => {
                                                                setCancelTargetOrder(order)
                                                                setAdminCancelReason(ADMIN_CANCEL_REASONS[0].label)
                                                                setAdminCustomReason('')
                                                                setIsAdminCancelModalOpen(true)
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition"
                                                            title="Cancel order & restore stock"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                                                            Cancelled
                                                        </span>
                                                    )}
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
                            <div className="flex items-start justify-between gap-4">
                                <div>
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
                                <div className="shrink-0 pt-1 mr-6">
                                    <AdminDropdown
                                        value={selectedOrder.status}
                                        onChange={(newStatus) => handleUpdateStatus(selectedOrder.id, newStatus)}
                                        options={ORDER_STATUS_OPTIONS}
                                        className="w-[145px]"
                                        align="right"
                                    />
                                </div>
                            </div>
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

                        {/* Cancellation Info Banner (if cancelled) */}
                        {selectedOrder.status === 'CANCELLED' && (
                            <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl mb-4 text-xs text-rose-950 space-y-1">
                                <div className="font-extrabold text-rose-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                    <CloseIcon size={12} strokeWidth={3} />
                                    <span>Order Cancelled</span>
                                </div>
                                {selectedOrder.cancelReason && (
                                    <p className="leading-relaxed">
                                        <span className="font-bold text-rose-900">Reason: </span>
                                        <span className="text-slate-800">{selectedOrder.cancelReason}</span>
                                    </p>
                                )}
                                {selectedOrder.cancelledAt && (
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Cancelled on {new Date(selectedOrder.cancelledAt).toLocaleString()}
                                    </p>
                                )}
                                <p className="text-[11px] text-emerald-700 font-medium pt-0.5 flex items-center gap-1">
                                    <CheckIcon size={12} color="#047857" strokeWidth={2.5} />
                                    <span>Product stock quantities have been safely restored to inventory.</span>
                                </p>
                            </div>
                        )}

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
                                className="flex-1 bg-[#6C306E] hover:bg-[#3A0C38] text-white py-2.5 rounded-xl text-xs font-bold text-center transition cursor-pointer"
                            >
                                Generate Official Invoice
                            </button>
                            {selectedOrder.status !== 'CANCELLED' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCancelTargetOrder(selectedOrder)
                                        setAdminCancelReason(ADMIN_CANCEL_REASONS[0].label)
                                        setAdminCustomReason('')
                                        setIsAdminCancelModalOpen(true)
                                    }}
                                    className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    Cancel Order
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-[#EFE0EF] text-xs font-bold text-slate-600 hover:bg-[#FAF6FA] transition cursor-pointer"
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

            {/* ADMIN ORDER CANCELLATION MODAL */}
            {isAdminCancelModalOpen && cancelTargetOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <AlertCircleIcon className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-slate-900">Admin Order Cancellation</h3>
                                    <p className="text-xs text-slate-500 font-mono">Order #{cancelTargetOrder.orderNumber || cancelTargetOrder.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAdminCancelModalOpen(false)
                                    setCancelTargetOrder(null)
                                }}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl p-3.5 mb-5 space-y-1">
                            <p className="font-bold flex items-center gap-1.5">
                                <span>⚠️</span> Automatic Stock Restoration Notice
                            </p>
                            <p className="text-amber-800 leading-relaxed">
                                Confirming this cancellation will instantly return all items back into warehouse stock, mark the order as Cancelled, and notify the customer in real-time.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Select Cancellation Reason *
                            </label>
                            <div className="space-y-2">
                                {ADMIN_CANCEL_REASONS.map(r => (
                                    <label
                                        key={r.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                                            adminCancelReason === r.label
                                                ? 'border-rose-500 bg-rose-50/60 font-semibold text-rose-950 shadow-sm'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="admin_cancel_reason"
                                            value={r.label}
                                            checked={adminCancelReason === r.label}
                                            onChange={() => setAdminCancelReason(r.label)}
                                            className="mt-0.5 text-rose-600 focus:ring-rose-500 accent-rose-600"
                                        />
                                        <span>{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Internal Notes / Custom Explanation {adminCancelReason.includes('write below') ? '(Required)' : '(Optional)'}
                            </label>
                            <textarea
                                rows={3}
                                value={adminCustomReason}
                                onChange={(e) => setAdminCustomReason(e.target.value)}
                                placeholder="e.g. Customer called at 4 PM requesting cancellation due to emergency..."
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-slate-800 placeholder-slate-400 resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={isCancelling || (adminCancelReason.includes('write below') && !adminCustomReason.trim())}
                                onClick={handleConfirmAdminCancel}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isCancelling ? 'Processing Cancellation...' : 'Confirm Cancel & Restore Stock'}
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => {
                                    setIsAdminCancelModalOpen(false)
                                    setCancelTargetOrder(null)
                                }}
                                className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition cursor-pointer"
                            >
                                Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
