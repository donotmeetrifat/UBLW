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
                hasGrokKey: Boolean(settings.grokKey && settings.grokKey.trim()),
                maskedGrokKey: maskKey(settings.grokKey),
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

        // Action: Connection Test
        if (action === 'test') {
            const provider = testProvider || 'gemini';
            const currentSettings = await getAiSettings();
            const keyToTest = (testKey && testKey.trim())
                ? testKey.trim()
                : (provider === 'gemini' ? currentSettings.geminiKey : provider === 'grok' ? currentSettings.grokKey : currentSettings.openRouterKey);

            if (!keyToTest) {
                return NextResponse.json({
                    success: false,
                    message: `No API key provided or saved for ${provider.toUpperCase()}`,
                }, { status: 400 });
            }

            const startTime = Date.now();

            if (provider === 'gemini') {
                const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToTest}`;
                const res = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: 'Respond with exactly the single word "VERIFIED".' }] }],
                    }),
                });
                const latencyMs = Date.now() - startTime;
                if (!res.ok) {
                    const err = await res.text();
                    return NextResponse.json({
                        success: false,
                        message: `Gemini verification failed (${res.status}): ${err.substring(0, 200)}`,
                        latencyMs,
                    }, { status: 400 });
                }
                return NextResponse.json({
                    success: true,
                    message: `Gemini connected successfully! Latency: ${latencyMs}ms`,
                    latencyMs,
                });
            } else if (provider === 'grok') {
                const res = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${keyToTest}`,
                    },
                    body: JSON.stringify({
                        model: 'grok-beta',
                        messages: [{ role: 'user', content: 'Respond with "VERIFIED"' }],
                        max_tokens: 10,
                    }),
                });
                const latencyMs = Date.now() - startTime;
                if (!res.ok) {
                    const err = await res.text();
                    return NextResponse.json({
                        success: false,
                        message: `Grok verification failed (${res.status}): ${err.substring(0, 200)}`,
                        latencyMs,
                    }, { status: 400 });
                }
                return NextResponse.json({
                    success: true,
                    message: `Grok connected successfully! Latency: ${latencyMs}ms`,
                    latencyMs,
                });
            } else if (provider === 'openrouter') {
                const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${keyToTest}`,
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
        // Only update keys if a non-masked value was submitted
        const updatePayload = {
            preferredProvider,
            customInstructions,
            botName,
            enabled,
        };

        if (geminiKey !== undefined && !geminiKey.includes('••••')) {
            updatePayload.geminiKey = geminiKey;
        }
        if (grokKey !== undefined && !grokKey.includes('••••')) {
            updatePayload.grokKey = grokKey;
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
