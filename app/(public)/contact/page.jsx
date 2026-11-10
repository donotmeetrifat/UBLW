'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
    FacebookIcon, 
    InstagramIcon, 
    MapPinIcon, 
    WhatsAppIcon,
    ArrowRightIcon,
    SparklesIcon,
    CheckIcon
} from '@/components/icons'
import { motion } from 'framer-motion'

const contactLinks = [
    {
        title: 'Direct WhatsApp Chat',
        description: 'Instant order verification, product shade matching, and support.',
        buttonText: 'Chat on WhatsApp',
        href: 'https://wa.me/8801959524393',
        icon: WhatsAppIcon,
        ariaLabel: 'Chat with UK Brand Lover on WhatsApp',
    },
    {
        title: 'Official Facebook Page',
        description: 'Message us for daily drops, community posts, and offers.',
        buttonText: 'Visit Facebook',
        href: 'https://www.facebook.com/tuhinatopa',
        icon: FacebookIcon,
        ariaLabel: 'Message UK Brand Lover on Facebook',
    },
    {
        title: 'Instagram Beauty Feed',
        description: 'Follow our authentic UK beauty hauls and product swatches.',
        buttonText: 'Follow on Instagram',
        href: 'https://instagram.com/tuhinajahantopa',
        icon: InstagramIcon,
        ariaLabel: 'Follow UK Brand Lover on Instagram',
    },
]

const businessDetails = [
    ['Brand Name', 'UK Brand Lover'],
    ['Showroom & Fulfillment', 'Mirpur, Dhaka, Bangladesh'],
    ['Direct Hotline', '+880 1959-524393'],
    ['Customer Support', 'support@ukbrandlover.com'],
    ['Consultation Hours', '10:00 AM – 10:00 PM (Everyday)'],
]

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        setFormStatus("Thank you! Your message has been sent to UK Brand Lover support team.")
        event.currentTarget.reset()
    }

    return (
        <main className="bg-white min-h-[70vh]">
            <section className="mx-4 sm:mx-6">
                <div className="max-w-7xl mx-auto py-12 sm:py-16">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            <SparklesIcon size={13} color="#D8B56D" />
                            <span className="text-[10px] font-bold text-[#6C306E] tracking-widest uppercase">
                                WE ARE HERE TO HELP
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#241224] tracking-tight">
                            Get in Touch with Us
                        </h1>
                        <p className="mt-3 text-xs sm:text-base text-slate-600 font-normal max-w-xl mx-auto">
                            Need guidance choosing the right UK skincare regimen or tracking your shipment in Bangladesh? Our beauty advisory team is ready to assist.
                        </p>
                    </motion.div>

                    {/* Contact Channels Grid */}
                    <div className="mt-12 grid max-w-5xl mx-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {contactLinks.map((item, idx) => (
                            <motion.a
                                key={item.title}
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                aria-label={item.ariaLabel}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: idx * 0.1 }}
                                whileHover={{ y: -6 }}
                                className="group rounded-3xl border border-[#EFE0EF] bg-white p-7 shadow-2xs hover:shadow-[0_10px_30px_rgba(58,12,56,0.06)] hover:border-[#6C306E]/40 transition-all"
                            >
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FAF6FA] text-[#6C306E] border border-[#EFE0EF] group-hover:bg-[#6C306E] group-hover:text-white transition duration-300 shadow-2xs">
                                    <item.icon size={20} color="currentColor" />
                                </div>
                                <h2 className="mt-5 text-base sm:text-lg font-bold text-[#241224]">{item.title}</h2>
                                <p className="mt-2 min-h-[44px] text-xs leading-relaxed text-slate-500 font-normal">{item.description}</p>
                                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#6C306E] text-white text-xs font-bold px-5 py-2.5 shadow-2xs group-hover:bg-[#3A0C38] transition">
                                    <span>{item.buttonText}</span>
                                    <ArrowRightIcon size={12} color="#FFFFFF" />
                                </span>
                            </motion.a>
                        ))}
                    </div>

                    {/* Contact Form & Business Details */}
                    <div className="mt-14 grid max-w-5xl mx-auto gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-3xl border border-[#EFE0EF] bg-white p-6 sm:p-9 shadow-[0_4px_24px_rgba(58,12,56,0.03)]" 
                            aria-labelledby="contact-form-title"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">DIRECT INQUIRY</p>
                            <h2 id="contact-form-title" className="mt-1 text-2xl font-bold text-[#241224]">Send Us a Message</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Submit your inquiry and our team will get back to you within a few hours.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 text-xs">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="font-bold text-[#241224]">
                                        Your Full Name <span className="text-red-500">*</span>
                                        <input required name="name" type="text" className="mt-1.5 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E] focus:bg-white transition" placeholder="Enter recipient name" />
                                    </label>
                                    <label className="font-bold text-[#241224]">
                                        Email Address <span className="text-red-500">*</span>
                                        <input required name="email" type="email" className="mt-1.5 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E] focus:bg-white transition" placeholder="you@example.com" />
                                    </label>
                                </div>
                                <label className="font-bold text-[#241224]">
                                    Subject
                                    <input required name="subject" type="text" className="mt-1.5 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E] focus:bg-white transition" placeholder="Product authenticity check, shade advisory, order status..." />
                                </label>
                                <label className="font-bold text-[#241224]">
                                    Message <span className="text-red-500">*</span>
                                    <textarea required name="message" rows={5} className="mt-1.5 w-full resize-none rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E] focus:bg-white transition" placeholder="Write your message here..." />
                                </label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                                    <motion.button 
                                        whileHover={{ scale: 1.025, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="submit" 
                                        className="group relative overflow-hidden bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white inline-flex items-center justify-center gap-2.5 rounded-full px-9 py-3.5 text-xs font-bold transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[0_12px_28px_rgba(108,48,110,0.55)] cursor-pointer border border-white/20 shimmer-active"
                                    >
                                        <span className="tracking-wide">Submit Inquiry Message</span>
                                        <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </motion.button>
                                    {formStatus && (
                                        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-full flex items-center gap-1.5" role="status">
                                            <CheckIcon size={13} color="#059669" />
                                            {formStatus}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </motion.section>

                        <aside className="rounded-3xl border border-[#EFE0EF] bg-[#FAF6FA] p-6 sm:p-8 flex flex-col justify-between" aria-label="Business contact details">
                            <div>
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]">
                                    <MapPinIcon size={20} color="#6C306E" />
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-[#241224]">UK Brand Lover HQ</h2>
                                <div className="mt-5 space-y-4 text-xs">
                                    {businessDetails.map(([label, value]) => (
                                        <div key={label} className="border-b border-[#EFE0EF] pb-3 last:border-b-0 last:pb-0">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">{label}</p>
                                            <p className="mt-0.5 font-bold text-[#241224]">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Link 
                                href="/shop" 
                                className="mt-8 inline-flex justify-center items-center gap-2 rounded-full border border-[#EFE0EF] bg-white text-[#6C306E] hover:bg-[#6C306E] hover:text-white px-6 py-3.5 text-xs font-bold transition shadow-2xs"
                            >
                                <span>Browse Catalog</span>
                                <ArrowRightIcon size={14} color="currentColor" />
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    )
}
