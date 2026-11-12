import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const payload = getUserFromRequest(request);
        if (!payload?.id || !isDatabaseConfigured()) {
            return NextResponse.json({ success: true, addresses: [] });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: payload.id },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
        });

        return NextResponse.json({ success: true, addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ success: false, addresses: [], message: 'Failed to fetch addresses' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const payload = getUserFromRequest(request);

        // Strict backend verification: unauthenticated visitors cannot create or modify addresses
        if (!payload?.id) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to manage delivery addresses.' },
                { status: 401 }
            );
        }

        const body = await request.json();

        if (isDatabaseConfigured()) {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true, isActive: true }
            });

            if (!user || user.isActive === false) {
                return NextResponse.json(
                    { success: false, error: 'UNAUTHORIZED', message: 'User account not found or deactivated.' },
                    { status: 401 }
                );
            }

            const isDefault = !!body.isDefault;
            if (isDefault) {
                await prisma.address.updateMany({
                    where: { userId: payload.id },
                    data: { isDefault: false }
                });
            }

            const newAddress = await prisma.address.create({
                data: {
                    userId: payload.id,
                    fullName: (body.fullName || body.name || 'Customer').trim(),
                    phoneNumber: (body.phoneNumber || body.phone || '').trim(),
                    region: (body.region || body.state || 'Dhaka').trim(),
                    city: (body.city || 'Dhaka').trim(),
                    area: (body.area || '').trim(),
                    address: (body.address || body.street || '').trim(),
                    isDefault,
                }
            });

            return NextResponse.json({ success: true, address: newAddress });
        }

        return NextResponse.json({ success: true, address: body });
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json({ success: false, message: 'Failed to save address' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const payload = getUserFromRequest(request);
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ success: false, message: 'Address ID required' }, { status: 400 });
        }

        if (!payload?.id || !isDatabaseConfigured()) {
            return NextResponse.json({ success: true, address: body });
        }

        if (body.isDefault) {
            await prisma.address.updateMany({
                where: { userId: payload.id },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.address.update({
            where: { id: body.id },
            data: {
                fullName: body.fullName || body.name,
                phoneNumber: body.phoneNumber || body.phone,
                region: body.region || body.state,
                city: body.city,
                area: body.area,
                address: body.address || body.street,
                isDefault: body.isDefault !== undefined ? !!body.isDefault : undefined,
            }
        });

        return NextResponse.json({ success: true, address: updated });
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json({ success: false, message: 'Failed to update address' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const payload = getUserFromRequest(request);
        const { searchParams } = new URL(request.url);
        let id = searchParams.get('id');

        if (!id) {
            const body = await request.json().catch(() => ({}));
            id = body.id;
        }

        if (!id) {
            return NextResponse.json({ success: false, message: 'Address ID required' }, { status: 400 });
        }

        if (payload?.id && isDatabaseConfigured()) {
            await prisma.address.deleteMany({
                where: { id, userId: payload.id }
            });
        }

        return NextResponse.json({ success: true, message: 'Address removed successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete address' }, { status: 500 });
    }
}

