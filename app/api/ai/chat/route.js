import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import {
    executeAiConsultation,
    getLiveCatalogContext,
    getAiSettings,
    localGroundedAdvisor,
    extractProductCards
} from '@/lib/aiBot';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    let user = null;
    let messageText = '';
    let imagePayload = null;
    let conversationHistory = [];
    const DEFAULT_IMAGE_PROMPT = 'Please check this product for availability in our UK catalog.';

    try {
        const body = await request.json();
        const { message, image, sessionId, model, history = [], isVoice = false } = body;
        messageText = message || '';
        imagePayload = image || null;

        if ((!message || !message.trim()) && !image) {
            return NextResponse.json({
                success: false,
                message: 'A message or product photo is required.',
            }, { status: 400 });
        }

        user = getUserFromRequest(request);

        // Build messages chain including previous context
        conversationHistory = Array.isArray(history)
            ? history.map(h => ({
                  role: h.role === 'assistant' ? 'assistant' : 'user',
                  content: h.content || '',
              }))
            : [];

        // Append current message
        const userContent = (message && message.trim()) ? message.trim() : DEFAULT_IMAGE_PROMPT;
        conversationHistory.push({
            role: 'user',
            content: userContent,
        });

        // Run multi-model saleswoman consultation
        const consultation = await executeAiConsultation({
            messages: conversationHistory,
            image: image || null,
            user,
            modelPreference: isVoice ? 'fast' : (model || 'pro'),
            isVoice,
        });

        // Smart Add-to-Bag Detection & Execution
        let addToCartProduct = null;
        const isAddToCartIntent = /(add.*(bag|cart)|put.*(bag|cart)|yes.*add|yeah.*add|buy.*this|order.*this|bag.*add|cart.*add|eta.*add)/i.test(userContent);

        if (isAddToCartIntent) {
            const catalog = await getLiveCatalogContext();
            const productMap = new Map();
            catalog.forEach(p => productMap.set(p.id, p));

            // 1. Check if consultation.products has an in-stock product
            if (consultation.products && consultation.products.length > 0) {
                addToCartProduct = consultation.products[0];
            } else {
                // 2. Scan conversation history backwards for last mentioned product tag or name
                for (let i = conversationHistory.length - 2; i >= 0; i--) {
                    const prevMsg = conversationHistory[i]?.content || '';
                    const tagMatch = prevMsg.match(/\[{1,2}PRODUCT:\s*([a-zA-Z0-9_\-]+)\]{1,2}/i);
                    if (tagMatch && productMap.has(tagMatch[1])) {
                        const p = productMap.get(tagMatch[1]);
                        if (p) {
                            addToCartProduct = {
                                id: p.id,
                                name: p.name,
                                brand: p.brand,
                                price: p.price,
                                mrp: p.mrp,
                                image: p.images && p.images.length > 0 ? p.images[0] : null,
                                inStock: Boolean(p.inStock && (p.stockCount === null || p.stockCount > 0)),
                            };
                            break;
                        }
                    }

                    // Check by product name in text
                    const lowerPrev = prevMsg.toLowerCase();
                    for (const p of catalog) {
                        if (p.name && lowerPrev.includes(p.name.toLowerCase())) {
                            addToCartProduct = {
                                id: p.id,
                                name: p.name,
                                brand: p.brand,
                                price: p.price,
                                mrp: p.mrp,
                                image: p.images && p.images.length > 0 ? p.images[0] : null,
                                inStock: Boolean(p.inStock && (p.stockCount === null || p.stockCount > 0)),
                            };
                            break;
                        }
                    }
                    if (addToCartProduct) break;
                }
            }

            if (addToCartProduct) {
                // Ensure consultation.products includes this product
                if (!consultation.products || consultation.products.length === 0) {
                    consultation.products = [addToCartProduct];
                }

                // If the model gave a generic "click the link on the card" message, rewrite to cheerful confirmation
                if (/click.*(link|product card)|can easily add/i.test(consultation.message)) {
                    consultation.message = `I've added the ${addToCartProduct.name} to your shopping bag! [[PRODUCT:${addToCartProduct.id}]] Would you like to proceed to checkout or look for another product?`;
                } else if (!consultation.message.includes('[[PRODUCT:')) {
                    consultation.message += ` [[PRODUCT:${addToCartProduct.id}]]`;
                }
            }
        }

        let savedUserMsg = null;
        let savedAssistantMsg = null;

        // Persist to PostgreSQL ONLY if customer is logged into their account
        // If customer is not logged in, their conversation is saved strictly in browser cache (localStorage)
        if (user && user.id && isDatabaseConfigured() && prisma.chatMessage) {
            try {
                // User message
                savedUserMsg = await prisma.chatMessage.create({
                    data: {
                        userId: user.id,
                        sessionId: null,
                        role: 'user',
                        content: userContent,
                        image: image || null,
                    },
                });

                // Assistant reply
                savedAssistantMsg = await prisma.chatMessage.create({
                    data: {
                        userId: user.id,
                        sessionId: null,
                        role: 'assistant',
                        content: consultation.message,
                        products: consultation.products && consultation.products.length > 0 ? consultation.products : null,
                    },
                });
            } catch (dbErr) {
                console.warn('Note: Could not persist chat message to DB:', dbErr.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: consultation.message,
            products: consultation.products || [],
            addToCartProduct: addToCartProduct || null,
            provider: consultation.provider,
            userMessageId: savedUserMsg?.id || null,
            assistantMessageId: savedAssistantMsg?.id || null,
            createdAt: savedAssistantMsg?.createdAt || new Date().toISOString(),
        });
    } catch (error) {
        // Strict requirement: Never display backend errors or network errors to the customer!
        console.error('Error in AI Chat route (gracefully handled):', error);

        try {
            const [catalog, settings] = await Promise.all([
                getLiveCatalogContext(),
                getAiSettings(),
            ]);

            const fallbackReply = localGroundedAdvisor({
                query: messageText || 'skincare recommendations',
                image: imagePayload,
                catalog,
                botName: settings.botName || 'Emma',
                customerName: user?.name || null,
                isFollowUp: conversationHistory.length > 1,
            });

            const { message: safeMessage, products } = extractProductCards(fallbackReply, catalog);

            let savedUserMsg = null;
            let savedAssistantMsg = null;

            if (user && user.id && isDatabaseConfigured() && prisma.chatMessage) {
                try {
                    const userContent = (messageText && messageText.trim()) ? messageText.trim() : DEFAULT_IMAGE_PROMPT;
                    savedUserMsg = await prisma.chatMessage.create({
                        data: {
                            userId: user.id,
                            sessionId: null,
                            role: 'user',
                            content: userContent,
                            image: imagePayload || null,
                        },
                    });

                    savedAssistantMsg = await prisma.chatMessage.create({
                        data: {
                            userId: user.id,
                            sessionId: null,
                            role: 'assistant',
                            content: safeMessage,
                            products: products && products.length > 0 ? products : null,
                        },
                    });
                } catch (dbErr) {
                    console.warn('Fallback DB save warning:', dbErr.message);
                }
            }

            return NextResponse.json({
                success: true,
                message: safeMessage,
                products: products || [],
                provider: 'emma_grounded_consultant',
                userMessageId: savedUserMsg?.id || null,
                assistantMessageId: savedAssistantMsg?.id || null,
                createdAt: savedAssistantMsg?.createdAt || new Date().toISOString(),
            });
        } catch (innerErr) {
            return NextResponse.json({
                success: true,
                message: "Hello! Welcome to UK Brand Lover. Every item in our boutique is 100% genuine and imported directly from the UK with batch code verification.\n\nCould you share what skin concern or UK brand you are looking for today? I would be happy to assist you.",
                products: [],
                provider: 'emma_saleswoman_fallback',
                createdAt: new Date().toISOString(),
            });
        }
    }
}
