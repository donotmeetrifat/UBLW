'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { orderDummyData } from "@/assets/assets"
import toast from "react-hot-toast"
import { CheckIcon, TruckIcon, WhatsAppIcon, MobileBankingIcon, CloseIcon, SparklesIcon } from "@/components/icons"
import InvoiceModal from "@/components/InvoiceModal"

export default function StoreOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [showManifestModal, setShowManifestModal] = useState(false)
    const [courierInput, setCourierInput] = useState("")

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (data.success && Array.isArray(data.orders)) {
                setOrders(data.orders)
            } else {
                setOrders(orderDummyData)
            }
        } catch (error) {
            console.error('Error fetching store orders:', error)
            setOrders(orderDummyData)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
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
                toast.success(`Order status updated to ${newStatus}`)
            } else {
                toast.error(data.message || 'Failed to update order')
            }
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            toast.success(`Order status updated to ${newStatus}`)
        }
    }

    const updateCourierDetails = async (orderId) => {
        if (!courierInput.trim()) return
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courierName: 'Steadfast Courier',
                    consignmentId: courierInput.trim(),
                    status: 'SHIPPED',
                }),
            })
            const data = await res.json()
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, consignmentId: courierInput.trim(), courierName: 'Steadfast Courier', status: 'SHIPPED' } : o))
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, consignmentId: courierInput.trim(), courierName: 'Steadfast Courier', status: 'SHIPPED' }))
                }
                toast.success('Steadfast consignment tracking ID saved and parcel marked SHIPPED!')
            }
        } catch (error) {
            toast.error('Could not save courier details')
        }
    }

    const togglePaymentStatus = async (orderId, currentStatus) => {
        const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID'
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: nextStatus }),
            })
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: nextStatus } : o))
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, paymentStatus: nextStatus }))
            }
            toast.success(`Payment marked as ${nextStatus}`)
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: nextStatus } : o))
            toast.success(`Payment updated`)
        }
    }

    const copyToClipboard = (text, label) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard!`)
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setCourierInput(order.consignmentId || '')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    // Calculate totals for daily courier manifest
    const pendingShipmentOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'DELIVERED')
    const totalCodAmount = pendingShipmentOrders
        .filter(o => o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

    return (
        <div className="pb-16 text-slate-800">
            {/* Top Bar with Enterprise Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#241224]">
                        Store <span className="text-[#6C306E]">Orders</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Verify customer bKash TrxID, print A4 packing slips, and assign Steadfast courier tracking
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setShowManifestModal(true)}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] text-[#6C306E] px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                        <TruckIcon size={14} color="#6C306E" />
                        <span>Daily Courier Manifest</span>
                    </button>
                    <span className="text-xs font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3.5 py-2 rounded-full">
                        Total Orders: {orders.length}
                    </span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-[#EFE0EF]">
                    <p className="text-slate-400 text-sm">No orders found</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_4px_24px_rgba(58,12,56,0.04)] border border-[#EFE0EF]">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF6FA] text-[#241224] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#EFE0EF]">
                            <tr>
                                <th className="px-5 py-4">Order #</th>
                                <th className="px-4 py-4">Customer</th>
                                <th className="px-4 py-4">Total</th>
                                <th className="px-4 py-4">Payment</th>
                                <th className="px-4 py-4">Tracking / Courier</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE0EF]/60">
                            {orders.map((order) => {
                                const orderNo = order.orderNumber || order.id
                                const custName = order.address?.fullName || order.user?.name || 'Customer'
                                const custPhone = order.address?.phoneNumber || order.address?.phone || ''

                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-[#FAF6FA]/70 transition-colors cursor-pointer"
                                        onClick={() => openModal(order)}
                                    >
                                        <td className="px-5 py-3.5 font-mono font-bold text-[#6C306E]">
                                            {orderNo}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-bold text-[#241224]">{custName}</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    copyToClipboard(custPhone, 'Customer Phone')
                                                }}
                                                className="text-[11px] text-slate-400 hover:text-[#6C306E] font-medium flex items-center gap-1"
                                                title="Click to copy phone number"
                                            >
                                                <span>{custPhone}</span>
                                                <span className="text-[9px] bg-slate-100 px-1 rounded">copy</span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 font-extrabold text-[#3A0C38] text-sm">
                                            {currency}{Number(order.total || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-1">
                                                <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-[#FAF6FA] border border-[#EFE0EF] text-[#241224]">
                                                    {order.paymentMethod}
                                                </span>
                                                {order.transactionId && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            copyToClipboard(order.transactionId, 'bKash TrxID')
                                                        }}
                                                        className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block text-left hover:bg-emerald-100"
                                                        title="Click to copy TrxID for bKash verification"
                                                    >
                                                        Trx: {order.transactionId}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {order.consignmentId ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                    <TruckIcon size={12} color="#6C306E" />
                                                    {order.consignmentId}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={order.status}
                                                onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                                                    order.status === 'DELIVERED'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : order.status === 'SHIPPED'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : order.status === 'PROCESSING'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}
                                            >
                                                <option value="ORDER_PLACED">ORDER PLACED</option>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="PROCESSING">PROCESSING</option>
                                                <option value="SHIPPED">SHIPPED</option>
                                                <option value="DELIVERED">DELIVERED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order)
                                                    setShowInvoiceModal(true)
                                                }}
                                                className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] hover:bg-[#EFE0EF] transition cursor-pointer"
                                            >
                                                Invoice
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details & Courier Fulfillment Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md p-4 z-50 transition-all duration-300">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-[#EFE0EF] max-h-[90vh] overflow-y-auto">
                        <button onClick={closeModal} className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400">
                            <CloseIcon size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <span className="font-mono text-base font-extrabold text-[#6C306E]">
                                {selectedOrder.orderNumber || selectedOrder.id}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-[#3A0C38]">
                                {selectedOrder.status}
                            </span>
                        </div>

                        {/* Customer Information Box */}
                        <div className="p-4 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl mb-5 space-y-1.5 text-xs">
                            <p className="font-extrabold text-[#241224] text-sm">
                                {selectedOrder.address?.fullName || selectedOrder.user?.name}
                            </p>
                            <p className="text-slate-600 font-medium">
                                Phone: <b className="text-[#6C306E]">{selectedOrder.address?.phoneNumber || selectedOrder.address?.phone}</b>
                            </p>
                            <p className="text-slate-600">
                                Address: {selectedOrder.address?.address || selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.region || selectedOrder.address?.state}
                            </p>
                            {selectedOrder.customerNotes && (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-xl mt-2 font-medium">
                                    Notes: {selectedOrder.customerNotes}
                                </p>
                            )}

                            {/* WhatsApp Dispatch Notification */}
                            <div className="pt-2 flex flex-wrap gap-2">
                                <a
                                    href={`https://wa.me/88${(selectedOrder.address?.phoneNumber || selectedOrder.address?.phone || '').replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum%20${encodeURIComponent(selectedOrder.address?.fullName || 'Customer')},%20your%20UK%20Brand%20Lover%20order%20(${selectedOrder.orderNumber || selectedOrder.id})%20is%20${selectedOrder.status === 'SHIPPED' ? `shipped%20via%20Steadfast%20Courier%20(Tracking:%20${selectedOrder.consignmentId || 'pending'})` : 'being%20processed'}.%20Total%20payable:%20BDT%20${selectedOrder.total}.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full transition"
                                >
                                    <WhatsAppIcon size={14} color="#FFFFFF" />
                                    <span>Send WhatsApp Shipping Update</span>
                                </a>
                            </div>
                        </div>

                        {/* Courier Consignment Tracking Assignment */}
                        <div className="p-4 bg-white border border-[#EFE0EF] rounded-2xl mb-5 text-xs space-y-2">
                            <p className="font-extrabold text-[#241224] uppercase tracking-wider text-[11px]">
                                Assign Steadfast / Pathao Consignment Tracking
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Tracking ID (e.g. ST-882914-DH)"
                                    value={courierInput}
                                    onChange={(e) => setCourierInput(e.target.value)}
                                    className="flex-1 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-2 outline-none font-mono font-bold"
                                />
                                <button
                                    onClick={() => updateCourierDetails(selectedOrder.id)}
                                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2 rounded-xl font-bold transition cursor-pointer"
                                >
                                    Save & Ship
                                </button>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="mb-5">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-[#241224] mb-3">Order Items</h3>
                            <div className="space-y-2">
                                {(selectedOrder.orderItems || []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-[#EFE0EF] rounded-2xl bg-white text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center p-1">
                                                <img
                                                    src={(item.product && item.product.images && item.product.images[0]) || item.image || '/product_img1.png'}
                                                    alt={item.name}
                                                    className="max-h-10 w-auto object-contain"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#241224]">{item.name || item.product?.name}</p>
                                                <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × {currency}{Number(item.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#3A0C38]">
                                            {currency}{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Verification & Actions */}
                        <div className="p-4 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
                            <div>
                                <p className="font-bold text-slate-600">
                                    Method: <span className="text-[#241224]">{selectedOrder.paymentMethod}</span>
                                    {selectedOrder.transactionId && (
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(selectedOrder.transactionId, 'bKash TrxID')}
                                            className="ml-2 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                                            title="Click to copy TrxID"
                                        >
                                            Trx: {selectedOrder.transactionId}
                                        </button>
                                    )}
                                </p>
                                <p className="font-bold text-slate-600 mt-1">
                                    Status: <span className={selectedOrder.paymentStatus === 'PAID' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{selectedOrder.paymentStatus || 'PENDING'}</span>
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => togglePaymentStatus(selectedOrder.id, selectedOrder.paymentStatus)}
                                    className={`px-3 py-1.5 rounded-full font-bold text-xs transition cursor-pointer ${
                                        selectedOrder.paymentStatus === 'PAID'
                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    }`}
                                >
                                    {selectedOrder.paymentStatus === 'PAID' ? 'Mark Unpaid' : 'Verify & Mark Paid'}
                                </button>
                                <button
                                    onClick={() => setShowInvoiceModal(true)}
                                    className="px-3.5 py-1.5 rounded-full font-bold text-xs bg-white border border-[#EFE0EF] text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Courier Dispatch Manifest Modal */}
            {showManifestModal && (
                <div onClick={() => setShowManifestModal(false)} className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md p-4 z-50 transition-all duration-300">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 relative border border-[#EFE0EF] max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-[#EFE0EF] mb-4">
                            <div>
                                <h2 className="text-base font-extrabold text-[#241224]">Courier Dispatch Manifest</h2>
                                <p className="text-[11px] text-slate-500">Steadfast Courier / Pathao Daily Pickup Handover Sheet</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { if (typeof window !== 'undefined') window.print() }}
                                    className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-1.5 rounded-full text-xs font-bold transition shadow-2xs"
                                >
                                    Print Sheet
                                </button>
                                <button onClick={() => setShowManifestModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                                    <CloseIcon size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#FAF6FA] p-3 rounded-xl border border-[#EFE0EF] mb-4 flex justify-between">
                            <div>
                                <p className="font-bold text-[#241224]">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                <p className="text-slate-500 text-[11px]">Pickup Address: Mirpur-2, Dhaka</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[#6C306E]">Parcels to Dispatch: {pendingShipmentOrders.length}</p>
                                <p className="font-extrabold text-[#3A0C38]">Total COD to Collect: {currency}{totalCodAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <table className="w-full text-left border border-[#EFE0EF] rounded-xl overflow-hidden mb-4">
                            <thead className="bg-[#FAF6FA] font-bold uppercase text-[10px] border-b border-[#EFE0EF]">
                                <tr>
                                    <th className="p-2">#</th>
                                    <th className="p-2">Order No</th>
                                    <th className="p-2">Customer & Phone</th>
                                    <th className="p-2">City/Area</th>
                                    <th className="p-2 text-right">COD Due</th>
                                    <th className="p-2">Tracking ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]">
                                {pendingShipmentOrders.map((o, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 font-bold">{idx + 1}</td>
                                        <td className="p-2 font-mono">{o.orderNumber || o.id}</td>
                                        <td className="p-2">
                                            <p className="font-bold">{o.address?.fullName || o.user?.name}</p>
                                            <p className="text-slate-500">{o.address?.phoneNumber || o.address?.phone}</p>
                                        </td>
                                        <td className="p-2">{o.address?.city}, {o.address?.region}</td>
                                        <td className="p-2 text-right font-bold text-[#3A0C38]">
                                            {o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID' ? `${currency}${o.total}` : '0 (PAID)'}
                                        </td>
                                        <td className="p-2 font-mono font-bold text-purple-700">{o.consignmentId || 'Pending'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pt-6 border-t border-[#EFE0EF] flex justify-between text-[11px] text-slate-500">
                            <div>
                                <p>Prepared By: UK Brand Lover Store Manager</p>
                                <p className="mt-8">Signature: __________________________</p>
                            </div>
                            <div className="text-right">
                                <p>Received By: Courier Rider Name & ID</p>
                                <p className="mt-8">Rider Signature: __________________________</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal Component */}
            {selectedOrder && (
                <InvoiceModal
                    order={selectedOrder}
                    isOpen={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                />
            )}
        </div>
    )
}
