'use client'

import React from 'react'

/**
 * Clean, Minimalist, High-Fashion 2D Vector SVG Icon Suite
 * Pixel-perfect on 24x24 grid, smooth geometry, consistent stroke weights.
 */

// 1. Luxury Shopping Bag
export const BagIcon = ({ size = 20, className = '', color = 'currentColor', fill = 'none', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M6 7H18V20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20V7Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 8V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V8" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

// 2. Search Lens
export const SearchIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.75" />
        <path d="M16.5 16.5L21 21" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

// 3. Golden Star
export const StarIcon = ({ size = 16, className = '', filled = false, color = '#D8B56D', emptyColor = '#E2E8F0', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            stroke={filled ? color : emptyColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
)

// 4. Sparkles / Luxury Accent
export const SparklesIcon = ({ size = 18, className = '', color = '#D8B56D', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M12 3V21M3 12H21M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" opacity="0.3" />
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill={color} />
    </svg>
)

// 5. Royal Crown
export const RoyalCrownIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M4 18H20V20H4V18Z" fill={color} />
        <path d="M4 18L6 8L10 12L12 6L14 12L18 8L20 18H4Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="6" cy="7" r="1.25" fill={color} />
        <circle cx="12" cy="5" r="1.25" fill={color} />
        <circle cx="18" cy="7" r="1.25" fill={color} />
    </svg>
)

export const CrownIcon = RoyalCrownIcon

// 6. Shield Check / Authenticity
export const ShieldCheckIcon = ({ size = 22, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M12 3L4 6.5V12C4 16.5 7.5 20.5 12 21.5C16.5 20.5 20 16.5 20 12V6.5L12 3Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// 7. Security Lock
export const LockIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="5" y="11" width="14" height="10" rx="2.5" stroke={color} strokeWidth="1.75" />
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill={color} />
    </svg>
)

// 8. Express Delivery Courier Truck
export const TruckIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M2 5H15V16H2V5Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M15 9H19L22 12V16H15V9Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="6.5" cy="18.5" r="2" stroke={color} strokeWidth="1.75" />
        <circle cx="18.5" cy="18.5" r="2" stroke={color} strokeWidth="1.75" />
    </svg>
)

// 9. Arrows & Navigation
export const ArrowRightIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const ArrowLeftIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const ChevronRightIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M9 6L15 12L9 18" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const ChevronLeftIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const ChevronDownIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// 10. Filter & Controls
export const FilterIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M3 6H21M6 12H18M10 18H14" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

// 11. Check & Close
export const CheckIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M5 13L9.5 17.5L19 7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const CloseIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// 12. Actions
export const TrashIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const PlusIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

export const MinusIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M5 12H19" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

export const TagIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M20.59 13.41L13.42 20.58C12.64 21.36 11.37 21.36 10.59 20.58L3 13V3H13L20.59 10.59C21.37 11.37 21.37 12.63 20.59 13.41Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="7.5" cy="7.5" r="1.5" fill={color} />
    </svg>
)

// 13. Communication & Location
export const PhoneIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M22 16.92V19.92C22 20.48 21.54 20.93 20.98 20.92C10.5 20.42 3.58 13.5 3.08 3.02C3.07 2.46 3.52 2 4.08 2H7.08C7.59 2 8.02 2.38 8.08 2.89L8.78 7.39C8.83 7.74 8.68 8.09 8.39 8.31L6.71 9.57C8.16 12.67 11.33 15.84 14.43 17.29L15.69 15.61C15.91 15.32 16.26 15.17 16.61 15.22L21.11 15.92C21.62 15.98 22 16.41 22 16.92Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
)

export const MailIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.75" />
        <path d="M4 6.5L12 12.5L20 6.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const MapPinIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M12 21C16 16.5 19 13.5 19 9.5C19 5.35786 15.866 2 12 2C8.13401 2 5 5.35786 5 9.5C5 13.5 8 16.5 12 21Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="3" stroke={color} strokeWidth="1.75" />
    </svg>
)

// 14. Official WhatsApp Vector
export const WhatsAppIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.38 17.07L2 22L7.09 20.67C8.54 21.52 10.22 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M8.5 7.5C8.2 6.8 7.8 6.8 7.3 6.8C6.9 6.8 6.4 7.2 6.4 8C6.4 9.8 7.7 12.2 9.8 14.3C11.9 16.4 14.3 17.7 16.1 17.7C16.9 17.7 17.3 17.2 17.3 16.8C17.3 16.3 17.3 15.9 16.6 15.6L14.7 14.7C14.3 14.5 14 14.7 13.7 15L13 15.9C12.7 16.2 12.3 16.2 11.9 16C10.7 15.4 9.3 14 8.7 12.8C8.5 12.4 8.5 12 8.8 11.7L9.7 11C10 10.7 10.2 10.4 10 10L9.1 8.1C8.9 7.6 8.7 7.7 8.5 7.5Z" fill={color} />
    </svg>
)

// 15. Socials
export const FacebookIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M18 2H15C12.7909 2 11 3.79086 11 6V9H8V13H11V22H15V13H18L19 9H15V6C15 5.44772 15.4477 5 16 5H18V2Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
)

export const InstagramIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth="1.75" />
        <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.75" />
        <circle cx="17.5" cy="6.5" r="1.25" fill={color} />
    </svg>
)

// 16. User & Account
export const UserIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.75" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

// 17. Payment Methods
export const CashDeliveryIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="1.75" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.75" />
        <path d="M6 12H6.01M18 12H18.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

export const MobileBankingIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="6" y="2" width="12" height="20" rx="3" stroke={color} strokeWidth="1.75" />
        <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth="1.75" />
    </svg>
)

export const CardPaymentIcon = ({ size = 20, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="1.75" />
        <line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="1.75" />
        <line x1="6" y1="15" x2="10" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
)

// 18. Admin & Store
export const DashboardIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.75" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.75" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.75" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.75" />
    </svg>
)

export const StoreFrontIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M3 9L4.5 4H19.5L21 9V10C21 11.1 20.1 12 19 12C17.9 12 17 11.1 17 10C17 11.1 16.1 12 15 12C13.9 12 13 11.1 13 10C13 11.1 12.1 12 11 12C9.9 12 9 11.1 9 10C9 11.1 8.1 12 7 12C5.9 12 5 11.1 5 10V9H3Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M4 12V20H20V12" stroke={color} strokeWidth="1.75" />
        <path d="M9 20V14H15V20" stroke={color} strokeWidth="1.75" />
    </svg>
)

export const StoreIcon = StoreFrontIcon

export const CouponTicketIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V9C19.8954 9 19 9.89543 19 11C19 12.1046 19.8954 13 21 13V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V13C4.10457 13 5 12.1046 5 11C5 9.89543 4.10457 9 3 9V6Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="1.75" strokeDasharray="2 3" />
    </svg>
)

export const ProductListIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <line x1="8" y1="6" x2="20" y2="6" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <line x1="8" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <line x1="8" y1="18" x2="20" y2="18" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="4" cy="6" r="1.5" fill={color} />
        <circle cx="4" cy="12" r="1.5" fill={color} />
        <circle cx="4" cy="18" r="1.5" fill={color} />
    </svg>
)

export const AddSquareIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.75" />
        <line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

export const ClockIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" />
        <polyline points="12 7 12 12 15 14" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const BoxIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M3.27 7.96L12 13L20.73 7.96" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="21" x2="12" y2="13" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)

export const PlaneIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill={color} />
    </svg>
)

export const UploadIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17 8 12 3 7 8" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
)
