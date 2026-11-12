'use client'

import toast from 'react-hot-toast'

/**
 * Check if the user is currently signed in on the client.
 */
export function isClientSignedIn() {
    if (typeof window === 'undefined') return false;
    try {
        const raw = localStorage.getItem('ukbl_current_user');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!(parsed && parsed.id);
    } catch {
        return false;
    }
}

/**
 * Get current client user data or null.
 */
export function getClientUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('ukbl_current_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Prompt user to sign in with an optional custom message and open the AuthModal.
 * Returns true if already signed in, false if sign-in is required.
 */
export function requireSignIn(message = 'Please sign in to continue.') {
    if (typeof window === 'undefined') return false;

    if (isClientSignedIn()) return true;

    if (message) {
        toast.error(message, { id: 'auth-required-toast' });
    }

    window.dispatchEvent(new CustomEvent('open-auth-modal', {
        detail: {
            mode: 'login',
            message,
        }
    }));
    return false;
}
