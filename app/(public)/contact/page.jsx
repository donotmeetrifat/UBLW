'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, Facebook, Instagram, MapPin, Send, Mail } from 'lucide-react'

const contactLinks = [
    {
        title: 'Phone & WhatsApp',
        description: 'Available for order inquiries and instant support.',
        buttonText: 'Chat on WhatsApp',
        href: 'https://wa.me/8801959524393',
        icon: MessageCircle,
        ariaLabel: 'Chat with UK Brand Lover on WhatsApp',
    },
    {
        title: 'Facebook',
        description: 'Message us for updates, offers, and customer support.',
        buttonText: 'Follow on Facebook',
        href: 'https://www.facebook.com/tuhinatopa',
        icon: Facebook,
        ariaLabel: 'Message UK Brand Lover on Facebook',
    },
    {
        title: 'Instagram',
        description: 'Follow our beauty edits, skincare picks, and launches.',
        buttonText: 'Follow on Instagram',
        href: 'https://instagram.com/tuhinajahantopa',
        icon: Instagram,
        ariaLabel: 'Follow UK Brand Lover on Instagram',
    },
]

const businessDetails = [
    ['Business Name', 'UK Brand Lover'],
    ['Location', 'Mirpur, Dhaka, Bangladesh'],
    ['Contact Phone', '+880 1959-524393'],
    ['Support Email', 'support@ukbrandlover.com'],
    ['Response Time', 'Usually replies within a few hours'],
]

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        setFormStatus("Thank you! Your message has been sent to UK Brand Lover support.")
        event.currentTarget.reset()
    }

    return (
        <main className="bg-white min-h-[70vh]">
            <section className="mx-6">
                <div className="max-w-7xl mx-auto py-12 sm:py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-3xl sm:text-5xl font-bold text-[#241224]">Get in Touch</h1>
                        <p className="mt-3 text-sm sm:text-base text-slate-600">
                            Have questions about our authentic UK imported beauty products or need assistance with your order? We are here to help.
                        </p>
                    </div>

                    <div className="mt-12 grid max-w-5xl mx-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {contactLinks.map((item) => (
                            <a
                                key={item.title}
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                aria-label={item.ariaLabel}
                                className="group rounded-3xl border border-[#EFE0EF] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-[#6C306E]/40"
                            >
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FAF6FA] text-[#6C306E] group-hover:bg-[#6C306E] group-hover:text-white transition">
                                    <item.icon size={22} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-[#241224]">{item.title}</h2>
                                <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-slate-600">{item.description}</p>
                                <span className="mt-4 inline-flex rounded-full bg-[#6C306E] text-white text-xs font-semibold px-5 py-2.5 shadow-xs group-hover:bg-[#3A0C38] transition">
                                    {item.buttonText}
                                </span>
                            </a>
                        ))}
                    </div>

                    <div className="mt-14 grid max-w-5xl mx-auto gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                        <section className="rounded-3xl border border-[#EFE0EF] bg-white p-6 sm:p-8 shadow-xs" aria-labelledby="contact-form-title">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#D8B56D]">Direct Support</p>
                            <h2 id="contact-form-title" className="mt-1 text-2xl font-bold text-[#241224]">Send Us a Message</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Fill out the form below and our beauty advisory team will get back to you promptly.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-xs font-semibold text-[#241224]">
                                        Your Name <span className="text-red-500">*</span>
                                        <input required name="name" type="text" className="mt-1.5 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E]" placeholder="Enter full name" />
                                    </label>
                                    <label className="text-xs font-semibold text-[#241224]">
                                        Email Address <span className="text-red-500">*</span>
                                        <input required name="email" type="email" className="mt-1.5 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E]" placeholder="you@example.com" />
                                    </label>
                                </div>
                                <label className="text-xs font-semibold text-[#241224]">
                                    Subject
                                    <input required name="subject" type="text" className="mt-1.5 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E]" placeholder="Order inquiry, shade selection, product restock..." />
                                </label>
                                <label className="text-xs font-semibold text-[#241224]">
                                    Message <span className="text-red-500">*</span>
                                    <textarea required name="message" rows={5} className="mt-1.5 w-full resize-none rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3 text-xs outline-none focus:border-[#6C306E]" placeholder="Write your message here..." />
                                </label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                                    <button type="submit" className="bg-[#6C306E] hover:bg-[#3A0C38] text-white inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs font-bold transition shadow-xs active:scale-95">
                                        Send Message <Send size={14} />
                                    </button>
                                    {formStatus && <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full" role="status">{formStatus}</p>}
                                </div>
                            </form>
                        </section>

                        <aside className="rounded-3xl border border-[#EFE0EF] bg-[#FAF6FA] p-6 sm:p-8 flex flex-col justify-between" aria-label="Business contact details">
                            <div>
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]">
                                    <MapPin size={22} />
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-[#241224]">UK Brand Lover Info</h2>
                                <div className="mt-5 space-y-4">
                                    {businessDetails.map(([label, value]) => (
                                        <div key={label} className="border-b border-[#EFE0EF] pb-3 last:border-b-0 last:pb-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D8B56D]">{label}</p>
                                            <p className="mt-0.5 text-xs font-semibold text-[#241224]">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Link href="/shop" className="mt-6 inline-flex justify-center items-center rounded-full border border-[#EFE0EF] bg-white text-[#6C306E] hover:bg-[#6C306E] hover:text-white px-6 py-3 text-xs font-bold transition shadow-2xs">
                                Browse UK Beauty Shop
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    )
}
