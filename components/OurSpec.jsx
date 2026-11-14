'use client'

import React from 'react'
import Title from './Title'
import { motion } from 'framer-motion'

// Custom Inline Brand SVGs (Brand Color: #6C306E)
const ReceiptIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Receipt body */}
        <rect x="8" y="4" width="24" height="30" rx="3" stroke="#6C306E" strokeWidth="2" fill="none"/>
        {/* Receipt zigzag bottom */}
        <path d="M8 34 L11 31 L14 34 L17 31 L20 34 L23 31 L26 34 L29 31 L32 34" stroke="#6C306E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Lines on receipt */}
        <line x1="13" y1="12" x2="27" y2="12" stroke="#6C306E" strokeWidth="2" strokeLinecap="round"/>
        <line x1="13" y1="17" x2="27" y2="17" stroke="#6C306E" strokeWidth="2" strokeLinecap="round"/>
        <line x1="13" y1="22" x2="21" y2="22" stroke="#6C306E" strokeWidth="2" strokeLinecap="round"/>
        {/* Checkmark circle */}
        <circle cx="30" cy="10" r="7" fill="#6C306E"/>
        <path d="M26.5 10 L29 12.5 L33.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
)

const DiamondIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Diamond main shape */}
        <path d="M20 6 L34 16 L20 36 L6 16 Z" stroke="#6C306E" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        {/* Diamond top facets */}
        <path d="M6 16 L13 10 L20 6 L27 10 L34 16" stroke="#6C306E" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        {/* Diamond center line */}
        <line x1="13" y1="10" x2="13" y2="16" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="27" y1="10" x2="27" y2="16" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="16" x2="34" y2="16" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Sparkle top right */}
        <line x1="34" y1="5" x2="34" y2="9" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32" y1="7" x2="36" y2="7" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

const SupportHeartIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chat bubble */}
        <path d="M6 8 C6 6 8 4 10 4 L30 4 C32 4 34 6 34 8 L34 24 C34 26 32 28 30 28 L14 28 L8 34 L8 28 L10 28 C8 28 6 26 6 24 Z" stroke="#6C306E" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        {/* Heart inside chat */}
        <path d="M20 21 C20 21 13 17 13 13 C13 11 14.5 10 16.5 10 C18 10 19.5 11 20 12 C20.5 11 22 10 23.5 10 C25.5 10 27 11 27 13 C27 17 20 21 20 21 Z" fill="#6C306E"/>
    </svg>
)

const specs = [
    { 
        title: "You'll See the Receipt. Every Time.", 
        description: "Original UK receipt with every single order.", 
        icon: ReceiptIcon,
        badge: "GUARANTEED AUTHENTIC"
    },
    { 
        title: "Only What Actually Works.", 
        description: (
            <>
                CeraVe, E45, NIVEA, Liz Earle & more.<br />
                If it's here, it earned its place.
            </>
        ), 
        icon: DiamondIcon,
        badge: "CAREFULLY CURATED"
    },
    { 
        title: "A Real Person. Always Ready to Help.", 
        description: (
            <>
                WhatsApp or Messenger. We reply personally.<br />
                Dhaka ৳80 · All Bangladesh ৳160.
            </>
        ), 
        icon: SupportHeartIcon,
        badge: "PERSONAL SUPPORT"
    }
]

const OurSpecs = () => {
    return (
        <section id="why-us" className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32'>
            <Title 
                visibleButton={false} 
                title='Why Thousands of Women Trust UK Brand LOVER' 
                description="Real products. Real proof. No compromises." 
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
                                <spec.icon />
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
