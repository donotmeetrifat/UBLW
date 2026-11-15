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

    try {
        const body = await request.json();
        const { message, image, sessionId, model, history = [] } = body;
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
        conversationHistory.push({
            role: 'user',
            content: message ? message.trim() : 'Please check this product photo for availability.',
        });

        // Run multi-model saleswoman consultation
        const consultation = await executeAiConsultation({
            messages: conversationHistory,
            image: image || null,
            user,
            modelPreference: model || 'pro',
        });

        // Persist to PostgreSQL ONLY if customer is logged into their account
        // If customer is not logged in, their conversation is saved strictly in browser cache (localStorage)
        if (user && user.id && isDatabaseConfigured() && prisma.chatMessage) {
            try {
                // User message
                await prisma.chatMessage.create({
                    data: {
                        userId: user.id,
                        sessionId: null,
                        role: 'user',
                        content: message ? message.trim() : 'Sent product image for identification',
                        image: image || null,
                    },
                });

                // Assistant reply
                await prisma.chatMessage.create({
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
            provider: consultation.provider,
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

            return NextResponse.json({
                success: true,
                message: safeMessage,
                products: products || [],
                provider: 'emma_grounded_consultant',
            });
        } catch (innerErr) {
            return NextResponse.json({
                success: true,
                message: "Hello! Welcome to UK Brand Lover. Every item in our boutique is 100% genuine and imported directly from the UK with batch code verification.\n\nCould you share what skin concern or UK brand you are looking for today? I would be happy to assist you.",
                products: [],
                provider: 'emma_saleswoman_fallback',
            });
        }
    }
}
