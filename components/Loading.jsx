'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { assets } from '@/assets/assets'

const Loading = ({ message = 'Curating Authentic UK Beauty', compact = false }) => {
    return (
        <div className={`relative flex flex-col items-center justify-center w-full select-none ${compact ? 'py-8' : 'min-h-[55vh] py-16'}`}>
            {/* Ambient luxury glow aura in background */}
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#6C306E]/8 via-[#D8B56D]/8 to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Floating Luxury Glass Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative bg-white/90 backdrop-blur-md border border-[#EFE0EF] rounded-3xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(108,48,110,0.06)] flex flex-col items-center gap-4 max-w-[260px] w-full"
            >
                {/* Center Animated Emblem */}
                <div className="relative size-18 flex items-center justify-center">
                    {/* Outer smooth spinning gradient ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6C306E] border-r-[#D8B56D]/50 border-b-[#EFE0EF]"
                    />

                    {/* Secondary soft counter-rotating aura */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 4.8, ease: "linear" }}
                        className="absolute inset-1.5 rounded-full border border-dashed border-[#6C306E]/20"
                    />

                    {/* Breathing inner circular pedestal */}
                    <motion.div
                        animate={{ scale: [0.94, 1.04, 0.94] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="size-12 rounded-2xl bg-gradient-to-b from-[#FAF6FA] to-white border border-[#EFE0EF] p-2 flex items-center justify-center shadow-xs"
                    >
                        <Image
                            src={assets.webLogo}
                            alt="UK Brand Lover"
                            width={32}
                            height={32}
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </div>

                {/* Typography with clean typography and spacing */}
                <div className="text-center space-y-1">
                    <p className="text-[11px] font-black tracking-[0.22em] text-[#241224] uppercase">
                        UK Brand Lover
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 tracking-wide">
                        {message}
                    </p>
                </div>

                {/* Smooth flowing liquid shimmer indicator */}
                <div className="w-24 h-1 bg-[#FAF6FA] border border-[#EFE0EF] rounded-full overflow-hidden relative">
                    <motion.div
                        animate={{ x: [-80, 100] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.4,
                            ease: "easeInOut",
                        }}
                        className="w-12 h-full rounded-full bg-gradient-to-r from-transparent via-[#6C306E] to-transparent"
                    />
                </div>
            </motion.div>
        </div>
    )
}

export default Loading
