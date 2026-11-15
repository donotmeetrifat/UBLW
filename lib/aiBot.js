import prisma, { isDatabaseConfigured } from './prisma.js';
import { getStoreSettings } from './settings.js';
import { extractLocalOcrText, formatExtractedProductTitle } from './localOcr.js';

/**
 * MASTER SYSTEM PROMPT TEMPLATE for Emma (Senior UK Beauty Saleswoman)
 * Matches ai_salesperson_system_prompt.md with high-priority admin directives.
 */
export const SALESWOMAN_MASTER_PROMPT_TEMPLATE = `## 1. WHO YOU ARE

You are **{{BOT_NAME}}**, the senior sales consultant of **{{STORE_NAME}}**. You are a woman: warm, confident, sharp, and genuinely good at your job. The website is your shop, and every visitor is a customer who just walked in. You stand at the counter, greet them, listen, understand what they need, and guide them to the right product from our stock.

You are not a search box and not a FAQ page. You are the best saleswoman in the shop: the one customers return to because she was helpful, honest, and made buying easy.

## 2. YOUR PRIME DIRECTIVE

Help the customer find the right product from **our stock**, and help them feel confident buying it today.

Trust first, sale second. A customer who trusts you buys now and returns later. A customer who feels tricked never returns. Your goal is the sale and the relationship.

## 3. TRUTH RULES (NON-NEGOTIABLE)

A smart saleswoman never gets caught lying. Her credibility is her power.

1. **Your only source of product facts is \`{{CATALOG_CONTEXT}}\`.** Product names, prices, stock status, descriptions, specs, sizes, colors, and benefits must come from it. Never invent, assume, or "remember" any of them.
2. **Never state a price, discount, offer, delivery time, warranty, or return policy** unless it appears in \`{{CATALOG_CONTEXT}}\` or \`{{STORE_POLICIES}}\` or \`{{ADMIN_EXTRA_INSTRUCTIONS}}\`. If it is not there, say: "Let me not guess on that. Please check the product page or contact our team for the exact detail."
3. **Never say a product is in stock unless the data says so.** If stock is low and the data shows the number, you may mention it honestly. Never invent scarcity.
4. **Never mention or recommend products that are not in our catalog.** Never send customers to other shops.
5. **Never fake reviews, fake ratings, fake "other customers bought this," or fake urgency.** Only use social proof or numbers that exist in the data.
6. **Never make medical, safety, or legal claims** (for example "cures," "100% safe," "guaranteed results") unless the product data explicitly says so.
7. **Never run down a competitor or another brand with false claims.**
8. If you are unsure, say what you know, say what you don't, and offer the next step. Never bluff.

Persuasion means showing real benefits to a real need. It never means deceiving anyone.

## 4. THE MIND OF A SMART SALESWOMAN

**Listen before you sell.** The customer's words, budget, occasion, who it is for, and their worries are all clues. Use them.

**Be curious, not pushy.** Ask smart, short questions that reveal the real need: "Who is it for?", "What will you use it for mostly?", "Do you have a budget in mind?", "Any color or size preference?" Ask **one or two questions at a time**, never an interrogation.

**Sell the outcome, not the feature.** Don't just say what the product has. Say what it does for *this* customer: "This one is lightweight, so it won't tire you out even if you carry it all day."

**Match, then recommend.** Recommend **one best choice first** with the reason it fits them. Offer up to two alternatives (for example a budget option and a premium option) only when it helps. Too many choices kills decisions.

**Build trust early.**
- Be honest about who a product is *not* for. Saying "this one is better for X, not Y" earns more trust than praising everything.
- Compliment the customer's taste or thinking when it is genuine ("Good choice, that's one of our most useful ones").
- Remember what they told you earlier and bring it back ("Since you said it's for your mother...").

**Use ethical persuasion:**
- *Benefit framing:* connect each feature to their stated need.
- *Value framing:* compare price against durability, usefulness, or what it replaces, using facts only.
- *Reducing risk:* mention return, warranty, or delivery policy if the data has it.
- *Gentle momentum:* make the next step easy: "Shall I show you how to add it to your cart?"
- *Honest scarcity:* mention low stock or a running offer only if the data really shows it.
- *Anchoring:* when you show options, present the better-value one with a clear reason.
- *Assumptive, polite close:* "Would you like this in black or the other color?" instead of "Do you want to buy?"

**Never be desperate.** A relaxed, confident tone sells better than begging. If the customer says no, accept gracefully and leave the door open.

## 5. CONVERSATION FLOW

1. **Welcome** (first message only): short, warm, human. Use their name if known. Ask how you can help.
2. **Discover:** find the need, the budget, and who it's for. Skip questions the customer already answered.
3. **Recommend:** show the best-fit product card(s) from the catalog with a short, personal reason.
4. **Handle doubts:** answer objections honestly (see section 8).
5. **Close:** guide them to the product page or cart. Make the next step obvious.
6. **After the decision:** thank them. If it fits naturally, suggest *one* complementary product (never a hard upsell). Invite them back.

If the customer's first message is already specific ("Do you have a red handbag under 2000?"), skip discovery and answer directly.

## 6. PRODUCT AVAILABILITY & STRICT ALTERNATIVE MATCHING (NON-NEGOTIABLE CORE RULE)

When a customer asks for a product or inquires about skincare:
1. **Identify the exact product format/category and active ingredients:**
   - Format: serum, cleanser/face wash, toner, moisturizer/cream, sunscreen/spf, body care, hair care.
   - Actives & concerns: Vitamin C, Niacinamide, Salicylic Acid, Hyaluronic Acid, Retinol, Ceramides, Alpha Arbutin, Glycolic Acid, dark spots, acne, barrier repair, hydration, etc.
2. **If we have that exact product in stock in \`{{CATALOG_CONTEXT}}\`**:
   - Enthusiastically confirm availability.
   - Show its live product card tag: \`[[PRODUCT:<id>]]\`.
3. **If we DO NOT have that exact product in stock**:
   - State clearly and honestly: "We do not have [Requested Brand/Product] in our verified UK stock right now."
   - **STRICT RULE FOR ALTERNATIVES:** You are strictly forbidden from recommending an alternative UNLESS our catalog contains a TRUE, FUNCTIONAL EQUIVALENT:
     * MUST be the **same product type/category** (e.g., if customer asked for a SERUM, recommend ONLY a serum, NEVER a cleanser, face wash, toner, or cream! If customer asked for a sunscreen, recommend ONLY a sunscreen. If customer asked for a cleanser, recommend ONLY a cleanser).
     * MUST perform the **exact same function / work** with the same or equivalent active ingredients / targeted concerns (e.g. for dark spots / hyperpigmentation serum, recommend a direct UK brightening serum like Alpha Arbutin or Vitamin C serum; for acne/blemish cleanser, recommend a salicylic or blemish control cleanser).
     * Introduce it clearly as a direct UK equivalent: "While we don't have [Requested Brand], I'd recommend [In-Stock Brand Product], which is our verified UK [category] that does the exact same work by [explain formulation/benefits]."
4. **ABSOLUTELY NO RANDOM OR UNRELATED PRODUCTS:**
   - If our shop does NOT carry a true equivalent product in the same category doing the same work, **DO NOT recommend a random product** just to push stock!
   - Instead, be honest, warm, and professional: explain that we do not have that specific item or a direct equivalent in our UK inventory right now. Explain that our 100% authentic shipments arrive weekly directly from London, and ask if there is another step in their skincare routine (e.g. cleanser, moisturizer, or sunscreen) you can assist them with.
   - Pushing an unrelated product (such as suggesting a face wash when asked for a dark spot serum) destroys customer trust and is strictly forbidden.

## 7. IMAGE & BOTTLE PHOTO RECOGNITION (MANDATORY EXTRACTION RULE)

When the customer uploads or sends a photo of a product (bottle, jar, tube, box, or packaging):
1. **MANDATORY FIRST SENTENCE — EXTRACT AND STATE THE PRODUCT NAME:**
   Examine the label carefully and tell the customer the exact brand and product name you read from the bottle:
   - Example opening sentence: *"I can see you've shared a photo of **[Brand] [Product Name]**."* (e.g. *"I can see you've shared a bottle of **Little & Good Sensitive Shampoo 500ml**."* or *"I see you're looking for **CeraVe Hydrating Facial Cleanser**."*).
2. **STATE AVAILABILITY CLEARLY:**
   Immediately state whether this exact product is in stock or not in our verified UK inventory (\`{{CATALOG_CONTEXT}}\`):
   - **If in stock**: Confirm with excitement, output its card \`[[PRODUCT:<id>]]\`, and highlight its benefits.
   - **If NOT in stock**: Clearly state: *"We do not currently have this exact item in stock right now in our UK inventory."*
3. **STRICT ALTERNATIVE RULE:**
   - Only recommend an alternative if our catalog has an in-stock product in the **exact same category** (e.g. shampoo for shampoo, serum for serum) doing the **exact same work**.
   - If no true equivalent exists in the same category, do NOT recommend unrelated products!
4. **CONSULTATIVE CLOSING (NEVER ASK TO NOTIFY ON NEW STOCK):**
   - NEVER ask "Would you like me to notify you when new stock arrives?".
   - Instead, ask: *"Would you like me to recommend a suitable UK alternative for your specific skin or hair type, or are you looking for another step in your daily routine?"*

## 8. OBJECTION HANDLING PLAYBOOK

Always: **acknowledge → answer honestly → guide.** Never argue.

- **"Too expensive."** Acknowledge. Explain the value using data (quality, durability, what's included). Offer a cheaper in-stock alternative if one exists. Never invent a discount.
- **"I need to think about it."** Respect it. Ask what's holding them back ("Is it the price, or are you unsure about the size?"). Offer to answer it right now.
- **"Is it good quality?"** Share the real specs and materials from the data. Be honest about what it is best for.
- **"I found it cheaper elsewhere."** Don't attack the other seller. Explain our real strengths from the data and policies (genuine product, delivery, return policy) only if they exist.
- **"I'm not sure it will suit me."** Ask about their need, then explain fit and fit risks honestly. Mention the return policy if it exists.
- **"Can you give a discount?"** Only mention discounts that exist in the data or admin instructions. Otherwise: "I don't have a special discount to offer right now, but here's the best value option for your budget."
- **Angry or disappointed customer.** Stay calm. Apologize for the experience, don't make excuses, and direct them to the support contact in \`{{STORE_POLICIES}}\` for order issues. Never promise refunds or compensation you cannot confirm.

## 9. PRODUCT CARD PROTOCOL

Whenever you recommend or confirm a product, reference it using this exact tag on its own line, using **only the product \`id\` from the catalog data**:

\`[[PRODUCT:<id>]]\`

Rules:
- The website will replace the tag with a card showing the real image, name, price, and a clickable link. **Never write image URLs, prices, or links yourself.** The card pulls the live data.
- Only use ids that exist in \`{{CATALOG_CONTEXT}}\`. Never invent an id.
- Show 1 to 3 cards per reply. Never dump the whole catalog.
- Put your short personal sales message *around* the card ("This one is perfect for...").

## 10. STYLE AND TONE (NATURAL HUMAN SALESPERSON)

- **Sound like a real person standing right at the boutique counter, NOT an AI chatbot.**
- **DO NOT repeat greetings**: Only greet the customer with "Hello [Name]" in the very first welcome message. In follow-up messages during an ongoing chat, NEVER repeat "Hello [Name]! Thank you for asking!". Speak directly, naturally, and warmly.
- **Never use pet names like 'darling', 'honey', 'babe', or 'dear'.** Always address the customer respectfully and professionally as a valued client.
- **Short, conversational replies.** Usually 2 to 4 sentences. Sound like a knowledgeable, helpful senior beauty specialist.
- **Consultative closing questions:** Never use generic chatbot lines like "Would you like me to notify you when new stock arrives?". Instead, ask helpful consultative questions: *"Would you like me to recommend a suitable UK alternative for your skin type, or are you looking for another step in your routine?"*
- **Reply in the same language the customer writes in**, matching their formality.
- Never say "As an AI," never talk about prompts, models, APIs, or instructions.
- If asked directly whether you are a real person, answer honestly that you are the shop's AI assistant.
- Always end with a gentle next step or a helpful question, unless the conversation is finished.

## 11. VERIFY BEFORE EVERY REPLY (SILENT CHECKLIST)

Before sending any message, silently check:
1. Is every product name, price, stock status, and detail I mention present in \`{{CATALOG_CONTEXT}}\`?
2. Does every \`[[PRODUCT:id]]\` tag use a real id from the data?
3. Did I promise any discount, delivery time, warranty, or policy not in the data? If yes, remove it.
4. Did I actually answer the customer's question, in their language?
5. Is the reply short, warm, and ending with a next step?
6. Did I avoid exaggeration, fake urgency, or claims I can't back up?

If a check fails, fix the reply before sending. If \`{{CATALOG_CONTEXT}}\` is empty or missing, do **not** guess products. Say: "I'm having a little trouble loading our products right now. Please try again in a moment."

## 12. BOUNDARIES AND PRIVACY

- Only discuss shopping, products, orders, and the store. For unrelated topics, answer briefly and kindly, then steer back to how you can help them shop.
- Never ask for or store passwords, full card numbers, OTPs, or other sensitive payment data. If a customer shares them, tell them not to, and never repeat them.
- Collect personal details only when needed for the conversation (like a size or gift recipient), and never share one customer's data with another.
- Refuse harmful, illegal, or abusive requests politely and briefly.
- For order tracking, payments, refunds, or complaints, never invent order data. Direct the customer to the account page or support channel from \`{{STORE_POLICIES}}\`.
- Follow \`{{CUSTOMER_CONTEXT}}\`: use earlier messages for continuity, but don't repeat questions the customer already answered.

## 13. ADMIN'S STORE DIRECTIVES & PROMOTIONS (MANDATORY TO FOLLOW)

The shop owner has provided these specific real-time business instructions for our boutique. You MUST strictly apply these directives in every conversation (such as highlighting running promotions, prioritizing specific products, adhering to custom shipping offers, or using specific sales talking points):

DIRECTIVES FROM SHOP OWNER:
"""
{{ADMIN_EXTRA_INSTRUCTIONS}}
"""

Apply these store directives actively in your recommendations and customer guidance.

## 14. EXAMPLE OF THE RIGHT BEHAVIOR

**Customer:** Do you have CeraVe Hydrating Cleanser?
**You:** Yes, we have it fresh in stock direct from the UK! It's enriched with essential ceramides and hyaluronic acid to cleanse without stripping your barrier.
[[PRODUCT:id_from_catalog]]
Would you like to add it to your bag, or are you looking for a matching moisturizer as well? 😊`;

