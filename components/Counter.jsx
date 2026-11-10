'use client'

import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId }) => {
    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const count = cartItems[productId] || 0;

    const addToCartHandler = (e) => {
        e?.stopPropagation();
        dispatch(addToCart({ productId }));
        window.dispatchEvent(new CustomEvent('cart-bump'));
    };

    const removeFromCartHandler = (e) => {
        e?.stopPropagation();
        dispatch(removeFromCart({ productId }));
        window.dispatchEvent(new CustomEvent('cart-bump'));
    };

    return (
        <div className="inline-flex items-center gap-2.5 px-2.5 py-1 rounded-full border border-[#EFE0EF] bg-[#FAF6FA] text-[#241224] text-xs font-bold shadow-2xs">
            <motion.button 
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={removeFromCartHandler} 
                className="size-6 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] hover:bg-[#6C306E] hover:text-white transition cursor-pointer"
                aria-label="Decrease quantity"
            >
                <MinusIcon size={12} />
            </motion.button>

            <span className="min-w-4 text-center font-extrabold text-xs">
                {count}
            </span>

            <motion.button 
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={addToCartHandler} 
                className="size-6 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] hover:bg-[#6C306E] hover:text-white transition cursor-pointer"
                aria-label="Increase quantity"
            >
                <PlusIcon size={12} />
            </motion.button>
        </div>
    );
};

export default Counter;
