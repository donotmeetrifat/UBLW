'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSession } from '@/components/ui/voice-session';
import { CloseIcon } from '@/components/icons';

// Clean text for speech synthesis (strip markdown, product tags, and strictly eliminate any pet names)
function cleanTextForSpeech(rawText) {
    if (!rawText) return '';
    return rawText
        .replace(/\[\[PRODUCT:[^\]]+\]\]/gi, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/#+\s*/g, '')
        .replace(/\b(darling|honey|sweetheart|babe|sweetie)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Clean text for display in transcript
function cleanTextForDisplay(rawText) {
    if (!rawText) return '';
    return rawText
        .replace(/\[\[PRODUCT:[^\]]+\]\]/gi, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\b(darling|honey|sweetheart|babe|sweetie)\b/gi, '')
        .trim();
}

const PROFESSIONAL_GREETING = "Hello! Welcome to UK Brand Lover. I am Emma, your senior AI beauty advisor. How may I assist you with your authentic British skincare, haircare, or cosmetic choices today?";

export default function AiVoiceCallModal({ isOpen, onClose }) {
    const [state, setState] = useState('connecting');
    const [mode, setMode] = useState('voice');
    const [segments, setSegments] = useState([]);
    const [muted, setMuted] = useState(false);
    const [captions, setCaptions] = useState(true);
    const [startedAt, setStartedAt] = useState(undefined);
    const [endedAt, setEndedAt] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState(undefined);

    const recognitionRef = useRef(null);
    const currentAudioRef = useRef(null);
    const isSpeakingRef = useRef(false);
    const isMutedRef = useRef(false);
    const activeStateRef = useRef('connecting');

    isMutedRef.current = muted;
    activeStateRef.current = state;
    isSpeakingRef.current = state === 'speaking';

    // Stop all audio & recognition
    const stopAudioAndRecognition = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = '';
            currentAudioRef.current = null;
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // Ignore abort errors
            }
            recognitionRef.current = null;
        }
    }, []);

    // Speech recognition loop
    const startSpeechRecognition = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (isSpeakingRef.current || isMutedRef.current || activeStateRef.current === 'ended') return;

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        try {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }

            const recognition = new SpeechRec();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                if (activeStateRef.current !== 'speaking') {
                    setState('listening');
                }
            };

            recognition.onresult = (event) => {
                const results = event.results;
                if (!results || results.length === 0) return;

                let interim = '';
                let finalized = '';

                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    if (result.isFinal) {
                        finalized += result[0].transcript;
                    } else {
                        interim += result[0].transcript;
                    }
                }

                if (finalized) {
                    // Final user transcript
                    handleUserQuery(finalized.trim());
                } else if (interim) {
                    // Update live segment for interim speech
                    setSegments(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === 'user' && last.live) {
                            return [
                                ...prev.slice(0, -1),
                                { ...last, interim }
                            ];
                        }
                        return [
                            ...prev,
                            {
                                id: 'live-user-' + Date.now(),
                                role: 'user',
                                speaker: 'You',
                                text: '',
                                interim,
                                live: true,
                                at: Date.now(),
                                channel: 'voice'
                            }
                        ];
                    });
                }
            };

            recognition.onerror = (event) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.warn('Speech recognition warning:', event.error);
                }
            };

            recognition.onend = () => {
                // If not speaking and still connected and not muted, keep ready
                if (activeStateRef.current === 'listening' && !isMutedRef.current) {
                    // Auto-restart listening loop if still active
                    try {
                        recognition.start();
                    } catch (e) {}
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.warn('Could not initialize speech recognition:', err);
        }
    }, []);

    // Speak Emma's response via ElevenLabs (with graceful speech synthesis fallback)
    const speakEmmaResponse = useCallback(async (rawText) => {
        if (!rawText || !rawText.trim()) return;

        const speechText = cleanTextForSpeech(rawText);
        const displayText = cleanTextForDisplay(rawText);

        stopAudioAndRecognition();
        setState('speaking');

        // Add assistant segment to transcript
        const segmentId = 'emma-' + Date.now();
        setSegments(prev => {
            // Remove any pending live user segments
            const cleaned = prev.filter(s => !s.live);
            return [
                ...cleaned,
                {
                    id: segmentId,
                    role: 'assistant',
                    speaker: 'Emma',
                    text: displayText,
                    at: Date.now(),
                    channel: 'voice'
                }
            ];
        });

        const onPlaybackFinished = () => {
            if (activeStateRef.current === 'speaking') {
                if (isMutedRef.current) {
                    setState('muted');
                } else {
                    setState('listening');
                    startSpeechRecognition();
                }
            }
        };

        try {
            const res = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: speechText }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                currentAudioRef.current = audio;

                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudioRef.current = null;
                    onPlaybackFinished();
                };

                audio.onerror = () => {
                    URL.revokeObjectURL(audioUrl);
                    currentAudioRef.current = null;
                    fallbackBrowserSpeak(speechText, onPlaybackFinished);
                };

                await audio.play();
            } else {
                fallbackBrowserSpeak(speechText, onPlaybackFinished);
            }
        } catch (err) {
            console.warn('ElevenLabs API fetch issue, falling back to browser speech:', err);
            fallbackBrowserSpeak(speechText, onPlaybackFinished);
        }
    }, [startSpeechRecognition, stopAudioAndRecognition]);

    // Fallback browser speech synthesis
    const fallbackBrowserSpeak = (text, onEndCallback) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            onEndCallback();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.slice(0, 350));
            utterance.rate = 1.0;
            utterance.pitch = 1.05;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Sonia') || v.name.includes('Victoria')) &&
                v.lang.startsWith('en')
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = onEndCallback;
            utterance.onerror = onEndCallback;

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            onEndCallback();
        }
    };

    // Handle user query (voice transcript or typed input)
    const handleUserQuery = useCallback(async (queryText, channel = 'voice') => {
        if (!queryText || !queryText.trim()) return;

        stopAudioAndRecognition();
        setState('thinking');

        // Add confirmed user segment to transcript
        setSegments(prev => {
            const cleaned = prev.filter(s => !s.live);
            return [
                ...cleaned,
                {
                    id: 'user-' + Date.now(),
                    role: 'user',
                    speaker: 'You',
                    text: queryText,
                    at: Date.now(),
                    channel
                }
            ];
        });

        try {
            // Build conversation history for API grounding
            const history = segments
                .filter(s => !s.live && s.text)
                .slice(-6)
                .map(s => ({
                    role: s.role === 'assistant' ? 'assistant' : 'user',
                    content: s.text
                }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: queryText,
                    history
                })
            });

            const data = await res.json();
            if (data.success && data.message) {
                speakEmmaResponse(data.message);
            } else {
                speakEmmaResponse("I'm sorry, I couldn't hear that clearly. Could you please repeat your question?");
            }
        } catch (err) {
            console.error('AI chat query error:', err);
            speakEmmaResponse("We have 100% authentic UK skincare and haircare in stock with verified British batch codes. What product or skin concern can I assist you with?");
        }
    }, [segments, speakEmmaResponse, stopAudioAndRecognition]);

    // Handle user interrupting Emma (tapping orb while she is speaking)
    const handleInterrupt = useCallback(() => {
        if (state === 'speaking') {
            stopAudioAndRecognition();
            setSegments(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                    return [
                        ...prev.slice(0, -1),
                        { ...last, interrupted: true }
                    ];
                }
                return prev;
            });

            if (muted) {
                setState('muted');
            } else {
                setState('listening');
                startSpeechRecognition();
            }
        }
    }, [state, muted, stopAudioAndRecognition, startSpeechRecognition]);

    // Handle mute change
    const handleMutedChange = useCallback((isNowMuted) => {
        setMuted(isNowMuted);
        if (isNowMuted) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }
            if (state === 'listening') {
                setState('muted');
            }
        } else {
            if (state === 'muted') {
                setState('listening');
                startSpeechRecognition();
            }
        }
    }, [state, startSpeechRecognition]);

    // End call handler
    const handleEndCall = useCallback(() => {
        stopAudioAndRecognition();
        setState('ended');
        setEndedAt(new Date());

        // Auto close dialog smoothly after 600ms
        setTimeout(() => {
            onClose();
        }, 600);
    }, [stopAudioAndRecognition, onClose]);

    // Start / Restart call handler
    const handleStartCall = useCallback(() => {
        stopAudioAndRecognition();
        setState('connecting');
        setStartedAt(undefined);
        setEndedAt(undefined);
        setSegments([]);
        setErrorMessage(undefined);

        const timer = setTimeout(() => {
            setStartedAt(new Date());
            speakEmmaResponse(PROFESSIONAL_GREETING);
        }, 1200);

        return () => clearTimeout(timer);
    }, [speakEmmaResponse, stopAudioAndRecognition]);

    // Reset and initialize call when modal opens
    useEffect(() => {
        if (!isOpen) {
            stopAudioAndRecognition();
            return;
        }

        const cleanup = handleStartCall();
        return () => {
            cleanup?.();
            stopAudioAndRecognition();
        };
    }, [isOpen]);

    // Handle Escape key to close modal
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleEndCall();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleEndCall]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleEndCall();
                }
            }}
        >
            <div className="relative w-full max-w-[480px] h-[640px] max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden border border-white/10 bg-[#120513] text-white flex flex-col">
                {/* Floating Dismiss Button */}
                <button
                    type="button"
                    onClick={handleEndCall}
                    aria-label="Close voice call"
                    className="absolute top-3.5 right-3.5 z-20 size-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                    <CloseIcon size={16} color="currentColor" />
                </button>

                {/* Turnkey VoiceSession Component from shadcn / chatcn */}
                <VoiceSession
                    state={state}
                    mode={mode}
                    onModeChange={setMode}
                    segments={segments}
                    onSendText={(text) => handleUserQuery(text, 'text')}
                    muted={muted}
                    onMutedChange={handleMutedChange}
                    captions={captions}
                    onCaptionsChange={setCaptions}
                    onStart={handleStartCall}
                    onEnd={handleEndCall}
                    onInterrupt={handleInterrupt}
                    startedAt={startedAt}
                    endedAt={endedAt}
                    title="Emma • AI Beauty Advisor"
                    userLabel="You"
                    errorMessage={errorMessage}
                    placeholder="Ask Emma about authentic UK skincare, batch codes..."
                    className="h-full rounded-3xl"
                />
            </div>
        </div>
    );
}