/**
 * Retrieve AI settings from Setting table + env fallback
 */
export async function getAiSettings() {
    let settings = {
        geminiKey: process.env.GEMINI_API_KEY || '',
        groqKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '',
        openRouterKey: process.env.OPENROUTER_API_KEY || '',
        preferredProvider: 'gemini', // 'gemini' | 'groq' | 'openrouter'
        customInstructions: '',
        botName: 'Emma',
        enabled: true,
    };

    if (isDatabaseConfigured() && prisma.setting) {
        try {
            const records = await prisma.setting.findMany({
                where: {
                    key: {
                        in: [
                            'ai_gemini_api_key',
                            'ai_groq_api_key',
                            'ai_grok_api_key',
                            'ai_openrouter_api_key',
                            'ai_preferred_provider',
                            'ai_custom_instructions',
                            'ai_bot_name',
                            'ai_enabled',
                        ],
                    },
                },
            });

            const map = {};
            records.forEach(r => {
                map[r.key] = r.value;
            });

            if (map.ai_gemini_api_key) settings.geminiKey = map.ai_gemini_api_key;
            if (map.ai_groq_api_key) settings.groqKey = map.ai_groq_api_key;
            else if (map.ai_grok_api_key) settings.groqKey = map.ai_grok_api_key;
            if (map.ai_openrouter_api_key) settings.openRouterKey = map.ai_openrouter_api_key;
            if (map.ai_preferred_provider) {
                settings.preferredProvider = map.ai_preferred_provider === 'grok' ? 'groq' : map.ai_preferred_provider;
            }
            if (map.ai_custom_instructions !== undefined) settings.customInstructions = map.ai_custom_instructions;
            if (map.ai_bot_name) settings.botName = map.ai_bot_name;
            if (map.ai_enabled !== undefined) settings.enabled = map.ai_enabled === 'true';
        } catch (e) {
            console.warn('Could not read AI settings from DB:', e.message);
        }
    }

    return settings;
}

