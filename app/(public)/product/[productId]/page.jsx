'use client'

import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProduct as updateReduxProduct } from "@/lib/features/product/productSlice";
import { SparklesIcon, ChevronRightIcon, BagIcon } from "@/components/icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { broadcastStoreChange } from "@/lib/realtimeSync";

export default function Product() {
    const { productId } = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const products = useSelector(state => state.product.list);
    
    // 1. Optimistic immediate lookup from Redux store for 0ms initial render
    const reduxProduct = products.find((p) => p.id === productId);
    const [liveProduct, setLiveProduct] = useState(null);
    const [loading, setLoading] = useState(!reduxProduct);

    // Reactive single source of truth:
    // Merges liveProduct with reduxProduct, guaranteeing custom benefits, formula, and whyYouWillLoveIt are strictly preserved
    const product = (() => {
        if (!liveProduct && !reduxProduct) return null;
        const fresh = liveProduct || {};
        const base = reduxProduct || {};
        const merged = { ...base, ...fresh };

        const extractBenefits = (src) => {
            if (!src) return [];
            let raw = src.benefits;
            if (typeof raw === 'string') {
                try {
                    raw = JSON.parse(raw);
                } catch {
                    if (raw.startsWith('{') && raw.endsWith('}')) {
                        raw = raw.slice(1, -1).split(',').map(s => s.replace(/^"|"$/g, '').trim());
                    } else if (raw.includes('\n')) {
                        raw = raw.split('\n').map(s => s.trim());
                    } else {
                        raw = [raw.trim()];
                    }
                }
            }
            if (Array.isArray(raw)) {
                return raw.map(b => (typeof b === 'string' ? b.trim() : String(b || ''))).filter(Boolean);
            }
            return [];
        };

        const freshBenefits = extractBenefits(fresh);
        const baseBenefits = extractBenefits(base);
        const benefits = freshBenefits.length > 0 ? freshBenefits : baseBenefits;

        const freshWhy = (fresh.whyYouWillLoveIt && String(fresh.whyYouWillLoveIt).trim().length > 0)
            ? String(fresh.whyYouWillLoveIt).trim()
            : '';
        const baseWhy = (base.whyYouWillLoveIt && String(base.whyYouWillLoveIt).trim().length > 0)
            ? String(base.whyYouWillLoveIt).trim()
            : '';
        const whyYouWillLoveIt = freshWhy || baseWhy;

        const freshFormula = (fresh.formulaProfile && String(fresh.formulaProfile).trim().length > 0)
            ? String(fresh.formulaProfile).trim()
            : '';
        const baseFormula = (base.formulaProfile && String(base.formulaProfile).trim().length > 0)
            ? String(base.formulaProfile).trim()
            : '';
        const formulaProfile = freshFormula || baseFormula || fresh.description || base.description || '';

        return {
            ...merged,
            benefits,
            whyYouWillLoveIt,
            formulaProfile,
            description: formulaProfile || merged.description || ''
        };
    })();

    const fetchProduct = async () => {
        if (!productId) return;
        // 2. ALWAYS fetch fresh, live product from database via API with cache-busting
        try {
            const res = await fetch(`/api/products/${productId}?_t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Expires': '0'
                }
            });
            const data = await res.json();
            if (data.success && data.product) {
                setLiveProduct(data.product);
                // Synchronize latest database fields into Redux store
                dispatch(updateReduxProduct([data.product]));

                // Update localStorage cache so subsequent navigations and page reloads have the latest specs
                if (typeof window !== 'undefined') {
                    try {
                        const cached = JSON.parse(localStorage.getItem('ukbl_cached_products') || '[]');
                        const list = Array.isArray(cached) ? cached : [];
                        const idx = list.findIndex(p => p.id === data.product.id);
                        if (idx >= 0) {
                            list[idx] = { ...list[idx], ...data.product };
                        } else {
                            list.unshift(data.product);
                        }
                        localStorage.setItem('ukbl_cached_products', JSON.stringify(list));
                    } catch {}
                }
            }
        } catch (error) {
            console.error('Error fetching fresh product:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();

        // Track verified product impression in database and broadcast live analytics update
        if (typeof window !== 'undefined' && productId) {
            const viewedSessionKey = `ukbl_viewed_${productId}`;
            if (!sessionStorage.getItem(viewedSessionKey)) {
                sessionStorage.setItem(viewedSessionKey, '1');
                fetch(`/api/products/${productId}/view`, { method: 'POST' })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success && data.views) {
                            broadcastStoreChange('analytics', { productId, views: data.views });
                        }
                    })
                    .catch(() => {});
            }
        }

        // Listen for live updates dispatched from Admin panel
        const handleLiveUpdate = (e) => {
            if (e?.detail?.product?.id === productId) {
                setLiveProduct(e.detail.product);
                dispatch(updateReduxProduct([e.detail.product]));
            } else if (!e?.detail?.product?.id) {
                fetchProduct();
            }
        };

        const handleStorageUpdate = (e) => {
            if (e.key === 'ukbl_products_synced') {
                fetchProduct();
            }
        };

        let bc;
        try {
            bc = new BroadcastChannel('ukbl_catalog_channel');
            bc.onmessage = (msg) => {
                if (msg.data?.type === 'product-updated') {
                    if (msg.data.product?.id === productId) {
                        setLiveProduct(msg.data.product);
                        dispatch(updateReduxProduct([msg.data.product]));
                    } else {
                        fetchProduct();
                    }
                }
            };
        } catch {}

        window.addEventListener('product-updated', handleLiveUpdate);
        window.addEventListener('product-catalog-updated', fetchProduct);
        window.addEventListener('storage', handleStorageUpdate);

        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Record authentic product view and notify open admin tabs immediately
            fetch(`/api/products/${productId}/view`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data?.success) {
                        try {
                            localStorage.setItem('ukbl_analytics_updated', Date.now().toString());
                        } catch {}
                    }
                })
                .catch(() => {});
        }

        return () => {
            window.removeEventListener('product-updated', handleLiveUpdate);
            window.removeEventListener('product-catalog-updated', fetchProduct);
            window.removeEventListener('storage', handleStorageUpdate);
            if (bc) bc.close();
        };
    }, [productId]);

    // Related products in the same category
    const relatedProducts = products
        .filter(p => p.id !== productId && p.category === product?.category)
        .slice(0, 4);

    if (loading) {
        return <Loading message="Loading authentic UK product details..." />;
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
            <div className="max-w-7xl mx-auto pb-24 sm:pb-32">
                {/* Luxury Interactive Breadcrumbs with Generous White Space */}
                <nav className="flex items-center gap-2.5 text-xs text-slate-400 mt-6 sm:mt-8 mb-8 sm:mb-10 font-medium">
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
                    <div className="mt-24 sm:mt-32 pt-14 sm:pt-18 border-t border-[#EFE0EF]">
                        <div className="flex items-center justify-between mb-8 sm:mb-10">
                            <div>
                                <div className="text-[#6C306E] text-xs font-bold uppercase tracking-wider mb-1.5">
                                    <span>Curated UK Collection</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-[#241224]">
                                    More in {product.category}
                                </h3>
                            </div>
                            <Link
                                href={`/shop?category=${encodeURIComponent(product.category)}`}
                                className="text-xs font-bold text-[#6C306E] hover:underline flex items-center gap-1.5"
                            >
                                <span>View all</span>
                                <ChevronRightIcon size={12} color="#6C306E" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
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
