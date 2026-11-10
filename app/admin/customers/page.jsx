'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import {
    WhatsAppIcon,
    SearchIcon,
    SparklesIcon,
    UserIcon,
    TagIcon,
    ShieldCheckIcon,
    TruckIcon,
    BagIcon,
    CheckIcon,
    CloseIcon
} from "@/components/icons"

export default function AdminCustomerMarketingHub() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const [activeTab, setActiveTab] = useState('crm') // 'crm', 'abandoned', 'broadcast', 'triggers'
    const [customers, setCustomers] = useState([])
    const [abandonedCarts, setAbandonedCarts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Broadcast Campaign State
    const [broadcastAudience, setBroadcastAudience] = useState('all') // 'all', 'abandoned', 'vip'
    const [broadcastTemplate, setBroadcastTemplate] = useState('eid_sale')
    const [customBroadcastMsg, setCustomBroadcastMsg] = useState('')

    const templates = {
        eid_sale: "Assalamu Alaikum {name} আপu! 🌙 Exclusive UK Brand Lover Eid Festival Privilege: Enjoy a flat 25% OFF on all 100% authentic UK imported skincare & cosmetics with secret code *EID25* + Free Express Delivery in Dhaka! Claim your authentic beauty picks before British stock sells out: https://ukbrandlover.vercel.app/shop?coupon=EID25 — UK Brand Lover",
        heathrow_restock: "Hello {name} আপু! ✈️ Fresh batch just landed from Heathrow, London! We have just restocked authentic CeraVe, The Ordinary, Charlotte Tilbury, and Olaplex. As an existing VIP customer, you get early access before public announcement. Check available stock now: https://ukbrandlover.vercel.app/shop — UK Brand Lover",
        vip_exclusive: "Dearest {name} আপু! 👑 You are one of our top valued customers this season! To thank you for trusting UK Brand Lover, here is a personal ৳500 luxury gift voucher: *VIPGIFT500* (Valid on any authentic UK order above ৳2500). Shop your routine here: https://ukbrandlover.vercel.app/shop?coupon=VIPGIFT500 — UK Brand Lover"
    }

    const fetchData = async () => {
        try {
            const [custRes, cartRes] = await Promise.all([
                fetch('/api/marketing/customers'),
                fetch('/api/marketing/abandoned-carts')
            ])
            const custData = await custRes.json()
            const cartData = await cartRes.json()

            if (custData.success && Array.isArray(custData.customers)) {
                setCustomers(custData.customers)
            }
            if (cartData.success && Array.isArray(cartData.abandonedCarts)) {
                setAbandonedCarts(cartData.abandonedCarts)
            }
        } catch (error) {
            console.error('Error loading CRM data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        setCustomBroadcastMsg(templates.eid_sale)
    }, [])

    const handleTemplateChange = (key) => {
        setBroadcastTemplate(key)
        setCustomBroadcastMsg(templates[key])
    }

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied!`)
    }

    const filteredCustomers = customers.filter(c => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (c.name || '').toLowerCase().includes(q) ||
               (c.phone || '').includes(q) ||
               (c.city || '').toLowerCase().includes(q)
    })

    // Target audience calculation for broadcast
    const broadcastRecipients = customers.filter(c => {
        if (broadcastAudience === 'abandoned') {
            return abandonedCarts.some(ac => ac.whatsapp === c.whatsapp)
        }
        if (broadcastAudience === 'vip') {
            return (c.totalSpend || 0) >= 5000 || (c.totalOrders || 0) >= 2
        }
        return true
    })

    const exportBroadcastCSV = () => {
        const rows = [
            ["Name", "WhatsApp Number", "City", "Total Orders", "Total Spend BDT"],
            ...broadcastRecipients.map(c => [
                `"${c.name}"`,
                `"+88${c.whatsapp.replace(/[^0-9]/g, '')}"`,
                `"${c.city}"`,
                c.totalOrders,
                c.totalSpend
            ])
        ]
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `UKBL_WhatsApp_Broadcast_${broadcastAudience}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success(`Exported ${broadcastRecipients.length} WhatsApp numbers to CSV!`)
    }

    if (loading) return <Loading />

    return (
        <div className="pb-24 text-slate-800">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#241224] flex items-center gap-2">
                        <span>Customer CRM &</span>
                        <span className="text-emerald-700 flex items-center gap-1">
                            <WhatsAppIcon size={24} color="#059669" />
                            WhatsApp Marketing
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Run 1-click broadcast campaigns, recover abandoned carts after 2-3 days, and manage customer WhatsApp lists
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                        <WhatsAppIcon size={14} color="#059669" />
                        <span>{customers.length} Verified WhatsApp Contacts</span>
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-[#EFE0EF] pb-3 text-xs font-bold">
                <button
                    onClick={() => setActiveTab('crm')}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                        activeTab === 'crm' ? 'bg-[#6C306E] text-white shadow-2xs' : 'text-slate-600 hover:bg-[#FAF6FA]'
                    }`}
                >
                    <UserIcon size={14} color={activeTab === 'crm' ? '#FFFFFF' : '#6C306E'} />
                    <span>All Customers Directory ({customers.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('abandoned')}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                        activeTab === 'abandoned' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                >
                    <BagIcon size={14} color={activeTab === 'abandoned' ? '#FFFFFF' : '#059669'} />
                    <span>Abandoned Carts (2-3 Days)</span>
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        {abandonedCarts.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                        activeTab === 'broadcast' ? 'bg-[#3A0C38] text-white shadow-2xs' : 'text-slate-600 hover:bg-[#FAF6FA]'
                    }`}
                >
                    <TagIcon size={14} color={activeTab === 'broadcast' ? '#FFFFFF' : '#6C306E'} />
                    <span>1-Click WhatsApp Broadcast Hub</span>
                </button>
            </div>

            {/* TAB 1: ALL CUSTOMERS DIRECTORY */}
            {activeTab === 'crm' && (
                <div>
                    <div className="mb-5 max-w-md relative">
                        <SearchIcon size={16} color="#6C306E" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by customer name, phone, or city..."
                            className="w-full bg-white border border-[#EFE0EF] focus:border-[#6C306E] rounded-full pl-10 pr-4 py-2.5 text-xs outline-none shadow-2xs"
                        />
                    </div>

                    <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_4px_24px_rgba(58,12,56,0.04)] border border-[#EFE0EF]">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF6FA] text-[#241224] font-extrabold uppercase tracking-wider text-[11px] border-b border-[#EFE0EF]">
                                <tr>
                                    <th className="px-5 py-4">Customer Name</th>
                                    <th className="px-4 py-4">WhatsApp Mobile</th>
                                    <th className="px-4 py-4">Location</th>
                                    <th className="px-4 py-4">Total Orders</th>
                                    <th className="px-4 py-4">Lifetime Spend</th>
                                    <th className="px-4 py-4 text-right">Direct Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]/60">
                                {filteredCustomers.map((cust) => (
                                    <tr key={cust.id} className="hover:bg-[#FAF6FA]/70 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-bold text-[#241224] text-xs">{cust.name}</p>
                                            <p className="text-[10px] text-slate-400">{cust.email}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button
                                                onClick={() => copyToClipboard(cust.whatsapp, 'WhatsApp number')}
                                                className="font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1 cursor-pointer"
                                                title="Click to copy"
                                            >
                                                <WhatsAppIcon size={12} color="#059669" />
                                                <span>{cust.whatsapp}</span>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                                            {cust.city || 'Dhaka'}
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-[#6C306E]">
                                            {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                                        </td>
                                        <td className="px-4 py-3.5 font-extrabold text-[#3A0C38] text-sm">
                                            {currency}{Number(cust.totalSpend || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <a
                                                href={`https://wa.me/88${cust.whatsapp.replace(/[^0-9]/g, '')}?text=Assalamu%20Alaikum%20${encodeURIComponent(cust.name)}%20আপু!%20Greetings%20from%20UK%20Brand%20Lover%20Flagship.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-[11px] font-bold transition shadow-2xs"
                                            >
                                                <WhatsAppIcon size={12} color="#FFFFFF" />
                                                <span>WhatsApp</span>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: ABANDONED CART REMARKETING (2-3 DAYS LATER AUTO RECOVERY) */}
            {activeTab === 'abandoned' && (
                <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 flex items-start justify-between">
                        <div>
                            <p className="font-extrabold text-sm mb-1">
                                🎯 Automated Psychological Abandoned Cart Recovery (2-3 Days)
                            </p>
                            <p className="text-[11px] text-emerald-800 leading-relaxed max-w-2xl">
                                These customers added authentic UK products to their shopping bag 2 to 3 days ago but did not complete checkout. Our system pre-wrote personalized, warm, and persuasive WhatsApp promotional messages offering secret VIP vouchers (e.g. <b>VIP15</b>) with urgency triggers to close the sale immediately.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {abandonedCarts.map((lead) => (
                            <div key={lead.id} className="bg-white border border-[#EFE0EF] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFE0EF] pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-14 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center p-1 shrink-0">
                                            <img src={lead.productImage} alt={lead.productName} className="max-h-12 w-auto object-contain mix-blend-multiply" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-[#241224]">{lead.customerName}</p>
                                            <p className="font-mono text-xs text-emerald-700 font-bold">{lead.whatsapp} • {lead.city}</p>
                                            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                                                ⏳ Left in cart: <b>{Math.round(lead.hoursSinceCart / 24)} days ago ({lead.hoursSinceCart} hrs)</b>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-400 block font-semibold">Abandoned Item Value</span>
                                        <span className="text-sm line-through text-slate-400 mr-1.5">{currency}{lead.productPrice}</span>
                                        <span className="text-base font-extrabold text-emerald-700">
                                            {currency}{lead.discountedPrice} ({lead.discountPercent}% OFF)
                                        </span>
                                    </div>
                                </div>

                                {/* Pre-generated Psychological Message Preview */}
                                <div className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl p-4 text-xs font-mono whitespace-pre-line text-slate-700 leading-relaxed">
                                    {lead.message}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        Secret Voucher: <b className="text-[#6C306E] font-mono">{lead.suggestedCoupon}</b> (1-click checkout link included)
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(lead.message, 'Promotional Message')}
                                            className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#EFE0EF] bg-white text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            Copy Copytext
                                        </button>

                                        <a
                                            href={`https://wa.me/88${lead.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(lead.message)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2 rounded-full text-xs font-extrabold transition shadow-2xs"
                                        >
                                            <WhatsAppIcon size={14} color="#FFFFFF" />
                                            <span>Send VIP WhatsApp Offer Now</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: 1-CLICK WHATSAPP BROADCAST CAMPAIGN HUB */}
            {activeTab === 'broadcast' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Campaign Builder */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EFE0EF] p-6 shadow-2xs space-y-5 text-xs">
                        <h2 className="text-base font-extrabold text-[#241224] flex items-center gap-2">
                            <TagIcon size={18} color="#6C306E" />
                            <span>Create WhatsApp Broadcast Campaign</span>
                        </h2>

                        {/* Audience Selection */}
                        <div>
                            <label className="block font-bold text-[#241224] mb-2 uppercase text-[10px] tracking-wider">
                                1. Select Target Customer Audience
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {[
                                    { id: 'all', title: 'All Registered Customers', count: customers.length },
                                    { id: 'abandoned', title: 'Abandoned Cart Shoppers', count: abandonedCarts.length },
                                    { id: 'vip', title: 'VIP High Spenders (৳5,000+)', count: customers.filter(c => c.totalSpend >= 5000).length }
                                ].map((aud) => (
                                    <div
                                        key={aud.id}
                                        onClick={() => setBroadcastAudience(aud.id)}
                                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                                            broadcastAudience === aud.id
                                                ? 'border-[#6C306E] bg-[#FAF6FA] shadow-2xs'
                                                : 'border-[#EFE0EF] hover:border-[#6C306E]/30 bg-white'
                                        }`}
                                    >
                                        <p className="font-bold text-[#241224]">{aud.title}</p>
                                        <p className="text-[11px] text-[#6C306E] font-bold mt-1">{aud.count} recipients</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Campaign Template Presets */}
                        <div>
                            <label className="block font-bold text-[#241224] mb-2 uppercase text-[10px] tracking-wider">
                                2. Pick Proven High-Converting Template
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleTemplateChange('eid_sale')}
                                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                        broadcastTemplate === 'eid_sale' ? 'bg-[#6C306E] text-white border-[#6C306E]' : 'border-[#EFE0EF] hover:bg-[#FAF6FA]'
                                    }`}
                                >
                                    🌙 Eid Festival 25% Off
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTemplateChange('heathrow_restock')}
                                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                        broadcastTemplate === 'heathrow_restock' ? 'bg-[#6C306E] text-white border-[#6C306E]' : 'border-[#EFE0EF] hover:bg-[#FAF6FA]'
                                    }`}
                                >
                                    ✈️ Heathrow UK Restock Alert
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTemplateChange('vip_exclusive')}
                                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                        broadcastTemplate === 'vip_exclusive' ? 'bg-[#6C306E] text-white border-[#6C306E]' : 'border-[#EFE0EF] hover:bg-[#FAF6FA]'
                                    }`}
                                >
                                    👑 VIP ৳500 Gift Voucher
                                </button>
                            </div>
                        </div>

                        {/* Message Editor */}
                        <div>
                            <label className="block font-bold text-[#241224] mb-1.5 uppercase text-[10px] tracking-wider">
                                3. Customize Promotional Message Content
                            </label>
                            <textarea
                                rows={6}
                                value={customBroadcastMsg}
                                onChange={(e) => setCustomBroadcastMsg(e.target.value)}
                                className="w-full p-3.5 border border-[#EFE0EF] focus:border-[#6C306E] rounded-2xl outline-none font-mono text-xs bg-[#FAF6FA] leading-relaxed resize-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Available dynamic tags: <b>{`{name}`}</b>, <b>{`{whatsapp}`}</b>, <b>{`{product}`}</b>.
                            </p>
                        </div>

                        {/* Broadcast Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE0EF]">
                            <span className="text-xs font-bold text-[#6C306E]">
                                Ready to broadcast to {broadcastRecipients.length} target customers
                            </span>

                            <div className="flex gap-2.5">
                                <button
                                    onClick={exportBroadcastCSV}
                                    className="bg-white border border-[#EFE0EF] hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-full font-bold transition cursor-pointer"
                                >
                                    📥 Export CSV for WhatsApp Business
                                </button>

                                <button
                                    onClick={() => {
                                        toast.success("Opening 1-Click WhatsApp Broadcast dispatch queue...")
                                        // Open first 3 recipients in tabs safely
                                        broadcastRecipients.slice(0, 3).forEach((rec, i) => {
                                            const personalized = customBroadcastMsg.replace(/{name}/g, rec.name)
                                            setTimeout(() => {
                                                window.open(`https://wa.me/88${rec.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(personalized)}`, '_blank')
                                            }, i * 600)
                                        })
                                    }}
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2 rounded-full font-extrabold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                                >
                                    <WhatsAppIcon size={14} color="#FFFFFF" />
                                    <span>Launch 1-Click WhatsApp Blast</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Marketing Psychological Triggers */}
                    <div className="space-y-5">
                        {/* Live Smartphone Preview */}
                        <div className="bg-[#FAF6FA] border border-[#EFE0EF] rounded-3xl p-5 shadow-2xs text-xs space-y-3">
                            <p className="font-extrabold text-[11px] text-[#6C306E] uppercase tracking-wider flex items-center gap-1.5">
                                <WhatsAppIcon size={14} color="#059669" />
                                <span>Customer WhatsApp Live Preview</span>
                            </p>
                            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs relative">
                                <div className="size-2 rounded-full bg-emerald-500 absolute top-3 right-3" />
                                <p className="font-bold text-[11px] text-emerald-800 mb-1">UK Brand Lover Official</p>
                                <p className="text-[11px] font-mono whitespace-pre-line text-slate-700 leading-relaxed">
                                    {customBroadcastMsg.replace(/{name}/g, "Ayesha")}
                                </p>
                                <span className="text-[9px] text-slate-400 block text-right mt-2">Just now • Sent from Dhaka HQ</span>
                            </div>
                        </div>

                        {/* Marketing Manipulation Switches (Conversion Drivers) */}
                        <div className="bg-white border border-[#EFE0EF] rounded-3xl p-5 shadow-2xs text-xs space-y-3">
                            <p className="font-extrabold text-[11px] text-[#241224] uppercase tracking-wider flex items-center gap-1.5">
                                <SparklesIcon size={14} color="#D8B56D" />
                                <span>High-Conversion Sales Switches</span>
                            </p>
                            
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between p-2.5 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF]">
                                    <div>
                                        <p className="font-bold text-[#241224]">Urgency Stock Alert</p>
                                        <p className="text-[10px] text-slate-500">"Only 3 left in UK batch"</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">ACTIVE</span>
                                </div>

                                <div className="flex items-center justify-between p-2.5 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF]">
                                    <div>
                                        <p className="font-bold text-[#241224]">Free Delivery Banner</p>
                                        <p className="text-[10px] text-slate-500">Free nationwide across Bangladesh</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">ACTIVE</span>
                                </div>

                                <div className="flex items-center justify-between p-2.5 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF]">
                                    <div>
                                        <p className="font-bold text-[#241224]">VIP 20% First Order</p>
                                        <p className="text-[10px] text-slate-500">Coupon NEW20 applied at checkout</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
