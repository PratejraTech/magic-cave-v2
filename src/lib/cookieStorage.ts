/**
 * Cookie-based storage utilities for session and state management
 * Used when VITE_FORCE_UNLOCK=false for 30-day session persistence
 * Includes semver versioning to ensure cookies persist across app updates
 */

// Get app version from package.json (injected at build time via Vite)
// Falls back to '1.0.0' if not available (should not happen in production)
const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string) || '1.0.0';

const COOKIE_PREFIX = 'harper-advent-';
const SESSION_COOKIE = `${COOKIE_PREFIX}session`;
const OPENED_TILES_COOKIE = `${COOKIE_PREFIX}opened-tiles`;
const LAST_ACTIVE_COOKIE = `${COOKIE_PREFIX}last-active`;
const RECENT_CHAT_INFO_COOKIE = `${COOKIE_PREFIX}recent-chat-info`;
const OPENED_DAYS_COOKIE = `${COOKIE_PREFIX}opened-days`;
const VERSION_COOKIE = `${COOKIE_PREFIX}version`;
const HARPER_SESSION_COOKIE = `${COOKIE_PREFIX}harper-session`;
const GUEST_SESSION_COOKIE = `${COOKIE_PREFIX}guest-session`;
const SESSION_TOKEN_COOKIE = `${COOKIE_PREFIX}session-token`;
const SESSION_ID_COOKIE = `${COOKIE_PREFIX}session-id`;
const SESSION_DURATION_DAYS = 30;

// Harper's birthdate: September 8, 2022
const HARPER_BIRTHDATE = new Date(2022, 8, 8); // Month is 0-indexed, so 8 = September

/**
 * Versioned cookie data structure
 */
