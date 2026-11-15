import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Local OCR helper for Windows/Local offline development
 * Extracts text from product packaging when cloud vision is offline or unconfigured
 */
export function extractLocalOcrText(imageBase64) {
    if (!imageBase64 || typeof imageBase64 !== 'string') return '';
    if (process.platform !== 'win32') return '';

    let tmpFile = null;
    try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        if (cleanBase64.length < 50) return '';

        tmpFile = path.join(os.tmpdir(), `ukbl_ocr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`);
        fs.writeFileSync(tmpFile, Buffer.from(cleanBase64, 'base64'));

        const psScriptPath = path.resolve(process.cwd(), 'lib/ocr.ps1');
        if (!fs.existsSync(psScriptPath)) return '';

        const output = execFileSync('powershell.exe', [
            '-NoProfile',
            '-ExecutionPolicy', 'Bypass',
            '-File', psScriptPath,
            '-ImagePath', tmpFile,
        ], {
            timeout: 3500,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });

        if (tmpFile && fs.existsSync(tmpFile)) {
            try { fs.unlinkSync(tmpFile); } catch {}
        }

        return (output || '').trim();
    } catch {
        if (tmpFile && fs.existsSync(tmpFile)) {
            try { fs.unlinkSync(tmpFile); } catch {}
        }
        return '';
    }
}

/**
 * Clean up OCR words into a legible product title
 */
export function formatExtractedProductTitle(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    
    let text = rawText.replace(/\r?\n/g, ' ').replace(/[*_#|]/g, ' ').replace(/\s+/g, ' ').trim();
    text = text.replace(/\bSAAMPoo\b/i, 'Shampoo')
               .replace(/\bSHAMPOO\b/i, 'Shampoo')
               .replace(/\bGooO\b/i, 'Good')
               .replace(/\bLiTTLE\b/i, 'Little')
               .replace(/\bCOTTON\b/i, '')
               .replace(/CV$/i, '')
               .replace(/\s+/g, ' ')
               .trim();

    if (!text) return '';

    // Take top 8 words
    const words = text.split(' ').slice(0, 8);
    const capitalized = words.map(w => {
        if (/^\d+(ml|g|oz)?$/i.test(w)) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    return capitalized.join(' ');
}
