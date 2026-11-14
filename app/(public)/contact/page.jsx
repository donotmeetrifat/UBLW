'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    OfficialWhatsAppIcon,
    OfficialFacebookIcon,
    OfficialInstagramIcon,
    MapPinIcon, 
    ArrowRightIcon,
    CheckIcon,
    LockIcon,
    UserIcon,
    MailIcon,
    PhoneIcon,
    ShieldCheckIcon
} from '@/components/icons'
import { FlowButton } from '@/components/ui/flow-button'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { SOCIAL_LINKS } from '@/lib/constants/social'
import { isClientSignedIn, requireSignIn } from '@/lib/clientAuth'
import { broadcastStoreChange } from '@/lib/realtimeSync'

const contactChannels = [
    {
        title: 'WhatsApp',
        description: 'Direct chat for order assistance and shade advice.',
        buttonText: 'Chat on WhatsApp',
        href: SOCIAL_LINKS.whatsapp.url,
        icon: OfficialWhatsAppIcon,
        ariaLabel: 'Chat with UK Brand Lover on WhatsApp',
    },
    {
        title: 'Facebook',
        description: 'Latest UK beauty arrivals, community, and offers.',
        buttonText: 'Visit Facebook',
        href: SOCIAL_LINKS.facebook.url,
        icon: OfficialFacebookIcon,
        ariaLabel: 'Message UK Brand Lover on Facebook',
    },
    {
        title: 'Instagram',
        description: 'Product swatches, London hauls, and tutorials.',
        buttonText: 'Follow on Instagram',
        href: SOCIAL_LINKS.instagram.url,
        icon: OfficialInstagramIcon,
        ariaLabel: 'Follow UK Brand Lover on Instagram',
    },
]

const businessDetails = [
    ['LOCATION', SOCIAL_LINKS.contact.location],
    ['HOTLINE', SOCIAL_LINKS.contact.phone],
    ['EMAIL', SOCIAL_LINKS.contact.email],
    ['HOURS', SOCIAL_LINKS.contact.hours],
]