interface VersionedCookieData<T> {
  version: string;
  data: T;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Initialize version tracking in cookies
 * Called on app initialization to ensure version is set
 */
function initializeVersion(): void {
  const existingVersion = getCookie(VERSION_COOKIE);
  if (!existingVersion) {
    setCookie(VERSION_COOKIE, APP_VERSION, SESSION_DURATION_DAYS);
  }
}

/**
 * Get current cookie version
 */
function getCookieVersion(): string {
  return getCookie(VERSION_COOKIE) || APP_VERSION;
}

/**
 * Check if cookie version needs migration
 * Returns true if version is different (major or minor changes may require migration)
 */
function needsMigration(storedVersion: string, currentVersion: string): boolean {
  if (storedVersion === currentVersion) return false;
  
  // Parse semver versions
  const stored = parseSemver(storedVersion);
  const current = parseSemver(currentVersion);
  
  if (!stored || !current) return false;
  
  // Major version changes may require migration
  // Minor/patch changes are backward compatible for December persistence
  return stored.major !== current.major;
}

/**
 * Parse semver version string
 */
function parseSemver(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Set versioned cookie data
 */
function setVersionedCookie<T>(name: string, data: T, days: number): void {
  const versioned: VersionedCookieData<T> = {
    version: APP_VERSION,
    data,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const json = JSON.stringify(versioned);
    setCookie(name, json, days);
  } catch (error) {
    console.error(`Error setting versioned cookie ${name}:`, error);
  }
}

/**
 * Get versioned cookie data with migration support
 */
function getVersionedCookie<T>(name: string, defaultValue: T, migrate?: (oldData: any) => T): T {
  try {
    const json = getCookie(name);
    if (!json) {
      // No cookie exists, return default
      return defaultValue;
    }
    
    // Try to parse as versioned structure
    let parsed: VersionedCookieData<T> | T;
    try {
      parsed = JSON.parse(json);
    } catch {
      // Legacy cookie format (not versioned) - migrate it
      if (migrate) {
        const migrated = migrate(json);
        setVersionedCookie(name, migrated, SESSION_DURATION_DAYS);
        return migrated;
      }
      return defaultValue;
    }
    
    // Check if it's a versioned structure
    if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && 'data' in parsed) {
      const versioned = parsed as VersionedCookieData<T>;
      const storedVersion = versioned.version;
      const currentVersion = APP_VERSION;
      
      // Check if migration is needed
      if (needsMigration(storedVersion, currentVersion) && migrate) {
        const migrated = migrate(versioned.data);
        setVersionedCookie(name, migrated, SESSION_DURATION_DAYS);
        return migrated;
      }
      
      // Update version if it changed (for tracking)
      if (storedVersion !== currentVersion) {
        setVersionedCookie(name, versioned.data, SESSION_DURATION_DAYS);
      }
      
      return versioned.data;
    }
    
    // Legacy format - migrate if possible
    if (migrate) {
      const migrated = migrate(parsed);
      setVersionedCookie(name, migrated, SESSION_DURATION_DAYS);
      return migrated;
    }
    
    // Fallback to parsed value as-is (for backward compatibility)
    return parsed as T;
  } catch (error) {
    console.error(`Error getting versioned cookie ${name}:`, error);
    return defaultValue;
  }
}

/**
 * Set a cookie with expiration
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Initialize or get session ID (30-day cookie)
 * Updates last_active timestamp when called
 * Includes version initialization
 */
export function getOrCreateSession(): string {
  // Initialize version tracking on first access
  initializeVersion();
  
  const sessionId = getVersionedCookie<string>(
    SESSION_COOKIE,
    '',
    (oldData) => {
      // Migration: if old cookie was just a string, use it
      return typeof oldData === 'string' ? oldData : '';
    }
  );
  
  if (!sessionId) {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setVersionedCookie(SESSION_COOKIE, newSessionId, SESSION_DURATION_DAYS);
    // Update last_active timestamp
    updateLastActive();
    return newSessionId;
  }
  
  // Update last_active timestamp
  updateLastActive();
  
  return sessionId;
}

/**
 * Update last active timestamp
 */
export function updateLastActive(): void {
  const now = new Date().toISOString();
  setVersionedCookie(LAST_ACTIVE_COOKIE, now, SESSION_DURATION_DAYS);
}

/**
 * Get last active timestamp
 */
export function getLastActive(): string | null {
  const timestamp = getVersionedCookie<string>(
    LAST_ACTIVE_COOKIE,
    '',
    (oldData) => {
      // Migration: if old cookie was just a string, use it
      return typeof oldData === 'string' ? oldData : '';
    }
  );
  return timestamp || null;
}

/**
 * Set recent chat info (last 5 messages)
 */
export function setRecentChatInfo(messages: Array<{ role: string; content: string }>): void {
  try {
    const messagesToStore = messages.slice(-5); // Keep only last 5
    setVersionedCookie(RECENT_CHAT_INFO_COOKIE, messagesToStore, SESSION_DURATION_DAYS);
  } catch (error) {
    console.error('Error setting recent chat info:', error);
  }
}

/**
 * Get recent chat info (last 5 messages)
 */
export function getRecentChatInfo(): Array<{ role: string; content: string }> {
  return getVersionedCookie<Array<{ role: string; content: string }>>(
    RECENT_CHAT_INFO_COOKIE,
    [],
    (oldData) => {
      // Migration: handle legacy format
      if (Array.isArray(oldData)) {
        return oldData;
      }
      // Try to parse as JSON string
      if (typeof oldData === 'string') {
        try {
          const parsed = JSON.parse(oldData);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    }
  );
}

/**
 * Check if user is a returning user (has existing session and last_active)
 */
export function isReturningUser(): boolean {
  const sessionId = getCookie(SESSION_COOKIE);
  const lastActive = getLastActive();
  return Boolean(sessionId && lastActive);
}

/**
 * Get opened tiles count from cookie
 */
export function getOpenedTilesCount(): number {
  return getVersionedCookie<number>(
    OPENED_TILES_COOKIE,
    0,
    (oldData) => {
      // Migration: handle legacy string format
      if (typeof oldData === 'string') {
        const count = parseInt(oldData, 10);
        return isNaN(count) ? 0 : count;
      }
      if (typeof oldData === 'number') {
        return oldData;
      }
      return 0;
    }
  );
}

/**
 * Increment opened tiles count in cookie
 */
export function incrementOpenedTilesCount(): void {
  const current = getOpenedTilesCount();
  setVersionedCookie(OPENED_TILES_COOKIE, current + 1, SESSION_DURATION_DAYS);
}

/**
 * Reset opened tiles count (for testing or new session)
 */
export function resetOpenedTilesCount(): void {
  deleteCookie(OPENED_TILES_COOKIE);
}

/**
 * Set opened tiles count in cookie
 */
export function setOpenedTilesCount(count: number): void {
  setVersionedCookie(OPENED_TILES_COOKIE, count, SESSION_DURATION_DAYS);
}

/**
 * Get maximum tiles that can be opened based on days before Christmas
 * Returns the current day of December (1-25) that can be opened
 * After December 25th, returns 25 (all tiles open, session complete)
 * Uses UTC+1030 (Adelaide timezone)
 * @param getAdelaideDateFn - Function to get Adelaide date (injected to avoid circular deps)
 */
export function getMaxOpenableTiles(getAdelaideDateFn: () => Date): number {
  const adelaideDate = getAdelaideDateFn();
  
  const currentMonth = adelaideDate.getMonth(); // 0-11, 11 = December
  const currentYear = adelaideDate.getFullYear();
  const currentDay = adelaideDate.getDate(); // 1-31
  
  // If not December, return 0 (no tiles can be opened)
  if (currentMonth !== 11) {
    return 0;
  }
  
  // After December 25th, all tiles are open (session complete)
  if (currentDay > 25) {
    return 25;
  }
  
  // In December (1-25), can open tiles up to current day
  // Tile index 1 = December 1st, Tile index 25 = December 25th
  return Math.min(25, Math.max(0, currentDay));
}

/**
 * Get opened days map from cookie
 * Returns Record<number, string> mapping day IDs to opened timestamps
 */
export function getOpenedDaysMap(): Record<number, string> {
  return getVersionedCookie<Record<number, string>>(
    OPENED_DAYS_COOKIE,
    {},
    (oldData) => {
      // Migration: handle legacy format
      if (typeof oldData === 'object' && oldData !== null) {
        return oldData as Record<number, string>;
      }
      // Try to parse as JSON string
      if (typeof oldData === 'string') {
        try {
          const parsed = JSON.parse(oldData);
          return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch {
          return {};
        }
      }
      return {};
    }
  );
}

/**
 * Set opened days map in cookie
 * @param map - Record<number, string> mapping day IDs to opened timestamps
 */
export function setOpenedDaysMap(map: Record<number, string>): void {
  try {
    setVersionedCookie(OPENED_DAYS_COOKIE, map, SESSION_DURATION_DAYS);
  } catch (error) {
    console.error('Error setting opened days map:', error);
  }
}

/**
 * Get current app version from cookies
 */
export function getAppVersion(): string {
  return getCookieVersion();
}

/**
 * Initialize cookie versioning system
 * Should be called on app startup
 */
export function initializeCookieVersioning(): void {
  initializeVersion();
}

/**
 * Validate birthdate string - accepts various formats for September 8, 2022
 * Supports:
 * - Numeric formats: 09/08/2022, 9/8/2022, 08/09/2022, 8/9/2022 (DD/MM/YYYY or MM/DD/YYYY)
 * - Separators: /, -, .
 * - Text formats: "9 August 2022", "9th of August 2022", "August 9, 2022", etc.
 */
export function validateBirthdate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const cleaned = dateString.trim().toLowerCase();
  
  // Try parsing as text format first (e.g., "9 August 2022", "9th of August 2022")
  const textFormats = [
    /(\d+)(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})/i,
  ];
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  for (const regex of textFormats) {
    const match = cleaned.match(regex);
    if (match) {
      let day: number;
      let month: number;
      let year: number;
      
      if (match[1] && monthNames.includes(match[1].toLowerCase())) {
        // Format: "August 9, 2022" or "August 9th, 2022"
        month = monthNames.indexOf(match[1].toLowerCase()) + 1;
        day = parseInt(match[2], 10);
        year = parseInt(match[3], 10);
      } else {
        // Format: "9 August 2022" or "9th of August 2022"
        day = parseInt(match[1], 10);
        month = monthNames.indexOf(match[2].toLowerCase()) + 1;
        year = parseInt(match[3], 10);
      }
      
      // Check if it matches Harper's birthdate: September 8, 2022
      if (month === 9 && day === 8 && year === 2022) {
        return true;
      }
    }
  }
  
  // Try numeric formats (DD/MM/YYYY or MM/DD/YYYY)
  const normalized = cleaned.replace(/[-.]/g, '/');
  const parts = normalized.split('/');
  
  if (parts.length === 3) {
    const part1 = parseInt(parts[0], 10);
    const part2 = parseInt(parts[1], 10);
    const part3 = parseInt(parts[2], 10);
    
    // Try MM/DD/YYYY format first
    if (part1 === 9 && part2 === 8 && part3 === 2022) {
      return true;
    }
    
    // Try DD/MM/YYYY format
    if (part1 === 8 && part2 === 9 && part3 === 2022) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if current session is Harper's validated session
 */
export function isHarperSession(): boolean {
  return getVersionedCookie<boolean>(
    HARPER_SESSION_COOKIE,
    false,
    (oldData) => {
      // Migration: handle legacy format
      if (typeof oldData === 'boolean') {
        return oldData;
      }
      if (typeof oldData === 'string') {
        return oldData === 'true';
      }
      return false;
    }
  );
}

/**
 * Set Harper session flag in cookie
 * @param isHarper - Whether this is Harper's validated session
 */
export function setHarperSession(isHarper: boolean): void {
  setVersionedCookie(HARPER_SESSION_COOKIE, isHarper, SESSION_DURATION_DAYS);
}

/**
 * Clear Harper session (for testing or logout)
 */
export function clearHarperSession(): void {
  deleteCookie(HARPER_SESSION_COOKIE);
}

/**
 * Check if current session is a guest session
 */
export function isGuestSession(): boolean {
  return getVersionedCookie<boolean>(
    GUEST_SESSION_COOKIE,
    false,
    (oldData) => {
      // Migration: handle legacy format
      if (typeof oldData === 'boolean') {
        return oldData;
      }
      if (typeof oldData === 'string') {
        return oldData === 'true';
      }
      return false;
    }
  );
}

/**
 * Set guest session flag in cookie (session-based, not persistent like Harper's)
 * @param isGuest - Whether this is a guest session
 */
export function setGuestSession(isGuest: boolean): void {
  if (isGuest) {
    // Guest sessions are temporary - use shorter duration (1 day) or session cookie
    setVersionedCookie(GUEST_SESSION_COOKIE, true, 1); // 1 day for guest sessions
  } else {
    deleteCookie(GUEST_SESSION_COOKIE);
  }
}

/**
 * Clear guest session
 */
export function clearGuestSession(): void {
  deleteCookie(GUEST_SESSION_COOKIE);
}

/**
 * Get session token from cookie
 */
export function getSessionToken(): string | null {
  const token = getVersionedCookie<string>(
    SESSION_TOKEN_COOKIE,
    '',
    (oldData) => {
      return typeof oldData === 'string' ? oldData : '';
    }
  );
  return token || null;
}

/**
 * Set session token in cookie
 */
export function setSessionToken(token: string): void {
  setVersionedCookie(SESSION_TOKEN_COOKIE, token, SESSION_DURATION_DAYS);
}

/**
 * Get session ID from cookie
 */
export function getStoredSessionId(): string | null {
  const sessionId = getVersionedCookie<string>(
    SESSION_ID_COOKIE,
    '',
    (oldData) => {
      return typeof oldData === 'string' ? oldData : '';
    }
  );
  return sessionId || null;
}

/**
 * Set session ID in cookie
 */
export function setStoredSessionId(sessionId: string): void {
  setVersionedCookie(SESSION_ID_COOKIE, sessionId, SESSION_DURATION_DAYS);
}

/**
 * Clear session token and ID
 */
export function clearSessionAuth(): void {
  deleteCookie(SESSION_TOKEN_COOKIE);
  deleteCookie(SESSION_ID_COOKIE);
}

