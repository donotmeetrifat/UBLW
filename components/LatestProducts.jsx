'use client'

import React, { useMemo } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const LatestProducts = () => {
    const products = useSelector(state => state.product.list) || []
    const homepageSections = useSelector(state => state.product.homepageSections)
    const newArrivalsConfig = homepageSections?.newArrivals

    const displayQuantity = useMemo(() => {
        return Math.min(24, Math.max(1, Number(newArrivalsConfig?.displayLimit) || 4))
    }, [newArrivalsConfig?.displayLimit])

    const displayedProducts = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) return []

        // ONLY show products explicitly selected by admin in Homepage Showcase
        if (!Array.isArray(newArrivalsConfig?.productIds) || newArrivalsConfig.productIds.length === 0) {
            return []
        }

        const curated = []
        const usedIds = new Set()

        // Strictly place only admin-curated products in their assigned priority serial order
        newArrivalsConfig.productIds.forEach(id => {
            const found = products.find(p => p && p.id === id && p.isActive !== false)
            if (found && !usedIds.has(found.id)) {
                curated.push(found)
                usedIds.add(found.id)
            }
        })

        return curated.slice(0, displayQuantity)
    }, [products, newArrivalsConfig, displayQuantity])

    if (newArrivalsConfig?.enabled === false || displayedProducts.length === 0) {
        return null
    }

    const title = newArrivalsConfig?.title || 'New UK Arrivals'
    const description = newArrivalsConfig?.description || "Discover the latest authentic UK imported skincare, cult cosmetics, and personal care."

    return (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24'>
            <Title 
                title={title}
                description={description}
                href='/shop' 
            />
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                className='mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6'
            >
                {displayedProducts.map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </motion.div>
        </section>
    )
}

export default LatestProducts
