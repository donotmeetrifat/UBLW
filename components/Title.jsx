'use client'

import { ArrowRightIcon } from '@/components/icons'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className='flex flex-col items-center text-center'
        >
            <h2 className='text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight'>
                {title}
            </h2>
            
            {description && (
                <p className='text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed font-normal mt-2'>
                    {description}
                </p>
            )}

            {visibleButton && (
                <Link 
                    href={href || '/shop'} 
                    className='text-[#6C306E] font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:text-[#3A0C38] transition-colors group mt-3 py-1'
                >
                    <span>View all collections</span>
                    <motion.span
                        className="inline-block"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowRightIcon size={14} color="#6C306E" className="transition-transform group-hover:translate-x-1" />
                    </motion.span>
                </Link>
            )}
        </motion.div>
    )
}

export default Title
