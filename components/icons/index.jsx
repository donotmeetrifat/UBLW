'use client'

import React from 'react'

/**
 * Luxury 2D Vector Icon Suite for UK Brand Lover
 * Handcrafted with clean geometric lines, refined stroke weights,
 * and high-fashion aesthetics.
 */

// 1. Boutique Luxury Shopping Bag
export const BagIcon = ({ size = 20, className = '', color = 'currentColor', fill = 'none', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M5 8.5C5 7.67157 5.67157 7 6.5 7H17.5C18.3284 7 19 7.67157 19 8.5V19C19 20.3807 17.8807 21.5 16.5 21.5H7.5C6.11929 21.5 5 20.3807 5 19V8.5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path
            d="M9 7V5.5C9 3.84315 10.3431 2.5 12 2.5C13.6569 2.5 15 3.84315 15 5.5V7"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path
            d="M9.5 10.5V11C9.5 11.5523 9.94772 12 10.5 12C11.0523 12 11.5 11.5523 11.5 11V10.5"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
        />
        <path
            d="M12.5 10.5V11C12.5 11.5523 12.9477 12 13.5 12C14.0523 12 14.5 11.5523 14.5 11V10.5"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
        />
        <line
            x1="8"
            y1="16"
            x2="16"
            y2="16"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="1.5 2"
            opacity="0.6"
        />
    </svg>
)

// 2. Editorial Search Lens
export const SearchIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.6" />
        <circle cx="11" cy="11" r="4.2" stroke={color} strokeWidth="0.8" opacity="0.35" strokeDasharray="2 2" />
        <path d="M16.5 16.5L21.5 21.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
)

// 3. Celestial Luxury Star (5-Point Sharp Faceted Star)
export const StarIcon = ({ size = 16, className = '', filled = false, color = '#D8B56D', emptyColor = '#E8DFE9', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M12 2.5L14.7 8.6L21.3 9.3L16.3 13.9L17.7 20.4L12 17.1L6.3 20.4L7.7 13.9L2.7 9.3L9.3 8.6L12 2.5Z"
            fill={filled ? color : emptyColor}
            stroke={filled ? color : emptyColor}
            strokeWidth="1.2"
            strokeLinejoin="round"
        />
        {filled && (
            <path
                d="M12 4.5V16L8 18.5L9 13.5L5 10L10 9.5L12 4.5Z"
                fill="white"
                opacity="0.25"
            />
        )}
    </svg>
)

// 4. Diamond Sparkle (Luxury Gleam)
export const SparklesIcon = ({ size = 18, className = '', color = '#D8B56D', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        {/* Main Diamond Star */}
        <path
            d="M12 2C12 7.5 14.5 10 20 10C14.5 10 12 12.5 12 18C12 12.5 9.5 10 4 10C9.5 10 12 7.5 12 2Z"
            fill={color}
        />
        {/* Secondary Minor Star */}
        <path
            d="M19 16C19 18 20 19 22 19C20 19 19 20 19 22C19 20 18 19 16 19C18 19 19 18 19 16Z"
            fill={color}
            opacity="0.8"
        />
        {/* Third Micro Star */}
        <circle cx="5.5" cy="18.5" r="1.5" fill={color} opacity="0.6" />
    </svg>
)

// 5. Royal British Emblem / Certified Seal
export const RoyalCrownIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M3.5 18H20.5V19.5C20.5 20.0523 20.0523 20.5 19.5 20.5H4.5C3.94772 20.5 3.5 20.0523 3.5 19.5V18Z"
            fill={color}
            stroke={color}
            strokeWidth="1.2"
        />
        <path
            d="M4 17L5.5 8L9.5 12.5L12 5.5L14.5 12.5L18.5 8L20 17H4Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <circle cx="12" cy="4.5" r="1.5" fill={color} />
        <circle cx="5.5" cy="7" r="1.2" fill={color} />
        <circle cx="18.5" cy="7" r="1.2" fill={color} />
    </svg>
)

// 6. Shield Verification (Original UK Import Guarantee)
export const ShieldCheckIcon = ({ size = 22, className = '', color = 'currentColor', accentColor = '#D8B56D', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M12 2.5L20 6.2V11.5C20 16.5 16.6 20.8 12 22C7.4 20.8 4 16.5 4 11.5V6.2L12 2.5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path
            d="M8.5 11.8L11 14.3L15.8 9.5"
            stroke={accentColor || color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// 7. Minimalist Security Lock
export const LockIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect
            x="5"
            y="10"
            width="14"
            height="11"
            rx="3"
            stroke={color}
            strokeWidth="1.6"
        />
        <path
            d="M8 10V6.5C8 4.567 9.79086 3 12 3C14.2091 3 16 4.567 16 6.5V10"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <circle cx="12" cy="15" r="1.2" fill={color} />
        <line x1="12" y1="16.2" x2="12" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

// 8. Express Delivery Courier Van
export const TruckIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M2 5C2 4.44772 2.44772 4 3 4H14C14.5523 4 15 4.44772 15 5V15H2V5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path
            d="M15 7.5H18.2C18.6 7.5 18.9 7.7 19.1 8L21.7 11.5C21.9 11.7 22 12.1 22 12.4V15C22 15.6 21.6 16 21 16H15V7.5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <circle cx="6.5" cy="18.5" r="2.5" stroke={color} strokeWidth="1.6" />
        <circle cx="17.5" cy="18.5" r="2.5" stroke={color} strokeWidth="1.6" />
        <line x1="9" y1="16" x2="15" y2="16" stroke={color} strokeWidth="1.6" />
        <line x1="1" y1="16" x2="4" y2="16" stroke={color} strokeWidth="1.6" />
    </svg>
)

// 9. Directional Editorial Arrows
export const ArrowRightIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M4 12H19M19 12L13 6M19 12L13 18"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const ArrowLeftIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M20 12H5M5 12L11 6M5 12L11 18"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const ChevronRightIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M9 5L16 12L9 19"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const ChevronLeftIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M15 19L8 12L15 5"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const ChevronDownIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M5 9L12 16L19 9"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// 10. Luxury Equalizer / Filter Sliders
export const FilterIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <line x1="3" y1="6" x2="10" y2="6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="16" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="13" cy="6" r="2.8" stroke={color} strokeWidth="1.6" />

        <line x1="3" y1="18" x2="8" y2="18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="11" cy="18" r="2.8" stroke={color} strokeWidth="1.6" />
    </svg>
)

// 11. Refined Precision Check
export const CheckIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M4.5 12.5L9.5 17.5L19.5 6.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// 12. Minimal Dismiss Cross
export const CloseIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 1.8, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M6 6L18 18M18 6L6 18"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
        />
    </svg>
)

// 13. Minimalist Vanity Refuse Receptacle
export const TrashIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path d="M4 6.5H20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path
            d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6.5H9V4Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <path
            d="M6 6.5L7.2 19.2C7.3 20.2 8.2 21 9.2 21H14.8C15.8 21 16.7 20.2 16.8 19.2L18 6.5"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <line x1="10" y1="10.5" x2="10" y2="17" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="14" y1="10.5" x2="14" y2="17" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
)