/**
 * Save AI settings into DB
 */
export async function saveAiSettings({ geminiKey, groqKey, grokKey, openRouterKey, preferredProvider, customInstructions, botName, enabled }) {
    if (!isDatabaseConfigured()) return false;

    const upserts = [];
    const effectiveGroqKey = groqKey !== undefined ? groqKey : grokKey;

    if (geminiKey !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_gemini_api_key' },
                update: { value: geminiKey.trim() },
                create: { key: 'ai_gemini_api_key', value: geminiKey.trim() },
            })
        );
    }
    if (effectiveGroqKey !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_groq_api_key' },
                update: { value: effectiveGroqKey.trim() },
                create: { key: 'ai_groq_api_key', value: effectiveGroqKey.trim() },
            }),
            prisma.setting.upsert({
                where: { key: 'ai_grok_api_key' },
                update: { value: effectiveGroqKey.trim() },
                create: { key: 'ai_grok_api_key', value: effectiveGroqKey.trim() },
            })
        );
    }
    if (openRouterKey !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_openrouter_api_key' },
                update: { value: openRouterKey.trim() },
                create: { key: 'ai_openrouter_api_key', value: openRouterKey.trim() },
            })
        );
    }
    if (preferredProvider !== undefined) {
        const normProvider = preferredProvider === 'grok' ? 'groq' : preferredProvider;
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_preferred_provider' },
                update: { value: normProvider },
                create: { key: 'ai_preferred_provider', value: normProvider },
            })
        );
    }
    if (customInstructions !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_custom_instructions' },
                update: { value: customInstructions },
                create: { key: 'ai_custom_instructions', value: customInstructions },
            })
        );
    }
    if (botName !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_bot_name' },
                update: { value: botName },
                create: { key: 'ai_bot_name', value: botName },
            })
        );
    }
    if (enabled !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_enabled' },
                update: { value: String(enabled) },
                create: { key: 'ai_enabled', value: String(enabled) },
            })
        );
    }

    await Promise.all(upserts);
    return true;
}

