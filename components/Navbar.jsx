'use client'

import { assets } from "@/assets/assets";
import { BagIcon, SearchIcon, UserIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const cartCount = useSelector(state => state.cart.total);

    // Scroll state for backdrop elevation
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cart bump animation on item added
    useEffect(() => {
        if (cartCount > 0) {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 380);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    useEffect(() => {
        const handleBump = () => {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 380);
            return () => clearTimeout(timer);
        };

        window.addEventListener('cart-bump', handleBump);
        return () => window.removeEventListener('cart-bump', handleBump);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <header
            className={`sticky top-0 z-40 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/90 backdrop-blur-md border-b border-[#EFE0EF]/90 shadow-[0_4px_24px_rgba(58,12,56,0.04)] py-2.5 sm:py-3'
                    : 'bg-white border-b border-[#EFE0EF] py-3.5 sm:py-4'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    {/* Brand Logo with Smooth Hover */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Image
                                src={assets.webLogo}
                                alt="UK Brand Lover Logo"
                                className="h-9 sm:h-11 w-auto object-contain"
                                priority
                            />
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs sm:text-[13px] text-[#4A304A] font-semibold tracking-wide">
                        <Link href="/" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <Link href="/shop" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                            Shop All
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <Link href="/shop?category=Skincare" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                            Skincare
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <Link href="/shop?category=Makeup" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                            Cosmetics
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <Link href="/contact" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                            Contact
                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                        </Link>
                    </nav>

                    {/* Actions: Search, Cart, Login */}
                    <div className="flex items-center gap-3 sm:gap-4.5">
                        {/* Smooth Expanding Search Bar */}
                        <form
                            onSubmit={handleSearch}
                            className={`hidden sm:flex items-center text-xs gap-2 px-3.5 py-2 rounded-full border transition-all duration-300 ${
                                isSearchFocused
                                    ? 'w-60 lg:w-72 bg-white border-[#6C306E] shadow-[0_0_0_3px_rgba(108,48,110,0.08)]'
                                    : 'w-44 lg:w-56 bg-[#FAF6FA] border-[#EFE0EF] hover:border-[#6C306E]/40'
                            }`}
                        >
                            <SearchIcon size={16} color="#6C306E" className="shrink-0 transition-transform group-focus-within:scale-110" />
                            <input
                                className="w-full bg-transparent outline-none placeholder-[#8A758A] text-[#241224] text-xs font-medium"
                                type="text"
                                placeholder="Search UK beauty..."
                                value={search}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        {/* Luxury Cart Button with Spring Reaction */}
                        <Link
                            id="navbar-cart-icon"
                            href="/cart"
                            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all duration-300 select-none ${
                                isCartBumping
                                    ? 'bg-[#FAF6FA] border-[#6C306E] scale-105 shadow-sm'
                                    : 'bg-white border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA]/60'
                            }`}
                        >
                            <motion.div
                                animate={isCartBumping ? { rotate: [0, -12, 12, -6, 0], scale: [1, 1.18, 1] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                <BagIcon size={18} color="#6C306E" />
                            </motion.div>
                            <span className="hidden sm:inline text-xs font-semibold text-[#241224]">Bag</span>
                            
                            {/* Counter Badge */}
                            <motion.span
                                key={cartCount}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className={`text-[10px] font-bold text-white size-4.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                                    isCartBumping ? 'bg-[#3A0C38]' : 'bg-[#6C306E]'
                                }`}
                            >
                                {cartCount}
                            </motion.span>
                        </Link>

                        {/* Luxury Login / Account Button */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#6C306E] to-[#501D52] hover:from-[#501D52] hover:to-[#3A0C38] text-white text-xs font-bold rounded-full shadow-[0_2px_10px_rgba(108,48,110,0.18)] transition-all cursor-pointer"
                        >
                            <UserIcon size={14} color="#FFFFFF" />
                            <span>Sign In</span>
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Search Bar Row */}
                <div className="sm:hidden mt-2.5 pb-1">
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center text-xs gap-2 px-3.5 py-2 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] focus-within:border-[#6C306E] focus-within:bg-white transition-all shadow-2xs"
                    >
                        <SearchIcon size={15} color="#6C306E" className="shrink-0" />
                        <input
                            className="w-full bg-transparent outline-none placeholder-[#8A758A] text-[#241224] text-xs font-medium"
                            type="text"
                            placeholder="Search 100% authentic UK products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
