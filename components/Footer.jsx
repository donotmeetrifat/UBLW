import Link from "next/link";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { Facebook, Instagram, Mail, MapPin, Phone, MessageCircle } from "lucide-react";

const Footer = () => {
    const linkSections = [
        {
            title: "CATEGORIES",
            links: [
                { text: "Skincare", path: '/shop?category=Skincare' },
                { text: "Makeup", path: '/shop?category=Makeup' },
                { text: "Haircare", path: '/shop?category=Haircare' },
                { text: "Fragrance", path: '/shop?category=Fragrance' },
                { text: "Body Care", path: '/shop?category=Body Care' },
            ]
        },
        {
            title: "QUICK LINKS",
            links: [
                { text: "Home", path: '/' },
                { text: "Shop All", path: '/shop' },
                { text: "Contact Us", path: '/contact' },
                { text: "Privacy Policy", path: '/' },
            ]
        },
        {
            title: "CONTACT US",
            links: [
                { text: "+880 1959-524393", path: 'tel:+8801959524393', icon: Phone },
                { text: "support@ukbrandlover.com", path: 'mailto:support@ukbrandlover.com', icon: Mail },
                { text: "Mirpur, Dhaka, Bangladesh", path: '#', icon: MapPin }
            ]
        }
    ];

    const socialLinks = [
        { icon: Facebook, link: "https://www.facebook.com/tuhinatopa", label: "Facebook" },
        { icon: Instagram, link: "https://instagram.com/tuhinajahantopa", label: "Instagram" },
        { icon: MessageCircle, link: "https://wa.me/8801959524393", label: "WhatsApp" },
    ]

    return (
        <footer className="bg-white border-t border-[#EFE0EF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-12 py-16 sm:py-20 border-b border-[#EFE0EF]/80 text-slate-600">
                    <div className="max-w-md">
                        <Link href="/" className="inline-block group mb-3">
                            <Image 
                                src={assets.webLogo} 
                                alt="UK Brand Lover Logo" 
                                className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-102" 
                            />
                        </Link>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
                            Your trusted destination in Bangladesh for 100% authentic UK imported beauty, skincare, cosmetics, haircare, and personal care essentials.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            {socialLinks.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.label}
                                    className="flex items-center justify-center w-9 h-9 bg-[#FAF6FA] border border-[#EFE0EF] hover:bg-[#6C306E] hover:text-white text-[#6C306E] hover:scale-105 transition-all rounded-full shadow-2xs"
                                >
                                    <item.icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full lg:w-auto text-xs sm:text-sm">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-extrabold text-[#241224] text-xs uppercase tracking-wider mb-4">{section.title}</h3>
                                <ul className="space-y-3">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            {link.icon && <link.icon size={14} className="text-[#6C306E] shrink-0" />}
                                            {link.path.startsWith('http') || link.path.startsWith('tel:') || link.path.startsWith('mailto:') ? (
                                                <a href={link.path} className="hover:text-[#6C306E] transition text-slate-600 text-xs sm:text-sm">{link.text}</a>
                                            ) : (
                                                <Link href={link.path} className="hover:text-[#6C306E] transition text-slate-600 text-xs sm:text-sm">{link.text}</Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <p>Copyright 2025 © UK Brand Lover. All Rights Reserved.</p>
                    <p className="font-medium text-[#6C306E]">100% Authentic UK Imported Beauty in Bangladesh</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;