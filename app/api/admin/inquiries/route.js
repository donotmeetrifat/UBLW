import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Admin access required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'ALL';
        const search = (searchParams.get('search') || '').trim().toLowerCase();

        if (isDatabaseConfigured()) {
            const where = {};

            if (status && status !== 'ALL') {
                where.status = status.toUpperCase();
            }

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                    { message: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ];
            }

            const inquiries = await prisma.inquiry.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            role: true,
                            isVerified: true,
                            createdAt: true,
                            _count: {
                                select: { orders: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Calculate overview stats
            const [total, unread, inProgress, resolved] = await Promise.all([
                prisma.inquiry.count(),
                prisma.inquiry.count({ where: { status: 'UNREAD' } }),
                prisma.inquiry.count({ where: { status: 'IN_PROGRESS' } }),
                prisma.inquiry.count({ where: { status: 'RESOLVED' } }),
            ]);

            return NextResponse.json({
                success: true,
                inquiries,
                stats: { total, unread, inProgress, resolved }
            });
        }

        // Memory store fallback
        let list = memoryStore.getInquiries();
        if (status !== 'ALL') {
            list = list.filter(i => i.status === status);
        }
        if (search) {
            list = list.filter(i => 
                (i.name && i.name.toLowerCase().includes(search)) ||
                (i.email && i.email.toLowerCase().includes(search)) ||
                (i.subject && i.subject.toLowerCase().includes(search)) ||
                (i.message && i.message.toLowerCase().includes(search))
            );
        }

        const total = list.length;
        const unread = list.filter(i => i.status === 'UNREAD').length;
        const inProgress = list.filter(i => i.status === 'IN_PROGRESS').length;
        const resolved = list.filter(i => i.status === 'RESOLVED').length;

        return NextResponse.json({
            success: true,
            inquiries: list,
            stats: { total, unread, inProgress, resolved }
        });

    } catch (error) {
        console.error('Admin inquiries fetch error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch inquiries' },
            { status: 500 }
        );
    }
}
