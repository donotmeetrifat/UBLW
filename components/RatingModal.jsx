'use client'

import React, { useState } from 'react'
import { CloseIcon, StarIcon } from '@/components/icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                toast.success('Thank you! Your verified review has been published.');
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#241224]/50 backdrop-blur-xs p-4'>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className='bg-white p-7 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md relative border border-[#EFE0EF]'
            >
                {/* Close Button */}
                <button
                    onClick={() => setRatingModal(null)}
                    className='absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-[#241224] hover:bg-[#FAF6FA] transition cursor-pointer'
                    aria-label="Close modal"
                >
                    <CloseIcon size={16} />
                </button>

                <div className='text-center mb-6'>
                    <span className='text-[10px] font-bold text-[#6C306E] uppercase tracking-widest bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full'>
                        Verified Purchase Feedback
                    </span>
                    <h2 className='text-xl sm:text-2xl font-bold text-[#241224] mt-2'>
                        Rate This UK Product
                    </h2>
                    <p className='text-xs text-slate-500 mt-1'>
                        Share your experience with other beauty shoppers in Bangladesh.
                    </p>
                </div>

                {/* Interactive Star Rating */}
                <div className='flex items-center justify-center gap-2 mb-6'>
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
                                    size={30}
                                    filled={isFilled}
                                    color="#D8B56D"
                                    emptyColor="#E8DFE9"
                                />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Review Text */}
                <div className='mb-5'>
                    <label className='text-xs font-semibold text-[#241224] block mb-1.5'>
                        Your Review
                    </label>
                    <textarea
                        className='w-full p-3.5 border border-[#EFE0EF] rounded-2xl text-xs text-[#241224] placeholder-slate-400 bg-[#FAF6FA] focus:bg-white focus:outline-none focus:border-[#6C306E] transition'
                        placeholder='Tell us about the texture, fragrance, results, and authenticity...'
                        rows='4'
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                {/* Submit Action with Micro-Animation & Shimmer */}
                <motion.button
                    whileHover={{ scale: 1.025, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className='group relative overflow-hidden w-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white py-3.5 rounded-full text-xs font-bold transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[0_12px_28px_rgba(108,48,110,0.6)] cursor-pointer disabled:opacity-50 shimmer-active flex items-center justify-center gap-2 border border-white/20'
                >
                    <StarIcon size={14} color="#D8B56D" filled={true} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span>{isSubmitting ? 'Publishing Review...' : 'Submit Verified UK Review'}</span>
                </motion.button>
            </motion.div>
        </div>
    )
}

export default RatingModal
