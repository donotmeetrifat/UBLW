'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { isClientSignedIn, requireSignIn, getAuthHeaders, getClientUser } from '@/lib/clientAuth'
import toast from 'react-hot-toast'
import AiProductCard from '@/components/AiProductCard'
import EmmaAvatar from '@/components/EmmaAvatar'
import AiSuggestionBar, { getContextualSuggestions } from '@/components/AiSuggestionBar'
import FormattedMessageText from '@/components/AiFormattedText'
import { LiquidMultimodalInput } from '@/components/ui/liquid-multimodal-input'
import { TrashIcon } from '@/components/icons'
import {
    DEFAULT_WELCOME_MESSAGE,
    getCachedAiMessages,
    saveCachedAiMessages,
    clearCachedAiMessages,
    dispatchAiChatSync,
    mergeAiMessages,
} from '@/lib/aiChatStore'

export default function BeautyAdvisorPage() {
    const dispatch = useDispatch();

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
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [isClearConfirming, setIsClearConfirming] = useState(false);

    const chatContainerRef = useRef(null);

    // Compute dynamic contextual suggestions from the last user message and message count
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const dynamicSuggestions = getContextualSuggestions(lastUserMessage?.content || '', messages.length);

    // Initialize session ID
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

    // Sync active user
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
            console.warn('Could not load history:', e.message);
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

    // Cross-Component Real-Time Synchronization Listener
    useEffect(() => {
        const handleAiSync = (e) => {
            const { messages: incoming, userId, source } = e.detail || {};
            if (source === 'page') return; // Ignore our own dispatches

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

    // Scroll to bottom purely inside the chat container (never scrolls window)
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Image Compression Helper (<800px)
    const compressFileToBase64 = (file) => {
        return new Promise((resolve) => {
            if (!file || !file.type.startsWith('image/')) {
                resolve(null);
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
                    resolve(canvas.toDataURL('image/jpeg', 0.82));
                };
                img.onerror = () => resolve(event.target.result);
                img.src = event.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    // Submit handler from LiquidMultimodalInput
    const handleLiquidSubmit = async (value, files) => {
        let photo = null;
        if (files && files.length > 0) {
            const imageFile = files.find(f => f.type.startsWith('image/'));
            if (imageFile) {
                photo = await compressFileToBase64(imageFile);
            }
        }
        handleSendMessage(value, photo);
    };

    // Send Message Handler with zero-latency optimistic dispatch & sync
    const handleSendMessage = async (textToSend = null, photoToSend = null, modelToUse = 'pro') => {
        const text = (textToSend !== null ? textToSend : '').trim();
        const photo = photoToSend !== null ? photoToSend : null;
        const model = modelToUse || 'pro';

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
        dispatchAiChatSync(updatedHistory, currentUser, 'page');

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
                    model: model,
                    history: messages.slice(-10),
                }),
            });

            const data = await res.json();
            if (data.success && data.message) {
                const assistantMsg = {
                    id: data.assistantMessageId || `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.message,
                    products: data.products || [],
                    createdAt: data.createdAt || new Date().toISOString(),
                };

                setMessages(prev => {
                    let next = prev;
                    if (data.userMessageId) {
                        next = next.map(m => (m.id === optimisticUserId ? { ...m, id: data.userMessageId } : m));
                    }
                    next = [...next, assistantMsg];
                    saveCachedAiMessages(currentUser, next);
                    dispatchAiChatSync(next, currentUser, 'page');
                    return next;
                });
            } else {
                throw new Error(data.message || 'Error occurred');
            }
        } catch (err) {
            console.error('Advisor error:', err);
            const fallbackMsg = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `Hello! Delighted to assist you at UK Brand Lover. Every skincare and cosmetic item in our boutique is 100% genuine and imported directly from the UK with verified batch codes.\n\nCould you share what skin concern or UK brand you are looking for today? I would be happy to recommend the best option for you.`,
                products: [],
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => {
                const next = [...prev, fallbackMsg];
                saveCachedAiMessages(currentUser, next);
                dispatchAiChatSync(next, currentUser, 'page');
                return next;
            });
        } finally {
            setIsSending(false);
        }
    };

    // Clear history
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
        dispatchAiChatSync(resetMessages, currentUser, 'page');
        setIsClearConfirming(false);
        toast.success('Consultation history cleared.');
    };

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

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-b from-[#FAF6FA]/60 via-white to-[#FAF6FA]/80 overflow-hidden font-sans select-none">
            {/* 1. Clean Top Header Bar (Full Browser Width) */}
            <header className="px-4 sm:px-8 py-3.5 bg-white/80 backdrop-blur-xl border-b border-[#EFE0EF]/80 flex items-center justify-between shrink-0 shadow-2xs z-10">
                <div className="flex items-center gap-3.5">
                    <div className="relative">
                        <EmmaAvatar size={42} />
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-base sm:text-lg text-[#241224] leading-tight tracking-tight">
                            Emma AI
                        </h1>
                    </div>
                </div>

                {/* Right: Clear Chat Control */}
                <div>
                    <button
                        type="button"
                        onClick={() => setIsClearConfirming(!isClearConfirming)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer"
                    >
                        <TrashIcon size={14} color="currentColor" />
                        <span className="hidden sm:inline">Clear Chat</span>
                    </button>
                </div>
            </header>

            {/* Smooth Delete Confirmation Dropdown */}
            <AnimatePresence>
                {isClearConfirming && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="overflow-hidden bg-rose-50/95 border-b border-rose-200/80 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs shrink-0 z-20"
                    >
                        <div className="flex items-center gap-2 text-rose-800 font-medium">
                            <TrashIcon size={14} color="#E11D48" />
                            <span>Are you sure you want to clear your consultation history?</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsClearConfirming(false)}
                                className="px-3 py-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-black/5 text-xs font-semibold transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClearChat}
                                className="px-3.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer"
                            >
                                Clear All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Full-Page Chat Message Stream (Centered Conversational Column) */}
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 no-scrollbar">
                <div className="max-w-2xl sm:max-w-3xl mx-auto w-full space-y-4">
                    {messages.map((m, idx) => {
                        const isUser = m.role === 'user';
                        const hasValidImage = m.image && m.image !== '[Photo Attachment]' && (m.image.startsWith('data:') || m.image.startsWith('http') || m.image.startsWith('/'));

                        return (
                            <motion.div
                                key={m.id || idx}
                                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {isUser ? (
                                    /* User Message: Right-aligned pill */
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] sm:max-w-[75%] space-y-2 flex flex-col items-end">
                                            {hasValidImage && (
                                                <div className="max-w-[240px] rounded-2xl overflow-hidden border border-[#EFE0EF] shadow-2xs">
                                                    <img
                                                        src={m.image}
                                                        alt="Uploaded photo"
                                                        className="w-full h-auto object-cover max-h-48 rounded-2xl"
                                                    />
                                                </div>
                                            )}
                                            <div className="bg-[#6C306E] text-white rounded-2xl rounded-tr-xs px-4 py-3 text-sm leading-relaxed shadow-xs font-medium select-text">
                                                <FormattedMessageText text={m.content} isUser={true} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Assistant Message: Emma Avatar on Left + Clean White Card */
                                    <div className="flex items-start gap-3">
                                        <EmmaAvatar size={34} className="mt-1 shadow-2xs" />
                                        <div className="max-w-[85%] sm:max-w-[80%] space-y-2.5">
                                            <div className="bg-white border border-[#EFE0EF]/90 shadow-[0_2px_12px_rgba(58,12,56,0.04)] rounded-2xl rounded-tl-xs p-4 sm:p-5 text-sm text-[#241224] leading-relaxed select-text font-normal">
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

                                            {/* Fallback product cards */}
                                            {Array.isArray(m.products) && m.products.length > 0 && (() => {
                                                const inlineIds = new Set(
                                                    (m.content?.match(/\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}/gi) || [])
                                                        .map(tag => tag.replace(/\[{1,2}PRODUCT:\s*/i, '').replace(/\]{1,2}/, '').trim())
                                                );
                                                const remaining = m.products.filter(p => !inlineIds.has(p.id));
                                                if (remaining.length === 0) return null;
                                                return (
                                                    <div className="space-y-2 mt-2">
                                                        {remaining.map(p => (
                                                            <AiProductCard
                                                                key={`fallback-${p.id}`}
                                                                product={p}
                                                                onQuickAdd={handleQuickAdd}
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
                                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-start gap-3"
                            >
                                <EmmaAvatar size={32} className="mt-1 shadow-2xs" />
                                <div className="bg-white border border-[#EFE0EF] rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center shadow-2xs">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce" />
                                        <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.2s]" />
                                        <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* 3. Bottom Prompt Capsule & Suggestions */}
            <footer className="shrink-0 bg-transparent px-3 sm:px-6 py-2 sm:py-3 z-10">
                <div className="max-w-2xl sm:max-w-3xl mx-auto w-full space-y-2">
                    {/* Suggestions Carousel: Left/Right Arrow Navigation */}
                    <AiSuggestionBar
                        suggestions={dynamicSuggestions}
                        onSelect={(query) => handleSendMessage(query, null)}
                        disabled={isSending}
                    />

                    {/* Liquid Multimodal Input */}
                    <div className="w-full flex justify-center">
                        <LiquidMultimodalInput
                            placeholder="Ask Emma AI anything, or drop product photos…"
                            onSubmit={handleLiquidSubmit}
                            disabled={isSending}
                            className="w-full max-w-none"
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
}