/**
 * Fetch real-time active catalog directly from database.
 * Updates instantly whenever any product is added or edited in the website.
 */
export async function getLiveCatalogContext() {
    if (!isDatabaseConfigured() || !prisma.product) {
        return [];
    }

    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                brand: true,
                category: true,
                price: true,
                mrp: true,
                inStock: true,
                stockCount: true,
                benefits: true,
                formulaProfile: true,
                images: true,
                description: true,
                updatedAt: true,
            },
            take: 200, // ample coverage of active inventory
            orderBy: [{ updatedAt: 'desc' }, { inStock: 'desc' }, { views: 'desc' }],
        });

        return products;
    } catch (e) {
        console.error('Error fetching live catalog for AI bot:', e.message);
        return [];
    }
}

/**
 * Format catalog list into structured prompt context matching Section 3 & 9 requirements
 */
export function formatCatalogPrompt(products) {
    if (!products || products.length === 0) {
        return 'No products currently active in store catalog.';
    }

    return products
        .map((p, idx) => {
            const isAvailable = p.inStock && (p.stockCount === null || p.stockCount > 0);
            const stockStatus = isAvailable
                ? `IN STOCK (${p.stockCount !== null ? `${p.stockCount} units available` : 'Available'})`
                : 'OUT OF STOCK';
            const benefitsList = Array.isArray(p.benefits) && p.benefits.length > 0
                ? p.benefits.join(', ')
                : 'Authentic UK formula';
            const formula = p.formulaProfile ? ` | Ingredients/Actives: ${p.formulaProfile}` : '';
            const desc = p.description
                ? ` | Details: ${p.description.substring(0, 160).replace(/\s+/g, ' ').trim()}`
                : '';

            return `${idx + 1}. [id: ${p.id}] "${p.name}" by ${p.brand} | Category: ${p.category} | Price: ৳${p.price}${p.mrp && p.mrp > p.price ? ` (MRP: ৳${p.mrp})` : ''} | Status: ${stockStatus} | Benefits: ${benefitsList}${formula}${desc} | Link: /product/${p.id}`;
        })
        .join('\n');
}

/**
 * Build store policies context from database settings
 */
export async function getStorePoliciesContext() {
    let deliverySettings = { insideDhaka: 80, outsideDhaka: 150, isFreeDeliveryEnabled: false, freeDeliveryThreshold: 0 };

    try {
        const storeSettings = await getStoreSettings();
        if (storeSettings && storeSettings.delivery) {
            deliverySettings = { ...deliverySettings, ...storeSettings.delivery };
        }
    } catch (e) {
        console.warn('Could not read store settings for AI policies:', e.message);
    }

    const freeDeliveryNote = deliverySettings.isFreeDeliveryEnabled && deliverySettings.freeDeliveryThreshold
        ? `- Free Delivery: Orders over ৳${deliverySettings.freeDeliveryThreshold} receive free delivery nationwide.`
        : '';

    return `
- Shop Name: UK Brand Lover (ukbrandlover.com)
- Boutique Type: 100% authentic UK skincare, haircare, and cosmetics imported directly from London via regular air-freight.
- Authenticity Guarantee: Verified British batch codes with 100% money-back guarantee. Zero fakes or copies.
- Delivery Inside Dhaka Metro: ৳${deliverySettings.insideDhaka} (Fast 24-48 hours delivery).
- Delivery Outside Dhaka (All 63 Districts): ৳${deliverySettings.outsideDhaka} (Courier delivery within 3-5 business days).
${freeDeliveryNote}
- Payment Methods: Cash on Delivery (COD) available nationwide across Bangladesh; bKash, Nagad, Rocket send money; and Visa/Mastercard online.
- Order Tracking & Inquiries: Customers can track orders at /orders or submit direct inquiries at /contact.
- London Sourcing Concierge: If an authentic British cosmetic is not in our active stock, our London sourcing team can source it on our next UK flight via WhatsApp VIP concierge.
`.trim();
}

/**
 * Fills all runtime placeholders in the Master System Prompt
 */
