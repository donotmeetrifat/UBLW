import { getAiSettings } from './aiBot.js';

/**
 * Standardize phone number for WhatsApp Cloud API (E.164 format without '+')
 * E.g., '01959-524393' -> '8801959524393'
 * E.g., '+880 1959 524393' -> '8801959524393'
 */
export function normalizeWhatsAppNumber(rawPhone) {
    if (!rawPhone || typeof rawPhone !== 'string') return '';
    let cleaned = rawPhone.replace(/[^\d]/g, ''); // Keep digits only

    // If starts with 01 (BD local format without country code, 11 digits: 01XXXXXXXXX)
    if (cleaned.startsWith('01') && cleaned.length === 11) {
        cleaned = '88' + cleaned;
    }

    // If starts with 8801 (13 digits), already has country code
    return cleaned;
}

/**
 * Verify WhatsApp Cloud API Connection with Meta Graph API
 */
export async function verifyWhatsAppConnection(phoneNumberId, accessToken) {
    const pId = (phoneNumberId || '').trim();
    const token = (accessToken || '').trim();

    if (!pId || !token) {
        return {
            success: false,
            message: 'Phone Number ID and Access Token are both required.',
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`https://graph.facebook.com/v21.0/${pId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json();

        if (!res.ok || data.error) {
            return {
                success: false,
                message: data.error?.message || 'Failed to authenticate with WhatsApp Cloud API.',
                error: data.error,
            };
        }

        return {
            success: true,
            displayPhoneNumber: data.display_phone_number || '',
            verifiedName: data.verified_name || 'UK Brand Lover',
            qualityRating: data.quality_rating || 'UNKNOWN',
            verificationStatus: data.code_verification_status || 'VERIFIED',
            message: `Connected to WhatsApp Business: ${data.display_phone_number || pId} (${data.verified_name || 'Verified'})`,
        };
    } catch (err) {
        return {
            success: false,
            message: `WhatsApp API verification failed: ${err.message}`,
        };
    }
}

/**
 * Send WhatsApp text message via Meta Cloud API
 */
export async function sendWhatsAppMessage({ to, text, phoneNumberId, accessToken }) {
    try {
        let pId = phoneNumberId;
        let token = accessToken;

        if (!pId || !token) {
            const settings = await getAiSettings();
            pId = pId || settings.whatsappPhoneNumberId;
            token = token || settings.whatsappAccessToken;
        }

        pId = (pId || '').trim();
        token = (token || '').trim();

        if (!pId || !token) {
            return {
                success: false,
                message: 'WhatsApp Cloud API is not connected. Missing Phone Number ID or Access Token.',
            };
        }

        const recipientPhone = normalizeWhatsAppNumber(to);
        if (!recipientPhone || recipientPhone.length < 10) {
            return {
                success: false,
                message: `Invalid recipient phone number: ${to}`,
            };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'text',
            text: {
                preview_url: true,
                body: text,
            },
        };

        const res = await fetch(`https://graph.facebook.com/v21.0/${pId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json();

        if (!res.ok || data.error) {
            console.error('WhatsApp API dispatch failed:', data.error);
            let friendlyMessage = data.error?.message || 'Meta WhatsApp API returned an error.';
            if (data.error?.code === 131030) {
                friendlyMessage = `Meta Sandbox limitation: recipient number (${recipientPhone}) is not in Meta's allowed list. Please add this recipient number in Meta Developer Portal -> WhatsApp -> API Setup -> "To" dropdown -> "Manage phone number list", OR add your real store phone number under Step 5.`;
            } else if (data.error?.code === 131026) {
                friendlyMessage = `Message undeliverable: The recipient number is not a valid WhatsApp account or is currently unreachable.`;
            } else if (data.error?.code === 131047) {
                friendlyMessage = `24-hour window closed: In WhatsApp Cloud API, free-form text messages can only be sent within 24 hours of customer interaction.`;
            }
            return {
                success: false,
                message: friendlyMessage,
                error: data.error,
            };
        }

        const messageId = data.messages?.[0]?.id || 'WA-MSG-OK';
        return {
            success: true,
            messageId,
            recipient: recipientPhone,
            data,
        };
    } catch (err) {
        console.error('Error sending WhatsApp message:', err);
        return {
            success: false,
            message: `Failed to send WhatsApp message: ${err.message}`,
        };
    }
}

/**
 * Replace dynamic tokens in message template
 * Strictly formats customer name without honorifics (no apu/bhaiya/sir/madam)
 */
export function formatRecoveryMessage(template, {
    customerName = 'Valued Customer',
    productName = 'UK Imported Skincare',
    productPrice = 0,
    discountText = '10% OFF',
    discountedPrice = 0,
    couponCode = 'UKBL-OFFER',
    hoursRemaining = 24,
    validityText = '24 Hours',
    cartUrl = 'https://ukbrandlover.com/cart',
    storePhone = '+880 1959-524393',
} = {}) {
    if (!template || typeof template !== 'string') return '';

    // Clean name: remove honorifics if present in stored user name
    let cleanName = customerName
        .replace(/\b(apu|apu\.|bhaiya|bhaiya\.|bhai|vhai|vhaiya|sir|madam)\b/gi, '')
        .trim();
    if (!cleanName) cleanName = 'Customer';

    return template
        .replace(/\{customer_name\}/g, cleanName)
        .replace(/\{product_name\}/g, productName)
        .replace(/\{product_price\}/g, String(productPrice))
        .replace(/\{discount_text\}/g, discountText)
        .replace(/\{discounted_price\}/g, String(discountedPrice))
        .replace(/\{coupon_code\}/g, couponCode)
        .replace(/\{hours_remaining\}/g, String(hoursRemaining))
        .replace(/\{validity_text\}/g, validityText)
        .replace(/\{cart_url\}/g, cartUrl)
        .replace(/\{store_phone\}/g, storePhone)
        .replace(/\{hotline\}/g, storePhone)
        .replace(/\{whatsapp_number\}/g, storePhone);
}
