'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import { broadcastStoreChange } from '@/lib/realtimeSync'
import {
    SparklesIcon,
    CheckIcon,
    RefreshIcon,
    EyeIcon,
    DisconnectIcon
} from '@/components/icons'

const defaultCuratedVoices = [
    { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', labels: { accent: 'British', gender: 'Female', description: 'Soft & Warm' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/dfed914d-17c3-4554-9f79-6638c4b9687e.mp3' },
    { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', labels: { accent: 'British', gender: 'Female', description: 'Warm & Refined' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68bde-5345-4217-a9a7-3a68332a35d0.mp3' },
    { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', labels: { accent: 'American', gender: 'Female', description: 'Calm & Polite' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/b7880775-52b0-449e-b53d-5192c7d9bc37.mp3' },
    { voice_id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', labels: { accent: 'American', gender: 'Female', description: 'Friendly & Bright' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3' },
    { voice_id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', labels: { accent: 'British', gender: 'Female', description: 'Confident & Clear' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482c336.mp3' },
    { voice_id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', labels: { accent: 'American', gender: 'Female', description: 'Enthusiastic & Sunny' }, preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/673417e1-9548-4334-86e7-2ef44b4e73a4.mp3' },
];

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

    // ElevenLabs Voice Engine States
    const [isElevenLabsConnected, setIsElevenLabsConnected] = useState(false)
    const [elevenLabsKey, setElevenLabsKey] = useState('')
    const [showElevenLabsKey, setShowElevenLabsKey] = useState(false)
    const [isElevenLabs2Connected, setIsElevenLabs2Connected] = useState(false)
    const [elevenLabs2Key, setElevenLabs2Key] = useState('')
    const [showElevenLabs2Key, setShowElevenLabs2Key] = useState(false)
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

                // ElevenLabs Voice Engine Status (Primary)
                const elevenConn = Boolean(s.elevenlabs?.isConnected || s.hasElevenLabsKey)
                setIsElevenLabsConnected(elevenConn)
                setElevenLabsKey(s.elevenlabs?.maskedKey || s.maskedElevenLabsKey || '')
                if (s.elevenlabs?.selectedVoiceId) setSelectedVoiceId(s.elevenlabs.selectedVoiceId)
                if (s.elevenlabs?.selectedVoiceName) setSelectedVoiceName(s.elevenlabs.selectedVoiceName)
                if (s.elevenlabs?.voiceCallEnabled !== undefined) setVoiceCallEnabled(s.elevenlabs.voiceCallEnabled)

                // ElevenLabs Voice Engine Status (Backup #2)
                const eleven2Conn = Boolean(s.elevenlabs2?.isConnected || s.hasElevenLabsKey2)
                setIsElevenLabs2Connected(eleven2Conn)
                setElevenLabs2Key(s.elevenlabs2?.maskedKey || s.maskedElevenLabsKey2 || '')

                if (elevenConn || eleven2Conn) {
                    fetchVoices()
                }

                const normPref = s.preferredProvider === 'grok' ? 'groq' : (s.preferredProvider || 'gemini')
                setPreferredProvider(normPref)
                setCustomInstructions(s.customInstructions || '')
                setBotName(s.botName || 'Emma - UK Beauty Specialist')
                setEnabled(s.enabled !== false)

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
        const key = provider === 'gemini' 
            ? geminiKey 
            : provider === 'gemini2'
            ? gemini2Key
            : provider === 'groq' 
            ? groqKey 
            : provider === 'elevenlabs'
            ? elevenLabsKey
            : provider === 'elevenlabs2'
            ? elevenLabs2Key
            : openRouterKey

        if (!key || !key.trim()) {
            const provName = provider === 'gemini' 
                ? 'Google Gemini' 
                : provider === 'gemini2'
                ? 'Gemini Backup'
                : provider === 'groq' 
                ? 'Groq Cloud' 
                : provider === 'elevenlabs'
                ? 'ElevenLabs'
                : provider === 'elevenlabs2'
                ? 'ElevenLabs Backup'
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
                    : provider === 'elevenlabs'
                    ? 'ElevenLabs'
                    : provider === 'elevenlabs2'
                    ? 'ElevenLabs Backup'
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
                } else if (provider === 'elevenlabs') {
                    setIsElevenLabsConnected(true)
                    setElevenLabsKey(data.maskedKey || key)
                    if (Array.isArray(data.voices) && data.voices.length > 0) {
                        setAvailableVoices(data.voices)
                    }
                } else if (provider === 'elevenlabs2') {
                    setIsElevenLabs2Connected(true)
                    setElevenLabs2Key(data.maskedKey || key)
                    if (Array.isArray(data.voices) && data.voices.length > 0) {
                        setAvailableVoices(data.voices)
                    }
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
            : provider === 'elevenlabs'
            ? 'ElevenLabs'
            : provider === 'elevenlabs2'
            ? 'ElevenLabs Backup'
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
                } else if (provider === 'elevenlabs') {
                    setIsElevenLabsConnected(false)
                    setElevenLabsKey('')
                    if (!isElevenLabs2Connected) {
                        setAvailableVoices([])
                        if (audioPlayer) audioPlayer.pause()
                        setPlayingVoiceId(null)
                    }
                } else if (provider === 'elevenlabs2') {
                    setIsElevenLabs2Connected(false)
                    setElevenLabs2Key('')
                    if (!isElevenLabsConnected) {
                        setAvailableVoices([])
                        if (audioPlayer) audioPlayer.pause()
                        setPlayingVoiceId(null)
                    }
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
            if (elevenLabsKey && !elevenLabsKey.includes('••••')) {
                payload.elevenLabsKey = elevenLabsKey
            }
            if (elevenLabs2Key && !elevenLabs2Key.includes('••••')) {
                payload.elevenLabsKey2 = elevenLabs2Key
            }

            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (data.success) {
                toast.success('AI settings saved successfully!')
                broadcastStoreChange('ai_settings', { voiceCallEnabled })
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
                                        Free Tier Active
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
                const voiceListToDisplay = (availableVoices && availableVoices.length > 0)
                    ? availableVoices
                    : defaultCuratedVoices;

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
                                {isElevenLabsConnected || isElevenLabs2Connected ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wide shadow-2xs">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold shadow-2xs">
                                        <span className="size-2 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* API Key Connection Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6FA]/60 border border-[#EFE0EF] space-y-4">
                            {/* Primary Key Row */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-0.5 max-w-md">
                                    <div className="flex items-center gap-1.5">
                                        <img src="/logos/elevenlabs.png?v=2" alt="ElevenLabs" className="size-3.5 object-contain" />
                                        <span className="text-xs font-bold text-[#241224]">ElevenLabs API Key:</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Primary voice synthesis key used for natural human speech in calls.</p>
                                </div>

                                <div className="flex items-center gap-2.5 flex-1 max-w-lg">
                                    <div className="relative flex-1">
                                        <input
                                            type={showElevenLabsKey ? 'text' : 'password'}
                                            value={elevenLabsKey}
                                            onChange={(e) => setElevenLabsKey(e.target.value)}
                                            placeholder="Paste primary ElevenLabs key (xi-api-key)..."
                                            className="w-full h-10 px-3.5 pr-10 text-xs bg-white border border-[#EFE0EF] rounded-xl focus:outline-none focus:border-[#6C306E] font-mono text-[#241224]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            <EyeIcon size={14} />
                                        </button>
                                    </div>

                                    {isElevenLabsConnected ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDisconnect('elevenlabs')}
                                            disabled={disconnectingProvider === 'elevenlabs'}
                                            className="h-10 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                                        >
                                            <DisconnectIcon size={13} color="currentColor" />
                                            <span>{disconnectingProvider === 'elevenlabs' ? 'Disconnecting...' : 'Disconnect'}</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleConnect('elevenlabs')}
                                            disabled={testingProvider === 'elevenlabs'}
                                            className="h-10 px-5 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs"
                                        >
                                            {testingProvider === 'elevenlabs' ? (
                                                <>
                                                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <span>Connect & Test</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Backup Key Row */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-[#EFE0EF]">
                                <div className="space-y-0.5 max-w-md">
                                    <div className="flex items-center gap-1.5">
                                        <img src="/logos/elevenlabs.png?v=2" alt="ElevenLabs" className="size-3.5 object-contain" />
                                        <span className="text-xs font-bold text-[#241224]">ElevenLabs Backup API Key:</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">Automatic fallback if primary key characters or quota run out.</p>
                                </div>

                                <div className="flex items-center gap-2.5 flex-1 max-w-lg">
                                    <div className="relative flex-1">
                                        <input
                                            type={showElevenLabs2Key ? 'text' : 'password'}
                                            value={elevenLabs2Key}
                                            onChange={(e) => setElevenLabs2Key(e.target.value)}
                                            placeholder="Paste backup ElevenLabs key (xi-api-key)..."
                                            className="w-full h-10 px-3.5 pr-10 text-xs bg-white border border-[#EFE0EF] rounded-xl focus:outline-none focus:border-[#6C306E] font-mono text-[#241224]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowElevenLabs2Key(!showElevenLabs2Key)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            <EyeIcon size={14} />
                                        </button>
                                    </div>

                                    {isElevenLabs2Connected ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDisconnect('elevenlabs2')}
                                            disabled={disconnectingProvider === 'elevenlabs2'}
                                            className="h-10 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                                        >
                                            <DisconnectIcon size={13} color="currentColor" />
                                            <span>{disconnectingProvider === 'elevenlabs2' ? 'Disconnecting...' : 'Disconnect'}</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleConnect('elevenlabs2')}
                                            disabled={testingProvider === 'elevenlabs2'}
                                            className="h-10 px-5 rounded-xl bg-[#6C306E] hover:bg-[#562258] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs"
                                        >
                                            {testingProvider === 'elevenlabs2' ? (
                                                <>
                                                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : (
                                                <span>Connect & Test</span>
                                            )}
                                        </button>
                                    )}
                                </div>
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
                                    <h3 className="text-xs sm:text-sm font-extrabold text-[#241224]">
                                        Select Saleswoman Voice ({voiceListToDisplay.length} Available)
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Click "Preview" to listen to each voice's real sample audio, then click "Select Voice" to assign it to Emma.
                                    </p>
                                </div>
                                {isElevenLabsConnected && (
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
                            <div className="p-3 px-4 rounded-xl bg-purple-50 border border-purple-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-[#6C306E]" />
                                    <span className="text-slate-600">Currently Active Voice:</span>
                                    <strong className="text-[#6C306E] font-black">{selectedVoiceName || 'Sarah (Soft & Warm)'}</strong>
                                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-purple-200">
                                        ID: {selectedVoiceId}
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold text-purple-700 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                                    Multilingual v2 Active (Bengali & English)
                                </span>
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
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF6FA] text-slate-600 font-medium border border-[#EFE0EF] truncate max-w-[100px]">
                                                        {desc}
                                                    </span>
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

            {/* 5. Custom Saleswoman Directives & Knowledge Box */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-[#241224] tracking-tight">
                            Custom Store Directives & Instructions
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Add specific instructions for Emma to follow during consultations (discounts, authentic UK sourcing, free shipping rules).
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
                        placeholder="e.g. Always remind customers that orders over ৳3,000 receive free shipping inside Dhaka. Highlight that all CeraVe and The Ordinary stocks are fresh air-shipments from London with verified batch numbers."
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