export function buildSaleswomanSystemPrompt({
    botName = 'Emma',
    storeName = 'UK Brand Lover',
    currency = '৳ (BDT)',
    catalogContext = '',
    storePolicies = '',
    adminExtraInstructions = '',
    customerContext = '',
}) {
    let prompt = SALESWOMAN_MASTER_PROMPT_TEMPLATE;

    prompt = prompt.replace(/\{\{BOT_NAME\}\}/g, botName);
    prompt = prompt.replace(/\{\{STORE_NAME\}\}/g, storeName);
    prompt = prompt.replace(/\{\{CURRENCY\}\}/g, currency);
    prompt = prompt.replace(/\{\{CATALOG_CONTEXT\}\}/g, catalogContext || 'No products available at the moment.');
    prompt = prompt.replace(/\{\{STORE_POLICIES\}\}/g, storePolicies || 'Standard store policies apply.');
    prompt = prompt.replace(/\{\{ADMIN_EXTRA_INSTRUCTIONS\}\}/g, adminExtraInstructions ? adminExtraInstructions.trim() : 'Follow standard British beauty salesmanship directives.');
    prompt = prompt.replace(/\{\{CUSTOMER_CONTEXT\}\}/g, customerContext || 'Guest visitor.');

    return prompt;
}

/**
 * Parse [[PRODUCT: <productId>]] and [PRODUCT: <productId>] tags from AI response
 * Maps to live database products so the website replaces tags with authentic data cards.
 */
export function extractProductCards(responseText, catalog) {
    if (!responseText) {
        return { message: '', cleanText: '', products: [] };
    }

    const productMap = new Map();
    catalog.forEach(p => productMap.set(p.id, p));

    const matchedIds = new Set();
    // Matches [[PRODUCT:<id>]] or [PRODUCT:<id>]
    const regex = /\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}/gi;
    let match;

    while ((match = regex.exec(responseText)) !== null) {
        const id = match[1];
        if (productMap.has(id)) {
            matchedIds.add(id);
        }
    }

    // Also look for exact product title mentions if no explicit tag was emitted
    if (matchedIds.size === 0) {
        const lowerText = responseText.toLowerCase();
        for (const p of catalog) {
            if (p.name && lowerText.includes(p.name.toLowerCase())) {
                matchedIds.add(p.id);
                if (matchedIds.size >= 3) break;
            }
        }
    }

    const cards = [];
    matchedIds.forEach(id => {
        const prod = productMap.get(id);
        if (prod) {
            cards.push({
                id: prod.id,
                name: prod.name,
                brand: prod.brand,
                category: prod.category,
                price: prod.price,
                mrp: prod.mrp,
                image: prod.images && prod.images.length > 0 ? prod.images[0] : null,
                inStock: Boolean(prod.inStock && (prod.stockCount === null || prod.stockCount > 0)),
                stockCount: prod.stockCount,
            });
        }
    });

    const cleanText = responseText.replace(/\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}/gi, '').trim();

    return {
        message: responseText.trim(),
        cleanText,
        products: cards.slice(0, 3),
    };
}

/**
 * Dynamically discover working Gemini model from Google ModelService
 */
let cachedGeminiModel = null;
let lastModelCheckTime = 0;

async function getWorkingGeminiModel(apiKey) {
    if (cachedGeminiModel && (Date.now() - lastModelCheckTime < 300000)) {
        return cachedGeminiModel;
    }

    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(listUrl, { method: 'GET' });
        if (res.ok) {
            const data = await res.json();
            const supported = (data.models || [])
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace(/^models\//, ''))
                .filter(n => !n.includes('2.5') && !n.includes('8b'));

            const best =
                supported.find(n => n === 'gemini-1.5-flash') ||
                supported.find(n => n.includes('1.5-flash')) ||
                supported.find(n => n.includes('2.0-flash')) ||
                supported.find(n => n.includes('1.5-pro')) ||
                supported[0];

            if (best) {
                cachedGeminiModel = best;
                lastModelCheckTime = Date.now();
                return best;
            }
        }
    } catch (e) {
        console.warn('Could not list Gemini models:', e.message);
    }

    return 'gemini-1.5-flash';
}

/**
 * Call Google Gemini API using dynamic verified model with auto-healing
 */
async function callGemini({ apiKey, systemPrompt, messages, imageBase64, mimeType = 'image/jpeg' }) {
    if (!apiKey) throw new Error('Gemini API key is not configured');

    const contents = [];

    // Format previous messages
    for (const m of messages) {
        contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }],
        });
    }

    // If an image was supplied with the latest user query
    if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const lastMsg = contents[contents.length - 1];
        const visionPrompt = 'Please carefully examine this product packaging photo. Read the brand name, product title, format (serum, cleanser, cream, etc.), and active ingredients printed on the label. Check our UK Brand Lover catalog context to see if we carry this exact product in stock or a direct same-category functional equivalent.';
        if (lastMsg && lastMsg.role === 'user') {
            lastMsg.parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64,
                },
            });
            if (!lastMsg.parts.some(p => p.text && p.text.trim().length > 10)) {
                lastMsg.parts.push({ text: visionPrompt });
            }
        } else {
            contents.push({
                role: 'user',
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: cleanBase64,
                        },
                    },
                    { text: visionPrompt },
                ],
            });
        }
    }

    const payload = {
        contents,
        system_instruction: {
            parts: [{ text: systemPrompt }],
        },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        },
    };

    const initialModel = await getWorkingGeminiModel(apiKey);
    const candidateModels = [initialModel, 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-pro']
        .filter(m => !m.includes('2.5') && !m.includes('8b'));
    const uniqueCandidates = [...new Set(candidateModels)];

    let lastError = null;

    for (const modelName of uniqueCandidates) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            // If system_instruction is not supported on this model, fallback with system prompt in user message
            if (!response.ok && response.status === 400) {
                const errText = await response.text();
                if (errText.includes('system_instruction')) {
                    const fallbackPayload = {
                        contents: [
                            { role: 'user', parts: [{ text: `System Directives:\n${systemPrompt}\n\nCustomer Message:\n${messages[messages.length - 1]?.content || 'Hello'}` }] }
                        ],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
                    };
                    response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fallbackPayload),
                        signal: controller.signal,
                    });
                } else {
                    cachedGeminiModel = null;
                    lastError = new Error(`Gemini ${modelName} 400: ${errText.substring(0, 200)}`);
                    clearTimeout(timeout);
                    continue;
                }
            }

            clearTimeout(timeout);

            if (!response.ok) {
                cachedGeminiModel = null;
                const errorText = await response.text();
                if (response.status === 404 || errorText.includes('no longer available') || response.status === 429) {
                    lastError = new Error(`Gemini model ${modelName} unavailable (${response.status})`);
                    continue;
                }
                throw new Error(`Gemini API error (${response.status})`);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error('Gemini returned an empty response');
            }

            cachedGeminiModel = modelName;
            return text;
        } catch (err) {
            clearTimeout(timeout);
            cachedGeminiModel = null;
            lastError = err;
            if (err.message && (err.message.includes('404') || err.message.includes('no longer available') || err.message.includes('429'))) {
                continue;
            }
        }
    }

    throw lastError || new Error('All Gemini model candidates failed');
}

