/**
 * Session Event Logger
 * Logs user events to the session-events API
 */

const API_BASE = import.meta.env.VITE_CHAT_API_URL || import.meta.env.CHAT_API_URL || (import.meta.env.PROD ? '' : 'https://toharper.dad');
const SESSION_EVENTS_ENDPOINT = API_BASE 
  ? `${API_BASE.replace(/\/$/, '')}/api/session-events`
  : '/api/session-events';

/**
 * Get session ID from cookies
 */
function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Dynamic import to avoid circular dependencies
  // Use getStoredSessionId from cookieStorage
  try {
    // Import at runtime to avoid circular dependency issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cookieStorage = require('./cookieStorage');
    return cookieStorage.getStoredSessionId();
  } catch (error) {
    console.warn('Failed to get session ID:', error);
    return null;
  }
}

/**
 * Log a session event
 * @param eventType - Type of event (e.g., 'tile_open', 'chat', 'video', 'surprise')
 * @param eventData - Additional event data (object)
 */
export async function logSessionEvent(eventType: string, eventData: Record<string, unknown> = {}): Promise<void> {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    // No session ID, skip logging
    return;
  }

  try {
    await fetch(SESSION_EVENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        eventType,
        eventData,
      }),
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.warn('Failed to log session event:', error);
  }
}

/**
 * Event types for type safety
 */
export const EventTypes = {
  AUTH: 'auth',
  TILE_OPEN: 'tile_open',
  CHAT: 'chat',
  VIDEO: 'video',
  SURPRISE: 'surprise',
  WELCOME: 'welcome',
  LETTER_READ: 'letter_read',
} as const;

