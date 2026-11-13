'use client'

import React from 'react'
import ClassicLoader, { ModifiedClassicLoader } from '@/components/ui/classic-loader'

/**
 * Universal Website Loading Component for UK Brand Lover
 * Uses the clean, premium circular classic loader with the official website theme (#6C306E).
 */
const Loading = ({ 
    message = 'Curating Authentic UK Beauty...', 
    loadingText,
    compact = false,
    size = 'md',
    variant = 'classic',
    showLoadingText = true,
    className = ''
}) => {
    const displayText = loadingText || message

    return (
        <div className={`relative flex flex-col items-center justify-center w-full select-none ${compact ? 'py-4' : 'min-h-[55vh] py-14'} ${className}`}>
            {/* Subtle luxury ambient glow aura in background */}
            {!compact && (
                <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-[#6C306E]/8 via-[#D8B56D]/8 to-transparent blur-3xl pointer-events-none -z-10" />
            )}

            {/* Official Classic Loader */}
            <div className="relative flex items-center justify-center">
                {variant === 'modified' ? (
                    <ModifiedClassicLoader size={compact ? 'sm' : size} />
                ) : (
                    <ClassicLoader size={compact ? 'sm' : size} />
                )}
            </div>

            {/* Brand text underneath loader */}
            {showLoadingText && displayText && (
                <div className="mt-4 flex flex-col items-center text-center px-4">
                    <p className="text-xs sm:text-sm font-medium tracking-wide text-[#241224]/85">
                        {displayText}
                    </p>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-[#6C306E] mt-1.5 opacity-80">
                        UK Brand Lover
                    </span>
                </div>
            )}
        </div>
    )
}

export { ClassicLoader, ModifiedClassicLoader, ClassicLoader as TetrisLoading }
export default Loading
