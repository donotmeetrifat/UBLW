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

        // Limit speech chunk to 500 characters to conserve quota and maintain low latency
        const speechText = clean.length > 500 ? clean.slice(0, 497) + '...' : clean;

        const voiceId = customVoiceId || settings.elevenLabsVoiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah

        const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`;
        const ttsRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
                'xi-api-key': settings.elevenLabsKey.trim(),
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
                text: speechText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.05,
                    use_speaker_boost: true,
                },
            }),
        });

        if (!ttsRes.ok) {
            const errData = await ttsRes.json().catch(() => ({}));
            const errMsg = errData?.detail?.message || `ElevenLabs TTS request failed (${ttsRes.status})`;
            const isQuota = ttsRes.status === 429 || (errMsg && errMsg.toLowerCase().includes('quota'));

            return NextResponse.json({
                success: false,
                code: isQuota ? 'QUOTA_EXCEEDED' : 'TTS_ERROR',
                message: errMsg,
            }, { status: ttsRes.status });
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
