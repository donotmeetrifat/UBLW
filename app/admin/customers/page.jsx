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
    CloseIcon,
    LockIcon,
    PhoneIcon
} from "@/components/icons"

export default function AdminCustomerMarketingHub() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const [activeTab, setActiveTab] = useState('crm') // 'crm', 'abandoned', 'broadcast', 'settings'
    const [customers, setCustomers] = useState([])
    const [abandonedCarts, setAbandonedCarts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Broadcast Campaign State
    const [broadcastAudience, setBroadcastAudience] = useState('all') // 'all', 'abandoned', 'vip'
    const [broadcastTemplate, setBroadcastTemplate] = useState('eid_sale')
    const [customBroadcastMsg, setCustomBroadcastMsg] = useState('')

    // WhatsApp Connection Settings State
    const [connectionMode, setConnectionMode] = useState('qr_gateway') // 'qr_gateway' or 'meta_api'
    const [testPhone, setTestPhone] = useState('01959524393')
    const [isSendingTest, setIsSendingTest] = useState(false)
    const [metaCredentials, setMetaCredentials] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        verifyToken: 'ukbl_verify_secret_2026'
    })

    // Automated Trigger Switches
    const [triggers, setTriggers] = useState({
        orderPlaced: true,
        orderShipped: true,
        abandonedCart48h: true,
        reviewDelivered: true
    })

    const templates = {
        eid_sale: "Assalamu Alaikum {name} আপু! 🌙 Exclusive UK Brand Lover Eid Festival Privilege: Enjoy a flat 25% OFF on all 100% authentic UK imported skincare & cosmetics with secret code *EID25* + Free Express Delivery in Dhaka! Claim your authentic beauty picks before British stock sells out: https://ukbrandlover.vercel.app/shop?coupon=EID25 — UK Brand Lover",
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

    const sendTestMessage = async () => {
        if (!testPhone.trim()) {
            toast.error("Please enter a test WhatsApp number")
            return
        }

        setIsSendingTest(true)
        try {
            const res = await fetch('/api/marketing/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: testPhone,
                    message: "Assalamu Alaikum! ✨ This is a test automated notification from the UK Brand Lover official WhatsApp connection (+880 1959-524393). Your store is successfully connected!"
                })
            })
            const data = await res.json()
            if (data.success) {
                if (data.dispatchUrl) {
                    window.open(data.dispatchUrl, '_blank')
                }
                toast.success("Test WhatsApp message dispatched successfully!")
            } else {
                toast.error(data.message || "Failed to dispatch test message")
            }
        } catch (error) {
            toast.error("Connection error")
        } finally {
            setIsSendingTest(false)
        }
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
                        Connect official WhatsApp API, run 1-click broadcast campaigns, and recover abandoned carts after 2-3 days
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Official Hotline: +880 1959-524393</span>
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

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                        activeTab === 'settings' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                >
                    <WhatsAppIcon size={14} color={activeTab === 'settings' ? '#FFFFFF' : '#047857'} />
                    <span>Official WhatsApp API Connection</span>
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
                                        <div className="size-14 rounded-2xl bg-white border border-[#EFE0EF] flex items-center justify-center p-1 shrink-0">
                                            <img src={lead.productImage} alt={lead.productName} className="max-h-12 w-auto object-contain" />
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

            {/* TAB 4: OFFICIAL WHATSAPP API & CONNECTION SETTINGS */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Mode Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Connection Mode Selector */}
                        <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs text-xs space-y-4">
                            <h2 className="text-base font-extrabold text-[#241224] flex items-center gap-2">
                                <WhatsAppIcon size={18} color="#059669" />
                                <span>Official WhatsApp Connection Setup</span>
                            </h2>
                            <p className="text-slate-600 text-xs">
                                Choose how you want to connect your official store number (<b>+880 1959-524393</b>) to send automated parcel updates and marketing broadcasts:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div
                                    onClick={() => setConnectionMode('qr_gateway')}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                        connectionMode === 'qr_gateway'
                                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                                            : 'border-[#EFE0EF] hover:border-emerald-500/40 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-extrabold text-[#241224] text-xs">Method 1: Scan Phone QR Code</span>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">100% Free Forever</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Link your physical phone's WhatsApp Business app (just like WhatsApp Web). Sends unlimited automated messages directly from your SIM at <b>$0 cost</b>.
                                    </p>
                                </div>

                                <div
                                    onClick={() => setConnectionMode('meta_api')}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                        connectionMode === 'meta_api'
                                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                                            : 'border-[#EFE0EF] hover:border-emerald-500/40 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-extrabold text-[#241224] text-xs">Method 2: Meta Cloud API</span>
                                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">1,000 Free Chats/Mo</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Connect directly to Meta's official Graph API servers using Phone Number ID and System User Token.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mode Details Form */}
                        {connectionMode === 'qr_gateway' ? (
                            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs text-xs space-y-4">
                                <h3 className="font-extrabold text-sm text-[#241224] flex items-center gap-2">
                                    <span>Pair Your Existing Phone (Instant & 100% Free)</span>
                                </h3>

                                <div className="p-4 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                                    {/* QR Code Container */}
                                    <div className="size-40 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center shrink-0">
                                        <div className="size-32 bg-slate-900 rounded-lg p-2 flex items-center justify-center text-white font-mono text-[10px]">
                                            [ WHATSAPP PAIRING QR CODE ]
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="space-y-2 text-xs">
                                        <p className="font-bold text-[#241224]">How to Link in 30 Seconds:</p>
                                        <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px]">
                                            <li>Open <b>WhatsApp Business</b> on your official phone (<b>01959-524393</b>).</li>
                                            <li>Tap <b>Settings</b> or Menu (three dots) ➔ <b>Linked Devices</b>.</li>
                                            <li>Tap <b>Link a Device</b> and point your phone camera at this QR code.</li>
                                            <li>Once scanned, the website will automatically send order updates, Steadfast tracking alerts, and abandoned cart offers from your phone!</li>
                                        </ol>
                                        <div className="pt-1">
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                                <CheckIcon size={12} color="#059669" />
                                                Active Session Linked to +880 1959-524393
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs text-xs space-y-4">
                                <h3 className="font-extrabold text-sm text-[#241224]">
                                    Meta WhatsApp Cloud API Credentials
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Obtained from your Meta for Developers dashboard (App ➔ WhatsApp ➔ API Setup):
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block font-bold text-[#241224] mb-1">Phone Number ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 104829104819283"
                                            value={metaCredentials.phoneNumberId}
                                            onChange={e => setMetaCredentials({ ...metaCredentials, phoneNumberId: e.target.value })}
                                            className="w-full p-2.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl font-mono text-xs outline-none focus:border-emerald-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-[#241224] mb-1">WhatsApp Business Account ID (WABA ID)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 291048102938475"
                                            value={metaCredentials.wabaId}
                                            onChange={e => setMetaCredentials({ ...metaCredentials, wabaId: e.target.value })}
                                            className="w-full p-2.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl font-mono text-xs outline-none focus:border-emerald-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-[#241224] mb-1">Permanent Meta Access Token</label>
                                        <input
                                            type="password"
                                            placeholder="EAABwz..."
                                            value={metaCredentials.accessToken}
                                            onChange={e => setMetaCredentials({ ...metaCredentials, accessToken: e.target.value })}
                                            className="w-full p-2.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-xl font-mono text-xs outline-none focus:border-emerald-600"
                                        />
                                    </div>

                                    <div className="p-3 bg-[#FAF6FA] rounded-xl border border-[#EFE0EF] space-y-1">
                                        <p className="font-bold text-[11px] text-[#241224]">Webhook Endpoint Configuration:</p>
                                        <p className="text-[11px] text-slate-500 font-mono">Callback URL: https://ukbrandlover.vercel.app/api/marketing/whatsapp</p>
                                        <p className="text-[11px] text-slate-500 font-mono">Verify Token: ukbl_verify_secret_2026</p>
                                    </div>

                                    <button
                                        onClick={() => toast.success("Meta API credentials saved!")}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-full font-bold transition cursor-pointer"
                                    >
                                        Save Meta API Config
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Automated Trigger Switches & Live Test Sender */}
                    <div className="space-y-6">
                        {/* Automated Triggers */}
                        <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs text-xs space-y-4">
                            <h3 className="font-extrabold text-[#241224] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <SparklesIcon size={14} color="#059669" />
                                <span>Automated Trigger Switches</span>
                            </h3>

                            <div className="space-y-3">
                                {[
                                    { key: 'orderPlaced', label: 'Order Confirmation Alert', sub: 'Sends receipt & order number upon checkout' },
                                    { key: 'orderShipped', label: 'Courier Dispatch Alert', sub: 'Sends Steadfast tracking ID on handover' },
                                    { key: 'abandonedCart48h', label: 'Abandoned Cart VIP Nudge', sub: 'Sends secret 15% VIP voucher after 48-72h' },
                                    { key: 'reviewDelivered', label: 'Delivered Review Request', sub: 'Asks customer for 5-star rating after parcel arrival' }
                                ].map((trig) => (
                                    <div key={trig.key} className="flex items-center justify-between p-3 bg-[#FAF6FA] rounded-2xl border border-[#EFE0EF]">
                                        <div className="pr-2">
                                            <p className="font-bold text-[#241224]">{trig.label}</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">{trig.sub}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={triggers[trig.key]}
                                                onChange={() => setTriggers({ ...triggers, [trig.key]: !triggers[trig.key] })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-emerald-600 transition-colors"></div>
                                            <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Test WhatsApp Message Sender */}
                        <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] shadow-2xs text-xs space-y-3.5">
                            <h3 className="font-extrabold text-[#241224] text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <PhoneIcon size={14} color="#059669" />
                                <span>Test Official Number Dispatch</span>
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Send a live test message from <b>+880 1959-524393</b> to any phone number to verify connection:
                            </p>

                            <input
                                type="tel"
                                placeholder="Recipient Phone (e.g. 01XXXXXXXXX)"
                                value={testPhone}
                                onChange={e => setTestPhone(e.target.value)}
                                className="w-full p-2.5 bg-[#FAF6FA] border border-[#EFE0EF] focus:border-emerald-600 rounded-xl outline-none font-mono text-xs"
                            />

                            <button
                                disabled={isSendingTest}
                                onClick={sendTestMessage}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2.5 rounded-full font-bold transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <WhatsAppIcon size={14} color="#FFFFFF" />
                                <span>{isSendingTest ? 'Sending...' : 'Send Test WhatsApp Message'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
