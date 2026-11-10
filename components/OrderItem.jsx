'use client'

import Image from "next/image";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import InvoiceModal from "./InvoiceModal";
import {
    SparklesIcon,
    CheckIcon,
    TruckIcon,
    ShieldCheckIcon,
    ClockIcon,
    BoxIcon,
    MobileBankingIcon,
    WhatsAppIcon
} from "@/components/icons";
import { motion } from "framer-motion";

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

    const { ratings } = useSelector(state => state.rating);

    const addrName = order?.address?.fullName || order?.address?.name || 'Valued Customer';
    const addrPhone = order?.address?.phoneNumber || order?.address?.phone || '';
    const addrStreet = order?.address?.address || order?.address?.street || '';
    const addrCity = order?.address?.city || '';
    const addrRegion = order?.address?.region || order?.address?.state || '';

    // Calculate current milestone index
    const currentStatus = (order.status || 'ORDER_PLACED').toUpperCase();
    const currentStageIndex = STAGES.findIndex(s => s.key === currentStatus);
    const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

    const orderNumber = order.orderNumber || order.id || 'UKBL-2026';
    const orderItems = order.orderItems || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#EFE0EF] rounded-3xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(58,12,56,0.03)]"
        >
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#EFE0EF]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <span className="font-mono font-extrabold text-[#6C306E] text-sm sm:text-base">
                            {orderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-[#3A0C38]">
                            {order.paymentMethod || 'COD'}
                        </span>
                        {order.paymentStatus === 'PAID' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckIcon size={10} color="#059669" />
                                PAID
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                        Placed on: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Total Amount</span>
                        <span className="text-lg sm:text-xl font-extrabold text-[#3A0C38]">
                            {currency}{Number(order.total || 0).toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={() => setShowInvoice(true)}
                        className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] hover:bg-[#EFE0EF] transition cursor-pointer"
                    >
                        Invoice
                    </button>
                </div>
            </div>

            {/* 5-Stage Live Tracking Stepper */}
            <div className="py-6 border-b border-[#EFE0EF]">
                <p className="text-[10px] font-extrabold text-[#6C306E] uppercase tracking-widest mb-4">
                    PARCEL DELIVERY PROGRESS
                </p>

                <div className="relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#EFE0EF] -z-0" />
                    <div
                        className="absolute top-4 left-6 h-0.5 bg-[#6C306E] transition-all duration-700 -z-0"
                        style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100 * 0.9}%` }}
                    />

                    {/* Step Nodes */}
                    <div className="grid grid-cols-5 gap-1 relative z-10 text-center">
                        {STAGES.map((stage, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;

                            return (
                                <div key={stage.key} className="flex flex-col items-center">
                                    <div
                                        className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            isCompleted
                                                ? 'bg-[#6C306E] text-white shadow-[0_2px_10px_rgba(108,48,110,0.3)] ring-4 ring-[#FAF6FA]'
                                                : 'bg-white border-2 border-slate-200 text-slate-400'
                                        }`}
                                    >
                                        {idx < activeIndex ? (
                                            <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />
                                        ) : (
                                            <span>{idx + 1}</span>
                                        )}
                                    </div>
                                    <p className={`text-[11px] font-bold mt-2 truncate w-full ${isCurrent ? 'text-[#3A0C38]' : isCompleted ? 'text-[#6C306E]' : 'text-slate-400'}`}>
                                        {stage.label}
                                    </p>
                                    <span className="text-[9px] text-slate-400 hidden sm:block">
                                        {stage.desc}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Logistics & Payment Meta Pill Row */}
                <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#FAF6FA]">
                    {order.consignmentId ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                            <TruckIcon size={14} color="#6C306E" />
                            <span className="font-semibold">{order.courierName || 'Steadfast Courier'}:</span>
                            <span className="font-mono font-bold">{order.consignmentId}</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                            <ClockIcon size={13} color="#B45309" />
                            <span>Courier consignment tracking number will appear upon dispatch</span>
                        </div>
                    )}

                    {order.transactionId && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                            <MobileBankingIcon size={14} color="#059669" />
                            <span className="font-semibold">TrxID:</span>
                            <span className="font-mono font-bold">{order.transactionId}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Ordered Products Breakdown */}
            <div className="py-5 divide-y divide-[#EFE0EF]/60">
                {orderItems.map((item, index) => {
                    const productObj = item.product || item;
                    const prodName = productObj.name || item.name || 'UK Beauty Product';
                    const prodImage = (productObj.images && productObj.images[0]) || item.image || '/product_img1.png';
                    const prodId = productObj.id || item.productId;

                    const existingReview = ratings.find(r => r.orderId === order.id && r.productId === prodId);

                    return (
                        <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="size-16 rounded-2xl bg-white border border-[#EFE0EF] flex items-center justify-center p-2 shrink-0">
                                    <Image
                                        src={prodImage}
                                        alt={prodName}
                                        width={48}
                                        height={48}
                                        className="max-h-12 w-auto object-contain"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-xs sm:text-sm text-[#241224] truncate">
                                        {prodName}
                                    </p>
                                    <p className="text-xs text-[#6C306E] font-bold mt-0.5">
                                        {currency}{Number(item.price || 0).toLocaleString()} × Qty: {item.quantity || 1}
                                    </p>

                                    {/* Review action */}
                                    <div className="mt-1">
                                        {existingReview ? (
                                            <Rating value={existingReview.rating} />
                                        ) : currentStatus === 'DELIVERED' ? (
                                            <button
                                                onClick={() => setRatingModal({ orderId: order.id, productId: prodId })}
                                                className="text-xs font-bold text-[#6C306E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <SparklesIcon size={12} color="#6C306E" />
                                                <span>Write Verified Review</span>
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-400">
                                                Review unlocks upon parcel delivery
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <span className="font-bold text-xs sm:text-sm text-[#241224]">
                                    {currency}{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recipient Address Details */}
            <div className="mt-4 pt-4 border-t border-[#EFE0EF] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-[#FAF6FA] p-3.5 rounded-2xl">
                <div>
                    <span className="font-bold text-[#241224]">{addrName}</span> • <span className="font-medium text-[#6C306E]">{addrPhone}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{addrStreet}, {addrCity}, {addrRegion}</p>
                </div>

                <a
                    href={`https://wa.me/8801959524393?text=Hi%20UK%20Brand%20Lover,%20inquiring%20about%20Order%20${orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition"
                >
                    <WhatsAppIcon size={13} color="#047857" />
                    <span>WhatsApp Support</span>
                </a>
            </div>

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
        </motion.div>
    );
};

export default OrderItem;
