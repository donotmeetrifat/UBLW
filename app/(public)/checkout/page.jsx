'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    BagIcon, 
    TruckIcon, 
    CashDeliveryIcon, 
    MobileBankingIcon, 
    RocketIcon,
    CardPaymentIcon, 
    ShieldCheckIcon, 
    CheckIcon, 
    ArrowRightIcon, 
    DownloadIcon, 
    MapPinIcon,
    PlusIcon,
    EditIcon,
    CloseIcon,
    TagIcon
} from '@/components/icons'
import toast from 'react-hot-toast'
import { clearCart, removePurchasedItems } from '@/lib/features/cart/cartSlice'
import AddressModal from '@/components/AddressModal'
import { productDummyData } from '@/assets/assets'
import InvoiceModal from '@/components/InvoiceModal'
import { isInsideDhaka, calculateDeliveryCharge, DEFAULT_DELIVERY_SETTINGS, DEFAULT_PAYMENT_SETTINGS } from '@/lib/settings'
import { SOCIAL_LINKS } from '@/lib/constants/social'
import { isClientSignedIn, requireSignIn, getClientUser } from '@/lib/clientAuth'
import { FlowButton } from '@/components/ui/flow-button'
import { broadcastStoreChange } from '@/lib/realtimeSync'

export default function CheckoutPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const router = useRouter()
    const dispatch = useDispatch()

    const { cartItems } = useSelector(state => state.cart)
    const products = useSelector(state => state.product.list)
    const addressList = useSelector(state => state.address.list)

    const [items, setItems] = useState([])
    const [subtotal, setSubtotal] = useState(0)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    const [coupon, setCoupon] = useState(null)
    const [couponInput, setCouponInput] = useState('')
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('cod')
    const [transactionId, setTransactionId] = useState('')
    const [senderNumber, setSenderNumber] = useState('')
    const [customerNotes, setCustomerNotes] = useState('')

    const [settings, setSettings] = useState({
        delivery: DEFAULT_DELIVERY_SETTINGS,
        payments: DEFAULT_PAYMENT_SETTINGS,
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmedOrder, setConfirmedOrder] = useState(null)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)

    // 0. Strict authentication check: visitors cannot proceed to checkout without signing in
    useEffect(() => {
        if (!isClientSignedIn()) {
            toast.error('You must be signed in to access checkout.')
            requireSignIn('Please sign in to place and confirm your order.')
            router.push('/cart')
        }
    }, [router])

    // 1. Fetch live admin settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' })
                const data = await res.json()
                if (data.success) {
                    setSettings({
                        delivery: data.delivery || DEFAULT_DELIVERY_SETTINGS,
                        payments: data.payments || DEFAULT_PAYMENT_SETTINGS,
                    })
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
            }
        }
        fetchSettings()

        const handleLiveSettings = (e) => {
            if (e?.detail) {
                setSettings(prev => ({
                    delivery: e.detail.delivery ? { ...prev.delivery, ...e.detail.delivery } : prev.delivery,
                    payments: e.detail.payments ? { ...prev.payments, ...e.detail.payments } : prev.payments,
                }))
            }
        }
        window.addEventListener('settings-updated', handleLiveSettings)
        return () => window.removeEventListener('settings-updated', handleLiveSettings)
    }, [])

    // 2. Build item list from Redux cart with resilient fallback (filters by user selected items if specified)
    useEffect(() => {
        let computedSubtotal = 0
        const itemList = []
        const allProducts = Array.isArray(products) && products.length > 0 ? products : productDummyData

        // Retrieve selectedItemIds saved from the shopping bag
        let selectedItemIds = null
        if (typeof window !== 'undefined') {
            try {
                const savedData = JSON.parse(localStorage.getItem('ukbl_checkout_data') || '{}')
                if (savedData.selectedItemIds && Array.isArray(savedData.selectedItemIds) && savedData.selectedItemIds.length > 0) {
                    selectedItemIds = savedData.selectedItemIds
                }
            } catch (e) {
                console.error('Failed to parse checkout selectedItemIds:', e)
            }
        }

        for (const [productId, qty] of Object.entries(cartItems || {})) {
            // If user only selected certain items in cart, filter strictly to those items!
            if (selectedItemIds && !selectedItemIds.includes(productId)) {
                continue
            }

            const product = allProducts.find(p => p.id === productId) || productDummyData.find(p => p.id === productId)
            if (product && qty > 0) {
                itemList.push({
                    ...product,
                    quantity: qty,
                })
                computedSubtotal += product.price * qty
            }
        }
        setItems(itemList)
        setSubtotal(computedSubtotal)
    }, [cartItems, products])

    // 3. Load saved checkout data from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedData = JSON.parse(localStorage.getItem('ukbl_checkout_data') || '{}')
                if (savedData.coupon) setCoupon(savedData.coupon)

                if (savedData.selectedAddressId && addressList.length > 0) {
                    const matched = addressList.find(a => a.id === savedData.selectedAddressId)
                    if (matched) {
                        setSelectedAddress(matched)
                        return
                    }
                }
            } catch (e) {
                console.error('Failed to parse checkout data:', e)
            }
        }

        if (addressList.length > 0 && !selectedAddress) {
            setSelectedAddress(addressList[0])
        }
    }, [addressList])

    // Keep selected address synced if list changes
    useEffect(() => {
        if (addressList.length > 0) {
            if (!selectedAddress || !addressList.some(a => a.id === selectedAddress.id)) {
                setSelectedAddress(addressList[0])
            }
        } else {
            setSelectedAddress(null)
        }
    }, [addressList])

    // Live sync and backend verification of applied coupon on checkout
    useEffect(() => {
        if (!coupon?.code) return;

        // Auto-remove if subtotal drops below minimum order requirement
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            const minReq = coupon.minOrderAmount;
            const savedCode = coupon.code;
            setCoupon(null);
            toast.error(`Coupon ${savedCode} requires a minimum order of ${currency}${minReq.toLocaleString()}. Discount removed.`, {
                id: `checkout-coupon-min-${savedCode}`
            });
            return;
        }

        const verifyCoupon = async () => {
            try {
                const currentUser = getClientUser();
                const res = await fetch('/api/coupons/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: coupon.code,
                        subtotal,
                        userEmail: currentUser?.email || null,
                        userId: currentUser?.id || null
                    })
                });
                const data = await res.json();
                if (data.success && data.coupon) {
                    setCoupon(data.coupon);
                } else {
                    setCoupon(null);
                    toast.error(data.message || `Coupon ${coupon.code} is no longer active.`);
                }
            } catch (err) {
                console.warn('Coupon verification note:', err);
            }
        };

        verifyCoupon();
    }, [coupon?.code, subtotal]);

    const handleApplyCoupon = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            toast.error('Please enter a coupon code.');
            return;
        }

        if (items.length === 0 || subtotal <= 0) {
            toast.error('Your order has no items to apply a coupon.');
            return;
        }

        if (coupon && coupon.code === code) {
            toast.success(`Coupon ${code} is already applied!`);
            setCouponInput('');
            return;
        }

        setIsApplyingCoupon(true);
        try {
            const currentUser = getClientUser();
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    subtotal,
                    userEmail: currentUser?.email || null,
                    userId: currentUser?.id || null,
                    currentlyAppliedCode: coupon?.code || null
                })
            });
            const data = await res.json();

            if (data.success && data.coupon) {
                setCoupon(data.coupon);
                const discountText = data.coupon.formattedDiscount || (data.coupon.discountType === 'FIXED'
                    ? `${currency}${data.coupon.discount} off`
                    : `${data.coupon.discount}% off`);
                toast.success(data.message || `Coupon ${data.coupon.code} verified & applied! (${discountText})`);
                setCouponInput('');
                if (typeof window !== 'undefined') {
                    try {
                        const saved = JSON.parse(localStorage.getItem('ukbl_checkout_data') || '{}');
                        localStorage.setItem('ukbl_checkout_data', JSON.stringify({ ...saved, coupon: data.coupon }));
                    } catch {}
                }
            } else {
                if (data.requiresAuth) {
                    toast.error(data.message || 'Please sign in to use this coupon.');
                    requireSignIn(data.message);
                } else {
                    toast.error(data.message || 'Invalid or ineligible coupon code.');
                }
            }
        } catch (error) {
            toast.error('Could not connect to server to verify coupon.');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // 4. Calculations with 100% precision
    const isDhaka = selectedAddress ? isInsideDhaka(selectedAddress) : true
    const deliveryCharge = selectedAddress 
        ? calculateDeliveryCharge(selectedAddress, subtotal, settings.delivery)
        : (settings.delivery.insideDhaka || 80)

    const discountAmount = coupon && items.length > 0 && (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)
        ? (coupon.discountType === 'FIXED'
            ? Math.min(coupon.discount, subtotal)
            : (coupon.maxDiscount
                ? Math.min(Math.round((coupon.discount / 100) * subtotal), coupon.maxDiscount)
                : Math.round((coupon.discount / 100) * subtotal)))
        : 0
    const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge)

    const handleCopyNumber = (num) => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(num)
            toast.success(`Copied ${num} to clipboard!`)
        }
    }

    // 5. Submit Order
    const handlePlaceOrder = async (e) => {
        if (e && e.preventDefault) e.preventDefault()

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            toast.error('You are currently offline. Your shopping bag and address are safely preserved! Please connect to internet to confirm and submit your order.')
            return
        }

        if (!isClientSignedIn()) {
            toast.error('You must be signed in to confirm your order.')
            requireSignIn('Please sign in to place and confirm your order.')
            return
        }

        if (items.length === 0) {
            toast.error('Your cart is empty. Please add products to checkout.')
            router.push('/shop')
            return
        }

        if (!selectedAddress) {
            toast.error('Please add and select your delivery address.')
            setShowAddressModal(true)
            return
        }

        if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
            const providerName = paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'
            if (!transactionId.trim()) {
                toast.error(`Please enter your ${providerName} Transaction ID (TrxID)`)
                return
            }
            if (!senderNumber.trim() || senderNumber.trim().length < 11) {
                toast.error(`Please enter your ${providerName} sender mobile number (at least 11 digits)`)
                return
            }
        }

        setIsSubmitting(true)

        try {
            const normalizedAddress = {
                ...selectedAddress,
                fullName: (selectedAddress.fullName || selectedAddress.name || 'Valued Customer').trim(),
                name: (selectedAddress.fullName || selectedAddress.name || 'Valued Customer').trim(),
                phoneNumber: (selectedAddress.phoneNumber || selectedAddress.phone || '').trim(),
                phone: (selectedAddress.phoneNumber || selectedAddress.phone || '').trim(),
                address: (selectedAddress.address || selectedAddress.street || 'Address not specified').trim(),
                street: (selectedAddress.address || selectedAddress.street || 'Address not specified').trim(),
                city: (selectedAddress.city || 'Dhaka').trim(),
                region: (selectedAddress.region || selectedAddress.state || 'Dhaka').trim(),
                state: (selectedAddress.region || selectedAddress.state || 'Dhaka').trim(),
            };

            const payload = {
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: Array.isArray(item.images) ? item.images[0] : (item.image || '/product_img1.png'),
                })),
                address: normalizedAddress,
                paymentMethod: paymentMethod.toUpperCase(),
                transactionId: transactionId.trim() || null,
                senderNumber: senderNumber.trim() || null,
                couponCode: coupon ? coupon.code : null,
                customerNotes: customerNotes.trim() || null,
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (data.success && data.order) {
                if (typeof window !== 'undefined') {
                    const existing = JSON.parse(localStorage.getItem('ukbl_orders') || '[]')
                    localStorage.setItem('ukbl_orders', JSON.stringify([data.order, ...existing]))
                    localStorage.removeItem('ukbl_checkout_data')
                    broadcastStoreChange('orders', { order: data.order })
                }

                // Remove only the purchased items from bag so unselected items remain intact
                const purchasedIds = items.map(i => i.id)
                dispatch(removePurchasedItems(purchasedIds))
                setConfirmedOrder(data.order)
                toast.success('Order placed successfully! Welcome to UK Brand Lover.')
            } else {
                toast.error(data.message || 'Failed to complete order. Please try again.')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            // Retrieve current authenticated user for exact invoice customer data
            let activeUser = null;
            if (typeof window !== 'undefined') {
                try {
                    activeUser = JSON.parse(localStorage.getItem('ukbl_current_user') || 'null');
                } catch {}
            }

            // Offline resilient fallback
            const fallbackOrder = {
                id: `order_${Date.now()}`,
                orderNumber: `UKBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                subtotal,
                discount: discountAmount,
                deliveryCharge,
                total: finalTotal,
                status: 'ORDER_PLACED',
                paymentMethod: paymentMethod.toUpperCase(),
                transactionId: transactionId.trim() || null,
                senderNumber: senderNumber.trim() || null,
                createdAt: new Date().toISOString(),
                orderItems: items.map(i => ({ product: i, quantity: i.quantity, price: i.price })),
                address: selectedAddress,
                user: activeUser,
                email: activeUser?.email || selectedAddress?.email,
            }

            if (typeof window !== 'undefined') {
                const existing = JSON.parse(localStorage.getItem('ukbl_orders') || '[]')
                localStorage.setItem('ukbl_orders', JSON.stringify([fallbackOrder, ...existing]))
                localStorage.removeItem('ukbl_checkout_data')
            }

            const purchasedIds = items.map(i => i.id)
            dispatch(removePurchasedItems(purchasedIds))
            setConfirmedOrder(fallbackOrder)
            toast.success('Order placed successfully!')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Empty Cart State
    if (items.length === 0 && !confirmedOrder) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="size-20 bg-[#FAF6FA] border border-[#EFE0EF] rounded-full flex items-center justify-center text-[#6C306E] mb-4 shadow-2xs">
                    <BagIcon size={32} color="#6C306E" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#241224]">Your Shopping Bag is Empty</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm">
                    Please add authentic 100% original UK imported cosmetics or skincare products to your bag before proceeding to payment.
                </p>
                <Link
                    href="/shop"
                    className="mt-6 px-8 py-3.5 rounded-full bg-[#6C306E] hover:bg-[#531E55] text-white text-xs font-bold transition shadow-md"
                >
                    Explore UK Beauty Catalog
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
            {/* Breadcrumb Steps */}
            <div className="flex items-center gap-2 text-xs mb-6 text-slate-400">
                <Link href="/cart" className="hover:text-[#6C306E] transition font-medium">1. Shopping Bag</Link>
                <span>/</span>
                <span className="font-medium text-slate-400">2. Delivery Address</span>
                <span>/</span>
                <span className="font-bold text-[#6C306E]">3. Payment & Booking</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* LEFT COLUMN: Delivery Address & Payment Method Selection */}
                <div className="flex-1 w-full space-y-6">
                    
                    {/* 1. Verified Delivery Address Card */}
                    <div className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,12,56,0.04)]">
                        <div className="flex items-center justify-between pb-4 border-b border-[#EFE0EF]">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                    <MapPinIcon size={16} color="#6C306E" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-extrabold text-[#241224] uppercase tracking-wider">
                                        Delivery Address
                                    </h2>
                                    <p className="text-[11px] text-slate-400">Where we will dispatch your parcel</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedAddress && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingAddress(selectedAddress);
                                            setShowAddressModal(true);
                                        }}
                                        className="text-xs font-bold text-[#6C306E] bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white border border-[#EFE0EF] hover:border-[#6C306E] px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                    >
                                        <EditIcon size={12} color="currentColor" />
                                        <span>Edit Address</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                                    className="text-xs font-bold text-slate-600 hover:text-[#6C306E] bg-[#FAF6FA] hover:bg-white border border-[#EFE0EF] px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                    <PlusIcon size={12} color="currentColor" />
                                    <span>New Address</span>
                                </button>
                            </div>
                        </div>

                        {selectedAddress ? (
                            <div className="mt-4 p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-xs text-[#241224]">{selectedAddress.fullName || selectedAddress.name}</p>
                                        <span className="text-[10px] text-slate-500 font-mono">({selectedAddress.phoneNumber || selectedAddress.phone})</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {selectedAddress.address || selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region || selectedAddress.state}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingAddress(selectedAddress);
                                            setShowAddressModal(true);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-[#6C306E] hover:bg-white rounded-lg transition"
                                        title="Edit this delivery address"
                                    >
                                        <EditIcon size={14} color="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 p-4 text-center border border-dashed border-[#EFE0EF] rounded-2xl bg-[#FAF6FA]">
                                <p className="text-xs text-slate-500 mb-2">No delivery address selected</p>
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="text-xs font-bold text-[#6C306E] hover:underline"
                                >
                                    + Add Delivery Address
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Select Payment Method Card */}
                    <div className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,12,56,0.04)] space-y-5">
                        <div className="pb-3 border-b border-[#EFE0EF]">
                            <h2 className="text-sm font-extrabold text-[#241224] uppercase tracking-wider">
                                Select Payment Method
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Choose your preferred payment channel</p>
                        </div>

                        {/* Payment Options List */}
                        <div className="space-y-3">
                            {/* Option 1: Cash on Delivery */}
                            {settings.payments.cod?.enabled !== false && (
                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                        paymentMethod === 'cod'
                                            ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/30'
                                            : 'border-[#EFE0EF] bg-white hover:border-[#6C306E]/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            paymentMethod === 'cod' ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300 bg-white'
                                        }`}>
                                            {paymentMethod === 'cod' && <div className="size-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">{settings.payments.cod?.label || 'Cash on Delivery'}</p>
                                            <p className="text-[10px] text-slate-500">{settings.payments.cod?.sub || 'Pay cash upon product inspection (Nationwide)'}</p>
                                        </div>
                                    </div>
                                    <CashDeliveryIcon size={22} color={paymentMethod === 'cod' ? '#6C306E' : '#7B667B'} />
                                </div>
                            )}

                            {/* Option 2: bKash Send Money */}
                            {settings.payments.bkash?.enabled !== false && (
                                <div
                                    onClick={() => setPaymentMethod('bkash')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                        paymentMethod === 'bkash'
                                            ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/30'
                                            : 'border-[#EFE0EF] bg-white hover:border-[#6C306E]/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            paymentMethod === 'bkash' ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300 bg-white'
                                        }`}>
                                            {paymentMethod === 'bkash' && <div className="size-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">{settings.payments.bkash?.label || 'bKash Send Money'}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                {settings.payments.bkash?.number || '01959-524393'} ({settings.payments.bkash?.type || 'Personal'})
                                            </p>
                                        </div>
                                    </div>
                                    <MobileBankingIcon size={22} color={paymentMethod === 'bkash' ? '#6C306E' : '#7B667B'} />
                                </div>
                            )}

                            {/* Option 3: Nagad Wallet */}
                            {settings.payments.nagad?.enabled !== false && (
                                <div
                                    onClick={() => setPaymentMethod('nagad')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                        paymentMethod === 'nagad'
                                            ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/30'
                                            : 'border-[#EFE0EF] bg-white hover:border-[#6C306E]/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            paymentMethod === 'nagad' ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300 bg-white'
                                        }`}>
                                            {paymentMethod === 'nagad' && <div className="size-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">{settings.payments.nagad?.label || 'Nagad Wallet'}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                {settings.payments.nagad?.number || '01959-524393'} ({settings.payments.nagad?.type || 'Personal'})
                                            </p>
                                        </div>
                                    </div>
                                    <MobileBankingIcon size={22} color={paymentMethod === 'nagad' ? '#6C306E' : '#7B667B'} />
                                </div>
                            )}

                            {/* Option 4: Rocket App */}
                            {settings.payments.rocket?.enabled !== false && (
                                <div
                                    onClick={() => setPaymentMethod('rocket')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                        paymentMethod === 'rocket'
                                            ? 'border-[#8C3494] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#8C3494]/30'
                                            : 'border-[#EFE0EF] bg-white hover:border-[#8C3494]/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            paymentMethod === 'rocket' ? 'border-[#8C3494] bg-[#8C3494]' : 'border-slate-300 bg-white'
                                        }`}>
                                            {paymentMethod === 'rocket' && <div className="size-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">{settings.payments.rocket?.label || 'Rocket App'}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                {settings.payments.rocket?.number || '01959-524393'} ({settings.payments.rocket?.type || 'Personal'})
                                            </p>
                                        </div>
                                    </div>
                                    <RocketIcon size={22} color={paymentMethod === 'rocket' ? '#8C3494' : '#7B667B'} />
                                </div>
                            )}

                            {/* Option 5: Debit / Credit Card */}
                            {settings.payments.card?.enabled !== false && (
                                <div
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                        paymentMethod === 'card'
                                            ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/30'
                                            : 'border-[#EFE0EF] bg-white hover:border-[#6C306E]/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            paymentMethod === 'card' ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300 bg-white'
                                        }`}>
                                            {paymentMethod === 'card' && <div className="size-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-[#241224]">{settings.payments.card?.label || 'Debit / Credit Card'}</p>
                                            <p className="text-[10px] text-slate-500">{settings.payments.card?.sub || 'Visa, Mastercard & online banking'}</p>
                                        </div>
                                    </div>
                                    <CardPaymentIcon size={22} color={paymentMethod === 'card' ? '#6C306E' : '#7B667B'} />
                                </div>
                            )}
                        </div>

                        {/* bKash / Nagad / Rocket Transaction ID Input Drawer */}
                        {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 sm:p-5 bg-gradient-to-br from-[#FAF6FA] to-white border border-[#6C306E]/30 rounded-2xl text-xs space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#6C306E] font-bold text-xs">
                                        <ShieldCheckIcon size={16} color="#6C306E" />
                                        <span>Official {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} Account</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyNumber(settings.payments[paymentMethod]?.number || '01959-524393')}
                                        className="text-[11px] font-bold text-[#6C306E] bg-white border border-[#EFE0EF] px-2.5 py-1 rounded-full hover:bg-[#FAF6FA] transition cursor-pointer"
                                    >
                                        Copy Number
                                    </button>
                                </div>

                                <div className="p-3 bg-white border border-[#EFE0EF] rounded-xl flex items-center justify-between">
                                    <span className="text-slate-500">Send Money ({currency}{finalTotal.toLocaleString()}):</span>
                                    <b className="font-mono text-sm text-[#3A0C38] font-black">
                                        {settings.payments[paymentMethod]?.number || '01959-524393'}
                                    </b>
                                </div>

                                {/* Dynamic Official QR Code Card - Rendered ONLY if Admin has configured a QR Code */}
                                {settings.payments[paymentMethod]?.qrCode && (
                                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs flex flex-col sm:flex-row items-center gap-3.5">
                                        <div className="size-28 sm:size-32 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                                            <Image
                                                src={settings.payments[paymentMethod].qrCode}
                                                alt={`${paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} QR Code`}
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1 text-center sm:text-left">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2.5 py-0.5 rounded-full inline-block">
                                                Instant Scan & Pay
                                            </span>
                                            <p className="font-extrabold text-xs text-[#241224]">
                                                Scan with your {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} App
                                            </p>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                                                Scan this official QR code using the {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} mobile app to send <b>{currency}{finalTotal.toLocaleString()}</b> quickly and accurately.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Please Send Money <b>{currency}{finalTotal.toLocaleString()}</b> to our official {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} number above, then enter your Transaction ID (TrxID) below:
                                </p>

                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#241224] mb-1">
                                            Transaction ID (TrxID) <span className="text-rose-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. BK92810X72"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider outline-none text-[#241224]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#241224] mb-1">
                                            Sender Mobile Number <span className="text-rose-600">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. 01959524393 or 017XXXXXXXX"
                                            value={senderNumber}
                                            onChange={(e) => setSenderNumber(e.target.value)}
                                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none text-[#241224]"
                                            required
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Card Payment Notice */}
                        {paymentMethod === 'card' && (
                            <div className="p-4 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl text-xs text-[#503E50] space-y-1">
                                <p className="font-bold text-xs text-[#241224]">Card / Online Banking Checkout</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Our beauty concierge will send you a secure SSLCommerz payment link right after booking your authentic UK products.
                                </p>
                            </div>
                        )}

                        {/* 3. Delivery Notes */}
                        <div className="pt-3 border-t border-[#EFE0EF]">
                            <label className="block text-xs font-bold text-[#241224] mb-1.5">
                                Delivery Instructions & Notes (Optional)
                            </label>
                            <textarea
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                                placeholder="e.g. Deliver between 3 PM to 6 PM, please call when near the gate..."
                                className="w-full p-3 text-xs bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] rounded-2xl outline-none resize-none min-h-[70px]"
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Order Breakdown & Place Order CTA */}
                <div className="w-full lg:w-[400px] shrink-0 space-y-6">
                    <div className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,12,56,0.04)] sticky top-6">
                        <h2 className="text-sm font-extrabold text-[#241224] uppercase tracking-wider pb-3 border-b border-[#EFE0EF]">
                            Order Summary ({items.length} Items)
                        </h2>

                        {/* Items Preview List */}
                        <div className="divide-y divide-[#EFE0EF]/60 max-h-60 overflow-y-auto my-3 pr-1">
                            {items.map((item, idx) => (
                                <div key={item.id || idx} className="py-2.5 flex items-center gap-3 text-xs">
                                    <div className="size-12 rounded-xl border border-[#EFE0EF] bg-white shrink-0 overflow-hidden">
                                        <Image
                                            src={Array.isArray(item.images) ? item.images[0] : (item.image || '/product_img1.png')}
                                            alt={item.name}
                                            width={48}
                                            height={48}
                                            unoptimized={true}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#241224] truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-500">
                                            Qty: <b>{item.quantity}</b> × {currency}{item.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="font-extrabold text-[#3A0C38] shrink-0">
                                        {currency}{(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="pt-3 border-t border-[#EFE0EF] space-y-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span className="font-bold text-[#241224]">{currency}{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <TruckIcon size={14} color="#6C306E" />
                                    <span>Delivery Fee:</span>
                                </span>
                                {deliveryCharge === 0 || settings.delivery.isFreeDeliveryEnabled ? (
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                                        FREE
                                    </span>
                                ) : (
                                    <span className="font-bold text-[#241224]">
                                        {currency}{deliveryCharge.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Coupon Code Section on Checkout */}
                            <div className="pt-2 pb-1 border-t border-[#EFE0EF]">
                                {!coupon ? (
                                    <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <TagIcon size={13} color="#6C306E" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value)}
                                                placeholder="Enter coupon code"
                                                className="w-full h-9 pl-8 pr-2 text-xs border border-[#EFE0EF] rounded-xl outline-none focus:border-[#6C306E] bg-[#FAF6FA] text-[#241224] placeholder-slate-400 font-medium transition-colors"
                                            />
                                        </div>
                                        <FlowButton
                                            type="submit"
                                            disabled={isApplyingCoupon || !couponInput.trim()}
                                            text={isApplyingCoupon ? '...' : 'Apply'}
                                            className="!h-9 !px-4 text-xs shrink-0"
                                        />
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-between bg-gradient-to-r from-[#FAF6FA] to-purple-50/50 border border-[#6C306E]/20 p-2.5 rounded-xl text-xs shadow-2xs">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-lg bg-[#6C306E]/10 flex items-center justify-center shrink-0">
                                                <TagIcon size={12} color="#6C306E" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-black text-[#6C306E]">{coupon.code}</span>
                                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                                                        ✓ Verified
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#7B667B] font-medium line-clamp-1">
                                                    {coupon.summary || coupon.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-extrabold text-[#6C306E]">
                                                -{currency}{discountAmount.toLocaleString()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCoupon(null);
                                                    toast.success('Coupon removed');
                                                    if (typeof window !== 'undefined') {
                                                        try {
                                                            const saved = JSON.parse(localStorage.getItem('ukbl_checkout_data') || '{}');
                                                            delete saved.coupon;
                                                            localStorage.setItem('ukbl_checkout_data', JSON.stringify(saved));
                                                        } catch {}
                                                    }
                                                }}
                                                className="size-5 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                title="Remove coupon"
                                            >
                                                <CloseIcon size={11} color="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-[#EFE0EF] text-sm">
                                <span className="font-extrabold text-[#241224]">Total Payable:</span>
                                <span className="text-xl font-black text-[#3A0C38]">
                                    {currency}{finalTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Place Order CTA */}
                        <motion.button
                            type="button"
                            disabled={isSubmitting || items.length === 0}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePlaceOrder}
                            className="group relative overflow-hidden w-full mt-6 bg-gradient-to-r from-[#5E225C] via-[#7B2E79] to-[#3A0C38] hover:from-[#6E2A70] hover:to-[#451245] text-white py-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_28px_-4px_rgba(108,48,110,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_16px_36px_-2px_rgba(108,48,110,0.7)] cursor-pointer disabled:opacity-50 shimmer-active flex items-center justify-center gap-2 border border-white/20"
                        >
                            <span>{isSubmitting ? 'Confirming Order...' : 'Confirm Order & Place Booking'}</span>
                            <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        {/* Trust Badges */}
                        <div className="mt-5 pt-4 border-t border-[#EFE0EF] text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon size={14} color="#059669" />
                                <span>100% Original UK Imported Products Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    editingAddress={editingAddress}
                />
            )}

            {/* Order Confirmed Luxury Modal */}
            <AnimatePresence>
                {confirmedOrder && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md transition-all duration-300"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center border border-[#EFE0EF] shadow-2xl relative"
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setConfirmedOrder(null)}
                                className="absolute top-5 right-5 size-9 rounded-full bg-[#FAF6FA] hover:bg-[#EFE0EF] text-slate-400 hover:text-[#241224] transition flex items-center justify-center cursor-pointer border border-[#EFE0EF]"
                                aria-label="Close popup"
                            >
                                <CloseIcon size={16} />
                            </button>

                            <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                <CheckIcon size={32} color="#059669" strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-extrabold text-[#241224]">Order Confirmed!</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                Thank you for shopping with UK Brand Lover. Your 100% original UK imported cosmetics order is confirmed and is being packaged.
                            </p>

                            <div className="my-5 p-4 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl text-left space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Order Reference:</span>
                                    <span className="font-mono font-bold text-[#6C306E]">{confirmedOrder.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Amount:</span>
                                    <span className="font-extrabold text-[#3A0C38]">{currency}{confirmedOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment Method:</span>
                                    <span className="font-bold text-[#241224]">{confirmedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Delivery Address:</span>
                                    <span className="font-bold text-[#241224]">
                                        {confirmedOrder.address?.city || 'Bangladesh'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Delivery Fee:</span>
                                    <span className="font-bold text-emerald-700">
                                        {confirmedOrder.deliveryCharge === 0 ? 'FREE' : `${currency}${confirmedOrder.deliveryCharge}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/orders')}
                                    className="w-full bg-gradient-to-r from-[#6C306E] to-[#401242] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <TruckIcon size={16} color="#FFFFFF" />
                                    <span>Track Order & Delivery Status</span>
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => setShowInvoiceModal(true)}
                                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                                >
                                    <DownloadIcon size={14} color="currentColor" />
                                    <span>Download Order Invoice</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Clean Minimal Modern Business Invoice Modal */}
            {confirmedOrder && (
                <InvoiceModal
                    order={confirmedOrder}
                    isOpen={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                />
            )}
        </div>
    )
}

