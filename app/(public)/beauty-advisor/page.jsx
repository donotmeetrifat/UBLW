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
    CameraIcon,
    SendIcon,
    TrashIcon,
    CloseIcon,
} from '@/components/icons'

const DEFAULT_WELCOME = {
    id: 'full-welcome',
    role: 'assistant',
    content: `Hello! I am Emma, your beauty consultant at UK Brand Lover. How can I assist you today? You can ask about product availability, skincare routines, or upload a photo of any product bottle to check our stock.`,
    products: [],
    createdAt: new Date().toISOString(),
};

export default function BeautyAdvisorPage() {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([DEFAULT_WELCOME]);
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
                const saved = localStorage.getItem('ukbl_current_user');
                if (saved) {
                    try {
                        setCurrentUser(JSON.parse(saved));
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

    // Load messages from DB or localStorage
    useEffect(() => {
        const loadMessages = async () => {
            if (currentUser) {
                try {
                    const res = await fetch('/api/ai/history');
                    const data = await res.json();
                    if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
                        setMessages([DEFAULT_WELCOME, ...data.messages]);
                        return;
                    }
                } catch (e) {
                    console.warn('Could not load history:', e.message);
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
        loadMessages();
    }, [currentUser]);

    // Save for guests
    useEffect(() => {
        if (!currentUser && typeof window !== 'undefined' && messages.length > 0) {
            try {
                localStorage.setItem('ukbl_guest_ai_messages', JSON.stringify(messages));
            } catch {}
        }
    }, [messages, currentUser]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Image Upload & Canvas Compression (<800px)
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
                toast.success('Product photo loaded!');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Send Message
    const handleSendMessage = async (textToSend = null, photoToSend = null) => {
        const text = (textToSend !== null ? textToSend : inputText).trim();
        const photo = photoToSend !== null ? photoToSend : attachedImage;

        if (!text && !photo) return;
        if (isSending) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text || 'Please check this product for availability in our UK catalog.',
            image: photo || null,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
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
                    history: messages.slice(-10),
                }),
            });

            const data = await res.json();
            if (data.success && data.message) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: `assistant-${Date.now()}`,
                        role: 'assistant',
                        content: data.message,
                        products: data.products || [],
                        createdAt: new Date().toISOString(),
                    },
                ]);
            } else {
                throw new Error(data.message || 'Error occurred');
            }
        } catch (err) {
            console.error('Advisor error:', err);
            setMessages(prev => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: `Hello! Delighted to assist you at UK Brand Lover. Every skincare and cosmetic item in our boutique is 100% genuine and imported directly from the UK with verified batch codes.\n\nCould you share what skin concern or UK brand you are looking for today? I would be happy to recommend the best option for you.`,
                    products: [],
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    // Clear history
    const handleClearChat = async () => {
        try {
            await fetch(`/api/ai/history?sessionId=${encodeURIComponent(sessionId)}`, {
                method: 'DELETE',
            });
        } catch {}

        if (typeof window !== 'undefined') {
            localStorage.removeItem('ukbl_guest_ai_messages');
        }

        setMessages([DEFAULT_WELCOME]);
        setIsClearConfirming(false);
        toast.success('Consultation history cleared.');
    };

    const handleQuickAdd = (product) => {
        dispatch(addToCart({ id: product.id }));
        toast.success(`Added ${product.name} to your bag!`);
        window.dispatchEvent(new Event('cart-bump'));
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-gradient-to-b from-[#FAF6FA]/60 via-white to-[#FAF6FA]/80 overflow-hidden font-sans select-none">
            {/* 1. Clean Top Header Bar (Exact RIFAT Ai Style, Full Browser Width) */}
            <header className="px-4 sm:px-8 py-3.5 bg-white/80 backdrop-blur-xl border-b border-[#EFE0EF]/80 flex items-center justify-between shrink-0 shadow-2xs z-10">
                <div className="flex items-center gap-3.5">
                    <div className="relative">
                        <EmmaAvatar size={42} />
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-bold text-base sm:text-lg text-[#241224] leading-tight tracking-tight">
                            Emma AI
                        </h1>
                        <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                    </div>
                </div>

                {/* Right: Clear Chat Control */}
                <div>
                    {isClearConfirming ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-xs">
                            <span className="text-rose-700 font-semibold text-xs">Clear all?</span>
                            <button
                                onClick={handleClearChat}
                                className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded-md hover:bg-rose-700 transition cursor-pointer"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setIsClearConfirming(false)}
                                className="text-slate-500 hover:text-slate-700 px-1 cursor-pointer"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsClearConfirming(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer"
                        >
                            <TrashIcon size={14} color="currentColor" />
                            <span className="hidden sm:inline">Clear Chat</span>
                        </button>
                    )}
                </div>
            </header>

            {/* 2. Full-Page Chat Message Stream (Centered Conversational Column) */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 no-scrollbar">
                <div className="max-w-3xl sm:max-w-4xl mx-auto w-full space-y-5">
                    {messages.map((m, idx) => {
                        const isUser = m.role === 'user';
                        return (
                            <div key={m.id || idx}>
                                {isUser ? (
                                    /* User Message: Right-aligned pill */
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] sm:max-w-[75%] space-y-2 flex flex-col items-end">
                                            {m.image && (
                                                <div className="max-w-[240px] rounded-2xl overflow-hidden border border-[#EFE0EF] shadow-2xs">
                                                    <img
                                                        src={m.image}
                                                        alt="Uploaded photo"
                                                        className="w-full h-auto object-cover max-h-48 rounded-2xl"
                                                    />
                                                </div>
                                            )}
                                            <div className="bg-[#6C306E] text-white rounded-2xl rounded-tr-xs px-4 py-3 text-sm leading-relaxed shadow-xs font-medium select-text">
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Assistant Message: Emma Avatar on Left + Clean White Card (RIFAT Ai Style) */
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
                            </div>
                        );
                    })}

                    {/* Typing Indicator: Emma Avatar + Clean 3 Dots Only */}
                    {isSending && (
                        <div className="flex items-start gap-3">
                            <EmmaAvatar size={32} className="mt-1 shadow-2xs" />
                            <div className="bg-white border border-[#EFE0EF] rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center shadow-2xs">
                                <div className="flex gap-1.5 items-center">
                                    <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce" />
                                    <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.2s]" />
                                    <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* 3. Sticky Bottom Area: Suggestions Carousel + Pill Input Capsule */}
            <footer className="shrink-0 bg-white/80 backdrop-blur-xl border-t border-[#EFE0EF]/80 px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(58,12,56,0.03)] z-10">
                <div className="max-w-3xl sm:max-w-4xl mx-auto w-full space-y-2.5">
                    {/* Suggestions Carousel: Left/Right Arrow Navigation (RIFAT Ai Style) */}
                    <AiSuggestionBar
                        suggestions={dynamicSuggestions}
                        onSelect={(query) => handleSendMessage(query, null)}
                        disabled={isSending}
                    />

                    {/* Attached Image Preview */}
                    {attachedImage && (
                        <div className="flex items-center justify-between bg-white border border-[#EFE0EF] rounded-2xl px-3.5 py-2 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                    src={attachedImage}
                                    alt="Product bottle"
                                    className="size-9 rounded-xl object-cover border border-[#EFE0EF]"
                                />
                                <span className="text-xs font-semibold text-[#6C306E] truncate">
                                    Product bottle photo attached
                                </span>
                            </div>
                            <button
                                onClick={() => setAttachedImage(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                                <CloseIcon size={14} color="currentColor" />
                            </button>
                        </div>
                    )}

                    {/* Input Capsule Pill (RIFAT Ai Style) */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="rounded-full bg-white border border-[#EFE0EF] shadow-[0_2px_15px_rgba(58,12,56,0.06)] pl-3.5 pr-2 py-1.5 sm:py-2 flex items-center gap-2 focus-within:border-[#6C306E] focus-within:shadow-[0_4px_24px_rgba(108,48,110,0.12)] transition-all"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        {/* Camera / Bottle Photo Upload */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Snap or upload product bottle photo"
                            className="size-9 rounded-full text-slate-400 hover:text-[#6C306E] hover:bg-[#6C306E]/10 flex items-center justify-center transition cursor-pointer shrink-0"
                        >
                            <CameraIcon size={18} color="currentColor" />
                        </button>

                        {/* Text Field */}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask Emma AI anything..."
                            disabled={isSending}
                            className="flex-1 bg-transparent text-xs sm:text-sm text-[#241224] placeholder:text-slate-400 outline-none font-medium min-w-0"
                        />

                        {/* Circular Send Button (RIFAT Ai Style) */}
                        <button
                            type="submit"
                            disabled={isSending || (!inputText.trim() && !attachedImage)}
                            className="size-9 sm:size-10 rounded-full bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition active:scale-95 shadow-xs cursor-pointer"
                        >
                            <SendIcon size={15} color="white" />
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}
