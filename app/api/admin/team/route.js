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

        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: true,
                users: [],
                stats: { totalAdmins: 1, totalEmployees: 0, activeStaff: 1 },
                isSearching: false,
            });
        }

        // Aggregate team statistics (always based on store staff)
        const [
            totalStaff,
            totalAdmins,
            totalEmployees,
            pendingApprovals,
            totalBlocked,
            activeApproved
        ] = await Promise.all([
            prisma.user.count({ where: { role: { in: ['ADMIN', 'EMPLOYEE'] } } }),
            prisma.user.count({ where: { role: 'ADMIN' } }),
            prisma.user.count({ where: { role: 'EMPLOYEE' } }),
            prisma.user.count({ where: { role: { in: ['ADMIN', 'EMPLOYEE'] }, isVerified: false } }),
            prisma.user.count({ where: { role: { in: ['ADMIN', 'EMPLOYEE'] }, isActive: false } }),
            prisma.user.count({ where: { role: { in: ['ADMIN', 'EMPLOYEE'] }, isActive: true, isVerified: true } }),
        ]);

        let users = [];

        if (search) {
            // Search across ALL users (Admins, Employees, and Customers) so Admin can promote anyone
            users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                        { whatsapp: { contains: search } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    whatsapp: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    lastActiveAt: true,
                    image: true,
                },
                orderBy: [
                    { role: 'asc' }, // ADMIN, then EMPLOYEE, then CUSTOMER
                    { createdAt: 'desc' },
                ],
                take: 25,
            });
        } else {
            // Default view: STRICTLY only ADMIN and EMPLOYEE. No customers cluttering the page!
            users = await prisma.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'EMPLOYEE'] },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    whatsapp: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    lastActiveAt: true,
                    image: true,
                },
                orderBy: [
                    { role: 'asc' }, // ADMIN first, then EMPLOYEE
                    { createdAt: 'desc' },
                ],
            });
        }

        return NextResponse.json({
            success: true,
            users,
            stats: {
                totalRegistrations: totalStaff,
                totalStaff,
                totalAdmins,
                totalEmployees,
                pendingApprovals,
                totalBlocked,
                activeApproved,
            },
            isSearching: Boolean(search),
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
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
        const { targetUserId, newRole, isActive, isVerified, action } = body;

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
                ...(typeof isActive === 'boolean' ? { isActive } : {}),
                ...(typeof isVerified === 'boolean' ? { isVerified } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
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
