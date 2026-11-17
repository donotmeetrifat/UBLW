import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/team
 * By default: returns only staff members (ADMIN and EMPLOYEE).
 * When ?search=... is provided: searches across all users so admin can find any customer to promote.
 */
export async function GET(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'EMPLOYEE')) {
            return NextResponse.json({ success: false, message: 'Unauthorized. Staff access required.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim() || '';
        const filter = searchParams.get('filter')?.trim() || 'all';

        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: true,
                users: [],
                stats: { totalRegistrations: 1, totalStaff: 1, totalAdmins: 1, totalEmployees: 0, totalCustomers: 0, totalBlocked: 0, activeStaff: 1 },
                isSearching: false,
            });
        }

        // Single lightning-fast query: fetch registered user records in one round trip
        let whereClause = {};

        if (search) {
            whereClause = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { whatsapp: { contains: search } },
                ],
            };
        } else if (filter === 'customers') {
            whereClause = { role: 'CUSTOMER' };
        } else if (filter === 'admins') {
            whereClause = { role: 'ADMIN' };
        } else if (filter === 'employees') {
            whereClause = { role: 'EMPLOYEE' };
        } else if (filter === 'staff') {
            whereClause = { role: { in: ['ADMIN', 'EMPLOYEE'] } };
        } else if (filter === 'blocked') {
            whereClause = { isActive: false };
        } else if (filter === 'active') {
            whereClause = { isActive: true };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsapp: true,
                role: true,
                permissions: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                lastActiveAt: true,
                image: true,
            },
            orderBy: [
                { role: 'asc' }, // ADMIN first, then EMPLOYEE, then CUSTOMER
                { createdAt: 'desc' },
            ],
            take: 500,
        });

        // Compute aggregate statistics in memory (0ms execution, zero extra database round-trips)
        let totalAdmins = 0;
        let totalEmployees = 0;
        let totalCustomers = 0;
        let totalBlocked = 0;
        let activeUsers = 0;

        for (let i = 0; i < users.length; i++) {
            const u = users[i];
            if (u.role === 'ADMIN') totalAdmins++;
            else if (u.role === 'EMPLOYEE') totalEmployees++;
            else if (u.role === 'CUSTOMER') totalCustomers++;

            if (u.isActive) activeUsers++;
            else totalBlocked++;
        }

        const totalUsers = users.length;
        const totalStaff = totalAdmins + totalEmployees;

        return NextResponse.json({
            success: true,
            users,
            stats: {
                totalUsers,
                totalRegistrations: totalUsers,
                totalStaff,
                totalAdmins,
                totalEmployees,
                totalCustomers,
                totalBlocked,
                activeUsers,
                activeStaff: activeUsers,
            },
            isSearching: Boolean(search),
        }, {
            headers: {
                'Cache-Control': 'private, no-cache, no-transform'
            }
        });
    } catch (error) {
        console.error('Error in GET /api/admin/team:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch team members', error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/team
 * Modify user role (ADMIN, EMPLOYEE, CUSTOMER) or toggle active status.
 * Strictly restricted to users with role === 'ADMIN'.
 */
export async function POST(request) {
    try {
        const currentUser = getUserFromRequest(request);
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Forbidden. Only Administrators can modify team permissions.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { targetUserId, newRole, permissions, isActive, isVerified, action } = body;

        if (!targetUserId) {
            return NextResponse.json({ success: false, message: 'Target user ID is required.' }, { status: 400 });
        }

        if (!isDatabaseConfigured()) {
            return NextResponse.json({ success: false, message: 'Database is not configured.' }, { status: 500 });
        }

        // Fetch existing target user record
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, name: true, email: true, role: true, isActive: true, isVerified: true },
        });

        if (!targetUser) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        // Handle Delete User Action
        if (action === 'delete') {
            if (targetUser.id === currentUser.id) {
                return NextResponse.json(
                    { success: false, message: 'You cannot delete your own account.' },
                    { status: 400 }
                );
            }
            if (targetUser.role === 'ADMIN') {
                const adminCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
                if (adminCount <= 1) {
                    return NextResponse.json(
                        { success: false, message: 'Cannot delete the only remaining active Administrator.' },
                        { status: 400 }
                    );
                }
            }

            try {
                // Check if user has orders or blocking relations
                const orderCount = await prisma.order.count({ where: { userId: targetUserId } });
                if (orderCount > 0) {
                    // Soft delete: deactivate and revoke staff role to preserve order history
                    await prisma.user.update({
                        where: { id: targetUserId },
                        data: { role: 'CUSTOMER', isActive: false },
                    });
                    return NextResponse.json({
                        success: true,
                        message: `Account deactivated and staff privileges revoked (orders preserved).`,
                    });
                }

                await prisma.user.delete({ where: { id: targetUserId } });
                return NextResponse.json({
                    success: true,
                    message: `User ${targetUser.name} deleted successfully.`,
                });
            } catch (err) {
                // If cascade constraint fails, fallback to deactivate
                await prisma.user.update({
                    where: { id: targetUserId },
                    data: { role: 'CUSTOMER', isActive: false },
                });
                return NextResponse.json({
                    success: true,
                    message: `Account deactivated and staff privileges revoked.`,
                });
            }
        }

        // 1. Safety Guard: Self-demotion prevention
        if (targetUser.id === currentUser.id && newRole && newRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'You cannot demote your own Admin account. Ask another Administrator to make this change.' },
                { status: 400 }
            );
        }

        // 2. Safety Guard: Minimum 1 Admin rule
        if (targetUser.role === 'ADMIN' && newRole && newRole !== 'ADMIN') {
            const adminCount = await prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
            if (adminCount <= 1) {
                return NextResponse.json(
                    { success: false, message: 'Cannot demote the only remaining active Administrator. Promote another user to Admin first.' },
                    { status: 400 }
                );
            }
        }

        // Validate role if provided
        const validRoles = ['ADMIN', 'EMPLOYEE', 'CUSTOMER'];
        if (newRole && !validRoles.includes(newRole)) {
            return NextResponse.json(
                { success: false, message: `Invalid role "${newRole}". Must be one of: ${validRoles.join(', ')}` },
                { status: 400 }
            );
        }

        // Execute update immediately in PostgreSQL
        const updated = await prisma.user.update({
            where: { id: targetUserId },
            data: {
                ...(newRole ? { role: newRole } : {}),
                ...(Array.isArray(permissions) ? { permissions } : {}),
                ...(typeof isActive === 'boolean' ? { isActive } : {}),
                ...(typeof isVerified === 'boolean' ? { isVerified } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                permissions: true,
                isActive: true,
                isVerified: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${updated.name}'s role to ${updated.role}`,
            user: updated,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (error) {
        console.error('Error in POST /api/admin/team:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update user permissions', error: error.message },
            { status: 500 }
        );
    }
}
