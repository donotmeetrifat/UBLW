'use client'

import React from 'react'
import { Mascot } from 'page-mascot'

export default function EmmaAvatar({ size = 36, className = '' }) {
    return (
        <div
            style={{ width: size, height: size }}
            className={`relative rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-[#FCE7F3] via-[#FDF2F8] to-white flex items-center justify-center shadow-2xs select-none border border-[#6C306E]/15 ${className}`}
        >
            <Mascot
                directions="/mascots/ballerina-directions.webp"
                reactions="/mascots/ballerina-reactions.webp"
                size={size}
                label="Emma AI"
                className="w-full h-full flex items-center justify-center cursor-pointer"
            />
        </div>
    )
}
