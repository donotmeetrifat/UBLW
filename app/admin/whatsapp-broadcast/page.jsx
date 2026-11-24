'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import Loading from '@/components/Loading';
import { MobileMockup } from '@/components/ui/great-ui-mobile-mockup';
import {
    OfficialWhatsAppIcon,
    SearchIcon,
    SparklesIcon,
    SendIcon,
    CheckIcon,
    RefreshIcon,
    CloseIcon,
    UserIcon,
    BagIcon,
    AlertCircleIcon,
    AlertTriangleIcon,
} from '@/components/icons';

const PRESET_TEMPLATES = [
    {
        name: 'Fresh London Arrival Announcement',
        text: `Assalamu Alaikum {customer_name}! ✨

We are thrilled to share an exclusive update from UK Brand Lover! 🇬🇧

Our fresh London Heathrow shipment has arrived, featuring 100% authentic UK imported beauty essentials including {product_name}.

💰 Special Price: {product_price}

👉 Tap here to order with 100% Authenticity Guarantee & Fast Nationwide Delivery:
{store_url}

Need expert shade matching or routine advice? Contact our hotline: {hotline}.

— UK Brand Lover Official`,
    },
    {
        name: 'VIP Customer Exclusive Privilege',
        text: `Assalamu Alaikum {customer_name}! 🌸

As a valued member of UK Brand Lover, you have VIP early access to our newest curated UK skincare & cosmetics collection!

Featured: {product_name}
Authentic UK Direct Import: {product_price}

👉 Complete your order securely:
{cart_url}

Questions? We are here to assist you anytime on WhatsApp: {hotline}.

— UK Brand Lover`,
    },
    {
        name: 'Weekend Flash Sale Alert',
        text: `⚡ FLASH SALE ALERT: {customer_name}! ⚡

Get your hands on genuine UK imported beauty favorites at special weekend prices!

Featured Authentic Item: {product_name}
Current Price: {product_price}

👉 Grab yours before stock runs out:
{store_url}

Hotline & Help: {hotline}

— UK Brand Lover Team`,
    },
];

