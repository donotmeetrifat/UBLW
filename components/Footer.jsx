'use client'

import Link from "next/link";
import Image from "next/image";
import { assets } from "@/assets/assets";
import {
    FacebookIcon,
    InstagramIcon,
    WhatsAppIcon,
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    RoyalCrownIcon
} from "@/components/icons";
import { SOCIAL_LINKS } from "@/lib/constants/social";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const Footer = () => {
    const reduxCategories = useSelector(state => state.product?.categories);
    const beautyCategoryLinks = (Array.isArray(reduxCategories) && reduxCategories.length > 0
        ? reduxCategories
        : ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care', 'Beauty Tools']
    ).slice(0, 6).map(name => ({
        text: name,
        path: `/shop?category=${encodeURIComponent(name)}`
    }));

    const linkSections = [
        {
            title: "BEAUTY CATEGORIES",
            links: beautyCategoryLinks
        },
        {
            title: "CUSTOMER CARE",
            links: [
                { text: "Home", path: '/' },
                { text: "All UK Collections", path: '/shop' },
                { text: "Contact & Advisory", path: '/contact' },
                { text: "Track My Order", path: '/orders' },
                { text: "100% Authenticity Guarantee", path: '/#why-us' },
            ]
        },
        {
            title: "DIRECT CONTACT",
            links: [
                { text: SOCIAL_LINKS.contact.phone, path: `tel:${SOCIAL_LINKS.whatsapp.raw}`, icon: PhoneIcon },
                { text: SOCIAL_LINKS.contact.email, path: `mailto:${SOCIAL_LINKS.contact.email}`, icon: MailIcon },
                { text: SOCIAL_LINKS.contact.location, path: '/contact', icon: MapPinIcon }
            ]
        }
    ];

    const socialLinks = [
        { icon: FacebookIcon, link: SOCIAL_LINKS.facebook.url, label: "Facebook" },
        { icon: InstagramIcon, link: SOCIAL_LINKS.instagram.url, label: "Instagram" },
        { icon: WhatsAppIcon, link: SOCIAL_LINKS.whatsapp.url, label: "WhatsApp" },
    ];

    return (
        <footer className="bg-gradient-to-b from-white via-[#FCF9FC] to-[#FAF5FA] border-t border-[#EFE0EF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-12 py-16 sm:py-20 border-b border-[#EFE0EF]/80 text-slate-600">
                    {/* Brand Column */}
                    <div className="max-w-md">
                        <Link href="/" className="inline-block group mb-3">
                            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                                <Image
                                    src={assets.webLogo}
                                    alt="UK Brand Lover Logo"
                                    className="h-12 sm:h-14 w-auto object-contain"
                                />
                            </motion.div>
                        </Link>
                        <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
                            Your premier destination in Bangladesh for authentic UK imported beauty, dermatological skincare, cult makeup, haircare, and personal care essentials.
                        </p>

                        {/* Social Buttons with Smooth Hover */}
                        <div className="flex items-center gap-3 mt-6">
                            {socialLinks.map((item, i) => (
                                <motion.a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.label}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-center size-9.5 bg-white border border-[#EFE0EF] hover:bg-[#6C306E] hover:border-[#6C306E] hover:text-white text-[#6C306E] rounded-full shadow-2xs transition-colors"
                                >
                                    <item.icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full lg:w-auto text-xs sm:text-sm">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-extrabold text-[#241224] text-[11px] uppercase tracking-widest mb-4">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            {link.icon && (
                                                <link.icon size={14} color="#6C306E" className="shrink-0" />
                                            )}
                                            {link.path.startsWith('http') || link.path.startsWith('tel:') || link.path.startsWith('mailto:') ? (
                                                <a href={link.path} className="hover:text-[#6C306E] transition text-slate-600 text-xs sm:text-sm hover:translate-x-0.5 inline-block">
                                                    {link.text}
                                                </a>
                                            ) : (
                                                <Link href={link.path} className="hover:text-[#6C306E] transition text-slate-600 text-xs sm:text-sm hover:translate-x-0.5 inline-block">
                                                    {link.text}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subfooter */}
                <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <p>Copyright 2026 © UK Brand Lover. All Rights Reserved.</p>
                    <p className="font-medium text-[#6C306E] flex items-center gap-1.5">
                        <RoyalCrownIcon size={14} color="#6C306E" />
                        100% Authentic UK Imported Beauty in Bangladesh
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
