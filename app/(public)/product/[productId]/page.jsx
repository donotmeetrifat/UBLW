'use client'

import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import ProductCard from "@/components/ProductCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SparklesIcon, ChevronRightIcon, BagIcon } from "@/components/icons";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Product() {
    const { productId } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        // 1. Try finding in Redux
        const found = products.find((p) => p.id === productId);
        if (found) {
            setProduct(found);
            setLoading(false);
            return;
        }

        // 2. Fetch from API
        try {
            const res = await fetch(`/api/products/${productId}`);
            const data = await res.json();
            if (data.success && data.product) {
                setProduct(data.product);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [productId, products]);

    // Related products in the same category
    const relatedProducts = products
        .filter(p => p.id !== productId && p.category === product?.category)
        .slice(0, 4);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
                <div className="size-8 border-2 border-[#6C306E] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs">Loading authentic UK product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="size-16 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mb-4">
                    <BagIcon size={26} color="#6C306E" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#241224]">Product Not Found</h1>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    This UK imported item may have been relocated or updated in our catalog.
                </p>
                <Link
                    href="/shop"
                    className="mt-6 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs"
                >
                    Browse UK Beauty Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-4 sm:mx-8">
            <div className="max-w-7xl mx-auto pb-20">
                {/* Luxury Interactive Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-slate-400 mt-6 mb-6 font-medium">
                    <Link href="/" className="hover:text-[#6C306E] transition">Home</Link>
                    <ChevronRightIcon size={12} color="#8A758A" />
                    <Link href="/shop" className="hover:text-[#6C306E] transition">Collection</Link>
                    <ChevronRightIcon size={12} color="#8A758A" />
                    <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-[#6C306E] font-bold hover:underline">
                        {product.category}
                    </Link>
                    <ChevronRightIcon size={12} color="#8A758A" />
                    <span className="text-[#241224] font-semibold truncate max-w-xs hidden sm:inline">
                        {product.name}
                    </span>
                </nav>

                {/* Main Product Showcase */}
                <ProductDetails product={product} />

                {/* Formulation Details & Verified Reviews */}
                <ProductDescription product={product} />

                {/* Related UK Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 pt-12 border-t border-[#EFE0EF]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-1.5 text-[#6C306E] text-xs font-bold uppercase tracking-wider mb-1">
                                    <SparklesIcon size={13} color="#D8B56D" />
                                    <span>Curated British Collection</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-[#241224]">
                                    More in {product.category}
                                </h3>
                            </div>
                            <Link
                                href={`/shop?category=${encodeURIComponent(product.category)}`}
                                className="text-xs font-bold text-[#6C306E] hover:underline flex items-center gap-1"
                            >
                                <span>View all</span>
                                <ChevronRightIcon size={12} color="#6C306E" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map(rel => (
                                <ProductCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
