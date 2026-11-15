'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import {
    SparklesIcon,
    ShieldCheckIcon,
    CheckIcon,
    AlertCircleIcon,
    RefreshIcon,
    SendIcon,
    CameraIcon,
    BagIcon,
    EyeIcon,
    DisconnectIcon
} from '@/components/icons'

export default function AdminAiBotPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testingProvider, setTestingProvider] = useState(null) // 'gemini' | 'groq' | 'openrouter' | null
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
        syncMode: 'Real-time Automatic Direct DB Ingestion',
    })

    // Test Sandbox state
    const [testQuery, setTestQuery] = useState('')
    const [testSending, setTestSending] = useState(false)
    const [testResult, setTestResult] = useState(null)

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
            toast.error(`Please paste your ${provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq Cloud' : 'OpenRouter'} API key first.`)
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
                const provName = provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq Cloud' : 'OpenRouter'
                toast.success(`${provName} connected successfully!`, { duration: 4000 })

                // Update connected state immediately
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
                toast.error(data.message || 'Connection failed', { duration: 6000 })
            }
        } catch (err) {
            toast.error(`Connection error: ${err.message}`)
        } finally {
            setTestingProvider(null)
        }
    }

    // Disconnect API Key
    const handleDisconnect = async (provider) => {
        const providerName = provider === 'gemini' ? 'Google Gemini' : provider === 'groq' ? 'Groq Cloud' : 'OpenRouter'
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

    // Save All AI Settings (Instructions, Provider Preference, Bot Name)
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

            // Only send non-masked keys
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
                toast.success('AI Saleswoman settings saved successfully! Changes are live across the store.')
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

    // Sandbox Test Consultation
    const handleSandboxTest = async (e) => {
        e.preventDefault()
        if (!testQuery.trim() || testSending) return

        setTestSending(true)
        setTestResult(null)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: testQuery.trim(),
                }),
            })

            const data = await res.json()
            if (data.success) {
                setTestResult(data)
            } else {
                toast.error(data.message || 'Sandbox query failed')
            }
        } catch (err) {
            toast.error(`Test error: ${err.message}`)
        } finally {
            setTestSending(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <Loading message="Loading AI Saleswoman configuration..." />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
            {/* 1. Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFE0EF]">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] text-xs font-bold text-[#6C306E] mb-2">
                        <SparklesIcon size={14} color="#6C306E" />
                        <span>AI Saleswoman & Knowledge Automation</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#241224] tracking-tight">
                        AI Saleswoman Bot (Emma)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Connect and test your free AI provider keys (Google Gemini, Groq Cloud, OpenRouter). Once tested, each provider shows its verified Connected status with an instant Disconnect option.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
                                <CheckIcon size={16} color="white" />
                                <span>Save All Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. Real-time Catalog Ingestion Status Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-white to-purple-50/50 border border-emerald-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheckIcon size={20} color="#059669" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-[#241224]">
                                Real-Time Catalog Direct Ingestion Active
                            </h3>
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            No manual product data entry required. Emma reads product names, prices, benefits, formulas, and stock counts directly from your live database. Whenever you add or edit a product, Emma knows instantly!
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="px-3 py-2 rounded-xl bg-white border border-[#EFE0EF] text-center shadow-2xs">
                        <span className="block text-base font-black text-[#6C306E]">
                            {catalogStats.totalActiveProducts}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Products</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white border border-[#EFE0EF] text-center shadow-2xs">
                        <span className="block text-base font-black text-emerald-600">
                            {catalogStats.inStockProducts}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">In Stock</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white border border-[#EFE0EF] text-center shadow-2xs">
                        <span className="block text-base font-black text-amber-600">
                            {catalogStats.outOfStockProducts}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Out of Stock</span>
                    </div>
                </div>
            </div>

            {/* 3. API Keys Configuration with Live Connected Status & Disconnect Action */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-6">
                <div>
                    <h2 className="text-base font-black text-[#241224] tracking-tight">
                        AI Provider API Keys (Triple Fallback Architecture)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Paste your API key and click <strong>Connect & Test</strong>. Once successfully tested, the key is saved and marked as <strong>Connected</strong>. You can disconnect anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* 1. Google Gemini (Primary) */}
                    <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        isGeminiConnected
                            ? 'bg-gradient-to-b from-emerald-50/40 to-white border-emerald-300/80 shadow-xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Connection Badge */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base">✨</span>
                                    <h4 className="font-extrabold text-xs text-[#241224]">Google Gemini</h4>
                                </div>
                                {isGeminiConnected ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-slate-500 mb-3">
                                Free tier multimodal vision + text via Gemini 1.5/2.0 Flash from aistudio.google.com.
                            </p>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-4">
                                <div className="relative">
                                    <input
                                        type={showGeminiKey ? 'text' : 'password'}
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        placeholder="Paste Gemini API key (AIza...)"
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
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1">
                                        Active Model: {geminiModel}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions: Connect OR Disconnect */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80 flex items-center justify-between gap-2">
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
                                        <>
                                            <SparklesIcon size={13} color="white" />
                                            <span>Connect</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. Groq Cloud (Free LPU Tier) */}
                    <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        isGroqConnected
                            ? 'bg-gradient-to-b from-emerald-50/40 to-white border-emerald-300/80 shadow-xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Connection Badge */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base">⚡</span>
                                    <h4 className="font-extrabold text-xs text-[#241224]">Groq Cloud</h4>
                                </div>
                                {isGroqConnected ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-slate-500 mb-3">
                                Free ultra-fast LPU inference (Llama 3.3 70B & 3.1) from console.groq.com.
                            </p>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-4">
                                <div className="relative">
                                    <input
                                        type={showGroqKey ? 'text' : 'password'}
                                        value={groqKey}
                                        onChange={(e) => setGroqKey(e.target.value)}
                                        placeholder="Paste Groq API key (gsk_...)"
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
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1">
                                        Active Model: {groqModel}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions: Connect OR Disconnect */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80 flex items-center justify-between gap-2">
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
                                        <>
                                            <SparklesIcon size={13} color="white" />
                                            <span>Connect</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 3. OpenRouter (2nd Backup) */}
                    <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        isOpenRouterConnected
                            ? 'bg-gradient-to-b from-emerald-50/40 to-white border-emerald-300/80 shadow-xs'
                            : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div>
                            {/* Card Header with Connection Badge */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base">🌐</span>
                                    <h4 className="font-extrabold text-xs text-[#241224]">OpenRouter</h4>
                                </div>
                                {isOpenRouterConnected ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                        Not Connected
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-slate-500 mb-3">
                                Connects to free models (Gemini Flash, Llama 3.3) from openrouter.ai/keys.
                            </p>

                            {/* Input Field */}
                            <div className="space-y-1.5 mb-4">
                                <div className="relative">
                                    <input
                                        type={showOpenRouterKey ? 'text' : 'password'}
                                        value={openRouterKey}
                                        onChange={(e) => setOpenRouterKey(e.target.value)}
                                        placeholder="Paste OpenRouter key (sk-or-...)"
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
                                    <p className="text-[10px] text-emerald-700 font-semibold px-1">
                                        Active Model: Gemini 2.0 Flash (Free)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card Actions: Connect OR Disconnect */}
                        <div className="pt-2 border-t border-[#EFE0EF]/80 flex items-center justify-between gap-2">
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
                                        <>
                                            <SparklesIcon size={13} color="white" />
                                            <span>Connect</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Primary Provider Selector */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF6FA] rounded-2xl border border-[#EFE0EF]">
                    <div>
                        <span className="text-xs font-bold text-[#241224]">Active Primary Engine:</span>
                        <p className="text-[11px] text-slate-500">
                            Emma tries this provider first, then automatically falls back to the others if busy or quota exhausted.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'gemini', label: 'Gemini (Recommended)', connected: isGeminiConnected },
                            { id: 'groq', label: 'Groq (Free LPU)', connected: isGroqConnected },
                            { id: 'openrouter', label: 'OpenRouter', connected: isOpenRouterConnected }
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPreferredProvider(p.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                    preferredProvider === p.id
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'bg-white border border-[#EFE0EF] text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className={`size-1.5 rounded-full ${p.connected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                <span>{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Custom Saleswoman Instructions Box */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-4">
                <div>
                    <h2 className="text-base font-black text-[#241224] tracking-tight">
                        Custom Saleswoman Instructions & Store Directives
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Add any specific instructions for Emma. She will follow these directives strictly in every customer chat (e.g. promoting a weekend discount, highlighting free delivery, emphasizing authentic British batch codes, or pushing specific product categories).
                    </p>
                </div>

                <div className="space-y-1.5">
                    <textarea
                        rows={4}
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g. Always remind customers that orders over ৳3,000 receive free shipping inside Dhaka. Highlight that our CeraVe and The Ordinary stocks are fresh air-shipments from London with verified batch numbers. If a customer asks for a discount, mention they can use coupon UKBL10 for 10% off their first order."
                        className="w-full p-3.5 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition text-[#241224] placeholder:text-slate-400 font-normal leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>Instructions are combined with Emma's core British beauty salesmanship persona.</span>
                        <span>{customInstructions.length} characters</span>
                    </div>
                </div>
            </div>

            {/* 5. Live Test Sandbox */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-4">
                <div>
                    <h2 className="text-base font-black text-[#241224] tracking-tight">
                        Live Saleswoman Sandbox Test
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Test how Emma answers customer queries with live database stock checks and structured product cards.
                    </p>
                </div>

                <form onSubmit={handleSandboxTest} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        placeholder="Ask Emma: e.g. 'Do you have CeraVe cleanser in stock?' or 'Best serum for acne marks?'"
                        className="flex-1 h-10 px-3.5 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl focus:bg-white focus:border-[#6C306E] focus:outline-none text-[#241224]"
                    />
                    <button
                        type="submit"
                        disabled={testSending || !testQuery.trim()}
                        className="h-10 px-4 rounded-xl bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-200 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                        {testSending ? 'Thinking...' : 'Test Ask'}
                        <SendIcon size={14} color="white" />
                    </button>
                </form>

                {testResult && (
                    <div className="p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#6C306E] font-bold">
                            <span>Emma's Reply:</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[10px]">
                                Provider: {testResult.provider}
                            </span>
                        </div>
                        <div className="text-xs text-[#241224] whitespace-pre-wrap leading-relaxed select-text">
                            {testResult.message}
                        </div>

                        {Array.isArray(testResult.products) && testResult.products.length > 0 && (
                            <div className="pt-2 border-t border-[#EFE0EF]/80 space-y-2">
                                <span className="text-[11px] font-bold text-slate-500">Attached Product Cards:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {testResult.products.map(p => (
                                        <div key={p.id} className="p-2.5 rounded-xl bg-white border border-[#EFE0EF] flex items-center gap-2.5">
                                            {p.image && (
                                                <img src={p.image} alt={p.name} className="size-10 rounded-lg object-contain" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h5 className="text-xs font-bold text-[#241224] truncate">{p.name}</h5>
                                                <div className="flex items-center gap-2 text-[11px]">
                                                    <span className="font-black text-[#6C306E]">৳{p.price}</span>
                                                    <span className={p.inStock ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                                                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-2 flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-3 rounded-2xl bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-300 text-white text-xs sm:text-sm font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                    {saving ? 'Saving Changes...' : 'Save & Publish AI Settings'}
                </button>
            </div>
        </div>
    )
}
