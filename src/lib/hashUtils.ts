/**
 * Hash utilities for secure code validation
 * Uses Web Crypto API for simple, fast hashing
 */

/**
 * Normalize birthdate input to standard format "09/08/2022" (MM/DD/YYYY with leading zeros)
 * Handles various formats: "9/8/2022", "09/08/2022", "08/09/2022", "8/9/2022", etc.
 * @param dateString - Date string in various formats
 * @returns string - Normalized date string "09/08/2022" or original if invalid
 */
export function normalizeBirthdateInput(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') return dateString;
  
  const cleaned = dateString.trim();
  
  // Harper's birthdate: September 8, 2022 (MM = 09, DD = 08, YYYY = 2022)
  const TARGET_MONTH = 9;
  const TARGET_DAY = 8;
  const TARGET_YEAR = 2022;
  
  // Try parsing as numeric format (MM/DD/YYYY or DD/MM/YYYY)
  const normalized = cleaned.replace(/[-.]/g, '/');
  const parts = normalized.split('/');
  
  if (parts.length === 3) {
    const part1 = parseInt(parts[0], 10);
    const part2 = parseInt(parts[1], 10);
    const part3 = parseInt(parts[2], 10);
    
    // Check if the date matches Harper's birthdate (September 8, 2022)
    // Try MM/DD/YYYY format first (09/08/2022 or 9/8/2022)
    if (part1 === TARGET_MONTH && part2 === TARGET_DAY && part3 === TARGET_YEAR) {
      return '09/08/2022';
    }
    
    // Try DD/MM/YYYY format (08/09/2022 or 8/9/2022)
    if (part1 === TARGET_DAY && part2 === TARGET_MONTH && part3 === TARGET_YEAR) {
      return '09/08/2022';
    }
  }
  
  // Try text formats (e.g., "9 August 2022", "August 9, 2022")
  const textFormats = [
    /(\d+)(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})/i,
  ];
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  for (const regex of textFormats) {
    const match = cleaned.toLowerCase().match(regex);
    if (match) {
      let day: number;
      let month: number;
      let year: number;
      
      if (monthNames.includes(match[1].toLowerCase())) {
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
      
      if (month === TARGET_MONTH && day === TARGET_DAY && year === TARGET_YEAR) {
        return '09/08/2022';
      }
    }
  }
  
  // If no match, return original (will fail hash comparison, which is correct)
  return cleaned;
}

/**
 * Simple hash function using Web Crypto API
 * Converts string to SHA-256 hash and returns first 32 characters of hex string
 * Matches server-side implementation for consistent comparison
 * @param input - String to hash
 * @returns Promise<string> - Hex string (first 32 characters)
 */
export async function hashString(input: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    // Fallback for server-side or environments without crypto
    // Simple hash using string manipulation (not cryptographically secure, but works)
    let hash = 0;
    const str = input.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to hex format to match server
    return Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input.toLowerCase().trim());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Return hex string (first 32 chars) to match server-side format
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32);
  } catch (error) {
    console.error('Error hashing string:', error);
    // Fallback to simple hash
    let hash = 0;
    const str = input.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    // Convert to hex format to match server
    return Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
  }
}

/**
 * Compare input hash against stored hash (constant-time comparison)
 * @param inputHash - Hash from user input
 * @param storedHash - Stored hash to compare against
 * @returns boolean - True if hashes match
 */
export function compareHashes(inputHash: string, storedHash: string): boolean {
  if (!inputHash || !storedHash || inputHash.length !== storedHash.length) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Get stored hash values from environment variables
 * These should be set at build time or in Cloudflare environment
 */
export function getStoredHashes() {
  return {
    accessCodeHash: import.meta.env.VITE_HASHED_ACCESS_CODE || '',
    guestCodeHash: import.meta.env.VITE_HASHED_GUEST_CODE || '',
    moirGuestCodeHash: import.meta.env.VITE_HASHED_MOIR_GUEST_CODE || '',
    birthdateHash: import.meta.env.VITE_HASHED_BIRTHDATE || '',
  };
}