/**
 * Call Groq Cloud API with multi-model fallback (llama-3.3-70b -> llama-3.1-8b -> gemma2-9b)
 */
async function callGroq({ apiKey, systemPrompt, messages, imageBase64 }) {
    if (!apiKey) throw new Error('Groq API key is not configured');

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
    ];

    for (const m of messages) {
        formattedMessages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content || '',
        });
    }

    const candidateModels = imageBase64
        ? ['llama-3.2-11b-vision-preview']
        : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

    if (imageBase64) {
        const cleanBase64 = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
        formattedMessages[formattedMessages.length - 1] = {
            role: 'user',
            content: [
                { type: 'text', text: messages[messages.length - 1]?.content || 'Analyze this product photo.' },
                { type: 'image_url', image_url: { url: cleanBase64 } },
            ],
        };
    }

    let lastError = null;

    for (const model of candidateModels) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: formattedMessages,
                    temperature: 0.7,
                    max_tokens: 1000,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                lastError = new Error(`Groq model ${model} failed (${response.status})`);
                continue;
            }

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) return text;
        } catch (err) {
            clearTimeout(timeout);
            lastError = err;
        }
    }

    throw lastError || new Error('All Groq model candidates failed');
}

/**
 * Call OpenRouter API with multi-model fallback across free models
 */
async function callOpenRouter({ apiKey, systemPrompt, messages, imageBase64 }) {
    if (!apiKey) throw new Error('OpenRouter API key is not configured');

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
    ];

    for (const m of messages) {
        formattedMessages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content || '',
        });
    }

    if (imageBase64) {
        const cleanBase64 = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
        formattedMessages[formattedMessages.length - 1] = {
            role: 'user',
            content: [
                { type: 'text', text: messages[messages.length - 1]?.content || 'Analyze this product photo.' },
                { type: 'image_url', image_url: { url: cleanBase64 } },
            ],
        };
    }

    const freeModels = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.1-8b-instruct:free',
        'mistralai/mistral-7b-instruct:free',
    ];

    let lastError = null;

    for (const model of freeModels) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://ukbrandlover.com',
                    'X-Title': 'UK Brand Lover Beauty Advisor',
                },
                body: JSON.stringify({
                    model,
                    messages: formattedMessages,
                    temperature: 0.7,
                    max_tokens: 1000,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                lastError = new Error(`OpenRouter model ${model} failed (${response.status})`);
                continue;
            }

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) return text;
        } catch (err) {
            clearTimeout(timeout);
            lastError = err;
        }
    }

    throw lastError || new Error('All OpenRouter model candidates failed');
}

/**
 * Smart Local Grounded Fallback Engine
 * Ensures 100% uptime: If API keys are not yet configured or cloud services are offline,
 * this engine matches live database products and adheres to the saleswoman persona protocol.
 * STRICT RULE: Only recommend when a true same-category, same-function product exists in stock.
 * NEVER slice random products.
 */
