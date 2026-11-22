import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getAiSettings } from '@/lib/aiBot';
import { sendWhatsAppMessage, formatRecoveryMessage, normalizeWhatsAppNumber } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    return handleCron(request);
}

export async function POST(request) {
    return handleCron(request);
}

async function handleCron(request) {
    const startTime = Date.now();

    if (!isDatabaseConfigured()) {
        return NextResponse.json({
            success: false,
            message: 'Database not configured.',
        }, { status: 503 });
    }

    try {
        const settings = await getAiSettings();

        // Check if WhatsApp Recovery Engine is enabled
        if (!settings.whatsappRecoveryEnabled) {
            return NextResponse.json({
                success: true,
                message: 'WhatsApp Abandoned Cart Recovery Engine is currently paused in settings.',
                stats: { newSessionsInitiated: 0, remindersDispatched: 0 }
            });
        }

        const pId = (settings.whatsappPhoneNumberId || '').trim();
        const token = (settings.whatsappAccessToken || '').trim();

        if (!pId || !token) {
            return NextResponse.json({
                success: false,
                message: 'WhatsApp Cloud API credentials (Phone Number ID / Access Token) are missing.',
            }, { status: 400 });
        }

        let isForce = false;
        try {
            if (request.nextUrl) {
                isForce = request.nextUrl.searchParams.get('force') === 'true' || request.nextUrl.searchParams.get('test') === 'true';
            } else if (request.url) {
                const url = new URL(request.url, 'http://localhost');
                isForce = url.searchParams.get('force') === 'true' || url.searchParams.get('test') === 'true';
            }
        } catch {}

        const delayHours = parseFloat(settings.whatsappRecoveryDelayHours) || 1;
        const delayMs = isForce ? 0 : (delayHours * 60 * 60 * 1000);
        const cutoffTime = new Date(Date.now() - delayMs);
        const baseUrl = process.env.NEXTAUTH_URL || 'https://ukbrandlover.com';

        let newSessionsInitiated = 0;
        let remindersDispatched = 0;
        let expiredCount = 0;
        let convertedCount = 0;

        // =========================================================================
        // PART 1: Process Ongoing Active Recovery Sessions (Stages 2, 3, etc.)
        // =========================================================================
        const activeRecoveries = await prisma.abandonedCartRecovery.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        whatsapp: true,
                    }
                },
                product: {
                    select: {
                        images: true,
                    }
                }
            }
        });

        const now = new Date();

        for (const recovery of activeRecoveries) {
            // Check if recovery session expired
            if (now >= new Date(recovery.expiresAt)) {
                await prisma.abandonedCartRecovery.update({
                    where: { id: recovery.id },
                    data: { status: 'EXPIRED' }
                });
                expiredCount++;
                continue;
            }

            // Check if user has placed an order since session creation
            const recentOrder = await prisma.order.findFirst({
                where: {
                    userId: recovery.userId,
                    createdAt: { gte: recovery.createdAt },
                    status: { not: 'CANCELLED' }
                }
            });

            if (recentOrder) {
                await prisma.abandonedCartRecovery.update({
                    where: { id: recovery.id },
                    data: { status: 'CONVERTED' }
                });
                convertedCount++;
                continue;
            }

            // Calculate timing for next reminder stage
            const totalValidityHours = recovery.validityHours || 24;
            const expiresAtMs = new Date(recovery.expiresAt).getTime();
            const lastSentMs = new Date(recovery.lastSentAt).getTime();

            const hoursRemaining = Math.max(1, Math.round((expiresAtMs - Date.now()) / (1000 * 60 * 60)));
            const hoursSinceLastSent = (Date.now() - lastSentMs) / (1000 * 60 * 60);

            let shouldSendNextStage = false;
            let nextStage = recovery.stage + 1;
            let stageTemplate = settings.whatsappTemplateStage2;

            // 1 Day (24 Hours): Max 3 Messages
            // Stage 2: Warning reminder at ~12h remaining (at least 5h after stage 1)
            if (recovery.stage === 1 && hoursRemaining <= 14 && hoursSinceLastSent >= 5) {
                shouldSendNextStage = true;
                nextStage = 2;
                stageTemplate = settings.whatsappTemplateStage2;
            }
            // Stage 3: Final call at <= 4h remaining (at least 3h after stage 2)
            else if (recovery.stage === 2 && hoursRemaining <= 4 && hoursSinceLastSent >= 3) {
                shouldSendNextStage = true;
                nextStage = 3;
                stageTemplate = settings.whatsappTemplateStage3;
            }

            if (shouldSendNextStage) {
                const cartUrl = `${baseUrl}/checkout`;
                const productImage = (Array.isArray(recovery.product?.images) && recovery.product.images.length > 0)
                    ? recovery.product.images[0]
                    : null;

                const messageBody = formatRecoveryMessage(stageTemplate, {
                    customerName: recovery.userName,
                    productName: recovery.productName,
                    hoursRemaining,
                    cartUrl,
                    storePhone: settings.whatsappHotline || '+880 1959-524393',
                });

                const sendResult = await sendWhatsAppMessage({
                    to: recovery.userPhone,
                    text: messageBody,
                    imageUrl: productImage,
                    phoneNumberId: pId,
                    accessToken: token,
                });

                if (sendResult.success) {
                    await prisma.abandonedCartRecovery.update({
                        where: { id: recovery.id },
                        data: {
                            stage: nextStage,
                            lastSentAt: new Date(),
                            status: nextStage >= (recovery.maxStages || 3) ? 'ACTIVE' : 'ACTIVE',
                        }
                    });
                    remindersDispatched++;
                }
            }
        }

        // =========================================================================
        // PART 2: Find New Cart Abandoners for Stage 1 (Initial Reserved Reminder)
        // =========================================================================
        const candidateUsers = await prisma.user.findMany({
            where: {
                ...(isForce ? {} : { abandonedCartAt: { lte: cutoffTime } }),
                isActive: true,
            },
            include: {
                addresses: {
                    select: { phoneNumber: true },
                    orderBy: { isDefault: 'desc' },
                    take: 1,
                },
                abandonedCartRecoveries: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                }
            },
            take: 30, // Batch limit per cron execution
        });

        for (const user of candidateUsers) {
            // Skip if already notified for this specific cart abandonment (unless forced test)
            if (!isForce && user.abandonedCartNotifiedAt && new Date(user.abandonedCartNotifiedAt) >= new Date(user.abandonedCartAt)) {
                continue;
            }

            // Verify customer has a valid phone number
            const rawPhone = user.whatsapp || user.phone || user.addresses?.[0]?.phoneNumber;
            const normalizedPhone = normalizeWhatsAppNumber(rawPhone);
            if (!normalizedPhone || normalizedPhone.length < 10) {
                continue;
            }

            // Inspect cart items
            const cartObj = (user.cart && typeof user.cart === 'object') ? user.cart : {};
            const productIds = Object.keys(cartObj).filter(pId => Number(cartObj[pId]) > 0);
            if (productIds.length === 0) {
                continue;
            }

            // Find all active in-stock products in customer's cart
            const eligibleProducts = await prisma.product.findMany({
                where: {
                    id: { in: productIds },
                    inStock: true,
                    isActive: true,
                },
                orderBy: { price: 'desc' },
            });

            if (eligibleProducts.length === 0) {
                continue;
            }

            const userEmailClean = (user.email || '').toLowerCase().trim();
            const validityHours = 24;
            const expiresAt = new Date(Date.now() + validityHours * 60 * 60 * 1000);
            const cartUrl = `${baseUrl}/checkout`;
            const validityText = '24 Hours';

            let userNotifiedCount = 0;

            // Iterate over ALL products in the customer's cart so every product gets its notification
            for (const targetProduct of eligibleProducts) {
                // Check if user already has an active recovery session for this product
                const existingForProduct = user.abandonedCartRecoveries?.find(
                    r => r.productId === targetProduct.id && r.status === 'ACTIVE'
                );

                if (existingForProduct) {
                    // If cart was updated after that session was created, supersede it
                    if (isForce || (user.abandonedCartAt && new Date(user.abandonedCartAt) > new Date(existingForProduct.createdAt))) {
                        await prisma.abandonedCartRecovery.update({
                            where: { id: existingForProduct.id },
                            data: { status: 'SUPERSEDED' }
                        });
                    } else {
                        // Already actively notified for this item
                        continue;
                    }
                }

                const originalPrice = Math.round(targetProduct.price);
                const productImage = (Array.isArray(targetProduct.images) && targetProduct.images.length > 0)
                    ? targetProduct.images[0]
                    : null;

                // Format Stage 1 Message (Personalized to this product, NO automatic coupon)
                const messageBody = formatRecoveryMessage(settings.whatsappTemplateStage1, {
                    customerName: user.name,
                    productName: targetProduct.name,
                    productPrice: originalPrice,
                    cartUrl,
                    validityText,
                    storePhone: settings.whatsappHotline || '+880 1959-524393',
                });

                // Dispatch message via WhatsApp Cloud API with product cover photo
                const dispatchResult = await sendWhatsAppMessage({
                    to: normalizedPhone,
                    text: messageBody,
                    imageUrl: productImage,
                    phoneNumberId: pId,
                    accessToken: token,
                });

                if (dispatchResult.success) {
                    // Record Recovery Session without coupon
                    await prisma.abandonedCartRecovery.create({
                        data: {
                            userId: user.id,
                            userPhone: normalizedPhone,
                            userName: user.name,
                            userEmail: userEmailClean,
                            productId: targetProduct.id,
                            productName: targetProduct.name,
                            couponId: null,
                            couponCode: null,
                            discountType: null,
                            discountValue: null,
                            validityHours,
                            expiresAt,
                            stage: 1,
                            maxStages: 3,
                            status: 'ACTIVE',
                            lastSentAt: new Date(),
                        }
                    });

                    newSessionsInitiated++;
                    userNotifiedCount++;
                } else {
                    console.warn(`WhatsApp dispatch failed for user ${user.id} (${normalizedPhone}) for product ${targetProduct.name}:`, dispatchResult.message);
                }
            }

            if (userNotifiedCount > 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { abandonedCartNotifiedAt: new Date() }
                });
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            latencyMs: Date.now() - startTime,
            stats: {
                newSessionsInitiated,
                remindersDispatched,
                expiredCount,
                convertedCount,
            }
        });
    } catch (error) {
        console.error('Error running abandoned cart recovery cron:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to process abandoned cart recovery.',
            error: error.message,
        }, { status: 500 });
    }
}
