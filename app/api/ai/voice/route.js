import { NextResponse } from 'next/server';
import { getAiSettings } from '@/lib/aiBot';

export const dynamic = 'force-dynamic';

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

        if (!settings.elevenLabsKey || !settings.elevenLabsKey.trim()) {
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

        const voiceId = customVoiceId || settings.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah

        // Ultra-low-latency model progression: eleven_flash_v2_5 (~75ms) -> eleven_turbo_v2_5 -> eleven_multilingual_v2
        const candidateModels = ['eleven_flash_v2_5', 'eleven_turbo_v2_5', 'eleven_multilingual_v2'];
        let ttsRes = null;
        let lastErrorMsg = '';

        for (const modelId of candidateModels) {
            try {
                const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=4`;
                const response = await fetch(ttsUrl, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': settings.elevenLabsKey.trim(),
                        'Content-Type': 'application/json',
                        'Accept': 'audio/mpeg',
                    },
                    body: JSON.stringify({
                        text: speechText,
                        model_id: modelId,
                        voice_settings: {
                            stability: 0.45,
                            similarity_boost: 0.75,
                            style: 0.0,
                            use_speaker_boost: false,
                        },
                    }),
                });

                if (response.ok) {
                    ttsRes = response;
                    break;
                }

                const errData = await response.json().catch(() => ({}));
                lastErrorMsg = errData?.detail?.message || `Model ${modelId} failed (${response.status})`;
                // If quota exceeded or 401 unauthorized, no need to retry other models
                if (response.status === 401 || response.status === 429) {
                    ttsRes = response;
                    break;
                }
            } catch (netErr) {
                lastErrorMsg = netErr.message;
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
