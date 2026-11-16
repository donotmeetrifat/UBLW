'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/lib/features/cart/cartSlice';
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth';
import toast from 'react-hot-toast';
import { VoiceSession } from '@/components/ui/voice-session';

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
    const dispatch = useDispatch();
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
    const isExplicitAbortRef = useRef(false);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const recognitionRestartTimerRef = useRef(null);
    const pendingSpeechRef = useRef(null);
    const currentAudioRef = useRef(null);
    const voiceAbortControllerRef = useRef(null);
    const chatAbortControllerRef = useRef(null);
    const greetingTimerRef = useRef(null);
    const conversationHistoryRef = useRef([]);
    const lastRecommendedProductsRef = useRef([]);

    const handleUserQueryRef = useRef(null);
    const startSpeechRecognitionRef = useRef(null);

    // Instant shopping bag add handler
    const handleQuickAdd = useCallback((product) => {
        if (!product?.id) return;

        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add authentic UK products to your shopping bag.');
            return;
        }

        dispatch(addToCart({ productId: product.id, id: product.id, quantity: 1 }));
        toast.success(`Added ${product.name} to your bag!`);
        window.dispatchEvent(new Event('cart-bump'));
    }, [dispatch]);

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

    // Safe non-blocking speech recognition restart
    const scheduleRecognitionRestart = useCallback((delay = 120) => {
        if (!isCallActiveRef.current || isSpeakingRef.current || isMutedRef.current) return;
        if (recognitionRestartTimerRef.current) {
            clearTimeout(recognitionRestartTimerRef.current);
            recognitionRestartTimerRef.current = null;
        }
        recognitionRestartTimerRef.current = setTimeout(() => {
            if (isCallActiveRef.current && !isSpeakingRef.current && !isMutedRef.current) {
                if (startSpeechRecognitionRef.current) {
                    startSpeechRecognitionRef.current();
                }
            }
        }, delay);
    }, []);

    // Speech recognition loop with continuous listening & silence detection (VAD)
    const startSpeechRecognition = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (!isCallActiveRef.current || isMutedRef.current || isSpeakingRef.current) return;

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        // Clean up previous instance cleanly
        if (recognitionRef.current) {
            isExplicitAbortRef.current = true;
            try {
                recognitionRef.current.abort();
            } catch (e) {}
            recognitionRef.current = null;
        }

        try {
            isExplicitAbortRef.current = false;
            const recognition = new SpeechRec();
            recognition.continuous = true; // Continuous listening prevents premature closing
            recognition.interimResults = true; // Instant real-time transcript updates
            recognition.maxAlternatives = 1;
            recognition.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';

            recognition.onstart = () => {
                if (isCallActiveRef.current && !isSpeakingRef.current && !isMutedRef.current) {
                    setState('listening');
                }
            };

            recognition.onresult = (event) => {
                if (!isCallActiveRef.current || isSpeakingRef.current || isMutedRef.current) return;

                let interim = '';
                let finalized = '';

                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalized += result[0].transcript;
                    } else {
                        interim += result[0].transcript;
                    }
                }

                const currentText = (finalized || interim).trim();
                if (!currentText) return;

                // Live caption update so the customer immediately sees their voice transcribed
                setSegments(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'user' && last.live) {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, interim: currentText }
                        ];
                    }
                    return [
                        ...prev,
                        {
                            id: 'live-user-' + Date.now(),
                            role: 'user',
                            speaker: 'You',
                            text: '',
                            interim: currentText,
                            live: true,
                            channel: 'voice'
                        }
                    ];
                });

                // Clear previous silence detection timer
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                    silenceTimerRef.current = null;
                }

                // Keep track of the freshest speech detected
                pendingSpeechRef.current = {
                    text: currentText,
                    isFinal: Boolean(finalized.trim()),
                    timestamp: Date.now()
                };

                // Fast silence-detection debounce:
                // If finalized by browser, 280ms pause confirms end of thought.
                // If interim only (Chrome VAD has not finalized), submit after 750ms of silence.
                const debounceMs = finalized.trim() ? 280 : 750;

                silenceTimerRef.current = setTimeout(() => {
                    if (!isCallActiveRef.current || isSpeakingRef.current || isMutedRef.current) return;

                    const textToSubmit = pendingSpeechRef.current?.text?.trim();
                    if (textToSubmit) {
                        pendingSpeechRef.current = null;
                        if (handleUserQueryRef.current) {
                            handleUserQueryRef.current(textToSubmit, 'voice');
                        }
                    }
                }, debounceMs);
            };

            recognition.onerror = (event) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.warn('Speech recognition status:', event.error);
                }
                if (event.error !== 'not-allowed' && event.error !== 'aborted') {
                    scheduleRecognitionRestart(300);
                }
            };

            recognition.onend = () => {
                // If speech was pending when browser ended the turn, submit immediately so nothing is lost
                if (pendingSpeechRef.current?.text?.trim() && isCallActiveRef.current && !isSpeakingRef.current && !isMutedRef.current) {
                    const textToSubmit = pendingSpeechRef.current.text.trim();
                    pendingSpeechRef.current = null;
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }
                    if (handleUserQueryRef.current) {
                        handleUserQueryRef.current(textToSubmit, 'voice');
                    }
                    return;
                }

                // If not speaking, not muted, and not an intentional abort, safely restart listening
                if (isCallActiveRef.current && !isSpeakingRef.current && !isMutedRef.current && !isExplicitAbortRef.current) {
                    scheduleRecognitionRestart(120);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.warn('Could not initialize speech recognition:', err);
            scheduleRecognitionRestart(500);
        }
    }, [scheduleRecognitionRestart]);

    startSpeechRecognitionRef.current = startSpeechRecognition;

    // Fallback browser speech synthesis
    const fallbackBrowserSpeak = useCallback((text, onEndCallback) => {
        if (!isCallActiveRef.current) return;
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            onEndCallback?.();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.slice(0, 250));
            utterance.rate = 1.05;
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
    const speakEmmaResponse = useCallback(async (rawText, attachedProducts = undefined) => {
        if (!rawText || !rawText.trim() || !isCallActiveRef.current) return;

        const speechText = cleanTextForSpeech(rawText);
        const displayText = cleanTextForDisplay(rawText);

        // Stop active audio and pause speech recognition while Emma speaks
        stopActiveAudio();
        isExplicitAbortRef.current = true;
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        pendingSpeechRef.current = null;
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
        }

        isSpeakingRef.current = true;
        setState('speaking');

        // Add assistant response to transcript with attached product cards
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
                    channel: 'voice',
                    products: attachedProducts
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
            isExplicitAbortRef.current = false;
            if (!isCallActiveRef.current) return;

            if (isMutedRef.current) {
                setState('muted');
            } else {
                setState('listening');
                scheduleRecognitionRestart(120);
            }
        };

        try {
            const res = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
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
    }, [stopActiveAudio, fallbackBrowserSpeak, scheduleRecognitionRestart]);

    // Handle user query (voice transcript or typed input)
    const handleUserQuery = useCallback(async (queryText, channel = 'voice') => {
        if (!queryText || !queryText.trim() || !isCallActiveRef.current) return;

        // 1. Immediately cancel any pending silence timers & speech
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        pendingSpeechRef.current = null;

        // 2. Mark explicit abort so onend doesn't restart recognition while waiting for AI
        isExplicitAbortRef.current = true;
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
        }

        // 3. Immediately silence audio & set state to thinking
        stopActiveAudio();
        isSpeakingRef.current = false;
        setState('thinking');

        // 4. Add user segment to transcript
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
                    channel
                }
            ];
        });

        // 5. Update mutable conversation history to maintain context
        conversationHistoryRef.current.push({
            role: 'user',
            content: userMsg
        });

        // 6. Abort previous chat request if pending
        if (chatAbortControllerRef.current) {
            chatAbortControllerRef.current.abort();
        }
        const chatController = new AbortController();
        chatAbortControllerRef.current = chatController;

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: conversationHistoryRef.current.slice(-10),
                    isVoice: true, // Triggers ultra-fast, short, crisp voice consultation (<350ms)
                }),
                signal: chatController.signal
            });

            if (!isCallActiveRef.current) return;

            const data = await res.json();
            if (!isCallActiveRef.current) return;

            if (data.success && data.message) {
                // Record assistant message in history
                conversationHistoryRef.current.push({
                    role: 'assistant',
                    content: data.message
                });

                const returnedProducts = Array.isArray(data.products) && data.products.length > 0
                    ? data.products
                    : (data.addToCartProduct ? [data.addToCartProduct] : []);

                if (returnedProducts.length > 0) {
                    lastRecommendedProductsRef.current = returnedProducts;
                }

                // Auto-Add to Bag if customer requested it
                const isAddIntent = /(add.*(bag|cart)|put.*(bag|cart)|yes.*add|yeah.*add|buy.*this|order.*this|bag.*add|cart.*add|eta.*add)/i.test(userMsg);
                const prodToAdd = data.addToCartProduct || (isAddIntent && lastRecommendedProductsRef.current.length > 0 ? lastRecommendedProductsRef.current[0] : null);

                if (prodToAdd) {
                    handleQuickAdd(prodToAdd);
                }

                speakEmmaResponse(data.message, returnedProducts.length > 0 ? returnedProducts : (prodToAdd ? [prodToAdd] : undefined));
            } else {
                speakEmmaResponse("I'm sorry, I couldn't hear that clearly. Could you please repeat your question?");
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            if (!isCallActiveRef.current) return;
            console.error('AI chat query error:', err);
            speakEmmaResponse("We have 100% authentic UK skincare and haircare in stock with verified British batch codes. What product can I assist you with?");
        }
    }, [speakEmmaResponse, stopActiveAudio, handleQuickAdd]);

    handleUserQueryRef.current = handleUserQuery;

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
            isExplicitAbortRef.current = false;
            if (muted) {
                setState('muted');
            } else {
                setState('listening');
                scheduleRecognitionRestart(100);
            }
        }
    }, [state, muted, stopActiveAudio, scheduleRecognitionRestart]);

    // Handle mute change
    const handleMutedChange = useCallback((isNowMuted) => {
        setMuted(isNowMuted);
        isMutedRef.current = isNowMuted;

        if (isNowMuted) {
            isExplicitAbortRef.current = true;
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
            }
            pendingSpeechRef.current = null;
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) {}
            }
            if (state === 'listening') {
                setState('muted');
            }
        } else {
            isExplicitAbortRef.current = false;
            if (state === 'muted') {
                setState('listening');
                scheduleRecognitionRestart(100);
            }
        }
    }, [state, scheduleRecognitionRestart]);

    // End call handler (INSTANT KILL OF ALL AUDIO & PROCESSES)
    const handleEndCall = useCallback(() => {
        // Mark call permanently inactive synchronously
        isCallActiveRef.current = false;
        isExplicitAbortRef.current = true;

        // Clear all timers
        if (greetingTimerRef.current) {
            clearTimeout(greetingTimerRef.current);
            greetingTimerRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRestartTimerRef.current) {
            clearTimeout(recognitionRestartTimerRef.current);
            recognitionRestartTimerRef.current = null;
        }
        pendingSpeechRef.current = null;

        // Abort in-flight requests
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
        }, 350);
    }, [stopActiveAudio, onClose]);

    // Start / Restart call handler
    const handleStartCall = useCallback(() => {
        // Mark call active
        isCallActiveRef.current = true;
        isSpeakingRef.current = false;
        isExplicitAbortRef.current = false;

        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (recognitionRestartTimerRef.current) {
            clearTimeout(recognitionRestartTimerRef.current);
            recognitionRestartTimerRef.current = null;
        }
        pendingSpeechRef.current = null;

        stopActiveAudio();
        setState('connecting');
        setStartedAt(undefined);
        setEndedAt(undefined);
        setSegments([]);
        setErrorMessage(undefined);

        // Initialize persistent conversation history with greeting
        conversationHistoryRef.current = [
            { role: 'assistant', content: PROFESSIONAL_GREETING }
        ];

        // Warm up microphone permission proactively
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});
        }

        if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = setTimeout(() => {
            if (!isCallActiveRef.current) return;
            setStartedAt(new Date());
            speakEmmaResponse(PROFESSIONAL_GREETING);
        }, 800);

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
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-[modalBackdropFade_0.3s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleEndCall();
                }
            }}
        >
            {/* Generous, high-end, spacious card container with luxury pop entrance and ambient border radiance */}
            <div className="relative w-full max-w-2xl lg:max-w-3xl h-[820px] max-h-[92vh] rounded-3xl shadow-[0_25px_60px_-15px_rgba(108,48,110,0.22),0_0_0_1px_rgba(108,48,110,0.1)] overflow-hidden border border-[#6C306E]/20 dark:border-white/10 bg-white dark:bg-[#18181b] text-foreground flex flex-col animate-[modalLuxuryPop_0.36s_cubic-bezier(0.16,1,0.3,1)] transition-all duration-300">
                {/* Turnkey VoiceSession Component from shadcn / chatcn with integrated Close button */}
                <VoiceSession
                    state={state}
                    mode={mode}
                    onModeChange={setMode}
                    segments={segments}
                    onSendText={(text) => handleUserQuery(text, 'text')}
                    onQuickAdd={handleQuickAdd}
                    muted={muted}
                    onMutedChange={handleMutedChange}
                    captions={captions}
                    onCaptionsChange={setCaptions}
                    onStart={handleStartCall}
                    onEnd={handleEndCall}
                    onClose={handleEndCall}
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
