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

            // 1. Google Gemini Connection Test with resilient model fallback
            if (provider === 'gemini') {
                const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
                let lastError = null;

                for (const model of modelsToTry) {
                    try {
                        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`;
                        const res = await fetch(testUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ role: 'user', parts: [{ text: 'Respond with exactly the single word "VERIFIED".' }] }],
                            }),
                        });
                        const latencyMs = Date.now() - startTime;

                        if (res.ok) {
                            return NextResponse.json({
                                success: true,
                                message: `Gemini (${model}) connected successfully! Latency: ${latencyMs}ms`,
                                latencyMs,
                            });
                        } else {
                            const errText = await res.text();
                            lastError = errText;
                        }
                    } catch (e) {
                        lastError = e.message;
                    }
                }

                return NextResponse.json({
                    success: false,
                    message: `Gemini verification failed: ${lastError ? lastError.substring(0, 250) : 'Service unavailable'}`,
                    latencyMs: Date.now() - startTime,
                }, { status: 400 });
            }

            // 2. Groq Cloud (Free LPU) Connection Test
            else if (provider === 'groq') {
                const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
                let lastError = null;

                for (const model of modelsToTry) {
                    try {
                        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${keyToTest}`,
                            },
                            body: JSON.stringify({
                                model,
                                messages: [{ role: 'user', content: 'Respond with "VERIFIED"' }],
                                max_tokens: 10,
                            }),
                        });
                        const latencyMs = Date.now() - startTime;

                        if (res.ok) {
                            return NextResponse.json({
                                success: true,
                                message: `Groq Cloud (${model}) connected successfully! Latency: ${latencyMs}ms`,
                                latencyMs,
                            });
                        } else {
                            const err = await res.text();
                            lastError = err;
                        }
                    } catch (e) {
                        lastError = e.message;
                    }
                }

                return NextResponse.json({
                    success: false,
                    message: `Groq verification failed: ${lastError ? lastError.substring(0, 250) : 'Unable to connect to api.groq.com'}`,
                    latencyMs: Date.now() - startTime,
                }, { status: 400 });
            }

            // 3. OpenRouter Connection Test
            else if (provider === 'openrouter') {
                const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
                const latencyMs = Date.now() - startTime;
                if (!res.ok) {
                    const err = await res.text();
                    return NextResponse.json({
                        success: false,
                        message: `OpenRouter verification failed (${res.status}): ${err.substring(0, 200)}`,
                        latencyMs,
                    }, { status: 400 });
                }
                return NextResponse.json({
                    success: true,
                    message: `OpenRouter connected successfully! Latency: ${latencyMs}ms`,
                    latencyMs,
                });
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
