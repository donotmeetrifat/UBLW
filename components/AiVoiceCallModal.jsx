'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CloseIcon, SparklesIcon, SendIcon } from '@/components/icons';
import FormattedMessageText from '@/components/AiFormattedText';

export default function AiVoiceCallModal({ isOpen, onClose }) {
    const [callStatus, setCallStatus] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
    const [callSeconds, setCallSeconds] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isEmmaSpeaking, setIsEmmaSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [activeSubtitles, setActiveSubtitles] = useState('Connecting to Emma...');
    const [subtitlesSpeaker, setSubtitlesSpeaker] = useState('system'); // 'emma' | 'user' | 'system'
    const [textInput, setTextInput] = useState('');
    const [conversationLog, setConversationLog] = useState([]);
    const [audioError, setAudioError] = useState(null);

    const recognitionRef = useRef(null);
    const currentAudioRef = useRef(null);
    const isSpeakingRef = useRef(false);
    const isMutedRef = useRef(false);

    isSpeakingRef.current = isEmmaSpeaking;
    isMutedRef.current = isMuted;

    // Reset when modal opens
    useEffect(() => {
        if (!isOpen) {
            handleEndCall();
            return;
        }

        setCallStatus('ringing');
        setCallSeconds(0);
        setIsMuted(false);
        setIsEmmaSpeaking(false);
        setInterimTranscript('');
        setConversationLog([]);
        setAudioError(null);
        setActiveSubtitles('Connecting call to Emma (AI Senior Beauty Advisor)...');
        setSubtitlesSpeaker('system');

        // Play connecting / ringing chime
        const ringTimer = setTimeout(() => {
            setCallStatus('connected');
            playEmmaGreeting();
        }, 1800);

        return () => {
            clearTimeout(ringTimer);
        };
    }, [isOpen]);

    // Timer counter when connected
    useEffect(() => {
        if (callStatus !== 'connected') return;

        const timer = setInterval(() => {
            setCallSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [callStatus]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Synthesize and play Emma voice via ElevenLabs
    const speakEmmaResponse = async (text) => {
        if (!text || !text.trim()) return;

        setIsEmmaSpeaking(true);
        setActiveSubtitles(text);
        setSubtitlesSpeaker('emma');
        setConversationLog(prev => [...prev, { role: 'assistant', content: text }]);

        try {
            // Stop existing audio if playing
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }

            const res = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                currentAudioRef.current = audio;

                audio.onended = () => {
                    setIsEmmaSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                    // Resume listening after speaking finishes
                    startSpeechRecognition();
                };

                audio.onerror = () => {
                    setIsEmmaSpeaking(false);
                    startSpeechRecognition();
                };

                await audio.play();
            } else {
                // If ElevenLabs key not set or quota reached, use fallback browser speech synthesis
                const errData = await res.json().catch(() => ({}));
                console.warn('Voice API fallback:', errData.message);
                fallbackBrowserSpeak(text);
            }
        } catch (err) {
            console.warn('Voice playback error, using fallback:', err.message);
            fallbackBrowserSpeak(text);
        }
    };

    // Fallback browser speech synthesis
    const fallbackBrowserSpeak = (text) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsEmmaSpeaking(false);
            startSpeechRecognition();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/\[\[PRODUCT:[^\]]+\]\]/gi, '').replace(/\*\*/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
            utterance.rate = 1.0;
            utterance.pitch = 1.05;

            // Pick female natural voice if available
            const voices = window.speechSynthesis.getVoices();
            const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Sonia') || v.name.includes('Samantha')) && v.lang.startsWith('en'));
            if (naturalVoice) utterance.voice = naturalVoice;

            utterance.onend = () => {
                setIsEmmaSpeaking(false);
                startSpeechRecognition();
            };
            utterance.onerror = () => {
                setIsEmmaSpeaking(false);
                startSpeechRecognition();
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            setIsEmmaSpeaking(false);
            startSpeechRecognition();
        }
    };

    // Initial call greeting
    const playEmmaGreeting = () => {
        const greeting = "Hello darling, welcome to UK Brand Lover! I'm Emma, your personal beauty advisor. How may I assist you with your authentic British skincare or haircare routine today?";
        speakEmmaResponse(greeting);
    };

    // Browser Speech Recognition for customer speech
    const startSpeechRecognition = () => {
        if (typeof window === 'undefined') return;
        if (isSpeakingRef.current || isMutedRef.current) return;

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        try {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }

            const recognition = new SpeechRec();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US'; // Also handles English & Banglish phonetics

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(r => r[0].transcript)
                    .join('');
                setInterimTranscript(transcript);

                if (event.results[0].isFinal) {
                    handleUserSpeechQuery(transcript);
                }
            };

            recognition.onerror = (event) => {
                setIsListening(false);
                if (event.error !== 'no-speech') {
                    console.warn('Speech recognition error:', event.error);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.warn('Could not start recognition:', err);
            setIsListening(false);
        }
    };

    // Handle user spoken query
    const handleUserSpeechQuery = async (queryText) => {
        if (!queryText || !queryText.trim()) return;

        setInterimTranscript('');
        setActiveSubtitles(queryText);
        setSubtitlesSpeaker('user');
        setConversationLog(prev => [...prev, { role: 'user', content: queryText }]);

        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        try {
            // Call our central AI backend with live product catalog grounding & strict rules
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: queryText,
                    history: conversationLog.slice(-6),
                }),
            });

            const data = await res.json();
            if (data.success && data.message) {
                speakEmmaResponse(data.message);
            } else {
                speakEmmaResponse("I'm sorry darling, I couldn't hear that clearly. Could you please repeat that?");
            }
        } catch (err) {
            console.error('AI chat query error:', err);
            speakEmmaResponse("We have full authentic UK skincare and haircare in stock with original receipt proof. Tell me about your skin type!");
        }
    };

    // Manual text submission during call
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!textInput.trim() || isEmmaSpeaking) return;
        const msg = textInput.trim();
        setTextInput('');
        handleUserSpeechQuery(msg);
    };

    // End call
    const handleEndCall = () => {
        setCallStatus('ended');
        setIsEmmaSpeaking(false);
        setIsListening(false);

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }

        setTimeout(() => {
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#2B142C] via-[#1E0D1F] to-[#120513] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col min-h-[540px] max-h-[92vh]">
                
                {/* 1. Header Strip */}
                <div className="p-4 px-5 flex items-center justify-between border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold tracking-wider uppercase text-purple-200">
                            {callStatus === 'ringing' ? 'Calling...' : `Live Call • ${formatTimer(callSeconds)}`}
                        </span>
                    </div>

                    <button
                        onClick={handleEndCall}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                        title="Close Call"
                    >
                        <CloseIcon size={16} color="currentColor" />
                    </button>
                </div>

                {/* 2. Main Call Stage: Avatar & Audio Equalizer Pulse */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    {/* Emma Avatar with Glowing Pulse Rings */}
                    <div className="relative">
                        {/* Animated Sound Wave Rings */}
                        {isEmmaSpeaking && (
                            <>
                                <span className="absolute -inset-3 rounded-full bg-[#E08CE4]/20 animate-ping" />
                                <span className="absolute -inset-6 rounded-full bg-[#6C306E]/30 animate-pulse" />
                            </>
                        )}
                        {isListening && !isEmmaSpeaking && (
                            <span className="absolute -inset-4 rounded-full bg-emerald-400/20 animate-pulse" />
                        )}

                        <div className="relative size-28 sm:size-32 rounded-full p-1 bg-gradient-to-tr from-[#E08CE4] to-[#6C306E] shadow-xl">
                            <div className="relative size-full rounded-full overflow-hidden bg-white/10">
                                <Image
                                    src="/brand-logo.png"
                                    alt="Emma - AI Beauty Consultant"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Floating Status Pill */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full bg-[#3B153D] border border-[#E08CE4]/40 text-[10px] font-bold tracking-wide text-purple-200 shadow-md">
                            {callStatus === 'ringing' 
                                ? 'Ringing...' 
                                : isEmmaSpeaking 
                                ? '🎙️ Emma is Speaking' 
                                : isListening 
                                ? '👂 Listening to you...' 
                                : 'Emma Ready'}
                        </div>
                    </div>

                    {/* Consultant Info */}
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                            <span>Emma</span>
                            <SparklesIcon size={14} color="#E08CE4" />
                        </h3>
                        <p className="text-xs text-purple-200/70 font-medium">
                            Senior AI Beauty Advisor • UK Brand Lover
                        </p>
                    </div>

                    {/* Animated Waveform Equalizer */}
                    <div className="flex items-center justify-center gap-1.5 h-8">
                        {[40, 70, 30, 90, 60, 100, 50, 80, 45, 65].map((h, i) => (
                            <span
                                key={i}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                    isEmmaSpeaking
                                        ? 'bg-[#E08CE4]'
                                        : isListening
                                        ? 'bg-emerald-400'
                                        : 'bg-white/20'
                                }`}
                                style={{
                                    height: isEmmaSpeaking 
                                        ? `${Math.max(12, (h * Math.sin((callSeconds * 4 + i))))}%` 
                                        : isListening 
                                        ? '35%' 
                                        : '15%',
                                }}
                            />
                        ))}
                    </div>

                    {/* Live Captions / Subtitles Box */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 min-h-[75px] max-h-[110px] overflow-y-auto text-left flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/60 mb-0.5">
                            {subtitlesSpeaker === 'emma' ? 'Emma' : subtitlesSpeaker === 'user' ? 'You' : 'Call Status'}
                        </span>
                        <div className="text-xs text-white/90 font-medium leading-relaxed">
                            {interimTranscript ? (
                                <span className="text-emerald-300 italic">"{interimTranscript}..."</span>
                            ) : (
                                <FormattedMessageText content={activeSubtitles} />
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Text Message Input (Fallback during call) */}
                <form onSubmit={handleManualSubmit} className="px-5 pb-3">
                    <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-[#E08CE4]">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={isEmmaSpeaking ? 'Emma is speaking...' : 'Or type your question here...'}
                            disabled={isEmmaSpeaking}
                            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!textInput.trim() || isEmmaSpeaking}
                            className="size-7 rounded-lg bg-[#6C306E] hover:bg-[#833885] disabled:opacity-30 text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <SendIcon size={12} color="white" />
                        </button>
                    </div>
                </form>

                {/* 4. Call Control Bar (Mic, Mute, End Call) */}
                <div className="p-4 px-6 bg-white/5 border-t border-white/10 flex items-center justify-around">
                    {/* Mute Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMuted(!isMuted);
                            if (!isMuted && recognitionRef.current) {
                                recognitionRef.current.abort();
                            }
                        }}
                        className={`size-12 rounded-full flex flex-col items-center justify-center transition cursor-pointer ${
                            isMuted 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-white/10 hover:bg-white/15 text-white'
                        }`}
                        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isMuted ? (
                                <>
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </>
                            ) : (
                                <>
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </>
                            )}
                        </svg>
                        <span className="text-[9px] mt-0.5">{isMuted ? 'Muted' : 'Mic'}</span>
                    </button>

                    {/* RED END CALL BUTTON */}
                    <button
                        type="button"
                        onClick={handleEndCall}
                        className="size-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-600/40 transition cursor-pointer"
                        title="End Call"
                    >
                        <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                            <line x1="22" y1="2" x2="2" y2="22" />
                        </svg>
                    </button>

                    {/* Push-to-Talk / Speak Button */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!isEmmaSpeaking) {
                                startSpeechRecognition();
                            }
                        }}
                        disabled={isEmmaSpeaking || isMuted}
                        className={`size-12 rounded-full flex flex-col items-center justify-center transition cursor-pointer ${
                            isListening
                                ? 'bg-emerald-500 text-white animate-pulse'
                                : 'bg-white/10 hover:bg-white/15 text-white disabled:opacity-30'
                        }`}
                        title="Tap to Speak"
                    >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                        <span className="text-[9px] mt-0.5">{isListening ? 'Talking' : 'Speak'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
