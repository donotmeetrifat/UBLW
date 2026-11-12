'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { 
    CheckIcon, 
    CrownIcon, 
    WhatsAppIcon, 
    PlaneIcon, 
    SparklesIcon, 
    ShieldCheckIcon,
    ArrowRightIcon
} from "@/components/icons"
import { SOCIAL_LINKS } from "@/lib/constants/social"

export default function PricingPage() {
    const officialWhatsApp = SOCIAL_LINKS.whatsapp.raw

    const plans = [
        {
            name: "Standard Shopper",
            tagline: "Essential Authentic UK Beauty",
            price: "৳0",
            period: "Forever Free",
            badge: null,
            featured: false,
            description: "Direct access to our ready-stock authentic UK cosmetics, skincare, and fragrances in Bangladesh.",
            features: [
                "100% Authentic UK Imported Guarantee",
                "Cash on Delivery, bKash, Nagad & Rocket",
                "Live Steadfast Courier Tracking (5-Stage)",
                "24-48 Hour Dhaka Express Dispatch",
                "Original UK Batch Codes & Expiry Dates",
                "Standard WhatsApp Customer Support"
            ],
            ctaText: "Start Shopping",
            ctaLink: "/shop",
            isWhatsApp: false
        },
        {
            name: "VIP Beauty Circle",
            tagline: "Exclusive Privilege For Loyal Clients",
            price: "Complimentary",
            period: "With Orders Above ৳5,000",
            badge: "Most Popular",
            featured: true,
            description: "Unlocked automatically once your lifetime spending reaches ৳5,000. Enjoy royal benefits and secret perks.",
            features: [
                "Everything in Standard Shopper",
                "Secret 10%–15% VIP WhatsApp Flash Coupons",
                "24-Hour Early Access to Heathrow Air Shipments",
                "Free Express Delivery Upgrades in Dhaka Metro",
                "Complimentary Luxury UK Samples with every parcel",
                "Direct Skincare Formulation Advice on WhatsApp",
                "Priority Handover to Steadfast / Pathao Couriers"
            ],
            ctaText: "Join VIP Circle",
            ctaLink: `https://wa.me/${officialWhatsApp}?text=${encodeURIComponent("Assalamu Alaikum! I would like to join the UK Brand Lover VIP Beauty Circle.")}`,
            isWhatsApp: true
        },
        {
            name: "London Heathrow Concierge",
            tagline: "Personal Shopper Direct From London",
            price: "Custom Sourcing",
            period: "From Harrods & Boots UK",
            badge: "Bespoke Service",
            featured: false,
            description: "Can't find a rare niche fragrance or specific UK prescription skincare? Our London team buys it directly in the UK.",
            features: [
                "Sourced from Harrods, Selfridges, Boots & SpaceNK",
                "Original London Store VAT Receipt Included",
                "Flight Hand-Carry / Regulated Air Cargo",
                "Delivered to your Dhaka address in 7–12 days",
                "Zero Risk of Counterfeits or Replica Items",
                "Personalized Video Proof from London Stores",
                "1-on-1 WhatsApp Concierge Tracking"
            ],
            ctaText: "Request UK Sourcing",
            ctaLink: `https://wa.me/${officialWhatsApp}?text=${encodeURIComponent("Assalamu Alaikum! I would like to request a custom UK product sourcing quote from London.")}`,
            isWhatsApp: true
        }
    ]

    return (
        <div className="min-h-screen bg-[#FAF6FA] py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6C306E]/10 border border-[#6C306E]/20 text-[#6C306E] text-xs font-bold uppercase tracking-wider mb-4"
                    >
                        <CrownIcon size={14} color="#6C306E" />
                        <span>UK Beauty Privileges & Sourcing</span>
                    </motion.div>
                    
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#241224] tracking-tight mb-4">
                        Authentic UK Luxury, <span className="text-[#6C306E]">Your Way</span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Whether shopping our ready Dhaka stock or commissioning a rare item straight from London Heathrow, experience unmatched authenticity and royal customer care.
                    </p>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                                plan.featured
                                    ? "bg-white border-2 border-[#6C306E] shadow-[0_16px_40px_rgba(108,48,110,0.12)] scale-100 lg:-translate-y-2"
                                    : "bg-white border border-[#EFE0EF] shadow-2xs hover:shadow-md"
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#6C306E] to-[#3A0C38] text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                                    {plan.badge}
                                </div>
                            )}

                            <div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-extrabold text-[#241224]">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                                </div>

                                <div className="mb-6 p-4 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF]/60">
                                    <div className="text-3xl font-black text-[#6C306E]">{plan.price}</div>
                                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{plan.period}</div>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                                    {plan.description}
                                </p>

                                <div className="border-t border-[#EFE0EF] pt-6 mb-8">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#241224] mb-3">Included Privileges:</p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                                <div className="size-4.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckIcon size={11} color="#059669" />
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                {plan.isWhatsApp ? (
                                    <a
                                        href={plan.ctaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                                            plan.featured
                                                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                                                : "bg-[#241224] hover:bg-black text-white"
                                        }`}
                                    >
                                        <WhatsAppIcon size={15} color="#FFFFFF" />
                                        <span>{plan.ctaText}</span>
                                    </a>
                                ) : (
                                    <Link
                                        href={plan.ctaLink}
                                        className="w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#6C306E] hover:bg-[#3A0C38] text-white transition cursor-pointer shadow-sm"
                                    >
                                        <span>{plan.ctaText}</span>
                                        <ArrowRightIcon size={14} color="#FFFFFF" />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Guarantee Banner */}
                <div className="bg-white rounded-3xl p-8 border border-[#EFE0EF] shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center">
                        <div className="size-12 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mb-3">
                            <ShieldCheckIcon size={24} color="#6C306E" />
                        </div>
                        <h4 className="font-extrabold text-[#241224] text-sm">100% Authenticity Money-Back</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Double money back if any item is proven non-authentic or replica.</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="size-12 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mb-3">
                            <PlaneIcon size={24} color="#6C306E" />
                        </div>
                        <h4 className="font-extrabold text-[#241224] text-sm">Direct London Air-Freight</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Direct shipments from Heathrow to Hazrat Shahjalal International Airport.</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="size-12 rounded-2xl bg-[#FAF6FA] border border-[#EFE0EF] flex items-center justify-center mb-3">
                            <SparklesIcon size={24} color="#6C306E" />
                        </div>
                        <h4 className="font-extrabold text-[#241224] text-sm">Official VIP Concierge</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Hotline: +880 1959-524393 for direct assistance & custom sourcing.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
