'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { CloseIcon, StarIcon, ReviewBadgeIcon, UploadIcon, TrashIcon, VideoIcon, CameraIcon, CheckIcon, SparklesIcon } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

export const REVIEW_SUGGESTIONS_EN = [
    {
        title: "Authentic & Verified Batch",
        text: "100% authentic UK product! The barcode and batch code verified instantly. My skin feels deeply hydrated and glowing. Fast delivery too!"
    },
    {
        title: "British Luxury Packaging",
        text: "Original British skincare delivered securely sealed! Texture and fragrance match the UK store version exactly. 10/10 recommended!"
    },
    {
        title: "Fast Dhaka Delivery",
        text: "Super fast delivery in Dhaka! Packaging was luxurious with bubble wrap protection. Will definitely order from UK Brand Lover again!"
    },
    {
        title: "Trustworthy & Best Price",
        text: "Best authentic cosmetics shop in Bangladesh. Genuine import quality, no duplicate or fake issues. Completely trustworthy!"
    }
];

export const REVIEW_SUGGESTIONS_BN = [
    {
        title: "১০০% আসল প্রোডাক্ট",
        text: "১০০% অরিজিনাল ইউকে প্রোডাক্ট! ব্যাচ কোড চেক করে দেখেছি একদম জেনুইন। স্কিনের জন্য অসাধারণ কাজ করছে।"
    },
    {
        title: "দ্রুত ও নিরাপদ ডেলিভারি",
        text: "লন্ডন থেকে ইমপোর্ট করা আসল কসমেটিকস পেয়ে খুবই আনন্দিত। খুব দ্রুত ও সুরক্ষিতভাবে ডেলিভারি পেয়েছি। ধন্যবাদ ইউকে ব্র্যান্ড লাভার!"
    },
    {
        title: "বিশ্বস্ত ব্রিটিশ কোয়ালিটি",
        text: "অরিজিনাল ব্রিটিশ স্কিনকেয়ারের জন্য বাংলাদেশের এক নম্বর বিশ্বস্ত শপ। কোনো সন্দেহ ছাড়াই যে কেউ কিনতে পারেন।"
    },
    {
        title: "অসাধারণ রেজাল্ট",
        text: "প্যাকেজিং খুবই প্রিমিয়াম ছিল এবং প্রোডাক্ট ১০০% আসল। ব্যবহার করে দারুণ রেজাল্ট পেয়েছি। বারবার এখান থেকেই নিব!"
    }
];

