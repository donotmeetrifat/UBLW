'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart, sanitizeCartWithProducts } from "@/lib/features/cart/cartSlice";
import { BagIcon, TrashIcon, SparklesIcon, ArrowRightIcon, LockIcon, CheckIcon } from "@/components/icons";
import { isClientSignedIn, requireSignIn } from "@/lib/clientAuth";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Luxury Bespoke Checkbox Component
const LuxuryCheckbox = ({ checked, onChange, ariaLabel = "Select item" }) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={(e) => {
            e.stopPropagation();
            onChange(!checked);
        }}
        className={`size-5 sm:size-5.5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#6C306E]/30 ${
            checked
                ? 'bg-[#6C306E] border-[#6C306E] text-white shadow-xs'
                : 'bg-white border-[#D8C5D8] hover:border-[#6C306E] text-transparent'
        }`}
    >
        {checked && <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.75} />}
    </button>
);

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const isProductsLoaded = useSelector(state => state.product.isLoaded);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const verifyAuth = () => {
            const signedIn = isClientSignedIn();
            setIsSignedIn(signedIn);
            setIsCheckingAuth(false);
            if (!signedIn) {
                requireSignIn('Please sign in to access your shopping bag.');
            }
        };

        verifyAuth();
        window.addEventListener('auth-change', verifyAuth);
        return () => window.removeEventListener('auth-change', verifyAuth);
    }, []);

    // Build cartArray, maintain selected product IDs, and prune deleted/orphan products
    useEffect(() => {
        const list = [];
        const allProducts = Array.isArray(products) ? products : [];

        for (const [key, value] of Object.entries(cartItems || {})) {
            const product = allProducts.find(p => p.id === key);
            if (product && value > 0) {
                list.push({
                    ...product,
                    quantity: value,
                });
            }
        }
        setCartArray(list);

        // Selection initialization: default to all selected on initial load
        setSelectedIds(prev => {
            const validIds = list.map(item => item.id);
            if (!hasInitializedSelection) {
                setHasInitializedSelection(true);
                return validIds;
            }
            // Retain user's current selections that still exist in cart
            return prev.filter(id => validIds.includes(id));
        });

        // Reconcile and prune any orphan/deleted products from Redux cart
        if (isProductsLoaded && cartItems && typeof cartItems === 'object') {
            const validKeys = new Set(allProducts.map(p => p.id));
            let hasOrphans = false;
            for (const [key] of Object.entries(cartItems)) {
                if (!validKeys.has(key)) {
                    hasOrphans = true;
                    break;
                }
            }
            if (hasOrphans || (allProducts.length === 0 && Object.keys(cartItems).length > 0)) {
                dispatch(sanitizeCartWithProducts(allProducts));
            }
        }
    }, [cartItems, products, isProductsLoaded, hasInitializedSelection, dispatch]);

    const handleDeleteItemFromCart = (productId) => {
        setSelectedIds(prev => prev.filter(id => id !== productId));
        dispatch(deleteItemFromCart({ productId }));
    };

    // Selected items computation
    const selectedItems = cartArray.filter(item => selectedIds.includes(item.id));
    const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedTotalUnits = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    const isAllSelected = cartArray.length > 0 && selectedItems.length === cartArray.length;
    const isSomeSelected = selectedItems.length > 0 && selectedItems.length < cartArray.length;

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartArray.map(item => item.id));
        }
    };

    const handleToggleItem = (productId) => {
        setSelectedIds(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId) 
                : [...prev, productId]
        );
    };

    // Unauthenticated visitors must sign in before managing bag
    if (!isCheckingAuth && !isSignedIn) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center py-16"
            >
                <div className="size-20 bg-[#FAF6FA] border border-[#EFE0EF] rounded-full flex items-center justify-center text-[#6C306E] mb-4 shadow-2xs">
                    <LockIcon size={32} color="#6C306E" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224]">Sign In Required</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-sm font-normal">
                    You must be signed in to add products to your shopping bag, save your selections, and complete orders.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => requireSignIn('Please sign in to access your shopping bag.')}
                        className="group relative overflow-hidden inline-flex items-center gap-2.5 bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white px-8 py-3.5 rounded-full text-xs font-bold transition-all duration-300 shadow-[0_8px_24px_-4px_rgba(108,48,110,0.45)] hover:shadow-[0_14px_34px_-2px_rgba(108,48,110,0.65)] hover:-translate-y-0.5 active:scale-95 cursor-pointer shimmer-active border border-white/20"
                    >
                        <span className="tracking-wide">Sign In to Continue</span>
                        <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </button>
                    <Link 
                        href="/shop" 
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#6C306E] hover:underline px-4 py-3"
                    >
                        <span>Explore UK Products</span>
                    </Link>
                </div>
            </motion.div>
        );
    }

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-4 sm:mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                {/* Title */}
                <PageTitle 
                    heading="Shopping Bag" 
                    text={
                        cartArray.length === 1
                            ? '1 authentic UK product in your bag'
                            : `${cartArray.length} authentic UK products in your bag` +
                              (selectedItems.length < cartArray.length
                                  ? ` (${selectedItems.length} selected for purchase)`
                                  : '')
                    } 
                    linkText="Continue Shopping" 
                />

                {/* Top Selection Control Bar */}
                <div className="flex items-center justify-between bg-white border border-[#EFE0EF] rounded-2xl p-3 sm:p-4 mt-4 mb-2 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <LuxuryCheckbox 
                            checked={isAllSelected} 
                            onChange={handleToggleSelectAll} 
                            ariaLabel="Select all products in bag" 
                        />
                        <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="text-xs sm:text-sm font-bold text-[#241224] hover:text-[#6C306E] cursor-pointer flex items-center gap-1.5"
                        >
                            <span>Select All</span>
                            <span className="text-slate-400 font-normal">({cartArray.length} items)</span>
                        </button>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-xs text-[#6C306E] font-semibold hidden sm:inline">
                            {selectedItems.length} of {cartArray.length} items selected for checkout
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {selectedItems.length < cartArray.length && (
                            <button
                                type="button"
                                onClick={() => setSelectedIds(cartArray.map(i => i.id))}
                                className="text-xs font-bold text-[#6C306E] hover:underline cursor-pointer px-2 py-1"
                            >
                                Select All
                            </button>
                        )}
                        {selectedItems.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer px-2 py-1"
                            >
                                Deselect All
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between gap-8 max-lg:flex-col mt-4">
                    <div className="w-full max-w-4xl overflow-x-auto">
                        <table className="w-full text-slate-600 text-sm">
                            <thead>
                                <tr className="border-b border-[#EFE0EF] text-xs uppercase tracking-wider text-[#7B667B] font-bold">
                                    <th className="text-left pb-4 pl-1 w-10">
                                        <span className="sr-only">Select</span>
                                    </th>
                                    <th className="text-left pb-4">Product Details</th>
                                    <th className="pb-4 text-center">Quantity</th>
                                    <th className="pb-4 text-right">Subtotal</th>
                                    <th className="pb-4 text-center max-md:hidden">Remove</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]/60">
                                <AnimatePresence>
                                    {cartArray.map((item, index) => {
                                        const isSelected = selectedIds.includes(item.id);
                                        return (
                                            <motion.tr 
                                                key={item.id || index}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
                                                className={`group transition-all duration-200 ${
                                                    !isSelected ? 'opacity-65 hover:opacity-95 bg-[#FAF6FA]/30' : ''
                                                }`}
                                            >
                                                {/* Selection Checkbox */}
                                                <td className="py-4 pl-1 pr-2 align-middle">
                                                    <LuxuryCheckbox
                                                        checked={isSelected}
                                                        onChange={() => handleToggleItem(item.id)}
                                                        ariaLabel={`Select ${item.name} for purchase`}
                                                    />
                                                </td>

                                                {/* Product Details */}
                                                <td className="py-4">
                                                    <div className="flex gap-4 items-center">
                                                        <div 
                                                            onClick={() => handleToggleItem(item.id)}
                                                            className="cursor-pointer flex items-center justify-center bg-white border border-[#EFE0EF] size-20 sm:size-24 rounded-2xl shrink-0 overflow-hidden shadow-2xs relative"
                                                            title={isSelected ? "Click to deselect" : "Click to select"}
                                                        >
                                                            <Image 
                                                                src={item.images[0]} 
                                                                className="w-full h-full object-cover" 
                                                                alt={item.name} 
                                                                width={96} 
                                                                height={96} 
                                                                unoptimized={true}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Link href={`/product/${item.id}`} className="font-bold text-[#241224] text-xs sm:text-sm hover:text-[#6C306E] transition line-clamp-1">
                                                                {item.name}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2 py-0.5 rounded-full inline-block uppercase">
                                                                    {item.category}
                                                                </span>
                                                                {!isSelected && (
                                                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-block">
                                                                        Not Selected
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium mt-1">
                                                                Unit Price: <span className="text-[#3A0C38] font-bold">{currency}{item.price.toLocaleString()}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Quantity Counter */}
                                                <td className="py-4 text-center">
                                                    <div className="inline-flex justify-center">
                                                        <Counter productId={item.id} />
                                                    </div>
                                                </td>

                                                {/* Subtotal */}
                                                <td className="py-4 text-right">
                                                    <div className={`font-extrabold text-sm sm:text-base ${
                                                        isSelected ? 'text-[#3A0C38]' : 'text-slate-400 line-through'
                                                    }`}>
                                                        {currency}{(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                    {!isSelected && (
                                                        <span className="text-[10px] text-slate-400 font-medium block">
                                                            (excluded)
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Remove Trash Button */}
                                                <td className="py-4 text-center max-md:hidden">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.15, rotate: 6 }}
                                                        whileTap={{ scale: 0.88 }}
                                                        onClick={() => handleDeleteItemFromCart(item.id)} 
                                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 hover:shadow-[0_2px_10px_rgba(239,68,68,0.2)] p-2.5 rounded-full transition-all duration-200 cursor-pointer"
                                                        title="Remove item"
                                                    >
                                                        <TrashIcon size={16} color="currentColor" />
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary with Live Selected Products Calculation */}
                    <OrderSummary 
                        totalPrice={selectedTotalPrice} 
                        items={selectedItems} 
                        allCartItems={cartArray}
                        selectedCount={selectedItems.length}
                        selectedQuantity={selectedTotalUnits}
                    />
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
                className="group relative overflow-hidden mt-6 inline-flex items-center gap-2.5 bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white px-9 py-4 rounded-full text-xs font-bold transition-all duration-300 shadow-[0_8px_24px_-4px_rgba(108,48,110,0.45)] hover:shadow-[0_14px_34px_-2px_rgba(108,48,110,0.65)] hover:-translate-y-0.5 active:scale-95 shimmer-active border border-white/20"
            >
                <span className="tracking-wide">Browse UK Collections</span>
                <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
        </motion.div>
    );
}
