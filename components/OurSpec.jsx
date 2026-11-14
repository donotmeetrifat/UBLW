'use client'

import React from 'react'
import Title from './Title'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, SparklesIcon } from '@/components/icons'

// Real 2D Luxury Support & Concierge Care Icon (Brand Purple #6C306E with Gold Accent #D8B56D)
const SupportAgentIcon = ({ size = 26, color = '#6C306E' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <rect x="2" y="13" width="4" height="6" rx="2" stroke={color} strokeWidth="1.75" fill="#FAF6FA" />
        <rect x="18" y="13" width="4" height="6" rx="2" stroke={color} strokeWidth="1.75" fill="#FAF6FA" />
        <path d="M19 19C19 20.6569 17.6569 22 16 22H13.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="22" r="1.2" fill="#D8B56D" />
    </svg>
)

const specs = [
    { 
        title: "You'll See the Receipt. Every Time.", 
        description: "Original UK receipt with every single order.", 
        icon: ShieldCheckIcon,
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
        icon: SparklesIcon,
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
        icon: SupportAgentIcon,
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
                                <spec.icon size={26} color="#6C306E" accentColor="#D8B56D" />
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