export default function WhatsAppBroadcastPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState({ isConnected: false, hotline: '+880 1959-524393' });

    // Selection & filter states
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'has_whatsapp' | 'selected'

    // Message composition states
    const [messageTemplate, setMessageTemplate] = useState(PRESET_TEMPLATES[0].text);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [includeProductImage, setIncludeProductImage] = useState(true);
    const [customImageUrl, setCustomImageUrl] = useState('');

    // Broadcast execution states
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [broadcastReport, setBroadcastReport] = useState(null);

    // Fetch initial data
    const fetchBroadcastData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/whatsapp-broadcast');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
                setProducts(data.products || []);
                setSettings(data.settings || { isConnected: false, hotline: '+880 1959-524393' });

                // By default, select all users who have valid WhatsApp numbers
                const validIds = (data.users || []).filter((u) => u.hasValidWhatsApp).map((u) => u.id);
                setSelectedUserIds(validIds);

                // Default selected product if products exist
                if (data.products && data.products.length > 0 && !selectedProductId) {
                    setSelectedProductId(data.products[0].id);
                }
            } else {
                toast.error(data.message || 'Failed to load broadcast recipients.');
            }
        } catch (err) {
            toast.error(`Error loading data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcastData();
    }, []);

    // Filtered users according to search query and active tab
    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return users.filter((u) => {
            const matchesSearch =
                !query ||
                (u.name && u.name.toLowerCase().includes(query)) ||
                (u.email && u.email.toLowerCase().includes(query)) ||
                (u.resolvedWhatsApp && u.resolvedWhatsApp.includes(query)) ||
                (u.id && u.id.toLowerCase().includes(query));

            if (!matchesSearch) return false;

            if (filterTab === 'has_whatsapp') return u.hasValidWhatsApp;
            if (filterTab === 'selected') return selectedUserIds.includes(u.id);
            return true;
        });
    }, [users, searchQuery, filterTab, selectedUserIds]);

    // Currently selected product object
    const selectedProduct = useMemo(() => {
        if (!selectedProductId) return null;
        return products.find((p) => p.id === selectedProductId) || null;
    }, [products, selectedProductId]);

    // Resolved cover photo for preview & dispatch
    const resolvedCoverImage = useMemo(() => {
        if (customImageUrl && customImageUrl.startsWith('http')) return customImageUrl;
        if (includeProductImage && selectedProduct?.coverImage) return selectedProduct.coverImage;
        return null;
    }, [customImageUrl, includeProductImage, selectedProduct]);

    // Sample user used for live simulator
    const previewUser = useMemo(() => {
        if (selectedUserIds.length > 0) {
            const found = users.find((u) => u.id === selectedUserIds[0]);
            if (found) return found;
        }
        return users[0] || { name: 'Nusrat Jahan', id: 'usr_sample', resolvedWhatsApp: '01819283746' };
    }, [users, selectedUserIds]);

    // Live preview formatted message string
    const previewFormattedMessage = useMemo(() => {
        const pTitle = selectedProduct?.name || selectedProduct?.title || 'CeraVe Hydrating Cleanser 473ml (UK)';
        const pPrice = selectedProduct ? `৳${selectedProduct.price.toLocaleString('en-US')}` : '৳2,250';
        const hotline = settings.hotline || '+880 1959-524393';
        const storeUrl = selectedProduct ? `https://ukbrandlover.com/product/${selectedProduct.id}` : 'https://ukbrandlover.com';
        const cartUrl = 'https://ukbrandlover.com/checkout';

        return (messageTemplate || '')
            .replace(/\{customer_name\}/g, previewUser?.name || 'Valued Customer')
            .replace(/\{product_name\}/g, pTitle)
            .replace(/\{product_price\}/g, pPrice)
            .replace(/\{cart_url\}/g, cartUrl)
            .replace(/\{store_url\}/g, storeUrl)
            .replace(/\{hotline\}/g, hotline);
    }, [messageTemplate, selectedProduct, previewUser, settings]);

    // User Selection Handlers
    const handleToggleUser = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredUsers.map((u) => u.id);
        setSelectedUserIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
        toast.success(`Selected ${filteredIds.length} customers`);
    };

    const handleSelectAllWhatsAppVerified = () => {
        const verifiedIds = users.filter((u) => u.hasValidWhatsApp).map((u) => u.id);
        setSelectedUserIds(verifiedIds);
        toast.success(`Selected all ${verifiedIds.length} WhatsApp verified customers`);
    };

    const handleDeselectAll = () => {
        setSelectedUserIds([]);
        toast('Deselected all recipients');
    };

    // Insert dynamic tag into message template
    const handleInsertVariable = (tag) => {
        setMessageTemplate((prev) => (prev ? prev + ' ' + tag : tag));
        toast.success(`Inserted ${tag}`);
    };

    // Handle broadcast dispatch
    const handleConfirmBroadcast = async () => {
        if (selectedUserIds.length === 0) {
            toast.error('Please select at least one customer.');
            return;
        }

        if (!messageTemplate.trim()) {
            toast.error('Message template cannot be empty.');
            return;
        }

        setIsBroadcasting(true);
        setShowConfirmModal(false);

        try {
            const res = await fetch('/api/admin/whatsapp-broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientUserIds: selectedUserIds,
                    messageTemplate,
                    selectedProductId: selectedProductId || null,
                    includeProductImage,
                    customImageUrl: customImageUrl.trim() || null,
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'WhatsApp broadcast completed successfully!');
                setBroadcastReport(data);
            } else {
                toast.error(data.message || 'Failed to dispatch WhatsApp broadcast.');
            }
        } catch (err) {
            toast.error(`Broadcast error: ${err.message}`);
        } finally {
            setIsBroadcasting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    const verifiedUsersCount = users.filter((u) => u.hasValidWhatsApp).length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* 1. Header Banner */}
            <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] text-[#6C306E]">
                                <OfficialWhatsAppIcon size={24} />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-[#241224] tracking-tight">
                                WhatsApp Broadcast Marketing
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                            Broadcast personalized promotional messages, new UK arrivals, and VIP announcements directly to your customers' account WhatsApp numbers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {settings.isConnected ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>WhatsApp API Connected</span>
                                <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full font-mono">
                                    {settings.hotline}
                                </span>
                            </div>
                        ) : (
                            <Link
                                href="/admin/ai-bot"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>WhatsApp API Not Connected &rarr; Connect in AI Bot</span>
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={fetchBroadcastData}
                            className="p-2 rounded-xl bg-[#FAF6FA] hover:bg-[#F3E5F3] border border-[#EFE0EF] text-slate-600 hover:text-[#6C306E] transition cursor-pointer"
                            title="Refresh data"
                        >
                            <RefreshIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Audience Selection & Message Builder (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Audience Selection Card */}
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFE0EF]">
                            <div>
                                <h2 className="text-sm font-black text-[#241224] flex items-center gap-2">
                                    <UserIcon size={16} className="text-[#6C306E]" />
                                    1. Target Customer Audience
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Select all, multiple, or individual customers using their saved account WhatsApp number.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-[#6C306E] bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1 rounded-full">
                                    {selectedUserIds.length} Selected
                                </span>
                            </div>
                        </div>

                        {/* Search & Selection Controls */}
                        <div className="space-y-3">
                            <div className="relative">
                                <SearchIcon
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by customer name, WhatsApp, email, or User ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <CloseIcon size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Filters & Bulk Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1 bg-[#FAF6FA] p-1 rounded-xl border border-[#EFE0EF]">
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('all')}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                            filterTab === 'all'
                                                ? 'bg-[#6C306E] text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-[#241224]'
                                        }`}
                                    >
                                        All Users ({users.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('has_whatsapp')}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                            filterTab === 'has_whatsapp'
                                                ? 'bg-[#6C306E] text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-[#241224]'
                                        }`}
                                    >
                                        WhatsApp Ready ({verifiedUsersCount})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('selected')}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                            filterTab === 'selected'
                                                ? 'bg-[#6C306E] text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-[#241224]'
                                        }`}
                                    >
                                        Selected ({selectedUserIds.length})
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={handleSelectAllWhatsAppVerified}
                                        className="px-2.5 py-1 text-[11px] font-bold text-[#6C306E] bg-[#FAF6FA] hover:bg-[#F3E5F3] border border-[#EFE0EF] rounded-lg transition cursor-pointer"
                                    >
                                        Select All Verified
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSelectAllFiltered}
                                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-[#FAF6FA] hover:bg-slate-200 border border-[#EFE0EF] rounded-lg transition cursor-pointer"
                                    >
                                        Select Shown
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeselectAll}
                                        className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                    >
                                        Deselect
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Customer List Container */}
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-[#EFE0EF] rounded-2xl p-2 bg-[#FAF6FA]">
                            {filteredUsers.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    No customers found matching your filter criteria.
                                </div>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedUserIds.includes(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleToggleUser(user.id)}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white border-[#6C306E] shadow-2xs'
                                                    : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-[#6C306E]/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}} // Controlled by container click
                                                    className="w-4 h-4 text-[#6C306E] rounded-md border-slate-300 focus:ring-[#6C306E] cursor-pointer"
                                                />
                                                <div className="w-8 h-8 rounded-full bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center font-bold text-xs text-[#6C306E] shrink-0">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[#241224] truncate">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                                            ID: {user.id}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                                                        {user.resolvedWhatsApp ? (
                                                            <span className="flex items-center gap-1 font-mono font-medium text-emerald-700">
                                                                <OfficialWhatsAppIcon size={12} />
                                                                {user.resolvedWhatsApp}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">No phone saved</span>
                                                        )}
                                                        {user.email && (
                                                            <span className="truncate text-slate-400">
                                                                • {user.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                {user.hasValidWhatsApp ? (
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                                        WhatsApp Ready
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                                        No Number
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Featured Product Card (Optional) */}
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#EFE0EF]">
                            <h2 className="text-sm font-black text-[#241224] flex items-center gap-2">
                                <BagIcon size={16} className="text-[#6C306E]" />
                                2. Feature a Specific Product (Optional)
                            </h2>
                            {selectedProductId && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedProductId('')}
                                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                                >
                                    Clear Product
                                </button>
                            )}
                        </div>

                        <p className="text-[11px] text-slate-500">
                            Select a product to automatically insert `{'{product_name}'}`, `{'{product_price}'}`, and its cover photo into the broadcast message.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                            <div>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="w-full p-2.5 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition"
                                >
                                    <option value="">-- No specific product (General Announcement) --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name || p.title} (৳{p.price.toLocaleString('en-US')})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedProduct && (
                                <div className="flex items-center gap-3 p-2 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl">
                                    {selectedProduct.coverImage ? (
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                            <Image
                                                src={selectedProduct.coverImage}
                                                alt={selectedProduct.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                            <BagIcon size={16} />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-[#241224] truncate">
                                            {selectedProduct.name || selectedProduct.title}
                                        </div>
                                        <div className="text-[11px] font-black text-[#6C306E]">
                                            ৳{selectedProduct.price.toLocaleString('en-US')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedProduct && (
                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={includeProductImage}
                                        onChange={(e) => setIncludeProductImage(e.target.checked)}
                                        className="w-4 h-4 text-[#6C306E] rounded border-slate-300 focus:ring-[#6C306E]"
                                    />
                                    <span>Send with Product Cover Photo as WhatsApp Media Message</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Message Template Editor Card */}
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] p-5 sm:p-6 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE0EF]">
                            <div>
                                <h2 className="text-sm font-black text-[#241224] flex items-center gap-2">
                                    <SparklesIcon size={16} className="text-[#6C306E]" />
                                    3. Personalized Broadcast Message Template
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Use dynamic tags below to personalize the message automatically for each customer.
                                </p>
                            </div>

                            {/* Preset Switcher */}
                            <select
                                onChange={(e) => {
                                    const preset = PRESET_TEMPLATES.find((p) => p.name === e.target.value);
                                    if (preset) setMessageTemplate(preset.text);
                                }}
                                className="text-xs font-bold bg-[#FAF6FA] border border-[#EFE0EF] px-3 py-1.5 rounded-xl focus:border-[#6C306E] focus:outline-none"
                            >
                                <option value="">Load Preset Template...</option>
                                {PRESET_TEMPLATES.map((p) => (
                                    <option key={p.name} value={p.name}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Variable Injection Chips */}
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500">
                                Click to insert dynamic variables:
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {[
                                    { tag: '{customer_name}', label: 'Customer Name' },
                                    { tag: '{product_name}', label: 'Product Name' },
                                    { tag: '{product_price}', label: 'Product Price' },
                                    { tag: '{cart_url}', label: 'Direct Checkout' },
                                    { tag: '{store_url}', label: 'Product/Store Link' },
                                    { tag: '{hotline}', label: 'Store Hotline' },
                                ].map((v) => (
                                    <button
                                        key={v.tag}
                                        type="button"
                                        onClick={() => handleInsertVariable(v.tag)}
                                        className="px-2.5 py-1 rounded-lg bg-[#FAF6FA] hover:bg-[#F3E5F3] border border-[#EFE0EF] hover:border-[#6C306E]/40 text-[11px] font-mono font-bold text-[#6C306E] transition cursor-pointer"
                                    >
                                        + {v.tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Textarea */}
                        <div className="space-y-1.5">
                            <textarea
                                rows={13}
                                value={messageTemplate}
                                onChange={(e) => setMessageTemplate(e.target.value)}
                                placeholder="Type your broadcast message here..."
                                className="w-full p-4 text-xs bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl focus:bg-white focus:border-[#6C306E] focus:outline-none transition font-sans leading-relaxed text-[#241224]"
                            />
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Markdown formatting supported: *bold*, _italic_</span>
                                <span>{messageTemplate.length} characters</span>
                            </div>
                        </div>

                        {/* Broadcast Trigger Button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                disabled={selectedUserIds.length === 0 || !messageTemplate.trim() || isBroadcasting}
                                onClick={() => setShowConfirmModal(true)}
                                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer ${
                                    selectedUserIds.length > 0 && messageTemplate.trim() && !isBroadcasting
                                        ? 'bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-[#25D366]/20'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <OfficialWhatsAppIcon size={20} />
                                <span>
                                    {isBroadcasting
                                        ? 'Broadcasting Messages...'
                                        : `Send WhatsApp Broadcast (${selectedUserIds.length} Recipients)`}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Samsung Galaxy Live Preview (5 cols) */}
                <div className="lg:col-span-5 sticky top-6 space-y-4">
                    <div className="bg-white rounded-3xl border border-[#EFE0EF] p-4 sm:p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#EFE0EF]">
                            <span className="text-xs font-black text-[#241224] flex items-center gap-1.5">
                                <span>📱</span> Samsung Live WhatsApp Preview
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Previewing for: {previewUser.name}
                            </span>
                        </div>

                        <div className="flex justify-center py-1">
                            <MobileMockup
                                headerTitle="UK Brand Lover"
                                headerSubtitle="online"
                                avatarUrl="/images/web-logo-optimized.png"
                                avatarFallback="🇬🇧"
                                productImageUrl={resolvedCoverImage}
                                messageText={previewFormattedMessage}
                                timestamp="Just now"
                            />
                        </div>

                        <div className="p-3 bg-[#FAF6FA] rounded-2xl border border-[#EFE0EF] space-y-1 text-[11px] text-slate-600">
                            <div className="font-bold text-[#6C306E] flex items-center gap-1">
                                <SparklesIcon size={12} />
                                High-Conversion Tip
                            </div>
                            <p>
                                WhatsApp messages sent with the customer's actual first name and product photo have over <strong>87% open rates</strong> and generate rapid conversions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#EFE0EF] shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                                    <OfficialWhatsAppIcon size={20} />
                                </span>
                                <h3 className="text-base font-black text-[#241224]">
                                    Confirm WhatsApp Broadcast
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-600">
                            <p>
                                You are about to broadcast this WhatsApp message to{' '}
                                <strong className="text-[#241224]">{selectedUserIds.length} customer(s)</strong>.
                            </p>
                            <div className="p-3 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF] space-y-1">
                                <div className="text-[11px] font-bold text-slate-500">
                                    Sample Personalized Message:
                                </div>
                                <p className="font-sans whitespace-pre-line text-slate-700 max-h-40 overflow-y-auto">
                                    {previewFormattedMessage}
                                </p>
                            </div>
                            {resolvedCoverImage && (
                                <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold">
                                    <CheckIcon size={14} /> Product cover photo will be attached to each message.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmBroadcast}
                                className="px-5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black flex items-center gap-2 shadow-sm transition"
                            >
                                <SendIcon size={14} />
                                Confirm & Start Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Report Modal */}
            {broadcastReport && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EFE0EF] shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-[#241224] flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                    <CheckIcon size={18} />
                                </span>
                                Broadcast Delivery Report
                            </h3>
                            <button
                                type="button"
                                onClick={() => setBroadcastReport(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                <div className="text-xl font-black text-emerald-700">
                                    {broadcastReport.stats?.sentCount || 0}
                                </div>
                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                                    Sent
                                </div>
                            </div>
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                                <div className="text-xl font-black text-rose-700">
                                    {broadcastReport.stats?.failedCount || 0}
                                </div>
                                <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                                    Failed
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div className="text-xl font-black text-slate-700">
                                    {broadcastReport.stats?.skippedCount || 0}
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                    Skipped
                                </div>
                            </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#FAF6FA] rounded-2xl border border-[#EFE0EF]">
                            {broadcastReport.details?.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-[11px]"
                                >
                                    <span className="font-bold text-[#241224] truncate">
                                        {item.name} ({item.phone || 'No phone'})
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                            item.status === 'SENT'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : item.status === 'FAILED'
                                                ? 'bg-rose-50 text-rose-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setBroadcastReport(null)}
                            className="w-full py-2.5 rounded-xl bg-[#6C306E] hover:bg-[#582559] text-white text-xs font-black transition cursor-pointer"
                        >
                            Close Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
