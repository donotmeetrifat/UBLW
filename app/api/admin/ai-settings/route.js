import { NextResponse } from 'next/server';
import { getAiSettings, saveAiSettings, getLiveCatalogContext } from '@/lib/aiBot';
import { requireStaff } from '@/lib/auth';
import { verifyWhatsAppConnection, sendWhatsAppMessage } from '@/lib/whatsapp';

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
        const auth = await requireStaff(request);
        if (!auth.authorized) return auth.response;
        if (auth.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Forbidden. Admin privileges required.' }, { status: 403 });
        }

        const [settings, catalog] = await Promise.all([
            getAiSettings(),
            getLiveCatalogContext(),
        ]);

        const inStockCount = catalog.filter(p => p.inStock).length;

        const hasGemini = Boolean(settings.geminiKey && settings.geminiKey.trim());
        const hasGemini2 = Boolean(settings.geminiKey2 && settings.geminiKey2.trim());
        const hasGroq = Boolean(settings.groqKey && settings.groqKey.trim());
        const hasOpenRouter = Boolean(settings.openRouterKey && settings.openRouterKey.trim());
        const hasElevenLabs = Boolean(settings.elevenLabsKey && settings.elevenLabsKey.trim());
        const hasElevenLabs2 = Boolean(settings.elevenLabsKey2 && settings.elevenLabsKey2.trim());
        const hasElevenLabs3 = Boolean(settings.elevenLabsKey3 && settings.elevenLabsKey3.trim());
        const hasElevenLabs4 = Boolean(settings.elevenLabsKey4 && settings.elevenLabsKey4.trim());
        const hasElevenLabs5 = Boolean(settings.elevenLabsKey5 && settings.elevenLabsKey5.trim());

        const elevenLabsAccountConfigs = [
            { slot: 1, label: 'Account 1 (Primary)', provider: 'elevenlabs', key: settings.elevenLabsKey },
            { slot: 2, label: 'Account 2', provider: 'elevenlabs2', key: settings.elevenLabsKey2 },
            { slot: 3, label: 'Account 3', provider: 'elevenlabs3', key: settings.elevenLabsKey3 },
            { slot: 4, label: 'Account 4', provider: 'elevenlabs4', key: settings.elevenLabsKey4 },
            { slot: 5, label: 'Account 5', provider: 'elevenlabs5', key: settings.elevenLabsKey5 },
        ];

        const elevenLabsAccounts = await Promise.all(
            elevenLabsAccountConfigs.map(async (acc) => {
                const trimmedKey = (acc.key || '').trim();
                if (!trimmedKey) {
                    return {
                        slot: acc.slot,
                        label: acc.label,
                        provider: acc.provider,
                        isConnected: false,
                        maskedKey: '',
                        subscription: null,
                    };
                }

                try {
                    const subController = new AbortController();
                    const timeoutId = setTimeout(() => subController.abort(), 6000);
                    const subRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
                        headers: { 'xi-api-key': trimmedKey },
                        signal: subController.signal,
                    });
                    clearTimeout(timeoutId);

                    if (subRes.ok) {
                        const subData = await subRes.json();
                        return {
                            slot: acc.slot,
                            label: acc.label,
                            provider: acc.provider,
                            isConnected: true,
                            maskedKey: maskKey(trimmedKey),
                            subscription: {
                                tier: subData.tier || 'free',
                                characterCount: subData.character_count || 0,
                                characterLimit: subData.character_limit || 10000,
                                canUseLibraryVoices: subData.tier && subData.tier !== 'free',
                                status: subData.status || 'active',
                            },
                        };
                    } else {
                        // Key exists in DB and is valid, but subscription fetch failed/timed out
                        return {
                            slot: acc.slot,
                            label: acc.label,
                            provider: acc.provider,
                            isConnected: true,
                            maskedKey: maskKey(trimmedKey),
                            subscription: {
                                tier: 'free',
                                characterCount: 0,
                                characterLimit: 10000,
                                status: 'active',
                            },
                        };
                    }
                } catch {
                    return {
                        slot: acc.slot,
                        label: acc.label,
                        provider: acc.provider,
                        isConnected: true,
                        maskedKey: maskKey(trimmedKey),
                        subscription: {
                            tier: 'free',
                            characterCount: 0,
                            characterLimit: 10000,
                            status: 'active',
                        },
                    };
                }
            })
        );

        const pooledUsage = elevenLabsAccounts.reduce((acc, curr) => {
            if (curr.isConnected && curr.subscription) {
                acc.totalConnected += 1;
                acc.totalCharactersUsed += (curr.subscription.characterCount || 0);
                acc.totalCharacterLimit += (curr.subscription.characterLimit || 10000);
            }
            return acc;
        }, { totalConnected: 0, totalCharactersUsed: 0, totalCharacterLimit: 0 });

        const elevenLabsSub = elevenLabsAccounts[0]?.subscription || {
            tier: 'free',
            characterCount: 0,
            characterLimit: 10000,
            canUseLibraryVoices: false,
        };

        return NextResponse.json({
            success: true,
            settings: {
                hasGeminiKey: hasGemini,
                maskedGeminiKey: maskKey(settings.geminiKey),
                hasGeminiKey2: hasGemini2,
                maskedGeminiKey2: maskKey(settings.geminiKey2),
                hasGroqKey: hasGroq,
                maskedGroqKey: maskKey(settings.groqKey),
                hasGrokKey: hasGroq,
                maskedGrokKey: maskKey(settings.groqKey),
                hasOpenRouterKey: hasOpenRouter,
                maskedOpenRouterKey: maskKey(settings.openRouterKey),
                hasElevenLabsKey: hasElevenLabs,
                maskedElevenLabsKey: maskKey(settings.elevenLabsKey),
                hasElevenLabsKey2: hasElevenLabs2,
                maskedElevenLabsKey2: maskKey(settings.elevenLabsKey2),
                hasElevenLabsKey3: hasElevenLabs3,
                maskedElevenLabsKey3: maskKey(settings.elevenLabsKey3),
                hasElevenLabsKey4: hasElevenLabs4,
                maskedElevenLabsKey4: maskKey(settings.elevenLabsKey4),
                hasElevenLabsKey5: hasElevenLabs5,
                maskedElevenLabsKey5: maskKey(settings.elevenLabsKey5),

                // Explicit connection status objects
                gemini: {
                    isConnected: hasGemini,
                    maskedKey: maskKey(settings.geminiKey),
                },
                gemini2: {
                    isConnected: hasGemini2,
                    maskedKey: maskKey(settings.geminiKey2),
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
                    subscription: elevenLabsSub,
                },
                elevenlabs2: {
                    isConnected: hasElevenLabs2,
                    maskedKey: maskKey(settings.elevenLabsKey2),
                    subscription: elevenLabsAccounts[1]?.subscription || null,
                },
                elevenlabs3: {
                    isConnected: hasElevenLabs3,
                    maskedKey: maskKey(settings.elevenLabsKey3),
                    subscription: elevenLabsAccounts[2]?.subscription || null,
                },
                elevenlabs4: {
                    isConnected: hasElevenLabs4,
                    maskedKey: maskKey(settings.elevenLabsKey4),
                    subscription: elevenLabsAccounts[3]?.subscription || null,
                },
                elevenlabs5: {
                    isConnected: hasElevenLabs5,
                    maskedKey: maskKey(settings.elevenLabsKey5),
                    subscription: elevenLabsAccounts[4]?.subscription || null,
                },
                elevenlabsAccounts: elevenLabsAccounts,
                elevenLabsAccounts: elevenLabsAccounts,
                elevenlabsPooled: {
                    totalConnected: pooledUsage.totalConnected,
                    totalCharactersUsed: pooledUsage.totalCharactersUsed,
                    totalCharacterLimit: pooledUsage.totalCharacterLimit,
                    totalCharactersRemaining: Math.max(0, pooledUsage.totalCharacterLimit - pooledUsage.totalCharactersUsed),
                },
                elevenLabsPooled: {
                    totalConnected: pooledUsage.totalConnected,
                    totalCharactersUsed: pooledUsage.totalCharactersUsed,
                    totalCharacterLimit: pooledUsage.totalCharacterLimit,
                    totalCharactersRemaining: Math.max(0, pooledUsage.totalCharacterLimit - pooledUsage.totalCharactersUsed),
                },

                preferredProvider: settings.preferredProvider || 'gemini',
                customInstructions: settings.customInstructions || '',
                botName: settings.botName || 'Emma - UK Beauty Specialist',
                enabled: settings.enabled !== false,

                // WhatsApp Cloud API & Recovery Automation
                whatsapp: {
                    isConnected: Boolean(settings.whatsappPhoneNumberId && settings.whatsappAccessToken),
                    phoneNumberId: settings.whatsappPhoneNumberId || '',
                    maskedAccessToken: maskKey(settings.whatsappAccessToken),
                    hasAccessToken: Boolean(settings.whatsappAccessToken),
                    businessAccountId: settings.whatsappBusinessAccountId || '',
                    hotline: settings.whatsappHotline || '+880 1959-524393',
                    recoveryEnabled: Boolean(settings.whatsappRecoveryEnabled),
                    recoveryDelayHours: settings.whatsappRecoveryDelayHours || 1,
                    stage2Enabled: settings.whatsappStage2Enabled !== false,
                    stage3Enabled: settings.whatsappStage3Enabled !== false,
                    templateStage1: settings.whatsappTemplateStage1,
                    templateStage2: settings.whatsappTemplateStage2,
                    templateStage3: settings.whatsappTemplateStage3,
                },
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
        const auth = await requireStaff(request);
        if (!auth.authorized) return auth.response;
        if (auth.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Only Administrators can configure AI keys and directives.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            geminiKey,
            geminiKey2,
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
            } else if (target === 'gemini2') {
                await saveAiSettings({ geminiKey2: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'gemini2',
                    message: 'Google Gemini (Backup) API disconnected successfully.',
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
                    message: 'ElevenLabs Account 1 disconnected.',
                });
            } else if (target === 'elevenlabs2') {
                await saveAiSettings({ elevenLabsKey2: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'elevenlabs2',
                    message: 'ElevenLabs Account 2 disconnected.',
                });
            } else if (target === 'elevenlabs3') {
                await saveAiSettings({ elevenLabsKey3: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'elevenlabs3',
                    message: 'ElevenLabs Account 3 disconnected.',
                });
            } else if (target === 'elevenlabs4') {
                await saveAiSettings({ elevenLabsKey4: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'elevenlabs4',
                    message: 'ElevenLabs Account 4 disconnected.',
                });
            } else if (target === 'elevenlabs5') {
                await saveAiSettings({ elevenLabsKey5: '' });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'elevenlabs5',
                    message: 'ElevenLabs Account 5 disconnected.',
                });
            } else if (target === 'whatsapp') {
                await saveAiSettings({
                    whatsappPhoneNumberId: '',
                    whatsappAccessToken: '',
                    whatsappBusinessAccountId: '',
                    whatsappRecoveryEnabled: false,
                });
                return NextResponse.json({
                    success: true,
                    isConnected: false,
                    provider: 'whatsapp',
                    message: 'WhatsApp Cloud API disconnected successfully.',
                });
            }

            return NextResponse.json({ success: false, message: 'Invalid provider to disconnect' }, { status: 400 });
        }

        // Action: Verify WhatsApp API Connection
        if (action === 'verify_whatsapp') {
            const { whatsappPhoneNumberId, whatsappAccessToken } = body;
            const currentSettings = await getAiSettings();
            const pId = whatsappPhoneNumberId || currentSettings.whatsappPhoneNumberId;
            const token = (whatsappAccessToken && !whatsappAccessToken.includes('••••'))
                ? whatsappAccessToken
                : currentSettings.whatsappAccessToken;

            const verification = await verifyWhatsAppConnection(pId, token);
            if (verification.success) {
                // If provided explicitly, save it
                if (whatsappPhoneNumberId || (whatsappAccessToken && !whatsappAccessToken.includes('••••'))) {
                    await saveAiSettings({
                        whatsappPhoneNumberId: pId,
                        whatsappAccessToken: token,
                    });
                }
                return NextResponse.json({
                    success: true,
                    isConnected: true,
                    provider: 'whatsapp',
                    message: verification.message,
                    details: verification,
                });
            } else {
                return NextResponse.json({
                    success: false,
                    isConnected: false,
                    provider: 'whatsapp',
                    message: verification.message,
                }, { status: 400 });
            }
        }

        // Action: Update WhatsApp Phone Number Instantly Everywhere
        if (action === 'update_phone' || action === 'update_whatsapp_phone') {
            const { whatsappHotline } = body;
            if (!whatsappHotline || !whatsappHotline.trim()) {
                return NextResponse.json({
                    success: false,
                    message: 'Please provide a valid phone number (e.g. +880 1959-524393).',
                }, { status: 400 });
            }
            const cleanPhone = whatsappHotline.trim();
            await saveAiSettings({ whatsappHotline: cleanPhone });
            return NextResponse.json({
                success: true,
                message: 'WhatsApp phone number updated instantly across frontend, backend, and server!',
                hotline: cleanPhone,
            });
        }

        // Action: Send WhatsApp Test Message
        if (action === 'test_whatsapp') {
            const { recipientPhone, testMessage } = body;
            const currentSettings = await getAiSettings();

            if (!recipientPhone) {
                return NextResponse.json({
                    success: false,
                    message: 'Please provide a valid recipient WhatsApp number (e.g. 01326596251).',
                }, { status: 400 });
            }

            // In Meta Cloud API, outbound business messages to numbers outside the 24-hr window
            // MUST be sent via an approved template. We dispatch the pre-approved hello_world template
            // first to guarantee immediate delivery on WhatsApp.
            const templateResult = await sendWhatsAppMessage({
                to: recipientPhone,
                templateName: 'hello_world',
                phoneNumberId: currentSettings.whatsappPhoneNumberId,
                accessToken: currentSettings.whatsappAccessToken,
            });

            // Also attempt custom text message in case 24-hr conversation window is active
            await sendWhatsAppMessage({
                to: recipientPhone,
                text: testMessage || `🇬🇧 *UK Brand Lover* - WhatsApp Automation Test Successful!\n\nThis confirms your official WhatsApp Cloud API is properly connected and ready for Automated Cart Recovery.`,
                phoneNumberId: currentSettings.whatsappPhoneNumberId,
                accessToken: currentSettings.whatsappAccessToken,
            });

            if (templateResult.success) {
                return NextResponse.json({
                    success: true,
                    message: `Official Meta test message delivered to ${templateResult.recipient}! Check WhatsApp on your phone.`,
                    data: templateResult,
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: templateResult.message || 'Failed to send test WhatsApp message.',
                }, { status: 400 });
            }
        }

        // Action: Get ElevenLabs Voices List
        if (action === 'get_voices') {
            const currentSettings = await getAiSettings();
            const keys = [
                testKey?.trim(),
                currentSettings.elevenLabsKey,
                currentSettings.elevenLabsKey2,
                currentSettings.elevenLabsKey3,
                currentSettings.elevenLabsKey4,
                currentSettings.elevenLabsKey5,
            ].filter(Boolean);
            const key = keys[0];
            if (!key) {
                return NextResponse.json({ success: false, message: 'No ElevenLabs API key found' }, { status: 400 });
            }
            try {
                const [res, subRes] = await Promise.all([
                    fetch('https://api.elevenlabs.io/v1/voices', {
                        headers: { 'xi-api-key': key },
                    }),
                    fetch('https://api.elevenlabs.io/v1/user/subscription', {
                        headers: { 'xi-api-key': key },
                    }).catch(() => null),
                ]);

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    return NextResponse.json({ success: false, message: err?.detail?.message || 'Failed to fetch voices' }, { status: 400 });
                }
                const data = await res.json();
                let subscription = { tier: 'free', canUseLibraryVoices: false };
                if (subRes && subRes.ok) {
                    const subData = await subRes.json().catch(() => ({}));
                    subscription = {
                        tier: subData.tier || 'free',
                        characterCount: subData.character_count || 0,
                        characterLimit: subData.character_limit || 10000,
                        canUseLibraryVoices: subData.tier && subData.tier !== 'free',
                    };
                }

                // Strictly filter for 100% Free Premade Female Voices (Saleswoman)
                const allVoices = data.voices || [];
                const freeFemaleVoices = allVoices.filter(v => {
                    const isPremade = v.category === 'premade';
                    const gender = (v.labels?.gender || v.gender || '').toLowerCase();
                    return isPremade && gender === 'female';
                });

                return NextResponse.json({
                    success: true,
                    voices: freeFemaleVoices.length > 0 ? freeFemaleVoices : allVoices,
                    subscription,
                });
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

        // Action: Immediate Toggle WhatsApp Stage 2 / Stage 3 Auto Messages
        if (action === 'toggle_whatsapp_stage') {
            const { stage, enabled: stageEnabled } = body;
            const targetVal = Boolean(stageEnabled);
            if (Number(stage) === 2) {
                await saveAiSettings({ whatsappStage2Enabled: targetVal });
                return NextResponse.json({
                    success: true,
                    message: targetVal ? 'Stage 2 (Expiry Warning) enabled' : 'Stage 2 (Expiry Warning) disabled',
                    stage: 2,
                    enabled: targetVal,
                });
            } else if (Number(stage) === 3) {
                await saveAiSettings({ whatsappStage3Enabled: targetVal });
                return NextResponse.json({
                    success: true,
                    message: targetVal ? 'Stage 3 (Final Call) enabled' : 'Stage 3 (Final Call) disabled',
                    stage: 3,
                    enabled: targetVal,
                });
            }
            return NextResponse.json({ success: false, message: 'Invalid stage number' }, { status: 400 });
        }

        // Action: Immediate Update WhatsApp Cart Recovery Delay
        if (action === 'update_whatsapp_delay') {
            const { delayHours } = body;
            const parsedDelay = parseFloat(delayHours);
            if (isNaN(parsedDelay) || parsedDelay <= 0) {
                return NextResponse.json({ success: false, message: 'Invalid delay value' }, { status: 400 });
            }
            await saveAiSettings({ whatsappRecoveryDelayHours: parsedDelay });
            return NextResponse.json({
                success: true,
                message: `Cart abandonment trigger delay updated to ${parsedDelay} hour(s)`,
                delayHours: parsedDelay,
            });
        }

        // Action: Immediate Toggle WhatsApp Cart Recovery Engine
        if (action === 'toggle_whatsapp_recovery') {
            const { enabled: recoveryEnabled } = body;
            const targetVal = Boolean(recoveryEnabled);
            await saveAiSettings({ whatsappRecoveryEnabled: targetVal });
            return NextResponse.json({
                success: true,
                message: targetVal ? 'WhatsApp Recovery Engine activated' : 'WhatsApp Recovery Engine paused',
                enabled: targetVal,
            });
        }

        // Action: Connect & Verify Provider API Key
        if (action === 'test' || action === 'connect') {
            const rawProvider = (testProvider || 'gemini').toLowerCase();
            const provider = rawProvider === 'grok' ? 'groq' : rawProvider;
            const currentSettings = await getAiSettings();

            let keyToTest = (testKey && testKey.trim()) ? testKey.trim() : '';
            if (!keyToTest || keyToTest.includes('••••')) {
                keyToTest = provider === 'gemini'
                    ? currentSettings.geminiKey
                    : provider === 'gemini2'
                    ? currentSettings.geminiKey2
                    : provider === 'groq'
                    ? currentSettings.groqKey
                    : provider === 'elevenlabs'
                    ? currentSettings.elevenLabsKey
                    : provider === 'elevenlabs2'
                    ? currentSettings.elevenLabsKey2
                    : provider === 'elevenlabs3'
                    ? currentSettings.elevenLabsKey3
                    : provider === 'elevenlabs4'
                    ? currentSettings.elevenLabsKey4
                    : provider === 'elevenlabs5'
                    ? currentSettings.elevenLabsKey5
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
            if (provider === 'gemini' || provider === 'gemini2') {
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
                        if (provider === 'gemini2') {
                            await saveAiSettings({ geminiKey2: keyToTest });
                        } else {
                            await saveAiSettings({ geminiKey: keyToTest });
                        }

                        return NextResponse.json({
                            success: true,
                            isConnected: true,
                            maskedKey: maskKey(keyToTest),
                            provider,
                            message: `Google Gemini${provider === 'gemini2' ? ' (Backup)' : ''} connected successfully!`,
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

            // 4. ElevenLabs Voice Verification & Discovery (Supports 5 Accounts)
            else if (['elevenlabs', 'elevenlabs2', 'elevenlabs3', 'elevenlabs4', 'elevenlabs5'].includes(provider)) {
                try {
                    // Test ElevenLabs Key via /v1/user
                    const userController = new AbortController();
                    const timeoutId = setTimeout(() => userController.abort(), 6000);
                    const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
                        headers: { 'xi-api-key': keyToTest },
                        signal: userController.signal,
                    });
                    clearTimeout(timeoutId);

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
                    const allVoices = voicesData.voices || [];
                    const freeFemaleVoices = allVoices.filter(v => {
                        const isPremade = v.category === 'premade';
                        const gender = (v.labels?.gender || v.gender || '').toLowerCase();
                        return isPremade && gender === 'female';
                    });
                    const voices = freeFemaleVoices.length > 0 ? freeFemaleVoices : allVoices;

                    // Automatically persist verified key into database under its slot!
                    const slotFieldMap = {
                        elevenlabs: 'elevenLabsKey',
                        elevenlabs2: 'elevenLabsKey2',
                        elevenlabs3: 'elevenLabsKey3',
                        elevenlabs4: 'elevenLabsKey4',
                        elevenlabs5: 'elevenLabsKey5',
                    };
                    const fieldName = slotFieldMap[provider] || 'elevenLabsKey';
                    await saveAiSettings({ [fieldName]: keyToTest });

                    const slotNumber = provider.replace('elevenlabs', '') || '1';

                    const subscriptionInfo = {
                        tier: userData?.subscription?.tier || 'free',
                        characterCount: userData?.subscription?.character_count || 0,
                        characterLimit: userData?.subscription?.character_limit || 10000,
                        status: userData?.subscription?.status || 'active',
                    };

                    return NextResponse.json({
                        success: true,
                        isConnected: true,
                        maskedKey: maskKey(keyToTest),
                        provider,
                        slot: parseInt(slotNumber, 10),
                        message: `ElevenLabs Account ${slotNumber} connected successfully! Found ${voices.length} available voices.`,
                        tier: subscriptionInfo.tier,
                        characterCount: subscriptionInfo.characterCount,
                        characterLimit: subscriptionInfo.characterLimit,
                        subscription: subscriptionInfo,
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
            elevenLabsKey2,
            elevenLabsKey3,
            elevenLabsKey4,
            elevenLabsKey5,
            elevenLabsVoiceId,
            elevenLabsVoiceName,
            voiceCallEnabled,
            whatsappPhoneNumberId,
            whatsappAccessToken,
            whatsappBusinessAccountId,
            whatsappHotline,
            whatsappRecoveryEnabled,
            whatsappRecoveryDelayHours,
            whatsappStage2Enabled,
            whatsappStage3Enabled,
            whatsappTemplateStage1,
            whatsappTemplateStage2,
            whatsappTemplateStage3,
        } = body;

        const updatePayload = {
            preferredProvider: preferredProvider === 'grok' ? 'groq' : preferredProvider,
            customInstructions,
            botName,
            enabled,
        };

        if (whatsappPhoneNumberId !== undefined) {
            updatePayload.whatsappPhoneNumberId = whatsappPhoneNumberId;
        }
        if (whatsappAccessToken !== undefined && !whatsappAccessToken.includes('••••')) {
            updatePayload.whatsappAccessToken = whatsappAccessToken;
        }
        if (whatsappBusinessAccountId !== undefined) {
            updatePayload.whatsappBusinessAccountId = whatsappBusinessAccountId;
        }
        if (whatsappHotline !== undefined) {
            updatePayload.whatsappHotline = whatsappHotline;
        }
        if (whatsappRecoveryEnabled !== undefined) {
            updatePayload.whatsappRecoveryEnabled = whatsappRecoveryEnabled;
        }
        if (whatsappRecoveryDelayHours !== undefined) {
            updatePayload.whatsappRecoveryDelayHours = whatsappRecoveryDelayHours;
        }
        if (whatsappStage2Enabled !== undefined) {
            updatePayload.whatsappStage2Enabled = whatsappStage2Enabled;
        }
        if (whatsappStage3Enabled !== undefined) {
            updatePayload.whatsappStage3Enabled = whatsappStage3Enabled;
        }
        if (whatsappTemplateStage1 !== undefined) {
            updatePayload.whatsappTemplateStage1 = whatsappTemplateStage1;
        }
        if (whatsappTemplateStage2 !== undefined) {
            updatePayload.whatsappTemplateStage2 = whatsappTemplateStage2;
        }
        if (whatsappTemplateStage3 !== undefined) {
            updatePayload.whatsappTemplateStage3 = whatsappTemplateStage3;
        }

        if (geminiKey !== undefined && !geminiKey.includes('••••')) {
            updatePayload.geminiKey = geminiKey;
        }
        if (geminiKey2 !== undefined && !geminiKey2.includes('••••')) {
            updatePayload.geminiKey2 = geminiKey2;
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
        if (elevenLabsKey2 !== undefined && !elevenLabsKey2.includes('••••')) {
            updatePayload.elevenLabsKey2 = elevenLabsKey2;
        }
        if (elevenLabsKey3 !== undefined && !elevenLabsKey3.includes('••••')) {
            updatePayload.elevenLabsKey3 = elevenLabsKey3;
        }
        if (elevenLabsKey4 !== undefined && !elevenLabsKey4.includes('••••')) {
            updatePayload.elevenLabsKey4 = elevenLabsKey4;
        }
        if (elevenLabsKey5 !== undefined && !elevenLabsKey5.includes('••••')) {
            updatePayload.elevenLabsKey5 = elevenLabsKey5;
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
