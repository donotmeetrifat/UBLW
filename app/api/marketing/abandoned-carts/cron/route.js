import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getAiSettings } from '@/lib/aiBot';
import { sendWhatsAppMessage, formatRecoveryMessage, normalizeWhatsAppNumber } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generateUniqueCouponCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'UKBL-AC-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

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
                }
            }
        });

        const now = new Date();

        for (const recovery of activeRecoveries) {
            // Check if coupon or session expired
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
            const createdAtMs = new Date(recovery.createdAt).getTime();
            const lastSentMs = new Date(recovery.lastSentAt).getTime();

            const hoursRemaining = Math.max(1, Math.round((expiresAtMs - Date.now()) / (1000 * 60 * 60)));
            const elapsedHours = (Date.now() - createdAtMs) / (1000 * 60 * 60);
            const hoursSinceLastSent = (Date.now() - lastSentMs) / (1000 * 60 * 60);

            let shouldSendNextStage = false;
            let nextStage = recovery.stage + 1;
            let stageTemplate = settings.whatsappTemplateStage2;

            if (totalValidityHours <= 24) {
                // 1 Day (24 Hours): Max 3 Messages
                // Stage 2: Warning reminder at ~12h remaining (at least 6h after stage 1)
                if (recovery.stage === 1 && hoursRemaining <= 14 && hoursSinceLastSent >= 5) {
                    shouldSendNextStage = true;
                    nextStage = 2;
                    stageTemplate = settings.whatsappTemplateStage2;
                }
                // Stage 3: Final call at <= 3h remaining (at least 4h after stage 2)
                else if (recovery.stage === 2 && hoursRemaining <= 3 && hoursSinceLastSent >= 3) {
                    shouldSendNextStage = true;
                    nextStage = 3;
                    stageTemplate = settings.whatsappTemplateStage3;
                }
            } else if (totalValidityHours <= 48) {
                // 2 Days (48 Hours): 2 messages on Day 1, 3 messages on Day 2 (Max 5 Messages)
                // Day 1:
                if (recovery.stage === 1 && elapsedHours >= 10 && hoursSinceLastSent >= 8) {
                    shouldSendNextStage = true;
                    nextStage = 2;
                    stageTemplate = settings.whatsappTemplateStage2;
                }
                // Day 2 (Countdown reminders):
                else if (recovery.stage === 2 && elapsedHours >= 24 && hoursSinceLastSent >= 8) {
                    shouldSendNextStage = true;
                    nextStage = 3;
                    stageTemplate = settings.whatsappTemplateStage2;
                } else if (recovery.stage === 3 && hoursRemaining <= 12 && hoursSinceLastSent >= 6) {
                    shouldSendNextStage = true;
                    nextStage = 4;
                    stageTemplate = settings.whatsappTemplateStage2;
                } else if (recovery.stage === 4 && hoursRemaining <= 4 && hoursSinceLastSent >= 3) {
                    shouldSendNextStage = true;
                    nextStage = 5;
                    stageTemplate = settings.whatsappTemplateStage3;
                }
            } else {
                // 3 Days (72 Hours): Spread across 3 days
                if (recovery.stage === 1 && elapsedHours >= 16 && hoursSinceLastSent >= 10) {
                    shouldSendNextStage = true;
                    nextStage = 2;
                    stageTemplate = settings.whatsappTemplateStage2;
                } else if (recovery.stage === 2 && elapsedHours >= 36 && hoursSinceLastSent >= 12) {
                    shouldSendNextStage = true;
                    nextStage = 3;
                    stageTemplate = settings.whatsappTemplateStage2;
                } else if (recovery.stage === 3 && hoursRemaining <= 24 && hoursSinceLastSent >= 10) {
                    shouldSendNextStage = true;
                    nextStage = 4;
                    stageTemplate = settings.whatsappTemplateStage2;
                } else if (recovery.stage === 4 && hoursRemaining <= 4 && hoursSinceLastSent >= 4) {
                    shouldSendNextStage = true;
                    nextStage = 5;
                    stageTemplate = settings.whatsappTemplateStage3;
                }
            }

            if (shouldSendNextStage) {
                const discountText = recovery.discountType === 'PERCENTAGE'
                    ? `${recovery.discountValue}% OFF`
                    : `৳${recovery.discountValue} OFF`;

                const cartUrl = `${baseUrl}/checkout?code=${encodeURIComponent(recovery.couponCode)}`;

                const messageBody = formatRecoveryMessage(stageTemplate, {
                    customerName: recovery.userName,
                    productName: recovery.productName,
                    discountText,
                    couponCode: recovery.couponCode,
                    hoursRemaining,
                    cartUrl,
                    storePhone: settings.whatsappHotline || '+880 1959-524393',
                });

                const sendResult = await sendWhatsAppMessage({
                    to: recovery.userPhone,
                    text: messageBody,
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
        // PART 2: Find New Cart Abandoners for Stage 1 (Initial Offer)
        // =========================================================================
        const candidateUsers = await prisma.user.findMany({
            where: {
                abandonedCartAt: { lte: cutoffTime },
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
                    take: 1,
                }
            },
            take: 30, // Batch limit per cron execution
        });

        for (const user of candidateUsers) {
            // Skip if already notified for this specific cart abandonment
            if (user.abandonedCartNotifiedAt && new Date(user.abandonedCartNotifiedAt) >= new Date(user.abandonedCartAt)) {
                continue;
            }

            // If user has an existing active recovery session
            if (user.abandonedCartRecoveries && user.abandonedCartRecoveries.length > 0) {
                const activeRecovery = user.abandonedCartRecoveries[0];
                // If the active recovery was created before the latest cart change, supersede it
                if (user.abandonedCartAt && new Date(user.abandonedCartAt) > new Date(activeRecovery.createdAt)) {
                    await prisma.abandonedCartRecovery.update({
                        where: { id: activeRecovery.id },
                        data: { status: 'SUPERSEDED' }
                    });
                } else {
                    // Otherwise it is currently progressing through its multi-stage reminder flow
                    continue;
                }
            }

            // Verify customer has a valid phone number
            const rawPhone = user.whatsapp || user.phone || user.addresses?.[0]?.phoneNumber;
            const normalizedPhone = normalizeWhatsAppNumber(rawPhone);
            if (!normalizedPhone || normalizedPhone.length < 10) {
                continue;
            }

            // Inspect cart items
            const cartObj = (user.cart && typeof user.cart === 'object') ? user.cart : {};
            const productIds = Object.keys(cartObj);
            if (productIds.length === 0) {
                continue;
            }

            // Find eligible products that have abandonedCartOfferEnabled = true
            let eligibleProducts = await prisma.product.findMany({
                where: {
                    id: { in: productIds },
                    abandonedCartOfferEnabled: true,
                    inStock: true,
                    isActive: true,
                },
                orderBy: { price: 'desc' },
                take: 1,
            });

            // Fallback: If no product in cart has custom abandonedCartOfferEnabled, automatically recover the highest-value active in-stock cart item
            if (eligibleProducts.length === 0) {
                eligibleProducts = await prisma.product.findMany({
                    where: {
                        id: { in: productIds },
                        inStock: true,
                        isActive: true,
                    },
                    orderBy: { price: 'desc' },
                    take: 1,
                });
            }

            if (eligibleProducts.length === 0) {
                continue;
            }

            const targetProduct = eligibleProducts[0];
            const discountType = targetProduct.abandonedCartDiscountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
            const discountValue = targetProduct.abandonedCartDiscountValue || 10;
            const validityDays = targetProduct.abandonedCartValidityDays || 1;
            const validityHours = validityDays * 24;
            const expiresAt = new Date(Date.now() + validityHours * 60 * 60 * 1000);

            // Generate unique, strictly locked coupon code
            let couponCode = generateUniqueCouponCode();
            // Ensure unique
            let attempts = 0;
            while (attempts < 5) {
                const existing = await prisma.coupon.findUnique({ where: { code: couponCode } });
                if (!existing) break;
                couponCode = generateUniqueCouponCode();
                attempts++;
            }

            const userEmailClean = user.email.toLowerCase().trim();

            // Create Double-Locked Coupon
            const coupon = await prisma.coupon.create({
                data: {
                    code: couponCode,
                    description: `1-Time WhatsApp Cart Recovery Offer for ${user.name}`,
                    discountType,
                    discount: parseFloat(discountValue) || 10,
                    usageLimit: 1,
                    applicableProductIds: [targetProduct.id],
                    allowedUserIds: [user.id],
                    allowedUserEmails: [userEmailClean],
                    expiresAt,
                    isLifetime: false,
                    isActive: true,
                    forNewUserOnly: false,
                }
            });

            // Calculate prices & discount text
            const originalPrice = Math.round(targetProduct.price);
            let discountedPrice = originalPrice;
            let discountText = '';

            if (discountType === 'PERCENTAGE') {
                discountedPrice = Math.max(0, Math.round(originalPrice - (originalPrice * (discountValue / 100))));
                discountText = `${discountValue}% OFF (Save ৳${originalPrice - discountedPrice})`;
            } else {
                discountedPrice = Math.max(0, Math.round(originalPrice - discountValue));
                discountText = `৳${discountValue} OFF (Save ৳${discountValue})`;
            }

            const cartUrl = `${baseUrl}/checkout?code=${encodeURIComponent(coupon.code)}`;
            const validityText = `${validityDays} Day${validityDays > 1 ? 's' : ''} (${validityHours} Hours)`;

            // Format Stage 1 Message
            const messageBody = formatRecoveryMessage(settings.whatsappTemplateStage1, {
                customerName: user.name,
                productName: targetProduct.name,
                productPrice: originalPrice,
                discountText,
                discountedPrice,
                couponCode: coupon.code,
                validityText,
                cartUrl,
                storePhone: settings.whatsappHotline || '+880 1959-524393',
            });

            // Dispatch message via WhatsApp Cloud API
            const dispatchResult = await sendWhatsAppMessage({
                to: normalizedPhone,
                text: messageBody,
                phoneNumberId: pId,
                accessToken: token,
            });

            if (dispatchResult.success) {
                // Record Recovery Session
                await prisma.abandonedCartRecovery.create({
                    data: {
                        userId: user.id,
                        userPhone: normalizedPhone,
                        userName: user.name,
                        userEmail: userEmailClean,
                        productId: targetProduct.id,
                        productName: targetProduct.name,
                        couponId: coupon.id,
                        couponCode: coupon.code,
                        discountType,
                        discountValue,
                        validityHours,
                        expiresAt,
                        stage: 1,
                        maxStages: validityDays === 1 ? 3 : (validityDays === 2 ? 5 : 7),
                        status: 'ACTIVE',
                        lastSentAt: new Date(),
                    }
                });

                // Mark user as notified so we don't spam Stage 1
                await prisma.user.update({
                    where: { id: user.id },
                    data: { abandonedCartNotifiedAt: new Date() }
                });

                newSessionsInitiated++;
            } else {
                console.warn(`WhatsApp dispatch failed for user ${user.id} (${normalizedPhone}):`, dispatchResult.message);
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
