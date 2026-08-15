'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, ShieldCheck, Truck, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { MagneticButton } from "@/components/ui/magnetic-button";

const ProductDetails = ({ product }) => {
    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images[0]);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
        toast.success(`${product.name} added to cart!`)
    }

    const buyNowHandler = () => {
        if (!cart[productId]) {
            dispatch(addToCart({ productId }))
        }
        router.push('/cart')
    }

    const ratingList = product?.rating || []
    const ratingCount = ratingList.length
    const averageRating = ratingCount > 0 
        ? ratingList.reduce((acc, item) => acc + (item.rating || 0), 0) / ratingCount
        : 5

    const discountPercentage = product?.mrp && product.mrp > product.price
        ? (((product.mrp - product.price) / product.mrp) * 100).toFixed(0)
        : 0

    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
                    {product.images.map((image, index) => (
                        <div 
                            key={index} 
                            onClick={() => setMainImage(product.images[index])} 
                            className={`bg-[#FAF6FA] border overflow-hidden size-20 rounded-2xl cursor-pointer transition ${mainImage === image ? 'border-[#6C306E] shadow-sm' : 'border-[#EFE0EF] hover:border-[#6C306E]/40'}`}
                        >
                            <Image src={image} className="w-full h-full object-cover" alt="" width={80} height={80} />
                        </div>
                    ))}
                </div>
                <div className="relative aspect-square w-full sm:size-112 bg-[#FAF6FA] rounded-3xl border border-[#EFE0EF] overflow-hidden flex items-center justify-center">
                    {discountPercentage > 0 && (
                        <span className="absolute top-4 left-4 z-10 bg-[#6C306E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                            {discountPercentage}% OFF
                        </span>
                    )}
                    <Image src={mainImage} alt={product.name} width={500} height={500} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full uppercase tracking-wider">
                        {product.category || 'Skincare'}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                        In Stock • Authentic UK Import
                    </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-[#241224] leading-tight">{product.name}</h1>
                
                <div className='flex items-center mt-3 gap-2'>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={16} className='text-transparent' fill={averageRating >= index + 1 ? "#6C306E" : "#E2E8F0"} />
                        ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{averageRating.toFixed(1)} ({ratingCount} Verified Reviews)</p>
                </div>

                <div className="flex items-baseline my-6 gap-3">
                    <p className="text-3xl font-bold text-[#3A0C38]">{currency}{product.price.toLocaleString()}</p>
                    {product?.mrp && product.mrp > product.price && (
                        <p className="text-xl text-slate-400 line-through">{currency}{product.mrp.toLocaleString()}</p>
                    )}
                </div>

                {discountPercentage > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-2 rounded-xl w-fit mb-6">
                        <TagIcon size={14} />
                        <p>Save {currency}{(product.mrp - product.price).toLocaleString()} ({discountPercentage}% OFF) right now</p>
                    </div>
                )}

                <p className="text-sm text-slate-600 leading-relaxed mb-8">
                    {product.description}
                </p>

                {/* Primary Action Row: Add to Cart + Buy Now with Magnetic Physics & White-to-Purple Diagonal Fill Effect */}
                <div className="flex flex-wrap items-end gap-3.5 my-8">
                    {cart[productId] && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-slate-700 font-bold uppercase tracking-wider">Quantity</p>
                            <Counter productId={productId} />
                        </div>
                    )}
                    <button 
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} 
                        className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-8 sm:px-10 py-3.5 text-sm font-bold rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                        {!cart[productId] ? 'Add to Cart' : 'View Shopping Cart'}
                    </button>
                    <MagneticButton>
                        <button 
                            onClick={buyNowHandler} 
                            className="relative inline-flex items-center justify-center px-8 sm:px-10 py-3.5 overflow-hidden font-bold text-sm transition-all bg-white hover:bg-white text-[#241224] rounded-full border border-[#6C306E] shadow-sm hover:shadow-md active:scale-95 group cursor-pointer"
                        >
                            <span className="w-56 h-56 rounded rotate-[-40deg] bg-[#6C306E] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-36 group-hover:translate-x-0 pointer-events-none"></span>
                            <span className="relative w-full text-center text-[#241224] transition-colors duration-300 ease-in-out group-hover:text-white">Buy Now</span>
                        </button>
                    </MagneticButton>
                </div>

                <hr className="border-[#EFE0EF] my-6" />

                <div className="flex flex-col gap-3 text-xs font-semibold text-slate-700">
                    <p className="flex items-center gap-2.5"> 
                        <ShieldCheck className="text-[#6C306E]" size={18} /> 
                        100% Authentic UK Imported Beauty Product Guaranteed 
                    </p>
                    <p className="flex items-center gap-2.5"> 
                        <Truck className="text-[#6C306E]" size={18} /> 
                        Fast Nationwide Shipping across Bangladesh 
                    </p>
                    <p className="flex items-center gap-2.5"> 
                        <LockKeyhole className="text-[#6C306E]" size={18} /> 
                        Cash on Delivery & bKash / Nagad Mobile Payments 
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails