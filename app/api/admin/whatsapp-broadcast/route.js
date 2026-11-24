import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { requireStaff } from '@/lib/auth';
import { getAiSettings } from '@/lib/aiBot';
import { sendWhatsAppMessage, normalizeWhatsAppNumber } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

function formatBroadcastMessage(template, { customerName, productName, productPrice, cartUrl, storeUrl, hotline }) {
    return (template || '')
        .replace(/\{customer_name\}/g, customerName || 'Valued Customer')
        .replace(/\{product_name\}/g, productName || '')
        .replace(/\{product_price\}/g, productPrice || '')
        .replace(/\{cart_url\}/g, cartUrl || '')
        .replace(/\{store_url\}/g, storeUrl || '')
        .replace(/\{hotline\}/g, hotline || '+880 1959-524393');
}

/**
 * GET /api/admin/whatsapp-broadcast
 * Returns:
 * - list of registered users with account WhatsApp/phone info
 * - list of products for featured broadcast selector
 * - WhatsApp API connection status & hotline
 */
export async function GET(request) {
    try {
        const auth = await requireStaff(request);
        if (!auth.authorized) {
            return auth.response;
        }

        const settings = await getAiSettings();
        const isConnected = Boolean(settings.whatsappPhoneNumberId && settings.whatsappAccessToken);

        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: true,
                users: [],
                products: [],
                settings: {
                    isConnected: false,
                    hotline: settings.whatsappHotline || '+880 1959-524393',
                }
            });
        }

        // Fetch all registered users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsapp: true,
                image: true,
                role: true,
                createdAt: true,
                addresses: {
                    take: 1,
                    select: {
                        phoneNumber: true,
                        city: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Fetch products for optional product-anchored promotions
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                inStock: true,
            },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
                category: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 60,
        });

        const formattedUsers = users.map((u) => {
            const rawWhatsApp = u.whatsapp || u.phone || u.addresses?.[0]?.phoneNumber || '';
            const normalized = normalizeWhatsAppNumber(rawWhatsApp);
            const hasValidWhatsApp = Boolean(normalized && normalized.length >= 10);

            return {
                id: u.id,
                name: u.name || 'Valued Customer',
                email: u.email || '',
                phone: u.phone || '',
                whatsapp: u.whatsapp || '',
                resolvedWhatsApp: rawWhatsApp,
                normalizedWhatsApp: normalized,
                hasValidWhatsApp,
                image: u.image || null,
                role: u.role || 'CUSTOMER',
                city: u.addresses?.[0]?.city || '',
                createdAt: u.createdAt,
            };
        });

        return NextResponse.json({
            success: true,
            users: formattedUsers,
            products: products.map((p) => ({
                id: p.id,
                name: p.name,
                title: p.name,
                price: p.price,
                coverImage: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
                categoryName: p.category || '',
            })),
            settings: {
                isConnected,
                phoneNumberId: settings.whatsappPhoneNumberId ? `${settings.whatsappPhoneNumberId.slice(0, 4)}••••` : '',
                hotline: settings.whatsappHotline || '+880 1959-524393',
            }
        });
    } catch (error) {
        console.error('Error fetching broadcast data:', error);
        return NextResponse.json(
            { success: false, message: `Failed to load broadcast data: ${error.message}` },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/whatsapp-broadcast
 * Sends personalized broadcast message to selected users
 */
export async function POST(request) {
    try {
        const auth = await requireStaff(request);
        if (!auth.authorized) {
            return auth.response;
        }

        const body = await request.json();
        const {
            recipientUserIds = [],
            messageTemplate = '',
            selectedProductId = null,
            includeProductImage = true,
            customImageUrl = null,
        } = body;

        if (!Array.isArray(recipientUserIds) || recipientUserIds.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Please select at least one recipient customer.' },
                { status: 400 }
            );
        }

        if (!messageTemplate || !messageTemplate.trim()) {
            return NextResponse.json(
                { success: false, message: 'Message template cannot be empty.' },
                { status: 400 }
            );
        }

        const settings = await getAiSettings();
        if (!settings.whatsappPhoneNumberId || !settings.whatsappAccessToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'WhatsApp Cloud API is not connected. Please connect your credentials in the AI Saleswoman Bot page first.'
                },
                { status: 400 }
            );
        }

        // Fetch selected users
        const targetUsers = await prisma.user.findMany({
            where: {
                id: { in: recipientUserIds }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsapp: true,
                addresses: {
                    take: 1,
                    select: {
                        phoneNumber: true,
                        city: true,
                    }
                }
            }
        });

        if (targetUsers.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No valid matching users found for broadcast.' },
                { status: 404 }
            );
        }

        // Fetch product if selected
        let targetProduct = null;
        if (selectedProductId) {
            targetProduct = await prisma.product.findUnique({
                where: { id: selectedProductId },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                }
            });
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'https://ukbrandlover.com';
        const hotline = settings.whatsappHotline || '+880 1959-524393';

        // Determine cover image
        let mediaImageUrl = null;
        if (customImageUrl && typeof customImageUrl === 'string' && customImageUrl.startsWith('http')) {
            mediaImageUrl = customImageUrl.trim();
        } else if (includeProductImage && targetProduct && Array.isArray(targetProduct.images) && targetProduct.images.length > 0) {
            mediaImageUrl = targetProduct.images[0];
        }

        const productTitle = targetProduct?.name || '';
        const productPriceFormatted = targetProduct ? `৳${targetProduct.price.toLocaleString('en-US')}` : '';
        const cartUrl = `${baseUrl}/checkout`;
        const storeUrl = targetProduct ? `${baseUrl}/product/${targetProduct.id}` : baseUrl;

        let sentCount = 0;
        let failedCount = 0;
        let skippedCount = 0;
        const details = [];

        // Broadcast dispatch loop
        for (const user of targetUsers) {
            const rawPhone = user.whatsapp || user.phone || user.addresses?.[0]?.phoneNumber || '';
            const normalizedPhone = normalizeWhatsAppNumber(rawPhone);

            if (!normalizedPhone || normalizedPhone.length < 10) {
                skippedCount++;
                details.push({
                    userId: user.id,
                    name: user.name,
                    phone: rawPhone,
                    status: 'SKIPPED_INVALID_PHONE',
                    error: 'No valid WhatsApp number saved',
                });
                continue;
            }

            const personalizedMessage = formatBroadcastMessage(messageTemplate, {
                customerName: user.name || 'Valued Customer',
                productName: productTitle,
                productPrice: productPriceFormatted,
                cartUrl,
                storeUrl,
                hotline,
            });

            try {
                const sendResult = await sendWhatsAppMessage({
                    to: normalizedPhone,
                    text: personalizedMessage,
                    imageUrl: mediaImageUrl || undefined,
                    phoneNumberId: settings.whatsappPhoneNumberId,
                    accessToken: settings.whatsappAccessToken,
                });

                if (sendResult.success) {
                    sentCount++;
                    details.push({
                        userId: user.id,
                        name: user.name,
                        phone: normalizedPhone,
                        status: 'SENT',
                    });
                } else {
                    failedCount++;
                    details.push({
                        userId: user.id,
                        name: user.name,
                        phone: normalizedPhone,
                        status: 'FAILED',
                        error: sendResult.message || 'WhatsApp Cloud API rejection',
                    });
                }
            } catch (err) {
                failedCount++;
                details.push({
                    userId: user.id,
                    name: user.name,
                    phone: normalizedPhone,
                    status: 'FAILED',
                    error: err.message,
                });
            }

            // Safe delay (80ms) between calls to respect Meta API rate limits
            await new Promise((resolve) => setTimeout(resolve, 80));
        }

        return NextResponse.json({
            success: true,
            stats: {
                totalTargeted: targetUsers.length,
                sentCount,
                failedCount,
                skippedCount,
            },
            details,
            message: `Broadcast completed: ${sentCount} sent successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}${skippedCount > 0 ? `, ${skippedCount} skipped (no number)` : ''}.`,
        });
    } catch (error) {
        console.error('Error during broadcast dispatch:', error);
        return NextResponse.json(
            { success: false, message: `Broadcast failed: ${error.message}` },
            { status: 500 }
        );
    }
}
