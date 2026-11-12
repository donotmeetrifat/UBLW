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

// 3. Golden Star (Bespoke 2D Clean Luxury Vector)
export const StarIcon = ({ size = 16, className = '', filled = false, color = '#D8B56D', emptyColor = '#E2D9E2', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path
            d="M12 2.5L14.5 8.6L21 9.1L16 13.3L17.6 19.7L12 16.2L6.4 19.7L8 13.3L3 9.1L9.5 8.6L12 2.5Z"
            stroke={filled ? color : emptyColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
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
export const DownloadIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

export const ReviewBadgeIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        <path d="M9 11.5l2 2 4-4" />
    </svg>
)

export const EditIcon = ({ size = 16, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

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
export const PhoneIcon = ({ size = 18, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const MobilePhoneIcon = ({ size = 18, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
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

// 14. Official WhatsApp Vector (Clean 2D Luxury Vector)
export const WhatsAppIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

export const OfficialWhatsAppIcon = ({ size = 24, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <circle cx="24" cy="24" r="24" fill="#25D366" />
        <path d="M35.15 12.85C32.18 9.88 28.24 8.24 24.03 8.24C15.22 8.24 8.07 15.39 8.07 24.2C8.07 27.01 8.8 29.76 10.19 32.17L8 40.16L16.19 38.01C18.52 39.28 21.24 39.95 24.02 39.95H24.03C32.84 39.95 40 32.8 40 23.99C40 19.78 38.12 15.82 35.15 12.85ZM24.03 37.26C21.65 37.26 19.32 36.62 17.29 35.41L16.81 35.12L12 36.38L13.29 31.69L12.97 31.18C11.64 29.07 10.94 26.68 10.94 24.2C10.94 16.98 16.82 11.11 24.04 11.11C27.54 11.11 30.82 12.47 33.29 14.95C35.76 17.42 37.13 20.71 37.12 24.21C37.12 31.43 31.25 37.26 24.03 37.26ZM31.23 27.56C30.83 27.36 28.89 26.4 28.53 26.27C28.17 26.14 27.91 26.07 27.65 26.47C27.39 26.87 26.64 27.75 26.41 28.01C26.18 28.28 25.95 28.31 25.55 28.11C25.15 27.91 23.86 27.49 22.33 26.12C21.13 25.06 20.32 23.75 20.09 23.35C19.86 22.95 20.06 22.73 20.26 22.53C20.44 22.35 20.66 22.06 20.86 21.83C21.06 21.6 21.13 21.43 21.26 21.17C21.39 20.9 21.33 20.67 21.23 20.47C21.13 20.27 20.34 18.33 20.01 17.53C19.69 16.76 19.36 16.86 19.12 16.85C18.89 16.84 18.63 16.84 18.37 16.84C18.11 16.84 17.68 16.94 17.32 17.33C16.96 17.73 15.93 18.69 15.93 20.66C15.93 22.63 17.36 24.53 17.56 24.8C17.76 25.06 20.38 29.11 24.39 30.84C25.35 31.25 26.09 31.5 26.67 31.68C27.63 31.99 28.51 31.94 29.2 31.84C29.98 31.72 31.59 30.86 31.92 29.93C32.25 29 32.25 28.2 32.15 28.03C32.05 27.87 31.63 27.76 31.23 27.56Z" fill="white" />
    </svg>
)

// 15. Socials
export const FacebookIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path
            d="M14 13.5h2.5l1-4H14V7.5c0-1.05.75-1.5 1.5-1.5h2V2.14c-.35-.05-1.55-.14-2.95-.14-3.1 0-5.05 1.89-5.05 5.2V9.5H6.5v4h3V23h4.5V13.5z"
            fill={color}
        />
    </svg>
)

export const OfficialFacebookIcon = ({ size = 24, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <circle cx="24" cy="24" r="24" fill="#1877F2" />
        <path d="M29.5 24.8L30.2 20.2H25.8V17.2C25.8 15.9 26.4 14.7 28.4 14.7H30.4V10.8C29.2 10.6 28 10.5 26.8 10.5C23.1 10.5 20.7 12.8 20.7 16.8V20.2H16.7V24.8H20.7V36.2C21.6 36.3 22.5 36.4 23.4 36.4C24.3 36.4 25.2 36.3 26.1 36.2V24.8H29.5Z" fill="white" />
    </svg>
)

export const InstagramIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth="1.75" />
        <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.75" />
        <circle cx="17.5" cy="6.5" r="1.25" fill={color} />
    </svg>
)

export const OfficialInstagramIcon = ({ size = 24, className = '', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <defs>
            <radialGradient id="official-ig-grad" cx="30%" cy="107%" r="130%" fx="30%" fy="107%">
                <stop offset="0%" stopColor="#fdf497" />
                <stop offset="5%" stopColor="#fdf497" />
                <stop offset="45%" stopColor="#fd5949" />
                <stop offset="60%" stopColor="#d6249f" />
                <stop offset="90%" stopColor="#285AEB" />
            </radialGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="url(#official-ig-grad)" />
        <rect x="11" y="11" width="26" height="26" rx="8" stroke="white" strokeWidth="3" fill="none" />
        <circle cx="24" cy="24" r="6" stroke="white" strokeWidth="3" fill="none" />
        <circle cx="31.5" cy="16.5" r="1.75" fill="white" />
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

export const PrinterIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
)

// 35. Bespoke 2D Clean Luxury Eye Icon (Show Password)
export const EyeIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path 
            d="M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z" 
            stroke={color} 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <circle cx="12" cy="12" r="3.25" stroke={color} strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.35" fill={color} />
    </svg>
)

// 36. Bespoke 2D Clean Luxury Eye-Off Icon (Hide Password)
export const EyeOffIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path 
            d="M10.5 5.15C11 5.05 11.5 5 12 5C16 5 19.5 7.5 21.5 12C20.3 14.7 18 16.8 15.2 17.9" 
            stroke={color} 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M6.5 6.5C4.8 7.9 3.4 9.8 2.5 12C4.5 16.5 8 19 12 19C13.8 19 15.4 18.4 16.8 17.5" 
            stroke={color} 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M14.15 14.15A3.25 3.25 0 0 1 9.85 9.85" 
            stroke={color} 
            strokeWidth="1.6" 
            strokeLinecap="round" 
        />
        <line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
)

// 37. Bespoke 2D Clean Luxury Video Icon
export const VideoIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <rect x="2.5" y="6" width="13.5" height="12" rx="2.5" stroke={color} strokeWidth="1.6" />
        <path d="M16 10L21 7V17L16 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="12" r="1.5" fill={color} />
    </svg>
)

// 38. Bespoke 2D Clean Luxury Camera Icon
export const CameraIcon = ({ size = 18, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M4 8H7L8.5 5.5H15.5L17 8H20C21.1 8 22 8.9 22 10V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V10C2 8.9 2.9 8 4 8Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="14" r="3.5" stroke={color} strokeWidth="1.6" />
        <circle cx="12" cy="14" r="1.25" fill={color} />
    </svg>
)

// 39. Trend Upward Icon
export const TrendIcon = ({ size = 18, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
)

// 40. Bar Chart Analytics Icon
export const ChartBarIcon = ({ size = 18, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
        <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
)

// 41. Hamburger Menu Icon
export const MenuIcon = ({ size = 20, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
)

// 42. Drag Reorder Grip Handle Icon (2D Clean Precision)
export const GripVerticalIcon = ({ size = 16, className = '', color = 'currentColor', ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <circle cx="9" cy="5" r="1.5" fill={color} />
        <circle cx="9" cy="12" r="1.5" fill={color} />
        <circle cx="9" cy="19" r="1.5" fill={color} />
        <circle cx="15" cy="5" r="1.5" fill={color} />
        <circle cx="15" cy="12" r="1.5" fill={color} />
        <circle cx="15" cy="19" r="1.5" fill={color} />
    </svg>
)

// 43. Clean 2D High-Res Cloud Upload Icon
export const UploadCloudIcon = ({ size = 20, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <path d="M16 16L12 12L8 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12V21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9H16.74A8 8 0 1 0 4.26 15.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
