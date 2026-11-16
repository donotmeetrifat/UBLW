'use client'

import React, { useRef, useState } from 'react'

/**
 * Returns dynamic contextual suggestions based on the user's last message, language, and conversation turn.
 * Supports:
 * 1. Standard Bengali (বাংলা লিপি)
 * 2. Banglish (Romanized Bengali)
 * 3. English
 * Strictly pure text only — NO icons.
 */
export function getContextualSuggestions(lastMessage = '', turnSeed = 0) {
    const rawText = typeof lastMessage === 'string' ? lastMessage : (lastMessage?.content || '')
    const text = rawText.toLowerCase().trim()

    // 1. Language Detection
    const isBengaliScript = /[\u0980-\u09FF]/.test(rawText)
    const isBanglish = !isBengaliScript && /\b(apnader|kase|ache|hobe|koto|taka|dam|brono|daag|skin|chul|kori|bhalo|shukno|tel|khoshkhoshe|deben|pabo|parbo|ki|amake|karon|korbo|ekhon|aro|oita|eta|keno|dorkar|khujchi|shob|naki|bhi)\b/i.test(text)

    // Seed for dynamic rotation so suggestions change on every single message turn
    const seed = (typeof turnSeed === 'number' ? turnSeed : 0) + text.length

    const rotate = (arr) => {
        if (!arr || arr.length === 0) return []
        const offset = Math.abs(seed) % arr.length
        return [...arr.slice(offset), ...arr.slice(0, offset)]
    }

    // 2. Topic: Acne / Blemishes / Pores / Oiliness
    if (/(acne|pimple|breakout|blemish|salicylic|pore|blackhead|whitehead|niacinamide|oil|sebum|ব্রণ|একনে|পিম্পল|তৈলাক্ত|তেলতেলে|লোমকূপ|brono|telteley|oily)/i.test(text)) {
        if (isBengaliScript) {
            return rotate([
                "ব্রণ ও অতিরিক্ত তেলের সমস্যা কমাতে কোন ইউকে সিরাম সেরা?",
                "স্যালিসিলিক অ্যাসিড ও নায়াসিনামাইড একসাথে ব্যবহারের নিয়ম কি?",
                "তৈলাক্ত ও ব্রণপ্রবণ ত্বকের জন্য কোন ময়েশ্চারাইজার লোমকূপ বন্ধ করবে না?",
                "লালচে ফোলা ব্রণের ওপর কোন স্পট ট্রিটমেন্ট দ্রুত কাজ করে?",
                "ব্রণের কালো দাগ ও গর্ত দূর করতে কি ব্যবহার করব?",
                "CeraVe Blemish Control Cleanser কি স্টকে পাওয়া যাবে?",
                "ব্রণপ্রবণ ত্বকে কোন সানস্ক্রিন নিরাপদ?",
                "নাকে ও গালে বড় লোমকূপ ছোট করার কার্যকর টোনার কোনটি?",
            ])
        }
        if (isBanglish) {
            return rotate([
                "Brono r oiliness komate kon UK serum shobcheye bhalo?",
                "Salicylic acid er sathe Niacinamide kivabe use korbo?",
                "Oily skin er jonno pores clog hobe na emon moisturizer konta?",
                "Active red pimple overnight heal korar spot treatment ache?",
                "Brono r kalo daag fade korar best UK serum konta?",
                "CeraVe Blemish Control Cleanser ki available ache?",
                "Acne-prone skin er jonno safe lightweight sunscreen konta?",
                "Open pores shrink korar bhalo kono UK toner ache?",
            ])
        }
        return rotate([
            "Can I layer Salicylic Acid with Niacinamide?",
            "Do you have CeraVe Blemish Control in stock?",
            "Which UK moisturizer will not clog acne pores?",
            "Gentle cleanser for inflamed active breakouts",
            "What spot treatment heals red pimples overnight?",
            "How to fade stubborn post-acne dark marks safely",
            "Is purging normal when starting chemical exfoliants?",
            "Non-comedogenic sunscreen for acne-prone skin",
            "Best toner for shrinking enlarged nose pores",
        ])
    }

    // 3. Topic: Glow / Brightening / Pigmentation / Dark Spots / Vitamin C
    if (/(glow|bright|glass skin|dark spot|pigment|vitamin c|dull|arbutin|radiant|fade|hyperpigmentation|দাগ|মেছতা|উজ্জ্বল|ফর্সা|গ্লো|কালো দাগ|daag|spot|mechta|forsa)/i.test(text)) {
        if (isBengaliScript) {
            return rotate([
                "মেছতা ও জেদি কালো দাগ দূর করার সেরা ইউকে সিরাম কোনটি?",
                "গ্লাস স্কিন ও স্বাভাবিক উজ্জ্বলতা পেতে স্কিনকেয়ার রুটিন কেমন হওয়া উচিত?",
                "The Ordinary Alpha Arbutin 2% কি স্টকে আছে?",
                "ভিটামিন সি সিরাম সকালে নাকি রাতে ব্যবহার করা ভালো?",
                "রোদে পোড়া দাগ ও পিগমেন্টেশন রোধে কোন সানস্ক্রিন কার্যকর?",
                "সংবেদনশীল ত্বকের জন্য উজ্জ্বলতা বাড়ানোর নিরাপদ সিরাম",
                "গ্লাইকোলিক অ্যাসিড টোনার সপ্তাহে কতদিন ব্যবহার করব?",
                "ত্বকের উজ্জ্বলতায় নায়াসিনামাইড সিরামের কার্যকারিতা",
            ])
        }
        if (isBanglish) {
            return rotate([
                "Mechta r kalo daag fade korar best UK serum konta?",
                "Natural glow r glass skin pete kon routine follow korbo?",
                "The Ordinary Alpha Arbutin 2% ki available ache?",
                "Vitamin C serum shokale naki raate use kora bhalo?",
                "Sunburn r pigmentation prevent korar best UK sunscreen konta?",
                "Sensitive skin er jonno safe brightening serum ache?",
                "Glycolic acid toner shoptah e koydin use korbo?",
                "Dark spots remove korte koto din lagbe?",
            ])
        }
        return rotate([
            "Which Vitamin C serum stays stable and does not oxidize?",
            "Do you have The Ordinary Alpha Arbutin 2% in stock?",
            "How often should I use glycolic acid for dark spots?",
            "Best UK sunscreen to prevent dark spot recurrence",
            "Niacinamide vs Vitamin C for hyperpigmentation",
            "Gentle daily routine to achieve luminous glass skin",
            "Is tranexamic acid safe for sensitive skin in summer?",
            "Brightening toner without stinging or alcohol",
            "Exfoliating peel for instant weekend radiance",
        ])
    }

    // 4. Topic: Dryness / Barrier / Sensitive / Ceramide / Irritation
    if (/(dry|barrier|ceramide|sensitive|irritat|eczema|peel|sting|redness|hydrate|hyaluronic|শুষ্ক|ড্রাই|খসখসে|ব্যারিয়ার|সেনসিটিভ|জ্বালা|চুলকানি|shukno|khoshkhoshe)/i.test(text)) {
        if (isBengaliScript) {
            return rotate([
                "ক্ষতিগ্রস্ত স্কিন ব্যারিয়ার দ্রুত রিপেয়ার করার সেরা সিরামাইড ক্রিম কোনটি?",
                "CeraVe Moisturising Cream 454g কি স্টকে পাওয়া যাবে?",
                "শুষ্ক ও টানটান ত্বকের জন্য হাইড্রেটিং ফেস ওয়াশ",
                "হায়ালুরোনিক অ্যাসিড ভেজা ত্বকে ব্যবহারের সঠিক নিয়ম",
                "ত্বকের লালচে ভাব ও জ্বালাপোড়া শান্ত করার ক্রিম",
                "স্কিন ব্যারিয়ার রিপেয়ার হতে কতদিন সময় লাগে?",
                "রাতের বেলা ত্বকে আর্দ্রতা ধরে রাখার নন-গ্রিসি ময়েশ্চারাইজার",
            ])
        }
        if (isBanglish) {
            return rotate([
                "Damaged skin barrier repair korar best UK cream konta?",
                "CeraVe Moisturising Cream 454g ki stock e ache?",
                "Dry skin e Hyaluronic acid kivabe layer korbo?",
                "Mukh khoshkhoshe r chulkani komate kon lotion bhalo?",
                "Sensitive skin e kon cleanser irritation chara clean kore?",
                "UK ceramide cream diye barrier repair hote koto din lage?",
                "Night time e dry skin hydrate rakhar best moisturizer konta?",
            ])
        }
        return rotate([
            "Best ceramide cream to repair a damaged barrier quickly",
            "Is CeraVe Moisturising Cream 454g available?",
            "Sulfate-free hydrating cleanser for tight peeling skin",
            "How to layer Hyaluronic Acid on damp skin properly",
            "Soothing cream for burning and redness relief",
            "How long does skin barrier repair take with UK formulas?",
            "Non-greasy face balm to seal moisture overnight",
            "Can I use active serums while repairing my barrier?",
            "Gentle calming mist for inflamed flare-ups",
        ])
    }

    // 5. Topic: Sunscreen / SPF / Sun Protection
    if (/(sunscreen|spf|sun|uv|white cast|sunburn|greasy|সানস্ক্রিন|রোদ|সানবার্ন|rod|roddur)/i.test(text)) {
        if (isBengaliScript) {
            return rotate([
                "সাদা ভাব (white cast) ছাড়া সেরা ইউকে সানস্ক্রিন কোনটি?",
                "La Roche-Posay Anthelios UVMune 400 কি স্টকে আছে?",
                "গরম ও ঘামে টিকে থাকার মতো আল্ট্রা-ম্যাট সানস্ক্রিন",
                "মেকআপের ওপর সানস্ক্রিন রি-অ্যাপ্লাই করার নিয়ম কি?",
                "ব্রিটিশ সানস্ক্রিন কি ইউভিএ এবং ইউভিবি উভয় থেকেই সুরক্ষা দেয়?",
                "প্রতিদিনের ব্যবহারের জন্য তেলহীন হালকা এসপিএফ",
            ])
        }
        if (isBanglish) {
            return rotate([
                "Kono white cast chara best UK sunscreen konta?",
                "La Roche-Posay Anthelios UVMune 400 ki available?",
                "Gorom e gham holeo thakbe emon ultra-matte sunscreen konta?",
                "Makeup er upore sunscreen re-apply korar easy upay ki?",
                "UK sunscreen gulo ki broad-spectrum UVA & UVB protect kore?",
                "Daily use er jonno lightweight non-sticky SPF konta?",
            ])
        }
        return rotate([
            "Do you have La Roche-Posay Anthelios UVMune 400?",
            "Which UK sunscreen has zero white cast on brown skin?",
            "Ultra-matte sunscreen for hot humid weather",
            "How to reapply sunscreen over makeup during the day",
            "Are British sunscreens broad-spectrum UVA and UVB?",
            "Water-resistant sunscreen for sports and outdoor heat",
            "Lightweight daily SPF that sits smoothly under makeup",
            "Sunscreen stick for easy midday reapplication",
        ])
    }

    // 6. Topic: Authenticity / Batch code / UK Import / Delivery / Price
    if (/(authentic|fake|batch|checkfresh|london|genuine|verify|receipt|import|original|delivery|shipping|cod|cash on delivery|dhaka|charge|price|cost|টাকা|দাম|কুরিয়ার|ডেলিভারি|ক্যাশ অন ডেলিভারি|আসল|নকল|taka|dam|ashol|nakol)/i.test(text)) {
        if (isBengaliScript) {
            return rotate([
                "checkfresh.com-এ ব্যাচ কোড চেক করার নিয়ম কি?",
                "আপনাদের সব পণ্য কি সরাসরি লন্ডন থেকে বিমানে আসে?",
                "ডেলিভারি রাইডারের সামনে পণ্য দেখে নেওয়ার সুযোগ আছে কি?",
                "ঢাকার ভিতরে হোম ডেলিভারি কত দ্রুত পাওয়া যায়?",
                "ঢাকার বাইরে ডেলিভারি চার্জ কত এবং ক্যাশ অন ডেলিভারি আছে কি?",
                "ইউকে ব্যাচ কোড ও বারকোড কিভাবে ভেরিফাই করব?",
            ])
        }
        if (isBanglish) {
            return rotate([
                "checkfresh.com e batch code kivabe check korbo?",
                "Apnader product ki direct London theke air-ship kora?",
                "Parcel neoar shomoy rider er samne check kora jabe ki?",
                "Dhakar moddhe delivery hote koto din lage?",
                "Cash on Delivery (COD) ki shob zillay available?",
                "Authentic UK invoice ba proof pabo ki?",
            ])
        }
        return rotate([
            "How do I verify the batch code on checkfresh.com?",
            "Are your products air-shipped directly from London?",
            "Can I inspect the parcel packaging before paying the rider?",
            "How long does home delivery take inside Dhaka?",
            "Do you provide Cash on Delivery across all 64 districts?",
            "What is your return policy if the seal is damaged?",
            "What are the delivery charges outside Dhaka?",
        ])
    }

    // 7. Topic: Hair / Scalp / Haircare
    if (/(hair|scalp|dandruff|hairfall|shampoo|conditioner|olaplex|চুল|খুশকি|শ্যাম্পু|chul)/i.test(text)) {
        if (isBengaliScript) {
            return rotate([
                "চুল পড়া কমাতে The Ordinary Multi-Peptide Hair Serum কি স্টকে আছে?",
                "খুশকি ও স্ক্যাল্পের চুলকানি দূর করার সেরা ইউকে শ্যাম্পু",
                "শুষ্ক ও রুক্ষ চুলের জন্য সালফেট-মুক্ত ইউকে শ্যাম্পু কোনটি?",
                "ক্ষতিগ্রস্ত চুল রিপেয়ারে Olaplex No. 3 কি পাওয়া যাবে?",
                "স্ক্যাল্পের স্বাস্থ্য ভালো রাখার সেরা ট্রিটমেন্ট সিরাম",
            ])
        }
        if (isBanglish) {
            return rotate([
                "Chul pora bondho korte The Ordinary Hair Density Serum ache?",
                "Khushki r scalp itchiness er best shampoo konta?",
                "Damaged chul repair korte Olaplex No. 3 ki available?",
                "Dry hair er jonno best sulfate-free UK shampoo konta?",
                "Scalp treatment for dry flakes and hair fall defense",
            ])
        }
        return rotate([
            "Do you have Olaplex No. 3 Hair Perfector in stock?",
            "The Ordinary Multi-Peptide Hair Density Serum availability",
            "Best British sulfate-free shampoo for dry frizzy hair",
            "Scalp treatment for dry winter flakes and itchiness",
            "How often should I use bond repair hair treatments?",
        ])
    }

    // 8. General / Fallback Starter Questions
    if (isBengaliScript) {
        return rotate([
            "CeraVe Hydrating Cleanser কি বর্তমানে স্টকে আছে?",
            "দাগ দূর করে উজ্জ্বল গ্লাস স্কিন পেতে সেরা ইউকে সিরাম কোনটি?",
            "ব্রণ ও অতিরিক্ত তেলের সমস্যা দূর করার রুটিন তৈরি করে দিন",
            "কোনো সাদা ভাব ছাড়া হালকা ব্রিটিশ সানস্ক্রিন কোনটি?",
            "The Ordinary Niacinamide 10% এর দাম এবং স্টক জানতে চাই",
            "অরিজিনাল ইউকে ব্যাচ কোড কিভাবে ভেরিফাই করব?",
            "ঢাকার ভিতরে ডেলিভারি কত দ্রুত সম্পন্ন হয়?",
            "ক্যাশ অন ডেলিভারিতে কি অর্ডার করা যাবে?",
            "ক্ষতিগ্রস্ত ত্বকের জন্য সেরা সিরামাইড ময়েশ্চারাইজার কোনটি?",
        ])
    }

    if (isBanglish) {
        return rotate([
            "CeraVe Hydrating Cleanser ki available ache?",
            "Kalo daag fade kore glass skin pete best UK serum konta?",
            "Brono r oiliness dur korar personalized routine banie din",
            "Zero white cast lightweight UK sunscreen suggest korun",
            "The Ordinary Niacinamide 10% er price ebong availability koto?",
            "UK authentic batch code kivabe checkfresh e verify korbo?",
            "Dhakar moddhe delivery koto din e pabo?",
            "Cash on Delivery te ki order kora jabe?",
            "Damaged skin repair korar ceramide moisturizer konta?",
        ])
    }

    return rotate([
        "Is CeraVe Hydrating Cleanser currently in stock?",
        "Best UK serum for dark spots and luminous glass skin",
        "Help me build a personalized acne and blemish routine",
        "Recommend a lightweight British sunscreen with zero white cast",
        "The Ordinary Niacinamide 10% availability and price",
        "How do I verify genuine British batch codes?",
        "What are your delivery times inside Dhaka?",
        "Can I pay using Cash on Delivery (COD)?",
        "Best rich ceramide moisturizer for damaged barrier",
        "Beginner-friendly retinol recommendations",
        "Gentle eye serum for dark circles and morning puffiness",
    ])
}

