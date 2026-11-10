'use client'

/**
 * Shared Motion & Spring Physics Configuration for UK Brand Lover
 * Luxury editorial cubic-bezier easing & smooth spring dynamics.
 */

export const luxuryEase = [0.22, 1, 0.36, 1]
export const smoothEase = [0.25, 0.1, 0.25, 1]

export const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.7, ease: luxuryEase }
    },
    exit: { 
        opacity: 0, 
        y: 12,
        transition: { duration: 0.4, ease: smoothEase }
    }
}

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { 
        opacity: 1, 
        transition: { duration: 0.6, ease: luxuryEase }
    },
    exit: { 
        opacity: 0, 
        transition: { duration: 0.3, ease: smoothEase }
    }
}

export const scaleIn = {
    initial: { opacity: 0, scale: 0.94 },
    animate: { 
        opacity: 1, 
        scale: 1, 
        transition: { duration: 0.5, ease: luxuryEase } 
    },
    exit: { 
        opacity: 0, 
        scale: 0.94, 
        transition: { duration: 0.3, ease: smoothEase } 
    }
}

export const staggerContainer = (staggerDelay = 0.08, delayStart = 0) => ({
    initial: {},
    animate: {
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayStart,
        }
    }
})

export const cardHover = {
    rest: { y: 0, transition: { duration: 0.35, ease: luxuryEase } },
    hover: { 
        y: -6, 
        transition: { duration: 0.35, ease: luxuryEase } 
    }
}

export const buttonSpring = {
    whileHover: { scale: 1.025, transition: { duration: 0.2, ease: luxuryEase } },
    whileTap: { scale: 0.96, transition: { duration: 0.1 } }
}

