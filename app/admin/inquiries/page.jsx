'use client'

import { useEffect, useState, useMemo, useRef } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import {
    MailIcon,
    SearchIcon,
    UserIcon,
    WhatsAppIcon,
    CloseIcon,
    CheckIcon,
    TrashIcon,
    ArrowRightIcon,
    PhoneIcon
} from "@/components/icons"
import AdminDropdown from "@/components/admin/AdminDropdown"
import { broadcastStoreChange } from "@/lib/realtimeSync"

const INQUIRY_STATUS_OPTIONS = [
    { value: 'UNREAD', label: 'Unread', dot: 'bg-rose-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-[#6C306E]' },
    { value: 'RESOLVED', label: 'Resolved', dot: 'bg-emerald-500' }
]

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_admin_inquiries') || '[]')
                if (Array.isArray(cached) && cached.length > 0) return cached
            } catch {}
        }
        return []
    })
    const [stats, setStats] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = JSON.parse(localStorage.getItem('ukbl_cached_admin_inquiries_stats') || '{}')
                if (cached && cached.total !== undefined) return cached
            } catch {}
        }
        return { total: 0, unread: 0, inProgress: 0, resolved: 0 }
    })
    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('ukbl_cached_admin_inquiries')
            if (cached && cached !== '[]') return false
        }
        return true
    })
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('ALL') // 'ALL' | 'UNREAD' | 'IN_PROGRESS' | 'RESOLVED'
    const [activeInquiry, setActiveInquiry] = useState(null)
    const [adminNotesInput, setAdminNotesInput] = useState('')
    const [savingNotes, setSavingNotes] = useState(false)
    const [isEmailMenuOpen, setIsEmailMenuOpen] = useState(false)
    const emailMenuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (emailMenuRef.current && !emailMenuRef.current.contains(event.target)) {
                setIsEmailMenuOpen(false)
            }
        }
        if (isEmailMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isEmailMenuOpen])

    const handleCall = (phone) => {
        if (!phone) {
            toast.error('No phone number provided')
            return
        }
        const clean = phone.replace(/[^0-9]/g, '')
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(phone)
        }
        toast.success(`Copied phone: ${phone} (Dialing...)`)
        window.location.href = `tel:${clean || phone}`
    }

    const handleWhatsApp = (phone, inquiry) => {
        const raw = (phone || '').replace(/[^0-9]/g, '')
        if (!raw) {
            toast.error('No phone number available for WhatsApp')
            return
        }
        const wa = raw.startsWith('880') ? raw : raw.startsWith('0') ? `880${raw.slice(1)}` : raw
        const text = `Hello ${inquiry?.name || 'Customer'}, thank you for contacting UK Brand Lover regarding your inquiry "${inquiry?.subject || 'Support'}". How can we assist you today?`
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank')
    }

    const handleOpenGmail = (inquiry) => {
        if (!inquiry?.email) {
            toast.error('No email address provided')
            return
        }
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(inquiry.email)
        }
        const subject = `Re: ${inquiry.subject || 'Inquiry'} - UK Brand Lover`
        const body = `Dear ${inquiry.name || 'Valued Customer'},\n\nThank you for reaching out to UK Brand Lover regarding your inquiry:\n"${inquiry.message}"\n\nKind regards,\nUK Brand Lover Support Team\nhttps://ukbrandlover.vercel.app`
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inquiry.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

        window.open(gmailUrl, '_blank')
        toast.success(`Opening Gmail for ${inquiry.email} (Email copied!)`)
    }

    const handleOpenMailApp = (inquiry) => {
        if (!inquiry?.email) {
            toast.error('No email address provided')
            return
        }
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(inquiry.email)
        }
        const subject = `Re: ${inquiry.subject || 'Inquiry'} - UK Brand Lover`
        const body = `Dear ${inquiry.name || 'Valued Customer'},\n\nThank you for reaching out to UK Brand Lover regarding your inquiry:\n"${inquiry.message}"\n\nKind regards,\nUK Brand Lover Support Team\nhttps://ukbrandlover.vercel.app`
        const mailtoUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

        window.location.href = mailtoUrl
        toast.success(`Launching mail app for ${inquiry.email}`)
    }

    const handleCopyEmail = (email) => {
        if (!email) return
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(email)
        }
        toast.success(`Copied email: ${email}`)
    }

    const fetchInquiries = async (isBackground = false) => {
        try {
            if (!isBackground && inquiries.length === 0) setLoading(true)
            const params = new URLSearchParams()
            if (selectedStatus !== 'ALL') params.set('status', selectedStatus)
            if (searchQuery.trim()) params.set('search', searchQuery.trim())

            const res = await fetch(`/api/admin/inquiries?${params.toString()}`)
            const data = await res.json()
            if (data.success && Array.isArray(data.inquiries)) {
                setInquiries(data.inquiries)
                if (data.stats) setStats(data.stats)
                if (typeof window !== 'undefined' && selectedStatus === 'ALL' && !searchQuery.trim()) {
                    try {
                        localStorage.setItem('ukbl_cached_admin_inquiries', JSON.stringify(data.inquiries))
                        if (data.stats) localStorage.setItem('ukbl_cached_admin_inquiries_stats', JSON.stringify(data.stats))
                    } catch {}
                }
            } else {
                if (!isBackground) setInquiries([])
            }
        } catch (error) {
            console.error('Error fetching inquiries:', error)
            if (!isBackground) toast.error('Failed to load inquiries')
        } finally {
            if (!isBackground) setLoading(false)
        }
    }

    useEffect(() => {
        fetchInquiries()

        // Background auto-polling every 8 seconds for real-time live updates
        const interval = setInterval(() => {
            fetchInquiries(true)
        }, 8000)

        const onFocus = () => fetchInquiries(true)
        const onStorage = (e) => {
            if (e.key === 'ukbl_inquiry_sync') {
                fetchInquiries(true)
            }
        }
        const onCustomSync = () => fetchInquiries(true)

        window.addEventListener('focus', onFocus)
        window.addEventListener('storage', onStorage)
        window.addEventListener('ukbl_inquiry_updated', onCustomSync)
        window.addEventListener('inquiries-updated', onCustomSync)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', onFocus)
            window.removeEventListener('storage', onStorage)
            window.removeEventListener('ukbl_inquiry_updated', onCustomSync)
            window.removeEventListener('inquiries-updated', onCustomSync)
        }
    }, [selectedStatus, searchQuery])

    // Update inquiry status
    const handleUpdateStatus = async (inquiryId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Inquiry marked as ${newStatus}`)
                setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
                if (activeInquiry && activeInquiry.id === inquiryId) {
                    setActiveInquiry(prev => ({ ...prev, status: newStatus }))
                }
                // Refresh stats
                setStats(prev => ({
                    ...prev,
                    unread: newStatus === 'UNREAD' ? prev.unread + 1 : Math.max(0, prev.unread - 1),
                    resolved: newStatus === 'RESOLVED' ? prev.resolved + 1 : prev.resolved
                }))
                broadcastStoreChange('inquiries', { inquiryId, status: newStatus })
            } else {
                toast.error(data.message || 'Failed to update status')
            }
        } catch (err) {
            toast.error('Failed to update inquiry status')
        }
    }

    // Save admin notes
    const handleSaveAdminNotes = async (inquiryId) => {
        setSavingNotes(true)
        try {
            const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: adminNotesInput })
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Admin notes saved successfully!')
                setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, adminNotes: adminNotesInput } : inq))
                if (activeInquiry) {
                    setActiveInquiry(prev => ({ ...prev, adminNotes: adminNotesInput }))
                }
            } else {
                toast.error(data.message || 'Failed to save notes')
            }
        } catch (err) {
            toast.error('Failed to save notes')
        } finally {
            setSavingNotes(false)
        }
    }

    // Delete inquiry
    const handleDeleteInquiry = async (inquiryId) => {
        if (!confirm('Are you sure you want to delete this customer inquiry?')) return
        try {
            const res = await fetch(`/api/admin/inquiries/${inquiryId}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                toast.success('Inquiry deleted successfully')
                setInquiries(prev => prev.filter(i => i.id !== inquiryId))
                if (activeInquiry?.id === inquiryId) setActiveInquiry(null)
                broadcastStoreChange('inquiries', { inquiryId, deleted: true })
            } else {
                toast.error(data.message || 'Failed to delete inquiry')
            }
        } catch (err) {
            toast.error('Failed to delete inquiry')
        }
    }

    const filteredInquiries = useMemo(() => {
        if (!searchQuery.trim()) return inquiries
        const q = searchQuery.toLowerCase().trim()
        return inquiries.filter(i =>
            (i.name || '').toLowerCase().includes(q) ||
            (i.email || '').toLowerCase().includes(q) ||
            (i.phone || '').toLowerCase().includes(q) ||
            (i.subject || '').toLowerCase().includes(q) ||
            (i.message || '').toLowerCase().includes(q) ||
            (i.user?.name || '').toLowerCase().includes(q) ||
            (i.user?.email || '').toLowerCase().includes(q)
        )
    }, [inquiries, searchQuery])

    if (loading && inquiries.length === 0) return <Loading />

    return (
        <div className="space-y-6 pb-24 text-slate-800">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#241224] tracking-tight flex items-center gap-2">
                        <span>Customer</span>
                        <span className="text-[#6C306E]">Inquiries & Messages</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Review, track, and directly resolve authenticated customer inquiries submitted via the Contact page
                    </p>
                </div>

                <button
                    onClick={() => fetchInquiries(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#EFE0EF] hover:bg-[#FAF6FA] text-xs font-bold text-slate-700 shadow-2xs transition self-start sm:self-auto cursor-pointer"
                >
                    <span>Refresh Inquiries</span>
                </button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Total Inquiries
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#241224]">
                        {stats.total.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white border border-rose-200 bg-rose-50/20 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">
                        Unread / New
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-rose-600">
                        {stats.unread.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white border border-purple-200 bg-purple-50/20 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-[#6C306E] uppercase tracking-wider block mb-1">
                        In Progress
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#6C306E]">
                        {stats.inProgress.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white border border-emerald-200 bg-emerald-50/20 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                        Resolved
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600">
                        {stats.resolved.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#EFE0EF] p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
                {/* Search */}
                <div className="relative flex-1">
                    <SearchIcon size={16} color="#94a3b8" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by customer name, email, phone, subject, or message content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#FAF6FA]/70 border border-[#EFE0EF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#241224] focus:border-[#6C306E] focus:bg-white outline-none transition placeholder:text-slate-400"
                    />
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex bg-[#FAF6FA] border border-[#EFE0EF] p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto overflow-x-auto">
                    {[
                        { label: 'All', value: 'ALL' },
                        { label: 'Unread', value: 'UNREAD' },
                        { label: 'In Progress', value: 'IN_PROGRESS' },
                        { label: 'Resolved', value: 'RESOLVED' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setSelectedStatus(tab.value)}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${selectedStatus === tab.value
                                ? 'bg-[#6C306E] text-white shadow-xs'
                                : 'text-slate-600 hover:text-[#6C306E]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inquiries Table / List */}
            <div className="bg-white border border-[#EFE0EF] rounded-3xl overflow-hidden shadow-2xs">
                {filteredInquiries.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="size-16 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mx-auto mb-3">
                            <MailIcon size={28} color="#6C306E" />
                        </div>
                        <h3 className="text-base font-bold text-[#241224]">No customer inquiries found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {searchQuery ? 'No inquiries matched your search criteria.' : 'No customer inquiries in this status category.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px] pb-32">
                        <table className="w-full min-w-[720px] text-left text-xs">
                            <thead className="bg-[#FAF6FA] text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#EFE0EF]">
                                <tr>
                                    <th className="py-3.5 px-4">Customer Account</th>
                                    <th className="py-3.5 px-4">Inquiry Subject & Message</th>
                                    <th className="py-3.5 px-4">Submitted</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EFE0EF]/60">
                                {filteredInquiries.map((inq) => {
                                    const senderCleanPhone = (inq.phone || inq.user?.phone || '').replace(/[^0-9]/g, '');
                                    const waNumber = senderCleanPhone.startsWith('880')
                                        ? senderCleanPhone
                                        : senderCleanPhone.startsWith('0')
                                            ? `880${senderCleanPhone.slice(1)}`
                                            : senderCleanPhone;

                                    return (
                                        <tr
                                            key={inq.id}
                                            className={`hover:bg-[#FAF6FA]/60 transition-colors ${inq.status === 'UNREAD' ? 'bg-amber-50/20 font-medium' : ''
                                                }`}
                                        >
                                            {/* Customer Account Details */}
                                            <td className="py-4 px-4 align-top">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="size-9 rounded-xl bg-[#6C306E]/10 border border-[#6C306E]/20 text-[#6C306E] font-black flex items-center justify-center shrink-0">
                                                        {(inq.name || inq.user?.name || 'C')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#241224] text-xs flex items-center gap-1.5">
                                                            <span>{inq.name || inq.user?.name || 'Customer'}</span>
                                                            {inq.user?.role === 'ADMIN' && (
                                                                <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black">ADMIN</span>
                                                            )}
                                                        </div>
                                                        <a href={`mailto:${inq.email}`} className="text-slate-500 hover:text-[#6C306E] text-[11px] block mt-0.5">
                                                            {inq.email}
                                                        </a>
                                                        {inq.phone && (
                                                            <a href={`tel:${inq.phone}`} className="text-slate-500 hover:text-[#6C306E] text-[11px] block">
                                                                {inq.phone}
                                                            </a>
                                                        )}
                                                        {inq.user ? (
                                                            <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                                Registered Account ({inq.user._count?.orders || 0} orders)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block mt-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                                Guest Account
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Subject & Message Content */}
                                            <td className="py-4 px-4 align-top max-w-sm">
                                                <div className="font-bold text-[#241224] text-xs">
                                                    {inq.subject}
                                                </div>
                                                <p className="text-slate-600 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                                                    {inq.message}
                                                </p>
                                                {inq.adminNotes && (
                                                    <div className="mt-1.5 text-[10px] text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md inline-block">
                                                        Note: {inq.adminNotes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Date / Time */}
                                            <td className="py-4 px-4 align-top whitespace-nowrap text-slate-500 text-[11px]">
                                                <div>{new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Status Selector Dropdown */}
                                            <td className="py-4 px-4 align-top whitespace-nowrap">
                                                <AdminDropdown
                                                    value={inq.status}
                                                    onChange={(newStatus) => handleUpdateStatus(inq.id, newStatus)}
                                                    options={INQUIRY_STATUS_OPTIONS}
                                                    className="w-[140px]"
                                                    align="right"
                                                />
                                            </td>

                                            {/* Quick Actions */}
                                            <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* WhatsApp Contact */}
                                                    {waNumber && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleWhatsApp(waNumber, inq)}
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition cursor-pointer"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <WhatsAppIcon size={16} />
                                                        </button>
                                                    )}

                                                    {/* Email Contact */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenGmail(inq)}
                                                        className="p-1.5 rounded-lg text-[#6C306E] hover:bg-[#FAF6FA] border border-transparent hover:border-[#EFE0EF] transition cursor-pointer"
                                                        title="Reply via Gmail Web (Copies email to clipboard)"
                                                    >
                                                        <MailIcon size={16} color="#6C306E" />
                                                    </button>

                                                    {/* View Modal */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveInquiry(inq)
                                                            setAdminNotesInput(inq.adminNotes || '')
                                                        }}
                                                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#6C306E] hover:bg-[#521C54] text-white shadow-2xs transition cursor-pointer"
                                                    >
                                                        View
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteInquiry(inq.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                        title="Delete Inquiry"
                                                    >
                                                        <TrashIcon size={15} color="currentColor" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Inquiry Details Modal */}
            {activeInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-xl bg-white border border-[#EFE0EF] rounded-3xl shadow-2xl p-6 sm:p-7 text-[#241224] my-6">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setActiveInquiry(null)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <CloseIcon size={16} />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="size-12 rounded-2xl bg-[#6C306E]/10 border border-[#6C306E]/20 text-[#6C306E] font-black flex items-center justify-center text-lg">
                                {(activeInquiry.name || 'C')[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[#241224]">{activeInquiry.name}</h3>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyEmail(activeInquiry.email)}
                                        className="hover:text-[#6C306E] hover:underline cursor-pointer transition"
                                        title="Click to copy email"
                                    >
                                        {activeInquiry.email}
                                    </button>
                                    {activeInquiry.phone && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard?.writeText(activeInquiry.phone);
                                                    toast.success(`Copied phone: ${activeInquiry.phone}`);
                                                }}
                                                className="hover:text-[#6C306E] hover:underline cursor-pointer transition font-mono"
                                                title="Click to copy phone"
                                            >
                                                {activeInquiry.phone}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Verification Details */}
                        <div className="p-3.5 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl mb-4 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-semibold">Sender Account:</span>
                                {activeInquiry.user ? (
                                    <span className="font-bold text-[#6C306E] flex items-center gap-1">
                                        <CheckIcon size={12} color="#059669" />
                                        Verified Registered User
                                    </span>
                                ) : (
                                    <span className="text-slate-400 font-semibold">Unregistered Guest</span>
                                )}
                            </div>
                            {activeInquiry.user && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Account ID:</span>
                                        <span className="font-mono text-[10px] text-slate-600">{activeInquiry.user.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Total Orders Placed:</span>
                                        <span className="font-bold text-[#241224]">{activeInquiry.user._count?.orders || 0} orders</span>
                                    </div>
                                </>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Submitted At:</span>
                                <span className="font-semibold text-slate-700">
                                    {new Date(activeInquiry.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Subject & Full Message Body */}
                        <div className="space-y-3 mb-5">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                                <h4 className="text-sm font-bold text-[#241224] mt-0.5">{activeInquiry.subject}</h4>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Content</span>
                                <div className="mt-1 p-4 rounded-2xl bg-[#FAF6FA]/80 border border-[#EFE0EF] text-xs leading-relaxed text-[#241224] whitespace-pre-wrap">
                                    {activeInquiry.message}
                                </div>
                            </div>
                        </div>

                        {/* Admin Internal Notes */}
                        <div className="space-y-2 mb-5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Internal Admin Notes (Staff only)
                            </label>
                            <textarea
                                rows={2}
                                value={adminNotesInput}
                                onChange={(e) => setAdminNotesInput(e.target.value)}
                                placeholder="Add private notes, callback details, or resolution history..."
                                className="w-full text-xs p-3 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] focus:bg-white focus:border-[#6C306E] outline-none text-[#241224]"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    disabled={savingNotes}
                                    onClick={() => handleSaveAdminNotes(activeInquiry.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#6C306E] hover:bg-[#521C54] text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
                                >
                                    {savingNotes ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>
                        </div>

                        {/* Contact Action Shortcuts */}
                        <div className="border-t border-[#EFE0EF] pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-500">Status:</span>
                                <AdminDropdown
                                    value={activeInquiry.status}
                                    onChange={(newStatus) => handleUpdateStatus(activeInquiry.id, newStatus)}
                                    options={INQUIRY_STATUS_OPTIONS}
                                    className="w-[140px]"
                                    direction="up"
                                    align="left"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Call Button */}
                                {activeInquiry.phone && (
                                    <button
                                        type="button"
                                        onClick={() => handleCall(activeInquiry.phone)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6FA] border border-[#EFE0EF] hover:border-[#6C306E]/40 text-slate-700 hover:text-[#6C306E] font-bold transition cursor-pointer shadow-2xs"
                                        title="Dial phone number (Also copies to clipboard)"
                                    >
                                        <PhoneIcon size={14} color="#6C306E" />
                                        <span>Call</span>
                                    </button>
                                )}

                                {/* WhatsApp Button */}
                                {activeInquiry.phone && (
                                    <button
                                        type="button"
                                        onClick={() => handleWhatsApp(activeInquiry.phone, activeInquiry)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold transition cursor-pointer shadow-2xs"
                                        title="Chat on WhatsApp"
                                    >
                                        <WhatsAppIcon size={14} color="#059669" />
                                        <span>WhatsApp</span>
                                    </button>
                                )}

                                {/* Reply Email Dropdown Menu */}
                                <div className="relative" ref={emailMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEmailMenuOpen(!isEmailMenuOpen)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6C306E] hover:bg-[#521C54] text-white font-bold transition cursor-pointer shadow-xs"
                                    >
                                        <MailIcon size={14} color="#FFFFFF" />
                                        <span>Reply Email</span>
                                        <svg
                                            className={`size-3 text-white/80 transition-transform duration-200 ${isEmailMenuOpen ? 'rotate-180' : ''}`}
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M2.5 4.5L6 8L9.5 4.5" />
                                        </svg>
                                    </button>

                                    {isEmailMenuOpen && (
                                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-[#EFE0EF] rounded-2xl shadow-2xl p-1.5 z-50 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleOpenGmail(activeInquiry)
                                                    setIsEmailMenuOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF6FA] text-slate-700 hover:text-[#6C306E] font-medium transition text-left cursor-pointer"
                                            >
                                                <div className="size-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    G
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[#241224] text-xs">Open in Gmail</p>
                                                    <p className="text-[10px] text-slate-400">Web browser compose (Recommended)</p>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleOpenMailApp(activeInquiry)
                                                    setIsEmailMenuOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#FAF6FA] text-slate-700 hover:text-[#6C306E] font-medium transition text-left cursor-pointer"
                                            >
                                                <div className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <MailIcon size={12} color="#2563EB" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[#241224] text-xs">Default Mail App</p>
                                                    <p className="text-[10px] text-slate-400">Outlook, Apple Mail, etc.</p>
                                                </div>
                                            </button>

                                            <div className="border-t border-[#EFE0EF] my-1"></div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleCopyEmail(activeInquiry.email)
                                                    setIsEmailMenuOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF6FA] text-slate-700 hover:text-[#6C306E] font-medium transition text-left cursor-pointer"
                                            >
                                                <div className="size-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                    <CheckIcon size={12} color="#059669" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[#241224] text-xs">Copy Email Address</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{activeInquiry.email}</p>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

