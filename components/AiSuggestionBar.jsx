'use client'

import React, { useRef, useState } from 'react'

/**
 * Returns contextual suggestions based on the user's last message or inquiry.
 * Pure text only — strictly NO icons.
 */
export function getContextualSuggestions(lastMessage = '') {
    const text = (typeof lastMessage === 'string' ? lastMessage : lastMessage?.content || '').toLowerCase()

    // 1. Acne / Blemishes / Pores / Breakouts / Salicylic / Blackheads / Pimple
    if (/(acne|pimple|breakout|blemish|salicylic|pore|blackhead|whitehead|niacinamide|oil|sebum)/i.test(text)) {
        return [
            "Can I layer Salicylic Acid with Niacinamide?",
            "Do you have CeraVe Blemish Control in stock?",
            "Which UK moisturizer will not clog acne pores?",
            "Gentle cleanser for inflamed active breakouts",
            "What spot treatment heals red pimples overnight?",
            "How to fade stubborn post-acne dark marks safely",
            "Is purging normal when starting chemical exfoliants?",
            "Non-comedogenic sunscreen for acne-prone skin",
            "Best toner for shrinking enlarged nose pores",
        ]
    }

    // 2. Glow / Glass Skin / Brightening / Pigmentation / Dark Spots / Vitamin C / Dullness
    if (/(glow|bright|glass skin|dark spot|pigment|vitamin c|dull|arbutin|radiant|fade|hyperpigmentation)/i.test(text)) {
        return [
            "Which Vitamin C serum stays stable and does not oxidize?",
            "Do you have The Ordinary Alpha Arbutin 2% in stock?",
            "How often should I use glycolic acid for dark spots?",
            "Best UK sunscreen to prevent dark spot recurrence",
            "Niacinamide vs Vitamin C for hyperpigmentation",
            "Gentle daily routine to achieve luminous glass skin",
            "Is tranexamic acid safe for sensitive skin in summer?",
            "Brightening toner without stinging or alcohol",
            "Exfoliating peel for instant weekend radiance",
        ]
    }

    // 3. Dryness / Barrier / Sensitive / Ceramide / Irritation / Eczema / Peeling / Stinging
    if (/(dry|barrier|ceramide|sensitive|irritat|eczema|peel|sting|redness|hydrate|hyaluronic)/i.test(text)) {
        return [
            "Best ceramide cream to repair a damaged barrier quickly",
            "Is CeraVe Moisturising Cream 454g available?",
            "Sulfate-free hydrating cleanser for tight peeling skin",
            "How to layer Hyaluronic Acid on damp skin properly",
            "Soothing cream for burning and redness relief",
            "How long does skin barrier repair take with UK formulas?",
            "Non-greasy face balm to seal moisture overnight",
            "Can I use active serums while repairing my barrier?",
            "Gentle calming mist for inflamed flare-ups",
        ]
    }

    // 4. Sunscreen / SPF / UV / White Cast / Sun Protection
    if (/(sunscreen|spf|sun|uv|white cast|sunburn|greasy)/i.test(text)) {
        return [
            "Do you have La Roche-Posay Anthelios UVMune 400?",
            "Which UK sunscreen has zero white cast on brown skin?",
            "Ultra-matte sunscreen for hot humid weather",
            "How to reapply sunscreen over makeup during the day",
            "Are British sunscreens broad-spectrum UVA and UVB?",
            "Water-resistant sunscreen for sports and outdoor heat",
            "Does mineral sunscreen cause clogged pores?",
            "Lightweight daily SPF that sits smoothly under makeup",
            "Sunscreen stick for easy midday reapplication",
        ]
    }

    // 5. Anti-Aging / Retinol / Wrinkles / Fine lines / Peptides / Collagen
    if (/(retinol|aging|wrinkle|fine line|peptide|collagen|firm|mature|retinoid)/i.test(text)) {
        return [
            "What retinol concentration should a beginner start with?",
            "Do you have The Ordinary Granactive Retinoid in stock?",
            "How to use the sandwich method with retinol and moisturizer",
            "Best British peptide serum for forehead expression lines",
            "Can I use retinol and vitamin C in the same day?",
            "Firming eye cream for crow's feet and dark circles",
            "How many nights a week should I apply retinol?",
            "Non-irritating retinol alternative for sensitive skin",
            "Collagen boosting serum for loss of elasticity",
        ]
    }

    // 6. Authenticity / Batch code / Genuine / London / Direct import / Counterfeit / Fake
    if (/(authentic|fake|batch|checkfresh|london|genuine|verify|receipt|import|original)/i.test(text)) {
        return [
            "How do I verify the batch code on checkfresh.com?",
            "Are your products air-shipped directly from London?",
            "How to tell real The Ordinary apart from replicas?",
            "Can I inspect the parcel packaging before paying the rider?",
            "Why do British formulations differ from US versions?",
            "Do your bottles have authentic UK embossed barcodes?",
            "What is your guarantee if a product is unsealed?",
            "Do you provide proof of British authorized procurement?",
        ]
    }

    // 7. Delivery / COD / Cash on Delivery / Dhaka / Shipping / Return / Timing
    if (/(deliver|shipping|cod|cash on delivery|dhaka|courier|return|charge|time)/i.test(text)) {
        return [
            "How long does home delivery take inside Dhaka?",
            "Do you provide Cash on Delivery across all 64 districts?",
            "Can I inspect the product batch code with the rider?",
            "What are the delivery charges outside Dhaka?",
            "What is your return policy if the seal is damaged?",
            "How do I track my parcel once it leaves your hub?",
            "Is same-day urgent delivery available in Dhaka?",
            "Which courier partner handles your parcel shipments?",
        ]
    }

    // 8. Hair / Scalp / Haircare / Dandruff / Hairfall
    if (/(hair|scalp|dandruff|hairfall|shampoo|conditioner|olaplex)/i.test(text)) {
        return [
            "Do you have Olaplex No. 3 Hair Perfector in stock?",
            "The Ordinary Multi-Peptide Hair Density Serum availability",
            "Best British sulfate-free shampoo for dry frizzy hair",
            "Scalp treatment for dry winter flakes and itchiness",
            "How often should I use bond repair hair treatments?",
            "Lightweight hair oil for split ends and shine",
            "Leave-in conditioner for heat and pollution defense",
        ]
    }

    // 9. Default / Initial Welcome / Consultation Starters
    return [
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
    ]
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

    // Mouse drag scrolling support for desktop
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
        const walk = (x - startX) * 1.5 // Scroll speed factor
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    const handleMouseUpOrLeave = () => {
        setIsDragging(false)
    }

    if (!suggestions || suggestions.length === 0) return null

    return (
        <div className={`relative w-full ${className}`}>
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 py-1.5 px-3 select-none touch-pan-x cursor-grab active:cursor-grabbing"
            >
                {suggestions.map((item, idx) => (
                    <button
                        key={`${item}-${idx}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect?.(item)}
                        className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-[#4A204C] bg-white border border-[#EFE0EF] hover:border-[#6C306E] hover:bg-[#6C306E] hover:text-white transition-all duration-150 shadow-2xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    )
}
