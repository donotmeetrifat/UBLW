'use client'

import React from 'react'
import Title from './Title'
import { ourSpecsData } from '@/assets/assets'

const OurSpecs = () => {
    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32'>
            <Title 
                visibleButton={false} 
                title='Why Choose UK Brand Lover' 
                description="We guarantee 100% authentic UK imported beauty, skincare, and cosmetics with carefully selected products and reliable delivery across Bangladesh." 
            />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16'>
                {ourSpecsData.map((spec, index) => {
                    return (
                        <div 
                            className='flex flex-col items-center text-center p-7 sm:p-8 bg-[#FAF7FA]/90 border border-[#EFE0EF] rounded-3xl group hover:border-[#6C306E]/30 hover:-translate-y-1 hover:shadow-2xs transition-all duration-200 ease-out cursor-default' 
                            key={index}
                        >
                            <div className='size-11 sm:size-12 rounded-2xl bg-white border border-[#EFE0EF] text-[#6C306E] flex items-center justify-center shadow-2xs group-hover:scale-103 group-hover:border-[#6C306E]/30 transition-all duration-200 mb-5 shrink-0'>
                                <spec.icon size={20} className="stroke-[1.75]" />
                            </div>
                            <h3 className='text-[#241224] font-bold text-base sm:text-lg mb-2 tracking-tight'>{spec.title}</h3>
                            <p className='text-xs sm:text-sm text-slate-500 leading-relaxed font-normal'>{spec.description}</p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default OurSpecs