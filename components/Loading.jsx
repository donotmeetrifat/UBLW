'use client'

import React from 'react'
import TetrisLoading from '@/components/ui/tetris-loader'

const Loading = ({ 
    message = 'Curating Authentic UK Beauty...', 
    loadingText,
    compact = false,
    size,
    speed = 'fast',
    showLoadingText = true
}) => {
    const displayText = loadingText || message

    return (
        <div className={`relative flex flex-col items-center justify-center w-full select-none ${compact ? 'py-4' : 'min-h-[55vh] py-14'}`}>
            {/* Ambient luxury glow aura in background */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#6C306E]/8 via-[#D8B56D]/8 to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Tetris Interactive Brand Loading Component */}
            <TetrisLoading 
                size={size || (compact ? 'sm' : 'sm')} 
                speed={speed} 
                loadingText={displayText} 
                showLoadingText={showLoadingText}
                compact={compact}
            />
        </div>
    )
}

export { TetrisLoading }
export default Loading
