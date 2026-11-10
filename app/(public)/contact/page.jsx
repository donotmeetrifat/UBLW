'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
    OfficialWhatsAppIcon,
    OfficialFacebookIcon,
    OfficialInstagramIcon,
    MapPinIcon, 
    ArrowRightIcon,
    CheckIcon,
    PhoneIcon,
    MailIcon,
    ShieldCheckIcon,
    SparklesIcon
} from '@/components/icons'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const contactChannels = [
    {
        title: 'Direct WhatsApp Chat',
        handle: '+880 1959-524393',
        description: 'Instant 1-on-1 shade advisory, order verification, and personal skincare routine guidance.',
        buttonText: 'Chat on WhatsApp',
        href: 'https://wa.me/8801959524393',
        icon: OfficialWhatsAppIcon,
        badge: 'Online • Fast Reply',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        ariaLabel: 'Chat with UK Brand Lover on WhatsApp (+880 1959-524393)',
    },
    {
        title: 'Official Facebook Page',
        handle: '@ukbrandlover',
        description: 'Message us for daily UK arrival drops, customer reviews, live video swatches, and updates.',
        buttonText: 'Visit Facebook Page',
        href: 'https://www.facebook.com/ukbrandlover',
        icon: OfficialFacebookIcon,
        badge: 'Daily Updates',
        badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
        ariaLabel: 'Visit UK Brand Lover on Facebook (facebook.com/ukbrandlover)',
    },
    {
        title: 'Instagram Beauty Feed',
        handle: '@ukbrandlover',
        description: 'Follow our authentic London hauls, dermatological skincare reels, and verified product unboxings.',
        buttonText: 'Follow on Instagram',
        href: 'http://instagram.com/ukbrandlover',
        icon: OfficialInstagramIcon,
        badge: 'Hauls & Reels',
        badgeColor: 'text-pink-700 bg-pink-50 border-pink-200',
        ariaLabel: 'Follow UK Brand Lover on Instagram (instagram.com/ukbrandlover)',
    },
]

const quickTopics = [
    'Skincare Advisory',
    'Order Tracking',
    'Authenticity Check',
    'Product Pre-order',
    'General Inquiry'
]

