'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {
    return (
        <div className='flex flex-col items-center text-center'>
            <h2 className='text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight'>{title}</h2>
            {description && (
                <p className='text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed font-normal mt-2'>
                    {description}
                </p>
            )}
            {visibleButton && (
                <Link 
                    href={href || '/shop'} 
                    className='text-[#6C306E] font-bold text-xs sm:text-sm inline-flex items-center gap-1 hover:text-[#3A0C38] transition-colors group mt-2.5 sm:mt-3'
                >
                    View all 
                    <ArrowRight size={14} className='group-hover:translate-x-1 transition-transform' />
                </Link>
            )}
        </div>
    )
}

export default Title