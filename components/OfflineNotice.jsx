'use client'

import React, { useState, useEffect } from 'react'

export default function OfflineNotice() {
    const [isOffline, setIsOffline] = useState(false)
    const [justReconnected, setJustReconnected] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const updateOnlineStatus = () => {
            const offline = !navigator.onLine
            setIsOffline(offline)

            if (!offline) {
                setJustReconnected(true)
                const timer = setTimeout(() => {
                    setJustReconnected(false)
                }, 3500)
                return () => clearTimeout(timer)
            }
        }

        // Initialize state
        setIsOffline(!navigator.onLine)

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)

        return () => {
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
        }
    }, [])

    if (!isOffline && !justReconnected) return null

    return (
        <aside
            aria-live="polite"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 select-none"
            style={{
                backgroundColor: isOffline ? 'rgba(36, 18, 36, 0.92)' : 'rgba(16, 185, 129, 0.92)',
                borderColor: isOffline ? '#EFE0EF' : '#A7F3D0',
                color: '#FFFFFF'
            }}
        >
            <div className="flex items-center gap-2.5 text-xs font-bold">
                <span className={`size-2 rounded-full ${isOffline ? 'bg-amber-400 animate-pulse' : 'bg-white'}`} />
                <span>
                    {isOffline
                        ? 'Offline Mode Active • Saved products & shopping bag remain accessible'
                        : 'Connection Restored • Live store catalog re-synchronized'}
                </span>
            </div>
        </aside>
    )
}

