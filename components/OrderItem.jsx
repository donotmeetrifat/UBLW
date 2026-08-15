'use client'

import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);

    const addrName = order?.address?.fullName || order?.address?.name || 'Customer'
    const addrPhone = order?.address?.phoneNumber || order?.address?.phone || ''
    const addrStreet = order?.address?.address || order?.address?.street || ''
    const addrCity = order?.address?.city || ''
    const addrRegion = order?.address?.region || order?.address?.state || ''

    return (
        <>
            <tr className="text-sm">
                <td className="text-left py-4">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="size-20 bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center rounded-2xl shrink-0 p-2">
                                    <Image
                                        className="max-h-14 w-auto object-contain"
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-xs sm:text-sm">
                                    <p className="font-bold text-[#241224]">{item.product.name}</p>
                                    <p className="text-[#6C306E] font-semibold mt-0.5">
                                        {currency}{item.price.toLocaleString()} × Qty: {item.quantity}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Ordered on: {new Date(order.createdAt).toDateString()}</p>
                                    <div className="mt-1">
                                        {ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product.id })} className={`text-[#6C306E] font-semibold text-xs hover:underline transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }
                                    </div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center font-bold text-[#3A0C38] max-md:hidden text-base">
                    {currency}{order.total.toLocaleString()}
                </td>

                <td className="text-left text-xs max-md:hidden text-slate-600">
                    <p className="font-bold text-[#241224]">{addrName}</p>
                    <p>{addrPhone}</p>
                    <p className="mt-1 text-slate-500 max-w-xs">{addrStreet}, {addrCity}, {addrRegion}</p>
                </td>

                <td className="text-left space-y-2 text-xs max-md:hidden">
                    <div
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold uppercase text-[10px] tracking-wider ${
                            order.status === 'CONFIRMED' || order.status === 'confirmed'
                            ? 'text-amber-700 bg-amber-50 border border-amber-200'
                            : order.status === 'DELIVERED' || order.status === 'delivered'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : 'text-purple-700 bg-purple-50 border border-purple-200'
                        }`}
                    >
                        <DotIcon size={14} className="animate-pulse" />
                        {order.status.replace(/_/g, ' ').toLowerCase()}
                    </div>
                </td>
            </tr>

            {/* Mobile View */}
            <tr className="md:hidden">
                <td colSpan={4} className="py-2 text-xs">
                    <div className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl p-3">
                        <p className="font-bold text-[#241224]">{addrName} • {addrPhone}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{addrStreet}, {addrCity}, {addrRegion}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#EFE0EF]">
                            <span className="font-bold text-[#3A0C38]">Total: {currency}{order.total.toLocaleString()}</span>
                            <span className='px-3 py-0.5 rounded-full bg-[#6C306E] text-white text-[10px] font-bold uppercase'>
                                {order.status.replace(/_/g, ' ').toLowerCase()}
                            </span>
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-[#EFE0EF] w-full my-2" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem