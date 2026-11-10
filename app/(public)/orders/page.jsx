'use client'

import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { orderDummyData } from "@/assets/assets";
import { BagIcon, SearchIcon, SparklesIcon, TruckIcon } from "@/components/icons";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();

            let fetchedOrders = data.success && Array.isArray(data.orders) ? data.orders : [];

            // Merge with local orders placed during current session
            if (typeof window !== 'undefined') {
                const localOrders = JSON.parse(localStorage.getItem('ukbl_orders') || '[]');
                const combined = [...localOrders, ...fetchedOrders];
                // Remove duplicates by orderNumber or id
                const uniqueOrders = Array.from(
                    new Map(combined.map(item => [item.orderNumber || item.id, item])).values()
                );
                setOrders(uniqueOrders.length > 0 ? uniqueOrders : orderDummyData);
            } else {
                setOrders(fetchedOrders.length > 0 ? fetchedOrders : orderDummyData);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
            if (typeof window !== 'undefined') {
                const localOrders = JSON.parse(localStorage.getItem('ukbl_orders') || '[]');
                setOrders(localOrders.length > 0 ? localOrders : orderDummyData);
            } else {
                setOrders(orderDummyData);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const orderNum = (order.orderNumber || order.id || "").toLowerCase();
        const customerName = (order.address?.fullName || order.user?.name || "").toLowerCase();
        const customerPhone = (order.address?.phoneNumber || order.address?.phone || "").toLowerCase();
        return orderNum.includes(q) || customerName.includes(q) || customerPhone.includes(q);
    });

    return (
        <div className="min-h-[75vh] mx-4 sm:mx-6 text-slate-800">
            <div className="my-10 max-w-7xl mx-auto">
                <PageTitle
                    heading="My Orders & Live Tracking"
                    text="Track your authentic UK imported beauty packages in real-time"
                    linkText="Continue Shopping"
                />

                {/* Tracking Search Bar */}
                <div className="mt-6 mb-8 max-w-xl">
                    <div className="relative">
                        <SearchIcon size={16} color="#6C306E" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Track by Order # (e.g. UKBL-2026-1001) or phone number..."
                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-full pl-11 pr-5 py-3 text-xs outline-none shadow-2xs text-[#241224]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="size-8 border-2 border-[#6C306E] border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs">Connecting to UK Brand Lover tracking network...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <OrderItem order={order} key={order.orderNumber || order.id} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-16 text-center border border-dashed border-[#EFE0EF] bg-[#FAF6FA] rounded-3xl p-8 max-w-lg mx-auto"
                    >
                        <div className="size-16 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-3 shadow-2xs">
                            <TruckIcon size={26} color="#6C306E" />
                        </div>
                        <h3 className="text-lg font-extrabold text-[#241224]">No Orders Found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                            {searchQuery ? "No orders matched your search criteria." : "You have not placed any orders with UK Brand Lover yet."}
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 mt-5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs"
                        >
                            <span>Explore Authentic UK Beauty</span>
                            <SparklesIcon size={14} color="#FFFFFF" />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
