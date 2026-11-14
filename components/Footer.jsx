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

// Custom Clean, Premium 2D Direct Contact Icons (Brand Purple #6C306E)
const DirectWhatsAppIcon = ({ size = 15, className = "shrink-0" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8C1.5 9.2 1.8 10.3 2.4 11.2L1.5 14.5L4.9 13.6C5.8 14.1 6.9 14.5 8 14.5C11.6 14.5 14.5 11.6 14.5 8C14.5 4.4 11.6 1.5 8 1.5Z" stroke="#6C306E" strokeWidth="1.3" strokeLinejoin="round" fill="#FAF6FA"/>
        <path d="M5.8 5.8C5.6 5.4 5.3 5.4 5 5.4H4.5C4.2 5.4 3.8 5.6 3.8 6.1C3.8 7.3 4.8 9.2 6.5 10.5C7.8 11.5 9.2 12 10.1 12C10.6 12 10.9 11.7 11.1 11.4V10.7C11.1 10.4 10.8 10.1 10.5 10L9.4 9.5C9.1 9.4 8.8 9.5 8.6 9.7L8.2 10.1C8 10.2 7.7 10.2 7.5 10C6.9 9.6 6.3 9 5.9 8.3C5.7 8.1 5.8 7.8 6 7.6L6.4 7.2C6.6 7 6.6 6.7 6.5 6.5L5.8 5.8Z" fill="#6C306E"/>
    </svg>
)

const DirectFacebookIcon = ({ size = 15, className = "shrink-0" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="#6C306E" strokeWidth="1.3" fill="#FAF6FA"/>
        <path d="M9.5 8.5H11L11.5 6.5H9.5V5.2C9.5 4.7 9.8 4.5 10.3 4.5H11.5V2.7C11.1 2.6 10.4 2.5 9.7 2.5C8.2 2.5 7.2 3.4 7.2 5V6.5H5.5V8.5H7.2V14H9.5V8.5Z" fill="#6C306E"/>
    </svg>
)

const DirectInstagramIcon = ({ size = 15, className = "shrink-0" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="2" y="2" width="12" height="12" rx="3.5" stroke="#6C306E" strokeWidth="1.3" fill="#FAF6FA"/>
        <circle cx="8" cy="8" r="3" stroke="#6C306E" strokeWidth="1.3"/>
        <circle cx="11.2" cy="4.8" r="0.8" fill="#6C306E"/>
    </svg>
)

const DirectLocationIcon = ({ size = 15, className = "shrink-0" }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.4 7.4 13.9 7.7 14.3C7.9 14.5 8.1 14.5 8.3 14.3C8.6 13.9 12.5 9.4 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#6C306E" strokeWidth="1.3" strokeLinejoin="round" fill="#FAF6FA"/>
        <circle cx="8" cy="6" r="2" fill="#6C306E"/>
    </svg>
)

const Footer = () => {
    const beautyCategoryLinks = [
        'Skincare',
        'Makeup',
        'Haircare',
        'Body Care',
        'Lip Care',
        'Winter Essentials',
        'Baby Care',
        'Eye Care'
    ].map(name => ({
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
                { text: "Shop All Products", path: '/shop' },
                { text: "Contact & Advice", path: '/contact' },
                { text: "Track My Order", path: '/orders' },
                { text: "Authenticity Guarantee", path: '/#why-us' },
            ]
        },
        {
            title: "DIRECT CONTACT",
            links: [
                { text: "WhatsApp: +880 1959-524393", path: "https://wa.me/8801959524393", icon: DirectWhatsAppIcon },
                { text: "Facebook: UK Brand LOVER", path: "https://www.facebook.com/ukbrandlover", icon: DirectFacebookIcon },
                { text: "Instagram: @tuhinajahantopa", path: "https://www.instagram.com/tuhinajahantopa/", icon: DirectInstagramIcon },
                { text: "Mirpur, Dhaka, Bangladesh", path: "/contact", icon: DirectLocationIcon }
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
                            UK Brand LOVER is Bangladesh&apos;s trusted home for authentic UK-imported beauty. We believe every woman deserves access to the products she reads about — without worrying if they&apos;re real. That&apos;s why we bring them straight from the UK, with proof.
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
                    <p>© 2026 UK Brand LOVER — Bringing Real UK Beauty to Bangladesh.</p>
                    <p className="font-medium text-[#6C306E] flex items-center gap-1.5">
                        <RoyalCrownIcon size={14} color="#6C306E" />
                        Authenticity. Transparency. Trust.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