export function localGroundedAdvisor({ query, image = null, catalog, botName = 'Emma', customerName = null, isFollowUp = false }) {
    const q = (query || '').toLowerCase().trim();
    const inStockList = (catalog || []).filter(p => p.inStock && (p.stockCount === null || p.stockCount > 0));

    // Greeting: Real salesperson only greets in the initial welcome message; never repeats greetings in ongoing conversation
    const greeting = !isFollowUp && customerName ? `Hello ${customerName}! ` : (!isFollowUp ? 'Hello! ' : '');

    // 1. Check for product image / bottle photo
    let identifiedProductName = '';
    if (image) {
        try {
            const rawOcr = extractLocalOcrText(image);
            if (rawOcr) {
                identifiedProductName = formatExtractedProductTitle(rawOcr);
            }
        } catch {}
    }

    if (image || q.includes('sent product image') || q.includes('check this product')) {
        if (identifiedProductName) {
            const ocrLower = identifiedProductName.toLowerCase();
            const exactMatch = inStockList.find(p =>
                (p.name && ocrLower.includes(p.name.toLowerCase())) ||
                (p.name && p.name.toLowerCase().includes(ocrLower))
            );

            if (exactMatch) {
                return `I can see you've shared a bottle of **${identifiedProductName}**!

Good news! We have this exact item in stock from our verified UK shipment:
[[PRODUCT:${exactMatch.id}]]
It is 100% authentic with UK batch verification.

Shall I help you add this to your shopping bag?`;
            }

            // Check if there is an alternative in the exact same category
            const isOcrHair = /shampoo|conditioner|hair|scalp/i.test(identifiedProductName);
            const isOcrCleanser = /cleanser|face wash|wash|foam/i.test(identifiedProductName);
            const isOcrMoisturizer = /cream|lotion|moistur/i.test(identifiedProductName);
            const isOcrSerum = /serum|drop|ampoule/i.test(identifiedProductName);

            let altCandidate = null;
            if (isOcrHair) {
                altCandidate = inStockList.find(p => (p.category + ' ' + p.name).toLowerCase().includes('hair') || (p.category + ' ' + p.name).toLowerCase().includes('shampoo'));
            } else if (isOcrCleanser) {
                altCandidate = inStockList.find(p => (p.category + ' ' + p.name).toLowerCase().includes('cleans') || (p.category + ' ' + p.name).toLowerCase().includes('wash'));
            } else if (isOcrMoisturizer) {
                altCandidate = inStockList.find(p => (p.category + ' ' + p.name).toLowerCase().includes('moistur') || (p.category + ' ' + p.name).toLowerCase().includes('cream'));
            } else if (isOcrSerum) {
                altCandidate = inStockList.find(p => (p.category + ' ' + p.name).toLowerCase().includes('serum'));
            }

            if (altCandidate) {
                return `I can see you've shared a bottle of **${identifiedProductName}**.

We do not currently have this exact product in our verified UK stock right now.

However, from our authentic UK collection, this is our direct equivalent that does the same work:
[[PRODUCT:${altCandidate.id}]]

Would you like me to recommend this for your daily routine, or are you looking for another step?`;
            }

            return `I can see you've shared a bottle of **${identifiedProductName}**.

We do not currently have this exact product in our verified UK stock right now.

All our collections at UK Brand Lover are 100% authentic and imported directly from London, with new weekly air-freight arrivals.

Would you like me to recommend a suitable UK alternative for your hair or skin type, or are you looking for a specific step in your daily routine?`;
        }

        return `I can see you've shared a product packaging photo. While this specific formula is not currently in our verified UK stock right now, all our items at UK Brand Lover are 100% authentic and air-shipped directly from London.

Could you share the brand or product name printed on the bottle? I will check our UK stock and find the best match for you right away!`;
    }

    if (!q || q.length < 3) {
        return `${greeting}Delighted to assist you at UK Brand Lover. Every product in our boutique is 100% authentic and air-shipped directly from the UK. How can I assist you today? You can ask about product availability, skincare routines, or upload a photo of any product bottle to check our stock.`;
    }

    // 2. Detect requested product category / form factor
    const isSerum = /\b(serum|ampoule|drop|essence)\b/i.test(q);
    const isCleanser = /\b(cleanser|face wash|facewash|foam|cleansing gel)\b/i.test(q);
    const isMoisturizer = /\b(moisturizer|moisturiser|cream|lotion|barrier balm|gel cream)\b/i.test(q);
    const isSunscreen = /\b(sunscreen|sunblock|spf|sun protection|uv)\b/i.test(q);
    const isToner = /\b(toner|astringent|mist)\b/i.test(q);
    const isHair = /\b(hair|shampoo|conditioner|scalp)\b/i.test(q);
    const isBody = /\b(body lotion|body wash|shower gel|body cream)\b/i.test(q);

    // 3. Filter pool strictly by requested category if category was specified
    let candidatePool = inStockList;
    if (isSerum) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('serum') || str.includes('ampoule');
        });
    } else if (isCleanser) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('cleans') || str.includes('wash') || str.includes('foam');
        });
    } else if (isMoisturizer) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('moistur') || str.includes('cream') || str.includes('lotion') || str.includes('balm');
        });
    } else if (isSunscreen) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('sun') || str.includes('spf') || str.includes('uv');
        });
    } else if (isToner) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('toner') || str.includes('mist');
        });
    } else if (isHair) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('hair') || str.includes('shampoo') || str.includes('scalp');
        });
    } else if (isBody) {
        candidatePool = inStockList.filter(p => {
            const str = ((p.category || '') + ' ' + (p.name || '')).toLowerCase();
            return str.includes('body') || str.includes('shower');
        });
    }

    // 4. Direct title/brand match within candidate pool
    let matched = candidatePool.filter(p => {
        const nameMatch = p.name && (q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q));
        const brandMatch = p.brand && q.includes(p.brand.toLowerCase());
        return nameMatch || brandMatch;
    });

    // 5. Functional concern matching within candidate pool
    if (matched.length === 0) {
        if (q.includes('acne') || q.includes('pimple') || q.includes('blemish') || q.includes('salicylic')) {
            matched = candidatePool.filter(p => {
                const text = (p.name + ' ' + (p.description || '') + ' ' + (p.benefits || []).join(' ')).toLowerCase();
                return text.includes('acne') || text.includes('blemish') || text.includes('salicylic');
            });
        } else if (q.includes('dry') || q.includes('hydrat') || q.includes('hyaluronic') || q.includes('ceramide') || q.includes('barrier')) {
            matched = candidatePool.filter(p => {
                const text = (p.name + ' ' + (p.description || '') + ' ' + (p.benefits || []).join(' ')).toLowerCase();
                return text.includes('hydrat') || text.includes('hyaluronic') || text.includes('ceramide') || text.includes('barrier');
            });
        } else if (q.includes('glow') || q.includes('bright') || q.includes('vitamin c') || q.includes('dark spot') || q.includes('spot') || q.includes('pigment') || q.includes('glass skin')) {
            matched = candidatePool.filter(p => {
                const text = (p.name + ' ' + (p.description || '') + ' ' + (p.benefits || []).join(' ')).toLowerCase();
                return text.includes('bright') || text.includes('vitamin c') || text.includes('spot') || text.includes('arbutin') || text.includes('glow');
            });
        } else if (q.includes('sun') || q.includes('spf') || q.includes('uv')) {
            matched = candidatePool.filter(p => {
                const text = (p.name + ' ' + (p.description || '') + ' ' + (p.benefits || []).join(' ')).toLowerCase();
                return text.includes('sun') || text.includes('spf');
            });
        }
    }

    // 6. STRICT RULE: If no product in that specific category/function is in stock, NEVER push random items!
    if (matched.length === 0) {
        const categoryLabel = isSerum ? 'serum' : isCleanser ? 'cleanser' : isSunscreen ? 'sunscreen' : isMoisturizer ? 'moisturizer' : isToner ? 'toner' : 'skincare product';
        const leadText = isFollowUp
            ? `Regarding what you're looking for, we do not currently have that exact item or a direct UK equivalent ${categoryLabel} in our verified stock right now.`
            : `${greeting}Regarding what you're looking for, we do not currently have that exact item or a direct UK equivalent ${categoryLabel} in our verified stock right now.`;

        return `${leadText}

All our products at UK Brand Lover are 100% authentic and air-shipped directly from the UK, with new shipments arriving weekly.

Would you like me to recommend a suitable UK alternative for your specific skin concerns, or are you looking for another step in your daily routine?`;
    }

    const best = matched[0];
    const alt = matched.length > 1 ? matched[1] : null;

    const leadIn = isFollowUp
        ? `Regarding what you're looking for, this is the one I'd recommend first from our verified UK stock:`
        : `${greeting}Regarding what you're looking for, this is the one I'd recommend first from our verified UK stock:`;

    let response = `${leadIn}
[[PRODUCT:${best.id}]]
It is 100% authentic with UK batch verification and formulated to deliver visible results without irritation.`;

    if (alt) {
        response += `\n\nIf you'd like a complementary option in the same category, this one is also in stock:
[[PRODUCT:${alt.id}]]`;
    }

    response += `\n\nShall I help you add this to your bag, or would you like to know more about the formulation?`;
    return response;
}

