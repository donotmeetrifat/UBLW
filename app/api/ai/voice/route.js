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
            (settings.elevenLabsKey2 && settings.elevenLabsKey2.trim())
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
            (settings.elevenLabsKey2 && settings.elevenLabsKey2.trim())
        );

        if (!hasAnyKey) {
            return NextResponse.json({
                success: false,
                code: 'ELEVENLABS_NOT_CONNECTED',
                message: 'ElevenLabs API key is not connected in the Admin Panel.',
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

        const requestedVoiceId = customVoiceId || settings.elevenLabsVoiceId || '8e81Dm4CldjBZSlArGoT'; // Default: Rimjhim

        // Detect if speech contains Bengali script or Banglish keywords
        const hasBengaliScript = /[\u0980-\u09FF]/.test(speechText);
        const hasBanglishWords = /\b(apnar|amader|kase|ache|koto|taka|dam|brono|daag|skin|chul|kori|bhalo|shukno|tel|khoshkhoshe|deben|pabo|parbo|ki|amake|karon|korbo|ekhon|aro|oita|eta|keno)\b/i.test(speechText);
        const isBengaliOrBanglish = hasBengaliScript || hasBanglishWords;

        // Model selection: Always prioritize eleven_multilingual_v2 for authentic, natural human articulation
        const candidateModels = isBengaliOrBanglish
            ? ['eleven_multilingual_v2', 'eleven_turbo_v2_5', 'eleven_flash_v2_5']
            : ['eleven_multilingual_v2', 'eleven_flash_v2_5', 'eleven_turbo_v2_5'];

        // Candidate voices in strict priority order:
        // 1. User's active selected voice from Admin Panel (e.g. Rimjhim `8e81Dm4CldjBZSlArGoT` or Swati S `nUarI71Lei0IFt1ybDm1`)
        // 2. High-fidelity premade ElevenLabs female voices (Sarah `EXAVITQu4vr4xnSDxMaL` -> Jessica `cgSgspJ2msm6clMCkdW9`)
        //    which are guaranteed to stream on both Free and Paid ElevenLabs accounts.
        //    This ensures Emma ALWAYS speaks with a real ElevenLabs AI voice and NEVER falls back to the robotic Google browser synthesizer!
        const candidateVoices = [requestedVoiceId];
        if (!candidateVoices.includes('EXAVITQu4vr4xnSDxMaL')) candidateVoices.push('EXAVITQu4vr4xnSDxMaL');
        if (!candidateVoices.includes('cgSgspJ2msm6clMCkdW9')) candidateVoices.push('cgSgspJ2msm6clMCkdW9');

        // ElevenLabs key fallback chain: Primary key -> Backup key (key2)
        const elevenLabsKeys = [
            settings.elevenLabsKey?.trim(),
            settings.elevenLabsKey2?.trim(),
        ].filter(Boolean);

        let ttsRes = null;
        let lastErrorMsg = '';
        let resolvedVoiceId = requestedVoiceId;

        voiceLoop: for (const curVoice of candidateVoices) {
            for (const apiKey of elevenLabsKeys) {
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
                            break voiceLoop;
                        }

                        const errData = await response.json().catch(() => ({}));
                        lastErrorMsg = errData?.detail?.message || `Voice ${curVoice} / Model ${modelId} failed (${response.status})`;
                        console.warn(`[ElevenLabs TTS] Voice ${curVoice}, Model ${modelId} returned ${response.status}:`, lastErrorMsg);

                        // If 402: Free users cannot use library voices via the API (paid_plan_required).
                        // Immediately break out to try the next voice in candidateVoices!
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
