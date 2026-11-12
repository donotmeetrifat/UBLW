import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // High-converting psychological abandoned cart leads
        const abandonedCarts = [
            {
                id: "lead_1",
                customerName: "Nusrat Jahan",
                whatsapp: "01819283746",
                city: "Chattogram",
                productName: "The Ordinary Niacinamide 10% + Zinc 1%",
                productPrice: 1850,
                productImage: "/product_img2.png",
                hoursSinceCart: 48, // 2 days ago
                suggestedCoupon: "VIP15",
                discountPercent: 15,
                discountedPrice: 1572,
                // Psychological, personalized message ready for 1-click WhatsApp sending:
                message: "Assalamu Alaikum Nusrat Jahan আপু! ✨ Hope you are having a wonderful week. We noticed you left the authentic UK imported *The Ordinary Niacinamide 10% Serum* in your shopping bag. \n\nThis imported Heathrow batch is almost sold out in our Dhaka central hub (only 3 bottles left). Because we truly value having you with UK Brand Lover, our team manager reserved a secret 15% VIP discount code exclusively for you: *VIP15* (takes ৳278 off!). \n\nClick here to claim your authentic UK serum with Free Nationwide Express Delivery: https://ukbrandlover.vercel.app/cart?coupon=VIP15 \n\nOffer valid for the next 24 hours. Have a glowing day! 🌸 — UK Brand Lover Flagship"
            },
            {
                id: "lead_2",
                customerName: "Sabrina Islam",
                whatsapp: "01711223344",
                city: "Sylhet",
                productName: "CeraVe Foaming Cleanser for Normal to Oily Skin 473ml",
                productPrice: 2450,
                productImage: "/product_img1.png",
                hoursSinceCart: 72, // 3 days ago
                suggestedCoupon: "COMEBACK10",
                discountPercent: 10,
                discountedPrice: 2205,
                message: "Assalamu Alaikum Sabrina আপু! 🌿 We were preparing our daily UK dispatch and remembered your interest in the *CeraVe Foaming Cleanser 473ml* in your bag.\n\nWe would love for your skin to experience the gentle, dermatologist-approved ceramides. As a warm welcome, here is a special 10% gift voucher: *COMEBACK10* + 100% Free Nationwide Express Delivery!\n\nTap here to finalize your genuine UK order before tonight's courier pickup: https://ukbrandlover.vercel.app/cart?coupon=COMEBACK10 \n\nFeel free to reply if you need any skincare routine guidance! ✨ — UK Brand Lover"
            },
            {
                id: "lead_3",
                customerName: "Farhana Ahmed",
                whatsapp: "01911998877",
                city: "Rajshahi",
                productName: "Charlotte Tilbury Matte Revolution - Pillow Talk",
                productPrice: 4350,
                productImage: "/product_img5.png",
                hoursSinceCart: 60, // 2.5 days ago
                suggestedCoupon: "LUXE15",
                discountPercent: 15,
                discountedPrice: 3697,
                message: "Hello Farhana আপু! 💄 The iconic *Charlotte Tilbury Pillow Talk* in your UK Brand Lover bag is waiting for you! \n\nOriginal UK stock of this cult shade is extremely rare in Bangladesh right now. We have reserved one authentic piece under your name at our Dhaka hub with an exclusive 15% secret voucher: *LUXE15* (Save ৳653!).\n\nClaim yours now with Free Doorstep Delivery: https://ukbrandlover.vercel.app/cart?coupon=LUXE15 \n\nLet us know if you would like us to pack your parcel today! 💖 — UK Brand Lover"
            }
        ];

        return NextResponse.json({ success: true, abandonedCarts });
    } catch (error) {
        console.error('Error in abandoned carts API:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

