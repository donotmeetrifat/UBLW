import prisma, { isDatabaseConfigured } from './prisma.js';

// Default system persona prompt
export const DEFAULT_AI_INSTRUCTIONS = `You are Emma, the Senior UK Beauty Consultant & Sourcing Specialist at "UK Brand Lover" (ukbrandlover.com), Bangladesh's premier boutique for 100% authentic UK skincare, haircare, and cosmetics.

YOUR PERSONALITY & SALES OBJECTIVES:
1. CHARMING & TRUSTWORTHY: Speak warmly, politely, and eloquently with British boutique charm (occasional natural British phrasing like "darling", "delighted to help", "brilliant choice", "absolutely authentic"). Win the customer's trust first before pushing any sale.
2. EXPERT CONSULTATION: Act like a seasoned luxury department store beauty advisor (like at Harrods, Boots Flagship, or Selfridges). Ask about their skin type (oily, dry, sensitive, combination), current concerns (pigmentation, barrier damage, acne, anti-aging, dullness), and explain active ingredients (Niacinamide, Retinol, Salicylic Acid, Hyaluronic Acid, Vitamin C, Ceramides) clearly.
3. STRATEGIC & PERSUASIVE SALESMANSHIP:
   - When a product is IN STOCK: Enthusiastically confirm we have it fresh in stock direct from the UK. Highlight its benefits, why it will transform their skin, quote the exact BDT price, and encourage them to order before our current air-freight batch sells out.
   - When a product is OUT OF STOCK or NOT IN OUR CATALOG: Never leave the customer empty-handed! Acknowledge their choice warmly, then persuasively guide them to the BEST in-stock UK alternative from our catalog. Explain why the alternative formulation is equally or even more effective for their skin concern. Also let them know: "If your heart is set on this exact item, our London sourcing team can bring it in on our next flight via our VIP WhatsApp Concierge!"
4. ACCURACY GUARANTEE: ONLY recommend products and quote prices that exist in the LIVE CATALOG provided below. Never make up fictional products or inaccurate prices.
5. PRODUCT TAGGING: Whenever you recommend or discuss specific products from our catalog, ALWAYS reference them with the exact tag format: [PRODUCT: <productId>] in your reply. You may include up to 3 product tags per response so the interactive product card appears in the chat.
6. PRODUCT IMAGE ANALYSIS: If the user uploads or snaps an image of a bottle or cosmetic product, accurately identify the brand, product title, and key ingredients. Check if it matches an item in our catalog, and provide your expert advisory.
7. LOCAL CONVENIENCE: Mention that we offer nationwide Cash on Delivery (COD), fast inside-Dhaka delivery (within 24-48 hours), and an unconditional 100% money-back authenticity guarantee with authentic batch code verification.`;

/**
 * Retrieve AI settings from Setting table + env fallback
 */
