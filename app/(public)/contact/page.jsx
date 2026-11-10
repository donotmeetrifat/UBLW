'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
    OfficialWhatsAppIcon,
    OfficialFacebookIcon,
    OfficialInstagramIcon,
    MapPinIcon, 
    ArrowRightIcon,
    CheckIcon
} from '@/components/icons'
import { FlowButton } from '@/components/ui/flow-button'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const contactChannels = [
    {
        title: 'WhatsApp',
        description: 'Direct chat for order assistance and shade advice.',
        buttonText: 'Chat on WhatsApp',
        href: 'https://wa.me/8801959524393',
        icon: OfficialWhatsAppIcon,
        ariaLabel: 'Chat with UK Brand Lover on WhatsApp',
    },
    {
        title: 'Facebook',
        description: 'Latest UK beauty arrivals, community, and offers.',
        buttonText: 'Visit Facebook',
        href: 'https://www.facebook.com/ukbrandlover',
        icon: OfficialFacebookIcon,
        ariaLabel: 'Message UK Brand Lover on Facebook',
    },
    {
        title: 'Instagram',
        description: 'Product swatches, London hauls, and tutorials.',
        buttonText: 'Follow on Instagram',
        href: 'http://instagram.com/ukbrandlover',
        icon: OfficialInstagramIcon,
        ariaLabel: 'Follow UK Brand Lover on Instagram',
    },
]

const businessDetails = [
    ['LOCATION', 'Mirpur, Dhaka, Bangladesh'],
    ['HOTLINE', '+880 1959-524393'],
    ['EMAIL', 'support@ukbrandlover.com'],
    ['HOURS', '10:00 AM – 10:00 PM (Daily)'],
]

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        setFormStatus('Thank you! Your message has been sent to our team.')
        toast.success('Your message has been sent successfully!')
        event.currentTarget.reset()
    }

    return (
        <main className="bg-white min-h-[75vh] font-poppins selection:bg-[#6C306E] selection:text-white">
            <section className="mx-4 sm:mx-6 lg:mx-8">
                <div className="max-w-6xl mx-auto py-16 sm:py-24 lg:py-28">
                    {/* Clean Spacious Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
                    >
                        <div className="flex items-center justify-center mb-3">
                            <span className="text-[11px] font-bold text-[#6C306E] tracking-widest uppercase">
                                WE ARE HERE TO HELP
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#241224] tracking-tight">
                            Get in Touch with Us
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-slate-500 font-normal max-w-lg mx-auto leading-relaxed">
                            Have a question about our products or your order? We are here to assist you.
                        </p>
                    </motion.div>

                    {/* Three Contact Cards with Generous White Space */}
                    <div className="grid max-w-5xl mx-auto gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {contactChannels.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: idx * 0.1 }}
                                className="flex flex-col justify-between rounded-3xl border border-[#EFE0EF] bg-white p-8 sm:p-9 shadow-2xs hover:shadow-[0_12px_36px_rgba(58,12,56,0.06)] hover:border-[#6C306E]/40 transition-all"
                            >
                                <div>
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] shadow-2xs">
                                        <item.icon size={30} />
                                    </div>
                                    <h2 className="mt-6 text-lg font-bold text-[#241224]">
                                        {item.title}
                                    </h2>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-8 pt-2">
                                    <FlowButton 
                                        text={item.buttonText} 
                                        href={item.href} 
                                        className="w-full text-xs" 
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Clean Form & Business Details with Large Breathing Room */}
                    <div className="mt-20 sm:mt-28 grid max-w-5xl mx-auto gap-10 lg:gap-12 lg:grid-cols-[1.3fr_0.7fr]">
                        {/* Direct Inquiry Form */}
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-3xl border border-[#EFE0EF] bg-white p-8 sm:p-11 shadow-[0_4px_24px_rgba(58,12,56,0.03)]" 
                            aria-labelledby="contact-form-title"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D8B56D]">
                                DIRECT INQUIRY
                            </p>
                            <h2 id="contact-form-title" className="mt-1.5 text-2xl font-bold text-[#241224]">
                                Send Us a Message
                            </h2>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                Submit your inquiry and our team will get back to you shortly.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-xs">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <label className="block font-semibold text-[#241224]">
                                        Your Full Name <span className="text-red-500">*</span>
                                        <input 
                                            required 
                                            name="name" 
                                            type="text" 
                                            className="mt-2 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400" 
                                            placeholder="Enter your name" 
                                        />
                                    </label>
                                    <label className="block font-semibold text-[#241224]">
                                        Email Address <span className="text-red-500">*</span>
                                        <input 
                                            required 
                                            name="email" 
                                            type="email" 
                                            className="mt-2 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400" 
                                            placeholder="you@example.com" 
                                        />
                                    </label>
                                </div>

                                <label className="block font-semibold text-[#241224]">
                                    Subject
                                    <input 
                                        required 
                                        name="subject" 
                                        type="text" 
                                        className="mt-2 w-full rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400" 
                                        placeholder="How can we help you?" 
                                    />
                                </label>

                                <label className="block font-semibold text-[#241224]">
                                    Message <span className="text-red-500">*</span>
                                    <textarea 
                                        required 
                                        name="message" 
                                        rows={5} 
                                        className="mt-2 w-full resize-none rounded-2xl border border-[#EFE0EF] bg-[#FAF6FA] px-4 py-3.5 text-xs text-[#241224] outline-none focus:border-[#6C306E] focus:bg-white transition placeholder:text-slate-400" 
                                        placeholder="Write your message here..." 
                                    />
                                </label>

                                <div className="pt-2">
                                    <motion.button 
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit" 
                                        className="group relative overflow-hidden bg-gradient-to-r from-[#6C306E] via-[#521C54] to-[#3A0C38] hover:from-[#7E3780] hover:to-[#451245] text-white inline-flex items-center justify-center gap-2.5 rounded-full px-9 py-3.5 text-xs font-bold transition-all duration-300 shadow-[0_6px_20px_rgba(108,48,110,0.35)] hover:shadow-[0_12px_28px_rgba(108,48,110,0.55)] cursor-pointer border border-white/20 shimmer-active"
                                    >
                                        <span className="tracking-wide">Submit Inquiry Message</span>
                                        <ArrowRightIcon size={14} color="#FFFFFF" className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </motion.button>

                                    {formStatus && (
                                        <p className="mt-4 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-full inline-flex items-center gap-2" role="status">
                                            <CheckIcon size={13} color="#059669" />
                                            {formStatus}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </motion.section>

                        {/* UK Brand Lover HQ Business Details */}
                        <aside className="rounded-3xl border border-[#EFE0EF] bg-[#FAF6FA] p-8 sm:p-10 flex flex-col justify-between" aria-label="Business contact details">
                            <div>
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#6C306E] shadow-2xs border border-[#EFE0EF]">
                                    <MapPinIcon size={22} color="#6C306E" />
                                </div>
                                <h2 className="mt-6 text-xl font-bold text-[#241224]">
                                    UK Brand Lover HQ
                                </h2>
                                <div className="mt-8 space-y-5 text-xs">
                                    {businessDetails.map(([label, value]) => (
                                        <div key={label} className="border-b border-[#EFE0EF] pb-4 last:border-b-0 last:pb-0">
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

                            <div className="mt-10 pt-4">
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
