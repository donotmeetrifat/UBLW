import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { executeAiConsultation } from '@/lib/aiBot';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        const body = await request.json();
        const { message, image, sessionId, history = [] } = body;

        if ((!message || !message.trim()) && !image) {
            return NextResponse.json({
                success: false,
                message: 'A message or product photo is required.',
            }, { status: 400 });
        }

        const user = getUserFromRequest(request);

        // Build messages chain including previous context
        const conversationHistory = Array.isArray(history)
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
        });

        // Persist to PostgreSQL if database is active
        if (isDatabaseConfigured() && prisma.chatMessage) {
            try {
                // User message
                await prisma.chatMessage.create({
                    data: {
                        userId: user?.id || null,
                        sessionId: !user ? (sessionId || null) : null,
                        role: 'user',
                        content: message ? message.trim() : 'Sent product image for identification',
                        image: image ? (image.length > 500 ? '[Photo Attachment]' : image) : null,
                    },
                });

                // Assistant reply
                await prisma.chatMessage.create({
                    data: {
                        userId: user?.id || null,
                        sessionId: !user ? (sessionId || null) : null,
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
        console.error('Error in AI Chat route:', error);
        return NextResponse.json({
            success: false,
            message: 'Sorry darling, our beauty advisor had a brief network interruption. Please try again.',
            error: error.message,
        }, { status: 500 });
    }
}