export async function getAiSettings() {
    let settings = {
        geminiKey: process.env.GEMINI_API_KEY || '',
        grokKey: process.env.GROK_API_KEY || '',
        openRouterKey: process.env.OPENROUTER_API_KEY || '',
        preferredProvider: 'gemini', // 'gemini' | 'grok' | 'openrouter'
        customInstructions: '',
        botName: 'Emma - UK Beauty Specialist',
        enabled: true,
    };

    if (isDatabaseConfigured() && prisma.setting) {
        try {
            const records = await prisma.setting.findMany({
                where: {
                    key: {
                        in: [
                            'ai_gemini_api_key',
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
            if (map.ai_grok_api_key) settings.grokKey = map.ai_grok_api_key;
            if (map.ai_openrouter_api_key) settings.openRouterKey = map.ai_openrouter_api_key;
            if (map.ai_preferred_provider) settings.preferredProvider = map.ai_preferred_provider;
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
export async function saveAiSettings({ geminiKey, grokKey, openRouterKey, preferredProvider, customInstructions, botName, enabled }) {
    if (!isDatabaseConfigured()) return false;

    const upserts = [];

    if (geminiKey !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_gemini_api_key' },
                update: { value: geminiKey.trim() },
                create: { key: 'ai_gemini_api_key', value: geminiKey.trim() },
            })
        );
    }
    if (grokKey !== undefined) {
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_grok_api_key' },
                update: { value: grokKey.trim() },
                create: { key: 'ai_grok_api_key', value: grokKey.trim() },
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
        upserts.push(
            prisma.setting.upsert({
                where: { key: 'ai_preferred_provider' },
                update: { value: preferredProvider },
                create: { key: 'ai_preferred_provider', value: preferredProvider },
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
 * Fetch real-time active catalog from database
 * Immediately updates whenever any product is added or edited in the website
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
            },
            take: 120, // ample coverage of active inventory
            orderBy: [{ inStock: 'desc' }, { views: 'desc' }, { updatedAt: 'desc' }],
        });

        return products;
    } catch (e) {
        console.error('Error fetching live catalog for AI bot:', e.message);
        return [];
    }
}

/**
 * Format catalog list into a compact string prompt context
 */
export function formatCatalogPrompt(products) {
    if (!products || products.length === 0) {
        return 'No products currently active in store catalog.';
    }

    return products
        .map((p, idx) => {
            const stockStatus = p.inStock && (p.stockCount === null || p.stockCount > 0)
                ? `IN STOCK (${p.stockCount || 50} units)`
                : 'OUT OF STOCK';
            const benefitsList = Array.isArray(p.benefits) && p.benefits.length > 0 ? p.benefits.join(', ') : 'Standard UK formula';
            const formula = p.formulaProfile ? ` | Key Ingredients: ${p.formulaProfile}` : '';
            return `${idx + 1}. [ID: ${p.id}] "${p.name}" by ${p.brand} | Category: ${p.category} | Price: ৳${p.price} (MRP: ৳${p.mrp}) | Status: ${stockStatus} | Benefits: ${benefitsList}${formula}`;
        })
        .join('\n');
}

/**
 * Parse [PRODUCT: <productId>] tags from AI response and fetch full product cards
 */
export function extractProductCards(responseText, catalog) {
    const productMap = new Map();
    catalog.forEach(p => productMap.set(p.id, p));

    const matchedIds = new Set();
    const regex = /\[PRODUCT:\s*([a-zA-Z0-9_\-]+)\]/gi;
    let match;

    while ((match = regex.exec(responseText)) !== null) {
        matchedIds.add(match[1]);
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

    // Clean out the raw [PRODUCT: id] tags from visible text for a polished reading experience
    const cleanText = responseText.replace(/\[PRODUCT:\s*([a-zA-Z0-9_\-]+)\]/gi, '').trim();

    return { cleanText, products: cards.slice(0, 4) };
}

/**
 * Call Google Gemini API
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
        if (lastMsg && lastMsg.role === 'user') {
            lastMsg.parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64,
                },
            });
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
                    { text: 'Please analyze this product photo, tell me if UK Brand Lover has it in stock, and give your beauty advisory.' },
                ],
            });
        }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 300)}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error('Gemini returned an empty response');
        }

        return text;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

/**
 * Call xAI Grok API (OpenAI-compatible)
 */
async function callGrok({ apiKey, systemPrompt, messages, imageBase64 }) {
    if (!apiKey) throw new Error('Grok API key is not configured');

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: imageBase64 ? 'grok-2-vision-1212' : 'grok-beta',
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1000,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Grok API error (${response.status}): ${err.substring(0, 300)}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text) throw new Error('Grok returned an empty response');

        return text;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

/**
 * Call OpenRouter API (OpenAI-compatible, free models supported)
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

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
                model: 'google/gemini-2.0-flash-exp:free',
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1000,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter API error (${response.status}): ${err.substring(0, 300)}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text) throw new Error('OpenRouter returned an empty response');

        return text;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

/**
 * Smart Local Grounded Fallback Engine
 * Ensures 100% uptime: If API keys are not yet configured or all external networks are down,
 * this engine analyzes query keywords, concerns, and live catalog to provide a helpful advisory.
 */
function localGroundedAdvisor({ query, catalog, customInstructions }) {
    const q = (query || '').toLowerCase();

    // Find best matching products
    const inStockList = catalog.filter(p => p.inStock);
    let matched = inStockList.filter(p => {
        const nameMatch = p.name && q.includes(p.name.toLowerCase());
        const brandMatch = p.brand && q.includes(p.brand.toLowerCase());
        const catMatch = p.category && q.includes(p.category.toLowerCase());
        return nameMatch || brandMatch || catMatch;
    });

    if (matched.length === 0) {
        // Match by skin concern keywords
        if (q.includes('acne') || q.includes('pimple') || q.includes('blemish') || q.includes('salicylic')) {
            matched = inStockList.filter(p => (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('acne') || (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('blemish') || p.category.toLowerCase().includes('skincare'));
        } else if (q.includes('dry') || q.includes('hydrat') || q.includes('hyaluronic') || q.includes('moistur')) {
            matched = inStockList.filter(p => (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('hydrat') || (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('moistur') || p.category.toLowerCase().includes('skincare'));
        } else if (q.includes('glow') || q.includes('bright') || q.includes('vitamin c') || q.includes('spot') || q.includes('pigment')) {
            matched = inStockList.filter(p => (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('bright') || (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('glow') || (p.description + (p.benefits || []).join(' ')).toLowerCase().includes('vitamin'));
        } else {
            // High-converting flagship best sellers
            matched = inStockList.slice(0, 3);
        }
    }

    const topProducts = matched.slice(0, 2);
    const tags = topProducts.map(p => `[PRODUCT: ${p.id}]`).join(' ');

    if (topProducts.length > 0) {
        const main = topProducts[0];
        return `Hello darling! Delighted to assist you at UK Brand Lover. 

Regarding your inquiry, I highly recommend our authentic UK-imported **${main.name}** by ${main.brand}! It is currently **fresh in stock** for ৳${main.price} (direct London air shipment).

${main.benefits && main.benefits.length > 0 ? `It specifically targets ${main.benefits.slice(0, 2).join(' & ')} to give you visible, glowing results.` : 'It is formulated to British dermatological standards with verified authenticity batch codes.'}

We offer fast delivery across Bangladesh with Cash on Delivery (COD) and an unconditional 100% authenticity money-back guarantee. You can view full details or add it directly to your shopping bag right below!

${tags}`;
    }

    return `Hello darling! Thank you so much for reaching out to UK Brand Lover. Every single product in our boutique is 100% genuine and sourced directly from London, UK. 

Could you share your skin type (oily, dry, sensitive, or combination) or what specific results you are looking for? I would love to tailor the perfect UK routine for you!`;
}

/**
 * Main AI Execution function with Multi-Provider Fallback
 * Primary: Gemini -> 1st Backup: Grok -> 2nd Backup: OpenRouter -> 3rd Backup: Local Advisor
 */
export async function executeAiConsultation({ messages, image, user }) {
    // 1. Fetch live settings and catalog
    const [settings, catalog] = await Promise.all([
        getAiSettings(),
        getLiveCatalogContext(),
    ]);

    // 2. Build live catalog grounding prompt
    const catalogText = formatCatalogPrompt(catalog);
    let systemPrompt = `${DEFAULT_AI_INSTRUCTIONS}\n\nLIVE UK BRAND LOVER CATALOG (DYNAMIC REAL-TIME WEBSITE DATABASE):\n${catalogText}`;

    if (settings.customInstructions && settings.customInstructions.trim()) {
        systemPrompt += `\n\nADDITIONAL STORE ADMIN INSTRUCTIONS:\n${settings.customInstructions.trim()}`;
    }

    // 3. Determine provider sequence
    const providers = [];
    const preferred = settings.preferredProvider || 'gemini';

    if (preferred === 'gemini') {
        providers.push({ name: 'gemini', key: settings.geminiKey, fn: callGemini });
        providers.push({ name: 'grok', key: settings.grokKey, fn: callGrok });
        providers.push({ name: 'openrouter', key: settings.openRouterKey, fn: callOpenRouter });
    } else if (preferred === 'grok') {
        providers.push({ name: 'grok', key: settings.grokKey, fn: callGrok });
        providers.push({ name: 'gemini', key: settings.geminiKey, fn: callGemini });
        providers.push({ name: 'openrouter', key: settings.openRouterKey, fn: callOpenRouter });
    } else {
        providers.push({ name: 'openrouter', key: settings.openRouterKey, fn: callOpenRouter });
        providers.push({ name: 'gemini', key: settings.geminiKey, fn: callGemini });
        providers.push({ name: 'grok', key: settings.grokKey, fn: callGrok });
    }

    let rawResponse = null;
    let successfulProvider = null;
    const errors = [];

    // 4. Try providers sequentially
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
            console.warn(`AI Provider "${prov.name}" failed:`, err.message);
            errors.push({ provider: prov.name, error: err.message });
        }
    }

    // 5. If all cloud models failed or no keys configured, use local grounded engine
    if (!rawResponse) {
        const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
        rawResponse = localGroundedAdvisor({
            query: lastUserMessage,
            catalog,
            customInstructions: settings.customInstructions,
        });
        successfulProvider = 'local_grounded_engine';
    }

    // 6. Extract structured interactive product cards
    const { cleanText, products } = extractProductCards(rawResponse, catalog);

    return {
        message: cleanText,
        products,
        provider: successfulProvider,
        errors: errors.length > 0 ? errors : undefined,
    };
}
