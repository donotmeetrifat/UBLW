import { NextResponse } from 'next/server';
import { getAiSettings } from '@/lib/aiBot';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function cleanTextForSpeech(raw) {
    if (!raw || typeof raw !== 'string') return '';

    return raw
        // Strip markdown image/links
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        // Strip product & coupon tags like [[PRODUCT:id]]
        .replace(/\[\[PRODUCT:[^\]]+\]\]/gi, '')
        .replace(/\[\[COUPON:[^\]]+\]\]/gi, '')
        // Strip bold & italics
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Strip code blocks & inline backticks
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        // Strip markdown headers & bullet characters
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[\*\-+]\s+/gm, '')
        // Replace multiple newlines/spaces with single space
        .replace(/\s+/g, ' ')
        .trim();
}

export async function GET() {
    try {
        const settings = await getAiSettings();
        const hasKey = Boolean(
            (settings.elevenLabsKey && settings.elevenLabsKey.trim()) ||
            (settings.elevenLabsKey2 && settings.elevenLabsKey2.trim()) ||
            (settings.elevenLabsKey3 && settings.elevenLabsKey3.trim()) ||
            (settings.elevenLabsKey4 && settings.elevenLabsKey4.trim()) ||
            (settings.elevenLabsKey5 && settings.elevenLabsKey5.trim())
        );
        const isEnabled = settings.voiceCallEnabled !== false && hasKey;

        return NextResponse.json({
            success: true,
            voiceCallEnabled: isEnabled,
            voiceId: settings.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL',
            voiceName: settings.elevenLabsVoiceName || 'Sarah (Soft & Warm)',
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch {
        return NextResponse.json({ success: false, voiceCallEnabled: false }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { text, voiceId: customVoiceId } = body;

        if (!text || !text.trim()) {
            return NextResponse.json(
                { success: false, message: 'Text is required for voice generation' },
                { status: 400 }
            );
        }

        const settings = await getAiSettings();

        if (settings.voiceCallEnabled === false) {
            return NextResponse.json({
                success: false,
                code: 'VOICE_CALL_DISABLED',
                message: 'Voice calls are currently disabled by the store.',
            }, { status: 403 });
        }

        const hasAnyKey = Boolean(
            (settings.elevenLabsKey && settings.elevenLabsKey.trim()) ||
            (settings.elevenLabsKey2 && settings.elevenLabsKey2.trim()) ||
            (settings.elevenLabsKey3 && settings.elevenLabsKey3.trim()) ||
            (settings.elevenLabsKey4 && settings.elevenLabsKey4.trim()) ||
            (settings.elevenLabsKey5 && settings.elevenLabsKey5.trim())
        );

        if (!hasAnyKey) {
            return NextResponse.json({
                success: false,
                code: 'ELEVENLABS_NOT_CONNECTED',
                message: 'No ElevenLabs API keys are connected in the Admin Panel.',
            }, { status: 400 });
        }

        const clean = cleanTextForSpeech(text);
        if (!clean) {
            return NextResponse.json(
                { success: false, message: 'No speakable text found after cleaning' },
                { status: 400 }
            );
        }

        // Limit speech chunk to 2 sentences or 260 characters to achieve instant real-time response (<150ms generation)
        const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
        let shortText = sentences.slice(0, 2).join(' ').trim();
        if (!shortText || shortText.length < 10) shortText = clean;
        const speechText = shortText.length > 260 ? shortText.slice(0, 257) + '...' : shortText;

        const requestedVoiceId = customVoiceId || settings.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah

        // Detect if speech contains Bengali script or Banglish keywords
        const hasBengaliScript = /[\u0980-\u09FF]/.test(speechText);
        const hasBanglishWords = /\b(apnar|amader|kase|ache|koto|taka|dam|brono|daag|skin|chul|kori|bhalo|shukno|tel|khoshkhoshe|deben|pabo|parbo|ki|amake|karon|korbo|ekhon|aro|oita|eta|keno)\b/i.test(speechText);
        const isBengaliOrBanglish = hasBengaliScript || hasBanglishWords;

        // Model selection: Always prioritize eleven_multilingual_v2 for authentic, natural human articulation
        const candidateModels = isBengaliOrBanglish
            ? ['eleven_multilingual_v2', 'eleven_turbo_v2_5', 'eleven_flash_v2_5']
            : ['eleven_multilingual_v2', 'eleven_flash_v2_5', 'eleven_turbo_v2_5'];

        // Candidate voices in strict priority order:
        // 1. User's active selected voice from Admin Panel
        // 2. High-fidelity premade ElevenLabs female voices (Sarah -> Jessica)
        const candidateVoices = [requestedVoiceId];
        if (!candidateVoices.includes('EXAVITQu4vr4xnSDxMaL')) candidateVoices.push('EXAVITQu4vr4xnSDxMaL');
        if (!candidateVoices.includes('cgSgspJ2msm6clMCkdW9')) candidateVoices.push('cgSgspJ2msm6clMCkdW9');

        // ElevenLabs key fallback chain: Account 1 -> Account 2 -> Account 3 -> Account 4 -> Account 5
        const elevenLabsKeys = [
            settings.elevenLabsKey?.trim(),
            settings.elevenLabsKey2?.trim(),
            settings.elevenLabsKey3?.trim(),
            settings.elevenLabsKey4?.trim(),
            settings.elevenLabsKey5?.trim(),
        ].filter(Boolean);

        let ttsRes = null;
        let lastErrorMsg = '';
        let resolvedVoiceId = requestedVoiceId;
        let successfulSlot = 1;

        voiceLoop: for (const curVoice of candidateVoices) {
            for (let kIdx = 0; kIdx < elevenLabsKeys.length; kIdx++) {
                const apiKey = elevenLabsKeys[kIdx];
                const slotNum = kIdx + 1;

                for (const modelId of candidateModels) {
                    try {
                        const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${curVoice}?optimize_streaming_latency=3`;
                        const response = await fetch(ttsUrl, {
                            method: 'POST',
                            headers: {
                                'xi-api-key': apiKey,
                                'Content-Type': 'application/json',
                                'Accept': 'audio/mpeg',
                            },
                            body: JSON.stringify({
                                text: speechText,
                                model_id: modelId,
                                voice_settings: {
                                    stability: 0.5,
                                    similarity_boost: 0.75,
                                    style: 0.0,
                                    use_speaker_boost: true,
                                },
                            }),
                        });

                        if (response.ok) {
                            ttsRes = response;
                            resolvedVoiceId = curVoice;
                            successfulSlot = slotNum;
                            break voiceLoop;
                        }

                        const errData = await response.json().catch(() => ({}));
                        const errMsg = errData?.detail?.message || `Voice ${curVoice} / Model ${modelId} failed (${response.status})`;
                        lastErrorMsg = errMsg;
                        const errMsgLower = (typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)).toLowerCase();

                        // Detect quota exhaustion or dead key:
                        const isAccountDepleted = response.status === 429 
                            || response.status === 401 
                            || errMsgLower.includes('quota')
                            || errMsgLower.includes('character limit')
                            || errMsgLower.includes('credits')
                            || errMsgLower.includes('unusual activity');

                        if (isAccountDepleted) {
                            console.warn(`[ElevenLabs Key Auto-Switch] Account slot ${slotNum} depleted or not working (${response.status}: ${errMsg}). Auto-switching to next API key...`);
                            // Break out of candidateModels loop to advance immediately to next apiKey!
                            break;
                        }

                        // If 402: Free users cannot use library voices via API.
                        // Break out to try next candidate voice (Sarah/Jessica).
                        if (response.status === 402 || response.status === 400 || response.status === 404) {
                            break;
                        }
                    } catch (netErr) {
                        lastErrorMsg = netErr.message;
                    }
                }
            }
        }

        if (!ttsRes || !ttsRes.ok) {
            const isQuota = ttsRes?.status === 429 || (lastErrorMsg && lastErrorMsg.toLowerCase().includes('quota'));

            return NextResponse.json({
                success: false,
                code: isQuota ? 'QUOTA_EXCEEDED' : 'TTS_ERROR',
                message: lastErrorMsg || 'ElevenLabs TTS synthesis failed',
            }, { status: ttsRes ? ttsRes.status : 500 });
        }

        const audioBuffer = await ttsRes.arrayBuffer();

        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-ElevenLabs-Voice': resolvedVoiceId,
                'X-ElevenLabs-Requested': requestedVoiceId,
                'X-ElevenLabs-Slot': successfulSlot.toString(),
            },
        });
    } catch (err) {
        console.error('Voice synthesis error:', err);
        return NextResponse.json(
            { success: false, message: 'Voice generation error', error: err.message },
            { status: 500 }
        );
    }
}
