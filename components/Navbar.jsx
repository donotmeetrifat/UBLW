'use client'

import { assets } from "@/assets/assets";
import {
    BagIcon,
    SearchIcon,
    UserIcon,
    ChevronDownIcon,
    TruckIcon,
    StoreFrontIcon,
    DashboardIcon,
    RoyalCrownIcon,
    CloseIcon
} from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Navbar = () => {
    const router = useRouter();
    const dropdownRef = useRef(null);
    const [search, setSearch] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const cartCount = useSelector(state => state.cart.total);

    // Load user from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ukbl_current_user');
            if (saved) {
                try {
                    setCurrentUser(JSON.parse(saved));
                } catch (e) { }
            }
        }
    }, []);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll state for backdrop elevation
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
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

    const handleSignOut = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('ukbl_current_user');
        }
        setCurrentUser(null);
        setIsProfileOpen(false);
        toast.success('Signed out successfully.');
    };

    return (
        <>
            <header
                className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
                        ? 'bg-white/95 backdrop-blur-md border-b border-[#EFE0EF]/90 shadow-[0_4px_24px_rgba(58,12,56,0.04)] py-2.5 sm:py-3'
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
                        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] text-[#4A304A] font-semibold tracking-wide">
                            <Link href="/" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                                Home
                                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/shop" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                                Shop
                                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/contact" className="relative hover:text-[#6C306E] transition-colors py-1 group">
                                Contact
                                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C306E] rounded-full transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </nav>

                        {/* Actions: Search, Cart, Account - Uniform Height & Pixel-Perfect Alignment */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            {/* 1. Smooth Expanding Search Bar (h-10) */}
                            <form
                                onSubmit={handleSearch}
                                className={`hidden sm:flex items-center text-xs gap-2 px-3.5 h-10 rounded-full border transition-all duration-300 select-none ${isSearchFocused
                                        ? 'w-56 lg:w-68 bg-white border-[#6C306E] shadow-[0_0_0_3px_rgba(108,48,110,0.08)]'
                                        : 'w-44 lg:w-56 bg-[#FAF6FA] border-[#EFE0EF] hover:border-[#6C306E]/40'
                                    }`}
                            >
                                <SearchIcon size={16} color="#6C306E" className="shrink-0 transition-transform group-focus-within:scale-110" />
                                <input
                                    className="w-full bg-transparent outline-none placeholder-[#8A758A] text-[#241224] text-xs font-medium leading-none"
                                    type="text"
                                    placeholder="Search UK beauty..."
                                    value={search}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>

                            {/* 2. Luxury Cart Button (h-10) */}
                            <Link
                                id="navbar-cart-icon"
                                href="/cart"
                                className={`relative flex items-center justify-center gap-2 px-4 h-10 rounded-full border transition-all duration-300 select-none cursor-pointer ${isCartBumping
                                        ? 'bg-[#FAF6FA] border-[#6C306E] scale-105 shadow-sm'
                                        : 'bg-white border-[#EFE0EF] hover:border-[#6C306E]/40 hover:bg-[#FAF6FA]/80 shadow-2xs hover:shadow-xs'
                                    }`}
                            >
                                <motion.div
                                    animate={isCartBumping ? { rotate: [0, -12, 12, -6, 0], scale: [1, 1.18, 1] } : {}}
                                    transition={{ duration: 0.4 }}
                                    className="flex items-center justify-center"
                                >
                                    <BagIcon size={16} color="#6C306E" />
                                </motion.div>
                                <span className="hidden sm:inline text-xs font-bold text-[#241224] leading-none">Bag</span>

                                {/* Counter Badge */}
                                <motion.span
                                    key={cartCount}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className={`text-[10px] font-extrabold text-white size-5 rounded-full flex items-center justify-center transition-colors duration-200 leading-none shadow-2xs shrink-0 ${isCartBumping ? 'bg-[#3A0C38]' : 'bg-gradient-to-r from-[#6C306E] to-[#401242]'
                                        }`}
                                >
                                    {cartCount}
                                </motion.span>
                            </Link>

                            {/* 3. Luxury Account Area (h-10) */}
                            {currentUser ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center justify-center gap-2 px-3.5 h-10 rounded-full bg-[#FAF6FA] hover:bg-[#EFE0EF] border border-[#EFE0EF] transition-all cursor-pointer shadow-2xs select-none"
                                    >
                                        <div className="size-6.5 rounded-full bg-gradient-to-br from-[#6C306E] to-[#401242] text-white flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                                            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <span className="text-xs font-bold text-[#241224] hidden sm:inline max-w-[90px] truncate leading-none">
                                            {currentUser.name.split(' ')[0]}
                                        </span>
                                        <ChevronDownIcon size={13} color="#6C306E" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 bg-white border border-[#EFE0EF] rounded-2xl shadow-xl p-2 z-50 text-xs"
                                            >
                                                <div className="p-2.5 bg-[#FAF6FA] rounded-xl mb-1.5">
                                                    <p className="font-bold text-[#241224] truncate">{currentUser.name}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email || currentUser.phone}</p>
                                                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6C306E]/10 text-[#6C306E]">
                                                        {currentUser.role || 'Customer'}
                                                    </span>
                                                </div>

                                                <Link
                                                    href="/orders"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] transition font-medium"
                                                >
                                                    <TruckIcon size={14} color="#6C306E" />
                                                    <span>My Orders & Tracking</span>
                                                </Link>

                                                <Link
                                                    href="/store/orders"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] transition font-medium"
                                                >
                                                    <StoreFrontIcon size={14} color="#6C306E" />
                                                    <span>Store & Seller Orders</span>
                                                </Link>

                                                <Link
                                                    href="/admin"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] transition font-medium"
                                                >
                                                    <DashboardIcon size={14} color="#6C306E" />
                                                    <span>Admin Dashboard</span>
                                                </Link>

                                                <div className="border-t border-[#EFE0EF] my-1" />

                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full text-left p-2 rounded-xl text-red-600 hover:bg-red-50 transition font-bold cursor-pointer flex items-center gap-2"
                                                >
                                                    <span>Sign Out</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-5 h-10 bg-gradient-to-r from-[#4A154A] via-[#632266] to-[#380E38] hover:from-[#581F5A] hover:to-[#451245] text-white text-xs font-bold rounded-full border border-[#D8B56D]/50 hover:border-[#F2D086] shadow-[0_4px_16px_rgba(108,48,110,0.3)] hover:shadow-[0_8px_24px_rgba(216,181,109,0.4)] hover:scale-[1.03] active:scale-[0.96] transition-all cursor-pointer shimmer-active select-none"
                                >
                                    <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <UserIcon size={14} color="#FCE4A6" />
                                    </div>
                                    <span className="tracking-wide leading-none">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar Row - Uniform Height & Alignment */}
                    <div className="sm:hidden mt-2.5 pb-1 flex items-center gap-2">
                        <form
                            onSubmit={handleSearch}
                            className="flex-1 flex items-center text-xs gap-2 px-3.5 h-10 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] focus-within:border-[#6C306E] focus-within:bg-white transition-all shadow-2xs"
                        >
                            <SearchIcon size={15} color="#6C306E" className="shrink-0" />
                            <input
                                className="w-full bg-transparent outline-none placeholder-[#8A758A] text-[#241224] text-xs font-medium leading-none"
                                type="text"
                                placeholder="Search 100% authentic UK products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        <Link
                            href="/orders"
                            className="size-10 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center hover:bg-[#EFE0EF] transition-colors shadow-2xs shrink-0"
                            aria-label="Track orders"
                        >
                            <TruckIcon size={16} color="#6C306E" />
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;