export default function ContactPage() {
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Verify authentication status and prefill verified account data
    useEffect(() => {
        const checkAuth = () => {
            const signedIn = isClientSignedIn()
            setIsSignedIn(signedIn)

            if (typeof window !== 'undefined') {
                try {
                    const saved = localStorage.getItem('ukbl_current_user')
                    if (saved) {
                        const parsed = JSON.parse(saved)
                        setCurrentUser(parsed)
                        if (parsed.name) setName(parsed.name)
                        if (parsed.email) setEmail(parsed.email)
                        if (parsed.phone) setPhone(parsed.phone)
                    }
                } catch (e) {
                    console.error('Error loading current user:', e)
                }
            }
        }

        checkAuth()
        window.addEventListener('auth-change', checkAuth)
        window.addEventListener('storage', checkAuth)
        return () => {
            window.removeEventListener('auth-change', checkAuth)
            window.removeEventListener('storage', checkAuth)
        }
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!isClientSignedIn()) {
            requireSignIn('Please sign in to send an inquiry message to UK Brand Lover.')
            return
        }

        if (!subject.trim()) {
            setErrorMessage('Please provide a subject for your inquiry.')
            return
        }

        if (!message.trim() || message.trim().length < 5) {
            setErrorMessage('Please enter your inquiry message (at least 5 characters).')
            return
        }

        setSubmitting(true)

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    subject: subject.trim(),
                    message: message.trim(),
                })
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                if (res.status === 401) {
                    requireSignIn('Your session expired. Please sign in again to submit your inquiry.')
                    return
                }
                setErrorMessage(data.message || 'Unable to submit inquiry. Please try again.')
                return
            }

            toast.success('Inquiry submitted! Our team will get in touch with you shortly.')
            setSuccessMessage(data.message || 'Thank you! Your message has been sent to our team.')
            setSubject('')
            setMessage('')
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem('ukbl_inquiry_sync', Date.now().toString())
                    window.dispatchEvent(new Event('ukbl_inquiry_updated'))
                } catch (e) {
                    // Ignore localStorage error
                }
                broadcastStoreChange('inquiries', { inquiry: data.inquiry })
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error)
            setErrorMessage('Network error. Please check your connection and try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="bg-white min-h-[75vh] font-poppins selection:bg-[#6C306E] selection:text-white">
            <section className="mx-4 sm:mx-6 lg:mx-8">
                <div className="max-w-6xl mx-auto py-14 sm:py-20 lg:py-24">
                    {/* Clean Spacious Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center max-w-2xl mx-auto mb-14 sm:mb-18"
                    >
                        <div className="flex items-center justify-center mb-3">
                            <span className="text-[11px] font-bold text-[#6C306E] tracking-widest uppercase">
                                WE ARE HERE TO HELP
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#241224] tracking-tight">
                            Get in Touch with Us
                        </h1>
                        <p className="mt-3.5 text-xs sm:text-sm text-slate-500 font-normal max-w-lg mx-auto leading-relaxed">
                            Have a question about our authentic UK imported products, order tracking, or shades? We are here to assist you.
                        </p>
                    </motion.div>

                    {/* Three Contact Cards with Generous White Space */}
                    <div className="grid max-w-5xl mx-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {contactChannels.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: idx * 0.1 }}
                                className="flex flex-col justify-between rounded-3xl border border-[#EFE0EF] bg-white p-7 sm:p-8 shadow-2xs hover:shadow-[0_12px_36px_rgba(58,12,56,0.06)] hover:border-[#6C306E]/40 transition-all"
                            >
                                <div>
                                    <div className="flex size-13 items-center justify-center rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-2xs">
                                        <item.icon size={28} />
                                    </div>
                                    <h2 className="mt-5 text-base font-bold text-[#241224]">
                                        {item.title}
                                    </h2>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-2">
                                    <FlowButton 
                                        text={item.buttonText} 
                                        href={item.href} 
                                        className="w-full text-xs" 
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Clean Form & Business Details */}
                    <div className="mt-16 sm:mt-20 grid max-w-5xl mx-auto gap-8 lg:gap-10 lg:grid-cols-[1.3fr_0.7fr]">
                        {/* Direct Inquiry Section */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-3xl border border-[#EFE0EF] bg-white p-7 sm:p-10 shadow-[0_4px_24px_rgba(58,12,56,0.03)]" 
                            aria-labelledby="contact-form-title"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">
                                DIRECT INQUIRY
                            </p>
                            <h2 id="contact-form-title" className="mt-1 text-2xl font-bold text-[#241224]">
                                Send Us a Message
                            </h2>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                Submit your inquiry and our team will get back to you shortly.
                            </p>

                            {/* SIGNED-IN USER FORM */}
                            {isSignedIn ? (
                                <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                                    {/* Account Connection Pill */}
                                    <div className="p-3 bg-[#FAF6FA] border border-[#EFE0EF] rounded-2xl flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-[#6C306E]/10 text-[#6C306E] flex items-center justify-center font-bold text-[10px]">
                                                {(currentUser?.name || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#241224]">
                                                    {currentUser?.name || 'Customer Account'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">
                                                    ({currentUser?.email || email})
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Success & Error Banners */}
                                    <AnimatePresence>
                                        {errorMessage && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -4 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -4 }}
                                                className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold text-xs flex items-center gap-2"
                                            >
                                                <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                                                <span>{errorMessage}</span>
                                            </motion.div>
                                        )}

                                        {successMessage && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -4 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -4 }}
                                                className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold text-xs flex items-center gap-2"
                                            >
                                                <CheckIcon size={14} color="#059669" />
                                                <span>{successMessage}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Name & Email Fields */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block font-bold text-[#241224] mb-1.5">
                                                Your Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                required 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full h-8.5 sm:h-9 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] px-3.5 py-1.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400 font-medium" 
                                                placeholder="Enter your name" 
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-[#241224] mb-1.5">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                required 
                                                type="email" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-8.5 sm:h-9 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] px-3.5 py-1.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400 font-medium" 
                                                placeholder="you@example.com" 
                                            />
                                        </div>
                                    </div>

                                    {/* Phone & Subject Fields */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block font-bold text-[#241224] mb-1.5">
                                                Contact Phone / WhatsApp
                                            </label>
                                            <input 
                                                type="tel" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full h-8.5 sm:h-9 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] px-3.5 py-1.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400 font-medium" 
                                                placeholder="01XXXXXXXXX" 
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-[#241224] mb-1.5">
                                                Inquiry Subject <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                required 
                                                type="text" 
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full h-8.5 sm:h-9 rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] px-3.5 py-1.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400 font-medium" 
                                                placeholder="e.g. Order Tracking, Shade Advice, Authenticity" 
                                            />
                                        </div>
                                    </div>

                                    {/* Message Textarea */}
                                    <div>
                                        <label className="block font-bold text-[#241224] mb-1.5">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea 
                                            required 
                                            rows={3} 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full resize-none rounded-xl border border-[#EFE0EF] bg-[#FAF6FA] p-3 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400 font-medium min-h-[80px]" 
                                            placeholder="Write your message here... Please include order number if applicable." 
                                        />
                                    </div>

                                    {/* Submit Action */}
                                    <div className="pt-2">
                                        <motion.button 
                                            whileHover={{ scale: 1.015, y: -1 }}
                                            whileTap={{ scale: 0.985 }}
                                            disabled={submitting}
                                            type="submit" 
                                            className="group relative overflow-hidden bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white inline-flex items-center justify-center gap-2.5 rounded-full px-9 py-3.5 text-xs font-bold transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[0_12px_28px_rgba(108,48,110,0.55)] cursor-pointer border border-white/20 shimmer-active disabled:opacity-60"
                                        >
                                            <span className="tracking-wide">
                                                {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry Message'}
                                            </span>
                                            {!submitting && (
                                                <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            ) : (
                                /* SIGN-IN REQUIRED PROMPT FOR UNAUTHENTICATED VISITORS */
                                <div className="mt-8 text-center p-8 bg-[#FAF6FA] border border-[#EFE0EF] rounded-3xl">
                                    <div className="size-16 rounded-2xl bg-white border border-[#EFE0EF] flex items-center justify-center text-[#6C306E] mx-auto mb-4 shadow-2xs">
                                        <LockIcon size={28} color="#6C306E" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-extrabold text-[#241224]">
                                        Sign In Required to Submit Inquiries
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                                        To protect customer communications and ensure our staff can directly trace and resolve inquiries with your account, please sign in before sending a message.
                                    </p>

                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => requireSignIn('Please sign in to submit an inquiry message.')}
                                            className="group relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] text-white px-7 py-3 rounded-full text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
                                        >
                                            <UserIcon size={14} color="#FFFFFF" />
                                            <span>Sign In to Send Message</span>
                                            <ArrowRightIcon size={12} color="#FFFFFF" className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <Link 
                                            href="/signup" 
                                            className="text-xs font-bold text-[#6C306E] hover:underline px-4 py-2"
                                        >
                                            Create an Account
                                        </Link>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-[#EFE0EF] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                                        <ShieldCheckIcon size={13} color="#059669" />
                                        <span>Instant WhatsApp assistance is also available above</span>
                                    </div>
                                </div>
                            )}
                        </motion.section>

                        {/* UK Brand Lover HQ Business Details */}
                        <aside className="rounded-3xl border border-[#EFE0EF] bg-[#FAF6FA] p-7 sm:p-9 flex flex-col justify-between" aria-label="Business contact details">
                            <div>
                                <div className="flex size-13 items-center justify-center rounded-2xl bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]">
                                    <MapPinIcon size={22} color="#6C306E" />
                                </div>
                                <h2 className="mt-5 text-xl font-bold text-[#241224]">
                                    UK Brand Lover HQ
                                </h2>
                                <div className="mt-6 space-y-4 text-xs">
                                    {businessDetails.map(([label, value]) => (
                                        <div key={label} className="border-b border-[#EFE0EF] pb-3.5 last:border-b-0 last:pb-0">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">
                                                {label}
                                            </p>
                                            <p className="mt-1 font-semibold text-[#241224]">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-4">
                                <Link 
                                    href="/shop" 
                                    className="w-full inline-flex justify-center items-center gap-2 rounded-full border border-[#EFE0EF] bg-white text-[#6C306E] hover:bg-[#6C306E] hover:text-white px-6 py-3.5 text-xs font-bold transition shadow-2xs"
                                >
                                    <span>Browse Catalog</span>
                                    <ArrowRightIcon size={14} color="currentColor" />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    )
}
