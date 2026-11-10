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
    CheckIcon
} from '@/components/icons';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { removeAddress } from '@/lib/features/address/addressSlice';
import { motion, AnimatePresence } from 'framer-motion';

const OrderSummary = ({ totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const dispatch = useDispatch();
    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [selectedAddress, setSelectedAddress] = useState(addressList[0] || null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        const code = couponCodeInput.trim().toUpperCase();
        if (code === 'NEW20') {
            setCoupon({ code: 'NEW20', description: '20% Off New Customer Welcome', discount: 20 });
            toast.success("Coupon NEW20 applied! 20% discount added.");
            setCouponCodeInput('');
        } else if (code === 'OFF10') {
            setCoupon({ code: 'OFF10', description: '10% Off Special Privilege', discount: 10 });
            toast.success("Coupon OFF10 applied!");
            setCouponCodeInput('');
        } else {
            toast.error("Invalid coupon code. Try NEW20 or OFF10");
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!selectedAddress) {
            toast.error("Please add and select a delivery address.");
            return;
        }
        toast.success("Order placed successfully! Thank you for choosing UK Brand Lover.");
        router.push('/orders');
    };

    const discountAmount = coupon ? (coupon.discount / 100 * totalPrice) : 0;
    const finalTotal = Math.max(0, totalPrice - discountAmount);

    const paymentMethods = [
        { id: 'cod', label: 'Cash on Delivery', sub: 'Pay cash upon product inspection', icon: CashDeliveryIcon },
        { id: 'bkash', label: 'bKash Mobile Banking', sub: 'Direct personal / merchant bKash', icon: MobileBankingIcon },
        { id: 'nagad', label: 'Nagad Wallet', sub: 'Instant digital wallet transfer', icon: MobileBankingIcon },
        { id: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard & online gateway', icon: CardPaymentIcon },
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
                                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                    isSelected 
                                        ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs' 
                                        : 'border-[#EFE0EF] bg-white hover:border-[#6C306E]/40'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`size-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300 bg-white'
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
            </div>

            {/* Delivery Address Section */}
            <div className='my-6 pt-5 border-t border-[#EFE0EF]'>
                <div className='flex items-center justify-between mb-3'>
                    <p className='text-[#241224] font-extrabold text-[11px] uppercase tracking-widest'>DELIVERY ADDRESS</p>
                    <button
                        type="button"
                        className='flex items-center gap-1 text-[#6C306E] text-xs font-bold bg-[#FAF6FA] hover:bg-[#EFE0EF] px-3 py-1 rounded-full transition-colors border border-[#EFE0EF] cursor-pointer'
                        onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                    >
                        <PlusIcon size={12} color="#6C306E" />
                        <span>Add New</span>
                    </button>
                </div>

                <div className='flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1'>
                    {addressList && addressList.length > 0 ? (
                        addressList.map((address, idx) => (
                            <div
                                key={address.id || idx}
                                onClick={() => setSelectedAddress(address)}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                    selectedAddress?.id === address.id
                                        ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/20'
                                        : 'border-[#EFE0EF] hover:border-[#6C306E]/30 bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-[#241224] text-xs">{address.fullName || address.name}</p>
                                    {selectedAddress?.id === address.id && (
                                        <span className="text-[9px] font-bold text-[#6C306E] bg-white border border-[#EFE0EF] px-2 py-0.5 rounded-full">
                                            Selected
                                        </span>
                                    )}
                                </div>
                                <p className="text-[#7B667B] text-xs mt-0.5">{address.phoneNumber || address.phone}</p>
                                <p className="text-slate-600 text-xs mt-1 leading-snug line-clamp-2">
                                    {address.address || address.street}, {address.city}, {address.region || address.state}
                                </p>

                                <div className="flex gap-3 mt-2.5 pt-2 border-t border-[#EFE0EF]/60">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingAddress(address);
                                            setShowAddressModal(true);
                                        }}
                                        className="text-[#6C306E] text-[11px] font-bold hover:underline cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(removeAddress(address.id));
                                            if (selectedAddress?.id === address.id) setSelectedAddress(null);
                                        }}
                                        className="text-red-500 hover:text-red-700 text-[11px] font-bold hover:underline transition cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-5 bg-[#FAF6FA] border border-dashed border-[#EFE0EF] rounded-2xl'>
                            <p className='text-[#7B667B] text-xs'>No saved address. Click "Add New" above.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Price Calculations */}
            <div className='pb-4 border-b border-[#EFE0EF] space-y-2 text-xs'>
                <div className='flex justify-between text-slate-600'>
                    <p>Subtotal:</p>
                    <p className='font-bold text-slate-800'>{currency}{totalPrice.toLocaleString()}</p>
                </div>
                <div className='flex justify-between text-slate-600'>
                    <p>Shipping (Nationwide):</p>
                    <p className='font-bold text-emerald-700'>FREE</p>
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
                                placeholder='Coupon (e.g. NEW20)'
                                className='border border-[#EFE0EF] pl-8 pr-3 py-2 rounded-xl text-xs w-full outline-none focus:border-[#6C306E] bg-[#FAF6FA]'
                            />
                        </div>
                        <button type="submit" className='bg-[#6C306E] hover:bg-[#3A0C38] text-white px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 whitespace-nowrap cursor-pointer'>
                            Apply
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
            <div className='flex justify-between py-4 text-base font-extrabold text-[#241224]'>
                <p>Total Payable:</p>
                <p className='text-[#3A0C38] text-lg'>{currency}{finalTotal.toLocaleString()}</p>
            </div>

            {/* Place Order CTA */}
            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlaceOrder}
                className='w-full bg-[#6C306E] hover:bg-[#3A0C38] text-white py-3.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(108,48,110,0.25)] cursor-pointer'
            >
                Confirm Order
            </motion.button>

            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    editingAddress={editingAddress}
                />
            )}
        </div>
    )
}

export default OrderSummary
