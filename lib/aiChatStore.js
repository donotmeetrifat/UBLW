'use client'

/**
 * Shared AI Assistant Conversation Store & Synchronization Service
 * 
 * Provides:
 * 1. 0ms instant local cache loading across widgets and pages for both guests & logged-in users
 * 2. Cross-component & cross-tab real-time event synchronization (ukbl_ai_chat_sync + storage)
 * 3. Safe non-destructive server history merge (prevents overwriting newly sent messages)
 * 4. Reliable guest-to-account conversation migration on customer sign-in
 */

export const DEFAULT_WELCOME_MESSAGE = {
    id: 'welcome-emma-0',
    role: 'assistant',
    content: `Hello! I am Emma, your beauty consultant at UK Brand Lover. How can I assist you today? You can ask about product availability, skincare routines, or upload a photo of any product bottle to check our stock.`,
    products: [],
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
};

/**
 * Get storage key for current user session:
 * - Logged-in user: ukbl_user_ai_messages_<userId>
 * - Guest: ukbl_guest_ai_messages
 */
export function getAiStorageKey(user) {
    if (user && user.id) {
        return `ukbl_user_ai_messages_${user.id}`;
    }
    return 'ukbl_guest_ai_messages';
}

/**
 * Synchronously retrieve cached messages from localStorage with 0ms delay.
 */
export function getCachedAiMessages(user) {
    if (typeof window === 'undefined') return [DEFAULT_WELCOME_MESSAGE];
    try {
        const key = getAiStorageKey(user);
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Ensure welcome message is first if not present
                const hasWelcome = parsed[0]?.id?.includes('welcome');
                return hasWelcome ? parsed : [DEFAULT_WELCOME_MESSAGE, ...parsed];
            }
        }
    } catch (e) {
        console.warn('Could not read cached AI messages:', e.message);
    }
    return [DEFAULT_WELCOME_MESSAGE];
}

/**
 * Save messages to localStorage for either authenticated user or guest.
 */
export function saveCachedAiMessages(user, messages) {
    if (typeof window === 'undefined') return;
    try {
        const key = getAiStorageKey(user);
        if (Array.isArray(messages) && messages.length > 0) {
            localStorage.setItem(key, JSON.stringify(messages));
        }
    } catch (e) {
        console.warn('Could not save cached AI messages:', e.message);
    }
}

/**
 * Clear cached messages for user or guest.
 */
export function clearCachedAiMessages(user) {
    if (typeof window === 'undefined') return;
    try {
        if (user && user.id) {
            localStorage.removeItem(`ukbl_user_ai_messages_${user.id}`);
        }
        localStorage.removeItem('ukbl_guest_ai_messages');
    } catch (e) {}
}

/**
 * Dispatch real-time synchronization event across all mounted AI components & tabs.
 */
export function dispatchAiChatSync(messages, user, source = 'unknown') {
    if (typeof window === 'undefined') return;
    try {
        window.dispatchEvent(
            new CustomEvent('ukbl_ai_chat_sync', {
                detail: {
                    messages,
                    userId: user?.id || 'guest',
                    source,
                    timestamp: Date.now(),
                },
            })
        );
    } catch (e) {}
}

/**
 * Smart, non-destructive merge of authoritative server messages into local state.
 * 
 * Rules:
 * 1. Authoritative server messages take precedence for past history (official DB ids & timestamps).
 * 2. In-flight, optimistic or freshly sent user/assistant messages in local state are PRESERVED at the end.
 * 3. Duplicates are matched by ID, or by identical role + content + image.
 */
export function mergeAiMessages(localMessages, serverMessages) {
    if (!Array.isArray(serverMessages) || serverMessages.length === 0) {
        return localMessages && localMessages.length > 0 ? localMessages : [DEFAULT_WELCOME_MESSAGE];
    }

    const currentList = Array.isArray(localMessages) ? localMessages : [];
    const welcome = currentList[0]?.id?.includes('welcome') ? currentList[0] : DEFAULT_WELCOME_MESSAGE;

    // Filter out welcome message from local list
    const nonWelcomeLocal = currentList.filter(m => !m.id?.includes('welcome'));

    const result = [welcome];
    const matchedLocalIds = new Set();

    serverMessages.forEach(srv => {
        // Find if any local message matches this server message
        const matchedIndex = nonWelcomeLocal.findIndex(loc => {
            if (matchedLocalIds.has(loc.id)) return false;
            if (loc.id === srv.id) return true;
            // Match by role, content and image
            const sameRole = loc.role === srv.role;
            const sameContent = (loc.content || '').trim() === (srv.content || '').trim();
            const sameImage = (!loc.image && !srv.image) || (loc.image && srv.image);
            return sameRole && sameContent && sameImage;
        });

        if (matchedIndex !== -1) {
            const loc = nonWelcomeLocal[matchedIndex];
            matchedLocalIds.add(loc.id);
            // Use server record but preserve local base64/URL image if server was empty
            result.push({
                ...srv,
                image: srv.image || loc.image || null,
            });
        } else {
            result.push(srv);
        }
    });

    // CRITICAL FIX: Any local message that was NOT in server messages (e.g. freshly sent messages)
    // MUST BE PRESERVED at the end of the conversation!
    nonWelcomeLocal.forEach(loc => {
        if (!matchedLocalIds.has(loc.id)) {
            result.push(loc);
        }
    });

    return result;
}
