import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

/**
 * Universal Secure Email Sender for UK Brand Lover
 * Dispatches 6-digit OTP to user's registered email address.
 * 
 * Channels:
 * 1. Direct SMTP via Nodemailer (if SMTP_HOST or GMAIL_APP_PASSWORD configured)
 * 2. Resend REST API (if RESEND_API_KEY configured)
 * 3. Supabase Auth reset dispatch (native fallback)
 */

export async function sendPasswordOtpEmail({ to, name = 'Valued Customer', otp }) {
    if (!to || !to.includes('@')) {
        throw new Error('Valid recipient email address is required');
    }

    const recipientName = name && name.trim() ? name.trim() : 'Valued Customer';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ukbrandlover.vercel.app';
    const subject = `Your Password Verification Code: ${otp} - UK Brand Lover`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6FA; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #EFE0EF; box-shadow: 0 10px 30px rgba(108, 48, 110, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6C306E 0%, #401242 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">UK BRAND LOVER</h1>
              <p style="color: rgba(255, 255, 255, 0.8); font-size: 11px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">100% Authentic British Luxury & Beauty</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="background-color: #FAF6FA; border: 1px solid #EFE0EF; border-radius: 16px; padding: 14px 18px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #6C306E; text-transform: uppercase; letter-spacing: 1px;">Security Notification • Account Protection</p>
              </div>

              <h2 style="color: #241224; font-size: 18px; margin: 0 0 12px; font-weight: 700;">Password Change Request</h2>
              <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Hello <strong>${recipientName}</strong>,<br>
                We received a request to change the password for your UK Brand Lover account. Use the following 6-digit verification code to complete your password update:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background: linear-gradient(135deg, #FAF6FA 0%, #F5EEF5 100%); border: 2px dashed #6C306E; border-radius: 20px; padding: 24px; text-align: center; margin: 28px 0;">
                <p style="font-size: 11px; font-weight: 700; color: #6C306E; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Your 6-Digit Verification Code</p>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #3A0C38; padding: 8px 0;">
                  ${otp}
                </div>
                <p style="font-size: 11px; color: #718096; margin: 8px 0 0;">Valid for <strong>10 minutes</strong> • One-time use only</p>
              </div>

              <!-- Security Tips -->
              <div style="background-color: #FFFDF5; border: 1px solid #FEF3C7; border-radius: 14px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400E;">
                  <strong>Important Security Advice:</strong><br>
                  • Never share this code with anyone, including UK Brand Lover staff.<br>
                  • If you did not initiate this password change, your account may be at risk. Please contact our support team immediately.
                </p>
              </div>

              <p style="color: #718096; font-size: 12px; line-height: 1.5; margin: 28px 0 0;">
                Regards,<br>
                <strong style="color: #241224;">UK Brand Lover Security Team</strong><br>
                <a href="${appUrl}" style="color: #6C306E; text-decoration: none; font-weight: 600;">ukbrandlover.vercel.app</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF6FA; border-top: 1px solid #EFE0EF; padding: 20px 24px; text-align: center;">
              <p style="color: #A0AEC0; font-size: 11px; margin: 0; line-height: 1.5;">
                This is an automated security email sent to ${to}.<br>
                © ${new Date().getFullYear()} UK Brand Lover. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    let delivered = false;

    // 1. Try SMTP if configured
    const smtpHost = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpFrom = process.env.SMTP_FROM || `UK Brand Lover Security <${smtpUser || 'support@ukbrandlover.com'}>`;

    if (smtpHost && smtpUser && smtpPass) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            await transporter.sendMail({
                from: smtpFrom,
                to,
                subject,
                html: htmlContent,
                text: `Your UK Brand Lover password verification code is: ${otp}. This code is valid for 10 minutes.`
            });

            delivered = true;
            console.log(`[EMAIL DISPATCH] Password OTP email sent via SMTP to ${to}`);
        } catch (smtpErr) {
            console.error('[EMAIL DISPATCH] SMTP delivery failed:', smtpErr.message);
        }
    }

    // 2. Try Resend REST API if configured
    if (!delivered && process.env.RESEND_API_KEY) {
        try {
            const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.RESEND_FROM || 'UK Brand Lover Security <security@ukbrandlover.com>',
                    to: [to],
                    subject,
                    html: htmlContent
                })
            });
            if (resendRes.ok) {
                delivered = true;
                console.log(`[EMAIL DISPATCH] Password OTP email sent via Resend API to ${to}`);
            } else {
                const errText = await resendRes.text();
                console.warn('[EMAIL DISPATCH] Resend API error:', errText);
            }
        } catch (resendErr) {
            console.error('[EMAIL DISPATCH] Resend delivery error:', resendErr.message);
        }
    }

    // 3. Fallback: Also trigger Supabase Auth recovery email
    try {
        await supabase.auth.resetPasswordForEmail(to, {
            redirectTo: `${appUrl}/account`
        });
        console.log(`[EMAIL DISPATCH] Supabase password reset triggered for ${to}`);
        delivered = true;
    } catch (supaErr) {
        console.warn('[EMAIL DISPATCH] Supabase reset fallback error:', supaErr?.message);
    }

    return {
        success: true,
        delivered,
        recipient: to
    };
}