/**
 * Swipeable horizontal suggestions bar.
 * Pure text only — NO icons.
 * Smooth scroll left-to-right and right-to-left with kinetic drag and touch support.
 */
export default function AiSuggestionBar({
    suggestions = [],
    onSelect,
    disabled = false,
    className = '',
}) {
    const scrollRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    // Check if suggestions are in Bengali script for font styling
    const hasBengali = suggestions.some(s => typeof s === 'string' && /[\u0980-\u09FF]/.test(s))

    const handleMouseDown = (e) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const handleMouseMove = (e) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    const handleMouseUpOrLeave = () => {
        setIsDragging(false)
    }

    const handleScroll = (direction) => {
        if (!scrollRef.current) return
        const amount = direction === 'left' ? -220 : 220
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }

    if (!suggestions || suggestions.length === 0) return null

    return (
        <div className={`relative w-full flex items-center gap-1.5 px-0.5 py-1 ${className}`}>
            {/* Left Scroll Button */}
            <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll left"
                className="size-7 sm:size-7.5 rounded-full bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 text-slate-500 hover:text-[#6C306E] shadow-2xs flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition z-10"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* Scroll Track with Smooth Gradient Mask */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/95 via-white/70 to-transparent z-10" />

                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    style={{
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
                    }}
                    className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 py-0.5 px-3 select-none touch-pan-x cursor-grab active:cursor-grabbing"
                >
                    {suggestions.map((item, idx) => (
                        <button
                            key={`${item}-${idx}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelect?.(item)}
                            className="whitespace-nowrap shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium text-slate-700 bg-white border border-[#EFE0EF] hover:border-[#6C306E] hover:text-[#6C306E] hover:shadow-xs transition-all duration-150 shadow-2xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-ai-editorial"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/95 via-white/70 to-transparent z-10" />
            </div>

            {/* Right Scroll Button */}
            <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll right"
                className="size-7 sm:size-7.5 rounded-full bg-white border border-[#EFE0EF] hover:border-[#6C306E]/40 text-slate-500 hover:text-[#6C306E] shadow-2xs flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition z-10"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    )
}
