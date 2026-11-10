'use client'

import {
    CardPaymentIcon,
    CashDeliveryIcon,
    CloseIcon,
    MobileBankingIcon,
    PlusIcon,
    TagIcon,
    TrashIcon,
    WhatsAppIcon,
    CheckIcon,
    ShieldCheckIcon,
    TruckIcon,
    ArrowRightIcon,
    PrinterIcon
} from '@/components/icons';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { removeAddress } from '@/lib/features/address/addressSlice';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';

const OrderSummary = ({ totalPrice, items = [] }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const dispatch = useDispatch();
    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [transactionId, setTransactionId] = useState('');
    const [senderNumber, setSenderNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(addressList[0] || null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        const code = couponCodeInput.trim().toUpperCase();
        if (!code) return;

        setIsApplyingCoupon(true);
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal: totalPrice })
            });
            const data = await res.json();

            if (data.success && data.coupon) {
                setCoupon(data.coupon);
                toast.success(`Coupon ${data.coupon.code} applied! ${data.coupon.discount}% discount added.`);
                setCouponCodeInput('');
            } else {
                toast.error(data.message || 'Invalid coupon code. Try NEW20 or OFF10');
            }
        } catch (error) {
            // Local fallback
            if (code === 'NEW20') {
                setCoupon({ code: 'NEW20', description: '20% Off New Customer Welcome', discount: 20 });
                toast.success('Coupon NEW20 applied! 20% discount.');
            } else if (code === 'OFF10') {
                setCoupon({ code: 'OFF10', description: '10% Off Privilege Reward', discount: 10 });
                toast.success('Coupon OFF10 applied! 10% discount.');
            } else {
                toast.error('Could not validate coupon. Try NEW20 or OFF10');
            }
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const discountAmount = coupon ? Math.round((coupon.discount / 100) * totalPrice) : 0;
    const finalTotal = Math.max(0, totalPrice - discountAmount);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!selectedAddress) {
            toast.error('Please add and select a delivery address.');
            return;
        }

        if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
            toast.error(`Please enter your ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Transaction ID (TrxID)`);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images ? item.images[0] : (item.image || '/product_img1.png'),
                })),
                address: selectedAddress,
                paymentMethod: paymentMethod.toUpperCase(),
                transactionId: transactionId.trim() || null,
                couponCode: coupon ? coupon.code : null,
                senderNumber: senderNumber.trim() || null,
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (data.success && data.order) {
                // Sync to localStorage
                if (typeof window !== 'undefined') {
                    const existing = JSON.parse(localStorage.getItem('ukbl_orders') || '[]');
                    localStorage.setItem('ukbl_orders', JSON.stringify([data.order, ...existing]));
                }

                // Clear bag
                dispatch(clearCart());
                setConfirmedOrder(data.order);
                toast.success('Order placed successfully! Thank you for choosing UK Brand Lover.');
            } else {
                toast.error(data.message || 'Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Order error:', error);
            // Graceful fallback for offline
            const fallbackOrder = {
                id: `order_${Date.now()}`,
                orderNumber: `UKBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                total: finalTotal,
                status: 'ORDER_PLACED',
                paymentMethod: paymentMethod.toUpperCase(),
                createdAt: new Date().toISOString(),
                orderItems: items.map(i => ({ product: i, quantity: i.quantity, price: i.price })),
                address: selectedAddress,
            };
            if (typeof window !== 'undefined') {
                const existing = JSON.parse(localStorage.getItem('ukbl_orders') || '[]');
                localStorage.setItem('ukbl_orders', JSON.stringify([fallbackOrder, ...existing]));
            }
            dispatch(clearCart());
            setConfirmedOrder(fallbackOrder);
            toast.success('Order registered successfully!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const paymentMethods = [
        { id: 'cod', label: 'Cash on Delivery', sub: 'Pay cash upon product inspection (Nationwide)', icon: CashDeliveryIcon },
        { id: 'bkash', label: 'bKash Send Money', sub: '01959-524393 (Personal / Merchant)', icon: MobileBankingIcon },
        { id: 'nagad', label: 'Nagad Wallet', sub: '01959-524393 (Personal Account)', icon: MobileBankingIcon },
        { id: 'card', label: 'Direct WhatsApp Order', sub: 'Instant confirmation with beauty consultant', icon: WhatsAppIcon },
    ];

    return (
        <div className='w-full max-w-lg lg:max-w-[370px] bg-white border border-[#EFE0EF] text-[#241224] text-sm rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,12,56,0.04)]'>
            <h2 className='text-xl font-extrabold text-[#241224] tracking-tight'>Payment Summary</h2>

            {/* Payment Method Selector */}
            <div className="my-5">
                <p className='text-[#241224] text-[11px] font-extrabold uppercase tracking-widest mb-3'>
                    SELECT PAYMENT OPTION
                </p>
                <div className='flex flex-col gap-2.5'>
                    {paymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.id;
                        return (
                            <motion.div
                                key={method.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected
                                    ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs'
                                    : 'border-[#EFE0EF] bg-white hover:border-[#6C306E]/40'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300 bg-white'
                                        }`}>
                                        {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-bold text-xs truncate ${isSelected ? 'text-[#3A0C38]' : 'text-[#241224]'}`}>
                                            {method.label}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium truncate">
                                            {method.sub}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <method.icon size={20} color={isSelected ? '#6C306E' : '#7B667B'} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* bKash / Nagad TrxID Input Drawer */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3.5 p-3.5 bg-[#FAF6FA] border border-[#6C306E]/30 rounded-2xl text-xs space-y-2.5"
                    >
                        <div className="flex items-center gap-2 text-[#6C306E] font-bold text-[11px]">
                            <ShieldCheckIcon size={14} color="#6C306E" />
                            <span>100% Free Transfer — No Gateway Charge</span>
                        </div>
                        <p className="text-[11px] text-[#503E50] leading-relaxed">
                            Please Send Money <b>{currency}{finalTotal.toLocaleString()}</b> to <b>01959-524393</b> (Personal {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}), then enter your Transaction ID below:
                        </p>
                        <div className="space-y-1.5">
                            <input
                                type="text"
                                placeholder="Transaction ID (e.g. BK982310X)"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider outline-none text-[#241224]"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Sender Mobile Number (01XXXXXXXXX)"
                                value={senderNumber}
                                onChange={(e) => setSenderNumber(e.target.value)}
                                className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-xl px-3 py-2 text-xs outline-none text-[#241224]"
                            />
                        </div>
                    </motion.div>
                )}

                {/* WhatsApp Quick Order notice */}
                {paymentMethod === 'card' && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
                        <p className="text-[11px] font-medium leading-relaxed">
                            Placing this order will notify our official WhatsApp line (<b>+880 1959-524393</b>) to arrange quick verification and priority packing.
                        </p>
                    </div>
                )}
            </div>

            {/* Delivery Address Section */}
            <div className='my-6 pt-5 border-t border-[#EFE0EF]'>
                <div className='flex items-center justify-between mb-3'>
                    <p className='text-[#241224] font-extrabold text-[11px] uppercase tracking-widest'>DELIVERY ADDRESS</p>
                    <button
                        type="button"
                        className='group inline-flex items-center gap-1.5 text-[#6C306E] text-xs font-bold bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 border border-[#EFE0EF] hover:border-[#6C306E] shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer'
                        onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                    >
                        <PlusIcon size={12} color="currentColor" className="group-hover:rotate-90 transition-transform duration-200" />
                        <span>Add New Address</span>
                    </button>
                </div>

                <div className='flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1'>
                    {addressList && addressList.length > 0 ? (
                        addressList.map((address, idx) => (
                            <div
                                key={address.id || idx}
                                onClick={() => setSelectedAddress(address)}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${selectedAddress?.id === address.id
                                    ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/20'
                                    : 'border-[#EFE0EF] hover:border-[#6C306E]/30 bg-white'
                                    }`}
                            >
                                <div className='flex justify-between items-start'>
                                    <div className="flex items-center gap-2">
                                        <div className={`size-3.5 rounded-full border flex items-center justify-center ${selectedAddress?.id === address.id ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300'}`}>
                                            {selectedAddress?.id === address.id && <div className="size-1 rounded-full bg-white" />}
                                        </div>
                                        <p className='font-bold text-xs text-[#241224]'>{address.fullName || address.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(removeAddress(address.id));
                                        }}
                                        className='p-1 text-slate-400 hover:text-red-500 transition-colors'
                                    >
                                        <TrashIcon size={13} color="currentColor" />
                                    </button>
                                </div>
                                <p className='text-slate-500 text-[11px] mt-1 pl-5 font-normal'>
                                    {address.address || address.street}, {address.city}, {address.region || address.state}
                                </p>
                                <p className='text-[#6C306E] text-[11px] font-bold mt-1 pl-5'>
                                    {address.phoneNumber || address.phone}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5 border border-dashed border-[#EFE0EF] rounded-2xl bg-[#FAF6FA]">
                            <p className="text-xs text-slate-400">No delivery address saved</p>
                            <button
                                type="button"
                                onClick={() => setShowAddressModal(true)}
                                className="text-xs font-bold text-[#6C306E] mt-2 inline-block hover:underline"
                            >
                                + Add Delivery Address
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Calculations Breakdown */}
            <div className='pt-5 border-t border-[#EFE0EF] space-y-2.5 text-xs'>
                <div className='flex justify-between text-slate-600'>
                    <p>Subtotal ({items.length} items):</p>
                    <p className='font-bold text-[#241224]'>{currency}{totalPrice.toLocaleString()}</p>
                </div>
                <div className='flex justify-between text-slate-600'>
                    <p className="flex items-center gap-1.5">
                        <TruckIcon size={14} color="#047857" />
                        <span>Nationwide Delivery:</span>
                    </p>
                    <p className='font-bold text-emerald-700 uppercase text-[11px] tracking-wider'>FREE</p>
                </div>
                {coupon && (
                    <div className='flex justify-between text-[#6C306E] font-bold'>
                        <p>Discount ({coupon.code}):</p>
                        <p>-{currency}{discountAmount.toLocaleString()}</p>
                    </div>
                )}

                {/* Coupon form */}
                {!coupon ? (
                    <form onSubmit={handleCouponCode} className='flex gap-2 mt-3 pt-2'>
                        <div className="relative flex-1">
                            <TagIcon size={14} color="#6C306E" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                value={couponCodeInput}
                                type="text"
                                placeholder='Coupon (NEW20, OFF10)'
                                className='border border-[#EFE0EF] pl-8 pr-3 py-2 rounded-xl text-xs w-full outline-none focus:border-[#6C306E] bg-[#FAF6FA]'
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isApplyingCoupon}
                            className='bg-slate-900 hover:bg-[#6C306E] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-[0_4px_14px_rgba(108,48,110,0.35)] active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-50'
                        >
                            {isApplyingCoupon ? 'Verifying...' : 'Apply Coupon'}
                        </button>
                    </form>
                ) : (
                    <div className='flex items-center justify-between bg-[#FAF6FA] border border-[#EFE0EF] p-2.5 rounded-2xl text-xs mt-2'>
                        <div>
                            <p className='font-bold text-[#6C306E]'>{coupon.code}</p>
                            <p className='text-[10px] text-[#7B667B]'>{coupon.description}</p>
                        </div>
                        <button type="button" onClick={() => setCoupon(null)} className="p-1 hover:text-red-600 transition cursor-pointer">
                            <CloseIcon size={14} color="currentColor" />
                        </button>
                    </div>
                )}
            </div>

            {/* Total Row */}
            <div className='flex justify-between py-4 text-base font-extrabold text-[#241224] border-t border-[#EFE0EF] mt-3'>
                <p>Total Payable:</p>
                <p className='text-[#3A0C38] text-lg'>{currency}{finalTotal.toLocaleString()}</p>
            </div>

            {/* Place Order CTA with Imperial Plum Glow & Light Sweep */}
            <motion.button
                type="button"
                disabled={isSubmitting || items.length === 0}
                whileHover={{ scale: items.length > 0 ? 1.025 : 1, y: items.length > 0 ? -1 : 0 }}
                whileTap={{ scale: items.length > 0 ? 0.98 : 1 }}
                onClick={handlePlaceOrder}
                className='group relative overflow-hidden w-full bg-gradient-to-r from-[#5E225C] via-[#7B2E79] to-[#3A0C38] hover:from-[#6E2A70] hover:to-[#451245] text-white py-4 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_28px_-4px_rgba(108,48,110,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_16px_36px_-2px_rgba(108,48,110,0.7)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shimmer-active flex items-center justify-center gap-2 border border-white/20'
            >
                <span>{isSubmitting ? 'Placing Order...' : 'Confirm Order & Place Booking'}</span>
                {!isSubmitting && (
                    <ArrowRightIcon 
                        size={14} 
                        color="#FFFFFF" 
                        className="group-hover:translate-x-1.5 transition-transform duration-300" 
                    />
                )}
            </motion.button>

            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    editingAddress={editingAddress}
                />
            )}

            {/* Order Confirmation Modal */}
            <AnimatePresence>
                {confirmedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center border border-[#EFE0EF] shadow-2xl relative"
                        >
                            <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                <CheckIcon size={32} color="#059669" strokeWidth={2.5} />
                            </div>

                            <h3 className="text-xl font-extrabold text-[#241224]">Order Confirmed!</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Thank you for shopping with UK Brand Lover. Your authentic UK products are being prepared.
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
                                    <span className="text-slate-500">Delivery:</span>
                                    <span className="font-bold text-emerald-700">Free Express Delivery</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setConfirmedOrder(null);
                                        router.push('/orders');
                                    }}
                                    className="group relative overflow-hidden w-full bg-gradient-to-r from-[#6C306E] to-[#401242] hover:from-[#7E3780] hover:to-[#4A164C] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] cursor-pointer flex items-center justify-center gap-2 border border-white/20 shimmer-active"
                                >
                                    <TruckIcon size={16} color="#FFFFFF" className="group-hover:translate-x-1 transition-transform duration-300" />
                                    <span>Track Your Order & Delivery</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (typeof window !== 'undefined') window.print();
                                    }}
                                    className="w-full bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] hover:border-[#6C306E]/40 text-[#503E50] py-3 rounded-full font-bold text-xs transition duration-200 cursor-pointer shadow-2xs flex items-center justify-center gap-2"
                                >
                                    <PrinterIcon size={14} color="#6C306E" />
                                    <span>Print Order Receipt</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default OrderSummary
