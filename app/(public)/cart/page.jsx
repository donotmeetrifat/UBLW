'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { BagIcon, TrashIcon, SparklesIcon, ArrowRightIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const createCartArray = () => {
        let computedTotal = 0;
        const cartArray = [];
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(p => p.id === key);
            if (product && value > 0) {
                cartArray.push({
                    ...product,
                    quantity: value,
                });
                computedTotal += product.price * value;
            }
        }
        setTotalPrice(computedTotal);
        setCartArray(cartArray);
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-4 sm:mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                {/* Title */}
                <PageTitle heading="Shopping Bag" text={`${cartArray.length} authentic UK products in your bag`} linkText="Continue Shopping" />

                <div className="flex items-start justify-between gap-8 max-lg:flex-col mt-6">
                    <div className="w-full max-w-4xl overflow-x-auto">
                        <table className="w-full text-slate-600 text-sm">
                            <thead>
                                <tr className="border-b border-[#EFE0EF] text-xs uppercase tracking-wider text-[#7B667B] font-bold">
                                    <th className="text-left pb-4">Product Details</th>
                                    <th className="pb-4 text-center">Quantity</th>
                                    <th className="pb-4 text-right">Subtotal</th>
                                    <th className="pb-4 text-center max-md:hidden">Remove</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]/60">
                                <AnimatePresence>
                                    {cartArray.map((item, index) => (
                                        <motion.tr 
                                            key={item.id || index}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
                                            className="group"
                                        >
                                            <td className="py-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex items-center justify-center bg-white border border-[#EFE0EF] size-20 sm:size-24 rounded-2xl p-1.5 shrink-0 overflow-hidden shadow-2xs">
                                                        <Image 
                                                            src={item.images[0]} 
                                                            className="w-full h-full object-contain p-1" 
                                                            alt={item.name} 
                                                            width={96} 
                                                            height={96} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Link href={`/product/${item.id}`} className="font-bold text-[#241224] text-xs sm:text-sm hover:text-[#6C306E] transition line-clamp-1">
                                                            {item.name}
                                                        </Link>
                                                        <span className="text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2 py-0.5 rounded-full inline-block mt-1 uppercase">
                                                            {item.category}
                                                        </span>
                                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                                            Unit Price: <span className="text-[#3A0C38] font-bold">{currency}{item.price.toLocaleString()}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">
                                                <div className="inline-flex justify-center">
                                                    <Counter productId={item.id} />
                                                </div>
                                            </td>
                                            <td className="py-4 text-right font-extrabold text-[#3A0C38] text-sm sm:text-base">
                                                {currency}{(item.price * item.quantity).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-center max-md:hidden">
                                                <motion.button 
                                                    whileHover={{ scale: 1.15 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteItemFromCart(item.id)} 
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all cursor-pointer"
                                                    title="Remove item"
                                                >
                                                    <TrashIcon size={16} color="currentColor" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center py-16"
        >
            <div className="size-20 bg-[#FAF6FA] border border-[#EFE0EF] rounded-full flex items-center justify-center text-[#6C306E] mb-4 shadow-2xs">
                <BagIcon size={32} color="#6C306E" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224]">Your Shopping Bag is Empty</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-sm font-normal">
                You haven't added any authentic UK imported beauty or skincare products to your bag yet.
            </p>
            <Link 
                href="/shop" 
                className="mt-6 inline-flex items-center gap-2 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-8 py-3.5 rounded-full text-xs font-bold transition-all shadow-[0_4px_16px_rgba(108,48,110,0.25)] active:scale-95"
            >
                <span>Browse UK Collections</span>
                <ArrowRightIcon size={14} color="#FFFFFF" />
            </Link>
        </motion.div>
    )
}
