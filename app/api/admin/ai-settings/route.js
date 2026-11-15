import { NextResponse } from 'next/server';
import { getAiSettings, saveAiSettings, getLiveCatalogContext } from '@/lib/aiBot';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function maskKey(key) {
    if (!key || typeof key !== 'string') return '';
    const trimmed = key.trim();
    if (trimmed.length <= 8) return '••••••••';
    return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

export async function GET(request) {
    try {
        const [settings, catalog] = await Promise.all([
            getAiSettings(),
            getLiveCatalogContext(),
        ]);

        const inStockCount = catalog.filter(p => p.inStock).length;

        const hasGemini = Boolean(settings.geminiKey && settings.geminiKey.trim());
        const hasGroq = Boolean(settings.groqKey && settings.groqKey.trim());
        const hasOpenRouter = Boolean(settings.openRouterKey && settings.openRouterKey.trim());

        return NextResponse.json({
            success: true,
            settings: {
                hasGeminiKey: hasGemini,
                maskedGeminiKey: maskKey(settings.geminiKey),
                hasGroqKey: hasGroq,
                maskedGroqKey: maskKey(settings.groqKey),
                hasGrokKey: hasGroq,
                maskedGrokKey: maskKey(settings.groqKey),
                hasOpenRouterKey: hasOpenRouter,
                maskedOpenRouterKey: maskKey(settings.openRouterKey),

                // Explicit connection status objects
                gemini: {
                    isConnected: hasGemini,
                    maskedKey: maskKey(settings.geminiKey),
                },
                groq: {
                    isConnected: hasGroq,
                    maskedKey: maskKey(settings.groqKey),
                },
                openrouter: {
                    isConnected: hasOpenRouter,
                    maskedKey: maskKey(settings.openRouterKey),
                },

                preferredProvider: settings.preferredProvider || 'gemini',
                customInstructions: settings.customInstructions || '',
                botName: settings.botName || 'Emma - UK Beauty Specialist',
                enabled: settings.enabled !== false,
            },
            catalogStats: {
                totalActiveProducts: catalog.length,
                inStockProducts: inStockCount,
                outOfStockProducts: Math.max(0, catalog.length - inStockCount),
                lastRefreshedAt: new Date().toISOString(),
                syncMode: 'Real-time Automatic Direct DB Ingestion',
            },
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch AI settings', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            geminiKey,
            groqKey,
            grokKey,
            openRouterKey,
            preferredProvider,
            customInstructions,
            botName,
            enabled,
            action,
            testProvider,
            testKey,
            provider: disconnectProvider,
        } = body;

        const effectiveGroqKey = groqKey !== undefined ? groqKey : grokKey;

        // Action: Disconnect Provider API Key
        if (action === 'disconnect') {
            const rawTarget = (testProvider || disconnectProvider || '').toLowerCase();
            const target = rawTarget === 'grok' ? 'groq' : rawTarget;

            if (target === 'gemini') {
                await saveAiSettings({ geminiKey: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'gemini',
                    message: 'Google Gemini API disconnected successfully.',
                });
            } else if (target === 'groq') {
                await saveAiSettings({ groqKey: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'groq',
                    message: 'Groq Cloud API disconnected successfully.',
                });
            } else if (target === 'openrouter') {
                await saveAiSettings({ openRouterKey: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'openrouter',
                    message: 'OpenRouter API disconnected successfully.',
                });
            }

            return NextResponse.json({ success: false, message: 'Invalid provider to disconnect' }, { status: 400 });
        }

        // Action: Connection Test & Auto-Connect
        if (action === 'test') {
            const rawProvider = (testProvider || 'gemini').toLowerCase();
            const provider = rawProvider === 'grok' ? 'groq' : rawProvider;
            const currentSettings = await getAiSettings();

            let keyToTest = (testKey && testKey.trim()) ? testKey.trim() : '';
            if (!keyToTest) {
                keyToTest = provider === 'gemini'
                    ? currentSettings.geminiKey
                    : provider === 'groq'
                    ? currentSettings.groqKey
                    : currentSettings.openRouterKey;
            }

            if (!keyToTest) {
                return NextResponse.json({
                    success: false,
                    message: `Please paste a valid ${provider.toUpperCase()} API key first.`,
                }, { status: 400 });
            }

            const startTime = Date.now();

            // 1. Google Gemini Dynamic Discovery & Verification
            if (provider === 'gemini') {
                try {
                    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`;
                    const listRes = await fetch(listUrl);

                    if (!listRes.ok) {
                        const errData = await listRes.json().catch(() => ({}));
                        const errMsg = errData?.error?.message || `Google API key verification failed (${listRes.status}). Please check your key at aistudio.google.com.`;
                        return NextResponse.json({
                            success: false,
                            message: errMsg,
                            latencyMs: Date.now() - startTime,
                        }, { status: 400 });
                    }

                    const listData = await listRes.json();
                    const allSupported = (listData.models || [])
                        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                        .map(m => m.name.replace(/^models\//, ''))
                        .filter(n => !n.includes('2.5') && !n.includes('8b'));

                    const priorityCandidates = [
                        'gemini-1.5-flash',
                        'gemini-1.5-flash-latest',
                        'gemini-2.0-flash',
                        'gemini-2.0-flash-exp',
                        'gemini-1.5-pro',
                        'gemini-pro',
                        ...allSupported,
                    ];

                    const candidateQueue = [...new Set(priorityCandidates)].filter(m => allSupported.length === 0 || allSupported.includes(m));
                    const modelsToTry = candidateQueue.length > 0 ? candidateQueue : ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

                    let workingModel = null;
                    let lastErrMsg = null;

                    for (const model of modelsToTry) {
                        try {
                            const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`;
                            const pingRes = await fetch(pingUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: 'Respond with "VERIFIED"' }] }],
                                }),
                            });

                            if (pingRes.ok) {
                                workingModel = model;
                                break;
                            } else {
                                const pingErr = await pingRes.json().catch(() => ({}));
                                lastErrMsg = pingErr?.error?.message || `Model ${model} returned status ${pingRes.status}`;
                            }
                        } catch (pingErr) {
                            lastErrMsg = pingErr.message;
                        }
                    }

                    const totalLatency = Date.now() - startTime;

                    if (workingModel) {
                        // Automatically persist verified key into database!
                        await saveAiSettings({ geminiKey: keyToTest });

                        return NextResponse.json({
                            success: true,
                            isConnected: true,
                            maskedKey: maskKey(keyToTest),
                            provider: 'gemini',
                            message: `Google Gemini connected & verified successfully! (${workingModel}, ${totalLatency}ms)`,
                            model: workingModel,
                            latencyMs: totalLatency,
                        });
                    } else {
                        return NextResponse.json({
                            success: false,
                            message: lastErrMsg || 'No working Gemini model could generate content with this key.',
                            latencyMs: totalLatency,
                        }, { status: 400 });
                    }
                } catch (netErr) {
                    return NextResponse.json({
                        success: false,
                        message: `Gemini network error: ${netErr.message}`,
                        latencyMs: Date.now() - startTime,
                    }, { status: 400 });
                }
            }

            // 2. Groq Cloud (Free LPU) Dynamic Model Discovery & Verification
            else if (provider === 'groq') {
                try {
                    const listRes = await fetch('https://api.groq.com/openai/v1/models', {
                        headers: {
                            Authorization: `Bearer ${keyToTest}`,
                        },
                    });

                    if (!listRes.ok) {
                        const errData = await listRes.json().catch(() => ({}));
                        const errMsg = errData?.error?.message || `Groq API key verification failed (${listRes.status}). Please check your key at console.groq.com.`;
                        return NextResponse.json({
                            success: false,
                            message: errMsg,
                            latencyMs: Date.now() - startTime,
                        }, { status: 400 });
                    }

                    const listData = await listRes.json();
                    const availableModels = (listData.data || []).map(m => m.id);

                    const chosenModel =
                        availableModels.find(id => id.includes('llama-3.3-70b')) ||
                        availableModels.find(id => id.includes('llama-3.1-8b-instant')) ||
                        availableModels.find(id => id.includes('llama3-70b')) ||
                        availableModels[0] ||
                        'llama-3.3-70b-versatile';

                    const pingRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${keyToTest}`,
                        },
                        body: JSON.stringify({
                            model: chosenModel,
                            messages: [{ role: 'user', content: 'Respond with "VERIFIED"' }],
                            max_tokens: 10,
                        }),
                    });

                    const totalLatency = Date.now() - startTime;

                    if (pingRes.ok) {
                        // Automatically persist verified key into database!
                        await saveAiSettings({ groqKey: keyToTest });

                        return NextResponse.json({
                            success: true,
                            isConnected: true,
                            maskedKey: maskKey(keyToTest),
                            provider: 'groq',
                            message: `Groq Cloud connected & verified successfully! (${chosenModel}, ${totalLatency}ms)`,
                            model: chosenModel,
                            latencyMs: totalLatency,
                        });
                    } else {
                        const pingErr = await pingRes.json().catch(() => ({}));
                        return NextResponse.json({
                            success: false,
                            message: pingErr?.error?.message || `Groq ping failed on ${chosenModel}`,
                            latencyMs: totalLatency,
                        }, { status: 400 });
                    }
                } catch (netErr) {
                    return NextResponse.json({
                        success: false,
                        message: `Groq network error: ${netErr.message}`,
                        latencyMs: Date.now() - startTime,
                    }, { status: 400 });
                }
            }

            // 3. OpenRouter Verification
            else if (provider === 'openrouter') {
                try {
                    const pingRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${keyToTest}`,
                            'HTTP-Referer': 'https://ukbrandlover.com',
                            'X-Title': 'UK Brand Lover Beauty Advisor',
                        },
                        body: JSON.stringify({
                            model: 'google/gemini-2.0-flash-exp:free',
                            messages: [{ role: 'user', content: 'Respond with "VERIFIED"' }],
                            max_tokens: 10,
                        }),
                    });

                    const totalLatency = Date.now() - startTime;

                    if (pingRes.ok) {
                        // Automatically persist verified key into database!
                        await saveAiSettings({ openRouterKey: keyToTest });

                        return NextResponse.json({
                            success: true,
                            isConnected: true,
                            maskedKey: maskKey(keyToTest),
                            provider: 'openrouter',
                            message: `OpenRouter connected & verified successfully! (${totalLatency}ms)`,
                            latencyMs: totalLatency,
                        });
                    } else {
                        const err = await pingRes.json().catch(() => ({}));
                        return NextResponse.json({
                            success: false,
                            message: err?.error?.message || `OpenRouter verification failed (${pingRes.status})`,
                            latencyMs: totalLatency,
                        }, { status: 400 });
                    }
                } catch (netErr) {
                    return NextResponse.json({
                        success: false,
                        message: `OpenRouter network error: ${netErr.message}`,
                        latencyMs: Date.now() - startTime,
                    }, { status: 400 });
                }
            }
        }

        // Action: Save All Settings
        const updatePayload = {
            preferredProvider: preferredProvider === 'grok' ? 'groq' : preferredProvider,
            customInstructions,
            botName,
            enabled,
        };

        if (geminiKey !== undefined && !geminiKey.includes('••••')) {
            updatePayload.geminiKey = geminiKey;
        }
        if (effectiveGroqKey !== undefined && !effectiveGroqKey.includes('••••')) {
            updatePayload.groqKey = effectiveGroqKey;
        }
        if (openRouterKey !== undefined && !openRouterKey.includes('••••')) {
            updatePayload.openRouterKey = openRouterKey;
        }

        await saveAiSettings(updatePayload);

        return NextResponse.json({
            success: true,
            message: 'AI Saleswoman settings saved successfully! Changes are live immediately across the website.',
        });
    } catch (error) {
        console.error('Error saving AI settings:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update AI settings', error: error.message },
            { status: 500 }
        );
    }
}
