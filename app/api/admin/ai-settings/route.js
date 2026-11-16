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
        const hasElevenLabs = Boolean(settings.elevenLabsKey && settings.elevenLabsKey.trim());

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
                hasElevenLabsKey: hasElevenLabs,
                maskedElevenLabsKey: maskKey(settings.elevenLabsKey),

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
                elevenlabs: {
                    isConnected: hasElevenLabs,
                    maskedKey: maskKey(settings.elevenLabsKey),
                    selectedVoiceId: settings.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL',
                    selectedVoiceName: settings.elevenLabsVoiceName || 'Sarah (Soft & Warm)',
                    voiceCallEnabled: settings.voiceCallEnabled !== false,
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
        const currentUser = getUserFromRequest(request);
        if (currentUser && currentUser.role === 'EMPLOYEE') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Only Administrators can configure AI keys and directives.' },
                { status: 403 }
            );
        }

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
            } else if (target === 'elevenlabs') {
                await saveAiSettings({ elevenLabsKey: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'elevenlabs',
                    message: 'ElevenLabs Voice API disconnected successfully.',
                });
            }

            return NextResponse.json({ success: false, message: 'Invalid provider to disconnect' }, { status: 400 });
        }

        // Action: Get ElevenLabs Voices List
        if (action === 'get_voices') {
            const currentSettings = await getAiSettings();
            const key = (testKey && testKey.trim()) ? testKey.trim() : currentSettings.elevenLabsKey;
            if (!key) {
                return NextResponse.json({ success: false, message: 'No ElevenLabs API key found' }, { status: 400 });
            }
            try {
                const res = await fetch('https://api.elevenlabs.io/v1/voices', {
                    headers: { 'xi-api-key': key },
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    return NextResponse.json({ success: false, message: err?.detail?.message || 'Failed to fetch voices' }, { status: 400 });
                }
                const data = await res.json();
                return NextResponse.json({ success: true, voices: data.voices || [] });
            } catch (err) {
                return NextResponse.json({ success: false, message: err.message }, { status: 500 });
            }
        }

        // Action: Save Selected ElevenLabs Voice
        if (action === 'save_voice') {
            const { elevenLabsVoiceId, elevenLabsVoiceName } = body;
            if (!elevenLabsVoiceId) {
                return NextResponse.json({ success: false, message: 'Voice ID is required' }, { status: 400 });
            }
            await saveAiSettings({
                elevenLabsVoiceId: elevenLabsVoiceId.trim(),
                elevenLabsVoiceName: elevenLabsVoiceName ? elevenLabsVoiceName.trim() : undefined,
            });
            return NextResponse.json({
                success: true,
                message: 'Voice updated successfully and live immediately across the website!',
                voiceId: elevenLabsVoiceId,
                voiceName: elevenLabsVoiceName,
            });
        }

        // Action: Immediate Toggle Storefront Voice Call Feature
        if (action === 'toggle_voice_call') {
            const { voiceCallEnabled } = body;
            const targetVal = Boolean(voiceCallEnabled);
            await saveAiSettings({ voiceCallEnabled: targetVal });
            return NextResponse.json({
                success: true,
                message: targetVal ? 'Storefront Voice Call enabled' : 'Storefront Voice Call disabled',
                voiceCallEnabled: targetVal,
            });
        }

        // Action: Connect & Verify Provider API Key
        if (action === 'test' || action === 'connect') {
            const rawProvider = (testProvider || 'gemini').toLowerCase();
            const provider = rawProvider === 'grok' ? 'groq' : rawProvider;
            const currentSettings = await getAiSettings();

            let keyToTest = (testKey && testKey.trim()) ? testKey.trim() : '';
            if (!keyToTest) {
                keyToTest = provider === 'gemini'
                    ? currentSettings.geminiKey
                    : provider === 'groq'
                    ? currentSettings.groqKey
                    : provider === 'elevenlabs'
                    ? currentSettings.elevenLabsKey
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
                        .map(m => m.name.replace(/^models\//, ''));

                    const priorityCandidates = [
                        'gemini-2.0-flash',
                        'gemini-1.5-flash',
                        'gemini-1.5-flash-latest',
                        'gemini-2.5-flash',
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
                            message: `Google Gemini connected successfully!`,
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
                            message: `Groq Cloud connected successfully!`,
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
                    // Step 1: Verify API key with OpenRouter's official auth endpoint
                    const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
                        headers: {
                            Authorization: `Bearer ${keyToTest}`,
                        },
                    });

                    if (!authRes.ok) {
                        const errData = await authRes.json().catch(() => ({}));
                        const errMsg = errData?.error?.message || `OpenRouter API key verification failed (${authRes.status}). Please check your key at openrouter.ai/keys.`;
                        return NextResponse.json({
                            success: false,
                            message: errMsg,
                            latencyMs: Date.now() - startTime,
                        }, { status: 400 });
                    }

                    const authData = await authRes.json().catch(() => ({}));
                    const keyData = authData?.data || {};

                    // Step 2: Validate inference capability with openrouter/free router and dynamic fallbacks
                    let chosenModel = 'openrouter/free';
                    const pingCandidates = [
                        'openrouter/free',
                        'google/gemma-4-26b-a4b-it:free',
                        'nvidia/nemotron-3.5-lightning:free',
                        'google/gemma-4-31b-it:free',
                        'openrouter/auto'
                    ];

                    for (const candidateModel of pingCandidates) {
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
                                    model: candidateModel,
                                    messages: [{ role: 'user', content: 'Respond with "VERIFIED"' }],
                                    max_tokens: 10,
                                }),
                            });

                            if (pingRes.ok) {
                                chosenModel = candidateModel;
                                break;
                            }
                        } catch {
                            // Continue trying candidates
                        }
                    }

                    const totalLatency = Date.now() - startTime;

                    // Automatically persist verified key into database!
                    await saveAiSettings({ openRouterKey: keyToTest });

                    return NextResponse.json({
                        success: true,
                        isConnected: true,
                        maskedKey: maskKey(keyToTest),
                        provider: 'openrouter',
                        message: `OpenRouter connected successfully!`,
                        model: chosenModel,
                        label: keyData.label || undefined,
                        usage: keyData.usage !== undefined ? keyData.usage : undefined,
                        latencyMs: totalLatency,
                    });
                } catch (netErr) {
                    return NextResponse.json({
                        success: false,
                        message: `OpenRouter network error: ${netErr.message}`,
                        latencyMs: Date.now() - startTime,
                    }, { status: 400 });
                }
            }

            // 4. ElevenLabs Voice Verification & Discovery
            else if (provider === 'elevenlabs') {
                try {
                    // Test ElevenLabs Key via /v1/user
                    const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
                        headers: { 'xi-api-key': keyToTest },
                    });

                    if (!userRes.ok) {
                        const errData = await userRes.json().catch(() => ({}));
                        const errMsg = errData?.detail?.message || `ElevenLabs key verification failed (${userRes.status}). Please check your key at elevenlabs.io.`;
                        return NextResponse.json({
                            success: false,
                            message: errMsg,
                            latencyMs: Date.now() - startTime,
                        }, { status: 400 });
                    }

                    const userData = await userRes.json();

                    // Fetch available voices
                    const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
                        headers: { 'xi-api-key': keyToTest },
                    });
                    const voicesData = voicesRes.ok ? await voicesRes.json() : { voices: [] };
                    const voices = voicesData.voices || [];

                    // Automatically persist verified key into database!
                    await saveAiSettings({ elevenLabsKey: keyToTest });

                    return NextResponse.json({
                        success: true,
                        isConnected: true,
                        maskedKey: maskKey(keyToTest),
                        provider: 'elevenlabs',
                        message: `ElevenLabs connected successfully! Found ${voices.length} available voices.`,
                        tier: userData?.subscription?.tier || 'free',
                        characterCount: userData?.subscription?.character_count || 0,
                        characterLimit: userData?.subscription?.character_limit || 10000,
                        voices,
                        latencyMs: Date.now() - startTime,
                    });
                } catch (netErr) {
                    return NextResponse.json({
                        success: false,
                        message: `ElevenLabs network error: ${netErr.message}`,
                        latencyMs: Date.now() - startTime,
                    }, { status: 400 });
                }
            }
        }

        // Action: Save All Settings
        const {
            elevenLabsKey,
            elevenLabsVoiceId,
            elevenLabsVoiceName,
            voiceCallEnabled,
        } = body;

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
        if (elevenLabsKey !== undefined && !elevenLabsKey.includes('••••')) {
            updatePayload.elevenLabsKey = elevenLabsKey;
        }
        if (elevenLabsVoiceId !== undefined) {
            updatePayload.elevenLabsVoiceId = elevenLabsVoiceId;
        }
        if (elevenLabsVoiceName !== undefined) {
            updatePayload.elevenLabsVoiceName = elevenLabsVoiceName;
        }
        if (voiceCallEnabled !== undefined) {
            updatePayload.voiceCallEnabled = voiceCallEnabled;
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
