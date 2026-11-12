import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { memoryStore } from '@/lib/db/initialData';

/**
 * Inserts a category at targetOrder (1-based), shifting existing categories down (+1).
 * Re-indexes all categories sequentially from 1 to N so there are no duplicates and no gaps.
 */
export async function insertCategoryWithOrder({ name, slug, description, image, targetOrder, isActive = true }) {
    const desiredOrder = Math.max(1, parseInt(targetOrder, 10) || 1);

    if (isDatabaseConfigured()) {
        // Fetch all existing categories ordered by current displayOrder
        const existing = await prisma.category.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
        });

        // Insert at target position (0-indexed)
        const targetIndex = Math.min(Math.max(0, desiredOrder - 1), existing.length);

        // First create the new category
        const created = await prisma.category.create({
            data: {
                name,
                slug,
                description: description || null,
                image: image || null,
                displayOrder: desiredOrder,
                isActive: Boolean(isActive)
            }
        });

        // Build complete re-ordered list
        const reordered = [
            ...existing.slice(0, targetIndex),
            created,
            ...existing.slice(targetIndex)
        ];

        // Apply 1-based sequential indices
        const updatePromises = reordered.map((cat, idx) => {
            const expectedOrder = idx + 1;
            return prisma.category.update({
                where: { id: cat.id },
                data: { displayOrder: expectedOrder }
            });
        });

        await prisma.$transaction(updatePromises);

        const finalRecord = await prisma.category.findUnique({
            where: { id: created.id }
        });

        return finalRecord;
    }

    // Memory Store Fallback
    const existing = memoryStore.getCategories().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const targetIndex = Math.min(Math.max(0, desiredOrder - 1), existing.length);

    const newCat = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        slug,
        description: description || null,
        image: image || null,
        displayOrder: desiredOrder,
        isActive: Boolean(isActive),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const reordered = [
        ...existing.slice(0, targetIndex),
        newCat,
        ...existing.slice(targetIndex)
    ];

    reordered.forEach((cat, idx) => {
        cat.displayOrder = idx + 1;
    });

    memoryStore.setCategories(reordered);
    return newCat;
}

/**
 * Updates a category. If targetOrder changed, shifts and re-indexes all categories cleanly.
 */
export async function updateCategoryWithOrder(id, { name, slug, description, image, targetOrder, isActive }) {
    if (isDatabaseConfigured()) {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) return null;

        const allCats = await prisma.category.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
        });

        // Other categories without this one
        const others = allCats.filter(c => c.id !== id);

        const newOrderNum = targetOrder !== undefined
            ? Math.max(1, parseInt(targetOrder, 10) || 1)
            : existing.displayOrder;

        const targetIndex = Math.min(Math.max(0, newOrderNum - 1), others.length);

        // Update the target category core fields
        const updatedTarget = await prisma.category.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existing.name,
                slug: slug !== undefined ? slug : existing.slug,
                description: description !== undefined ? description : existing.description,
                image: image !== undefined ? image : existing.image,
                isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
                displayOrder: newOrderNum
            }
        });

        // If category name changed, cascade update to all associated products
        if (name && existing.name !== name) {
            await prisma.product.updateMany({
                where: { category: existing.name },
                data: { category: name }
            });
        }

        // Re-assemble list with updated target at its targetIndex
        const reordered = [
            ...others.slice(0, targetIndex),
            updatedTarget,
            ...others.slice(targetIndex)
        ];

        // Re-index all categories 1 to N
        const updatePromises = reordered.map((cat, idx) => {
            const expectedOrder = idx + 1;
            return prisma.category.update({
                where: { id: cat.id },
                data: { displayOrder: expectedOrder }
            });
        });

        await prisma.$transaction(updatePromises);

        return await prisma.category.findUnique({ where: { id } });
    }

    // Memory Store Fallback
    const allCats = memoryStore.getCategories();
    const existing = allCats.find(c => c.id === id);
    if (!existing) return null;

    const others = allCats.filter(c => c.id !== id).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const newOrderNum = targetOrder !== undefined
        ? Math.max(1, parseInt(targetOrder, 10) || 1)
        : existing.displayOrder;
    const targetIndex = Math.min(Math.max(0, newOrderNum - 1), others.length);

    const updated = {
        ...existing,
        name: name !== undefined ? name : existing.name,
        slug: slug !== undefined ? slug : existing.slug,
        description: description !== undefined ? description : existing.description,
        image: image !== undefined ? image : existing.image,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        displayOrder: newOrderNum,
        updatedAt: new Date().toISOString()
    };

    const reordered = [
        ...others.slice(0, targetIndex),
        updated,
        ...others.slice(targetIndex)
    ];

    reordered.forEach((cat, idx) => {
        cat.displayOrder = idx + 1;
    });

    memoryStore.setCategories(reordered);
    return updated;
}

/**
 * Deletes a category and re-indexes remaining categories 1 to N.
 */
export async function deleteCategoryWithOrder(id) {
    if (isDatabaseConfigured()) {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) return null;

        // Reassign products to General
        await prisma.product.updateMany({
            where: { category: existing.name },
            data: { category: 'General' }
        });

        // Delete category
        await prisma.category.delete({ where: { id } });

        // Re-index all remaining categories
        const remaining = await prisma.category.findMany({
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
        });

        if (remaining.length > 0) {
            const updatePromises = remaining.map((cat, idx) => {
                return prisma.category.update({
                    where: { id: cat.id },
                    data: { displayOrder: idx + 1 }
                });
            });
            await prisma.$transaction(updatePromises);
        }

        return existing;
    }

    // Memory store fallback
    const allCats = memoryStore.getCategories();
    const existing = allCats.find(c => c.id === id);
    if (!existing) return null;

    const remaining = allCats.filter(c => c.id !== id).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    remaining.forEach((cat, idx) => {
        cat.displayOrder = idx + 1;
    });

    memoryStore.setCategories(remaining);
    return existing;
}

