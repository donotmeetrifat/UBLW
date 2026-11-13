import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { memoryStore } from '@/lib/db/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
    try {
        // Enforce: User must be signed in to send inquiry messages
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'UNAUTHORIZED', 
                    message: 'You must be signed in to submit an inquiry message. Please sign in to continue.' 
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        const trimmedSubject = (subject || '').trim();
        const trimmedMessage = (message || '').trim();

        if (!trimmedSubject || trimmedSubject.length < 2) {
            return NextResponse.json(
                { success: false, message: 'Please provide a subject for your inquiry.' },
                { status: 400 }
            );
        }

        if (!trimmedMessage || trimmedMessage.length < 5) {
            return NextResponse.json(
                { success: false, message: 'Please write a message explaining your inquiry (at least 5 characters).' },
                { status: 400 }
            );
        }

        let activeUser = null;
        if (isDatabaseConfigured()) {
            try {
                if (prisma.user) {
                    activeUser = await prisma.user.findUnique({
                        where: { id: payload.id },
                        select: { id: true, name: true, email: true, phone: true, role: true }
                    });
                }
            } catch (userErr) {
                console.warn('Prisma user lookup error in contact inquiry:', userErr.message);
            }
        }

        const senderName = (name || activeUser?.name || payload.name || 'Valued Customer').trim();
        const senderEmail = (email || activeUser?.email || payload.email || '').trim().toLowerCase();
        const senderPhone = (phone || activeUser?.phone || '').trim() || null;

        if (!senderEmail) {
            return NextResponse.json(
                { success: false, message: 'A valid email address is required to submit an inquiry.' },
                { status: 400 }
            );
        }

        let savedInquiry = null;

        if (isDatabaseConfigured()) {
            try {
                if (prisma.inquiry) {
                    savedInquiry = await prisma.inquiry.create({
                        data: {
                            userId: payload.id,
                            name: senderName,
                            email: senderEmail,
                            phone: senderPhone,
                            subject: trimmedSubject,
                            message: trimmedMessage,
                            status: 'UNREAD',
                        },
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, phone: true, role: true }
                            }
                        }
                    });
                }
            } catch (dbErr) {
                console.error('Database inquiry creation error, falling back to memory store:', dbErr);
            }
        }

        // Memory store fallback if DB not configured or creation failed
        if (!savedInquiry) {
            savedInquiry = memoryStore.addInquiry({
                userId: payload.id,
                name: senderName,
                email: senderEmail,
                phone: senderPhone,
                subject: trimmedSubject,
                message: trimmedMessage,
                status: 'UNREAD',
                user: activeUser || { id: payload.id, name: senderName, email: senderEmail, phone: senderPhone, role: 'CUSTOMER' }
            });
        } else {
            // Also sync to memory store so all handlers have immediate access
            try {
                memoryStore.addInquiry({
                    id: savedInquiry.id,
                    userId: savedInquiry.userId,
                    name: savedInquiry.name,
                    email: savedInquiry.email,
                    phone: savedInquiry.phone,
                    subject: savedInquiry.subject,
                    message: savedInquiry.message,
                    status: savedInquiry.status,
                    createdAt: savedInquiry.createdAt ? new Date(savedInquiry.createdAt).toISOString() : new Date().toISOString(),
                    updatedAt: savedInquiry.updatedAt ? new Date(savedInquiry.updatedAt).toISOString() : new Date().toISOString(),
                    user: savedInquiry.user || activeUser
                });
            } catch (syncErr) {
                // Ignore sync warning
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Thank you! Your inquiry message has been submitted to UK Brand Lover. Our team will review your account details and contact you shortly.',
            inquiry: savedInquiry
        }, { status: 201 });

    } catch (error) {
        console.error('Contact inquiry submission error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to submit inquiry message. Please try again.' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload || !payload.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (isDatabaseConfigured()) {
            const inquiries = await prisma.inquiry.findMany({
                where: { userId: payload.id },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json({ success: true, inquiries });
        }

        const inquiries = memoryStore.getInquiries().filter(i => i.userId === payload.id);
        return NextResponse.json({ success: true, inquiries });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