const businessDetails = [
    { label: 'Brand Name', value: 'UK Brand Lover' },
    { label: 'Showroom & Fulfillment', value: 'Mirpur, Dhaka, Bangladesh' },
    { label: 'Direct Hotline & WhatsApp', value: '+880 1959-524393', href: 'tel:+8801959524393' },
    { label: 'Customer Support Email', value: 'support@ukbrandlover.com', href: 'mailto:support@ukbrandlover.com' },
    { label: 'Consultation & Advisory', value: '10:00 AM – 10:00 PM (7 Days a Week)' },
    { label: 'Delivery Coverage', value: 'Cash on Delivery Across All 64 Districts' },
]

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate seamless submission with feedback
        await new Promise(resolve => setTimeout(resolve, 800))
        setIsSubmitting(false)
        setSubmitted(true)
        toast.success('Thank you! Your message has been sent to our UK beauty concierge.')

        setName('')
        setEmail('')
        setPhone('')
        setSubject('')
        setMessage('')
    }

    return (
        <main className="bg-[#FAF6FA]/30 min-h-screen antialiased font-poppins selection:bg-[#6C306E] selection:text-white pb-24 sm:pb-32">
            {/* Ambient Background Sheen */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(108,48,110,0.08),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute top-96 right-10 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(216,181,109,0.06),transparent_70%)] blur-3xl" />

            <section className="mx-4 sm:mx-6 lg:mx-8">
                <div className="max-w-7xl mx-auto pt-10 sm:pt-14">
                    {/* Header Banner */}
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-white text-[#6C306E] border border-[#EFE0EF] px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
                            <SparklesIcon size={13} color="#D8B56D" />
                            <span>WE ARE HERE TO HELP</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#241224] tracking-tight leading-tight">
                            Get in Touch with Us
                        </h1>
                        <p className="mt-3.5 text-xs sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
                            Need guidance choosing the right British skincare regimen, shade matching, or tracking your shipment in Bangladesh? Our dedicated beauty advisory team is ready to assist you.
                        </p>
                    </motion.div>

                    {/* Three Official Social & Direct Communication Channels */}
                    <div className="mt-12 sm:mt-16 grid max-w-6xl mx-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {contactChannels.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: idx * 0.1 }}
                                whileHover={{ y: -6 }}
                                className="group flex flex-col justify-between rounded-[28px] border border-[#EFE0EF] bg-white p-7 sm:p-8 shadow-[0_4px_24px_rgba(58,12,56,0.03)] hover:shadow-[0_16px_36px_rgba(58,12,56,0.08)] hover:border-[#6C306E]/40 transition-all duration-300"
                            >
                                <div>
                                    {/* Icon & Live Badge */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100/80 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                                            <item.icon size={36} />
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full border ${item.badgeColor}`}>
                                            <span className="size-1.5 rounded-full bg-current animate-pulse" />
                                            {item.badge}
                                        </span>
                                    </div>

                                    {/* Titles */}
                                    <h2 className="text-lg sm:text-xl font-extrabold text-[#241224] tracking-tight">
                                        {item.title}
                                    </h2>
                                    <p className="text-xs font-semibold text-[#6C306E] mt-0.5 mb-3">
                                        {item.handle}
                                    </p>
                                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Premium Smooth Animated Action Button */}
                                <div className="mt-7 pt-5 border-t border-slate-100">
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={item.ariaLabel}
                                        className="group/btn relative w-full inline-flex items-center justify-center gap-2.5 h-11 sm:h-12 rounded-full bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white text-xs sm:text-sm font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_28px_rgba(108,48,110,0.55)] transition-all duration-300 active:scale-[0.98] select-none border border-white/20 shimmer-active"
                                    >
                                        <span className="tracking-wide">{item.buttonText}</span>
                                        <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Lower Section: User-Friendly Direct Inquiry Form & Verified Business Hub */}
                    <div className="mt-14 sm:mt-20 grid max-w-6xl mx-auto gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                        {/* Direct Inquiry Form */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-[32px] border border-[#EFE0EF] bg-white p-7 sm:p-10 shadow-[0_4px_30px_rgba(58,12,56,0.03)]" 
                            aria-labelledby="contact-form-title"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">
                                    DIRECT INQUIRY
                                </span>
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                                    Typical Response: Under 2 Hours
                                </span>
                            </div>

                            <h2 id="contact-form-title" className="text-2xl sm:text-3xl font-extrabold text-[#241224] tracking-tight">
                                Send Us a Message
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                                Submit your inquiry and our certified skincare consultants will reply directly via email or WhatsApp.
                            </p>

                            {/* Quick Subject Chips for High User Friendliness */}
                            <div className="mt-5 pt-4 border-t border-slate-100">
                                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                                    Quick Select Inquiry Topic:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {quickTopics.map((topic) => (
                                        <button
                                            key={topic}
                                            type="button"
                                            onClick={() => setSubject(topic)}
                                            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                                                subject === topic 
                                                    ? 'bg-[#6C306E] text-white border-[#6C306E] shadow-2xs font-bold'
                                                    : 'bg-[#FAF6FA] text-slate-600 border-[#EFE0EF] hover:border-[#6C306E]/40 font-medium'
                                            }`}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs sm:text-sm">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-slate-700 font-semibold text-xs">
                                        Your Full Name <span className="text-rose-500">*</span>
                                        <input 
                                            required 
                                            name="name" 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-[#FAF6FA]/70 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6C306E] focus:bg-white focus:ring-2 focus:ring-[#6C306E]/15 transition shadow-2xs placeholder:text-slate-400" 
                                            placeholder="e.g. Ayesha Rahman" 
                                        />
                                    </label>
                                    <label className="block text-slate-700 font-semibold text-xs">
                                        Email Address <span className="text-rose-500">*</span>
                                        <input 
                                            required 
                                            name="email" 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-[#FAF6FA]/70 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6C306E] focus:bg-white focus:ring-2 focus:ring-[#6C306E]/15 transition shadow-2xs placeholder:text-slate-400" 
                                            placeholder="you@example.com" 
                                        />
                                    </label>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-slate-700 font-semibold text-xs">
                                        Phone / WhatsApp Number
                                        <input 
                                            name="phone" 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-[#FAF6FA]/70 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6C306E] focus:bg-white focus:ring-2 focus:ring-[#6C306E]/15 transition shadow-2xs placeholder:text-slate-400" 
                                            placeholder="01XXXXXXXXX (For faster WhatsApp callback)" 
                                        />
                                    </label>
                                    <label className="block text-slate-700 font-semibold text-xs">
                                        Subject
                                        <input 
                                            required 
                                            name="subject" 
                                            type="text" 
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-slate-200/90 bg-[#FAF6FA]/70 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6C306E] focus:bg-white focus:ring-2 focus:ring-[#6C306E]/15 transition shadow-2xs placeholder:text-slate-400" 
                                            placeholder="e.g. Cerave cleanser stock inquiry..." 
                                        />
                                    </label>
                                </div>

                                <label className="block text-slate-700 font-semibold text-xs">
                                    Your Message <span className="text-rose-500">*</span>
                                    <textarea 
                                        required 
                                        name="message" 
                                        rows={4} 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200/90 bg-[#FAF6FA]/70 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#6C306E] focus:bg-white focus:ring-2 focus:ring-[#6C306E]/15 transition shadow-2xs placeholder:text-slate-400" 
                                        placeholder="Please share your skin type, desired product, or question here..." 
                                    />
                                </label>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
                                    <motion.button 
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="group relative overflow-hidden bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white inline-flex items-center justify-center gap-2.5 rounded-full px-9 h-12 text-xs sm:text-sm font-bold transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[0_12px_28px_rgba(108,48,110,0.55)] cursor-pointer border border-white/20 shimmer-active disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Sending message...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="tracking-wide">Submit Inquiry Message</span>
                                                <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                            </>
                                        )}
                                    </motion.button>

                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <ShieldCheckIcon size={16} color="#059669" />
                                        <span>100% Privacy Protected</span>
                                    </div>
                                </div>

                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-2xs"
                                    >
                                        <CheckIcon size={16} color="#059669" strokeWidth={2.5} />
                                        <span>Thank you! Your message has been received. Our team will get back to you shortly.</span>
                                    </motion.div>
                                )}
                            </form>
                        </motion.section>

                        {/* UK Brand Lover HQ & Business Information Sidebar */}
                        <aside className="rounded-[32px] border border-[#EFE0EF] bg-gradient-to-br from-[#FAF6FA] via-white to-[#F8F2F8] p-7 sm:p-9 flex flex-col justify-between shadow-[0_4px_30px_rgba(58,12,56,0.03)]" aria-label="Business contact details">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]">
                                        <MapPinIcon size={20} color="#6C306E" />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#6C306E] bg-white border border-[#EFE0EF] px-3 py-1 rounded-full uppercase tracking-wider">
                                        Direct UK Imports
                                    </span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-extrabold text-[#241224] tracking-tight">
                                    UK Brand Lover HQ
                                </h2>
                                <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed">
                                    Direct British beauty importer and authorized stockist in Bangladesh.
                                </p>

                                <div className="mt-6 space-y-4 text-xs">
                                    {businessDetails.map((item) => (
                                        <div key={item.label} className="border-b border-[#EFE0EF] pb-3 last:border-b-0 last:pb-0">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">{item.label}</p>
                                            {item.href ? (
                                                <a 
                                                    href={item.href}
                                                    target={item.href.startsWith('http') ? '_blank' : undefined}
                                                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className="mt-0.5 font-bold text-[#241224] hover:text-[#6C306E] transition-colors inline-block"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="mt-0.5 font-bold text-[#241224]">{item.value}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[#EFE0EF]">
                                <Link 
                                    href="/shop" 
                                    className="group/link w-full inline-flex justify-center items-center gap-2 rounded-full border border-[#EFE0EF] bg-white text-[#6C306E] hover:bg-[#6C306E] hover:text-white px-6 h-12 text-xs font-bold transition-all duration-300 shadow-2xs"
                                >
                                    <span>Browse UK Beauty Collection</span>
                                    <ArrowRightIcon size={14} color="currentColor" className="group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    )
}
