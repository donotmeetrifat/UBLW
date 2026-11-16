'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { isClientSignedIn, requireSignIn, getAuthHeaders, getClientUser } from '@/lib/clientAuth'
import toast from 'react-hot-toast'
import AiProductCard from '@/components/AiProductCard'
import EmmaAvatar from '@/components/EmmaAvatar'
import AiSuggestionBar, { getContextualSuggestions } from '@/components/AiSuggestionBar'
import FormattedMessageText from '@/components/AiFormattedText'
import AiVoiceCallModal from '@/components/AiVoiceCallModal'
import {
    DEFAULT_WELCOME_MESSAGE,
    getCachedAiMessages,
    saveCachedAiMessages,
    clearCachedAiMessages,
    dispatchAiChatSync,
    mergeAiMessages,
} from '@/lib/aiChatStore'
import { subscribeToStoreSync } from '@/lib/realtimeSync'
import {
    CloseIcon,
    CameraIcon,
    SendIcon,
    TrashIcon,
} from '@/components/icons'

export default function AiChatWidget() {
    const dispatch = useDispatch();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
    const [voiceCallEnabled, setVoiceCallEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('ukbl_voice_call_enabled') || sessionStorage.getItem('ukbl_voice_call_enabled');
            if (cached !== null) return cached === 'true';
        }
        return false;
    });
    const [currentUser, setCurrentUser] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ukbl_current_user');
                return saved ? JSON.parse(saved) : null;
            } catch {
                return null;
            }
        }
        return null;
    });

    // 0ms Instant Cache Load: Populates immediately from localStorage for both guests and authenticated customers
    const [messages, setMessages] = useState(() => getCachedAiMessages(currentUser));
    const [inputText, setInputText] = useState('');
    const [attachedImage, setAttachedImage] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [isClearConfirming, setIsClearConfirming] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Compute dynamic contextual suggestions from the last user message and message count
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const dynamicSuggestions = getContextualSuggestions(lastUserMessage?.content || '', messages.length);

    // Initialize session ID for guest tracking
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let sid = localStorage.getItem('ukbl_ai_session_id');
            if (!sid) {
                sid = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                localStorage.setItem('ukbl_ai_session_id', sid);
            }
            setSessionId(sid);
        }
    }, []);

    // Synchronize active user from auth storage
    useEffect(() => {
        const syncUser = () => {
            if (typeof window !== 'undefined') {
                const user = getClientUser();
                setCurrentUser(user);
            }
        };

        syncUser();
        window.addEventListener('auth-change', syncUser);
        window.addEventListener('storage', syncUser);
        return () => {
            window.removeEventListener('auth-change', syncUser);
            window.removeEventListener('storage', syncUser);
        };
    }, []);

    // Live synchronization of Storefront Voice Call availability
    useEffect(() => {
        let isMounted = true;
        const checkVoiceCallStatus = async () => {
            try {
                const res = await fetch('/api/ai/voice?_t=' + Date.now(), { cache: 'no-store' });
                const data = await res.json();
                if (isMounted) {
                    const isEnabled = Boolean(data.success && data.voiceCallEnabled);
                    setVoiceCallEnabled(isEnabled);
                    try {
                        localStorage.setItem('ukbl_voice_call_enabled', String(isEnabled));
                        sessionStorage.setItem('ukbl_voice_call_enabled', String(isEnabled));
                    } catch {}
                }
            } catch {
                if (isMounted) setVoiceCallEnabled(false);
            }
        };

        checkVoiceCallStatus();

        // 1. Supabase Realtime mesh listener
        const unsubscribe = subscribeToStoreSync((evt) => {
            const type = evt?.type;
            const data = evt?.data || evt;
            if (type === 'ai_settings' && data) {
                if (data.voiceCallEnabled !== undefined) {
                    const isEnabled = Boolean(data.voiceCallEnabled);
                    if (isMounted) setVoiceCallEnabled(isEnabled);
                    try {
                        localStorage.setItem('ukbl_voice_call_enabled', String(isEnabled));
                        sessionStorage.setItem('ukbl_voice_call_enabled', String(isEnabled));
                    } catch {}
                } else {
                    checkVoiceCallStatus();
                }
            }
        });

        // 2. Immediate local window custom event & storage event listener
        const handleSyncEvent = (e) => {
            const detail = e?.detail;
            const voiceVal = detail?.voiceCallEnabled !== undefined ? detail.voiceCallEnabled : detail?.data?.voiceCallEnabled;
            if (voiceVal !== undefined) {
                const isEnabled = Boolean(voiceVal);
                if (isMounted) setVoiceCallEnabled(isEnabled);
                try {
                    localStorage.setItem('ukbl_voice_call_enabled', String(isEnabled));
                    sessionStorage.setItem('ukbl_voice_call_enabled', String(isEnabled));
                } catch {}
            }
        };

        window.addEventListener('store-sync-event', handleSyncEvent);
        window.addEventListener('ai_settings-updated', handleSyncEvent);
        window.addEventListener('storage', handleSyncEvent);

        return () => {
            isMounted = false;
            if (typeof unsubscribe === 'function') unsubscribe();
            window.removeEventListener('store-sync-event', handleSyncEvent);
            window.removeEventListener('ai_settings-updated', handleSyncEvent);
            window.removeEventListener('storage', handleSyncEvent);
        };
    }, []);

    // Automatically close voice modal if disabled while open
    useEffect(() => {
        if (!voiceCallEnabled && isVoiceCallOpen) {
            setIsVoiceCallOpen(false);
        }
    }, [voiceCallEnabled, isVoiceCallOpen]);

    // Server history fetcher with smart non-destructive merge
    const fetchServerHistory = async (userToFetch = currentUser) => {
        if (!userToFetch || !userToFetch.id) return;

        // 1. Migrate guest messages to user account if any exist
        if (typeof window !== 'undefined') {
            const guestSaved = localStorage.getItem('ukbl_guest_ai_messages');
            if (guestSaved) {
                try {
                    const parsedGuest = JSON.parse(guestSaved);
                    if (Array.isArray(parsedGuest) && parsedGuest.length > 1) {
                        const toMigrate = parsedGuest.filter(m => !m.id?.includes('welcome'));
                        if (toMigrate.length > 0) {
                            localStorage.removeItem('ukbl_guest_ai_messages');
                            await fetch('/api/ai/history', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...getAuthHeaders(),
                                },
                                body: JSON.stringify({ guestMessages: toMigrate }),
                            });
                        }
                    } else {
                        localStorage.removeItem('ukbl_guest_ai_messages');
                    }
                } catch (e) {
                    console.warn('Guest migration note:', e.message);
                }
            }
        }

        // 2. Fetch authenticated customer's account messages from PostgreSQL
        try {
            const res = await fetch('/api/ai/history', {
                headers: {
                    ...getAuthHeaders(),
                },
            });
            const data = await res.json();

            if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
                setMessages(prev => {
                    const merged = mergeAiMessages(prev, data.messages);
                    saveCachedAiMessages(userToFetch, merged);
                    return merged;
                });
            }
        } catch (e) {
            console.warn('Failed to fetch user chat history:', e.message);
        }
    };

    // Load chat history whenever currentUser changes
    useEffect(() => {
        // Immediate local cache load for this user
        const cached = getCachedAiMessages(currentUser);
        setMessages(cached);

        if (currentUser && currentUser.id) {
            fetchServerHistory(currentUser);
        }
    }, [currentUser]);

    // When widget opens: refresh from local cache instantly & refresh from server
    useEffect(() => {
        if (isOpen) {
            const cached = getCachedAiMessages(currentUser);
            if (cached && cached.length > 0) {
                setMessages(prev => (cached.length >= prev.length ? cached : prev));
            }
            if (currentUser && currentUser.id) {
                fetchServerHistory(currentUser);
            }
        }
    }, [isOpen]);

    // Cross-Component Real-Time Synchronization Listener
    useEffect(() => {
        const handleAiSync = (e) => {
            const { messages: incoming, userId, source } = e.detail || {};
            if (source === 'widget') return; // Ignore our own dispatches

            const currentUserId = currentUser?.id || 'guest';
            if (userId === currentUserId && Array.isArray(incoming)) {
                setMessages(incoming);
            }
        };

        const handleStorageSync = (e) => {
            const currentUserId = currentUser?.id;
            const expectedKey = currentUserId ? `ukbl_user_ai_messages_${currentUserId}` : 'ukbl_guest_ai_messages';
            if (e.key === expectedKey && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (Array.isArray(parsed)) {
                        setMessages(parsed);
                    }
                } catch {}
            }
        };

        window.addEventListener('ukbl_ai_chat_sync', handleAiSync);
        window.addEventListener('storage', handleStorageSync);
        return () => {
            window.removeEventListener('ukbl_ai_chat_sync', handleAiSync);
            window.removeEventListener('storage', handleStorageSync);
        };
    }, [currentUser]);

    // Auto-scroll chat to bottom
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom('auto');
        }
    }, [isOpen, messages]);

    // Listen for custom trigger event (e.g. from navbar or product page)
    useEffect(() => {
        const handleOpenAi = (e) => {
            setIsOpen(true);
            if (e.detail?.prompt) {
                handleSendMessage(e.detail.prompt);
            }
        };
        window.addEventListener('open-ai-consultant', handleOpenAi);
        return () => window.removeEventListener('open-ai-consultant', handleOpenAi);
    }, []);

    // Image compression and selection handler
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (JPG, PNG, WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const maxDim = 800;
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/jpeg', 0.82);
                setAttachedImage(compressed);
                toast.success('Product photo attached!');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Quick Add to Bag
    const handleQuickAdd = (product) => {
        if (!product?.id) return;

        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to add authentic UK products to your shopping bag.');
            return;
        }

        dispatch(addToCart({ productId: product.id, id: product.id, quantity: 1 }));
        toast.success(`Added ${product.name} to your bag!`);
        window.dispatchEvent(new Event('cart-bump'));
    };

    // Send Message Handler with zero-latency optimistic dispatch & sync
    const handleSendMessage = async (textToSend = null, photoToSend = null) => {
        const text = (textToSend !== null ? textToSend : inputText).trim();
        const photo = photoToSend !== null ? photoToSend : attachedImage;

        if (!text && !photo) return;
        if (isSending) return;

        const optimisticUserId = `user-${Date.now()}`;
        const userMsg = {
            id: optimisticUserId,
            role: 'user',
            content: text || 'Please check this product for availability in our UK catalog.',
            image: photo || null,
            createdAt: new Date().toISOString(),
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        saveCachedAiMessages(currentUser, updatedHistory);
        dispatchAiChatSync(updatedHistory, currentUser, 'widget');

        setInputText('');
        setAttachedImage(null);
        setIsSending(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    message: text,
                    image: photo,
                    sessionId: sessionId,
                    history: messages.slice(-8),
                }),
            });

            const data = await res.json();

            if (data.success && data.message) {
                // Auto-Add to Bag if customer requested it via text or voice
                if (data.addToCartProduct) {
                    handleQuickAdd(data.addToCartProduct);
                }

                const assistantMsg = {
                    id: data.assistantMessageId || `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.message,
                    products: data.products || (data.addToCartProduct ? [data.addToCartProduct] : []),
                    createdAt: data.createdAt || new Date().toISOString(),
                };

                setMessages(prev => {
                    let next = prev;
                    if (data.userMessageId) {
                        next = next.map(m => (m.id === optimisticUserId ? { ...m, id: data.userMessageId } : m));
                    }
                    next = [...next, assistantMsg];
                    saveCachedAiMessages(currentUser, next);
                    dispatchAiChatSync(next, currentUser, 'widget');
                    return next;
                });
            } else {
                throw new Error(data.message || 'Error communicating with beauty advisor');
            }
        } catch (err) {
            console.error('Chat error (gracefully handled):', err);
            const fallbackMsg = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `Hello! Delighted to assist you at UK Brand Lover. Every skincare and cosmetic item in our boutique is 100% genuine and imported directly from the UK with verified batch codes.\n\nCould you share your skin type or what specific product you are looking for? I would be happy to recommend the best option for you.`,
                products: [],
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => {
                const next = [...prev, fallbackMsg];
                saveCachedAiMessages(currentUser, next);
                dispatchAiChatSync(next, currentUser, 'widget');
                return next;
            });
        } finally {
            setIsSending(false);
        }
    };

    // Clear Chat
    const handleClearChat = async () => {
        try {
            await fetch('/api/ai/history', {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders(),
                },
            });
        } catch {}

        clearCachedAiMessages(currentUser);
        const resetMessages = [DEFAULT_WELCOME_MESSAGE];
        setMessages(resetMessages);
        saveCachedAiMessages(currentUser, resetMessages);
        dispatchAiChatSync(resetMessages, currentUser, 'widget');
        setIsClearConfirming(false);
        toast.success('Chat history cleared.');
    };

    // Do not show floating widget on the full dedicated /beauty-advisor page
    if (pathname === '/beauty-advisor') {
        return null;
    }

    return (
        <>
            {/* 1. Floating Circular Avatar Launcher Button (Exact Mascot Style) */}
            <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none">
                <motion.div
                    role="button"
                    tabIndex={0}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }
                    }}
                    aria-label="Open Emma AI"
                    className="relative size-14 sm:size-15 rounded-full bg-white shadow-[0_10px_35px_rgba(108,48,110,0.28)] border-2 border-white ring-2 ring-[#6C306E]/20 flex items-center justify-center cursor-pointer transition-all duration-200"
                >
                    <EmmaAvatar size={54} />
                </motion.div>
            </div>

            {/* 2. Floating AI Chat Modal (Clean Frosted White-Blur Theme) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 25, scale: 0.92 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-20 right-2 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[410px] h-[590px] max-h-[85vh] rounded-[30px] bg-white/85 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 shadow-[0_24px_70px_-15px_rgba(58,12,56,0.2),0_0_0_1px_rgba(239,224,239,0.7)] flex flex-col overflow-hidden select-none font-sans"
                    >
                        {/* Top Header: Clean, open, white-theme */}
                        <div className="px-5 py-3.5 border-b border-[#EFE0EF]/70 flex items-center justify-between shrink-0 bg-white/40">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <EmmaAvatar size={38} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-[16px] text-[#241224] tracking-tight">
                                        Emma AI
                                    </h3>
                                </div>
                            </div>

                            {/* Header Actions: Call Button, Clear Chat & Minimal Close (X) */}
                            <div className="flex items-center gap-1.5">
                                {voiceCallEnabled && (
                                    <button
                                        type="button"
                                        onClick={() => setIsVoiceCallOpen(true)}
                                        title="Call Emma"
                                        className="p-1 px-2.5 rounded-full bg-[#FAF6FA] hover:bg-[#6C306E] text-[#6C306E] hover:text-white border border-[#EFE0EF] transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0 shadow-2xs"
                                    >
                                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span className="text-[11px]">Call</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsClearConfirming(true)}
                                    title="Clear conversation history"
                                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                >
                                    <TrashIcon size={15} color="currentColor" />
                                </button>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Close Emma AI"
                                    aria-label="Close"
                                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5 transition cursor-pointer"
                                >
                                    <CloseIcon size={18} color="currentColor" />
                                </button>
                            </div>
                        </div>

                        {/* Smooth Delete Confirmation Dropdown */}
                        <AnimatePresence>
                            {isClearConfirming && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="overflow-hidden bg-rose-50/95 border-b border-rose-200/80 px-4 py-2.5 flex items-center justify-between text-xs shrink-0 z-20"
                                >
                                    <div className="flex items-center gap-2 text-rose-800 font-medium text-[11.5px]">
                                        <TrashIcon size={13} color="#E11D48" />
                                        <span>Clear entire conversation?</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setIsClearConfirming(false)}
                                            className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-black/5 text-[11px] font-semibold transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClearChat}
                                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-2xs active:scale-95 transition cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
                            {messages.map((m, idx) => {
                                const isUser = m.role === 'user';
                                const hasValidImage = m.image && m.image !== '[Photo Attachment]' && (m.image.startsWith('data:') || m.image.startsWith('http') || m.image.startsWith('/'));

                                return (
                                    <motion.div
                                        key={m.id || idx}
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        {isUser ? (
                                            /* User Message: Right-aligned pill */
                                            <div className="flex justify-end">
                                                <div className="max-w-[85%] space-y-1.5 flex flex-col items-end">
                                                    {hasValidImage && (
                                                        <div className="max-w-[200px] rounded-2xl overflow-hidden border border-[#EFE0EF] shadow-2xs">
                                                            <img
                                                                src={m.image}
                                                                alt="Attached photo"
                                                                className="w-full h-auto object-cover max-h-40 rounded-2xl"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="bg-[#6C306E] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs font-medium select-text font-ai-editorial">
                                                        <FormattedMessageText text={m.content} isUser={true} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Assistant Message: Avatar on the left + Clean White Card */
                                            <div className="flex items-start gap-2.5">
                                                <EmmaAvatar size={30} className="mt-0.5 shadow-2xs" />
                                                <div className="max-w-[85%] space-y-2">
                                                    <div className="bg-white/95 border border-[#EFE0EF]/90 shadow-[0_2px_10px_rgba(58,12,56,0.04)] rounded-2xl rounded-tl-xs px-4 py-3 text-xs sm:text-[13px] text-[#241224] leading-relaxed select-text font-normal font-ai-editorial">
                                                        {(() => {
                                                            const products = Array.isArray(m.products) ? m.products : [];
                                                            const productMap = new Map();
                                                            products.forEach(p => productMap.set(p.id, p));

                                                            const hasTags = /\[{1,2}PRODUCT:\s*[a-zA-Z0-9_\-]+\]{1,2}/i.test(m.content);

                                                            if (!hasTags) {
                                                                return (
                                                                    <FormattedMessageText text={m.content} />
                                                                );
                                                            }

                                                            const parts = m.content.split(/(\[{1,2}PRODUCT:\s*[a-zA-Z0-9_\-]+\]{1,2})/gi);

                                                            return parts.map((part, pIdx) => {
                                                                const match = part.match(/^\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}$/i);
                                                                if (match) {
                                                                    const prodId = match[1];
                                                                    const matchedProd = productMap.get(prodId);
                                                                    if (matchedProd) {
                                                                        return (
                                                                            <AiProductCard
                                                                                key={`inline-${prodId}-${pIdx}`}
                                                                                product={matchedProd}
                                                                                onQuickAdd={handleQuickAdd}
                                                                                onCloseChat={() => setIsOpen(false)}
                                                                            />
                                                                        );
                                                                    }
                                                                    return null;
                                                                }

                                                                const trimmed = part.trim();
                                                                if (!trimmed) return null;

                                                                return (
                                                                    <div key={`txt-${pIdx}`}>
                                                                        <FormattedMessageText text={part} />
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>

                                                    {/* Fallback product cards if not inline */}
                                                    {Array.isArray(m.products) && m.products.length > 0 && (() => {
                                                        const inlineIds = new Set(
                                                            (m.content?.match(/\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}/gi) || [])
                                                                .map(tag => tag.replace(/\[{1,2}PRODUCT:\s*/i, '').replace(/\]{1,2}/, '').trim())
                                                        );
                                                        const remaining = m.products.filter(p => !inlineIds.has(p.id));
                                                        if (remaining.length === 0) return null;
                                                        return (
                                                            <div className="space-y-2 mt-1.5">
                                                                {remaining.map(p => (
                                                                    <AiProductCard
                                                                        key={`fallback-${p.id}`}
                                                                        product={p}
                                                                        onQuickAdd={handleQuickAdd}
                                                                        onCloseChat={() => setIsOpen(false)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}

                            {/* Typing Indicator: Emma Avatar + Clean 3 Dots Only */}
                            <AnimatePresence>
                                {isSending && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-start gap-2.5"
                                    >
                                        <EmmaAvatar size={28} className="mt-0.5 shadow-2xs" />
                                        <div className="bg-white/95 border border-[#EFE0EF] rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center shadow-2xs">
                                            <div className="flex gap-1.5 items-center">
                                                <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce" />
                                                <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.2s]" />
                                                <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions Bar: Text only, Left & Right Arrow Buttons */}
                        <div className="px-3.5 py-1.5 bg-white/40 border-t border-[#EFE0EF]/60 shrink-0">
                            <AiSuggestionBar
                                suggestions={dynamicSuggestions}
                                onSelect={(query) => handleSendMessage(query, null)}
                                disabled={isSending}
                            />
                        </div>

                        {/* Input Capsule: Pill shape with Camera + Input + Circular Send Button */}
                        <div className="p-3.5 pt-1.5 shrink-0 bg-white/50 backdrop-blur-md">
                            {/* Attached image preview banner */}
                            {attachedImage && (
                                <div className="flex items-center justify-between bg-white/95 border border-[#EFE0EF] rounded-2xl px-3 py-1.5 mb-2 shadow-2xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={attachedImage}
                                            alt="Preview"
                                            className="size-8 rounded-lg object-cover border border-[#EFE0EF]"
                                        />
                                        <span className="text-[11px] font-semibold text-[#6C306E] truncate">
                                            Product photo attached
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setAttachedImage(null)}
                                        className="p-1 rounded-full text-slate-400 hover:text-rose-500"
                                    >
                                        <CloseIcon size={12} color="currentColor" />
                                    </button>
                                </div>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="rounded-full bg-white/95 border border-[#EFE0EF] shadow-[0_2px_12px_rgba(58,12,56,0.06)] pl-3 pr-1.5 py-1.5 flex items-center gap-2 focus-within:border-[#6C306E] focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(108,48,110,0.12)] transition-all"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />

                                {/* Camera / Photo Upload Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Snap or upload product bottle photo"
                                    className="size-8 rounded-full text-slate-400 hover:text-[#6C306E] hover:bg-[#6C306E]/10 flex items-center justify-center transition cursor-pointer shrink-0"
                                >
                                    <CameraIcon size={17} color="currentColor" />
                                </button>

                                {/* Input Text Field */}
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask Emma AI anything..."
                                    disabled={isSending}
                                    className="flex-1 bg-transparent text-xs sm:text-[13px] text-[#241224] placeholder:text-slate-400 outline-none font-medium min-w-0"
                                />

                                {/* Circular Send Button */}
                                <button
                                    type="submit"
                                    disabled={isSending || (!inputText.trim() && !attachedImage)}
                                    className="size-8.5 rounded-full bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition active:scale-95 shadow-xs cursor-pointer"
                                >
                                    <SendIcon size={14} color="white" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* In-Browser AI Voice Call with Emma */}
            {voiceCallEnabled && (
                <AiVoiceCallModal
                    isOpen={isVoiceCallOpen}
                    onClose={() => setIsVoiceCallOpen(false)}
                />
            )}
        </>
    );
}
