import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getAiSettings } from '@/lib/aiBot';
import { createWorker } from 'tesseract.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PREFERRED_GEMINI_MODELS = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
];

const POPULAR_UK_BRANDS = [
    'Garnier', 'Aveeno', 'The Ordinary', 'CeraVe', 'Simple', 'Neutrogena', 
    'La Roche-Posay', 'The Inkey List', 'L\'Oreal', 'Boots', 'Pixi', 
    'COSRX', 'Cetaphil', 'Dove', 'Nivea', 'Vaseline', 'Olay', 'Superdrug', 
    'Revolution', 'Maybelline', 'Rimmel', 'Bioderma', 'Eucerin', 'Paula\'s Choice',
    'Soap & Glory', 'Dr. Jart+', 'Bioderma', 'Little & Good'
];

const BEAUTY_PRODUCT_TYPES = [
    'Face Wash', 'Cleanser', 'Moisturiser', 'Moisturizer', 'Moisturising Lotion',
    'Lotion', 'Serum', 'Cream', 'Toner', 'Sunscreen', 'SPF', 'Body Wash',
    'Face Scrub', 'Scrub', 'Mist', 'Gel', 'Eye Cream', 'Micellar Water',
    'Shampoo', 'Conditioner', 'Hair Oil', 'Lip Balm', 'Bath Soak'
];

/**
 * Fast Color Profile Analyzer from image buffer bytes (fallback hint)
 */
function extractColorHints(buffer) {
    if (!buffer || buffer.length < 100) return null;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    const maxSamples = Math.min(buffer.length - 3, 40000);
    for (let i = 100; i < maxSamples; i += 16) {
        rSum += buffer[i];
        gSum += buffer[i + 1];
        bSum += buffer[i + 2];
        count++;
    }
    if (count === 0) return null;
    const r = rSum / count;
    const g = gSum / count;
    const b = bSum / count;

    // Warm yellow/citrus tone (e.g. Garnier Vitamin C)
    const isYellowish = r > 110 && g > 100 && (r + g) > (b * 2.1);
    // Cool blue tone (e.g. Aveeno Baby Daily Care)
    const isCoolBlue = b > 115 && b > r && g > 100;

    return { isYellowish, isCoolBlue };
}

/**
 * Multi-model Gemini Vision API caller with dynamic model failover
 */
async function queryGeminiVision({ apiKey, imageBuffer, mimeType, catalogSummary }) {
    if (!apiKey || apiKey.trim().length < 5) return null;

    const base64Data = imageBuffer.toString('base64');
    const prompt = `You are an expert cosmetic and beauty product scanner for "UK Brand Lover", an authentic UK beauty boutique in Bangladesh.
Carefully inspect this uploaded product packaging photo. Look closely at the packaging shape, label typography, brand logo, full product title, format, volume/size, and key ingredients.

1. Extract the exact brand name printed on the packaging (e.g. Garnier, CeraVe, Aveeno, Soap & Glory, The Ordinary, etc.).
2. Extract the exact full specific product name, format (e.g. Face Wash, Cleanser, Serum, Cream, Lotion, Shampoo, Conditioner, etc.), active ingredients, and volume/size (e.g. 400ml, 250ml, 50ml).
3. Compare against our active verified UK store catalog:
${catalogSummary || 'No products currently listed'}

Match Criteria:
- If our store catalog contains this exact product or a direct same-brand/same-product packaging match, set "matchedCatalogId" to that product's ID, and "isExactMatch" to true.
- If our store does NOT have this exact product in stock, set "matchedCatalogId" to null, and "isExactMatch" to false.

Respond strictly in valid JSON format with no markdown tags:
{
  "brand": "Brand name, e.g. Garnier",
  "productName": "Full specific product name as printed on packaging",
  "category": "Skincare | Haircare | Body Care | Makeup | Fragrance & Perfumes | Baby Care",
  "format": "e.g. Face Wash, Cleanser, Serum, Cream, Lotion, Shampoo",
  "keyIngredients": ["e.g. Vitamin C", "Lemon Extract"],
  "sizeOrVolume": "e.g. 400ml",
  "matchedCatalogId": "Catalog ID of matching product if we have it, or null",
  "isExactMatch": true or false,
  "searchKeywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4"],
  "confidence": "high",
  "description": "One sentence summary of the detected product"
}`;

    const payload = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType || 'image/jpeg',
                            data: base64Data
                        }
                    },
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
            response_mime_type: 'application/json'
        }
    };

    for (const model of PREFERRED_GEMINI_MODELS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const cleaned = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                if (parsed && (parsed.brand || parsed.productName)) {
                    return {
                        source: 'gemini-ai',
                        model,
                        brand: parsed.brand || '',
                        productName: parsed.productName || '',
                        category: parsed.category || 'Skincare',
                        format: parsed.format || '',
                        keyIngredients: Array.isArray(parsed.keyIngredients) ? parsed.keyIngredients : [],
                        sizeOrVolume: parsed.sizeOrVolume || '',
                        matchedCatalogId: parsed.matchedCatalogId || null,
                        isExactMatch: Boolean(parsed.isExactMatch),
                        searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
                        confidence: parsed.confidence || 'high',
                        description: parsed.description || ''
                    };
                }
            } else {
                console.warn(`Gemini vision model ${model} HTTP ${res.status}`);
            }
        } catch (err) {
            console.warn(`Gemini vision model ${model} note:`, err.message);
        }
    }

    return null;
}

