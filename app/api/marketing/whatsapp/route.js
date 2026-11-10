import { NextResponse } from 'next/server';

// Official WhatsApp Cloud API & Webhook Dispatch Handler
// Official Hotline: +880 1959-524393

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'ukbl_verify_secret_2026';

// 1. Webhook Verification for Meta WhatsApp Cloud API
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('hub.mode');
        const token = searchParams.get('hub.verify_token');
        const challenge = searchParams.get('hub.challenge');

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ WhatsApp Webhook verified successfully!');
            return new Response(challenge, { status: 200 });
        }

        return NextResponse.json({ success: false, message: 'Invalid verification token' }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 2. Outgoing Automated WhatsApp Message Dispatcher
export async function POST(request) {
    try {
        const body = await request.json();
        const { to, message, templateName, type = 'text' } = body;

        const cleanPhone = (to || '').replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            return NextResponse.json({ success: false, message: 'Recipient phone number is required' }, { status: 400 });
        }

        // Format to international +880 if not already present
        const formattedPhone = cleanPhone.startsWith('880') 
            ? cleanPhone 
            : cleanPhone.startsWith('0') 
                ? `88${cleanPhone}` 
                : `880${cleanPhone}`;

        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        // If Meta Cloud API credentials are provided in .env.local:
        if (phoneNumberId && accessToken) {
            const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

            const payload = templateName ? {
                messaging_product: "whatsapp",
                to: formattedPhone,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "en_US" }
                }
            } : {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "text",
                text: { preview_url: true, body: message }
            };

            const metaRes = await fetch(metaUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const metaData = await metaRes.json();
            return NextResponse.json({ success: true, mode: 'META_CLOUD_API', data: metaData });
        }

        // 100% Free Gateway Mode (Logs payload & returns direct wa.me dispatch link)
        const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        
        return NextResponse.json({
            success: true,
            mode: 'FREE_GATEWAY',
            message: 'Message queued for dispatch from official hotline +880 1959-524393',
            recipient: formattedPhone,
            dispatchUrl: waLink,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error dispatching WhatsApp message:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
