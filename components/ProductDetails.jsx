'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { isClientSignedIn, requireSignIn } from "@/lib/clientAuth";
import { 
    BagIcon, 
    CheckIcon, 
    LockIcon, 
    ShieldCheckIcon, 
    StarIcon, 
    TagIcon, 
    TruckIcon 
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetails = ({ product }) => {
    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [isAdded, setIsAdded] = useState(false);

    const addToCartHandler = () => {
        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add products to your shopping bag.');
            return;
        }
        dispatch(addToCart({ productId }));
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1400);
        window.dispatchEvent(new CustomEvent('cart-bump'));
        toast.success(`${product.name} added to your bag!`);
    };

    const buyNowHandler = () => {
        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to order products.');
            return;
        }
        if (!cart[productId]) {
            dispatch(addToCart({ productId }));
            window.dispatchEvent(new CustomEvent('cart-bump'));
        }
        router.push('/cart');
    };

    const ratingList = product?.rating || [];
    const ratingCount = ratingList.length;
    const averageRating = ratingCount > 0 
        ? ratingList.reduce((acc, item) => acc + (item.rating || 0), 0) / ratingCount
        : 5;

    const discountPercentage = product?.mrp && product.mrp > product.price
        ? (((product.mrp - product.price) / product.mrp) * 100).toFixed(0)
        : 0;

    return (
        <div className="flex max-lg:flex-col gap-10 lg:gap-16 xl:gap-20 my-6 sm:my-10 lg:my-12">
            {/* Gallery Section */}
            <div className="flex max-sm:flex-col-reverse gap-4 sm:gap-5 lg:sticky lg:top-24 self-start">
                {/* Thumbnails */}
                <div className="flex sm:flex-col gap-3.5 overflow-x-auto sm:overflow-visible no-scrollbar">
                    {product.images.map((image, index) => {
                        const isSelected = mainImage === image;
                        return (
                            <motion.button 
                                key={index} 
                                type="button"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setMainImage(image)} 
                                className={`bg-white border overflow-hidden size-18 sm:size-20 lg:size-22 rounded-2xl cursor-pointer transition-all duration-200 p-0 ${
                                    isSelected 
                                        ? 'border-[#6C306E] shadow-sm ring-2 ring-[#6C306E]/15' 
                                        : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                                }`}
                            >
                                <Image src={image} className="w-full h-full object-cover" alt="" width={88} height={88} />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Main Image Showcase (100% 1:1 Square Box Full-Filled Edge to Edge) */}
                <div className="relative aspect-square w-full sm:w-[460px] md:w-[500px] lg:w-[520px] bg-white rounded-[32px] border border-[#EFE0EF] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    {discountPercentage > 0 && (
                        <span className="absolute top-5 left-5 z-10 bg-[#6C306E] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xs tracking-wider">
                            {discountPercentage}% OFF
                        </span>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={typeof mainImage === 'string' ? mainImage : mainImage?.src}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.25 }}
                            className="w-full h-full"
                        >
                            <Image 
                                src={mainImage} 
                                alt={product.name} 
                                width={540} 
                                height={540} 
                                className="w-full h-full object-cover" 
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Product Meta & Actions with Spacious Editorial Layout */}
            <div className="flex-1 max-w-2xl">
                {/* Category & Stock Tag */}
                <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                    <span className="text-[11px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3.5 py-1 rounded-full uppercase tracking-widest">
                        {product.category || 'Skincare'}
                    </span>
                    {product.inStock === false && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
                            Sold Out • Restocking Soon
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#241224] leading-[1.25] tracking-tight mb-4">
                    {product.name}
                </h1>
                
                {/* Rating Bar */}
                <div className='flex items-center gap-2.5 mb-6'>
                    <div className='flex items-center gap-0.5'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon 
                                key={index} 
                                size={16} 
                                filled={averageRating >= index + 1}
                                color="#D8B56D"
                                emptyColor="#E8DFE9"
                            />
                        ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                        {averageRating.toFixed(1)} <span className="text-slate-400">({ratingCount} Verified Reviews)</span>
                    </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3.5 mb-3">
                    <p className="text-3xl sm:text-4xl font-extrabold text-[#3A0C38] tracking-tight">
                        {currency}{product.price.toLocaleString()}
                    </p>
                    {product?.mrp && product.mrp > product.price && (
                        <p className="text-lg sm:text-xl text-slate-400 line-through font-normal">
                            {currency}{product.mrp.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Savings Pill */}
                {discountPercentage > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-4 py-2 rounded-2xl w-fit mb-6 shadow-2xs">
                        <TagIcon size={14} color="#6C306E" />
                        <p>Save {currency}{(product.mrp - product.price).toLocaleString()} ({discountPercentage}% OFF) today</p>
                    </div>
                )}

                {/* Product Formulation & Profile Overview Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-8 max-w-xl font-normal whitespace-pre-line">
                    {product.formulaProfile || product.description}
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-4 pt-2 pb-8">
                    {product.inStock === false ? (
                        <span className="px-6 h-11 sm:h-12 inline-flex items-center justify-center bg-slate-100 text-slate-500 rounded-full font-bold text-xs border border-slate-200 shadow-2xs">
                            Currently Out of Stock
                        </span>
                    ) : (
                        <>
                            {cart[productId] && (
                                <Counter productId={productId} className="h-11 sm:h-12" />
                            )}

                            {/* 1. ADD TO BAG: Velvet Imperial Plum with Gloss Sheen & Tilt Icon */}
                            <motion.button 
                                whileHover={{ scale: 1.025, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} 
                                className={`group relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 h-11 sm:h-12 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer border border-white/20 shimmer-active ${
                                    isAdded
                                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 text-white shadow-[0_8px_24px_rgba(5,150,105,0.45)]'
                                        : 'bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_-4px_rgba(108,48,110,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_14px_34px_-2px_rgba(108,48,110,0.7)]'
                                }`}
                            >
                                {isAdded ? (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        >
                                            <CheckIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                                        </motion.div>
                                        <span className="tracking-wide">Added to Bag!</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="group-hover:-translate-y-0.5 group-hover:-rotate-12 transition-transform duration-300">
                                            <BagIcon size={16} color="#FFFFFF" />
                                        </div>
                                        <span className="tracking-wide">{!cart[productId] ? 'Add to Bag' : 'View Bag & Checkout'}</span>
                                    </>
                                )}
                            </motion.button>

                            {/* 2. BUY NOW: Restored to original clean outline aesthetic with Magnetic Cursor Follow */}
                            <MagneticButton distance={0.38} radius={110} className="inline-flex items-center">
                                <motion.button 
                                    whileHover={{ scale: 1.025 }}
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={buyNowHandler} 
                                    className="inline-flex items-center justify-center px-7 sm:px-9 h-11 sm:h-12 text-xs font-bold text-[#6C306E] bg-white border border-[#6C306E] rounded-full hover:bg-[#FAF6FA] hover:border-[#3A0C38] transition-colors duration-200 shadow-2xs active:scale-95 cursor-pointer select-none"
                                >
                                    Buy Now
                                </motion.button>
                            </MagneticButton>
                        </>
                    )}
                </div>

                {/* Clean Divider Line */}
                <hr className="border-[#EFE0EF] mb-8" />

                {/* Luxury Trust Indicators - Clean, airy cards with generous padding */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#FAF6FA]/80 border border-[#EFE0EF] hover:bg-[#FAF6FA] transition-colors"> 
                        <div className="size-9 rounded-xl bg-white border border-[#EFE0EF] flex items-center justify-center shrink-0 shadow-2xs">
                            <ShieldCheckIcon size={18} color="#6C306E" accentColor="#D8B56D" /> 
                        </div>
                        <span className="text-[11px] font-semibold text-[#241224] leading-tight">100% Genuine UK Imported Product</span> 
                    </div>
                    <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#FAF6FA]/80 border border-[#EFE0EF] hover:bg-[#FAF6FA] transition-colors"> 
                        <div className="size-9 rounded-xl bg-white border border-[#EFE0EF] flex items-center justify-center shrink-0 shadow-2xs">
                            <TruckIcon size={18} color="#6C306E" /> 
                        </div>
                        <span className="text-[11px] font-semibold text-[#241224] leading-tight">Fast Delivery Across Bangladesh</span> 
                    </div>
                    <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#FAF6FA]/80 border border-[#EFE0EF] hover:bg-[#FAF6FA] transition-colors"> 
                        <div className="size-9 rounded-xl bg-white border border-[#EFE0EF] flex items-center justify-center shrink-0 shadow-2xs">
                            <LockIcon size={18} color="#6C306E" /> 
                        </div>
                        <span className="text-[11px] font-semibold text-[#241224] leading-tight">Cash on Delivery & bKash Verified</span> 
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
