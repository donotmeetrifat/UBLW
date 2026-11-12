'use client'

import React, { useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import RatingModal from "./RatingModal";
import InvoiceModal from "./InvoiceModal";
import {
    ReviewBadgeIcon,
    CheckIcon,
    TruckIcon,
    ClockIcon,
    MapPinIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { isInsideDhaka } from "@/lib/settings";

const STAGES = [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Stock Verified' },
    { key: 'PROCESSING', label: 'Processing', desc: 'Security Sealed' },
    { key: 'SHIPPED', label: 'Shipped', desc: 'In Transit' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Safely Arrived' }
];

const OrderItem = ({ order }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const [ratingModal, setRatingModal] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const { ratings } = useSelector(state => state.rating);

    const addrName = order?.address?.fullName || order?.address?.name || 'Valued Customer';
    const addrPhone = order?.address?.phoneNumber || order?.address?.phone || '';
    const addrStreet = order?.address?.address || order?.address?.street || '';
    const addrCity = order?.address?.city || '';
    const addrRegion = order?.address?.region || order?.address?.state || '';
    const isDhaka = isInsideDhaka(order.address);

    const currentStatus = (order.status || 'ORDER_PLACED').toUpperCase();
    const currentStageIndex = STAGES.findIndex(s => s.key === currentStatus);
    const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

    const orderNumber = order.orderNumber || order.id || 'UKBL-2026';
    const orderItems = order.orderItems || [];

    return (
        <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(58,12,56,0.03)] transition-all">
            {/* Top Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFE0EF]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-[#6C306E] text-sm sm:text-base tracking-tight">
                            {orderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-[#3A0C38]">
                            {order.paymentMethod || 'COD'}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            currentStatus === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : currentStatus === 'SHIPPED'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                            {STAGES[activeIndex]?.label || currentStatus}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        Ordered on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Total Payable</span>
                        <span className="text-base sm:text-lg font-black text-[#3A0C38]">
                            {currency}{Number(order.total || 0).toLocaleString()}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowInvoice(true)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF6FA] hover:bg-[#6C306E] hover:text-white border border-[#EFE0EF] text-[#6C306E] transition cursor-pointer shadow-2xs"
                    >
                        Invoice
                    </button>
                </div>
            </div>

            {/* Product Items Preview (Clean & Organized) */}
            <div className="py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {orderItems.map((item, idx) => {
                        const productObj = item.product || item;
                        const prodName = productObj.name || item.name || 'UK Beauty Product';
                        const prodImage = (productObj.images && productObj.images[0]) || item.image || '/product_img1.png';
                        return (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]/60">
                                <div className="size-12 rounded-xl bg-white border border-[#EFE0EF] shrink-0 overflow-hidden">
                                    <Image
                                        src={prodImage}
                                        alt={prodName}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs text-[#241224] truncate">{prodName}</p>
                                    <p className="text-[11px] text-[#6C306E] font-medium">
                                        Qty: <b>{item.quantity || 1}</b> • {currency}{Number(item.price || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions Row: View Details Toggle Button */}
            <div className="pt-3 border-t border-[#EFE0EF] flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                    {orderItems.length} product{orderItems.length > 1 ? 's' : ''} in package
                </span>

                <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C306E] hover:text-[#3A0C38] bg-[#FAF6FA] hover:bg-[#EFE0EF] px-3.5 py-1.5 rounded-full transition cursor-pointer"
                >
                    <span>{showDetails ? 'Hide Details' : 'View Order Details'}</span>
                    <motion.div animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDownIcon size={12} color="currentColor" />
                    </motion.div>
                </button>
            </div>

            {/* Expandable Order Details Section */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-5 mt-4 border-t border-[#EFE0EF] space-y-5">
                            
                            {/* 1. Given Delivery Address Information (Clean, No WhatsApp button) */}
                            <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]">
                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#EFE0EF]/60">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#241224]">
                                        <MapPinIcon size={14} color="#6C306E" />
                                        <span>Delivery Address Information</span>
                                    </div>
                                </div>

                                <div className="text-xs space-y-1">
                                    <p className="font-bold text-[#241224]">{addrName}</p>
                                    <p className="font-mono text-[#6C306E] font-bold text-[11px]">{addrPhone}</p>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">
                                        {addrStreet}, {addrCity}, {addrRegion}
                                    </p>
                                </div>
                            </div>

                            {/* 2. Parcel Delivery Progress Stepper */}
                            <div>
                                <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-3">
                                    DELIVERY PROGRESS TIMELINE
                                </p>
                                <div className="grid grid-cols-5 gap-1 text-center relative">
                                    {STAGES.map((stage, idx) => {
                                        const isCompleted = idx <= activeIndex;
                                        const isCurrent = idx === activeIndex;

                                        return (
                                            <div key={stage.key} className="flex flex-col items-center">
                                                <div className={`size-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                                                    isCompleted 
                                                        ? 'bg-[#6C306E] text-white shadow-xs' 
                                                        : 'bg-white border-2 border-slate-200 text-slate-400'
                                                }`}>
                                                    {idx < activeIndex ? (
                                                        <CheckIcon size={12} color="#FFFFFF" strokeWidth={3} />
                                                    ) : (
                                                        <span>{idx + 1}</span>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] font-bold mt-1.5 truncate w-full ${
                                                    isCurrent ? 'text-[#3A0C38]' : isCompleted ? 'text-[#6C306E]' : 'text-slate-400'
                                                }`}>
                                                    {stage.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {order.consignmentId && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-medium">
                                        <TruckIcon size={13} color="#6C306E" />
                                        <span>Courier Tracking: <b>{order.consignmentId}</b></span>
                                    </div>
                                )}
                            </div>

                            {/* 3. Items with Verified Review Button (Clean 2D Icon) */}
                            <div className="space-y-3 pt-2">
                                <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-widest">
                                    ITEMS & VERIFIED REVIEWS
                                </p>

                                <div className="space-y-2">
                                    {orderItems.map((item, index) => {
                                        const productObj = item.product || item;
                                        const prodName = productObj.name || item.name || 'UK Beauty Product';
                                        const prodId = productObj.id || item.productId;
                                        const existingReview = ratings.find(r => r.orderId === order.id && r.productId === prodId);

                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] text-xs">
                                                <div className="min-w-0 flex-1 pr-3">
                                                    <p className="font-bold text-[#241224] truncate">{prodName}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {currency}{Number(item.price || 0).toLocaleString()} × {item.quantity || 1}
                                                    </p>
                                                </div>

                                                <div className="shrink-0">
                                                    {existingReview ? (
                                                        <Rating value={existingReview.rating} />
                                                    ) : currentStatus === 'DELIVERED' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRatingModal({ 
                                                                orderId: order.id, 
                                                                productId: prodId,
                                                                productName: prodName,
                                                                productImage: prodImage,
                                                                product: productObj
                                                            })}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#6C306E] text-[#6C306E] hover:text-white border border-[#EFE0EF] hover:border-[#6C306E] text-xs font-bold transition shadow-2xs cursor-pointer"
                                                        >
                                                            <ReviewBadgeIcon size={14} color="currentColor" />
                                                            <span>Write Verified Review</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">
                                                            Review unlocks upon delivery
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            {ratingModal && (
                <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />
            )}

            {/* Invoice Modal */}
            <InvoiceModal
                order={order}
                isOpen={showInvoice}
                onClose={() => setShowInvoice(false)}
            />
        </div>
    );
};

export default OrderItem;
