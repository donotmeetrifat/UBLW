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
    EyeIcon
} from '@/components/icons'

export default function AdminAiBotPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testingProvider, setTestingProvider] = useState(null) // 'gemini' | 'grok' | 'openrouter' | null

    // Settings State
    const [hasGeminiKey, setHasGeminiKey] = useState(false)
    const [geminiKey, setGeminiKey] = useState('')
    const [showGeminiKey, setShowGeminiKey] = useState(false)

    const [hasGrokKey, setHasGrokKey] = useState(false)
    const [grokKey, setGrokKey] = useState('')
    const [showGrokKey, setShowGrokKey] = useState(false)

    const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false)
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
                setHasGeminiKey(data.settings.hasGeminiKey)
                setGeminiKey(data.settings.maskedGeminiKey || '')

                setHasGrokKey(data.settings.hasGrokKey)
                setGrokKey(data.settings.maskedGrokKey || '')

                setHasOpenRouterKey(data.settings.hasOpenRouterKey)
                setOpenRouterKey(data.settings.maskedOpenRouterKey || '')

                setPreferredProvider(data.settings.preferredProvider || 'gemini')
                setCustomInstructions(data.settings.customInstructions || '')
                setBotName(data.settings.botName || 'Emma - UK Beauty Specialist')
                setEnabled(data.settings.enabled !== false)

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

    // Test API Connection
    const handleTestConnection = async (provider) => {
        const key = provider === 'gemini' ? geminiKey : provider === 'grok' ? grokKey : openRouterKey

        if (!key || !key.trim()) {
            toast.error(`Please enter a ${provider.toUpperCase()} API key first.`)
            return
        }

        setTestingProvider(provider)
        try {
            const res = await fetch('/api/admin/ai-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'test',
                    testProvider: provider,
                    testKey: key,
                }),
            })

            const data = await res.json()
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message || 'Connection test failed')
            }
        } catch (err) {
            toast.error(`Connection test error: ${err.message}`)
        } finally {
            setTestingProvider(null)
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

            // Only send non-masked keys
            if (geminiKey && !geminiKey.includes('••••')) {
                payload.geminiKey = geminiKey
            }
            if (grokKey && !grokKey.includes('••••')) {
                payload.grokKey = grokKey
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
                        Configure free AI provider keys (Gemini, Grok, OpenRouter) and custom saleswoman instructions. The bot automatically reads and updates live catalog data directly from your database.
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

            {/* 3. API Keys Configuration (Triple Fallback) */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-7 shadow-2xs space-y-6">
                <div>
                    <h2 className="text-base font-black text-[#241224] tracking-tight">
                        AI Provider API Keys (Triple Fallback Architecture)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Configure free keys for Google Gemini, xAI Grok, and OpenRouter. If one provider runs out of free requests, Emma automatically switches to the next fallback seamlessly!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Google Gemini (Primary) */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        preferredProvider === 'gemini' ? 'bg-[#FAF6FA]/80 border-[#6C306E]/60 shadow-2xs' : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">✨</span>
                                <h4 className="font-extrabold text-xs text-[#241224]">Google Gemini</h4>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Free Tier
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">
                            Fast multimodal vision + text. Recommended primary engine.
                        </p>

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type={showGeminiKey ? 'text' : 'password'}
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter Gemini API key (AIza...)"
                                    className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] focus:outline-none text-[#241224]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <EyeIcon size={14} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <span className="text-[10px] text-slate-400">
                                    {hasGeminiKey ? '✓ Key Saved' : 'No key saved'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('gemini')}
                                    disabled={testingProvider === 'gemini'}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#EFE0EF] hover:bg-[#FAF6FA] text-[#6C306E] transition disabled:opacity-50"
                                >
                                    {testingProvider === 'gemini' ? 'Testing...' : 'Test Key'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. xAI Grok (1st Backup) */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        preferredProvider === 'grok' ? 'bg-[#FAF6FA]/80 border-[#6C306E]/60 shadow-2xs' : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">⚡</span>
                                <h4 className="font-extrabold text-xs text-[#241224]">xAI Grok</h4>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                1st Backup
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">
                            Direct from api.x.ai for intelligent reasoning & sales advisory.
                        </p>

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type={showGrokKey ? 'text' : 'password'}
                                    value={grokKey}
                                    onChange={(e) => setGrokKey(e.target.value)}
                                    placeholder="Enter Grok API key (xai-...)"
                                    className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] focus:outline-none text-[#241224]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowGrokKey(!showGrokKey)}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <EyeIcon size={14} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <span className="text-[10px] text-slate-400">
                                    {hasGrokKey ? '✓ Key Saved' : 'No key saved'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('grok')}
                                    disabled={testingProvider === 'grok'}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#EFE0EF] hover:bg-[#FAF6FA] text-[#6C306E] transition disabled:opacity-50"
                                >
                                    {testingProvider === 'grok' ? 'Testing...' : 'Test Key'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. OpenRouter (2nd Backup) */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        preferredProvider === 'openrouter' ? 'bg-[#FAF6FA]/80 border-[#6C306E]/60 shadow-2xs' : 'bg-white border-[#EFE0EF]'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">🌐</span>
                                <h4 className="font-extrabold text-xs text-[#241224]">OpenRouter</h4>
                            </div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                2nd Backup
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">
                            Connects to free models (Gemini Flash, Llama 3.3) with 0 downtime.
                        </p>

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type={showOpenRouterKey ? 'text' : 'password'}
                                    value={openRouterKey}
                                    onChange={(e) => setOpenRouterKey(e.target.value)}
                                    placeholder="Enter OpenRouter key (sk-or-...)"
                                    className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-[#EFE0EF] rounded-xl focus:border-[#6C306E] focus:outline-none text-[#241224]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <EyeIcon size={14} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <span className="text-[10px] text-slate-400">
                                    {hasOpenRouterKey ? '✓ Key Saved' : 'No key saved'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('openrouter')}
                                    disabled={testingProvider === 'openrouter'}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#EFE0EF] hover:bg-[#FAF6FA] text-[#6C306E] transition disabled:opacity-50"
                                >
                                    {testingProvider === 'openrouter' ? 'Testing...' : 'Test Key'}
                                </button>
                            </div>
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
                        {['gemini', 'grok', 'openrouter'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPreferredProvider(p)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                                    preferredProvider === p
                                        ? 'bg-[#6C306E] text-white shadow-2xs'
                                        : 'bg-white border border-[#EFE0EF] text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p === 'gemini' ? 'Gemini (Recommended)' : p === 'grok' ? 'xAI Grok' : 'OpenRouter'}
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
                        className="h-10 px-4 rounded-xl bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-200 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
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
