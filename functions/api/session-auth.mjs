/**
 * Session Authentication API
 * Handles secure authentication with hash validation
 * Creates session-to-user mapping with IP tracking
 * Logs authentication events to D1 database
 */

/**
 * Normalize birthdate input to standard format "09/08/2022" (MM/DD/YYYY with leading zeros)
 * Handles various formats: "9/8/2022", "09/08/2022", "08/09/2022", "8/9/2022", etc.
 */
function normalizeBirthdateInput(dateString) {
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
      let day;
      let month;
      let year;
      
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
 * Simple hash function (matches client-side implementation)
 * Uses SHA-256 and returns first 32 chars of hex
 */
async function hashString(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(input).toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

/**
 * Compare hashes (constant-time)
 */
function compareHashes(inputHash, storedHash) {
  if (!inputHash || !storedHash || inputHash.length !== storedHash.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Get stored hash values from Cloudflare environment/secrets
 * In Cloudflare Pages Functions, secrets and environment variables are accessed via context.env
 * process.env is not available in Cloudflare Workers/Pages Functions runtime
 */
function getStoredHashes(env) {
  if (!env) {
    console.error('Environment context (env) is not available');
    return {
      accessCodeHash: '',
      guestCodeHash: '',
      moirGuestCodeHash: '',
      birthdateHash: '',
    };
  }

  const hashes = {
    accessCodeHash: (env.HASHED_ACCESS_CODE || '').toLowerCase(),
    guestCodeHash: (env.HASHED_GUEST_CODE || '').toLowerCase(),
    moirGuestCodeHash: (env.HASHED_MOIR_GUEST_CODE || '').toLowerCase(),
    birthdateHash: (env.HASHED_BIRTHDATE || '').toLowerCase(),
  };

  // Validate that all required secrets are present
  const missingSecrets = [];
  if (!hashes.accessCodeHash) missingSecrets.push('HASHED_ACCESS_CODE');
  if (!hashes.guestCodeHash) missingSecrets.push('HASHED_GUEST_CODE');
  if (!hashes.moirGuestCodeHash) missingSecrets.push('HASHED_MOIR_GUEST_CODE');
  if (!hashes.birthdateHash) missingSecrets.push('HASHED_BIRTHDATE');

  if (missingSecrets.length > 0) {
    console.error(`Missing required secrets in Cloudflare environment: ${missingSecrets.join(', ')}`);
    console.error('Please set these as Secrets in Cloudflare Pages: Settings > Variables and Secrets > Add (select "Encrypt" for Secret type)');
  }

  return hashes;
}

/**
 * Extract IP address from request headers
 */
function getClientIP(request) {
  // Cloudflare provides CF-Connecting-IP header
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;
  
  // Fallback to X-Forwarded-For
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Fallback to X-Real-IP
  const xRealIP = request.headers.get('X-Real-IP');
  if (xRealIP) return xRealIP;
  
  return 'unknown';
}

/**
 * Generate session token
 */
function generateSessionToken() {
  return `st_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create session record in KV
 * Stores in UNIQUE_HARPER_SESSIONS KV namespace with clear distinction between Harper and guest sessions
 */
async function createSessionRecord(kv, sessionId, sessionToken, userType, ip) {
  if (!kv) return;
  
  const sessionData = {
    userId: userType === 'harper' ? 'harper' : userType === 'guest' ? 'guest' : sessionId,
    userType: userType, // 'harper', 'guest', or 'normal'
    ip: ip, // IP address for tracking
    isHarper: userType === 'harper', // Explicit flag for Harper sessions
    isGuest: userType === 'guest', // Explicit flag for guest sessions
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    sessionToken: sessionToken,
  };
  
  // Store with key format: session:{sessionId}
  // This allows easy querying and distinction between session types
  const key = `session:${sessionId}`;
  await kv.put(key, JSON.stringify(sessionData));
  
  // Also create a type-specific index for easy querying
  // Format: type:{userType}:{sessionId} for quick lookups
  const typeKey = `type:${userType}:${sessionId}`;
  await kv.put(typeKey, JSON.stringify({ sessionId, userType, ip, createdAt: sessionData.createdAt }));
}

/**
 * Log authentication event to D1 database
 */
async function logAuthEvent(db, sessionId, userType, ip, eventData = {}) {
  if (!db) return; // D1 not configured, skip logging
  
  try {
    await db.prepare(
      `INSERT INTO session_events (session_id, event_type, event_data, ip, user_id, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      sessionId,
      'auth',
      JSON.stringify(eventData),
      ip,
      userType === 'harper' ? 'harper' : userType === 'guest' ? 'guest' : sessionId,
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error('Error logging auth event to D1:', error);
    // Don't fail authentication if logging fails
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  const { codeHash, birthdateHash } = body;
  
  if (!codeHash || typeof codeHash !== 'string') {
    return new Response('Missing or invalid codeHash', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Get stored hashes
  const storedHashes = getStoredHashes(env);
  const ip = getClientIP(request);
  
  // Normalize input hash (lowercase)
  const normalizedCodeHash = codeHash.toLowerCase();
  
  // Validate code hash
  let userType = null;
  if (compareHashes(normalizedCodeHash, storedHashes.accessCodeHash)) {
    // Access code matches - check birthdate for Harper
    if (birthdateHash) {
      // Note: birthdateHash is already hashed on client side, but we need to verify
      // The client should normalize the date before hashing, so we just compare hashes
      const normalizedBirthdateHash = birthdateHash.toLowerCase();
      
      // Debug logging (remove in production if needed)
      if (!storedHashes.birthdateHash || storedHashes.birthdateHash.length === 0) {
        console.error('HASHED_BIRTHDATE environment variable is not set or empty');
      }
      
      if (compareHashes(normalizedBirthdateHash, storedHashes.birthdateHash)) {
        userType = 'harper';
      } else {
        // Debug: log hash mismatch for troubleshooting
        console.log('Birthdate hash mismatch:', {
          received: normalizedBirthdateHash,
          expected: storedHashes.birthdateHash,
          match: compareHashes(normalizedBirthdateHash, storedHashes.birthdateHash)
        });
        userType = 'normal'; // Code correct but birthdate wrong
      }
    } else {
      // Code correct but no birthdate provided yet
      return new Response(JSON.stringify({ 
        requiresBirthdate: true,
        message: 'Please provide birthdate'
      }), { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
  } else if (compareHashes(normalizedCodeHash, storedHashes.guestCodeHash) || 
             compareHashes(normalizedCodeHash, storedHashes.moirGuestCodeHash)) {
    // Both "guestmoir" and "moirguest" are valid guest codes
    // moirGuest bypasses standard operations for Harper's unique session
    userType = 'guest';
  } else {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Invalid access code'
    }), { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  // Generate session ID and token
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const sessionToken = generateSessionToken();

  // Create session record in UNIQUE_HARPER_SESSIONS KV namespace
  // This namespace stores all user sessions with clear distinction between Harper and guest
  if (env.UNIQUE_HARPER_SESSIONS) {
    await createSessionRecord(env.UNIQUE_HARPER_SESSIONS, sessionId, sessionToken, userType, ip);
  } else {
    // Fallback to HARPER_ADVENT if UNIQUE_HARPER_SESSIONS not configured
    console.warn('UNIQUE_HARPER_SESSIONS KV namespace not configured, falling back to HARPER_ADVENT');
    if (env.HARPER_ADVENT) {
      await createSessionRecord(env.HARPER_ADVENT, sessionId, sessionToken, userType, ip);
    }
  }

  // Log authentication event to D1
  if (env.DB) {
    await logAuthEvent(env.DB, sessionId, userType, ip, {
      userType,
      hasBirthdate: !!birthdateHash,
    });
  }

  return new Response(JSON.stringify({ 
    success: true,
    sessionToken,
    sessionId,
    userType,
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