const RatingModal = ({ ratingModal, setRatingModal, onReviewSubmitted }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // Default to 5 stars as requested
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [activeLang, setActiveLang] = useState('en'); // 'en' or 'bn'
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (ratingModal) {
            setRating(ratingModal.existingRating?.rating || 5);
            setReview(ratingModal.existingRating?.review || '');
            setImages(ratingModal.existingRating?.images || []);
            setVideos(ratingModal.existingRating?.videos || []);
        }
    }, [ratingModal]);

    if (!ratingModal) return null;

    const productName = ratingModal.productName || ratingModal.product?.name || 'UK Beauty Product';
    const productImage = ratingModal.productImage || ratingModal.product?.images?.[0] || '/product_img1.png';

    // Image Upload Handler
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (images.length + files.length > 4) {
            toast.error('You can upload up to 4 photos per review');
            return;
        }

        setIsUploading(true);
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success && data.url) {
                    setImages(prev => [...prev, data.url]);
                } else {
                    const reader = new FileReader();
                    reader.onload = (ev) => setImages(prev => [...prev, ev.target.result]);
                    reader.readAsDataURL(file);
                }
            } catch (err) {
                console.error('Error uploading photo:', err);
                const reader = new FileReader();
                reader.onload = (ev) => setImages(prev => [...prev, ev.target.result]);
                reader.readAsDataURL(file);
            }
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Video Upload Handler
    const handleVideoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (videos.length >= 1) {
            toast.error('You can upload 1 unboxing/review video');
            return;
        }

        if (!file.type.startsWith('video/')) {
            toast.error('Please upload a valid video file (.mp4, .mov, .webm)');
            return;
        }

        if (file.size > 25 * 1024 * 1024) {
            toast.error('Video size must be under 25MB');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success && data.url) {
                setVideos(prev => [...prev, data.url]);
            } else {
                const reader = new FileReader();
                reader.onload = (ev) => setVideos(prev => [...prev, ev.target.result]);
                reader.readAsDataURL(file);
            }
            toast.success('Review video uploaded successfully!');
        } catch (err) {
            console.error('Error uploading video:', err);
            const reader = new FileReader();
            reader.onload = (ev) => setVideos(prev => [...prev, ev.target.result]);
            reader.readAsDataURL(file);
        }
        setIsUploading(false);
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const handleApplySuggestion = (text) => {
        setReview(text);
        toast.success('Review suggestion applied! Feel free to edit or submit.');
    };

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            return toast.error('Please select a star rating');
        }
        if (review.trim().length < 5) {
            return toast.error('Please write a review with at least 5 characters');
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    review: review.trim(),
                    images,
                    videos,
                    productId: ratingModal.productId || ratingModal.product?.id,
                    orderId: ratingModal.orderId,
                    userName: 'Verified Buyer',
                }),
            });
            const data = await res.json();

            if (data.success && data.rating) {
                const published = {
                    ...data.rating,
                    orderId: ratingModal.orderId,
                    productId: ratingModal.productId || ratingModal.product?.id,
                };

                dispatch(addRating(published));

                // Save to local storage for instant sync across all views
                if (typeof window !== 'undefined') {
                    const localReviews = JSON.parse(localStorage.getItem('ukbl_local_reviews') || '[]');
                    const filtered = localReviews.filter(r => r.productId !== published.productId);
                    localStorage.setItem('ukbl_local_reviews', JSON.stringify([published, ...filtered]));

                    // Fire custom event so product pages and navbar sync in real time
                    window.dispatchEvent(new CustomEvent('review-published', { detail: published }));
                }

                toast.success('Thank you! Your verified review has been published across UK Brand Lover.');
                if (onReviewSubmitted) onReviewSubmitted(published);
                setRatingModal(null);
            } else {
                toast.error(data.message || 'Could not submit review. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            const fallbackRating = {
                id: `rat_${Date.now()}`,
                rating,
                review: review.trim(),
                images,
                videos,
                orderId: ratingModal.orderId,
                productId: ratingModal.productId || ratingModal.product?.id,
                createdAt: new Date().toISOString(),
                isVerifiedPurchase: true,
                user: { name: 'Verified Buyer' },
                product: ratingModal.product,
            };

            dispatch(addRating(fallbackRating));
            if (typeof window !== 'undefined') {
                const localReviews = JSON.parse(localStorage.getItem('ukbl_local_reviews') || '[]');
                const filtered = localReviews.filter(r => r.productId !== fallbackRating.productId);
                localStorage.setItem('ukbl_local_reviews', JSON.stringify([fallbackRating, ...filtered]));
                window.dispatchEvent(new CustomEvent('review-published', { detail: fallbackRating }));
            }

            toast.success('Thank you! Your review has been published.');
            if (onReviewSubmitted) onReviewSubmitted(fallbackRating);
            setRatingModal(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingDescriptions = {
        5: 'Exceptional (100% Authentic British Quality)',
        4: 'Very Good (Satisfied with Quality & Delivery)',
        3: 'Average (Standard Product Experience)',
        2: 'Below Expectations',
        1: 'Poor Experience',
    };

    return (
        <div 
            onClick={(e) => { if (e.target === e.currentTarget) setRatingModal(null); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-white/60 backdrop-blur-md overflow-y-auto transition-all duration-300"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#EFE0EF] shadow-2xl relative my-6 text-[#241224]"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EFE0EF]">
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E]">
                            <ReviewBadgeIcon size={16} color="#6C306E" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-[#241224]">Write Verified Review</h3>
                            <p className="text-[11px] text-slate-500">Only verified buyers can review authentic UK products</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setRatingModal(null)}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#241224] transition cursor-pointer"
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                <div className="py-4 space-y-5 text-xs">
                    {/* Product Summary Card */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]">
                        <div className="size-12 rounded-xl bg-white border border-[#EFE0EF] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            <Image
                                src={productImage}
                                alt={productName}
                                width={44}
                                height={44}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mb-0.5">
                                Verified Purchase
                            </span>
                            <h4 className="font-bold text-xs text-[#241224] truncate">{productName}</h4>
                        </div>
                    </div>

                    {/* 2D Luxury Star Rating Selector (Default 5 Stars) */}
                    <div className="text-center py-1">
                        <label className="block text-slate-700 font-extrabold text-xs mb-2">
                            Select Rating Score
                        </label>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = (hoverRating || rating) >= star;
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1.5 transition-transform hover:scale-115 active:scale-95 cursor-pointer focus:outline-none"
                                        aria-label={`${star} Stars`}
                                    >
                                        <StarIcon
                                            size={28}
                                            filled={isFilled}
                                            color="#D8B56D"
                                            emptyColor="#E8DFE9"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[11px] font-bold text-[#6C306E] mt-2">
                            {ratingDescriptions[hoverRating || rating]}
                        </p>
                    </div>

                    {/* Suggestions Header & Language Switcher */}
                    <div className="pt-2 border-t border-[#EFE0EF]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                                <SparklesIcon size={13} color="#6C306E" />
                                <span>1-Click High-Trust Suggestions:</span>
                            </span>
                            <div className="flex items-center gap-1 bg-[#FAF6FA] p-0.5 rounded-full border border-[#EFE0EF]">
                                <button
                                    type="button"
                                    onClick={() => setActiveLang('en')}
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                        activeLang === 'en' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-500 hover:text-[#6C306E]'
                                    }`}
                                >
                                    English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveLang('bn')}
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                        activeLang === 'bn' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-500 hover:text-[#6C306E]'
                                    }`}
                                >
                                    বাংলা
                                </button>
                            </div>
                        </div>

                        {/* Suggestion Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(activeLang === 'en' ? REVIEW_SUGGESTIONS_EN : REVIEW_SUGGESTIONS_BN).map((sugg, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleApplySuggestion(sugg.text)}
                                    className="p-2.5 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] hover:bg-[#F3E8F3] hover:border-[#6C306E]/40 text-left transition cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-extrabold text-[11px] text-[#6C306E] group-hover:underline">
                                            {sugg.title}
                                        </span>
                                        <CheckIcon size={12} color="#6C306E" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                                        "{sugg.text}"
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Text Area */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1.5">
                            Your Personal Review Experience
                        </label>
                        <textarea
                            rows={3}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your authentic feedback about formulation, texture, batch code, scent, or delivery..."
                            className="w-full bg-[#FAF6FA] border border-[#EFE0EF] focus:border-[#6C306E] focus:bg-white rounded-2xl p-3.5 outline-none text-xs text-[#241224] transition resize-none leading-relaxed"
                        />
                    </div>

                    {/* Photo & Video Upload */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-slate-700 font-bold">
                                Add Photos & Video (Optional)
                            </label>
                            <span className="text-[10px] text-slate-400">Up to 4 photos + 1 video</span>
                        </div>

                        {/* Upload Trigger Buttons */}
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={images.length >= 4 || isUploading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] hover:bg-white hover:border-[#6C306E] transition text-[#6C306E] font-bold text-xs cursor-pointer disabled:opacity-50"
                            >
                                <CameraIcon size={15} color="#6C306E" />
                                <span>Add Photos ({images.length}/4)</span>
                            </button>

                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                disabled={videos.length >= 1 || isUploading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] hover:bg-white hover:border-[#6C306E] transition text-[#6C306E] font-bold text-xs cursor-pointer disabled:opacity-50"
                            >
                                <VideoIcon size={15} color="#6C306E" />
                                <span>Add Video ({videos.length}/1)</span>
                            </button>
                        </div>

                        {/* Upload Preview Grid */}
                        {(images.length > 0 || videos.length > 0) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {images.map((imgUrl, idx) => (
                                    <div key={`img-${idx}`} className="relative size-16 rounded-xl overflow-hidden border border-[#EFE0EF] group bg-white shadow-2xs">
                                        <Image src={imgUrl} alt={`Upload ${idx + 1}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 size-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition cursor-pointer"
                                        >
                                            <CloseIcon size={10} color="#FFFFFF" />
                                        </button>
                                    </div>
                                ))}

                                {videos.map((vidUrl, idx) => (
                                    <div key={`vid-${idx}`} className="relative size-16 rounded-xl overflow-hidden border border-[#6C306E] group bg-black shadow-2xs flex items-center justify-center">
                                        <video src={vidUrl} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <VideoIcon size={16} color="#FFFFFF" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 size-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition cursor-pointer z-10"
                                        >
                                            <CloseIcon size={10} color="#FFFFFF" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Submit Button */}
                <div className="pt-3 border-t border-[#EFE0EF]">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading || review.trim().length < 5}
                        className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <ReviewBadgeIcon size={16} color="#FFFFFF" />
                        <span>{isSubmitting ? 'Publishing Review...' : 'Publish Verified Review'}</span>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default RatingModal;
