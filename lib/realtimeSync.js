'use client'

import { supabase } from './supabase'

const SYNC_CHANNEL_NAME = 'ukbl_global_live_sync'
const EVENT_NAME = 'store_updated'

let activeChannel = null
const subscribers = new Set()
let isConnecting = false

/**
 * Initializes and returns the shared Supabase Realtime channel singleton.
 */
export function getRealtimeSyncChannel() {
    if (typeof window === 'undefined') return null

    if (activeChannel) {
        return activeChannel
    }

    if (isConnecting) {
        return activeChannel
    }

    try {
        isConnecting = true
        activeChannel = supabase.channel(SYNC_CHANNEL_NAME, {
            config: {
                broadcast: { self: true } // Ensures same-tab and multi-tab broadcast receipt
            }
        })

        activeChannel.on('broadcast', { event: EVENT_NAME }, (message) => {
            const payload = message?.payload
            if (!payload || !payload.type) return

            // Deliver incoming payload to all registered listeners
            subscribers.forEach((callback) => {
                try {
                    callback(payload)
                } catch (err) {
                    console.error('[RealtimeSync] Listener error:', err)
                }
            })
        })

        activeChannel.subscribe((status, err) => {
            isConnecting = false
            if (status === 'SUBSCRIBED') {
                // Successfully connected to Supabase Realtime mesh
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                console.warn('[RealtimeSync] Channel disconnected with status:', status, err || '')
                // Reset so next interaction or timer reconnects
                activeChannel = null
            }
        })
    } catch (e) {
        isConnecting = false
        console.error('[RealtimeSync] Failed to initialize Supabase channel:', e)
    }

    return activeChannel
}

/**
 * Subscribes a listener function to store-wide real-time updates.
 * Returns an unsubscribe cleanup function.
 * 
 * @param {Function} callback - Function receiving { type, data, timestamp }
 * @returns {Function} unsubscribe cleanup function
 */
export function subscribeToStoreSync(callback) {
    if (typeof window === 'undefined' || typeof callback !== 'function') {
        return () => {}
    }

    subscribers.add(callback)
    getRealtimeSyncChannel()

    return () => {
        subscribers.delete(callback)
    }
}

/**
 * Broadcasts a store-wide update to ALL visitors and admins worldwide instantly (<100ms).
 * Also notifies local tabs via BroadcastChannel and updates local storage.
 * 
 * @param {string} type - Entity type: 'banners' | 'promotions' | 'categories' | 'products' | 'sections' | 'settings' | 'coupons' | 'orders' | 'inquiries'
 * @param {any} data - Updated data payload (e.g. array of banners, promotional object, updated category/product)
 */
export async function broadcastStoreChange(type, data = null) {
    if (typeof window === 'undefined') return

    const normalizedType = String(type || '').trim().toLowerCase()
    const payload = {
        type: normalizedType,
        data,
        timestamp: Date.now()
    }

    // 1. GLOBAL REAL-TIME MESH: Supabase Realtime Broadcast (cross-device, cross-network)
    try {
        const channel = getRealtimeSyncChannel()
        if (channel) {
            channel.send({
                type: 'broadcast',
                event: EVENT_NAME,
                payload
            }).catch((sendErr) => {
                console.warn('[RealtimeSync] Supabase broadcast failed:', sendErr)
            })
        }
    } catch (realtimeErr) {
        console.warn('[RealtimeSync] Realtime mesh error:', realtimeErr)
    }

    // 2. SAME-DEVICE BROADCAST: BroadcastChannel for immediate 0ms local tab reaction
    try {
        const bc = new BroadcastChannel('ukbl_catalog_channel')
        bc.postMessage({
            type: `${normalizedType}-updated`,
            ...data,
            timestamp: payload.timestamp
        })
        setTimeout(() => {
            try { bc.close() } catch {}
        }, 300)
    } catch {}

    // 3. SAME-BROWSER STORAGE EVENT: triggers storage listeners in peer tabs
    try {
        localStorage.setItem(`ukbl_${normalizedType}_synced`, payload.timestamp.toString())
    } catch {}

    // 4. LOCAL WINDOW CUSTOM EVENT: immediate 0ms reaction inside current page
    try {
        window.dispatchEvent(new CustomEvent('store-sync-event', { detail: payload }))
        window.dispatchEvent(new CustomEvent(`${normalizedType}-updated`, { detail: data }))
    } catch {}

    // 5. SERVER VERSION API PING (fire-and-forget, for polling/reconnect safety)
    try {
        fetch('/api/sync/version', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: normalizedType, timestamp: payload.timestamp })
        }).catch(() => {})
    } catch {}
}
