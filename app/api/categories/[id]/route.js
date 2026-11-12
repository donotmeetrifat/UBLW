import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';
import { getUserFromRequest } from '@/lib/auth';

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

            // Update category
            const updated = await prisma.category.update({
                where: { id },
                data: {
                    name: trimmedName,
                    slug: finalSlug,
                    description: description !== undefined ? (description?.trim() || null) : existing.description,
                    image: image !== undefined ? image : existing.image,
                    displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
                    isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
                }
            });

            // If the category name changed, update all products using the old name so they stay linked!
            if (existing.name !== trimmedName) {
                await prisma.product.updateMany({
                    where: { category: existing.name },
                    data: { category: trimmedName }
                });
            }

            return NextResponse.json({
                success: true,
                message: `Category "${trimmedName}" updated successfully!`,
                category: updated
            });
        }

        const updated = memoryStore.updateCategory(id, {
            name: trimmedName,
            slug: finalSlug,
            description: (description || '').trim() || null,
            image: image || null,
            displayOrder: Number(displayOrder) || 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        });

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        }

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

        if (isDatabaseConfigured()) {
            const existing = await prisma.category.findUnique({
                where: { id }
            });

            if (!existing) {
                return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
            }

            // Reassign any products linked to this category to 'General' so they don't break
            await prisma.product.updateMany({
                where: { category: existing.name },
                data: { category: 'General' }
            });

            await prisma.category.delete({
                where: { id }
            });

            return NextResponse.json({
                success: true,
                message: `Category "${existing.name}" removed successfully!`
            });
        }

        memoryStore.deleteCategory(id);
        return NextResponse.json({
            success: true,
            message: 'Category removed successfully!'
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete category' },
            { status: 500 }
        );
    }
}

