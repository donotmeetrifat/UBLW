'use client'

import React from 'react'

/**
 * ClassicLoader - Official UK Brand Lover Theme Circular Spinner
 * Based on user specification:
 * <div className="border-primary flex h-10 w-10 animate-spin items-center justify-center rounded-full border-4 border-t-transparent"></div>
 */
export default function ClassicLoader({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-[5px]'
  }
  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <div 
      className={`border-primary border-[#6C306E] flex ${sizeClass} animate-spin items-center justify-center rounded-full border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

/**
 * ModifiedClassicLoader - Two-point Linear Spinner
 * Based on user specification:
 * <div className="border-primary ml-3 h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 ease-linear"></div>
 */
export function ModifiedClassicLoader({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-6 w-6 border-t-2 border-b-2',
    md: 'h-10 w-10 border-t-2 border-b-2',
    lg: 'h-12 w-12 border-t-[3px] border-b-[3px]',
    xl: 'h-16 w-16 border-t-4 border-b-4'
  }
  const sizeClass = sizeMap[size] || sizeMap.md

  return (
    <div 
      className={`border-primary border-[#6C306E] border-x-transparent ${sizeClass} animate-spin rounded-full ease-linear ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

