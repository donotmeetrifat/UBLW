'use client'

import {
    PlusIcon,
    TagIcon,
    TrashIcon,
    EditIcon,
    CloseIcon,
    TruckIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    MapPinIcon
} from '@/components/icons';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { removeAddress } from '@/lib/features/address/addressSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { isInsideDhaka, calculateDeliveryCharge, DEFAULT_DELIVERY_SETTINGS } from '@/lib/settings';
import { FlowButton } from '@/components/ui/flow-button';
import { isClientSignedIn, requireSignIn, getClientUser } from '@/lib/clientAuth';

const OrderSummary = ({ totalPrice = 0, items = [], allCartItems = [], selectedCount, selectedQuantity }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const dispatch = useDispatch();
    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [selectedAddress, setSelectedAddress] = useState(addressList[0] || null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [deliverySettings, setDeliverySettings] = useState(DEFAULT_DELIVERY_SETTINGS);

    // Fetch live delivery settings from admin
    useEffect(() => {
        const fetchDeliverySettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.delivery) {
                    setDeliverySettings(data.delivery);
                }
            } catch (error) {
                console.error('Error fetching delivery settings:', error);
            }
        };
        fetchDeliverySettings();
    }, []);

    // Keep selected address in sync if address list updates
    useEffect(() => {
        if (addressList.length > 0) {
            if (!selectedAddress || !addressList.some(a => a.id === selectedAddress.id)) {
                setSelectedAddress(addressList[0]);
            }
        } else {
            setSelectedAddress(null);
        }
    }, [addressList]);

    // Live sync and automatic validity check of applied coupon when subtotal or coupon catalog changes
    useEffect(() => {
        if (!coupon?.code) return;

        // Auto-remove if subtotal drops below minimum order requirement
        if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
            const minReq = coupon.minOrderAmount;
            const savedCode = coupon.code;
            setCoupon(null);
            toast.error(`Coupon ${savedCode} requires a minimum order of ${currency}${minReq.toLocaleString()}. Discount removed.`, {
                id: `coupon-min-order-${savedCode}`
            });
            return;
        }

        const handleCouponSync = async () => {
            if (!coupon?.code) return;
            try {
                const currentUser = getClientUser();
                const res = await fetch('/api/coupons/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code: coupon.code, 
                        subtotal: totalPrice,
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
            } catch (e) {}
        };

        window.addEventListener('coupon-catalog-updated', handleCouponSync);
        return () => window.removeEventListener('coupon-catalog-updated', handleCouponSync);
    }, [coupon, totalPrice]);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        const code = couponCodeInput.trim().toUpperCase();
        if (!code) {
            toast.error('Please enter a coupon code.');
            return;
        }

        if (items.length === 0 || totalPrice <= 0) {
            toast.error('Please select at least 1 product before applying a coupon.');
            return;
        }

        if (coupon && coupon.code === code) {
            toast.success(`Coupon ${code} is already applied!`);
            setCouponCodeInput('');
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
                    subtotal: totalPrice,
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
                setCouponCodeInput('');
            } else {
                if (data.requiresAuth) {
                    toast.error(data.message || 'Please sign in to use this coupon.');
                    requireSignIn(data.message);
                } else {
                    toast.error(data.message || 'Invalid or ineligible coupon code.');
                }
            }
        } catch (error) {
            toast.error('Could not connect to server to verify coupon. Please try again.');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const discountAmount = coupon && items.length > 0 && (!coupon.minOrderAmount || totalPrice >= coupon.minOrderAmount)
        ? (coupon.discountType === 'FIXED'
            ? Math.min(coupon.discount, totalPrice)
            : (coupon.maxDiscount 
                ? Math.min(Math.round((coupon.discount / 100) * totalPrice), coupon.maxDiscount)
                : Math.round((coupon.discount / 100) * totalPrice)))
        : 0;
    
    // Calculate live delivery charge
    const deliveryCharge = items.length === 0 
        ? 0 
        : (selectedAddress 
            ? calculateDeliveryCharge(selectedAddress, totalPrice, deliverySettings)
            : (deliverySettings.insideDhaka || 80));

    const isDhaka = selectedAddress ? isInsideDhaka(selectedAddress) : true;
    const finalTotal = items.length === 0 
        ? 0 
        : Math.max(0, totalPrice - discountAmount + (selectedAddress ? deliveryCharge : 0));

    const handleProceedToPayment = () => {
        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to proceed with your order.');
            return;
        }

        if (items.length === 0) {
            toast.error('Please select at least 1 product from your shopping bag.');
            return;
        }

        if (!selectedAddress) {
            toast.error('Please add and select your delivery address to proceed.');
            setShowAddressModal(true);
            return;
        }

        // Store checkout state in localStorage so the payment page gets the exact selected items, address and coupon
        if (typeof window !== 'undefined') {
            localStorage.setItem('ukbl_checkout_data', JSON.stringify({
                selectedAddressId: selectedAddress.id,
                selectedAddress,
                selectedItemIds: items.map(i => i.id),
                selectedItems: items,
                coupon,
                discountAmount,
                deliveryCharge,
                isDhaka,
                subtotal: totalPrice,
                finalTotal,
            }));
        }

        router.push('/checkout');
    };

    return (
        <div className='w-full max-w-lg lg:max-w-[380px] bg-white border border-[#EFE0EF] text-[#241224] text-sm rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,12,56,0.04)]'>
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE0EF]">
                <div>
                    <h2 className='text-xl font-extrabold text-[#241224] tracking-tight'>Order Summary</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Step 1: Address & Promotions</p>
                </div>
                <span className="text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2.5 py-1 rounded-full uppercase">
                    Bag Step
                </span>
            </div>

            {/* Delivery Address Section */}
            <div className='my-5'>
                <div className='flex items-center justify-between mb-3'>
                    <p className='text-[#241224] font-extrabold text-[11px] uppercase tracking-widest'>
                        DELIVERY ADDRESS
                    </p>
                    <button
                        type="button"
                        className='group inline-flex items-center gap-1.5 text-[#6C306E] text-xs font-bold bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 border border-[#EFE0EF] hover:border-[#6C306E] shadow-2xs cursor-pointer'
                        onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                    >
                        <PlusIcon size={12} color="currentColor" className="group-hover:rotate-90 transition-transform duration-200" />
                        <span>Add Address</span>
                    </button>
                </div>

                <div className='flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1'>
                    {addressList && addressList.length > 0 ? (
                        addressList.map((address, idx) => {
                            const isSelected = selectedAddress?.id === address.id;
                            const addrIsDhaka = isInsideDhaka(address);
                            return (
                                <div
                                    key={address.id || idx}
                                    onClick={() => setSelectedAddress(address)}
                                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs ring-1 ring-[#6C306E]/30'
                                            : 'border-[#EFE0EF] hover:border-[#6C306E]/30 bg-white'
                                    }`}
                                >
                                    <div className='flex justify-between items-start'>
                                        <div className="flex items-center gap-2">
                                            <div className={`size-4 rounded-full border flex items-center justify-center transition-colors ${
                                                isSelected ? 'border-[#6C306E] bg-[#6C306E]' : 'border-slate-300'
                                            }`}>
                                                {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                            </div>
                                            <p className='font-bold text-xs text-[#241224]'>{address.fullName || address.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingAddress(address);
                                                    setShowAddressModal(true);
                                                }}
                                                className='p-1 text-slate-400 hover:text-[#6C306E] transition-colors rounded-lg hover:bg-white'
                                                title="Edit address"
                                            >
                                                <EditIcon size={13} color="currentColor" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dispatch(removeAddress(address.id));
                                                }}
                                                className='p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-white'
                                                title="Delete address"
                                            >
                                                <TrashIcon size={13} color="currentColor" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className='text-slate-500 text-[11px] mt-1 pl-6 font-normal leading-relaxed line-clamp-2'>
                                        {address.address || address.street}, {address.city}, {address.region || address.state}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pl-6 mt-2 pt-1 border-t border-[#EFE0EF]/60">
                                        <span className='text-[#6C306E] text-[10px] font-bold font-mono'>
                                            {address.phoneNumber || address.phone}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-5 border border-dashed border-[#EFE0EF] rounded-2xl bg-[#FAF6FA]">
                            <MapPinIcon size={22} color="#6C306E" className="mx-auto mb-1.5 opacity-60" />
                            <p className="text-xs font-bold text-slate-700">No delivery address saved</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Add an address to calculate exact delivery fee</p>
                            <button
                                type="button"
                                onClick={() => setShowAddressModal(true)}
                                className="text-xs font-bold text-[#6C306E] mt-2.5 inline-flex items-center gap-1 bg-white border border-[#EFE0EF] px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-[#FAF6FA]"
                            >
                                <PlusIcon size={11} color="#6C306E" />
                                <span>Add Delivery Address</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Calculations Breakdown */}
            <div className='pt-4 border-t border-[#EFE0EF] space-y-2.5 text-xs'>
                {items.length === 0 && (
                    <div className="p-3 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl text-[11px] text-[#6C306E] font-medium text-center">
                        Please check at least 1 product in your bag to calculate delivery & checkout.
                    </div>
                )}

                <div className='flex justify-between text-slate-600'>
                    <p>Subtotal ({selectedQuantity !== undefined ? selectedQuantity : items.length} {selectedQuantity === 1 ? 'item' : 'items'}):</p>
                    <p className='font-bold text-[#241224]'>{currency}{totalPrice.toLocaleString()}</p>
                </div>

                {/* Delivery Calculation with 100% Precision */}
                <div className='flex justify-between items-center text-slate-600'>
                    <div className="flex items-center gap-1.5">
                        <TruckIcon size={14} color="#6C306E" />
                        <span>Delivery Fee:</span>
                    </div>
                    {items.length === 0 ? (
                        <span className='text-slate-400 text-[11px] italic'>
                            Select products
                        </span>
                    ) : deliveryCharge === 0 || deliverySettings.isFreeDeliveryEnabled ? (
                        <span className='font-extrabold text-emerald-700 uppercase text-[11px] tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
                            FREE
                        </span>
                    ) : selectedAddress ? (
                        <span className='font-bold text-[#241224]'>
                            {currency}{deliveryCharge.toLocaleString()}
                        </span>
                    ) : (
                        <span className='text-slate-400 text-[11px] italic'>
                            Calculated with address
                        </span>
                    )}
                </div>

                {coupon && (
                    <div className='flex justify-between text-[#6C306E] font-bold'>
                        <p>Discount ({coupon.code}):</p>
                        <p>-{currency}{discountAmount.toLocaleString()}</p>
                    </div>
                )}

                {/* Coupon Code Input */}
                {!coupon ? (
                    <form onSubmit={handleCouponCode} className='flex items-center gap-2 mt-3 pt-2'>
                        <div className="relative flex-1">
                            <TagIcon size={14} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                value={couponCodeInput}
                                type="text"
                                placeholder='Coupon (NEW20, OFF10)'
                                className='h-10 border border-[#EFE0EF] pl-9 pr-3 rounded-full text-xs w-full outline-none focus:border-[#6C306E] bg-[#FAF6FA] placeholder-[#8A758A] text-[#241224] font-medium transition-colors'
                            />
                        </div>
                        <FlowButton
                            type="submit"
                            disabled={isApplyingCoupon || items.length === 0}
                            text={isApplyingCoupon ? '...' : 'Apply'}
                            className="!h-10 !px-5 shrink-0"
                        />
                    </form>
                ) : (
                    <div className='flex items-center justify-between bg-gradient-to-r from-[#FAF6FA] to-purple-50/50 border border-[#6C306E]/20 p-3 rounded-2xl text-xs mt-2 shadow-2xs'>
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-xl bg-[#6C306E]/10 flex items-center justify-center shrink-0">
                                <TagIcon size={14} color="#6C306E" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className='font-black text-[#6C306E] tracking-wide text-xs'>{coupon.code}</p>
                                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                        ✓ Verified
                                    </span>
                                </div>
                                <p className='text-[10.5px] text-[#7B667B] font-medium line-clamp-1'>
                                    {coupon.summary || coupon.description}
                                </p>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => {
                                setCoupon(null);
                                toast.success('Coupon removed.');
                            }} 
                            className="size-7 rounded-full hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0" 
                            title="Remove coupon"
                        >
                            <CloseIcon size={13} color="currentColor" />
                        </button>
                    </div>
                )}
            </div>

            {/* Total Row */}
            <div className='flex justify-between py-4 text-base font-extrabold text-[#241224] border-t border-[#EFE0EF] mt-3'>
                <p>Estimated Total:</p>
                <p className='text-[#3A0C38] text-lg font-black'>
                    {currency}{finalTotal.toLocaleString()}
                </p>
            </div>

            {/* Proceed to Payment CTA */}
            <motion.button
                type="button"
                disabled={items.length === 0}
                whileHover={{ scale: items.length > 0 ? 1.025 : 1, y: items.length > 0 ? -1 : 0 }}
                whileTap={{ scale: items.length > 0 ? 0.98 : 1 }}
                onClick={handleProceedToPayment}
                className='group relative overflow-hidden w-full bg-gradient-to-r from-[#5E225C] via-[#7B2E79] to-[#3A0C38] hover:from-[#6E2A70] hover:to-[#451245] text-white py-4 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_28px_-4px_rgba(108,48,110,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_16px_36px_-2px_rgba(108,48,110,0.7)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shimmer-active flex items-center justify-center gap-2 border border-white/20'
            >
                <span>
                    {items.length === 0 
                        ? 'Select Products to Proceed' 
                        : `Proceed to Payment (${selectedQuantity !== undefined ? selectedQuantity : items.length} ${selectedQuantity === 1 ? 'item' : 'items'})`}
                </span>
                {items.length > 0 && (
                    <ArrowRightIcon 
                        size={14} 
                        color="#FFFFFF" 
                        className="group-hover:translate-x-1.5 transition-transform duration-300" 
                    />
                )}
            </motion.button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheckIcon size={14} color="#059669" />
                <span>Next Step: Select Payment Option & Place Order</span>
            </div>

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
