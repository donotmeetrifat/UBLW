import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/ai/history
 * Fetch conversation history for authenticated customer from PostgreSQL.
 * Unauthenticated guests store their chat strictly in browser cache (localStorage).
 */
export async function GET(request) {
    try {
        const user = getUserFromRequest(request);

        // Strict Requirement: Database account history is strictly isolated for authenticated customers only.
        if (!user || !user.id) {
            return NextResponse.json({ success: true, messages: [] });
        }

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, messages: [] });
        }

        // Fetch customer's account conversation history across devices
        // Fetch the most recent 150 messages and reverse to ascending order
        const recentMessages = await prisma.chatMessage.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 150,
        });

        const messages = recentMessages.reverse();

        return NextResponse.json({
            success: true,
            messages: messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                products: m.products || [],
                image: (m.image && m.image !== '[Photo Attachment]') ? m.image : null,
                createdAt: m.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch history', error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ai/history
 * Sync guest messages into user account upon customer sign-in.
 */
export async function POST(request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const body = await request.json();
        const { guestMessages } = body;

        if (Array.isArray(guestMessages) && guestMessages.length > 0) {
            // Find existing user messages to avoid duplicate insertions
            const existing = await prisma.chatMessage.findMany({
                where: { userId: user.id },
                select: { content: true, role: true },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });

            const records = guestMessages
                .filter(m => m && (m.content || m.image) && !m.id?.includes('welcome'))
                .filter(m => {
                    const text = (m.content || '').trim();
                    return !existing.some(e => e.role === m.role && (e.content || '').trim() === text);
                })
                .map(m => ({
                    userId: user.id,
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content || 'Please check this product for availability in our UK catalog.',
                    products: m.products && m.products.length > 0 ? m.products : null,
                    image: (m.image && m.image !== '[Photo Attachment]') ? m.image : null,
                }));

            if (records.length > 0) {
                await prisma.chatMessage.createMany({
                    data: records,
                });
            }

            return NextResponse.json({ success: true, count: records.length });
        }

        return NextResponse.json({ success: true, count: 0 });
    } catch (error) {
        console.error('Error syncing chat history:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to sync history', error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/ai/history
 * Clear customer chat history from PostgreSQL
 */
export async function DELETE(request) {
    try {
        const user = getUserFromRequest(request);

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, cleared: true });
        }

        if (user && user.id) {
            await prisma.chatMessage.deleteMany({
                where: { userId: user.id },
            });
        }

        return NextResponse.json({ success: true, cleared: true });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to clear history', error: error.message },
            { status: 500 }
        );
    }
}
