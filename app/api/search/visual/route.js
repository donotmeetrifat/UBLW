import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { GoogleGenAI } from '@google/genai';
import { createWorker } from 'tesseract.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow sufficient time for vision/OCR processing

const POPULAR_UK_BRANDS = [
    'Garnier', 'Aveeno', 'The Ordinary', 'CeraVe', 'Simple', 'Neutrogena', 
    'La Roche-Posay', 'The Inkey List', 'L\'Oreal', 'Boots', 'Pixi', 
    'COSRX', 'Cetaphil', 'Dove', 'Nivea', 'Vaseline', 'Olay', 'Superdrug', 
    'Revolution', 'Maybelline', 'Rimmel', 'Bioderma', 'Eucerin', 'Paula\'s Choice'
];

const BEAUTY_PRODUCT_TYPES = [
    'Face Wash', 'Cleanser', 'Moisturiser', 'Moisturizer', 'Moisturising Lotion',
    'Lotion', 'Serum', 'Cream', 'Toner', 'Sunscreen', 'SPF', 'Body Wash',
    'Face Scrub', 'Scrub', 'Mist', 'Gel', 'Eye Cream', 'Micellar Water',
    'Shampoo', 'Conditioner', 'Hair Oil', 'Lip Balm', 'Bath Soak'
];

/**
 * Intelligent Image Analysis Engine
 * Uses Gemini 3.8 Flash Multimodal AI when an API key is available,
 * with an automatic fallback to local Tesseract OCR + cosmetic dictionary matching.
 */
