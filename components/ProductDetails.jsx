'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { 
    BagIcon, 
    CheckIcon, 
    LockIcon, 
    ShieldCheckIcon, 
    StarIcon, 
    TagIcon, 
    TruckIcon, 
    WhatsAppIcon 
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
        dispatch(addToCart({ productId }));
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1400);
        window.dispatchEvent(new CustomEvent('cart-bump'));
        toast.success(`${product.name} added to your bag!`);
    };

    const buyNowHandler = () => {
        if (!cart[productId]) {
            dispatch(addToCart({ productId }));
            window.dispatchEvent(new CustomEvent('cart-bump'));
        }
        router.push('/cart');
    };

    const whatsappOrderUrl = `https://wa.me/8801959524393?text=${encodeURIComponent(
        `Hello UK Brand Lover! I would like to order: ${product.name} (Price: ${currency}${product.price}). Please confirm stock and delivery.`
    )}`;

    const ratingList = product?.rating || [];
    const ratingCount = ratingList.length;
    const averageRating = ratingCount > 0 
        ? ratingList.reduce((acc, item) => acc + (item.rating || 0), 0) / ratingCount
        : 5;

    const discountPercentage = product?.mrp && product.mrp > product.price
        ? (((product.mrp - product.price) / product.mrp) * 100).toFixed(0)
        : 0;

    return (
        <div className="flex max-lg:flex-col gap-10 lg:gap-14 my-4">
            {/* Gallery Section */}
            <div className="flex max-sm:flex-col-reverse gap-3.5">
                {/* Thumbnails */}
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible no-scrollbar">
                    {product.images.map((image, index) => {
                        const isSelected = mainImage === image;
                        return (
                            <motion.button 
                                key={index} 
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setMainImage(image)} 
                                className={`bg-[#FAF6FA] border overflow-hidden size-18 sm:size-20 rounded-2xl cursor-pointer transition-all duration-200 p-1.5 ${
                                    isSelected 
                                        ? 'border-[#6C306E] shadow-sm ring-2 ring-[#6C306E]/15' 
                                        : 'border-[#EFE0EF] hover:border-[#6C306E]/40'
                                }`}
                            >
                                <Image src={image} className="w-full h-full object-contain mix-blend-multiply" alt="" width={80} height={80} />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Main Image Showcase with Smooth Switch */}
                <div className="relative aspect-square w-full sm:size-112 md:size-120 bg-[#FAF6FA] rounded-3xl border border-[#EFE0EF] overflow-hidden flex items-center justify-center p-6 shadow-2xs">
                    {discountPercentage > 0 && (
                        <span className="absolute top-4 left-4 z-10 bg-[#6C306E] text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-xs">
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
                            className="w-full h-full flex items-center justify-center"
                        >
                            <Image 
                                src={mainImage} 
                                alt={product.name} 
                                width={500} 
                                height={500} 
                                className="w-full h-full object-contain mix-blend-multiply" 
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Product Meta & Actions */}
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full uppercase tracking-widest">
                        {product.category || 'Skincare'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                        In Stock • 100% Authentic UK
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#241224] leading-tight tracking-tight">
                    {product.name}
                </h1>
                
                {/* Rating Bar */}
                <div className='flex items-center mt-3 gap-2'>
                    <div className='flex items-center gap-0.5'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon 
                                key={index} 
                                size={15} 
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
                <div className="flex items-baseline my-5 gap-3">
                    <p className="text-3xl sm:text-4xl font-extrabold text-[#3A0C38]">
                        {currency}{product.price.toLocaleString()}
                    </p>
                    {product?.mrp && product.mrp > product.price && (
                        <p className="text-lg sm:text-xl text-slate-400 line-through">
                            {currency}{product.mrp.toLocaleString()}
                        </p>
                    )}
                </div>

                {discountPercentage > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3.5 py-2 rounded-2xl w-fit mb-5">
                        <TagIcon size={14} color="#6C306E" />
                        <p>Save {currency}{(product.mrp - product.price).toLocaleString()} ({discountPercentage}% OFF) today</p>
                    </div>
                )}

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {product.description}
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3 my-6">
                    {cart[productId] && (
                        <div className="flex flex-col gap-1.5 mr-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Qty</span>
                            <Counter productId={productId} />
                        </div>
                    )}

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} 
                        className={`inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 text-xs font-bold rounded-full transition-all duration-200 shadow-sm cursor-pointer ${
                            isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#6C306E] hover:bg-[#3A0C38] text-white shadow-[0_4px_16px_rgba(108,48,110,0.22)]'
                        }`}
                    >
                        {isAdded ? (
                            <>
                                <CheckIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
                                <span>Added to Bag!</span>
                            </>
                        ) : (
                            <>
                                <BagIcon size={16} color="#FFFFFF" />
                                <span>{!cart[productId] ? 'Add to Bag' : 'View Bag & Checkout'}</span>
                            </>
                        )}
                    </motion.button>

                    <MagneticButton>
                        <button 
                            type="button"
                            onClick={buyNowHandler} 
                            className="inline-flex items-center justify-center px-7 sm:px-9 py-3.5 text-xs font-bold text-[#6C306E] bg-white border border-[#6C306E] rounded-full hover:bg-[#FAF6FA] hover:border-[#3A0C38] transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer"
                        >
                            Buy Now
                        </button>
                    </MagneticButton>

                    {/* Instant WhatsApp Order CTA */}
                    <motion.a
                        href={whatsappOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-full transition-all shadow-2xs"
                    >
                        <WhatsAppIcon size={15} color="#059669" />
                        <span>Order via WhatsApp</span>
                    </motion.a>
                </div>

                <hr className="border-[#EFE0EF] my-6" />

                {/* Luxury Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]"> 
                        <ShieldCheckIcon size={18} color="#6C306E" accentColor="#D8B56D" className="shrink-0" /> 
                        <span className="text-[11px] leading-tight">100% Genuine UK Imported Product</span> 
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]"> 
                        <TruckIcon size={18} color="#6C306E" className="shrink-0" /> 
                        <span className="text-[11px] leading-tight">Fast Delivery Across Bangladesh</span> 
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]"> 
                        <LockIcon size={18} color="#6C306E" className="shrink-0" /> 
                        <span className="text-[11px] leading-tight">Cash on Delivery & bKash Verified</span> 
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
