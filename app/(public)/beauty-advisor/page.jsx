'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import AiProductCard from '@/components/AiProductCard'
import { PromptBox } from '@/components/PromptBox'
import AiSuggestionBar, { getContextualSuggestions } from '@/components/AiSuggestionBar'
import {
    SparklesIcon,
    CameraIcon,
    SendIcon,
    TrashIcon,
    BagIcon,
    ShieldCheckIcon,
    CheckIcon,
    CloseIcon,
    StarIcon,
    RoyalCrownIcon,
    StoreFrontIcon
} from '@/components/icons'

const DEFAULT_WELCOME = {
    id: 'full-welcome',
    role: 'assistant',
    content: `Hello and welcome, darling! I'm **Emma**, your dedicated Senior UK Beauty Consultant at UK Brand Lover. 🇬🇧✨

Whether you want to verify if a specific British skincare product is in stock, identify a formulation from a photo, or curate a bespoke routine for acne, pigmentation, or barrier repair — I am here to guide you with authentic advice straight from London.

What skin goal are we focusing on today?`,
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

    // Image compression helper for PromptBox attachments
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
                img.onerror = () => resolve(null);
                img.src = event.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

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
                toast.success('Product photo loaded! Hit send to scan.');
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
                    content: `Hello darling! Delighted to assist you at UK Brand Lover. Every skincare and cosmetic item in our boutique is 100% genuine and imported directly from London, UK with batch code verification.\n\nCould you share what skin concern or UK brand you're looking for today? I would love to curate the perfect routine for you! ✨`,
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
        <div className="min-h-screen bg-gradient-to-b from-[#FAF6FA] via-white to-[#FAF6FA] py-6 sm:py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 1. Luxury Header Banner */}
                <div className="bg-gradient-to-r from-[#6C306E] via-[#562258] to-[#401242] rounded-3xl p-6 sm:p-8 text-white shadow-[0_12px_40px_rgba(108,48,110,0.22)] relative overflow-hidden mb-6">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-pink-200">
                                <SparklesIcon size={14} color="#FCE7F3" />
                                <span>AI Beauty Concierge & Personal Shopper 🇬🇧</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                                Consult with Emma, Senior UK Beauty Specialist
                            </h1>
                            <p className="text-xs sm:text-sm text-pink-100/90 leading-relaxed font-normal">
                                Get authentic British dermatological advice, verified real-time stock checks, and tailored routines. Snap a bottle photo or type any beauty inquiry below.
                            </p>
                        </div>

                        {/* Badges */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
                            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                                <span className="block text-lg font-black text-white">100%</span>
                                <span className="text-[11px] text-pink-200 font-medium">UK Authentic Imports</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                                <span className="block text-lg font-black text-white">24-48h</span>
                                <span className="text-[11px] text-pink-200 font-medium">Fast Nationwide Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat Consultation Interface */}
                <div className="bg-white rounded-3xl border border-[#EFE0EF] shadow-[0_8px_30px_rgba(58,12,56,0.06)] overflow-hidden flex flex-col h-[700px] max-h-[85vh]">
                    {/* Top Status Bar */}
                    <div className="px-5 py-3.5 bg-[#FAF6FA] border-b border-[#EFE0EF] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative size-10 rounded-full bg-gradient-to-br from-[#6C306E] to-[#401242] text-white flex items-center justify-center text-lg shadow-2xs">
                                👩‍💼
                                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-[#241224] leading-tight flex items-center gap-1.5">
                                    Emma
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE0EF] text-[#6C306E] font-bold">
                                        Online • Live Catalog Synced
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {currentUser ? `Welcome back, ${currentUser.name} (Chat saved to account)` : 'Guest Mode (Chat stored in browser cache)'}
                                </p>
                            </div>
                        </div>

                        {/* Clear Chat Control */}
                        <div>
                            {isClearConfirming ? (
                                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-xs">
                                    <span className="text-rose-700 font-semibold text-[11px]">Clear history?</span>
                                    <button
                                        onClick={handleClearChat}
                                        className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded hover:bg-rose-700 transition"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setIsClearConfirming(false)}
                                        className="text-slate-500 hover:text-slate-700 px-1"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsClearConfirming(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                                >
                                    <TrashIcon size={14} color="currentColor" />
                                    <span>Clear Chat</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white to-[#FAF6FA]/30">
                        {messages.map((m, idx) => {
                            const isUser = m.role === 'user';
                            return (
                                <div
                                    key={m.id || idx}
                                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                                >
                                    {m.image && (
                                        <div className="max-w-[240px] rounded-2xl overflow-hidden border border-[#EFE0EF] shadow-2xs mb-1">
                                            <img
                                                src={m.image}
                                                alt="Customer product photo"
                                                className="w-full h-auto object-cover max-h-48"
                                            />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[88%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                                            isUser
                                                ? 'bg-gradient-to-r from-[#6C306E] to-[#4A154D] text-white rounded-br-xs shadow-xs font-medium'
                                                : 'bg-[#FAF6FA] text-[#241224] border border-[#EFE0EF] rounded-bl-xs shadow-2xs'
                                        }`}
                                    >
                                        {isUser || !m.content ? (
                                            <div className="whitespace-pre-wrap select-text">
                                                {m.content}
                                            </div>
                                        ) : (
                                            <div className="select-text space-y-2">
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
                                        )}
                                    </div>

                                    {/* Products not placed inline */}
                                    {!isUser && Array.isArray(m.products) && m.products.length > 0 && (() => {
                                        const inlineIds = new Set(
                                            (m.content?.match(/\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}/gi) || [])
                                                .map(tag => tag.replace(/\[{1,2}PRODUCT:\s*/i, '').replace(/\]{1,2}/, '').trim())
                                        );
                                        const remainingProducts = m.products.filter(p => !inlineIds.has(p.id));

                                        if (remainingProducts.length === 0) return null;

                                        return (
                                            <div className="w-full max-w-[88%] sm:max-w-[75%] space-y-2 mt-1">
                                                {remainingProducts.map(p => (
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
                            );
                        })}

                        {isSending && (
                            <div className="flex items-center gap-2.5 text-xs text-[#6C306E] font-medium p-3 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] max-w-[65%]">
                                <div className="flex gap-1 items-center">
                                    <span className="size-2 rounded-full bg-[#6C306E] animate-bounce" />
                                    <span className="size-2 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.2s]" />
                                    <span className="size-2 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span>Emma is checking real-time UK stock & formulas...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Dynamic Swipeable Suggestions & Popular Consultations Bar (Strictly clean text, NO icons, swipeable left-right) */}
                    <div className="bg-[#FAF6FA]/90 border-t border-[#EFE0EF] shrink-0">
                        <AiSuggestionBar
                            suggestions={dynamicSuggestions}
                            onSelect={(query) => handleSendMessage(query, null)}
                            disabled={isSending}
                        />
                    </div>

                    {/* Bottom PromptBox Input Area */}
                    <div className="p-3 sm:p-4 bg-white border-t border-[#EFE0EF] shrink-0">
                        <PromptBox
                            onSubmit={async ({ text, attachments }) => {
                                let photo = null;
                                if (attachments && attachments.length > 0 && attachments[0].file) {
                                    photo = await compressFileToBase64(attachments[0].file);
                                }
                                handleSendMessage(text, photo);
                            }}
                            busy={isSending}
                            placeholder="Ask Emma anything: 'Do you have CeraVe in stock?', 'Routine for dark spots'..."
                            minRows={1}
                            maxRows={5}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
