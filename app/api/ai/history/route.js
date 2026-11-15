import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const user = getUserFromRequest(request);

        // Strict Requirement: Unauthenticated guests store their chat strictly in browser cache (localStorage).
        // Database account history is strictly isolated for authenticated customers only.
        if (!user || !user.id) {
            return NextResponse.json({ success: true, messages: [] });
        }

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, messages: [] });
        }

        // Fetch customer's account conversation history across devices
        const messages = await prisma.chatMessage.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'asc' },
            take: 200,
        });

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
 * Sync guest messages into user account upon sign-in
 */
export async function POST(request) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const body = await request.json();
        const { guestMessages } = body;

        if (Array.isArray(guestMessages) && guestMessages.length > 0) {
            const records = guestMessages
                .filter(m => m && (m.content || m.image))
                .map(m => ({
                    userId: user.id,
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content || (m.image ? 'Product photo attached' : ''),
                    products: m.products || null,
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
 * Clear chat history
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
