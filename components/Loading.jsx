'use client'

import { SparklesIcon } from '@/components/icons'
import { motion } from 'framer-motion'

const Loading = () => {
    return (
        <div className='flex flex-col items-center justify-center min-h-[60vh] gap-3'>
            <div className="relative size-12 flex items-center justify-center">
                <div className='absolute inset-0 rounded-full border-2 border-[#EFE0EF] border-t-[#6C306E] animate-spin'></div>
                <SparklesIcon size={16} color="#D8B56D" className="animate-pulse" />
            </div>
            <p className="text-xs font-bold text-[#6C306E] tracking-widest uppercase">
                UK Brand Lover
            </p>
        </div>
    )
}

export default Loading
