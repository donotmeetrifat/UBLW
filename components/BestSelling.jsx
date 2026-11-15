'use client'

import React, { useMemo } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const BestSelling = () => {
    const products = useSelector(state => state.product.list) || []
    const homepageSections = useSelector(state => state.product.homepageSections)
    const bestSellingConfig = homepageSections?.bestSelling

    const displayQuantity = useMemo(() => {
        return Math.min(24, Math.max(1, Number(bestSellingConfig?.displayLimit) || 8))
    }, [bestSellingConfig?.displayLimit])

    const displayedProducts = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) return []

        // ONLY show products explicitly selected by admin in Homepage Showcase
        if (!Array.isArray(bestSellingConfig?.productIds) || bestSellingConfig.productIds.length === 0) {
            return []
        }

        const curated = []
        const usedIds = new Set()

        // Strictly place only admin-curated products in their assigned priority serial order
        bestSellingConfig.productIds.forEach(id => {
            const found = products.find(p => p && p.id === id && p.isActive !== false)
            if (found && !usedIds.has(found.id)) {
                curated.push(found)
                usedIds.add(found.id)
            }
        })

        return curated.slice(0, displayQuantity)
    }, [products, bestSellingConfig, displayQuantity])

    if (bestSellingConfig?.enabled === false || displayedProducts.length === 0) {
        return null
    }

    const title = bestSellingConfig?.title || 'Best Selling Beauty'
    const description = bestSellingConfig?.description || "Explore our most-loved UK imported skincare, cosmetics, and haircare essentials."

    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28'>
            <Title 
                title={title}
                description={description}
                href='/shop' 
            />
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, staggerChildren: 0.08 }}
                className='mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'
            >
                {displayedProducts.map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </motion.div>
        </section>
    )
}

export default BestSelling
