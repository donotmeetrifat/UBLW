import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request, { params }) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Admin access required.' },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const body = await request.json();
        const { status, adminNotes } = body;

        const updateData = {};
        if (status) {
            updateData.status = status.toUpperCase();
        }
        if (adminNotes !== undefined) {
            updateData.adminNotes = adminNotes;
        }

        if (isDatabaseConfigured()) {
            const updated = await prisma.inquiry.update({
                where: { id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            role: true,
                            isVerified: true,
                            _count: { select: { orders: true } }
                        }
                    }
                }
            });

            return NextResponse.json({ success: true, inquiry: updated });
        }

        const updated = memoryStore.updateInquiry(id, updateData);
        if (!updated) {
            return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, inquiry: updated });

    } catch (error) {
        console.error('Update inquiry error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update inquiry' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'FORBIDDEN', message: 'Admin access required.' },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (isDatabaseConfigured()) {
            await prisma.inquiry.delete({ where: { id } });
            return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' });
        }

        memoryStore.deleteInquiry(id);
        return NextResponse.json({ success: true, message: 'Inquiry deleted successfully' });

    } catch (error) {
        console.error('Delete inquiry error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete inquiry' },
            { status: 500 }
        );
    }
}