async function analyzeProductImage(imageBuffer, mimeType) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. Try Gemini Vision AI if API key is configured
    if (apiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            const base64Data = imageBuffer.toString('base64');

            const prompt = `You are an expert cosmetic and beauty product analyst for "UK Brand Lover", an authentic UK-imported beauty store in Bangladesh.
Carefully inspect this product image. Look at the packaging, brand logo, product title, active ingredients, volume (e.g. 400ml, 250ml), and product type.
Identify the exact product information and respond in strictly valid JSON format with no markdown formatting:
{
  "brand": "Brand name, e.g. Garnier, Aveeno, CeraVe, The Ordinary, etc.",
  "productName": "Full specific product title as printed on bottle/box",
  "category": "One of: Skincare, Makeup, Haircare, Body Care, Fragrance & Perfumes, Personal Care, Baby Care, Beauty Accessories",
  "keyIngredients": ["e.g. Vitamin C", "Colloidal Oatmeal", "Salicylic Acid"],
  "sizeOrVolume": "e.g. 400ml, 250ml, 50ml, etc.",
  "searchKeywords": ["List of 4-6 most important keywords to find this product in our database, e.g. Garnier, Bright Complete, Vitamin C, Face Wash, 400ml"],
  "confidence": "high",
  "description": "One sentence summary of the identified product"
}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType || 'image/jpeg',
                                    data: base64Data
                                }
                            },
                            { text: prompt }
                        ]
                    }
                ],
                config: {
                    responseMimeType: 'application/json',
                }
            });

            const rawText = response.text || '';
            const cleaned = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (parsed && (parsed.brand || parsed.productName)) {
                return {
                    source: 'gemini-ai',
                    brand: parsed.brand || '',
                    productName: parsed.productName || '',
                    category: parsed.category || 'Skincare',
                    keyIngredients: Array.isArray(parsed.keyIngredients) ? parsed.keyIngredients : [],
                    sizeOrVolume: parsed.sizeOrVolume || '',
                    searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
                    confidence: parsed.confidence || 'high',
                    description: parsed.description || ''
                };
            }
        } catch (geminiError) {
            console.warn('Gemini vision analysis note, switching to OCR engine fallback:', geminiError.message);
        }
    }

    // 2. High-Accuracy Local OCR Fallback (Tesseract.js)
    try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imageBuffer);
        await worker.terminate();

        const fullText = (ret?.data?.text || '').trim();
        const normalizedText = fullText.replace(/\s+/g, ' ');

        // Detect Brand
        let detectedBrand = '';
        for (const brand of POPULAR_UK_BRANDS) {
            const regex = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(normalizedText)) {
                detectedBrand = brand;
                break;
            }
        }

        // Detect Volume / Size
        let sizeOrVolume = '';
        const sizeMatch = normalizedText.match(/\b(\d+\s*(?:ml|g|oz|fl\s*oz|l|litre))\b/i);
        if (sizeMatch) {
            sizeOrVolume = sizeMatch[1].replace(/\s+/g, '').toLowerCase();
        }

        // Detect Product Type / Keywords
        const matchedKeywords = [];
        if (detectedBrand) matchedKeywords.push(detectedBrand);

        for (const pType of BEAUTY_PRODUCT_TYPES) {
            const regex = new RegExp(`\\b${pType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(normalizedText)) {
                matchedKeywords.push(pType);
            }
        }

        // Extract key capitalized words or known active ingredients
        const activeIngredients = ['Vitamin C', 'Niacinamide', 'Hyaluronic', 'Salicylic', 'Oatmeal', 'Ceramide', 'Retinol', 'Zinc', 'AHA', 'BHA', 'Bright Complete', 'Daily Care'];
        for (const ing of activeIngredients) {
            if (new RegExp(`\\b${ing}\\b`, 'i').test(normalizedText)) {
                matchedKeywords.push(ing);
            }
        }

        // Extract clean candidate words
        const candidateWords = normalizedText
            .split(/[^a-zA-Z0-9]+/)
            .filter(w => w.length > 2 && !/^(the|and|for|with|from|made|pack|brand|use|daily|care|all|net)$/i.test(w))
            .slice(0, 10);

        const allKeywords = Array.from(new Set([...matchedKeywords, ...candidateWords]));

        // Guess category
        let category = 'Skincare';
        if (/baby|infant|toddler/i.test(normalizedText)) category = 'Baby Care';
        else if (/body|lotion|shower|bath|hand/i.test(normalizedText)) category = 'Body Care';
        else if (/hair|shampoo|conditioner|scalp/i.test(normalizedText)) category = 'Haircare';
        else if (/perfume|fragrance|parfum|cologne/i.test(normalizedText)) category = 'Fragrance & Perfumes';
        else if (/mascara|lipstick|foundation|eyeliner|blush/i.test(normalizedText)) category = 'Makeup';

        const synthesizedTitle = [detectedBrand, ...matchedKeywords.filter(k => k !== detectedBrand)].join(' ').trim() || fullText.slice(0, 50);

        return {
            source: 'local-ocr',
            brand: detectedBrand,
            productName: synthesizedTitle,
            category,
            keyIngredients: matchedKeywords.filter(k => activeIngredients.includes(k)),
            sizeOrVolume,
            searchKeywords: allKeywords,
            confidence: detectedBrand ? 'medium' : 'low',
            description: `Extracted text from package: ${normalizedText.slice(0, 80)}...`
        };
    } catch (ocrError) {
        console.error('Local OCR analysis error:', ocrError);
        return {
            source: 'fallback',
            brand: '',
            productName: '',
            category: 'Skincare',
            keyIngredients: [],
            sizeOrVolume: '',
            searchKeywords: [],
            confidence: 'low',
            description: 'Unable to parse text from image'
        };
    }
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

    // 2. Brand Match (High Weight)
    if (analysis.brand) {
        const b = analysis.brand.toLowerCase();
        if (pBrand.includes(b) || pName.includes(b)) {
            score += 40;
        }
    }

    // 3. Keyword Overlap
    const keywords = analysis.searchKeywords || [];
    let titleMatches = 0;
    for (const kw of keywords) {
        if (!kw || kw.length < 2) continue;
        const k = kw.toLowerCase();
        if (pName.includes(k)) {
            titleMatches++;
            score += 15;
        } else if (pDesc.includes(k) || pFormula.includes(k)) {
            score += 5;
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

    return score;
}

export async function POST(request) {
    try {
        let imageBuffer = null;
        let mimeType = 'image/jpeg';

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            const { image } = body;
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
            mimeType = file.type || 'image/jpeg';
            const arrayBuffer = await file.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else {
            return NextResponse.json({ success: false, message: 'Unsupported request content type' }, { status: 400 });
        }

        if (!imageBuffer || imageBuffer.length === 0) {
            return NextResponse.json({ success: false, message: 'Image data is empty' }, { status: 400 });
        }

        // Limit size to 10MB
        if (imageBuffer.length > 10 * 1024 * 1024) {
            return NextResponse.json({ success: false, message: 'Image is too large (max 10MB)' }, { status: 400 });
        }

        // 1. Analyze the image
        const analysis = await analyzeProductImage(imageBuffer, mimeType);

        // 2. Fetch active catalog products from database or memoryStore
        let allProducts = [];
        if (isDatabaseConfigured()) {
            try {
                allProducts = await prisma.product.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' }
                });
            } catch (dbErr) {
                console.warn('Prisma query warning in visual search:', dbErr.message);
                try {
                    allProducts = await prisma.$queryRawUnsafe(`SELECT * FROM "Product" WHERE "isActive" = true ORDER BY "createdAt" DESC`);
                } catch (rawErr) {
                    allProducts = memoryStore.products || [];
                }
            }
        } else {
            allProducts = memoryStore.products || [];
        }

        // 3. Score every product against image analysis
        const scored = allProducts.map(product => ({
            product,
            score: scoreProduct(product, analysis)
        })).sort((a, b) => b.score - a.score);

        const top = scored[0];
        const isExactMatch = top && top.score >= 55;
        const isCloseMatch = top && top.score >= 30 && !isExactMatch;

        // Filter other close alternatives
        const similarMatches = scored
            .filter(item => item.score >= 25 && item.product.id !== top?.product?.id)
            .slice(0, 4)
            .map(item => item.product);

        // Category alternatives if product not available
        let categoryAlternatives = [];
        if (!isExactMatch) {
            categoryAlternatives = allProducts
                .filter(p => p.id !== top?.product?.id && (analysis.category ? (p.category || '').toLowerCase() === analysis.category.toLowerCase() : true))
                .slice(0, 4);
        }

        let matchType = 'not_available';
        if (isExactMatch) matchType = 'exact';
        else if (isCloseMatch) matchType = 'close';

        return NextResponse.json({
            success: true,
            matchType, // 'exact', 'close', 'not_available'
            analysis: {
                brand: analysis.brand,
                productName: analysis.productName,
                category: analysis.category,
                keyIngredients: analysis.keyIngredients,
                sizeOrVolume: analysis.sizeOrVolume,
                confidence: analysis.confidence,
                engine: analysis.source,
                description: analysis.description
            },
            exactProduct: isExactMatch ? top.product : (isCloseMatch ? top.product : null),
            similarProducts: similarMatches,
            categoryAlternatives,
            totalScanned: allProducts.length
        });
    } catch (error) {
        console.error('Visual Search API Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to process visual product search: ' + (error.message || 'Server error')
        }, { status: 500 });
    }
}
