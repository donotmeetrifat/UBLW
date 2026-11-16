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

// Crisp, polite, professional greeting
const PROFESSIONAL_GREETING = "Hello! I am Emma, your beauty consultant at UK Brand Lover. How may I assist you today?";

export default function AiVoiceCallModal({ isOpen, onClose }) {
    const [state, setState] = useState('connecting');
    const [mode, setMode] = useState('voice');
    const [segments, setSegments] = useState([]);
    const [muted, setMuted] = useState(false);
    const [captions, setCaptions] = useState(true);
    const [startedAt, setStartedAt] = useState(undefined);
    const [endedAt, setEndedAt] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState(undefined);

    // Synchronous state refs to prevent any React closure race conditions
    const isCallActiveRef = useRef(false);
    const isSpeakingRef = useRef(false);
    const isMutedRef = useRef(false);
    const recognitionRef = useRef(null);
    const currentAudioRef = useRef(null);
    const voiceAbortControllerRef = useRef(null);
    const chatAbortControllerRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const greetingTimerRef = useRef(null);
    const spokenBufferRef = useRef('');

    isMutedRef.current = muted;

    // Completely stop and silence all audio, synthesis, and in-flight network requests
    const stopActiveAudio = useCallback(() => {
        // Abort in-flight ElevenLabs fetch
        if (voiceAbortControllerRef.current) {
            try {
                voiceAbortControllerRef.current.abort();
            } catch (e) {}
            voiceAbortControllerRef.current = null;
        }

        // Pause and destroy any active HTML5 audio element
        if (currentAudioRef.current) {
            try {
                currentAudioRef.current.pause();
                currentAudioRef.current.currentTime = 0;
                currentAudioRef.current.src = '';
            } catch (e) {}
            currentAudioRef.current = null;
        }

        // Cancel any browser SpeechSynthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {}
        }

        isSpeakingRef.current = false;
    }, []);

    // Speech recognition loop
    const startSpeechRecognition = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (!isCallActiveRef.current || isMutedRef.current || isSpeakingRef.current) return;

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
                recognitionRef.current = null;
            }

            const recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                if (isCallActiveRef.current && !isSpeakingRef.current) {
                    setState('listening');
                }
            };

            recognition.onresult = (event) => {
                if (!isCallActiveRef.current || isSpeakingRef.current) return;

                let interim = '';
                let finalizedThisChunk = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalizedThisChunk += transcript;
                    } else {
                        interim += transcript;
                    }
                }

                if (finalizedThisChunk) {
                    spokenBufferRef.current = (spokenBufferRef.current + ' ' + finalizedThisChunk).trim();
                }

                const currentCombined = (spokenBufferRef.current + ' ' + interim).trim();

                // Live caption update
                if (currentCombined) {
                    setSegments(prev => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === 'user' && last.live) {
                            return [
                                ...prev.slice(0, -1),
                                { ...last, interim: currentCombined }
                            ];
                        }
                        return [
                            ...prev,
                            {
                                id: 'live-user-' + Date.now(),
                                role: 'user',
                                speaker: 'You',
                                text: '',
                                interim: currentCombined,
                                live: true,
                                at: Date.now(),
                                channel: 'voice'
                            }
                        ];
                    });
                }

                // Reset silence debouncer: 1.2s of silence after talking -> submit to AI
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    const toSubmit = (spokenBufferRef.current + ' ' + interim).trim();
                    if (toSubmit.length > 0 && isCallActiveRef.current && !isSpeakingRef.current) {
                        spokenBufferRef.current = '';
                        handleUserQuery(toSubmit, 'voice');
                    }
                }, 1200);
            };

            recognition.onerror = (event) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.warn('Speech recognition status:', event.error);
                }
            };

            recognition.onend = () => {
                // If call is still active, not speaking and not muted, keep listening
                if (isCallActiveRef.current && !isSpeakingRef.current && !isMutedRef.current) {
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

    // Fallback browser speech synthesis
    const fallbackBrowserSpeak = useCallback((text, onEndCallback) => {
        if (!isCallActiveRef.current) return;
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            onEndCallback?.();
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

            utterance.onend = () => {
                if (isCallActiveRef.current) onEndCallback?.();
            };
            utterance.onerror = () => {
                if (isCallActiveRef.current) onEndCallback?.();
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            onEndCallback?.();
        }
    }, []);

    // Speak Emma's response via ElevenLabs
    const speakEmmaResponse = useCallback(async (rawText) => {
        if (!rawText || !rawText.trim() || !isCallActiveRef.current) return;

        const speechText = cleanTextForSpeech(rawText);
        const displayText = cleanTextForDisplay(rawText);

        // Stop active audio and pause speech recognition while Emma speaks
        stopActiveAudio();
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        isSpeakingRef.current = true;
        setState('speaking');

        // Add assistant response to transcript
        const segmentId = 'emma-' + Date.now();
        setSegments(prev => {
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

        // Abort previous voice fetch
        if (voiceAbortControllerRef.current) {
            voiceAbortControllerRef.current.abort();
        }
        const voiceController = new AbortController();
        voiceAbortControllerRef.current = voiceController;

        const onPlaybackFinished = () => {
            isSpeakingRef.current = false;
            if (!isCallActiveRef.current) return;

            if (isMutedRef.current) {
                setState('muted');
            } else {
                setState('listening');
                startSpeechRecognition();
            }
        };

        try {
            const res = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: speechText }),
                signal: voiceController.signal,
            });

            if (!isCallActiveRef.current) return;

            if (res.ok) {
                const blob = await res.blob();
                if (!isCallActiveRef.current) return;

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
                    if (isCallActiveRef.current) {
                        fallbackBrowserSpeak(speechText, onPlaybackFinished);
                    }
                };

                if (!isCallActiveRef.current) {
                    audio.src = '';
                    return;
                }

                await audio.play();
            } else {
                fallbackBrowserSpeak(speechText, onPlaybackFinished);
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.warn('Voice API issue, falling back to browser speech:', err.message);
            if (isCallActiveRef.current) {
                fallbackBrowserSpeak(speechText, onPlaybackFinished);
            }
        }
    }, [startSpeechRecognition, stopActiveAudio, fallbackBrowserSpeak]);

    // Handle user query (voice transcript or typed input)
    const handleUserQuery = useCallback(async (queryText, channel = 'voice') => {
        if (!queryText || !queryText.trim() || !isCallActiveRef.current) return;

        // 1. Immediately silence audio & stop recognition
        stopActiveAudio();
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        spokenBufferRef.current = '';

        // 2. Set state to thinking
        isSpeakingRef.current = false;
        setState('thinking');

        // 3. Add user segment to transcript
        const userMsg = queryText.trim();
        setSegments(prev => {
            const cleaned = prev.filter(s => !s.live);
            return [
                ...cleaned,
                {
                    id: 'user-' + Date.now(),
                    role: 'user',
                    speaker: 'You',
                    text: userMsg,
                    at: Date.now(),
                    channel
                }
            ];
        });

        // 4. Abort previous chat request
        if (chatAbortControllerRef.current) {
            chatAbortControllerRef.current.abort();
        }
        const chatController = new AbortController();
        chatAbortControllerRef.current = chatController;

        try {
            // Build conversation history
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
                    message: userMsg,
                    history
                }),
                signal: chatController.signal
            });

            if (!isCallActiveRef.current) return;

            const data = await res.json();
            if (!isCallActiveRef.current) return;

            if (data.success && data.message) {
                speakEmmaResponse(data.message);
            } else {
                speakEmmaResponse("I'm sorry, I couldn't hear that clearly. Could you please repeat your question?");
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            if (!isCallActiveRef.current) return;
            console.error('AI chat query error:', err);
            speakEmmaResponse("We have 100% authentic UK skincare and haircare in stock with verified British batch codes. What product or skin concern can I assist you with?");
        }
    }, [segments, speakEmmaResponse, stopActiveAudio]);

    // Handle user interrupting Emma (tapping orb while she is speaking)
    const handleInterrupt = useCallback(() => {
        if (state === 'speaking') {
            stopActiveAudio();
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

            isSpeakingRef.current = false;
            if (muted) {
                setState('muted');
            } else {
                setState('listening');
                startSpeechRecognition();
            }
        }
    }, [state, muted, stopActiveAudio, startSpeechRecognition]);

    // Handle mute change
    const handleMutedChange = useCallback((isNowMuted) => {
        setMuted(isNowMuted);
        isMutedRef.current = isNowMuted;

        if (isNowMuted) {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) {}
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

    // End call handler (INSTANT KILL OF ALL AUDIO & PROCESSES)
    const handleEndCall = useCallback(() => {
        // Mark call permanently inactive synchronously
        isCallActiveRef.current = false;

        // Clear all timers
        if (greetingTimerRef.current) {
            clearTimeout(greetingTimerRef.current);
            greetingTimerRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }

        // Abort AI chat fetch
        if (chatAbortControllerRef.current) {
            try { chatAbortControllerRef.current.abort(); } catch (e) {}
            chatAbortControllerRef.current = null;
        }

        // Kill audio & speech synthesis
        stopActiveAudio();

        // Abort speech recognition
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
            recognitionRef.current = null;
        }

        setState('ended');
        setEndedAt(new Date());

        // Close modal smoothly
        setTimeout(() => {
            onClose();
        }, 400);
    }, [stopActiveAudio, onClose]);

    // Start / Restart call handler
    const handleStartCall = useCallback(() => {
        // Mark call active
        isCallActiveRef.current = true;
        isSpeakingRef.current = false;
        spokenBufferRef.current = '';

        stopActiveAudio();
        setState('connecting');
        setStartedAt(undefined);
        setEndedAt(undefined);
        setSegments([]);
        setErrorMessage(undefined);

        // Warm up microphone permission proactively
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
        }

        if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = setTimeout(() => {
            if (!isCallActiveRef.current) return;
            setStartedAt(new Date());
            speakEmmaResponse(PROFESSIONAL_GREETING);
        }, 1100);

        return () => {
            if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
        };
    }, [speakEmmaResponse, stopActiveAudio]);

    // Reset and initialize call when modal opens
    useEffect(() => {
        if (!isOpen) {
            isCallActiveRef.current = false;
            stopActiveAudio();
            return;
        }

        const cleanup = handleStartCall();
        return () => {
            cleanup?.();
            isCallActiveRef.current = false;
            stopActiveAudio();
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
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleEndCall();
                }
            }}
        >
            {/* Generous, high-end, spacious card container */}
            <div className="relative w-full max-w-2xl lg:max-w-3xl h-[820px] max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#18181b] text-foreground flex flex-col">
                {/* Subtle Dismiss Button */}
                <button
                    type="button"
                    onClick={handleEndCall}
                    aria-label="Close voice call"
                    className="absolute top-3.5 right-3.5 z-20 size-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white flex items-center justify-center transition cursor-pointer"
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
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
