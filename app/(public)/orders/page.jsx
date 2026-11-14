'use client'

import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import Loading from "@/components/Loading";
import { orderDummyData } from "@/assets/assets";
import { BagIcon, SearchIcon, SparklesIcon, TruckIcon, LockIcon } from "@/components/icons";
import { isClientSignedIn, requireSignIn } from "@/lib/clientAuth";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSignedIn, setIsSignedIn] = useState(true);

    const fetchOrders = async () => {
        if (!isClientSignedIn()) {
            setIsSignedIn(false);
            setLoading(false);
            return;
        }
        setIsSignedIn(true);

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
                setOrders(uniqueOrders);
            } else {
                setOrders(fetchedOrders);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
            if (typeof window !== 'undefined') {
                const localOrders = JSON.parse(localStorage.getItem('ukbl_orders') || '[]');
                setOrders(localOrders);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const handleAuth = () => fetchOrders();
        const handleOrdersUpdated = () => fetchOrders();
        window.addEventListener('auth-change', handleAuth);
        window.addEventListener('orders-updated', handleOrdersUpdated);
        return () => {
            window.removeEventListener('auth-change', handleAuth);
            window.removeEventListener('orders-updated', handleOrdersUpdated);
        };
    }, []);

    const filteredOrders = orders.filter(order => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const orderNum = (order.orderNumber || order.id || "").toLowerCase();
        const customerName = (order.address?.fullName || order.user?.name || "").toLowerCase();
        const customerPhone = (order.address?.phoneNumber || order.address?.phone || "").toLowerCase();
        return orderNum.includes(q) || customerName.includes(q) || customerPhone.includes(q);
    });

    if (!isSignedIn) {
        return (
            <div className="min-h-[75vh] mx-4 sm:mx-6 flex items-center justify-center py-16">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-12 text-center border border-[#EFE0EF] bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-xl"
                >
                    <div className="size-16 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-4 shadow-2xs">
                        <LockIcon size={28} color="#6C306E" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#241224]">Sign In Required</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                        Please sign in to view your authentic UK beauty purchases and live courier parcel tracking.
                    </p>
                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => requireSignIn('Please sign in to view your orders.')}
                            className="w-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white py-3.5 rounded-full text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Sign In / Register
                        </button>
                        <Link
                            href="/shop"
                            className="text-xs font-bold text-[#6C306E] hover:underline"
                        >
                            Browse UK Collections ➔
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[75vh] mx-4 sm:mx-6 text-slate-800">
            <div className="my-10 max-w-7xl mx-auto">
                <PageTitle
                    heading="My Orders & Live Tracking"
                    text="Track your authentic UK imported beauty packages in real-time"
                    linkText="Continue Shopping"
                />

                {/* Tracking Search Bar */}
                <div className="mt-3 mb-5 max-w-md">
                    <div className="relative">
                        <SearchIcon size={13} color="#6C306E" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Track by Order # or phone number..."
                            className="w-full h-8 bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-full pl-8 pr-3 text-[11px] outline-none shadow-2xs text-[#241224] placeholder:text-[#8A758A]"
                        />
                    </div>
                </div>

                {loading ? (
                    <Loading message="Connecting to UK Brand Lover tracking network..." />
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
