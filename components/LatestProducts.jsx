'use client'

import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const LatestProducts = () => {
    const displayQuantity = 4
    const products = useSelector(state => state.product.list) || []

    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24'>
            <Title 
                title='New UK Arrivals' 
                description="Discover the latest authentic UK imported skincare, cult cosmetics, and personal care." 
                href='/shop' 
            />
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                className='mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'
            >
                {products
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, displayQuantity)
                    .map((product, index) => (
                        <ProductCard key={product.id || index} product={product} />
                    ))}
            </motion.div>
        </section>
    )
}

export default LatestProducts
