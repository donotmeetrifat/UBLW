'use client'

import { ArrowRightIcon } from '@/components/icons'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PageTitle = ({ heading, text, path = "/", linkText }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="my-6 border-b border-[#EFE0EF] pb-4"
        >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">{heading}</h1>
            <div className="flex items-center justify-between flex-wrap gap-3 mt-1.5">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{text}</p>
                {linkText && (
                    <Link 
                        href={path} 
                        className="inline-flex items-center gap-1.5 text-[#6C306E] hover:text-[#3A0C38] text-xs sm:text-sm font-bold transition group"
                    >
                        <span>{linkText}</span>
                        <ArrowRightIcon size={14} color="#6C306E" className="transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>
        </motion.div>
    )
}

export default PageTitle
