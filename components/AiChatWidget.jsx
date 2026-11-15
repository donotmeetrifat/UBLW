'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import AiProductCard from '@/components/AiProductCard'
import {
    SparklesIcon,
    CloseIcon,
    CameraIcon,
    SendIcon,
    TrashIcon,
    BagIcon,
    ShieldCheckIcon,
    CheckIcon
} from '@/components/icons'

const DEFAULT_WELCOME_MESSAGE = {
    id: 'welcome-0',
    role: 'assistant',
    content: `Hello darling! I'm **Emma**, your Senior UK Beauty Consultant at UK Brand Lover. 🇬🇧✨\n\nEvery item in our boutique is 100% genuine and imported directly from London. How can I pamper your skin today? Feel free to ask about our in-stock items, share your skin concerns, or snap a photo of any product bottle to check availability!`,
    products: [],
    createdAt: new Date().toISOString(),
};

const SUGGESTED_CHIPS = [
    "Is CeraVe Hydrating Cleanser in stock?",
    "Best serum for dark spots & glow?",
    "Help me build an acne & blemish routine",
    "Recommend an authentic British sunscreen"
];

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
                // Logged in: Check if we have guest messages to migrate first
                if (typeof window !== 'undefined') {
                    const guestSaved = localStorage.getItem('ukbl_guest_ai_messages');
                    if (guestSaved) {
                        try {
                            const parsedGuest = JSON.parse(guestSaved);
                            if (Array.isArray(parsedGuest) && parsedGuest.length > 1) {
                                // Filter out welcome message
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

                // Fetch database messages
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
                // Guest: Load from localStorage
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
                // Downscale to max 800px on longest dimension for high quality + tiny payload (<100KB)
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
                toast.success('Product photo attached! Ask Emma to analyze it.');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Send Message Handler
    const handleSendMessage = async (textToSend = null) => {
        const text = (textToSend !== null ? textToSend : inputText).trim();
        const photo = attachedImage;

        if (!text && !photo) return;
        if (isSending) return;

        // User message object
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
            // Send to AI chat endpoint
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    image: photo,
                    sessionId: sessionId,
                    history: messages.slice(-8), // Send recent context for conversational continuity
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
            console.error('Chat error:', err);
            const fallbackMsg = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Pardon me darling, I had a momentary connection hiccup! Our London inventory is active. Could you kindly re-send your message or inquire about a specific UK skincare brand like CeraVe, The Ordinary, or Simple?`,
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
            {/* 1. Floating Bottom-Right Launcher Button */}
            <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                >
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Open UK Beauty AI Advisor"
                        className="group flex items-center gap-2.5 h-12 sm:h-13 pl-3.5 pr-4 rounded-full bg-gradient-to-r from-[#6C306E] via-[#562258] to-[#401242] text-white shadow-[0_8px_25px_rgba(108,48,110,0.38)] border border-white/20 backdrop-blur-md cursor-pointer transition-all"
                    >
                        {/* Avatar / Sparkle Icon */}
                        <div className="relative size-8 rounded-full bg-white/15 p-0.5 flex items-center justify-center border border-white/30 shrink-0">
                            <SparklesIcon size={16} color="#FCE7F3" />
                            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#6C306E]" />
                        </div>

                        {/* Label */}
                        <div className="text-left hidden min-[360px]:block">
                            <div className="flex items-center gap-1">
                                <span className="text-[11px] font-black tracking-wide uppercase text-pink-200">
                                    UK Beauty AI
                                </span>
                                <span className="text-[10px]">🇬🇧</span>
                            </div>
                            <p className="text-[10px] text-white/80 font-medium leading-none">
                                Ask Emma • Sourcing
                            </p>
                        </div>
                    </button>
                </motion.div>
            </div>

            {/* 2. Floating AI Chat Modal Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 25, scale: 0.94 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="fixed bottom-20 right-2 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-[0_16px_50px_rgba(58,12,56,0.25)] border border-[#EFE0EF] flex flex-col overflow-hidden select-none font-sans"
                    >
                        {/* Top Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-[#6C306E] via-[#562258] to-[#401242] text-white flex items-center justify-between shrink-0 shadow-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="relative size-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-sm font-bold shadow-2xs">
                                    <span>👩‍💼</span>
                                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 border-2 border-[#6C306E]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-none">
                                            Emma
                                        </h3>
                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-pink-100 font-semibold">
                                            UK Advisor 🇬🇧
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-pink-200/80 font-medium leading-tight mt-0.5">
                                        Verified UK Stock • Live Sourcing
                                    </p>
                                </div>
                            </div>

                            {/* Header Actions */}
                            <div className="flex items-center gap-1">
                                {isClearConfirming ? (
                                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-[10px]">
                                        <span className="text-pink-100">Clear?</span>
                                        <button
                                            onClick={handleClearChat}
                                            className="px-1.5 py-0.5 bg-rose-500 rounded text-white font-bold hover:bg-rose-600 transition"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setIsClearConfirming(false)}
                                            className="px-1 text-white/80 hover:text-white"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsClearConfirming(true)}
                                        title="Clear conversation history"
                                        className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer"
                                    >
                                        <TrashIcon size={14} color="currentColor" />
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Close Advisor"
                                    className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition cursor-pointer"
                                >
                                    <CloseIcon size={16} color="currentColor" />
                                </button>
                            </div>
                        </div>

                        {/* Live Trust Banner */}
                        <div className="px-3 py-1.5 bg-[#FAF6FA] border-b border-[#EFE0EF] flex items-center justify-between text-[10px] text-[#6C306E] font-semibold">
                            <span className="flex items-center gap-1">
                                <ShieldCheckIcon size={13} color="#6C306E" />
                                Direct London Air-Freight Sourcing
                            </span>
                            <span className="text-slate-400">100% Authentic Guarantee</span>
                        </div>

                        {/* Message Stream */}
                        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-gradient-to-b from-white to-[#FAF6FA]/40 no-scrollbar">
                            {messages.map((m, idx) => {
                                const isUser = m.role === 'user';
                                return (
                                    <div
                                        key={m.id || idx}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                                    >
                                        {/* Optional Image Attachment */}
                                        {m.image && (
                                            <div className="max-w-[200px] rounded-2xl overflow-hidden border border-[#EFE0EF] shadow-2xs mb-1">
                                                <img
                                                    src={m.image}
                                                    alt="Product attachment"
                                                    className="w-full h-auto object-cover max-h-40"
                                                />
                                            </div>
                                        )}

                                        {/* Chat Bubble */}
                                        <div
                                            className={`max-w-[88%] sm:max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-[12.5px] leading-relaxed ${
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
                                                <div className="w-full max-w-[94%] space-y-2 mt-1">
                                                    {remainingProducts.map(p => (
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
                                );
                            })}

                            {/* Typing / Verification Indicator */}
                            {isSending && (
                                <div className="flex items-center gap-2 text-xs text-[#6C306E] font-medium p-2.5 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] max-w-[80%]">
                                    <div className="flex gap-1 items-center">
                                        <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce" />
                                        <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.2s]" />
                                        <span className="size-1.5 rounded-full bg-[#6C306E] animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                    <span className="text-[11px]">Emma is checking authentic UK stock...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestion Chips */}
                        <div className="px-3 py-1.5 bg-[#FAF6FA]/80 border-t border-[#EFE0EF] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                            {SUGGESTED_CHIPS.map((chip, cIdx) => (
                                <button
                                    key={cIdx}
                                    onClick={() => handleSendMessage(chip)}
                                    disabled={isSending}
                                    className="px-2.5 py-1 rounded-full bg-white border border-[#EFE0EF] text-[10.5px] font-semibold text-[#4A304A] hover:bg-[#6C306E] hover:text-white hover:border-[#6C306E] transition whitespace-nowrap shrink-0 shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        {/* Input & Upload Bar */}
                        <div className="p-2.5 bg-white border-t border-[#EFE0EF] shrink-0">
                            {/* Attached image preview banner */}
                            {attachedImage && (
                                <div className="flex items-center justify-between bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl px-2.5 py-1.5 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={attachedImage}
                                            alt="Preview"
                                            className="size-8 rounded-lg object-cover border border-[#EFE0EF]"
                                        />
                                        <span className="text-[11px] font-semibold text-[#6C306E] truncate">
                                            Bottle photo attached
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setAttachedImage(null)}
                                        className="p-1 rounded-full text-slate-400 hover:text-rose-500"
                                    >
                                        <CloseIcon size={13} color="currentColor" />
                                    </button>
                                </div>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex items-center gap-1.5"
                            >
                                {/* Hidden File Input */}
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
                                    title="Snap or upload product bottle"
                                    className="size-9 rounded-xl border border-[#EFE0EF] hover:border-[#6C306E] bg-[#FAF6FA] hover:bg-white text-[#6C306E] flex items-center justify-center shrink-0 cursor-pointer transition shadow-2xs"
                                >
                                    <CameraIcon size={16} color="#6C306E" />
                                </button>

                                {/* Compact Text Input */}
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask Emma about UK skincare & stock..."
                                    disabled={isSending}
                                    className="flex-1 h-9 px-3 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition text-[#241224] placeholder:text-slate-400"
                                />

                                {/* Send Button */}
                                <button
                                    type="submit"
                                    disabled={isSending || (!inputText.trim() && !attachedImage)}
                                    className="size-9 rounded-xl bg-[#6C306E] hover:bg-[#562258] disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 cursor-pointer transition shadow-2xs"
                                >
                                    <SendIcon size={15} color="white" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
