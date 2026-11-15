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

        return NextResponse.json({
            success: true,
            settings: {
                hasGeminiKey: Boolean(settings.geminiKey && settings.geminiKey.trim()),
                maskedGeminiKey: maskKey(settings.geminiKey),
                hasGroqKey: Boolean(settings.groqKey && settings.groqKey.trim()),
                maskedGroqKey: maskKey(settings.groqKey),
                hasGrokKey: Boolean(settings.groqKey && settings.groqKey.trim()),
                maskedGrokKey: maskKey(settings.groqKey),
                hasOpenRouterKey: Boolean(settings.openRouterKey && settings.openRouterKey.trim()),
                maskedOpenRouterKey: maskKey(settings.openRouterKey),
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
        } = body;

        const effectiveGroqKey = groqKey !== undefined ? groqKey : grokKey;

        // Action: Connection Test
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
                    message: `No API key provided or saved for ${provider.toUpperCase()}`,
                }, { status: 400 });
            }

            const startTime = Date.now();

            // 1. Google Gemini Dynamic Model Discovery & Verification
            if (provider === 'gemini') {
                try {
                    // Call Google's ListModels first to dynamically discover supported models for this exact key
                    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`;
                    const listRes = await fetch(listUrl);

                    if (!listRes.ok) {
                        const errData = await listRes.json().catch(() => ({}));
                        const errMsg = errData?.error?.message || `Google API key verification failed (${listRes.status})`;
                        return NextResponse.json({
                            success: false,
                            message: errMsg,
                            latencyMs: Date.now() - startTime,
                        }, { status: 400 });
                    }

                    const listData = await listRes.json();
                    const supportedModels = (listData.models || [])
                        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                        .map(m => m.name.replace(/^models\//, ''));

                    if (supportedModels.length === 0) {
                        return NextResponse.json({
                            success: false,
                            message: 'API key is valid, but no generateContent models are accessible.',
                            latencyMs: Date.now() - startTime,
                        }, { status: 400 });
                    }

                    // Choose best model supported by this key
                    const chosenModel =
                        supportedModels.find(n => n.includes('2.0-flash')) ||
                        supportedModels.find(n => n.includes('1.5-flash') && !n.includes('8b')) ||
                        supportedModels.find(n => n.includes('1.5-flash')) ||
                        supportedModels.find(n => n.includes('1.5-pro')) ||
                        supportedModels[0];

                    // Send verified test ping
                    const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${keyToTest}`;
                    const pingRes = await fetch(pingUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: 'Respond with "VERIFIED"' }] }],
                        }),
                    });

                    const totalLatency = Date.now() - startTime;

                    if (pingRes.ok) {
                        return NextResponse.json({
                            success: true,
                            message: `Google Gemini verified successfully using ${chosenModel}! Latency: ${totalLatency}ms`,
                            model: chosenModel,
                            latencyMs: totalLatency,
                        });
                    } else {
                        const pingErr = await pingRes.json().catch(() => ({}));
                        return NextResponse.json({
                            success: false,
                            message: pingErr?.error?.message || `Gemini test ping failed on ${chosenModel}`,
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
                        const errMsg = errData?.error?.message || `Groq API key verification failed (${listRes.status})`;
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
                        return NextResponse.json({
                            success: true,
                            message: `Groq Cloud verified successfully using ${chosenModel}! Latency: ${totalLatency}ms`,
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
                        return NextResponse.json({
                            success: true,
                            message: `OpenRouter verified successfully! Latency: ${totalLatency}ms`,
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

        // Action: Save Settings
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
