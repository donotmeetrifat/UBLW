import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getUserFromRequest } from '@/lib/auth';
import { updateCategoryWithOrder, deleteCategoryWithOrder } from '@/lib/db/categoryOrdering';
import { invalidateCategoriesCache } from '../route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request, { params }) {
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
        const { name, slug, description, image, displayOrder, isActive } = body;

        const trimmedName = (name || '').trim();
        if (!trimmedName || trimmedName.length < 2) {
            return NextResponse.json(
                { success: false, message: 'Category name must be at least 2 characters.' },
                { status: 400 }
            );
        }

        const finalSlug = (slug || trimmedName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (isDatabaseConfigured()) {
            const existing = await prisma.category.findUnique({
                where: { id }
            });

            if (!existing) {
                return NextResponse.json(
                    { success: false, message: 'Category not found.' },
                    { status: 404 }
                );
            }

            // Check if name or slug collides with another category
            const conflict = await prisma.category.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        { name: { equals: trimmedName, mode: 'insensitive' } },
                        { slug: finalSlug }
                    ]
                }
            });

            if (conflict) {
                return NextResponse.json(
                    { success: false, message: `Another category already uses the name "${trimmedName}" or slug "${finalSlug}".` },
                    { status: 409 }
                );
            }
        }

        const updated = await updateCategoryWithOrder(id, {
            name: trimmedName,
            slug: finalSlug,
            description: description !== undefined ? (description?.trim() || null) : undefined,
            image: image !== undefined ? image : undefined,
            targetOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
            isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        });

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Category not found.' },
                { status: 404 }
            );
        }

        try {
            invalidateCategoriesCache();
            revalidatePath('/');
            revalidatePath('/shop');
            revalidatePath('/admin/categories');
            revalidatePath('/admin/promotions');
            revalidatePath('/admin/banners');
            revalidatePath('/admin/products');
        } catch {}

        return NextResponse.json({
            success: true,
            message: `Category "${trimmedName}" updated successfully!`,
            category: updated
        });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update category' },
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

        const deleted = await deleteCategoryWithOrder(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

        try {
            invalidateCategoriesCache();
            revalidatePath('/');
            revalidatePath('/shop');
            revalidatePath('/admin/categories');
            revalidatePath('/admin/promotions');
            revalidatePath('/admin/banners');
            revalidatePath('/admin/products');
        } catch {}

        return NextResponse.json({
            success: true,
            message: `Category removed successfully!`
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete category' },
            { status: 500 }
        );
    }
}

