'use client'

import React, { useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import RatingModal from "./RatingModal";
import InvoiceModal from "./InvoiceModal";
import toast from "react-hot-toast";
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
                                        unoptimized={true}
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

                            {/* 2. Parcel Delivery Progress Stepper (Clean, Premium Luxury Design) */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs space-y-4">
                                {/* Header Strip */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EFE0EF]/70">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-lg bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                                            <TruckIcon size={13} color="#6C306E" />
                                        </div>
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6C306E]">
                                            Delivery Progress Timeline
                                        </span>
                                    </div>

                                    {currentStatus === 'DELIVERED' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            <CheckIcon size={10} color="#047857" strokeWidth={3} />
                                            <span>Safely Delivered</span>
                                        </span>
                                    ) : currentStatus === 'SHIPPED' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6C306E] border border-purple-200">
                                            <span className="relative flex size-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full size-2 bg-[#6C306E]"></span>
                                            </span>
                                            <span>In Transit With Courier</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FAF6FA] text-slate-700 border border-[#EFE0EF]">
                                            <span>Stage {activeIndex + 1} of 5 • {STAGES[activeIndex]?.label}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Stepper with Mathematical Precision Horizontal Progress Rail */}
                                <div className="grid grid-cols-5 text-center relative py-2">
                                    {STAGES.map((stage, idx) => {
                                        const isStepDone = idx < activeIndex || (idx === activeIndex && currentStatus === 'DELIVERED');
                                        const isStepCurrent = idx === activeIndex && currentStatus !== 'DELIVERED';
                                        
                                        // Left connector line (from left edge of this column to outer edge of circle)
                                        const isLeftConnectorActive = idx <= activeIndex && idx > 0;
                                        // Right connector line (from outer edge of circle to right edge of this column)
                                        const isRightConnectorActive = idx < activeIndex;

                                        return (
                                            <div key={stage.key} className="flex flex-col items-center relative">
                                                {/* Left Connector Line (Only between columns: terminates at circle perimeter) */}
                                                {idx > 0 && (
                                                    <div 
                                                        className={`absolute top-4 left-0 right-[calc(50%+16px)] h-[3px] -translate-y-1/2 transition-colors duration-500 rounded-l-full ${
                                                            isLeftConnectorActive ? 'bg-[#6C306E]' : 'bg-[#F0E6F0]'
                                                        }`} 
                                                    />
                                                )}

                                                {/* Right Connector Line (Only between columns: begins at circle perimeter) */}
                                                {idx < STAGES.length - 1 && (
                                                    <div 
                                                        className={`absolute top-4 left-[calc(50%+16px)] right-0 h-[3px] -translate-y-1/2 transition-colors duration-500 rounded-r-full ${
                                                            isRightConnectorActive ? 'bg-[#6C306E]' : 'bg-[#F0E6F0]'
                                                        }`} 
                                                    />
                                                )}

                                                {/* Node Circle (size 32px, height 32px, vertical center exactly at top-4 = 16px) */}
                                                <div 
                                                    className={`size-8 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                                                        isStepDone
                                                            ? 'bg-gradient-to-tr from-[#6C306E] to-[#9956A1] text-white shadow-xs ring-4 ring-white'
                                                            : isStepCurrent
                                                            ? 'bg-white border-2 border-[#6C306E] text-[#6C306E] shadow-sm ring-4 ring-[#6C306E]/15'
                                                            : 'bg-white border-2 border-[#E9DFE9] text-slate-300 ring-4 ring-white'
                                                    }`}
                                                >
                                                    {isStepDone ? (
                                                        <CheckIcon size={13} color="#FFFFFF" strokeWidth={2.75} />
                                                    ) : isStepCurrent ? (
                                                        <span className="size-2.5 rounded-full bg-gradient-to-tr from-[#6C306E] to-[#9956A1] animate-pulse" />
                                                    ) : (
                                                        <span className="size-1.5 rounded-full bg-slate-300" />
                                                    )}
                                                </div>

                                                {/* Label & Description */}
                                                <p className={`text-[11px] font-extrabold mt-2.5 truncate w-full transition-colors ${
                                                    isStepCurrent
                                                        ? 'text-[#3A0C38]'
                                                        : isStepDone
                                                        ? 'text-[#6C306E]'
                                                        : 'text-slate-400'
                                                }`}>
                                                    {stage.label}
                                                </p>
                                                <span className="text-[9.5px] font-medium text-slate-400 hidden sm:block mt-0.5">
                                                    {stage.desc}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Courier & Consignment Tracking Strip */}
                                {order.consignmentId && (
                                    <div className="pt-3 border-t border-[#EFE0EF]/70 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                Courier Tracking:
                                            </span>
                                            <span className="font-mono text-xs font-black text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2.5 py-0.5 rounded-lg">
                                                {order.consignmentId}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                ({order.courierName || 'Steadfast Courier'})
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof navigator !== 'undefined') {
                                                    navigator.clipboard.writeText(order.consignmentId);
                                                    toast.success(`Tracking code "${order.consignmentId}" copied!`);
                                                }
                                            }}
                                            className="text-[11px] font-bold text-[#6C306E] hover:text-[#531E55] bg-[#FAF6FA] hover:bg-[#F5EAF5] border border-[#EFE0EF] px-3 py-1 rounded-full transition cursor-pointer shadow-2xs"
                                        >
                                            Copy Tracking Code
                                        </button>
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
                                        const prodName = item.name || productObj.name || 'UK Beauty Product';
                                        const prodId = item.productId || productObj.id || item.id;
                                        const prodImage = item.image || (Array.isArray(productObj.images) && productObj.images[0]) || productObj.image || '/product_img1.png';
                                        const existingReview = ratings.find(r => (r.orderId === order.id || !r.orderId) && (r.productId === prodId || r.product?.id === prodId));

                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] text-xs">
                                                <div className="min-w-0 flex-1 pr-3 flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-white border border-[#EFE0EF] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                                        <Image
                                                            src={prodImage}
                                                            alt={prodName}
                                                            width={36}
                                                            height={36}
                                                            unoptimized={true}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-[#241224] truncate">{prodName}</p>
                                                        <p className="text-[11px] text-slate-500">
                                                            {currency}{Number(item.price || 0).toLocaleString()} × {item.quantity || 1}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="shrink-0">
                                                    {existingReview ? (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-[11px] font-bold">
                                                            <Rating value={existingReview.rating} />
                                                            <span>Reviewed</span>
                                                        </div>
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
