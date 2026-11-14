import { NextResponse } from 'next/server'
import prisma, { isDatabaseConfigured } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
}

// In-memory version tracker initialized with server start time
let memoryVersions = {
    banners: Date.now(),
    promotions: Date.now(),
    categories: Date.now(),
    products: Date.now(),
    sections: Date.now(),
    settings: Date.now(),
    coupons: Date.now(),
    orders: Date.now(),
    inquiries: Date.now()
}

/**
 * Loads persisted versions from database Setting table
 */
async function loadPersistedVersions() {
    if (!isDatabaseConfigured() || !prisma?.setting) return memoryVersions
    try {
        const row = await prisma.setting.findUnique({
            where: { key: 'store_sync_versions' }
        })
        if (row?.value) {
            const parsed = JSON.parse(row.value)
            if (parsed && typeof parsed === 'object') {
                memoryVersions = { ...memoryVersions, ...parsed }
            }
        }
    } catch (e) {
        // Fallback to memory
    }
    return memoryVersions
}

/**
 * Persists versions to database Setting table
 */
async function savePersistedVersions(versions) {
    if (!isDatabaseConfigured() || !prisma?.setting) return
    try {
        await prisma.setting.upsert({
            where: { key: 'store_sync_versions' },
            create: {
                key: 'store_sync_versions',
                value: JSON.stringify(versions)
            },
            update: {
                value: JSON.stringify(versions)
            }
        })
    } catch (e) {
        // Ignore DB write error
    }
}

export async function GET() {
    try {
        await loadPersistedVersions()
        return NextResponse.json({
            success: true,
            versions: memoryVersions,
            serverTime: Date.now()
        }, { headers: NO_CACHE_HEADERS })
    } catch (error) {
        return NextResponse.json({
            success: true,
            versions: memoryVersions,
            serverTime: Date.now()
        }, { headers: NO_CACHE_HEADERS })
    }
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}))
        const rawType = String(body.type || '').trim().toLowerCase()
        const timestamp = Number(body.timestamp) || Date.now()

        // Normalize type alias
        let entityType = rawType
        if (rawType === 'hero_banners' || rawType === 'hero_banner_autoplay') entityType = 'banners'
        if (rawType === 'hero_promotions') entityType = 'promotions'
        if (rawType === 'homepage_sections') entityType = 'sections'

        if (entityType && memoryVersions[entityType] !== undefined) {
            memoryVersions[entityType] = timestamp
        } else if (entityType) {
            memoryVersions[entityType] = timestamp
        }

        // Fire-and-forget database persistence
        savePersistedVersions(memoryVersions).catch(() => {})

        // Optional server-side Supabase Realtime broadcast as backup
        try {
            if (supabase) {
                const channel = supabase.channel('ukbl_global_live_sync', {
                    config: { broadcast: { self: true } }
                })
                channel.send({
                    type: 'broadcast',
                    event: 'store_updated',
                    payload: {
                        type: entityType,
                        data: body.data || null,
                        timestamp
                    }
                }).catch(() => {})
            }
        } catch {}

        return NextResponse.json({
            success: true,
            versions: memoryVersions,
            updatedType: entityType
        }, { headers: NO_CACHE_HEADERS })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to update sync version'
        }, { status: 500, headers: NO_CACHE_HEADERS })
    }
}
