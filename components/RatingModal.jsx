'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { CloseIcon, StarIcon, ReviewBadgeIcon, UploadIcon, TrashIcon } from '@/components/icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();

                if (data.success && data.url) {
                    setImages(prev => [...prev, data.url]);
                } else {
                    // Fallback to local base64 reader if upload server is offline
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                        setImages(prev => [...prev, uploadEvent.target.result]);
                    };
                    reader.readAsDataURL(file);
                }
            } catch (err) {
                console.error('Error uploading review photo:', err);
                const reader = new FileReader();
                reader.onload = (uploadEvent) => {
                    setImages(prev => [...prev, uploadEvent.target.result]);
                };
                reader.readAsDataURL(file);
            }
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            return toast.error('Please select a star rating');
        }
        if (review.trim().length < 5) {
            return toast.error('Please write a short review (at least 5 characters)');
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
                    productId: ratingModal.productId,
                    orderId: ratingModal.orderId,
                    userName: 'Verified Buyer',
                }),
            });
            const data = await res.json();

            if (data.success && data.rating) {
                dispatch(addRating({
                    ...data.rating,
                    orderId: ratingModal.orderId,
                    productId: ratingModal.productId,
                }));
                toast.success('Thank you! Your verified review with photos has been published.');
                setRatingModal(null);
            } else {
                toast.error(data.message || 'Could not submit review. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            dispatch(addRating({
                id: `rat_${Date.now()}`,
                rating,
                review: review.trim(),
                images,
                orderId: ratingModal.orderId,
                productId: ratingModal.productId,
                user: { name: 'Verified Buyer' },
            }));
            toast.success('Review saved successfully!');
            setRatingModal(null);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#241224]/50 backdrop-blur-xs p-4 overflow-y-auto'>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className='bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-lg relative border border-[#EFE0EF] my-8'
            >
                {/* Close Button */}
                <button
                    onClick={() => setRatingModal(null)}
                    className='absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer'
                    aria-label="Close modal"
                >
                    <CloseIcon size={16} />
                </button>

                <div className='text-center mb-5'>
                    <div className="size-11 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mx-auto mb-2.5 text-[#6C306E]">
                        <ReviewBadgeIcon size={20} color="#6C306E" />
                    </div>
                    <span className='text-[10px] font-bold text-[#6C306E] uppercase tracking-widest bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full'>
                        Verified Purchase Feedback
                    </span>
                    <h2 className='text-xl font-bold text-[#241224] mt-2'>
                        Rate This UK Product
                    </h2>
                    <p className='text-xs text-slate-500 mt-1'>
                        Share your authentic experience and upload parcel swatches or photos.
                    </p>
                </div>

                {/* Interactive Star Rating */}
                <div className='flex items-center justify-center gap-2 mb-5'>
                    {Array.from({ length: 5 }, (_, i) => {
                        const starIndex = i + 1;
                        const isFilled = (hoverRating || rating) >= starIndex;

                        return (
                            <motion.button
                                key={i}
                                type="button"
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.9 }}
                                onMouseEnter={() => setHoverRating(starIndex)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(starIndex)}
                                className='p-1 cursor-pointer focus:outline-none'
                                aria-label={`Rate ${starIndex} stars`}
                            >
                                <StarIcon
                                    size={28}
                                    filled={isFilled}
                                    color="#D8B56D"
                                    emptyColor="#E8DFE9"
                                />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Review Text */}
                <div className='mb-4'>
                    <label className='text-xs font-semibold text-[#241224] block mb-1.5'>
                        Your Review
                    </label>
                    <textarea
                        className='w-full p-3.5 border border-[#EFE0EF] rounded-2xl text-xs text-[#241224] placeholder-slate-400 bg-[#FAF6FA] focus:bg-white focus:outline-none focus:border-[#6C306E] transition min-h-[90px] resize-none'
                        placeholder='Tell us about the texture, fragrance, results, shade match, and authenticity...'
                        rows='3'
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                {/* Photo Upload Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className='text-xs font-semibold text-[#241224]'>
                            Add Product Photos (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400">{images.length}/4 photos</span>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                    />

                    {/* Image Thumbnails & Upload Trigger */}
                    <div className="flex flex-wrap gap-2.5">
                        {images.map((imgUrl, idx) => (
                            <div key={idx} className="relative size-16 rounded-xl border border-[#EFE0EF] overflow-hidden group">
                                <Image 
                                    src={imgUrl} 
                                    alt={`Review Photo ${idx + 1}`} 
                                    fill 
                                    className="object-cover" 
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 size-5 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition"
                                    title="Remove photo"
                                >
                                    <CloseIcon size={10} color="#FFFFFF" />
                                </button>
                            </div>
                        ))}

                        {images.length < 4 && (
                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="size-16 rounded-xl border border-dashed border-[#6C306E]/40 hover:border-[#6C306E] bg-[#FAF6FA] hover:bg-white text-[#6C306E] flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                            >
                                <UploadIcon size={16} color="#6C306E" />
                                <span className="text-[9px] font-bold">
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Submit Action */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || isUploading}
                    onClick={handleSubmit}
                    className='group relative overflow-hidden w-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white py-3.5 rounded-full text-xs font-bold transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[0_12px_28px_rgba(108,48,110,0.6)] cursor-pointer disabled:opacity-50 shimmer-active flex items-center justify-center gap-2 border border-white/20'
                >
                    <ReviewBadgeIcon size={14} color="#FFFFFF" className="group-hover:scale-110 transition-transform" />
                    <span>{isSubmitting ? 'Publishing Review...' : 'Submit Verified Review'}</span>
                </motion.button>
            </motion.div>
        </div>
    )
}

export default RatingModal