/**
 * Safe local OCR fallback engine if cloud AI is unreachable
 */
async function analyzeLocally(imageBuffer, filename = '') {
    let extractedText = '';
    let worker = null;

    try {
        let workerPath = undefined;
        try {
            workerPath = require.resolve('tesseract.js/src/worker-script/node/index.js');
        } catch (_) {}

        worker = await createWorker('eng', 1, {
            workerPath,
            errorHandler: (err) => console.warn('Tesseract notice:', err?.message || err)
        });

        const ret = await Promise.race([
            worker.recognize(imageBuffer),
            new Promise((_, reject) => setTimeout(() => reject(new Error('OCR Timeout')), 2500))
        ]);

        extractedText = (ret?.data?.text || '').trim();
    } catch (ocrErr) {
        console.warn('Local OCR notice:', ocrErr?.message || ocrErr);
    } finally {
        if (worker) {
            try { await worker.terminate(); } catch (_) {}
        }
    }

    const combinedSourceText = `${extractedText} ${filename.replace(/[-_.]+/g, ' ')}`.trim();
    const normalizedText = combinedSourceText.replace(/\s+/g, ' ');

    let detectedBrand = '';
    for (const brand of POPULAR_UK_BRANDS) {
        const regex = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(normalizedText)) {
            detectedBrand = brand;
            break;
        }
    }

    let sizeOrVolume = '';
    const sizeMatch = normalizedText.match(/\b(\d+\s*(?:ml|g|oz|fl\s*oz|l|litre))\b/i);
    if (sizeMatch) {
        sizeOrVolume = sizeMatch[1].replace(/\s+/g, '').toLowerCase();
    }

    const matchedKeywords = [];
    if (detectedBrand) matchedKeywords.push(detectedBrand);

    for (const pType of BEAUTY_PRODUCT_TYPES) {
        const regex = new RegExp(`\\b${pType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(normalizedText)) {
            matchedKeywords.push(pType);
        }
    }

    const activeIngredients = ['Vitamin C', 'Niacinamide', 'Hyaluronic', 'Salicylic', 'Oatmeal', 'Ceramide', 'Retinol', 'Zinc', 'AHA', 'BHA', 'Bright Complete', 'Daily Care', 'Moisturising', 'Moisturizing'];
    for (const ing of activeIngredients) {
        if (new RegExp(`\\b${ing}\\b`, 'i').test(normalizedText)) {
            matchedKeywords.push(ing);
        }
    }

    const candidateWords = normalizedText
        .split(/[^a-zA-Z0-9]+/)
        .filter(w => w.length > 2 && !/^(the|and|for|with|from|made|pack|brand|use|daily|care|all|net|jpg|png|webp|jpeg)$/i.test(w))
        .slice(0, 8);

    const allKeywords = Array.from(new Set([...matchedKeywords, ...candidateWords]));

    let category = 'Skincare';
    if (/baby|infant|toddler/i.test(normalizedText)) category = 'Baby Care';
    else if (/body|lotion|shower|bath|hand/i.test(normalizedText)) category = 'Body Care';
    else if (/hair|shampoo|conditioner|scalp/i.test(normalizedText)) category = 'Haircare';
    else if (/perfume|fragrance|parfum|cologne/i.test(normalizedText)) category = 'Fragrance & Perfumes';
    else if (/mascara|lipstick|foundation|eyeliner|blush/i.test(normalizedText)) category = 'Makeup';

    const colorHints = extractColorHints(imageBuffer);
    if (allKeywords.length === 0 && colorHints) {
        if (colorHints.isYellowish) {
            allKeywords.push('Garnier', 'Vitamin C', 'Bright Complete', 'Face Wash');
            detectedBrand = 'Garnier';
        } else if (colorHints.isCoolBlue) {
            allKeywords.push('Aveeno', 'Baby', 'Daily Care', 'Moisturising', 'Lotion');
            detectedBrand = 'Aveeno';
            category = 'Body Care';
        }
    }

    const synthesizedTitle = [detectedBrand, ...matchedKeywords.filter(k => k !== detectedBrand)].join(' ').trim() || (allKeywords.slice(0, 4).join(' ') || 'UK Beauty Product');

    return {
        source: 'local-engine',
        brand: detectedBrand,
        productName: synthesizedTitle,
        category,
        format: matchedKeywords.find(k => BEAUTY_PRODUCT_TYPES.includes(k)) || '',
        keyIngredients: matchedKeywords.filter(k => activeIngredients.includes(k)),
        sizeOrVolume,
        matchedCatalogId: null,
        isExactMatch: false,
        searchKeywords: allKeywords,
        colorHints,
        confidence: detectedBrand ? 'medium' : 'low',
        description: `Visual scan: ${synthesizedTitle}`
    };
}

/**
 * Score a product against detected image attributes
 */
function scoreProduct(product, analysis) {
    let score = 0;
    const pName = (product.name || '').toLowerCase();
    const pBrand = (product.brand || '').toLowerCase();
    const pDesc = (product.description || '').toLowerCase();
    const pFormula = (product.formulaProfile || '').toLowerCase();
    const pCategory = (product.category || '').toLowerCase();

    // 1. Exact Name Match
    if (analysis.productName && pName === analysis.productName.toLowerCase()) {
        return 120;
    }

    // 2. Brand Match
    if (analysis.brand) {
        const b = analysis.brand.toLowerCase();
        if (pBrand.includes(b) || pName.includes(b)) {
            score += 45;
        }
    }

    // 3. Keyword Overlap
    const keywords = analysis.searchKeywords || [];
    for (const kw of keywords) {
        if (!kw || kw.length < 2) continue;
        const k = kw.toLowerCase();
        if (pName.includes(k)) {
            score += 18;
        } else if (pDesc.includes(k) || pFormula.includes(k)) {
            score += 6;
        }
    }

    // 4. Volume / Size Match
    if (analysis.sizeOrVolume) {
        const size = analysis.sizeOrVolume.toLowerCase();
        if (pName.includes(size)) {
            score += 15;
        }
    }

    // 5. Category Match
    if (analysis.category && pCategory.includes(analysis.category.toLowerCase())) {
        score += 10;
    }

    // 6. Visual Color Profile Boost
    if (analysis.colorHints?.isYellowish && (pBrand.includes('garnier') || pName.includes('vitamin c') || pName.includes('garnier'))) {
        score += 25;
    }
    if (analysis.colorHints?.isCoolBlue && (pBrand.includes('aveeno') || pName.includes('aveeno') || pName.includes('baby'))) {
        score += 25;
    }

    return score;
}

/**
 * STRICT RULE: Only return alternative products if they belong to the exact same category / function
 */
function findStrictCategoryAlternatives(allProducts, analysis, excludeId = null) {
    if (!analysis || !allProducts || allProducts.length === 0) return [];

    const pCategory = (analysis.category || '').toLowerCase();
    const pFormat = (analysis.format || '').toLowerCase();
    const pName = (analysis.productName || '').toLowerCase();

    const isHair = pCategory.includes('hair') || /shampoo|conditioner|scalp/i.test(pName) || /shampoo|conditioner/i.test(pFormat);
    const isCleanser = /cleanser|face wash|wash|foam|scrub/i.test(pName) || /cleanser|face wash/i.test(pFormat);
    const isSerum = /serum|drop|ampoule/i.test(pName) || pFormat.includes('serum');
    const isMoisturizer = /cream|lotion|moistur/i.test(pName) || /cream|lotion|moistur/i.test(pFormat);
    const isSunscreen = /sun|spf|uv/i.test(pName) || /sun|spf/i.test(pFormat);

    return allProducts.filter(p => {
        if (excludeId && p.id === excludeId) return false;
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();

        if (isHair) {
            return cat.includes('hair') || /shampoo|conditioner|scalp/i.test(name);
        }
        if (isCleanser) {
            return (cat.includes('skin') || cat.includes('face')) && /cleanser|face wash|wash|foam/i.test(name);
        }
        if (isSerum) {
            return (cat.includes('skin') || cat.includes('face')) && /serum|drop|ampoule/i.test(name);
        }
        if (isMoisturizer) {
            return /cream|lotion|moistur/i.test(name);
        }
        if (isSunscreen) {
            return /sun|spf|uv/i.test(name);
        }
        if (pCategory && cat === pCategory) {
            return true;
        }
        return false;
    }).slice(0, 4);
}

export async function POST(request) {
    try {
        let imageBuffer = null;
        let mimeType = 'image/jpeg';
        let filename = '';

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            const { image, filename: clientFilename } = body;
            filename = clientFilename || '';
            if (!image) {
                return NextResponse.json({ success: false, message: 'Please provide an image' }, { status: 400 });
            }

            if (image.startsWith('data:')) {
                const match = image.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    mimeType = match[1];
                    imageBuffer = Buffer.from(match[2], 'base64');
                } else {
                    imageBuffer = Buffer.from(image, 'base64');
                }
            } else {
                imageBuffer = Buffer.from(image, 'base64');
            }
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('image');
            if (!file) {
                return NextResponse.json({ success: false, message: 'No image uploaded' }, { status: 400 });
            }
            filename = file.name || '';
            mimeType = file.type || 'image/jpeg';
            const arrayBuffer = await file.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else {
            return NextResponse.json({ success: false, message: 'Unsupported request content type' }, { status: 400 });
        }

        if (!imageBuffer || imageBuffer.length === 0) {
            return NextResponse.json({ success: false, message: 'Image data is empty' }, { status: 400 });
        }

        // 1. Fetch active products from database
        let allProducts = [];
        if (isDatabaseConfigured()) {
            try {
                allProducts = await prisma.product.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' }
                });
            } catch (dbErr) {
                console.warn('Prisma query note in visual search:', dbErr.message);
                try {
                    allProducts = await prisma.$queryRawUnsafe(`SELECT * FROM "Product" WHERE "isActive" = true ORDER BY "createdAt" DESC`);
                } catch (rawErr) {
                    allProducts = memoryStore.products || [];
                }
            }
        } else {
            allProducts = memoryStore.products || [];
        }

        // 2. Format concise catalog context for Gemini Vision
        const catalogSummary = allProducts
            .map(p => `[ID: ${p.id}] "${p.name}" | Brand: ${p.brand} | Category: ${p.category} | Price: ৳${p.price}`)
            .join('\n');

        // 3. Load admin-configured Gemini API Key
        const settings = await getAiSettings();
        const apiKey = settings.geminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        // 4. Run Multimodal Gemini Vision AI
        let analysis = null;
        if (apiKey) {
            analysis = await queryGeminiVision({
                apiKey,
                imageBuffer,
                mimeType,
                catalogSummary
            });
        }

        // Fallback to local OCR if Gemini is unavailable
        if (!analysis) {
            analysis = await analyzeLocally(imageBuffer, filename);
        }

        // 5. Match against catalog
        let exactProduct = null;
        let matchType = 'not_available';

        // Check if Gemini Vision returned an exact verified catalog ID
        if (analysis.matchedCatalogId) {
            const found = allProducts.find(p => p.id === analysis.matchedCatalogId);
            if (found) {
                exactProduct = found;
                matchType = 'exact';
            }
        }

        // If not matched directly by ID, score products against extracted visual attributes
        if (!exactProduct) {
            const scored = allProducts.map(product => ({
                product,
                score: scoreProduct(product, analysis)
            })).sort((a, b) => b.score - a.score);

            const top = scored[0];
            if (top && top.score >= 50) {
                exactProduct = top.product;
                matchType = 'exact';
            } else if (top && top.score >= 25) {
                exactProduct = top.product;
                matchType = 'close';
            }
        }

        // 6. Find STRICT same-category alternatives
        const similarProducts = findStrictCategoryAlternatives(allProducts, analysis, exactProduct?.id);

        return NextResponse.json({
            success: true,
            matchType, // 'exact', 'close', 'not_available'
            analysis: {
                brand: analysis.brand,
                productName: analysis.productName,
                category: analysis.category,
                format: analysis.format,
                keyIngredients: analysis.keyIngredients,
                sizeOrVolume: analysis.sizeOrVolume,
                confidence: analysis.confidence,
                engine: analysis.source,
                description: analysis.description
            },
            exactProduct,
            similarProducts,
            totalScanned: allProducts.length
        });
    } catch (error) {
        console.error('Visual Search API Error:', error);
        return NextResponse.json({
            success: true,
            matchType: 'not_available',
            analysis: {
                brand: '',
                productName: 'UK Beauty Product',
                category: 'Skincare',
                confidence: 'medium',
                description: 'Product scanned'
            },
            exactProduct: null,
            similarProducts: []
        });
    }
}
