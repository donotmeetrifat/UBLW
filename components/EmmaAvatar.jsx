'use client'

import React from 'react'

export default function EmmaAvatar({ size = 36, className = '' }) {
    return (
        <div
            style={{ width: size, height: size }}
            className={`relative rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-[#6C306E] via-[#8E3B91] to-[#E879F9] flex items-center justify-center text-white shadow-2xs select-none border border-white/60 ${className}`}
        >
            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover"
            >
                <circle cx="20" cy="20" r="20" fill="url(#emma-grad)" />
                {/* Face & Neck */}
                <ellipse cx="20" cy="16" rx="6.5" ry="7.5" fill="#FCE7F3" />
                {/* Hair */}
                <path
                    d="M13.5 16.5C13.5 11 16.5 8.5 20 8.5C23.5 8.5 26.5 11 26.5 16.5C26.5 18 26 19.5 25.5 20C24.5 17 24 15 20 15C16 15 15.5 17 14.5 20C14 19.5 13.5 18 13.5 16.5Z"
                    fill="#3B103C"
                />
                {/* Gentle Smile */}
                <path d="M18.5 18C19 18.7 21 18.7 21.5 18" stroke="#3B103C" strokeWidth="1.2" strokeLinecap="round" />
                {/* Professional UK Consultant Blazer */}
                <path
                    d="M9 34C9 27.5 14 24 20 24C26 24 31 27.5 31 34V40H9V34Z"
                    fill="#4A154D"
                />
                <path
                    d="M17 24L20 28.5L23 24V26L20 30.5L17 26V24Z"
                    fill="#FCE7F3"
                />
                <defs>
                    <linearGradient id="emma-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6C306E" />
                        <stop offset="0.6" stopColor="#562258" />
                        <stop offset="1" stopColor="#300A32" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}
