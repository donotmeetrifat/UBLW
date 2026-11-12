'use client'

import React from 'react'
import Title from './Title'
import { ShieldCheckIcon, SparklesIcon, LockIcon } from '@/components/icons'
import { motion } from 'framer-motion'

const specs = [
    { 
        title: "100% Original UK Imported", 
        description: "Directly imported from verified UK brand suppliers. Every formulation, batch code, and seal is 100% genuine.", 
        icon: ShieldCheckIcon,
        badge: "Guaranteed Authentic"
    },
    { 
        title: "Dermatologist-Approved Picks", 
        description: "Carefully curated high-performance skincare, cult cosmetic editions, and salon-grade hair recovery treatments.", 
        icon: SparklesIcon,
        badge: "Premium Quality"
    },
    { 
        title: "Reliable Support & Delivery", 
        description: "Fast nationwide delivery across Bangladesh with secure COD, bKash mobile payments, and personal beauty guidance.", 
        icon: LockIcon,
        badge: "Trusted Service"
    }
]

const OurSpecs = () => {
    return (
        <section id="why-us" className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32'>
            <Title 
                visibleButton={false} 
                title='Why Choose UK Brand Lover' 
                description="We bridge the gap between world-class UK beauty houses and Bangladesh with absolute authenticity and dedicated care." 
            />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16'>
                {specs.map((spec, index) => {
                    return (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6 }}
                            className='relative flex flex-col items-center text-center p-8 sm:p-9 bg-gradient-to-b from-[#FAF7FA] to-[#FCF8FC] border border-[#EFE0EF] rounded-3xl hover:border-[#6C306E]/30 shadow-[0_4px_20px_rgba(58,12,56,0.02)] hover:shadow-[0_12px_32px_rgba(58,12,56,0.06)] transition-all duration-300'
                        >
                            {/* Floating Top Badge */}
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9956A1] bg-white border border-[#EFE0EF] px-3 py-1 rounded-full mb-6 shadow-2xs">
                                {spec.badge}
                            </span>

                            {/* Luxury Icon Box with Soft Glow */}
                            <div className='size-14 rounded-2xl bg-white border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center shadow-xs mb-5 group-hover:scale-105 transition-transform duration-300'>
                                <spec.icon size={24} color="#6C306E" accentColor="#D8B56D" />
                            </div>

                            <h3 className='text-[#241224] font-bold text-lg mb-2.5 tracking-tight'>
                                {spec.title}
                            </h3>

                            <p className='text-xs sm:text-sm text-slate-500 leading-relaxed font-normal'>
                                {spec.description}
                            </p>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}

export default OurSpecs
