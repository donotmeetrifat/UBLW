'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '@/components/PageTitle';
import RatingModal from '@/components/RatingModal';
import Loading from '@/components/Loading';
import { 
    ReviewBadgeIcon, 
    StarIcon, 
    SearchIcon, 
    SparklesIcon, 
    TruckIcon, 
    CheckIcon, 
    CameraIcon, 
    VideoIcon,
    EditIcon,
    BagIcon
} from '@/components/icons';
import { dummyRatingsData } from '@/assets/assets';
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth';

export default function ReviewsPage() {
    const [activeTab, setActiveTab] = useState('to-review'); // 'to-review' | 'my-reviews'
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [toReviewItems, setToReviewItems] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [selectedReviewModal, setSelectedReviewModal] = useState(null);
    const [lightboxMedia, setLightboxMedia] = useState(null);

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳';

    const fetchReviewData = async () => {
        try {
            setLoading(true);

            // 1. Fetch from database API
            let currentUser = null;
            if (typeof window !== 'undefined') {
                try {
                    currentUser = JSON.parse(localStorage.getItem('ukbl_current_user') || 'null');
                } catch {}
            }
            const emailParam = currentUser?.email ? `&email=${encodeURIComponent(currentUser.email)}` : '';
            const res = await fetch(`/api/reviews?my=true${emailParam}`);
            const data = await res.json();

            let apiMyReviews = data.success && Array.isArray(data.myReviews) ? data.myReviews : [];
            let apiToReview = data.success && Array.isArray(data.toReview) ? data.toReview : [];

            // 2. Read local storage orders to discover purchased items
            let localOrders = [];
            let localReviews = [];
            if (typeof window !== 'undefined') {
                try {
                    localOrders = JSON.parse(localStorage.getItem('ukbl_orders') || '[]');
                    localReviews = JSON.parse(localStorage.getItem('ukbl_local_reviews') || '[]');
                } catch (e) {
                    console.error('Error parsing local storage:', e);
                }
            }

            // Combine reviews
            const combinedReviewsMap = new Map();
            [...localReviews, ...apiMyReviews].forEach(rev => {
                const key = rev.productId || rev.id;
                if (!combinedReviewsMap.has(key)) {
                    combinedReviewsMap.set(key, rev);
                }
            });
            const mergedReviews = Array.from(combinedReviewsMap.values());
            const reviewedProductIds = new Set(mergedReviews.map(r => r.productId));

            // Extract purchased products from local orders ONLY IF order is DELIVERED
            const localToReviewMap = new Map();
            for (const order of localOrders) {
                // STRICT RULE: Customer must receive the product before reviewing
                if (order.status !== 'DELIVERED') {
                    continue;
                }
                const items = order.orderItems || [];
                for (const item of items) {
                    const prod = item.product || item;
                    const prodId = prod.id || item.productId;
                    if (prodId && !reviewedProductIds.has(prodId) && !localToReviewMap.has(prodId)) {
                        localToReviewMap.set(prodId, {
                            product: {
                                id: prodId,
                                name: prod.name || item.name || 'UK Beauty Product',
                                images: prod.images || [item.image || '/product_img1.png'],
                                price: prod.price || item.price || 0,
                                brand: prod.brand || 'UK Import'
                            },
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            purchaseDate: order.createdAt || Date.now(),
                            deliveryStatus: order.status || 'DELIVERED'
                        });
                    }
                }
            }

            // Merge API toReview with local ToReview
            const allToReviewMap = new Map();
            [...apiToReview, ...Array.from(localToReviewMap.values())].forEach(item => {
                const id = item.product?.id;
                if (id && !reviewedProductIds.has(id) && !allToReviewMap.has(id)) {
                    allToReviewMap.set(id, item);
                }
            });

            // If completely empty on a brand new demo session, supply initial authentic starter reviews
            if (mergedReviews.length === 0 && allToReviewMap.size === 0) {
                const starterReviews = (dummyRatingsData || []).slice(0, 3).map((dr, idx) => ({
                    id: `demo_${idx}`,
                    productId: dr.productId || `demo_p_${idx}`,
                    rating: dr.rating || 5,
                    review: dr.review || '100% authentic UK import! Verified batch code, flawless formulation.',
                    images: dr.images || [],
                    videos: [],
                    createdAt: dr.createdAt || new Date(Date.now() - idx * 86400000).toISOString(),
                    isVerifiedPurchase: true,
                    product: {
                        id: dr.productId || `demo_p_${idx}`,
                        name: dr.productName || 'CeraVe Foaming Cleanser for Normal to Oily Skin 473ml',
                        images: ['/product_img1.png'],
                        price: 2450,
                        brand: 'CeraVe UK'
                    }
                }));
                setMyReviews(starterReviews);
            } else {
                setMyReviews(mergedReviews);
                setToReviewItems(Array.from(allToReviewMap.values()));
            }
        } catch (error) {
            console.error('Error fetching review data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewData();

        // Real-time synchronization whenever a review is published
        const handlePublished = () => {
            fetchReviewData();
        };

        window.addEventListener('review-published', handlePublished);
        return () => window.removeEventListener('review-published', handlePublished);
    }, []);

    // Filter items according to search input
    const filteredToReview = toReviewItems.filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const pName = (item.product?.name || '').toLowerCase();
        const oNum = (item.orderNumber || '').toLowerCase();
        return pName.includes(q) || oNum.includes(q);
    });

    const filteredMyReviews = myReviews.filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const pName = (item.product?.name || '').toLowerCase();
        const text = (item.review || '').toLowerCase();
        return pName.includes(q) || text.includes(q);
    });

    return (
        <div className="min-h-[75vh] mx-4 sm:mx-6 text-slate-800">
            <div className="my-10 max-w-7xl mx-auto">
                <PageTitle
                    heading="My Reviews & Ratings"
                    text="Share authentic feedback and view reviews for your genuine UK imported beauty purchases"
                    linkText="My Orders"
                    linkHref="/orders"
                />

                {/* Search & Tabs Row */}
                <div className="mt-8 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Tab Switcher Pills */}
                    <div className="inline-flex items-center shrink-0 gap-2 bg-[#FAF6FA] p-1.5 rounded-2xl border border-[#EFE0EF] shadow-2xs self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('to-review')}
                            className={`flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                activeTab === 'to-review'
                                    ? 'bg-white text-[#6C306E] shadow-sm border border-[#EFE0EF]'
                                    : 'text-slate-500 hover:text-[#6C306E]'
                            }`}
                        >
                            <span className="whitespace-nowrap font-bold">To Review</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                activeTab === 'to-review' ? 'bg-[#6C306E] text-white' : 'bg-[#EFE0EF] text-slate-600'
                            }`}>
                                {toReviewItems.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('my-reviews')}
                            className={`flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                activeTab === 'my-reviews'
                                    ? 'bg-white text-[#6C306E] shadow-sm border border-[#EFE0EF]'
                                    : 'text-slate-500 hover:text-[#6C306E]'
                            }`}
                        >
                            <span className="whitespace-nowrap font-bold">My Reviews</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                activeTab === 'my-reviews' ? 'bg-[#6C306E] text-white' : 'bg-[#EFE0EF] text-slate-600'
                            }`}>
                                {myReviews.length}
                            </span>
                        </button>
                    </div>

                    {/* Search Filter Bar */}
                    <div className="relative w-full md:max-w-md">
                        <SearchIcon size={13} color="#6C306E" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by product name or keywords..."
                            className="w-full h-8 bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-full pl-8 pr-3 text-[11px] outline-none shadow-2xs text-[#241224] placeholder:text-[#8A758A]"
                        />
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <Loading message="Loading authentic reviews & purchased products..." />
                ) : activeTab === 'to-review' ? (
                    // 1. TO REVIEW TAB
                    filteredToReview.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {filteredToReview.map((item, idx) => {
                                const prod = item.product || {};
                                const prodImg = (prod.images && prod.images[0]) || '/product_img1.png';
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white border border-[#EFE0EF] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(58,12,56,0.03)] flex flex-col justify-between gap-4 transition hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="size-20 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] p-2 shrink-0 flex items-center justify-center overflow-hidden">
                                                <Image
                                                    src={prodImg}
                                                    alt={prod.name || 'UK Product'}
                                                    width={70}
                                                    height={70}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        Verified Purchase
                                                    </span>
                                                    {item.orderNumber && (
                                                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                                                            {item.orderNumber}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-sm text-[#241224] line-clamp-2">
                                                    {prod.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 font-medium">
                                                    {prod.brand || '100% Original UK Imported'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-[#EFE0EF]/80">
                                            <span className="text-xs text-slate-400">
                                                Purchased on {new Date(item.purchaseDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!isClientSignedIn()) {
                                                        requireSignIn('Please sign in to write a product review.');
                                                        return;
                                                    }
                                                    setSelectedReviewModal({
                                                        productId: prod.id,
                                                        productName: prod.name,
                                                        productImage: prodImg,
                                                        orderId: item.orderId,
                                                        product: prod,
                                                    });
                                                }}
                                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6C306E] to-[#401242] hover:from-[#7E3780] hover:to-[#451245] text-white font-bold text-xs uppercase tracking-wider transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <ReviewBadgeIcon size={14} color="#FFFFFF" />
                                                <span>Write Review</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-16 text-center border border-dashed border-[#EFE0EF] bg-[#FAF6FA] rounded-3xl p-8 max-w-lg mx-auto"
                        >
                            <div className="size-16 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-3 shadow-2xs">
                                <CheckIcon size={26} color="#6C306E" />
                            </div>
                            <h3 className="text-lg font-extrabold text-[#241224]">All Caught Up!</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                {searchQuery 
                                    ? "No purchased products matched your search." 
                                    : "You have reviewed all your purchased UK products, or have no pending reviews."}
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 mt-5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs"
                            >
                                <span>Discover New UK Arrivals</span>
                                <SparklesIcon size={14} color="#FFFFFF" />
                            </Link>
                        </motion.div>
                    )
                ) : (
                    // 2. MY REVIEWS TAB
                    filteredMyReviews.length > 0 ? (
                        <div className="space-y-5">
                            {filteredMyReviews.map((rev, idx) => {
                                const prod = rev.product || {};
                                const prodImg = (prod.images && prod.images[0]) || '/product_img1.png';
                                const revImages = Array.isArray(rev.images) ? rev.images : [];
                                const revVideos = Array.isArray(rev.videos) ? rev.videos : [];

                                return (
                                    <div
                                        key={rev.id || idx}
                                        className="bg-white border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,12,56,0.03)] space-y-4 transition"
                                    >
                                        {/* Product & Action Header */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE0EF]">
                                            <div className="flex items-center gap-3.5">
                                                <div className="size-14 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                                                    <Image
                                                        src={prodImg}
                                                        alt={prod.name || 'UK Beauty'}
                                                        width={50}
                                                        height={50}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            Verified Buyer
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-sm text-[#241224] line-clamp-1">
                                                        {prod.name || 'Authentic UK Beauty Product'}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                                {/* 2D Gold Star Rating Pill */}
                                                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF6FA] border border-[#EFE0EF]">
                                                    {Array(5).fill('').map((_, sIdx) => (
                                                        <StarIcon
                                                            key={sIdx}
                                                            size={14}
                                                            filled={rev.rating >= sIdx + 1}
                                                            color="#D8B56D"
                                                            emptyColor="#E8DFE9"
                                                        />
                                                    ))}
                                                    <span className="ml-1 text-xs font-black text-[#D8B56D]">
                                                        {Number(rev.rating).toFixed(1)}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isClientSignedIn()) {
                                                            requireSignIn('Please sign in to manage your reviews.');
                                                            return;
                                                        }
                                                        setSelectedReviewModal({
                                                            productId: prod.id || rev.productId,
                                                            productName: prod.name,
                                                            productImage: prodImg,
                                                            orderId: rev.orderId,
                                                            product: prod,
                                                            existingRating: rev,
                                                        });
                                                    }}
                                                    className="p-2 rounded-full hover:bg-[#FAF6FA] text-slate-400 hover:text-[#6C306E] transition cursor-pointer"
                                                    aria-label="Edit review"
                                                    title="Edit review"
                                                >
                                                    <EditIcon size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Review Text */}
                                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                                            "{rev.review}"
                                        </p>

                                        {/* Review Photos & Videos Grid */}
                                        {(revImages.length > 0 || revVideos.length > 0) && (
                                            <div className="flex flex-wrap gap-2.5 pt-1">
                                                {revImages.map((imgUrl, imgIdx) => (
                                                    <button
                                                        key={`img-${imgIdx}`}
                                                        type="button"
                                                        onClick={() => setLightboxMedia({ type: 'image', url: imgUrl })}
                                                        className="size-16 sm:size-20 rounded-2xl overflow-hidden border border-[#EFE0EF] hover:border-[#6C306E] transition cursor-pointer relative group/media bg-[#FAF6FA]"
                                                    >
                                                        <Image
                                                            src={imgUrl}
                                                            alt={`Review photo ${imgIdx + 1}`}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                                        />
                                                    </button>
                                                ))}

                                                {revVideos.map((vidUrl, vidIdx) => (
                                                    <button
                                                        key={`vid-${vidIdx}`}
                                                        type="button"
                                                        onClick={() => setLightboxMedia({ type: 'video', url: vidUrl })}
                                                        className="size-16 sm:size-20 rounded-2xl overflow-hidden border border-[#6C306E] transition cursor-pointer relative group/media bg-black flex items-center justify-center"
                                                    >
                                                        <video src={vidUrl} className="w-full h-full object-cover opacity-80" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/media:bg-black/20 transition-colors">
                                                            <div className="size-6 rounded-full bg-white/90 flex items-center justify-center text-[#6C306E] shadow-sm">
                                                                <VideoIcon size={12} color="#6C306E" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-16 text-center border border-dashed border-[#EFE0EF] bg-[#FAF6FA] rounded-3xl p-8 max-w-lg mx-auto"
                        >
                            <div className="size-16 rounded-full bg-white border border-[#EFE0EF] flex items-center justify-center mx-auto text-[#6C306E] mb-3 shadow-2xs">
                                <ReviewBadgeIcon size={26} color="#6C306E" />
                            </div>
                            <h3 className="text-lg font-extrabold text-[#241224]">No Reviews Published Yet</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                Share your thoughts on purchased 100% original UK imported cosmetics to help over 3,000+ beauty lovers in Bangladesh!
                            </p>
                            <button
                                type="button"
                                onClick={() => setActiveTab('to-review')}
                                className="inline-flex items-center gap-2 mt-5 bg-[#6C306E] hover:bg-[#3A0C38] text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
                            >
                                <span>Check Products to Review</span>
                                <SparklesIcon size={14} color="#FFFFFF" />
                            </button>
                        </motion.div>
                    )
                )}
            </div>

            {/* Rating Modal for Writing / Editing Reviews */}
            {selectedReviewModal && (
                <RatingModal
                    ratingModal={selectedReviewModal}
                    setRatingModal={setSelectedReviewModal}
                    onReviewSubmitted={() => fetchReviewData()}
                />
            )}

            {/* Media Lightbox Preview Modal */}
            <AnimatePresence>
                {lightboxMedia && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md transition-all duration-300"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-3 border border-[#EFE0EF] shadow-2xl max-w-2xl w-full overflow-hidden relative cursor-default"
                        >
                            <button
                                type="button"
                                onClick={() => setLightboxMedia(null)}
                                className="absolute top-5 right-5 z-20 size-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                                aria-label="Close preview"
                            >
                                <CloseIcon size={14} color="#FFFFFF" />
                            </button>
                            {lightboxMedia.type === 'video' ? (
                                <video
                                    src={lightboxMedia.url}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[75vh] rounded-2xl bg-black object-contain"
                                />
                            ) : (
                                <Image
                                    src={lightboxMedia.url}
                                    alt="Review media preview"
                                    width={800}
                                    height={800}
                                    className="w-full max-h-[75vh] object-contain rounded-2xl"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => setLightboxMedia(null)}
                                className="mt-3 w-full py-2.5 rounded-full bg-[#FAF6FA] hover:bg-[#EFE0EF] text-xs font-bold text-[#6C306E] transition cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

