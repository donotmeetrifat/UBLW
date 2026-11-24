'use client'

import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import { broadcastStoreChange } from '@/lib/realtimeSync'
import MobileMockup from '@/components/ui/great-ui-mobile-mockup'
import AdminDropdown from '@/components/admin/AdminDropdown'
import {
    SparklesIcon,
    CheckIcon,
    RefreshIcon,
    EyeIcon,
    EyeOffIcon,
    DisconnectIcon,
    OfficialWhatsAppIcon,
    PhoneIcon,
    LockIcon,
    ClockIcon,
    SendIcon,
    StoreIcon
} from '@/components/icons'

const CART_RECOVERY_DELAY_OPTIONS = [
    { value: '0.5', label: '30 Minutes (Fast recovery)' },
    { value: '1', label: '1 Hour (Industry standard)' },
    { value: '2', label: '2 Hours' },
    { value: '6', label: '6 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '24 Hours' },
]

// Verified official ElevenLabs premade female voices supported via API on standard accounts
const defaultCuratedVoices = [
    {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah - Mature, Reassuring, Confident',
        labels: { accent: 'American / British', gender: 'Female', description: 'Soft, Warm & Reassuring' },
        category: 'premade',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3'
    },
    {
        voice_id: 'cgSgspJ2msm6clMCkdW9',
        name: 'Jessica - Playful, Bright, Warm',
        labels: { accent: 'American', gender: 'Female', description: 'Friendly, Lively & Engaging' },
        category: 'premade',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3'
    },
    {
        voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
        name: 'Alice - Clear, Engaging Educator',
        labels: { accent: 'British', gender: 'Female', description: 'Confident, Articulate & Polite' },
        category: 'premade',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3'
    },
    {
        voice_id: 'XrExE9yKIg1WjnnlVkGX',
        name: 'Matilda - Knowledgeable, Professional',
        labels: { accent: 'American', gender: 'Female', description: 'Upbeat & Professional Advisor' },
        category: 'premade',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3'
    },
    {
        voice_id: 'hpp4J3VqNfWAUOO0d1Us',
        name: 'Bella - Professional, Bright, Warm',
        labels: { accent: 'American', gender: 'Female', description: 'Polite, Natural & Engaging' },
        category: 'premade',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/hpp4J3VqNfWAUOO0d1Us/dab0f5ba-3aa4-48a8-9fad-f138fea1126d.mp3'
    },
    {
        voice_id: 'pFZP5JQG7iQjIQuC4Bku',
        name: 'Lily - Velvety Actress',
        labels: { accent: 'British', gender: 'Female', description: 'Refined, Luxurious & Calm' },
        category: 'premade',
        preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3'
    },
    {
        voice_id: 'FGY2WhTYpPnrIDTdsKH5',
        name: 'Laura - Enthusiast, Quirky Attitude',
        labels: { accent: 'American', gender: 'Female', description: 'Enthusiastic, Sunny & Upbeat' },
        category: 'premade',
        preview_url: 'https://api.us.elevenlabs.io/v1/voices/FGY2WhTYpPnrIDTdsKH5/previews/audio?payload=eyJ2b2ljZV9zb3VyY2UiOiJwcmVtYWRlIiwiZmlsZW5hbWUiOiI2NzM0MTc1OS1hZDA4LTQxYTUtYmU2ZS1kZTEyZmU0NDg2MTgubXAzIiwidGltZXN0YW1wIjoxNzk0OTc0NDAwMDAwMDAwfQ%3D%3D'
    },
];

const DEFAULT_STAGE_1 = `Assalamu Alaikum {customer_name}! ✨

We noticed you left the authentic UK imported *{product_name}* (৳{product_price}) in your shopping bag.

Because our fresh London Heathrow shipment is in high demand, we have reserved your item. Complete your order before authentic UK stock runs out! 🛍️

👉 Tap here to complete your order with Nationwide Express Delivery:
{cart_url}

— UK Brand Lover`;

const DEFAULT_STAGE_2 = `Hello {customer_name}! ⏳

Quick reminder regarding your reserved *{product_name}* in your shopping bag.

Our authentic UK imported stock is strictly limited. Please complete your checkout soon so your reserved item is not released to other shoppers.

👉 Tap here to complete your order:
{cart_url}

— UK Brand Lover`;

const DEFAULT_STAGE_3 = `Final Notice for {customer_name}! 🚨

Your reserved item *{product_name}* in your shopping bag will soon be released back to public inventory.

Complete your order now to secure 100% genuine UK imported stock with Nationwide Express Delivery:
{cart_url}

— UK Brand Lover`;

export default function AdminAiBotPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testingProvider, setTestingProvider] = useState(null)
    const [disconnectingProvider, setDisconnectingProvider] = useState(null)

    // Connection States
    const [isGeminiConnected, setIsGeminiConnected] = useState(false)
    const [geminiKey, setGeminiKey] = useState('')
    const [showGeminiKey, setShowGeminiKey] = useState(false)
    const [geminiModel, setGeminiModel] = useState('')

    const [isGemini2Connected, setIsGemini2Connected] = useState(false)
    const [gemini2Key, setGemini2Key] = useState('')
    const [showGemini2Key, setShowGemini2Key] = useState(false)
    const [gemini2Model, setGemini2Model] = useState('')

    const [isGroqConnected, setIsGroqConnected] = useState(false)
    const [groqKey, setGroqKey] = useState('')
    const [showGroqKey, setShowGroqKey] = useState(false)
    const [groqModel, setGroqModel] = useState('')

    const [isOpenRouterConnected, setIsOpenRouterConnected] = useState(false)
    const [openRouterKey, setOpenRouterKey] = useState('')
    const [showOpenRouterKey, setShowOpenRouterKey] = useState(false)

    // ElevenLabs Voice Engine Multi-Account Pool (Slots 1 to 5)
    const [elevenLabsAccounts, setElevenLabsAccounts] = useState([
        { slot: 1, label: 'Account 1 (Primary)', provider: 'elevenlabs', key: '', isConnected: false, showKey: false, subscription: null },
        { slot: 2, label: 'Account 2', provider: 'elevenlabs2', key: '', isConnected: false, showKey: false, subscription: null },
        { slot: 3, label: 'Account 3', provider: 'elevenlabs3', key: '', isConnected: false, showKey: false, subscription: null },
        { slot: 4, label: 'Account 4', provider: 'elevenlabs4', key: '', isConnected: false, showKey: false, subscription: null },
        { slot: 5, label: 'Account 5', provider: 'elevenlabs5', key: '', isConnected: false, showKey: false, subscription: null },
    ])
    const [elevenLabsPooled, setElevenLabsPooled] = useState({
        totalConnected: 0,
        totalCharactersUsed: 0,
        totalCharacterLimit: 0,
        totalCharactersRemaining: 0,
    })
    const [availableVoices, setAvailableVoices] = useState([])
    const [selectedVoiceId, setSelectedVoiceId] = useState('EXAVITQu4vr4xnSDxMaL')
    const [selectedVoiceName, setSelectedVoiceName] = useState('Sarah (Soft & Warm)')
    const [playingVoiceId, setPlayingVoiceId] = useState(null)
    const [audioPlayer, setAudioPlayer] = useState(null)
    const [voiceCallEnabled, setVoiceCallEnabled] = useState(true)
    const [loadingVoices, setLoadingVoices] = useState(false)

    const [preferredProvider, setPreferredProvider] = useState('gemini')
    const [customInstructions, setCustomInstructions] = useState('')
    const [botName, setBotName] = useState('Emma - UK Beauty Specialist')
    const [enabled, setEnabled] = useState(true)

    // WhatsApp Cloud API & Recovery States
    const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false)
    const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('')
    const [whatsappAccessToken, setWhatsappAccessToken] = useState('')
    const [showWhatsAppToken, setShowWhatsAppToken] = useState(false)
    const [whatsappBusinessAccountId, setWhatsappBusinessAccountId] = useState('')
    const [whatsappHotline, setWhatsappHotline] = useState('+880 1959-524393')
    const [whatsappRecoveryEnabled, setWhatsappRecoveryEnabled] = useState(true)
    const [whatsappRecoveryDelayHours, setWhatsappRecoveryDelayHours] = useState('1')
    const [whatsappStage2Enabled, setWhatsappStage2Enabled] = useState(true)
    const [whatsappStage3Enabled, setWhatsappStage3Enabled] = useState(true)
    const [activeTemplateStageTab, setActiveTemplateStageTab] = useState(1)
    const [whatsappTemplateStage1, setWhatsappTemplateStage1] = useState(DEFAULT_STAGE_1)
    const [whatsappTemplateStage2, setWhatsappTemplateStage2] = useState(DEFAULT_STAGE_2)
    const [whatsappTemplateStage3, setWhatsappTemplateStage3] = useState(DEFAULT_STAGE_3)
    const [testRecipientPhone, setTestRecipientPhone] = useState('')
    const [isSendingTestWhatsApp, setIsSendingTestWhatsApp] = useState(false)
    const [isVerifyingWhatsApp, setIsVerifyingWhatsApp] = useState(false)
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false)

    // Catalog stats
    const [catalogStats, setCatalogStats] = useState({
        totalActiveProducts: 0,
        inStockProducts: 0,
        outOfStockProducts: 0,
    })

    // Fetch AI settings
    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/ai-settings?_t=' + Date.now(), { cache: 'no-store' })
            const data = await res.json()

            if (data.success && data.settings) {
                const s = data.settings

                // Gemini Status
                const geminiConn = Boolean(s.gemini?.isConnected || s.hasGeminiKey)
                setIsGeminiConnected(geminiConn)
                setGeminiKey(s.gemini?.maskedKey || s.maskedGeminiKey || '')

                // Gemini Backup Status
                const gemini2Conn = Boolean(s.gemini2?.isConnected || s.hasGeminiKey2)
                setIsGemini2Connected(gemini2Conn)
                setGemini2Key(s.gemini2?.maskedKey || s.maskedGeminiKey2 || '')

                // Groq Status
                const groqConn = Boolean(s.groq?.isConnected || s.hasGroqKey || s.hasGrokKey)
                setIsGroqConnected(groqConn)
                setGroqKey(s.groq?.maskedKey || s.maskedGroqKey || s.maskedGrokKey || '')

                // OpenRouter Status
                const openRouterConn = Boolean(s.openrouter?.isConnected || s.hasOpenRouterKey)
                setIsOpenRouterConnected(openRouterConn)
                setOpenRouterKey(s.openrouter?.maskedKey || s.maskedOpenRouterKey || '')

                // ElevenLabs Multi-Account Engine (Slots 1 to 5)
                const rawAccounts = s.elevenLabsAccounts || s.elevenlabsAccounts
                if (Array.isArray(rawAccounts) && rawAccounts.length > 0) {
                    setElevenLabsAccounts(prev => prev.map((item, idx) => {
                        const sAcc = rawAccounts[idx] || {}
                        const isConn = Boolean(sAcc.isConnected || (sAcc.maskedKey && sAcc.maskedKey.length > 0))
                        return {
                            ...item,
                            isConnected: isConn,
                            key: sAcc.maskedKey || (item.key && !item.key.includes('••••') ? item.key : ''),
                            subscription: sAcc.subscription || null,
                        }
                    }))
                } else {
                    // Fallback from legacy format
                    const configs = [
                        { has: s.elevenlabs?.isConnected || s.hasElevenLabsKey, masked: s.elevenlabs?.maskedKey || s.maskedElevenLabsKey, sub: s.elevenlabs?.subscription },
                        { has: s.elevenlabs2?.isConnected || s.hasElevenLabsKey2, masked: s.elevenlabs2?.maskedKey || s.maskedElevenLabsKey2, sub: s.elevenlabs2?.subscription },
                        { has: s.elevenlabs3?.isConnected || s.hasElevenLabsKey3, masked: s.elevenlabs3?.maskedKey || s.maskedElevenLabsKey3, sub: s.elevenlabs3?.subscription },
                        { has: s.elevenlabs4?.isConnected || s.hasElevenLabsKey4, masked: s.elevenlabs4?.maskedKey || s.maskedElevenLabsKey4, sub: s.elevenlabs4?.subscription },
                        { has: s.elevenlabs5?.isConnected || s.hasElevenLabsKey5, masked: s.elevenlabs5?.maskedKey || s.maskedElevenLabsKey5, sub: s.elevenlabs5?.subscription },
                    ]
                    setElevenLabsAccounts(prev => prev.map((item, idx) => ({
                        ...item,
                        isConnected: Boolean(configs[idx]?.has || (configs[idx]?.masked && configs[idx]?.masked.length > 0)),
                        key: configs[idx]?.masked || item.key,
                        subscription: configs[idx]?.sub || null,
                    })))
                }

                const pooled = s.elevenLabsPooled || s.elevenlabsPooled
                if (pooled) {
                    setElevenLabsPooled(pooled)
                }
                if (s.elevenlabs?.selectedVoiceId) setSelectedVoiceId(s.elevenlabs.selectedVoiceId)
                if (s.elevenlabs?.selectedVoiceName) setSelectedVoiceName(s.elevenlabs.selectedVoiceName)
                if (s.elevenlabs?.voiceCallEnabled !== undefined) setVoiceCallEnabled(s.elevenlabs.voiceCallEnabled)

                const hasAnyConnected = (rawAccounts || []).some(a => a.isConnected || (a.maskedKey && a.maskedKey.length > 0)) || Boolean(s.elevenlabs?.isConnected || s.hasElevenLabsKey)
                if (hasAnyConnected) {
                    fetchVoices()
                }

                const normPref = s.preferredProvider === 'grok' ? 'groq' : (s.preferredProvider || 'gemini')
                setPreferredProvider(normPref)
                setCustomInstructions(s.customInstructions || '')
                setBotName(s.botName || 'Emma - UK Beauty Specialist')
                setEnabled(s.enabled !== false)

                // WhatsApp Cloud API & Recovery Settings
                const wa = s.whatsapp || {}
                setIsWhatsAppConnected(Boolean(wa.isConnected))
                setWhatsappPhoneNumberId(wa.phoneNumberId || '')
                setWhatsappAccessToken(wa.maskedAccessToken || '')
                setWhatsappBusinessAccountId(wa.businessAccountId || '')
                setWhatsappHotline(wa.hotline || '+880 1959-524393')
                setWhatsappRecoveryEnabled(wa.recoveryEnabled !== false)
                setWhatsappRecoveryDelayHours(String(wa.recoveryDelayHours || 1))
                if (wa.stage2Enabled !== undefined) setWhatsappStage2Enabled(wa.stage2Enabled !== false)
                if (wa.stage3Enabled !== undefined) setWhatsappStage3Enabled(wa.stage3Enabled !== false)
                if (wa.templateStage1) setWhatsappTemplateStage1(wa.templateStage1)
                if (wa.templateStage2) setWhatsappTemplateStage2(wa.templateStage2)
                if (wa.templateStage3) setWhatsappTemplateStage3(wa.templateStage3)

                if (data.catalogStats) {
                    setCatalogStats(data.catalogStats)
                }
            }
        } catch (err) {
            console.error('Failed to load AI settings:', err)
            toast.error('Failed to load AI settings')
        } finally {
            setLoading(false)
        }
    }

    // Fetch ElevenLabs voices list
    const fetchVoices = async () => {
        try {
            setLoadingVoices(true)
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_voices' }),
            })
            const data = await res.json()
            if (data.success && Array.isArray(data.voices)) {
                setAvailableVoices(data.voices)
            }
        } catch (err) {
            console.warn('Could not load ElevenLabs voices:', err)
        } finally {
            setLoadingVoices(false)
        }
    }

    // Audio sample preview player
    const handleToggleAudioPreview = (voice) => {
        if (!voice.preview_url) {
            toast.error('No audio preview sample available for this voice')
            return
        }

        if (playingVoiceId === voice.voice_id) {
            if (audioPlayer) {
                audioPlayer.pause()
                setAudioPlayer(null)
            }
            setPlayingVoiceId(null)
            return
        }

        if (audioPlayer) {
            audioPlayer.pause()
        }

        const audio = new Audio(voice.preview_url)
        audio.onended = () => {
            setPlayingVoiceId(null)
            setAudioPlayer(null)
        }
        audio.onerror = () => {
            toast.error('Failed to play voice preview')
            setPlayingVoiceId(null)
            setAudioPlayer(null)
        }
        audio.play().catch(() => {
            toast.error('Browser blocked audio autoplay. Click again to play.')
        })

        setAudioPlayer(audio)
        setPlayingVoiceId(voice.voice_id)
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    // Connect API Key
    const handleConnect = async (provider) => {
        let key = ''
        if (provider === 'gemini') key = geminiKey
        else if (provider === 'gemini2') key = gemini2Key
        else if (provider === 'groq') key = groqKey
        else if (provider === 'openrouter') key = openRouterKey
        else if (provider.startsWith('elevenlabs')) {
            const slotIdx = provider === 'elevenlabs' ? 0 : (parseInt(provider.replace('elevenlabs', ''), 10) - 1 || 0)
            key = elevenLabsAccounts[slotIdx]?.key || ''
        }

        if (!key || !key.trim()) {
            const provName = provider === 'gemini' 
                ? 'Google Gemini' 
                : provider === 'gemini2'
                ? 'Gemini Backup'
                : provider === 'groq' 
                ? 'Groq Cloud' 
                : provider.startsWith('elevenlabs')
                ? `ElevenLabs Account ${provider === 'elevenlabs' ? '1' : provider.replace('elevenlabs', '')}`
                : 'OpenRouter'
            toast.error(`Please paste your ${provName} API key first.`)
            return
        }

        setTestingProvider(provider)
        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'connect',
                    testProvider: provider,
                    testKey: key,
                }),
            })

            const data = await res.json()
            if (data.success && data.isConnected) {
                const provName = provider === 'gemini' 
                    ? 'Google Gemini' 
                    : provider === 'gemini2'
                    ? 'Gemini Backup'
                    : provider === 'groq' 
                    ? 'Groq Cloud' 
                    : provider.startsWith('elevenlabs')
                    ? `ElevenLabs Account ${provider === 'elevenlabs' ? '1' : provider.replace('elevenlabs', '')}`
                    : 'OpenRouter'
                toast.success(`${provName} connected successfully!`)

                if (provider === 'gemini') {
                    setIsGeminiConnected(true)
                    setGeminiKey(data.maskedKey || key)
                    if (data.model) setGeminiModel(data.model)
                } else if (provider === 'gemini2') {
                    setIsGemini2Connected(true)
                    setGemini2Key(data.maskedKey || key)
                    if (data.model) setGemini2Model(data.model)
                } else if (provider === 'groq') {
                    setIsGroqConnected(true)
                    setGroqKey(data.maskedKey || key)
                    if (data.model) setGroqModel(data.model)
                } else if (provider === 'openrouter') {
                    setIsOpenRouterConnected(true)
                    setOpenRouterKey(data.maskedKey || key)
                } else if (provider.startsWith('elevenlabs')) {
                    const slotIdx = provider === 'elevenlabs' ? 0 : (parseInt(provider.replace('elevenlabs', ''), 10) - 1 || 0)
                    const fallbackMasked = key.length > 8 ? `${key.slice(0, 4)}••••••••${key.slice(-4)}` : '••••••••'
                    setElevenLabsAccounts(prev => prev.map((item, idx) => {
                        if (idx === slotIdx) {
                            return {
                                ...item,
                                isConnected: true,
                                key: data.maskedKey || fallbackMasked,
                                subscription: data.subscription || {
                                    tier: data.tier || 'standard',
                                    characterCount: data.characterCount || 0,
                                    characterLimit: data.characterLimit || 10000,
                                    status: 'active',
                                },
                            }
                        }
                        return item
                    }))
                    if (Array.isArray(data.voices) && data.voices.length > 0) {
                        setAvailableVoices(data.voices)
                    }
                    await fetchSettings()
                }
            } else {
                toast.error(data.message || 'Connection failed')
            }
        } catch (err) {
            toast.error(`Connection error: ${err.message}`)
        } finally {
            setTestingProvider(null)
        }
    }

    // Disconnect API Key
    const handleDisconnect = async (provider) => {
        const providerName = provider === 'gemini' 
            ? 'Google Gemini' 
            : provider === 'gemini2'
            ? 'Gemini Backup'
            : provider === 'groq' 
            ? 'Groq Cloud' 
            : provider.startsWith('elevenlabs')
            ? `ElevenLabs Account ${provider === 'elevenlabs' ? '1' : provider.replace('elevenlabs', '')}`
            : 'OpenRouter'
        const confirm = window.confirm(`Are you sure you want to disconnect ${providerName}? The API key will be deleted.`)
        if (!confirm) return

        setDisconnectingProvider(provider)
        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'disconnect',
                    provider,
                }),
            })

            const data = await res.json()
            if (data.success) {
                toast.success(data.message)

                if (provider === 'gemini') {
                    setIsGeminiConnected(false)
                    setGeminiKey('')
                    setGeminiModel('')
                } else if (provider === 'gemini2') {
                    setIsGemini2Connected(false)
                    setGemini2Key('')
                    setGemini2Model('')
                } else if (provider === 'groq') {
                    setIsGroqConnected(false)
                    setGroqKey('')
                    setGroqModel('')
                } else if (provider === 'openrouter') {
                    setIsOpenRouterConnected(false)
                    setOpenRouterKey('')
                } else if (provider.startsWith('elevenlabs')) {
                    const slotIdx = provider === 'elevenlabs' ? 0 : (parseInt(provider.replace('elevenlabs', ''), 10) - 1 || 0)
                    setElevenLabsAccounts(prev => prev.map((item, idx) => {
                        if (idx === slotIdx) {
                            return {
                                ...item,
                                isConnected: false,
                                key: '',
                                subscription: null,
                            }
                        }
                        return item
                    }))
                    await fetchSettings()
                }
            } else {
                toast.error(data.message || 'Failed to disconnect')
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`)
        } finally {
            setDisconnectingProvider(null)
        }
    }

    const handleAccountKeyChange = (slotIdx, val) => {
        setElevenLabsAccounts(prev => prev.map((item, idx) => idx === slotIdx ? { ...item, key: val } : item))
    }

    const handleToggleShowKey = (slotIdx) => {
        setElevenLabsAccounts(prev => prev.map((item, idx) => idx === slotIdx ? { ...item, showKey: !item.showKey } : item))
    }

    // Select & auto-save active ElevenLabs voice immediately
    const handleSelectVoice = async (voice, accent, gender) => {
        const vId = voice.voice_id
        const vName = `${voice.name} (${accent} ${gender})`
        setSelectedVoiceId(vId)
        setSelectedVoiceName(vName)

        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save_voice',
                    elevenLabsVoiceId: vId,
                    elevenLabsVoiceName: vName,
                }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Active voice changed to ${voice.name}! Live immediately.`)
            } else {
                toast.error(data.message || 'Failed to save selected voice')
            }
        } catch (err) {
            console.error('Error auto-saving voice:', err)
            toast.error('Network error saving voice')
        }
    }

    // Immediate Auto-Save Toggle for Storefront Voice Call
    const handleToggleVoiceCall = async (nextVal) => {
        setVoiceCallEnabled(nextVal)
        try {
            localStorage.setItem('ukbl_voice_call_enabled', String(nextVal))
            sessionStorage.setItem('ukbl_voice_call_enabled', String(nextVal))
        } catch {}

        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'toggle_voice_call',
                    voiceCallEnabled: nextVal,
                }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(nextVal ? 'Storefront Voice Call enabled' : 'Storefront Voice Call disabled')
                broadcastStoreChange('ai_settings', { voiceCallEnabled: nextVal })
            } else {
                toast.error(data.message || 'Failed to update voice call setting')
                setVoiceCallEnabled(!nextVal)
                try {
                    localStorage.setItem('ukbl_voice_call_enabled', String(!nextVal))
                    sessionStorage.setItem('ukbl_voice_call_enabled', String(!nextVal))
                } catch {}
            }
        } catch (err) {
            console.error('Error updating voice call setting:', err)
            toast.error('Network error updating voice call setting')
            setVoiceCallEnabled(!nextVal)
            try {
                localStorage.setItem('ukbl_voice_call_enabled', String(!nextVal))
                sessionStorage.setItem('ukbl_voice_call_enabled', String(!nextVal))
            } catch {}
        }
    }

    // Save All AI Settings
    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                preferredProvider,
                customInstructions,
                botName,
                enabled,
                elevenLabsVoiceId: selectedVoiceId,
                elevenLabsVoiceName: selectedVoiceName,
                voiceCallEnabled,
            }

            if (geminiKey && !geminiKey.includes('••••')) {
                payload.geminiKey = geminiKey
            }
            if (gemini2Key && !gemini2Key.includes('••••')) {
                payload.geminiKey2 = gemini2Key
            }
            if (groqKey && !groqKey.includes('••••')) {
                payload.groqKey = groqKey
            }
            if (openRouterKey && !openRouterKey.includes('••••')) {
                payload.openRouterKey = openRouterKey
            }
            elevenLabsAccounts.forEach((acc, idx) => {
                const prop = idx === 0 ? 'elevenLabsKey' : `elevenLabsKey${idx + 1}`
                if (acc.key && !acc.key.includes('••••')) {
                    payload[prop] = acc.key
                }
            })

            // WhatsApp Settings
            payload.whatsappPhoneNumberId = whatsappPhoneNumberId
            if (whatsappAccessToken && !whatsappAccessToken.includes('••••')) {
                payload.whatsappAccessToken = whatsappAccessToken
            }
            payload.whatsappBusinessAccountId = whatsappBusinessAccountId
            payload.whatsappHotline = whatsappHotline
            payload.whatsappRecoveryEnabled = whatsappRecoveryEnabled
            payload.whatsappRecoveryDelayHours = parseFloat(whatsappRecoveryDelayHours) || 1
            payload.whatsappStage2Enabled = whatsappStage2Enabled
            payload.whatsappStage3Enabled = whatsappStage3Enabled
            payload.whatsappTemplateStage1 = whatsappTemplateStage1
            payload.whatsappTemplateStage2 = whatsappTemplateStage2
            payload.whatsappTemplateStage3 = whatsappTemplateStage3

            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (data.success) {
                toast.success('AI settings saved successfully!')
                const cleanPhone = (whatsappHotline || '').trim()
                const cleanDigits = cleanPhone.replace(/[^\d]/g, '')
                const raw = cleanDigits.startsWith('880')
                    ? cleanDigits
                    : cleanDigits.startsWith('0')
                        ? `88${cleanDigits}`
                        : `880${cleanDigits}`
                const syncPayload = {
                    phone: cleanPhone,
                    raw,
                    url: `https://wa.me/${raw}`,
                }
                broadcastStoreChange('ai_settings', { voiceCallEnabled, whatsappHotline: cleanPhone, whatsapp: syncPayload })
                broadcastStoreChange('settings', { whatsappHotline: cleanPhone, whatsapp: syncPayload })
                try {
                    localStorage.setItem('ukbl_whatsapp_info', JSON.stringify(syncPayload))
                } catch {}
                fetchSettings()
            } else {
                toast.error(data.message || 'Failed to save settings')
            }
        } catch (err) {
            console.error('Error saving settings:', err)
            toast.error('Network error saving settings')
        } finally {
            setSaving(false)
        }
    }

    const handleSavePhoneInstantly = async () => {
        if (!whatsappHotline.trim()) {
            toast.error('Please enter a valid phone number')
            return
        }

        setIsUpdatingPhone(true)
        try {
            const cleanPhone = whatsappHotline.trim()
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_phone',
                    whatsappHotline: cleanPhone,
                }),
            })
            const data = await res.json()
            if (data.success) {
                const cleanDigits = cleanPhone.replace(/[^\d]/g, '')
                const raw = cleanDigits.startsWith('880')
                    ? cleanDigits
                    : cleanDigits.startsWith('0')
                        ? `88${cleanDigits}`
                        : `880${cleanDigits}`
                const syncPayload = {
                    phone: cleanPhone,
                    raw,
                    url: `https://wa.me/${raw}`,
                }

                broadcastStoreChange('ai_settings', { whatsappHotline: cleanPhone, whatsapp: syncPayload })
                broadcastStoreChange('settings', { whatsappHotline: cleanPhone, whatsapp: syncPayload })

                try {
                    localStorage.setItem('ukbl_whatsapp_info', JSON.stringify(syncPayload))
                } catch {}

                toast.success('WhatsApp phone number updated instantly across entire website!')
            } else {
                toast.error(data.message || 'Failed to update phone number')
            }
        } catch (err) {
            toast.error(`Error updating phone: ${err.message}`)
        } finally {
            setIsUpdatingPhone(false)
        }
    }

    const handleConnectWhatsApp = async () => {
        if (!whatsappPhoneNumberId.trim()) {
            toast.error('Please enter your WhatsApp Phone Number ID')
            return
        }
        if (!whatsappAccessToken.trim()) {
            toast.error('Please enter your WhatsApp System User Access Token')
            return
        }

        setIsVerifyingWhatsApp(true)
        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify_whatsapp',
                    whatsappPhoneNumberId: whatsappPhoneNumberId.trim(),
                    whatsappAccessToken: whatsappAccessToken.trim(),
                }),
            })
            const data = await res.json()
            if (data.success) {
                setIsWhatsAppConnected(true)
                if (data.details?.displayPhoneNumber) {
                    setWhatsappHotline(data.details.displayPhoneNumber)
                    const cleanDigits = data.details.displayPhoneNumber.replace(/[^\d]/g, '')
                    const raw = cleanDigits.startsWith('880')
                        ? cleanDigits
                        : cleanDigits.startsWith('0')
                            ? `88${cleanDigits}`
                            : `880${cleanDigits}`
                    const syncPayload = {
                        phone: data.details.displayPhoneNumber,
                        raw,
                        url: `https://wa.me/${raw}`,
                    }
                    broadcastStoreChange('ai_settings', { whatsappHotline: data.details.displayPhoneNumber, whatsapp: syncPayload })
                    broadcastStoreChange('settings', { whatsappHotline: data.details.displayPhoneNumber, whatsapp: syncPayload })
                    try {
                        localStorage.setItem('ukbl_whatsapp_info', JSON.stringify(syncPayload))
                    } catch {}
                }
                toast.success(data.message || 'WhatsApp Cloud API connected successfully!')
                fetchSettings()
            } else {
                toast.error(data.message || 'Verification failed. Please check your credentials.')
            }
        } catch (err) {
            toast.error(`WhatsApp connection error: ${err.message}`)
        } finally {
            setIsVerifyingWhatsApp(false)
        }
    }

    const handleDisconnectWhatsApp = async () => {
        const confirm = window.confirm('Are you sure you want to disconnect WhatsApp Cloud API?')
        if (!confirm) return

        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'disconnect',
                    provider: 'whatsapp',
                }),
            })
            const data = await res.json()
            if (data.success) {
                setIsWhatsAppConnected(false)
                setWhatsappPhoneNumberId('')
                setWhatsappAccessToken('')
                setWhatsappBusinessAccountId('')
                toast.success('WhatsApp API disconnected successfully.')
            }
        } catch (err) {
            toast.error('Failed to disconnect WhatsApp')
        }
    }

    const handleSendTestWhatsApp = async () => {
        if (!testRecipientPhone.trim()) {
            toast.error('Please enter a test recipient WhatsApp number (e.g. 01959524393)')
            return
        }

        setIsSendingTestWhatsApp(true)
        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'test_whatsapp',
                    recipientPhone: testRecipientPhone.trim(),
                }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message || 'Test message sent successfully!')
            } else {
                toast.error(data.message || 'Failed to dispatch test WhatsApp message')
            }
        } catch (err) {
            toast.error(`Error sending test message: ${err.message}`)
        } finally {
            setIsSendingTestWhatsApp(false)
        }
    }

    const handleInsertVariable = (variableTag) => {
        if (activeTemplateStageTab === 1) {
            setWhatsappTemplateStage1(prev => (prev ? prev + ' ' + variableTag : variableTag))
        } else if (activeTemplateStageTab === 2) {
            setWhatsappTemplateStage2(prev => (prev ? prev + ' ' + variableTag : variableTag))
        } else {
            setWhatsappTemplateStage3(prev => (prev ? prev + ' ' + variableTag : variableTag))
        }
        toast.success(`Inserted ${variableTag}`)
    }

    const handleToggleStage = async (stageNum, newState) => {
        if (stageNum === 2) setWhatsappStage2Enabled(newState)
        if (stageNum === 3) setWhatsappStage3Enabled(newState)

        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'toggle_whatsapp_stage',
                    stage: stageNum,
                    enabled: newState,
                }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message || `Stage ${stageNum} updated instantly!`)
            } else {
                toast.error(data.message || 'Failed to update stage')
                if (stageNum === 2) setWhatsappStage2Enabled(!newState)
                if (stageNum === 3) setWhatsappStage3Enabled(!newState)
            }
        } catch (err) {
            toast.error(`Error toggling Stage ${stageNum}: ${err.message}`)
            if (stageNum === 2) setWhatsappStage2Enabled(!newState)
            if (stageNum === 3) setWhatsappStage3Enabled(!newState)
        }
    }

    const handleResetTemplates = () => {
        if (activeTemplateStageTab === 1) {
            setWhatsappTemplateStage1(DEFAULT_STAGE_1)
        } else if (activeTemplateStageTab === 2) {
            setWhatsappTemplateStage2(DEFAULT_STAGE_2)
        } else {
            setWhatsappTemplateStage3(DEFAULT_STAGE_3)
        }
        toast.success(`Reset Stage ${activeTemplateStageTab} to default high-converting copy!`)
    }

    const [isRunningCron, setIsRunningCron] = useState(false)
    const handleTriggerCronNow = async () => {
        setIsRunningCron(true)
        try {
            const res = await fetch('/api/marketing/abandoned-carts/cron?force=true', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                toast.success(
                    `Scan complete! ${data.stats?.newSessionsInitiated || 0} new offers sent, ${data.stats?.remindersDispatched || 0} reminders sent.`
                )
            } else {
                toast.error(data.message || 'Cron scan encountered an issue.')
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`)
        } finally {
            setIsRunningCron(false)
        }
    }

    const previewMessageText = useMemo(() => {
        const raw = activeTemplateStageTab === 1 
            ? whatsappTemplateStage1 
            : (activeTemplateStageTab === 2 ? whatsappTemplateStage2 : whatsappTemplateStage3)
        
        return (raw || '')
            .replace(/\{customer_name\}/g, 'Nusrat Jahan')
            .replace(/\{product_name\}/g, 'CeraVe Hydrating Cleanser 473ml (UK Version)')
            .replace(/\{product_price\}/g, '2,250')
            .replace(/\{discount_text\}/g, '')
            .replace(/\{discounted_price\}/g, '2,250')
            .replace(/\{coupon_code\}/g, '')
            .replace(/\{hours_remaining\}/g, activeTemplateStageTab === 2 ? '12' : '3')
            .replace(/\{validity_text\}/g, '24 Hours')
            .replace(/\{cart_url\}/g, 'https://ukbrandlover.com/checkout')
            .replace(/\{store_phone\}/g, whatsappHotline || '+880 1959-524393')
            .replace(/\{hotline\}/g, whatsappHotline || '+880 1959-524393')
            .replace(/\{whatsapp_number\}/g, whatsappHotline || '+880 1959-524393');
    }, [activeTemplateStageTab, whatsappTemplateStage1, whatsappTemplateStage2, whatsappTemplateStage3, whatsappHotline]);

    if (loading) {
        return (
            <div className="p-8">
                <Loading message="Loading AI configuration..." />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {/* 1. Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFE0EF]">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-xs font-bold text-[#6C306E] mb-2">
                        <SparklesIcon size={14} color="#6C306E" />
                        <span>AI Assistant & Automation</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#241224] tracking-tight">
                        AI Saleswoman Bot (Emma)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Configure AI provider keys, failover order, and store knowledge directives.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={fetchSettings}
                        title="Refresh"
                        className="p-2.5 rounded-xl border border-[#EFE0EF] hover:bg-[#FAF6FA] text-slate-600 transition cursor-pointer"
                    >
                        <RefreshIcon size={16} />
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-300 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon size={15} color="white" />
                                <span>Save Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. Compact Live Catalog Ingestion Strip */}
            <div className="p-3.5 px-4 rounded-2xl bg-white border border-[#EFE0EF] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex size-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-[#241224]">Live Catalog Ingestion:</span>
                    <span className="text-slate-500 hidden md:inline">Emma automatically reads product names, prices, and stock counts</span>
                </div>
                <div className="flex items-center gap-3.5 text-xs font-medium">
                    <span className="text-slate-600">
                        <strong className="text-[#6C306E] font-extrabold">{catalogStats.totalActiveProducts}</strong> Total Products
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700">
                        <strong className="font-extrabold">{catalogStats.inStockProducts}</strong> In Stock
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700">
                        <strong className="font-extrabold">{catalogStats.outOfStockProducts}</strong> Out of Stock
                    </span>
                </div>
            </div>

            {/* 3. AI Providers & API Keys (Quadruple Fallback Architecture) */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-5">
                <div>
                    <h2 className="text-base font-extrabold text-[#241224] tracking-tight">
                        AI Provider API Keys
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Connect one or multiple providers. Emma will automatically failover to secondary providers if quota is reached.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
                    {/* 1. Google Gemini */}
                    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isGeminiConnected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between gap-1.5 mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/gemini.png" alt="Google Gemini" className="size-6 object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224] truncate">Google Gemini</h4>
                                </div>
                                {isGeminiConnected ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-3">
                                <div className="relative">
                                    <input
                                        type={showGeminiKey ? 'text' : 'password'}
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        placeholder="Gemini API Key (AIza...)"
                                        className={`w-full h-9 pl-3 pr-8 text-xs rounded-xl focus:outline-none transition ${
                                            isGeminiConnected
                                                ? 'bg-emerald-50/30 border border-emerald-200 text-[#241224] font-medium'
                                                : 'bg-[#FAF6FA] border border-[#EFE0EF] focus:bg-white focus:border-[#6C306E] text-[#241224]'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <EyeIcon size={14} />
                                    </button>
                                </div>
                                {isGeminiConnected && geminiModel && (
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1 truncate">
                                        Model: {geminiModel}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80">
                            {isGeminiConnected ? (
                                <button
                                    type="button"
                                    onClick={() => handleDisconnect('gemini')}
                                    disabled={disconnectingProvider === 'gemini'}
                                    className="w-full h-8 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <DisconnectIcon size={13} color="currentColor" />
                                    <span>{disconnectingProvider === 'gemini' ? 'Disconnecting...' : 'Disconnect'}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect('gemini')}
                                    disabled={testingProvider === 'gemini'}
                                    className="w-full h-8 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                                >
                                    {testingProvider === 'gemini' ? (
                                        <>
                                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Gemini Backup */}
                    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isGemini2Connected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between gap-1.5 mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/gemini.png" alt="Gemini Backup" className="size-6 object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224] truncate">Gemini Backup</h4>
                                </div>
                                {isGemini2Connected ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-3">
                                <div className="relative">
                                    <input
                                        type={showGemini2Key ? 'text' : 'password'}
                                        value={gemini2Key}
                                        onChange={(e) => setGemini2Key(e.target.value)}
                                        placeholder="Gemini Backup Key (AIza...)"
                                        className={`w-full h-9 pl-3 pr-8 text-xs rounded-xl focus:outline-none transition ${
                                            isGemini2Connected
                                                ? 'bg-emerald-50/30 border border-emerald-200 text-[#241224] font-medium'
                                                : 'bg-[#FAF6FA] border border-[#EFE0EF] focus:bg-white focus:border-[#6C306E] text-[#241224]'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGemini2Key(!showGemini2Key)}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <EyeIcon size={14} />
                                    </button>
                                </div>
                                {isGemini2Connected && gemini2Model && (
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1 truncate">
                                        Model: {gemini2Model}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80">
                            {isGemini2Connected ? (
                                <button
                                    type="button"
                                    onClick={() => handleDisconnect('gemini2')}
                                    disabled={disconnectingProvider === 'gemini2'}
                                    className="w-full h-8 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <DisconnectIcon size={13} color="currentColor" />
                                    <span>{disconnectingProvider === 'gemini2' ? 'Disconnecting...' : 'Disconnect'}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect('gemini2')}
                                    disabled={testingProvider === 'gemini2'}
                                    className="w-full h-8 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                                >
                                    {testingProvider === 'gemini2' ? (
                                        <>
                                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 3. Groq Cloud */}
                    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isGroqConnected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between gap-1.5 mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/groq.png" alt="Groq" className="size-6 object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224] truncate">Groq Cloud</h4>
                                </div>
                                {isGroqConnected ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-3">
                                <div className="relative">
                                    <input
                                        type={showGroqKey ? 'text' : 'password'}
                                        value={groqKey}
                                        onChange={(e) => setGroqKey(e.target.value)}
                                        placeholder="Groq API Key (gsk_...)"
                                        className={`w-full h-9 pl-3 pr-8 text-xs rounded-xl focus:outline-none transition ${
                                            isGroqConnected
                                                ? 'bg-emerald-50/30 border border-emerald-200 text-[#241224] font-medium'
                                                : 'bg-[#FAF6FA] border border-[#EFE0EF] focus:bg-white focus:border-[#6C306E] text-[#241224]'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowGroqKey(!showGroqKey)}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <EyeIcon size={14} />
                                    </button>
                                </div>
                                {isGroqConnected && groqModel && (
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1 truncate">
                                        Model: {groqModel}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80">
                            {isGroqConnected ? (
                                <button
                                    type="button"
                                    onClick={() => handleDisconnect('groq')}
                                    disabled={disconnectingProvider === 'groq'}
                                    className="w-full h-8 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <DisconnectIcon size={13} color="currentColor" />
                                    <span>{disconnectingProvider === 'groq' ? 'Disconnecting...' : 'Disconnect'}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect('groq')}
                                    disabled={testingProvider === 'groq'}
                                    className="w-full h-8 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                                >
                                    {testingProvider === 'groq' ? (
                                        <>
                                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4. OpenRouter */}
                    <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isOpenRouterConnected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between gap-1.5 mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/openrouter-icon.png" alt="OpenRouter" className="size-6 object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224] truncate">OpenRouter</h4>
                                </div>
                                {isOpenRouterConnected ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 whitespace-nowrap shadow-2xs">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-3">
                                <div className="relative">
                                    <input
                                        type={showOpenRouterKey ? 'text' : 'password'}
                                        value={openRouterKey}
                                        onChange={(e) => setOpenRouterKey(e.target.value)}
                                        placeholder="OpenRouter Key (sk-or-...)"
                                        className={`w-full h-9 pl-3 pr-8 text-xs rounded-xl focus:outline-none transition ${
                                            isOpenRouterConnected
                                                ? 'bg-emerald-50/30 border border-emerald-200 text-[#241224] font-medium'
                                                : 'bg-[#FAF6FA] border border-[#EFE0EF] focus:bg-white focus:border-[#6C306E] text-[#241224]'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <EyeIcon size={14} />
                                    </button>
                                </div>
                                {isOpenRouterConnected && (
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1 truncate">
                                        Operational & Verified
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80">
                            {isOpenRouterConnected ? (
                                <button
                                    type="button"
                                    onClick={() => handleDisconnect('openrouter')}
                                    disabled={disconnectingProvider === 'openrouter'}
                                    className="w-full h-8 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <DisconnectIcon size={13} color="currentColor" />
                                    <span>{disconnectingProvider === 'openrouter' ? 'Disconnecting...' : 'Disconnect'}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect('openrouter')}
                                    disabled={testingProvider === 'openrouter'}
                                    className="w-full h-8 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                                >
                                    {testingProvider === 'openrouter' ? (
                                        <>
                                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Primary Engine Segmented Control (Optimized for Android & Desktop) */}
                <div className="pt-4 border-t border-[#EFE0EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-xs font-bold text-[#241224]">Primary Provider Engine:</span>
                        <p className="text-[11px] text-slate-500">Emma queries this provider first, then automatically fails over if busy.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto">
                        {[
                            { id: 'gemini', label: 'Google Gemini', shortLabel: 'Gemini', icon: '/logos/gemini.png', connected: isGeminiConnected },
                            { id: 'groq', label: 'Groq Cloud', shortLabel: 'Groq', icon: '/logos/groq.png', connected: isGroqConnected },
                            { id: 'openrouter', label: 'OpenRouter', shortLabel: 'OpenRouter', icon: '/logos/openrouter-icon.png', connected: isOpenRouterConnected },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPreferredProvider(p.id)}
                                className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                    preferredProvider === p.id
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <img src={p.icon} alt={p.label} className="size-3.5 sm:size-4 object-contain shrink-0" />
                                <span className={`size-1.5 rounded-full shrink-0 ${p.connected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                <span className="truncate hidden md:inline">{p.label}</span>
                                <span className="truncate md:hidden">{p.shortLabel}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. ElevenLabs Human Voice Engine & Voice Call Studio */}
            {(() => {
                let voiceListToDisplay = defaultCuratedVoices;
                if (Array.isArray(availableVoices) && availableVoices.length > 0) {
                    const verifiedFemales = availableVoices.filter(v => {
                        const isPremade = v.category === 'premade';
                        const gender = (v.labels?.gender || v.gender || '').toLowerCase();
                        return isPremade && gender === 'female';
                    });
                    if (verifiedFemales.length > 0) {
                        voiceListToDisplay = verifiedFemales;
                    }
                }

                return (
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE0EF]">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/elevenlabs.png?v=2" alt="ElevenLabs" className="size-6 object-contain" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-[#241224] tracking-tight">
                                            ElevenLabs AI Voice Engine & Call Settings
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Studio-grade human speech synthesis. Gives Emma an authentic, emotional living voice for phone call consultations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {elevenLabsAccounts.some(a => a.isConnected) ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wide shadow-2xs">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected ({elevenLabsAccounts.filter(a => a.isConnected).length}/5 Active)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold shadow-2xs">
                                        <span className="size-2 rounded-full bg-slate-400" />
                                        Not Connected (0/5)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Pooled Overview & Multi-Account Pool Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6FA]/60 border border-[#EFE0EF] space-y-4">
                            {/* Pooled Total Balance Card (when at least 1 account is connected) */}
                            {elevenLabsAccounts.some(a => a.isConnected) && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 via-[#FAF6FA] to-white border border-[#EFE0EF] shadow-2xs space-y-2.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                                            <span className="text-xs font-extrabold text-[#241224]">Total Pooled Voice Credits</span>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                                                {elevenLabsAccounts.filter(a => a.isConnected).length} Connected Accounts
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                            <span className="text-slate-600 font-semibold">
                                                <strong className="text-[#241224] font-extrabold">{elevenLabsPooled.totalCharactersUsed.toLocaleString()}</strong> / {elevenLabsPooled.totalCharacterLimit.toLocaleString()} total chars used
                                            </span>
                                            <span className="text-[11px] font-extrabold text-[#6C306E] bg-white border border-[#EFE0EF] px-2.5 py-0.5 rounded-lg shadow-2xs">
                                                {elevenLabsPooled.totalCharactersRemaining.toLocaleString()} Pooled Balance
                                            </span>
                                        </div>
                                    </div>

                                    {/* Pooled Progress Bar */}
                                    <div className="w-full bg-[#FAF6FA] border border-[#EFE0EF] h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#6C306E] via-purple-600 to-emerald-500 transition-all duration-500 rounded-full"
                                            style={{
                                                width: `${Math.min(100, Math.round((elevenLabsPooled.totalCharactersUsed / Math.max(1, elevenLabsPooled.totalCharacterLimit)) * 100))}%`
                                            }}
                                        />
                                    </div>

                                    <p className="text-[10.5px] text-slate-500 flex items-center gap-1.5">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>Auto-Switch Active: If any account finishes its quota or encounters an issue, Emma instantly switches to the next API key.</span>
                                    </p>
                                </div>
                            )}

                            {/* 5 ElevenLabs Account Slots */}
                            <div className="space-y-3">
                                {elevenLabsAccounts.map((acc, idx) => {
                                    const sub = acc.subscription
                                    const charCount = sub?.characterCount ?? 0
                                    const charLimit = sub?.characterLimit ?? 10000
                                    const remaining = Math.max(0, charLimit - charCount)
                                    const percentUsed = Math.min(100, Math.round((charCount / Math.max(1, charLimit)) * 100))
                                    const isDepleted = acc.isConnected && (sub?.status === 'blocked' || charCount >= charLimit || percentUsed >= 100)

                                    return (
                                        <div
                                            key={acc.slot}
                                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                                                acc.isConnected
                                                    ? isDepleted
                                                        ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                                                        : 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                                                    : 'bg-[#FAF6FA]/50 border-[#EFE0EF]'
                                            }`}
                                        >
                                            {/* Slot Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-5 rounded-md bg-[#6C306E]/10 text-[#6C306E] font-black text-[10px] flex items-center justify-center shrink-0">
                                                        #{acc.slot}
                                                    </span>
                                                    <span className="text-xs font-bold text-[#241224]">{acc.label}</span>
                                                    <span className="text-[10.5px] text-slate-400 font-medium hidden sm:inline">
                                                        {acc.slot === 1 ? '• Primary Voice Key' : `• Auto-Failover Priority #${acc.slot}`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {acc.isConnected ? (
                                                        isDepleted ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                Credits Depleted (Auto-switched)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap shadow-2xs">
                                                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Connected
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 whitespace-nowrap shadow-2xs">
                                                            <span className="size-1.5 rounded-full bg-slate-400" />
                                                            Not Connected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Key Input & Action Row */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                                <div className="relative flex-1">
                                                    <input
                                                        type={acc.showKey ? 'text' : 'password'}
                                                        value={acc.key}
                                                        onChange={(e) => handleAccountKeyChange(idx, e.target.value)}
                                                        placeholder={`Paste ElevenLabs key for Account ${acc.slot} (xi-api-key)...`}
                                                        className={`w-full h-10 px-3.5 pr-10 text-xs rounded-xl focus:outline-none transition font-mono ${
                                                            acc.isConnected
                                                                ? 'bg-emerald-50/20 border border-emerald-200 text-[#241224] font-medium'
                                                                : 'bg-white border border-[#EFE0EF] focus:border-[#6C306E] text-[#241224]'
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleShowKey(idx)}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                                    >
                                                        <EyeIcon size={14} />
                                                    </button>
                                                </div>

                                                {acc.isConnected ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDisconnect(acc.provider)}
                                                        disabled={disconnectingProvider === acc.provider}
                                                        className="h-10 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                                                    >
                                                        <DisconnectIcon size={13} color="currentColor" />
                                                        <span>{disconnectingProvider === acc.provider ? 'Disconnecting...' : 'Disconnect'}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConnect(acc.provider)}
                                                        disabled={testingProvider === acc.provider}
                                                        className="h-10 px-5 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs"
                                                    >
                                                        {testingProvider === acc.provider ? (
                                                            <>
                                                                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                <span>Connecting...</span>
                                                            </>
                                                        ) : (
                                                            <span>Connect</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Individual Account Credit Status */}
                                            {acc.isConnected && sub && (
                                                <div className="mt-3 pt-2.5 border-t border-[#EFE0EF]/80 space-y-1.5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-semibold text-slate-500">Account #{acc.slot} Credits:</span>
                                                            <span className="font-bold text-[#241224]">
                                                                {charCount.toLocaleString()} <span className="font-normal text-slate-500">/ {charLimit.toLocaleString()} chars used</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
                                                                isDepleted
                                                                    ? 'bg-rose-100 text-rose-700'
                                                                    : percentUsed > 75
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                            }`}>
                                                                {remaining.toLocaleString()} remaining ({100 - percentUsed}%)
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Slim Progress Bar */}
                                                    <div className="w-full bg-[#FAF6FA] border border-[#EFE0EF] h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 rounded-full ${
                                                                percentUsed >= 100
                                                                    ? 'bg-rose-500'
                                                                    : percentUsed > 75
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-gradient-to-r from-[#6C306E] to-[#8E448F]'
                                                            }`}
                                                            style={{ width: `${percentUsed}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Storefront Call Toggle */}
                            <div className="pt-3 border-t border-[#EFE0EF] flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-[#241224]">Storefront Voice Call Feature:</span>
                                    <p className="text-[11px] text-slate-500">Show the "Call Emma" audio consultation button to visitors on the website.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={voiceCallEnabled}
                                        onChange={(e) => handleToggleVoiceCall(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6C306E]"></div>
                                </label>
                            </div>
                        </div>

                        {/* Voice Selection & Real-Time Audio Preview Gallery */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs sm:text-sm font-extrabold text-[#241224]">
                                            Select Saleswoman Voice ({voiceListToDisplay.length} Available)
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Official ElevenLabs premade female voices available for instant consultation streaming.
                                    </p>
                                </div>
                                {elevenLabsAccounts.some(a => a.isConnected) && (
                                    <button
                                        type="button"
                                        onClick={fetchVoices}
                                        disabled={loadingVoices}
                                        className="text-xs text-[#6C306E] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshIcon size={12} />
                                        <span>{loadingVoices ? 'Refreshing...' : 'Refresh Voices'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Active Voice Pill Banner */}
                            <div className="p-3 px-4 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-between gap-3 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="size-2 rounded-full bg-[#6C306E]" />
                                    <span className="text-slate-500 font-medium">Currently Active Voice:</span>
                                    <strong className="text-[#6C306E] font-bold">{selectedVoiceName || 'Sarah - Mature, Reassuring, Confident'}</strong>
                                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-[#EFE0EF]">
                                        ID: {selectedVoiceId}
                                    </span>
                                </div>
                            </div>

                            {/* Voices Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 max-h-[360px] overflow-y-auto pr-1">
                                {voiceListToDisplay.map((voice) => {
                                    const isSelected = selectedVoiceId === voice.voice_id
                                    const isPlaying = playingVoiceId === voice.voice_id
                                    const labels = voice.labels || {}
                                    const desc = labels.description || labels.use_case || 'Natural & Expressive'
                                    const accent = labels.accent || 'Natural'
                                    const gender = labels.gender || 'Female'

                                    return (
                                        <div
                                            key={voice.voice_id}
                                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-gradient-to-b from-purple-50/50 to-white border-[#6C306E] shadow-sm ring-1 ring-[#6C306E]/30'
                                                    : 'bg-white border-[#EFE0EF] hover:border-slate-300'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <h4 className="font-extrabold text-xs text-[#241224]">{voice.name}</h4>
                                                            {isSelected && (
                                                                <span className="size-4 rounded-full bg-[#6C306E] text-white flex items-center justify-center text-[9px] font-black">
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 capitalize">{accent} • {gender}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF6FA] text-slate-600 font-medium border border-[#EFE0EF] truncate max-w-[120px]">
                                                            {desc}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons: Preview & Select */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-[#EFE0EF]/60">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAudioPreview(voice)}
                                                    className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                                                        isPlaying
                                                            ? 'bg-rose-500 text-white animate-pulse'
                                                            : 'bg-[#FAF6FA] hover:bg-[#F3E5F3] text-[#6C306E] border border-[#EFE0EF]'
                                                    }`}
                                                >
                                                    {isPlaying ? (
                                                        <>
                                                            <span className="size-2 rounded-xs bg-white" />
                                                            <span>Stop</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-[9px]">▶</span>
                                                            <span>Preview</span>
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectVoice(voice, accent, gender)}
                                                    className={`flex-1 h-7 rounded-lg text-[11px] font-bold transition flex items-center justify-center cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[#6C306E] text-white shadow-2xs'
                                                            : 'bg-white border border-[#EFE0EF] hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    {isSelected ? 'Active Voice' : 'Select Voice'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* 5. WhatsApp Abandoned Cart Automated Recovery Engine & Smart Expiry Engine */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-6">
                {/* Header & Master Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFE0EF]">
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <OfficialWhatsAppIcon size={34} className="shrink-0 drop-shadow-xs" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-extrabold text-[#241224] tracking-tight">
                                        WhatsApp Abandoned Cart Automated Recovery
                                    </h2>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                        isWhatsAppConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {isWhatsAppConnected ? '🟢 Connected' : '⚪ Disconnected'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Send high-converting personalized WhatsApp messages with smart reminders for reserved items in their shopping bag.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#241224]">
                            {whatsappRecoveryEnabled ? 'Engine Active' : 'Engine Paused'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={whatsappRecoveryEnabled}
                                onChange={(e) => setWhatsappRecoveryEnabled(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                        </label>
                    </div>
                </div>

                {/* API Credentials Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6FA]/60 border border-[#EFE0EF] space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-[#241224] uppercase tracking-wider">
                                Meta WhatsApp Cloud API Configuration
                            </h3>
                        </div>
                        {isWhatsAppConnected && (
                            <button
                                type="button"
                                onClick={handleDisconnectWhatsApp}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
                            >
                                <DisconnectIcon size={13} color="#E11D48" />
                                <span>Disconnect API</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Phone Number ID */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <PhoneIcon size={12} color="#6C306E" strokeWidth={2} />
                                <label className="text-[11px] font-bold text-[#241224]">
                                    Phone Number ID <span className="text-red-500">*</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                value={whatsappPhoneNumberId}
                                onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                                placeholder="e.g. 104829104820194"
                                className="w-full text-xs p-2.5 bg-white border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] outline-none font-mono text-slate-800"
                            />
                        </div>

                        {/* WhatsApp Business Account ID */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <StoreIcon size={12} color="#6C306E" />
                                <label className="text-[11px] font-bold text-[#241224]">
                                    Business Account ID (WABA ID)
                                </label>
                            </div>
                            <input
                                type="text"
                                value={whatsappBusinessAccountId}
                                onChange={(e) => setWhatsappBusinessAccountId(e.target.value)}
                                placeholder="e.g. 109283719283719"
                                className="w-full text-xs p-2.5 bg-white border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] outline-none font-mono text-slate-800"
                            />
                        </div>

                        {/* System User Access Token */}
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-1.5 mb-1">
                                <LockIcon size={12} color="#6C306E" />
                                <label className="text-[11px] font-bold text-[#241224]">
                                    Permanent Access Token <span className="text-red-500">*</span>
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showWhatsAppToken ? 'text' : 'password'}
                                    value={whatsappAccessToken}
                                    onChange={(e) => setWhatsappAccessToken(e.target.value)}
                                    placeholder="EAAG..."
                                    className="w-full text-xs p-2.5 pr-10 bg-white border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] outline-none font-mono text-slate-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showWhatsAppToken ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Official Hotline + Sync Everywhere + Verify Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#EFE0EF]/80">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <PhoneIcon size={13} color="#6C306E" strokeWidth={2} />
                                <span>WhatsApp Automation & Hotline:</span>
                            </div>
                            <input
                                type="text"
                                value={whatsappHotline}
                                onChange={(e) => setWhatsappHotline(e.target.value)}
                                placeholder="+880 1959-524393"
                                className="text-xs font-black text-[#241224] bg-white border border-[#EFE0EF] rounded-xl px-3 py-1.5 w-44 focus:border-[#6C306E] outline-none font-mono"
                            />
                            <button
                                type="button"
                                onClick={handleSavePhoneInstantly}
                                disabled={isUpdatingPhone}
                                className="px-3 py-1.5 rounded-xl bg-[#6C306E] hover:bg-[#522454] disabled:opacity-50 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                title="Instantly save and sync this phone number across frontend, backend, and server"
                            >
                                {isUpdatingPhone ? (
                                    <>
                                        <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Syncing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon size={12} color="white" />
                                        <span>Update Everywhere</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleConnectWhatsApp}
                            disabled={isVerifyingWhatsApp}
                            className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] disabled:opacity-50 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isVerifyingWhatsApp ? (
                                <>
                                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying with Meta...</span>
                                </>
                            ) : (
                                <>
                                    <CheckIcon size={14} color="white" />
                                    <span>{isWhatsAppConnected ? 'Verify Connection' : 'Connect WhatsApp API'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Timing Delay & Live Message Test Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cart Trigger Delay */}
                    <div className="p-4 rounded-2xl bg-white border border-[#EFE0EF] space-y-2">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon size={14} color="#6C306E" />
                            <label className="text-xs font-black text-[#241224] uppercase tracking-wider">
                                Cart Abandonment Trigger Delay
                            </label>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            How long after a customer adds items to cart should Message 1 (Recovery Offer) be sent?
                        </p>
                        <AdminDropdown
                            value={String(whatsappRecoveryDelayHours)}
                            onChange={(val) => setWhatsappRecoveryDelayHours(val)}
                            options={CART_RECOVERY_DELAY_OPTIONS}
                            fullWidth={true}
                            buttonClassName="py-2.5 px-3.5 bg-[#FAF6FA] hover:bg-white text-xs font-bold text-[#241224] rounded-xl border-[#EFE0EF]"
                        />
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 font-medium">Automatic cron runs in background.</span>
                            <button
                                type="button"
                                onClick={handleTriggerCronNow}
                                disabled={isRunningCron}
                                className="px-3 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#F3E5F3] border border-[#EFE0EF] text-[#6C306E] text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {isRunningCron ? 'Scanning...' : (
                                    <>
                                        <SparklesIcon size={12} color="#6C306E" />
                                        <span>Scan Carts Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Test Message Dispatcher */}
                    <div className="p-4 rounded-2xl bg-white border border-[#EFE0EF] space-y-2">
                        <div className="flex items-center gap-1.5">
                            <SendIcon size={13} color="#6C306E" />
                            <label className="text-xs font-black text-[#241224] uppercase tracking-wider block">
                                Send Live Test WhatsApp Message
                            </label>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Enter a recipient phone number to test sending a live message through your connected WhatsApp API.
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={testRecipientPhone}
                                onChange={(e) => setTestRecipientPhone(e.target.value)}
                                placeholder="01959524393"
                                className="flex-1 text-xs font-bold p-2.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSendTestWhatsApp}
                                disabled={isSendingTestWhatsApp || !isWhatsAppConnected}
                                className="px-4 py-2.5 rounded-xl bg-[#241224] hover:bg-[#3A0C38] disabled:bg-slate-300 text-white text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                            >
                                {isSendingTestWhatsApp ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <SendIcon size={13} color="white" />
                                        <span>Send Test Msg</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Multi-Stage Message Template Editor & Live Phone Simulator */}
                <div className="space-y-4 pt-2 border-t border-[#EFE0EF]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-black text-[#241224]">
                                Multi-Stage Personalized Message Sequence
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Direct-name standard (no Apu/Bhaiya). Each message is personalized to the customer and their specific cart item.
                            </p>
                        </div>

                        {/* Stage Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF6FA] p-1.5 rounded-2xl border border-[#EFE0EF]">
                            <button
                                type="button"
                                onClick={() => setActiveTemplateStageTab(1)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    activeTemplateStageTab === 1
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-[#241224]'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Stage 1: Initial Offer
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTemplateStageTab(2)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    activeTemplateStageTab === 2
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-[#241224]'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full transition-colors ${
                                    whatsappStage2Enabled ? 'bg-emerald-400' : 'bg-slate-300'
                                }`}></span>
                                Stage 2: Expiry Warning
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    activeTemplateStageTab === 2
                                        ? whatsappStage2Enabled ? 'bg-emerald-500/30 text-white' : 'bg-white/20 text-white/80'
                                        : whatsappStage2Enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {whatsappStage2Enabled ? 'ON' : 'OFF'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTemplateStageTab(3)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    activeTemplateStageTab === 3
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-[#241224]'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full transition-colors ${
                                    whatsappStage3Enabled ? 'bg-emerald-400' : 'bg-slate-300'
                                }`}></span>
                                Stage 3: Final Call
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    activeTemplateStageTab === 3
                                        ? whatsappStage3Enabled ? 'bg-emerald-500/30 text-white' : 'bg-white/20 text-white/80'
                                        : whatsappStage3Enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {whatsappStage3Enabled ? 'ON' : 'OFF'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Variable Injection Chips */}
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500">
                            Click to insert dynamic variables into the message:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[
                                { tag: '{customer_name}', label: 'Customer Name' },
                                { tag: '{product_name}', label: 'Product Name' },
                                { tag: '{product_price}', label: 'Product Price' },
                                { tag: '{cart_url}', label: 'Direct Checkout Link' },
                                { tag: '{hotline}', label: 'Store Hotline' },
                            ].map((v) => (
                                <button
                                    key={v.tag}
                                    type="button"
                                    onClick={() => handleInsertVariable(v.tag)}
                                    className="px-2 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#F3E5F3] border border-[#EFE0EF] hover:border-[#6C306E]/40 text-[11px] font-mono font-bold text-[#6C306E] transition cursor-pointer"
                                >
                                    + {v.tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor & Live Simulator Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Left: Textarea Editor */}
                        <div className="lg:col-span-7 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-bold text-slate-700">
                                        Stage {activeTemplateStageTab} Message Template
                                    </span>

                                    {/* Clean, Premium Instant ON / OFF Switch for Stage 2 & Stage 3 */}
                                    {activeTemplateStageTab === 1 ? (
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Primary Trigger (Always Active)
                                        </span>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 bg-[#FAF6FA] hover:bg-white border border-[#EFE0EF] px-2.5 py-1 rounded-full shadow-2xs transition">
                                            <span className={`text-[11px] font-bold ${
                                                (activeTemplateStageTab === 2 ? whatsappStage2Enabled : whatsappStage3Enabled)
                                                    ? 'text-emerald-700'
                                                    : 'text-slate-500'
                                            }`}>
                                                {(activeTemplateStageTab === 2 ? whatsappStage2Enabled : whatsappStage3Enabled)
                                                    ? 'Auto Message: Active'
                                                    : 'Auto Message: Disabled'}
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={activeTemplateStageTab === 2 ? whatsappStage2Enabled : whatsappStage3Enabled}
                                                    onChange={(e) => handleToggleStage(activeTemplateStageTab, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#25D366]"></div>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleResetTemplates}
                                    className="text-[11px] font-bold text-[#6C306E] hover:underline cursor-pointer"
                                >
                                    ↺ Reset to Default
                                </button>
                            </div>

                            <textarea
                                rows={16}
                                value={
                                    activeTemplateStageTab === 1
                                        ? whatsappTemplateStage1
                                        : activeTemplateStageTab === 2
                                        ? whatsappTemplateStage2
                                        : whatsappTemplateStage3
                                }
                                onChange={(e) => {
                                    if (activeTemplateStageTab === 1) setWhatsappTemplateStage1(e.target.value)
                                    else if (activeTemplateStageTab === 2) setWhatsappTemplateStage2(e.target.value)
                                    else setWhatsappTemplateStage3(e.target.value)
                                }}
                                className="w-full p-3.5 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition font-sans leading-relaxed text-[#241224]"
                            />
                        </div>

                        {/* Right: Live WhatsApp Phone Simulator (Samsung Galaxy Mockup) */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-start">
                            <div className="w-full flex items-center justify-between px-2 pb-2">
                                <span className="text-xs font-bold text-slate-700">Samsung Live Preview</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    activeTemplateStageTab === 1
                                        ? 'text-[#6C306E] bg-[#FAF6FA] border-[#EFE0EF]'
                                        : (activeTemplateStageTab === 2 ? whatsappStage2Enabled : whatsappStage3Enabled)
                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                        : 'text-slate-500 bg-slate-100 border-slate-200'
                                }`}>
                                    {activeTemplateStageTab === 1
                                        ? 'Stage 1 Active'
                                        : (activeTemplateStageTab === 2 ? whatsappStage2Enabled : whatsappStage3Enabled)
                                        ? `Stage ${activeTemplateStageTab} Active`
                                        : `Stage ${activeTemplateStageTab} Disabled (Off)`}
                                </span>
                            </div>
                            <MobileMockup
                                headerTitle="UK Brand Lover"
                                headerSubtitle="online"
                                avatarUrl="/images/web-logo-optimized.png"
                                avatarFallback="🇬🇧"
                                productImageUrl="https://ibhmqlfgbezszyurajof.supabase.co/storage/v1/object/public/products/catalog/1794663871983-product_1739877636_4595.jpg"
                                messageText={previewMessageText}
                                timestamp="12:45 PM"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Custom Saleswoman Directives & Knowledge Box */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-[#241224] tracking-tight">
                            Custom Store Directives & Instructions
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Add specific instructions for Emma to follow during consultations (discounts, authentic UK sourcing, shipping rules).
                        </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                        {customInstructions.length} chars
                    </span>
                </div>

                <div className="space-y-2">
                    <textarea
                        rows={4}
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g. Always remind customers that orders over ৳3,000 receive express delivery inside Dhaka. Highlight that all CeraVe and The Ordinary stocks are fresh air-shipments from London with verified batch numbers."
                        className="w-full p-3.5 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition text-[#241224] placeholder:text-slate-400 font-normal leading-relaxed"
                    />
                </div>
            </div>

            {/* 5. Bottom Save Bar */}
            <div className="flex justify-end pt-1">
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-300 text-white text-xs sm:text-sm font-extrabold shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                    {saving ? 'Saving Changes...' : 'Save Settings'}
                </button>
            </div>
        </div>
    )
}
