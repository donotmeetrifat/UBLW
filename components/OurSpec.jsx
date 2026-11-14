'use client'

import React from 'react'
import Title from './Title'
import { motion } from 'framer-motion'

// Custom Premium 2D Luxury SVGs (Brand Color: #6C306E with subtle luxury gold #D8B56D)
const ReceiptIcon = () => (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Receipt Document Base */}
        <path 
            d="M7 4.5C7 3.67 7.67 3 8.5 3H18.5L24 8.5V28L21.5 26.5L19 28L16.5 26.5L14 28L11.5 26.5L9 28L7 26.8V4.5Z" 
            stroke="#6C306E" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
            fill="#FAF6FA"
        />
        {/* Folded Top-Right Corner */}
        <path 
            d="M18.5 3V8.5H24" 
            stroke="#6C306E" 
            strokeWidth="1.6" 
            strokeLinejoin="round"
        />
        {/* UK Store Receipt Lines */}
        <line x1="10.5" y1="12" x2="16.5" y2="12" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10.5" y1="15.5" x2="20.5" y2="15.5" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10.5" y1="19" x2="15" y2="19" stroke="#6C306E" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Verified Stamp Seal */}
        <circle cx="21" cy="21.5" r="4.5" fill="#6C306E" stroke="#FFFFFF" strokeWidth="1.2"/>
        <path d="M19.2 21.5L20.4 22.7L22.8 20.3" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const DiamondIcon = () => (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top Flat Table */}
        <polygon 
            points="11,7 21,7 26,13 6,13" 
            stroke="#6C306E" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
            fill="#FAF6FA"
        />
        {/* Bottom Pointed Pavilion */}
        <polygon 
            points="6,13 26,13 16,28" 
            stroke="#6C306E" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
            fill="#FAF6FA"
        />
        {/* Center Triangular Facet */}
        <polygon 
            points="11,13 21,13 16,28" 
            stroke="#6C306E" 
            strokeWidth="1.4" 
            strokeLinejoin="round"
        />
        {/* Top-To-Bottom Internal Facet Lines */}
        <line x1="11" y1="7" x2="11" y2="13" stroke="#6C306E" strokeWidth="1.4"/>
        <line x1="21" y1="7" x2="21" y2="13" stroke="#6C306E" strokeWidth="1.4"/>
        {/* Luxury Gold Sparkle */}
        <path d="M25 4V8M23 6H27" stroke="#D8B56D" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

const SupportHeartIcon = () => (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Secondary Messenger Bubble */}
        <path 
            d="M17 7H23C25.2 7 27 8.8 27 11V16C27 18.2 25.2 20 23 20H22.5V23.5L19 20H17" 
            stroke="#D8B56D" 
            strokeWidth="1.4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        {/* Primary Dialog Bubble */}
        <path 
            d="M6 10C6 7.8 7.8 6 10 6H18C20.2 6 22 7.8 22 10V18C22 20.2 20.2 22 18 22H13L8 25.5V22H10C7.8 22 6 20.2 6 18V10Z" 
            stroke="#6C306E" 
            strokeWidth="1.6" 
            strokeLinejoin="round" 
            fill="#FAF6FA"
        />
        {/* Genuine Heart in Dialog */}
        <path 
            d="M14 16.2C14 16.2 10 13.8 10 11.8C10 10.6 10.9 9.8 12.1 9.8C12.8 9.8 13.5 10.2 14 10.7C14.5 10.2 15.2 9.8 15.9 9.8C17.1 9.8 18 10.6 18 11.8C18 13.8 14 16.2 14 16.2Z" 
            fill="#6C306E"
        />
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
