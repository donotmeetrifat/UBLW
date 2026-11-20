'use client'

import { useState, useEffect } from 'react'
import { subscribeToStoreSync } from '@/lib/realtimeSync'
import { SOCIAL_LINKS } from '@/lib/constants/social'

function formatPhoneData(rawNumber) {
    if (!rawNumber || typeof rawNumber !== 'string') {
        return {
            phone: SOCIAL_LINKS.whatsapp.formatted,
            raw: SOCIAL_LINKS.whatsapp.raw,
            url: SOCIAL_LINKS.whatsapp.url,
        }
    }

    const cleanDigits = rawNumber.replace(/[^\d]/g, '')
    const raw = cleanDigits.startsWith('880')
        ? cleanDigits
        : cleanDigits.startsWith('0')
            ? `88${cleanDigits}`
            : `880${cleanDigits}`

    return {
        phone: rawNumber.trim(),
        raw: raw || SOCIAL_LINKS.whatsapp.raw,
        url: `https://wa.me/${raw || SOCIAL_LINKS.whatsapp.raw}`,
    }
}

/**
 * Universal Reactive Hook for Store WhatsApp & Hotline Phone Number
 * 
 * - Reactively listens to live Supabase Realtime + BroadcastChannel events
 * - Instantly updates all frontend components (<100ms) without page refresh
 * - Persists to localStorage for zero-layout-shift caching
 */
export function useStoreWhatsApp() {
    const [info, setInfo] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('ukbl_whatsapp_info')
                if (cached) {
                    const parsed = JSON.parse(cached)
                    if (parsed && parsed.phone && parsed.url) return parsed
                }
            } catch {}
        }
        return {
            phone: SOCIAL_LINKS.whatsapp.formatted,
            raw: SOCIAL_LINKS.whatsapp.raw,
            url: SOCIAL_LINKS.whatsapp.url,
        }
    })

    useEffect(() => {
        let isMounted = true

        // 1. Fetch live settings on mount to ensure synchronization with database
        fetch('/api/settings', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data) => {
                if (isMounted && data.success && data.whatsapp) {
                    const formatted = formatPhoneData(data.whatsapp.phone || data.whatsapp.raw)
                    setInfo(formatted)
                    try {
                        localStorage.setItem('ukbl_whatsapp_info', JSON.stringify(formatted))
                    } catch {}
                }
            })
            .catch(() => {})

        // 2. Subscribe to store-wide real-time sync channel
        const unsubscribe = subscribeToStoreSync((payload) => {
            if (payload.type === 'settings' || payload.type === 'ai_settings') {
                const newPhone = payload.data?.whatsappHotline ||
                    payload.data?.whatsapp?.phone ||
                    payload.data?.whatsappPhone ||
                    payload.data?.whatsapp

                if (newPhone && typeof newPhone === 'string') {
                    const formatted = formatPhoneData(newPhone)
                    setInfo(formatted)
                    try {
                        localStorage.setItem('ukbl_whatsapp_info', JSON.stringify(formatted))
                    } catch {}
                }
            }
        })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    return info
}
