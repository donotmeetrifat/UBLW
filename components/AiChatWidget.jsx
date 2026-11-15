'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import AiProductCard from '@/components/AiProductCard'
import EmmaAvatar from '@/components/EmmaAvatar'
import AiSuggestionBar, { getContextualSuggestions } from '@/components/AiSuggestionBar'
import {
    CloseIcon,
    CameraIcon,
    SendIcon,
    TrashIcon,
} from '@/components/icons'

const DEFAULT_WELCOME_MESSAGE = {
    id: 'welcome-0',
    role: 'assistant',
    content: `Hey darling, I'm Emma! Ask me about authentic UK skincare, check product availability, or snap a photo of any bottle to see if we have it in stock. 🇬🇧✨`,
    products: [],
    createdAt: new Date().toISOString(),
};

export default function AiChatWidget() {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [attachedImage, setAttachedImage] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [isClearConfirming, setIsClearConfirming] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Compute dynamic contextual suggestions from the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const dynamicSuggestions = getContextualSuggestions(lastUserMessage?.content || '');

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

    // Load active user and synchronize
    useEffect(() => {
        const syncUser = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('ukbl_current_user');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setCurrentUser(parsed);
                    } catch {
                        setCurrentUser(null);
                    }
                } else {
                    setCurrentUser(null);
                }
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

    // Load chat history (from DB for logged-in, or localStorage for guest)
    useEffect(() => {
        const loadHistory = async () => {
            if (currentUser) {
                if (typeof window !== 'undefined') {
                    const guestSaved = localStorage.getItem('ukbl_guest_ai_messages');
                    if (guestSaved) {
                        try {
                            const parsedGuest = JSON.parse(guestSaved);
                            if (Array.isArray(parsedGuest) && parsedGuest.length > 1) {
                                const toMigrate = parsedGuest.filter(m => m.id !== 'welcome-0');
                                if (toMigrate.length > 0) {
                                    await fetch('/api/ai/history', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ guestMessages: toMigrate }),
                                    });
                                    localStorage.removeItem('ukbl_guest_ai_messages');
                                }
                            }
                        } catch (e) {
                            console.warn('Guest migration note:', e.message);
                        }
                    }
                }

                try {
                    const res = await fetch('/api/ai/history');
                    const data = await res.json();
                    if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
                        setMessages([DEFAULT_WELCOME_MESSAGE, ...data.messages]);
                        return;
                    }
                } catch (e) {
                    console.warn('Failed to fetch user chat history:', e.message);
                }
            } else if (typeof window !== 'undefined') {
                const local = localStorage.getItem('ukbl_guest_ai_messages');
                if (local) {
                    try {
                        const parsed = JSON.parse(local);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setMessages(parsed);
                            return;
                        }
                    } catch {}
                }
            }
        };

        loadHistory();
    }, [currentUser]);

    // Save to localStorage for guests
    useEffect(() => {
        if (!currentUser && typeof window !== 'undefined' && messages.length > 0) {
            try {
                localStorage.setItem('ukbl_guest_ai_messages', JSON.stringify(messages));
            } catch {}
        }
    }, [messages, currentUser]);

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

    // Send Message Handler
    const handleSendMessage = async (textToSend = null, photoToSend = null) => {
        const text = (textToSend !== null ? textToSend : inputText).trim();
        const photo = photoToSend !== null ? photoToSend : attachedImage;

        if (!text && !photo) return;
        if (isSending) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text || 'Please check this product bottle for availability and recommendations.',
            image: photo || null,
            createdAt: new Date().toISOString(),
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInputText('');
        setAttachedImage(null);
        setIsSending(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    image: photo,
                    sessionId: sessionId,
                    history: messages.slice(-8),
                }),
            });

            const data = await res.json();

            if (data.success && data.message) {
                const assistantMsg = {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: data.message,
                    products: data.products || [],
                    createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                throw new Error(data.message || 'Error communicating with beauty advisor');
            }
        } catch (err) {
            console.error('Chat error (gracefully handled):', err);
            const fallbackMsg = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `Hello darling! Delighted to assist you at UK Brand Lover. Every skincare and cosmetic item in our boutique is 100% genuine and imported directly from London, UK with batch code verification.\n\nCould you share your skin type or what specific product you're looking for? I would love to curate the perfect routine for you! ✨`,
                products: [],
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setIsSending(false);
        }
    };

    // Clear Chat
    const handleClearChat = async () => {
        try {
            await fetch(`/api/ai/history?sessionId=${encodeURIComponent(sessionId)}`, {
                method: 'DELETE',
            });
        } catch {}

        if (typeof window !== 'undefined') {
            localStorage.removeItem('ukbl_guest_ai_messages');
        }

        setMessages([DEFAULT_WELCOME_MESSAGE]);
        setIsClearConfirming(false);
        toast.success('Chat history cleared.');
    };

    // Quick Add to Bag
    const handleQuickAdd = (product) => {
        dispatch(addToCart({ id: product.id }));
        toast.success(`Added ${product.name} to your bag!`);
        window.dispatchEvent(new Event('cart-bump'));
    };

    return (
        <>
            {/* 1. Floating Circular Avatar Launcher Button (Exact RIFAT Ai Style) */}
            <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none">
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open Emma AI"
                    className="relative size-14 sm:size-15 rounded-full bg-white shadow-[0_10px_35px_rgba(108,48,110,0.28)] border-2 border-white ring-2 ring-[#6C306E]/20 flex items-center justify-center cursor-pointer transition-all duration-200"
                >
                    <EmmaAvatar size={54} />
                    <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-black/5" />
                </motion.button>
            </div>

            {/* 2. Floating AI Chat Modal (Exact RIFAT Ai UI Design + Frosted White-Blur Theme) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 25, scale: 0.92 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-20 right-2 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[410px] h-[590px] max-h-[85vh] rounded-[30px] bg-white/85 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 shadow-[0_24px_70px_-15px_rgba(58,12,56,0.2),0_0_0_1px_rgba(239,224,239,0.7)] flex flex-col overflow-hidden select-none font-sans"
                    >
                        {/* Top Header: Clean, open, white-theme (RIFAT Ai Style) */}
                        <div className="px-5 pt-4 pb-2.5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <EmmaAvatar size={42} />
                                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[17px] text-[#241224] leading-tight tracking-tight">
                                        Emma AI
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                        <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                                        <span>Emma • online</span>
                                    </p>
                                </div>
                            </div>

                            {/* Header Actions: Clear Chat & Minimal Close (X) */}
                            <div className="flex items-center gap-1">
                                {isClearConfirming ? (
                                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-[10px]">
                                        <span className="text-rose-700 font-semibold">Clear?</span>
                                        <button
                                            onClick={handleClearChat}
                                            className="px-1.5 py-0.5 bg-rose-600 rounded text-white font-bold hover:bg-rose-700 transition"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setIsClearConfirming(false)}
                                            className="px-1 text-slate-500 hover:text-slate-700"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsClearConfirming(true)}
                                        title="Clear conversation history"
                                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/5 transition cursor-pointer"
                                    >
                                        <TrashIcon size={14} color="currentColor" />
                                    </button>
                                )}

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

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
                            {messages.map((m, idx) => {
                                const isUser = m.role === 'user';
                                return (
                                    <div key={m.id || idx}>
                                        {isUser ? (
                                            /* User Message: Right-aligned pill */
                                            <div className="flex justify-end">
                                                <div className="max-w-[85%] space-y-1.5 flex flex-col items-end">
                                                    {m.image && (
                                                        <div className="max-w-[200px] rounded-2xl overflow-hidden border border-[#EFE0EF] shadow-2xs">
                                                            <img
                                                                src={m.image}
                                                                alt="Attached photo"
                                                                className="w-full h-auto object-cover max-h-40 rounded-2xl"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="bg-[#6C306E] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs font-medium select-text">
                                                        {m.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Assistant Message: Avatar on the left + Clean White Card (RIFAT Ai Style) */
                                            <div className="flex items-start gap-2.5">
                                                <EmmaAvatar size={30} className="mt-0.5 shadow-2xs" />
                                                <div className="max-w-[85%] space-y-2">
                                                    <div className="bg-white/95 border border-[#EFE0EF]/90 shadow-[0_2px_10px_rgba(58,12,56,0.04)] rounded-2xl rounded-tl-xs px-4 py-3 text-xs sm:text-[13px] text-[#241224] leading-relaxed select-text font-normal">
                                                        {(() => {
                                                            const products = Array.isArray(m.products) ? m.products : [];
                                                            const productMap = new Map();
                                                            products.forEach(p => productMap.set(p.id, p));

                                                            const hasTags = /\[{1,2}PRODUCT:\s*[a-zA-Z0-9_\-]+\]{1,2}/i.test(m.content);

                                                            if (!hasTags) {
                                                                return (
                                                                    <div className="whitespace-pre-wrap leading-relaxed">
                                                                        {m.content}
                                                                    </div>
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
                                                                    <div key={`txt-${pIdx}`} className="whitespace-pre-wrap leading-relaxed">
                                                                        {part}
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
                                    </div>
                                );
                            })}

                            {/* Typing Indicator: Emma Avatar + Clean Bubble */}
                            {isSending && (
                                <div className="flex items-start gap-2.5">
                                    <EmmaAvatar size={30} className="mt-0.5" />
                                    <div className="bg-white/95 border border-[#EFE0EF] rounded-2xl rounded-tl-xs px-4 py-2.5 flex items-center gap-2 text-xs text-[#6C306E] font-medium shadow-2xs">
                                        <div className="flex gap-1 items-center">
                                            <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce" />
                                            <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.2s]" />
                                            <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                        <span className="text-[11.5px]">Emma is checking authentic UK stock...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions Bar: Text only, Left & Right Arrow Buttons (Exact RIFAT Ai Style) */}
                        <div className="px-3 py-1 shrink-0">
                            <AiSuggestionBar
                                suggestions={dynamicSuggestions}
                                onSelect={(query) => handleSendMessage(query, null)}
                                disabled={isSending}
                            />
                        </div>

                        {/* Input Capsule: Pill shape with Camera + Input + Circular Send Button (Exact RIFAT Ai Style) */}
                        <div className="p-3 pt-1 shrink-0">
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

                                {/* Circular Send Button (RIFAT Ai Style) */}
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
        </>
    );
}