// 14. Plus & Minus Controls
export const PlusIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

export const MinusIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

// 15. Luxury Price Tag
export const TagIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M3 11.5V5C3 3.89543 3.89543 3 5 3H11.5L21.2 12.7C22 13.5 22 14.8 21.2 15.6L15.6 21.2C14.8 22 13.5 22 12.7 21.2L3 11.5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="1.8" fill={color} />
    </svg>
)

// 16. Communication & Location Suite
export const PhoneIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M5.5 3.5H9L10.5 7.5L8.5 9.5C9.8 12.2 11.8 14.2 14.5 15.5L16.5 13.5L20.5 15V18.5C20.5 19.6 19.6 20.5 18.5 20.5C9.9 20.5 3.5 14.1 3.5 5.5C3.5 4.4 4.4 3.5 5.5 3.5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path
            d="M15 4C17.2 4.4 19 6.2 19.4 8.5"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.75"
        />
        <path
            d="M15 1.5C18.6 2 21.5 4.9 22 8.5"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.5"
        />
    </svg>
)

export const MailIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth="1.6" />
        <path d="M4 7L12 13L20 7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="13" r="1.2" fill={color} opacity="0.6" />
    </svg>
)

export const MapPinIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M12 21C12 21 19 14.5 19 9.5C19 5.6 15.9 2.5 12 2.5C8.1 2.5 5 5.6 5 9.5C5 14.5 12 21 12 21Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="3" stroke={color} strokeWidth="1.4" />
    </svg>
)