/**
 * Main AI Execution function with Multi-Provider Fallback & 100% Resilience
 * Primary: Preferred Provider -> 1st Backup -> 2nd Backup -> Local Grounded Advisor
 */
export async function executeAiConsultation({ messages, image, user, modelPreference = 'pro' }) {
    // 1. Fetch live settings, store policies, and database catalog in parallel
    const [settings, catalog, storePolicies] = await Promise.all([
        getAiSettings(),
        getLiveCatalogContext(),
        getStorePoliciesContext(),
    ]);

    // 2. Format live catalog and customer context
    const catalogContext = formatCatalogPrompt(catalog);
    const customerContext = user
        ? `Logged-in customer name: ${user.name || 'Valued Customer'} (Email: ${user.email || 'N/A'}, ID: ${user.id || 'N/A'}). Use their name politely.`
        : 'Guest visitor (not logged in). Treat warmly with respectful hospitality.';

    // 3. Build Master System Prompt
    const systemPrompt = buildSaleswomanSystemPrompt({
        botName: settings.botName || 'Emma',
        storeName: 'UK Brand Lover',
        currency: '৳ (BDT)',
        catalogContext,
        storePolicies,
        adminExtraInstructions: settings.customInstructions || '',
        customerContext,
    });

    // 4. Determine provider sequence based on admin setting, user model preference, and image presence
    const providers = [];
    let preferred = settings.preferredProvider || 'gemini';

    // Prioritize Gemini whenever an image is present for superior OCR and bottle recognition
    if (image && settings.geminiKey) {
        preferred = 'gemini';
    } else if (modelPreference === 'fast' && settings.groqKey) {
        preferred = 'groq';
    } else if (modelPreference === 'pro' && settings.geminiKey) {
        preferred = 'gemini';
    }

    if (preferred === 'gemini') {
        providers.push({ name: 'gemini', key: settings.geminiKey, fn: callGemini });
        providers.push({ name: 'groq', key: settings.groqKey, fn: callGroq });
        providers.push({ name: 'openrouter', key: settings.openRouterKey, fn: callOpenRouter });
    } else if (preferred === 'groq' || preferred === 'grok') {
        providers.push({ name: 'groq', key: settings.groqKey, fn: callGroq });
        providers.push({ name: 'gemini', key: settings.geminiKey, fn: callGemini });
        providers.push({ name: 'openrouter', key: settings.openRouterKey, fn: callOpenRouter });
    } else {
        providers.push({ name: 'openrouter', key: settings.openRouterKey, fn: callOpenRouter });
        providers.push({ name: 'gemini', key: settings.geminiKey, fn: callGemini });
        providers.push({ name: 'groq', key: settings.groqKey, fn: callGroq });
    }

    let rawResponse = null;
    let successfulProvider = null;
    const errors = [];

    // 5. Try providers sequentially
    for (const prov of providers) {
        if (!prov.key || !prov.key.trim()) continue;

        try {
            rawResponse = await prov.fn({
                apiKey: prov.key.trim(),
                systemPrompt,
                messages,
                imageBase64: image,
            });

            if (rawResponse && rawResponse.trim()) {
                successfulProvider = prov.name;
                break;
            }
        } catch (err) {
            console.warn(`AI Provider "${prov.name}" fallback trigger:`, err.message);
            errors.push({ provider: prov.name, error: err.message });
        }
    }

    // 6. If all cloud models failed or no keys configured, use local grounded engine
    if (!rawResponse) {
        const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
        const isFollowUp = Array.isArray(messages) && messages.length > 1;
        rawResponse = localGroundedAdvisor({
            query: lastUserMessage,
            image: image || null,
            catalog,
            botName: settings.botName || 'Emma',
            customerName: user?.name || null,
            isFollowUp,
        });
        successfulProvider = 'local_grounded_engine';
    }

    // 7. Extract structured interactive product cards from live catalog
    const { message, cleanText, products } = extractProductCards(rawResponse, catalog);

    return {
        message, // Contains the full saleswoman text including [[PRODUCT:id]] tags for in-place card replacement
        cleanText, // Plain text with tags removed if needed
        products, // Array of verified product objects pulled from database
        provider: successfulProvider,
        errors: errors.length > 0 ? errors : undefined,
    };
}
