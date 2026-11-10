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
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#EFE0EF] bg-white text-[#241224] text-xs font-bold shadow-[0_2px_8px_rgba(108,48,110,0.04)]">
            <motion.button 
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.82 }}
                onClick={removeFromCartHandler} 
                className="size-6 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] hover:bg-[#6C306E] hover:text-white hover:border-[#6C306E] hover:shadow-xs transition-all duration-200 cursor-pointer"
                aria-label="Decrease quantity"
            >
                <MinusIcon size={11} />
            </motion.button>

            <motion.span 
                key={count}
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="min-w-4 text-center font-extrabold text-xs text-[#241224]"
            >
                {count}
            </motion.span>

            <motion.button 
                type="button"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.82 }}
                onClick={addToCartHandler} 
                className="size-6 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] hover:bg-[#6C306E] hover:text-white hover:border-[#6C306E] hover:shadow-xs transition-all duration-200 cursor-pointer"
                aria-label="Increase quantity"
            >
                <PlusIcon size={11} />
            </motion.button>
        </div>
    );
};

export default Counter;