// 17. High-End 2D Social Glyphs
export const WhatsAppIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M12 2C6.5 2 2 6.5 2 12C2 13.9 2.5 15.7 3.5 17.2L2.2 21.8L7 20.6C8.5 21.5 10.2 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <path
            d="M9.2 8.5C9 8 8.7 8 8.3 8C8 8 7.6 8.1 7.3 8.4C7 8.7 6.2 9.5 6.2 11C6.2 12.5 7.3 14 7.5 14.2C7.7 14.4 9.6 17.4 12.5 18.6C15 19.6 15.5 19.4 16 19.3C16.6 19.2 17.8 18.5 18.1 17.7C18.4 16.9 18.4 16.2 18.3 16.1C18.2 16 18 15.9 17.5 15.6C17 15.3 15 14.3 14.6 14.2C14.2 14.1 14 14 13.8 14.3C13.5 14.7 12.9 15.5 12.7 15.7C12.5 15.9 12.3 15.9 11.9 15.7C11.5 15.5 10.2 15.1 8.7 13.8C7.5 12.8 6.7 11.5 6.5 11.1C6.3 10.7 6.5 10.5 6.7 10.3C6.9 10.1 7.1 9.8 7.3 9.6C7.5 9.4 7.6 9.2 7.7 9C7.8 8.8 7.8 8.6 7.7 8.5C7.6 8.3 7.1 7.1 6.9 6.5"
            stroke={color}
            strokeWidth="1.2"
            strokeLinecap="round"
        />
    </svg>
)

export const FacebookIcon = ({ size = 18, className = '', color = 'currentColor', fill = 'none', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M18 2H15C12.2386 2 10 4.23858 10 7V10H7V14H10V22H14V14H17.2L17.8 10H14V7.5C14 6.94772 14.4477 6.5 15 6.5H18V2Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={fill === 'currentColor' ? color : fill}
        />
    </svg>
)

export const InstagramIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="3" y="3" width="18" height="18" rx="5.5" stroke={color} strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.2" fill={color} />
    </svg>
)

// 18. User Profile Glyph
export const UserIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <circle cx="12" cy="7.5" r="4.2" stroke={color} strokeWidth="1.6" />
        <path
            d="M4 20.5C4 16.5 7.5 13.8 12 13.8C16.5 13.8 20 16.5 20 20.5"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
)

// 19. Payment Badges (Clean 2D Vector)
export const CashDeliveryIcon = ({ size = 20, className = '', color = '#6C306E', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke={color} strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.4" />
        <circle cx="6" cy="12" r="1" fill={color} />
        <circle cx="18" cy="12" r="1" fill={color} />
    </svg>
)

export const MobileBankingIcon = ({ size = 20, className = '', color = '#E2136E', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="6" y="2.5" width="12" height="19" rx="3" stroke={color} strokeWidth="1.6" />
        <line x1="10" y1="5.5" x2="14" y2="5.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="1.3" fill={color} />
        <path d="M9 11L11.5 13.5L15 9" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const CardPaymentIcon = ({ size = 20, className = '', color = '#6C306E', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke={color} strokeWidth="1.6" />
        <line x1="2.5" y1="9.5" x2="21.5" y2="9.5" stroke={color} strokeWidth="1.6" />
        <rect x="5.5" y="13.5" width="4.5" height="2.5" rx="0.8" fill={color} opacity="0.6" />
    </svg>
)

// 20. Admin & Store Portal Icons
export const DashboardIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.6" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.6" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.6" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.6" />
    </svg>
)

export const StoreFrontIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path d="M3 9L4.5 4H19.5L21 9" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 9C3 10.1 3.9 11 5 11C6.1 11 7 10.1 7 9C7 10.1 7.9 11 9 11C10.1 11 11 10.1 11 9C11 10.1 11.9 11 13 11C14.1 11 15 10.1 15 9C15 10.1 15.9 11 17 11C18.1 11 19 10.1 19 9C19 10.1 19.9 11 21 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 11V20H19V11" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="6" stroke={color} strokeWidth="1.4" />
    </svg>
)

export const CouponTicketIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M3 8C4.5 8 5.5 7 5.5 5.5V5H18.5V5.5C18.5 7 19.5 8 21 8V16C19.5 16 18.5 17 18.5 18.5V19H5.5V18.5C5.5 17 4.5 16 3 16V8Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
        <line x1="9" y1="9" x2="9" y2="15" stroke={color} strokeWidth="1.4" strokeDasharray="1.5 2" />
        <circle cx="14.5" cy="12" r="1.5" fill={color} />
    </svg>
)

export const ProductListIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <line x1="8" y1="6" x2="20" y2="6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="8" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="8" y1="18" x2="20" y2="18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="4" cy="6" r="1.5" fill={color} />
        <circle cx="4" cy="12" r="1.5" fill={color} />
        <circle cx="4" cy="18" r="1.5" fill={color} />
    </svg>
)

export const AddSquareIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.6" />
        <line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
)

