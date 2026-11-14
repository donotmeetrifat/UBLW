'use client'

import { assets } from "@/assets/assets";
import {
    BagIcon,
    SearchIcon,
    UserIcon,
    ChevronDownIcon,
    TruckIcon,
    ReviewBadgeIcon,
    RoyalCrownIcon,
    CloseIcon,
    ShieldCheckIcon
} from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FlowButton } from "@/components/ui/flow-button";
import AccountModal from "@/components/AccountModal";
import { requireSignIn } from "@/lib/clientAuth";
import { sanitizeCartWithProducts } from "@/lib/features/cart/cartSlice";

const Navbar = () => {
    const router = useRouter();
    const dropdownRef = useRef(null);
    const [search, setSearch] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCartBumping, setIsCartBumping] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const cart = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const isProductsLoaded = useSelector(state => state.product.isLoaded);
    const dispatch = useDispatch();

    // Verify how many products really exist in the shopping bag
    const cartCount = useMemo(() => {
        if (!currentUser || !cart?.cartItems || typeof cart.cartItems !== 'object') {
            return 0;
        }

        // If the live product catalog has loaded, verify strictly against real existing products
        if (isProductsLoaded || (Array.isArray(products) && products.length > 0)) {
            const validProductIds = new Set((products || []).map(p => p.id));
            let verifiedTotal = 0;
            for (const [id, qty] of Object.entries(cart.cartItems)) {
                if (validProductIds.has(id) && typeof qty === 'number' && qty > 0) {
                    verifiedTotal += qty;
                }
            }
            return verifiedTotal;
        }

        return Math.max(0, cart.total || 0);
    }, [currentUser, cart, products, isProductsLoaded]);

    // Automatically reconcile Redux cart if deleted or nonexistent products are present
    useEffect(() => {
        if (isProductsLoaded && currentUser && cart?.cartItems) {
            const validProductIds = new Set((products || []).map(p => p.id));
            let hasOrphans = false;
            for (const [id] of Object.entries(cart.cartItems)) {
                if (!validProductIds.has(id)) {
                    hasOrphans = true;
                    break;
                }
            }
            if (hasOrphans || (products.length === 0 && (cart.total > 0 || Object.keys(cart.cartItems).length > 0))) {
                dispatch(sanitizeCartWithProducts(products));
            }
        }
    }, [isProductsLoaded, products, currentUser, cart, dispatch]);

    // Load user from localStorage & verify session
    useEffect(() => {
        const syncUser = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('ukbl_current_user');
                if (saved) {
                    try {
                        setCurrentUser(JSON.parse(saved));
                    } catch (e) {
                        setCurrentUser(null);
                    }
                } else {
                    setCurrentUser(null);
                }
            }
        };

        syncUser();

        // Restore session from cookie if localStorage was cleared or after email verification
        if (typeof window !== 'undefined' && (!localStorage.getItem('ukbl_current_user') || window.location.search.includes('verified=1'))) {
            fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user) {
                        localStorage.setItem('ukbl_current_user', JSON.stringify(data.user));
                        setCurrentUser(data.user);
                        if (window.location.search.includes('verified=1')) {
                            toast.success('Email verified successfully! Welcome to UK Brand Lover.');
                            const url = new URL(window.location.href);
                            url.searchParams.delete('verified');
                            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
                        }
                    }
                })
                .catch(() => {});
        }

        window.addEventListener('auth-change', syncUser);
        window.addEventListener('storage', syncUser);
        return () => {
            window.removeEventListener('auth-change', syncUser);
            window.removeEventListener('storage', syncUser);
        };
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

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
        } catch (e) {}

        if (typeof window !== 'undefined') {
            localStorage.removeItem('ukbl_current_user');
            window.dispatchEvent(new Event('auth-change'));
        }
        setCurrentUser(null);
        setIsProfileOpen(false);
        toast.success('Signed out successfully.');
        router.refresh();
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
                                        ? 'w-56 lg:w-68 bg-[#FAF6FA] border-[#6C306E] shadow-2xs'
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

                            {/* 2. Luxury Cart / Bag Button (Exact FlowButton Design & Animation) */}
                            <FlowButton
                                id="navbar-cart-icon"
                                text="Bag"
                                badge={currentUser ? cartCount : 0}
                                href={currentUser ? "/cart" : undefined}
                                onClick={(e) => {
                                    if (!currentUser) {
                                        if (e && e.preventDefault) e.preventDefault();
                                        requireSignIn('Please sign in to access your shopping bag.');
                                    }
                                }}
                                className={isCartBumping ? '!scale-105 !border-[#6C306E]' : ''}
                            />

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
                                                className="absolute right-0 mt-2 w-60 bg-white border border-[#EFE0EF] rounded-2xl shadow-xl p-2.5 z-50 text-xs"
                                            >
                                                {/* Customer Header */}
                                                <div className="p-3 bg-[#FAF6FA] rounded-xl mb-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-bold text-[#241224] truncate text-sm">{currentUser.name}</p>
                                                        {currentUser.role === 'ADMIN' && (
                                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#6C306E] text-white shrink-0">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email || currentUser.phone}</p>
                                                </div>

                                                <div className="space-y-1">
                                                    {/* Admin Portal Quick Link for Admins */}
                                                    {currentUser.role === 'ADMIN' && (
                                                        <Link
                                                            href="/admin"
                                                            onClick={() => setIsProfileOpen(false)}
                                                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6FA] text-[#6C306E] hover:bg-[#EFE0EF] transition font-bold cursor-pointer border border-[#EFE0EF] mb-2"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheckIcon size={15} color="#6C306E" />
                                                                <span>Admin Portal</span>
                                                            </div>
                                                            <span className="text-xs">↗</span>
                                                        </Link>
                                                    )}

                                                    {/* 1. Manage My Account */}
                                                    <Link
                                                        href="/account"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] transition font-medium cursor-pointer"
                                                    >
                                                        <UserIcon size={15} color="#6C306E" />
                                                        <span>Manage My Account</span>
                                                    </Link>

                                                    {/* 2. My Orders */}
                                                    <Link
                                                        href="/orders"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] transition font-medium"
                                                    >
                                                        <TruckIcon size={15} color="#6C306E" />
                                                        <span>My Orders</span>
                                                    </Link>

                                                    {/* 3. My Reviews */}
                                                    <Link
                                                        href="/reviews"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 hover:bg-[#FAF6FA] hover:text-[#6C306E] transition font-medium"
                                                    >
                                                        <ReviewBadgeIcon size={15} color="#6C306E" />
                                                        <span>My Reviews</span>
                                                    </Link>
                                                </div>

                                                <div className="border-t border-[#EFE0EF] my-2" />

                                                {/* 4. Logout */}
                                                <button
                                                    type="button"
                                                    onClick={handleSignOut}
                                                    className="w-full text-left p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition font-bold cursor-pointer flex items-center gap-2.5"
                                                >
                                                    <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Logout</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <FlowButton text="Sign In" href="/login" />
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

            {/* Manage My Account Modal */}
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                user={currentUser}
                onUserUpdated={(updated) => setCurrentUser(updated)}
            />
        </>
    );
};

export default Navbar;
