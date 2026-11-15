'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import {
    SparklesIcon,
    CheckIcon,
    RefreshIcon,
    EyeIcon,
    DisconnectIcon
} from '@/components/icons'

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

    const [isGroqConnected, setIsGroqConnected] = useState(false)
    const [groqKey, setGroqKey] = useState('')
    const [showGroqKey, setShowGroqKey] = useState(false)
    const [groqModel, setGroqModel] = useState('')

    const [isOpenRouterConnected, setIsOpenRouterConnected] = useState(false)
    const [openRouterKey, setOpenRouterKey] = useState('')
    const [showOpenRouterKey, setShowOpenRouterKey] = useState(false)

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
            const res = await fetch('/api/admin/ai-settings')
            const data = await res.json()

            if (data.success && data.settings) {
                const s = data.settings

                // Gemini Status
                const geminiConn = Boolean(s.gemini?.isConnected || s.hasGeminiKey)
                setIsGeminiConnected(geminiConn)
                setGeminiKey(s.gemini?.maskedKey || s.maskedGeminiKey || '')

                // Groq Status
                const groqConn = Boolean(s.groq?.isConnected || s.hasGroqKey || s.hasGrokKey)
                setIsGroqConnected(groqConn)
                setGroqKey(s.groq?.maskedKey || s.maskedGroqKey || s.maskedGrokKey || '')

                // OpenRouter Status
                const openRouterConn = Boolean(s.openrouter?.isConnected || s.hasOpenRouterKey)
                setIsOpenRouterConnected(openRouterConn)
                setOpenRouterKey(s.openrouter?.maskedKey || s.maskedOpenRouterKey || '')

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

    useEffect(() => {
        fetchSettings()
    }, [])

    // Connect API Key
    const handleConnect = async (provider) => {
        const key = provider === 'gemini' ? geminiKey : provider === 'groq' ? groqKey : openRouterKey

        if (!key || !key.trim()) {
            const provName = provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq' : 'OpenRouter'
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
                const provName = provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq' : 'OpenRouter'
                toast.success(`${provName} connected successfully!`)

                if (provider === 'gemini') {
                    setIsGeminiConnected(true)
                    setGeminiKey(data.maskedKey || key)
                    if (data.model) setGeminiModel(data.model)
                } else if (provider === 'groq') {
                    setIsGroqConnected(true)
                    setGroqKey(data.maskedKey || key)
                    if (data.model) setGroqModel(data.model)
                } else if (provider === 'openrouter') {
                    setIsOpenRouterConnected(true)
                    setOpenRouterKey(data.maskedKey || key)
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
        const providerName = provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq' : 'OpenRouter'
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
                } else if (provider === 'groq') {
                    setIsGroqConnected(false)
                    setGroqKey('')
                    setGroqModel('')
                } else if (provider === 'openrouter') {
                    setIsOpenRouterConnected(false)
                    setOpenRouterKey('')
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
            }

            if (geminiKey && !geminiKey.includes('••••')) {
                payload.geminiKey = geminiKey
            }
            if (groqKey && !groqKey.includes('••••')) {
                payload.groqKey = groqKey
            }
            if (openRouterKey && !openRouterKey.includes('••••')) {
                payload.openRouterKey = openRouterKey
            }

            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (data.success) {
                toast.success('AI settings saved successfully!')
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
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

            {/* 3. AI Providers & API Keys (Triple Fallback Architecture) */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs space-y-5">
                <div>
                    <h2 className="text-base font-extrabold text-[#241224] tracking-tight">
                        AI Provider API Keys
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Connect one or multiple providers. Emma will automatically failover to secondary providers if quota is reached.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {/* 1. Google Gemini */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isGeminiConnected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/gemini.png" alt="Google Gemini" className="size-6 object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224]">Google Gemini</h4>
                                </div>
                                {isGeminiConnected ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
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

                    {/* 2. Groq Cloud */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isGroqConnected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-white border border-[#EFE0EF] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/groq.png" alt="Groq" className="size-6 object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224]">Groq Cloud</h4>
                                </div>
                                {isGroqConnected ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
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

                    {/* 3. OpenRouter */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isOpenRouterConnected
                            ? 'bg-gradient-to-b from-emerald-50/30 to-white border-emerald-300/80 shadow-2xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Real Logo & Connection Badge */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 px-2 rounded-lg bg-white border border-[#EFE0EF] flex items-center justify-center shrink-0 shadow-2xs">
                                        <img src="/logos/openrouter.png" alt="OpenRouter" className="h-4.5 w-auto max-w-[95px] object-contain" />
                                    </div>
                                    <h4 className="font-bold text-xs sm:text-[13px] text-[#241224]">OpenRouter</h4>
                                </div>
                                {isOpenRouterConnected ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
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
                                        Free Tier Models Active
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

                {/* Primary Engine Segmented Control */}
                <div className="pt-3 border-t border-[#EFE0EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-xs font-bold text-[#241224]">Primary Provider Engine:</span>
                        <p className="text-[11px] text-slate-500">Emma queries this provider first, then automatically fails over if busy.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'gemini', label: 'Google Gemini', icon: '/logos/gemini.png', connected: isGeminiConnected },
                            { id: 'groq', label: 'Groq Cloud', icon: '/logos/groq.png', connected: isGroqConnected },
                            { id: 'openrouter', label: 'OpenRouter', icon: '/logos/openrouter.png', connected: isOpenRouterConnected },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPreferredProvider(p.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                    preferredProvider === p.id
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'bg-[#FAF6FA] border border-[#EFE0EF] text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span className={`size-1.5 rounded-full ${p.connected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                <span>{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Custom Saleswoman Directives & Knowledge Box */}
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
