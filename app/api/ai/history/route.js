import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const user = getUserFromRequest(request);
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, messages: [] });
        }

        if (!user && !sessionId) {
            return NextResponse.json({ success: true, messages: [] });
        }

        const messages = await prisma.chatMessage.findMany({
            where: user
                ? { userId: user.id }
                : { sessionId: sessionId },
            orderBy: { createdAt: 'asc' },
            take: 50,
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
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!isDatabaseConfigured() || !prisma.chatMessage) {
            return NextResponse.json({ success: true, cleared: true });
        }

        if (user) {
            await prisma.chatMessage.deleteMany({
                where: { userId: user.id },
            });
        } else if (sessionId) {
            await prisma.chatMessage.deleteMany({
                where: { sessionId: sessionId },
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
