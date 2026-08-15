'use client'

import { assets } from "@/assets/assets";
import { Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
    const router = useRouter();
    const [search, setSearch] = useState('')
    const [isCartBumping, setIsCartBumping] = useState(false);
    const cartCount = useSelector(state => state.cart.total)

    useEffect(() => {
        if (cartCount > 0) {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 300);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    useEffect(() => {
        const handleBump = () => {
            setIsCartBumping(true);
            const timer = setTimeout(() => setIsCartBumping(false), 300);
            return () => clearTimeout(timer);
        };

        window.addEventListener('cart-bump', handleBump);
        return () => window.removeEventListener('cart-bump', handleBump);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            router.push(`/shop?search=${encodeURIComponent(search.trim())}`)
        }
    }

    return (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#EFE0EF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3.5 sm:py-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image 
                            src={assets.webLogo} 
                            alt="UK Brand Lover Logo" 
                            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
                            priority 
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden sm:flex items-center gap-5 lg:gap-8 text-xs sm:text-sm text-slate-700 font-medium">
                        <Link href="/" className="hover:text-[#6C306E] transition-colors">Home</Link>
                        <Link href="/shop" className="hover:text-[#6C306E] transition-colors">Shop</Link>
                        <Link href="/contact" className="hover:text-[#6C306E] transition-colors">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden lg:flex items-center w-56 xl:w-64 text-xs gap-2 bg-[#FAF6FA] px-3.5 py-2 rounded-full border border-[#EFE0EF] focus-within:border-[#6C306E] transition-colors">
                            <Search size={15} className="text-[#6C306E] shrink-0" />
                            <input 
                                className="w-full bg-transparent outline-none placeholder-[#7B667B] text-slate-800 text-xs" 
                                type="text" 
                                placeholder="Search beauty products..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                            />
                        </form>

                        <Link 
                            id="navbar-cart-icon" 
                            href="/cart" 
                            className={`relative flex items-center gap-1.5 text-slate-700 hover:text-[#6C306E] transition-all duration-300 ${
                                isCartBumping ? 'scale-115 text-[#6C306E]' : 'scale-100'
                            }`}
                        >
                            <ShoppingBag size={18} />
                            <span>Cart</span>
                            <span className={`text-[10px] font-bold text-white bg-[#6C306E] size-4.5 rounded-full flex items-center justify-center transition-transform duration-300 ${
                                isCartBumping ? 'scale-125 bg-[#3A0C38]' : 'scale-100'
                            }`}>
                                {cartCount}
                            </span>
                        </Link>

                        <button className="px-6 py-2 bg-[#6C306E] hover:bg-[#3A0C38] transition-colors text-white text-xs font-bold rounded-full shadow-2xs">
                            Login
                        </button>
                    </div>

                    {/* Mobile Menu & Cart */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link 
                            id="navbar-cart-icon-mobile" 
                            href="/cart" 
                            className={`relative p-1.5 text-slate-700 transition-all duration-300 ${
                                isCartBumping ? 'scale-115 text-[#6C306E]' : 'scale-100'
                            }`}
                        >
                            <ShoppingBag size={20} />
                            <span className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white bg-[#6C306E] size-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
                                isCartBumping ? 'scale-125 bg-[#3A0C38]' : 'scale-100'
                            }`}>
                                {cartCount}
                            </span>
                        </Link>
                        <button className="px-4 py-1.5 bg-[#6C306E] hover:bg-[#3A0C38] text-xs font-bold transition-colors text-white rounded-full">
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar