/**
 * LLM Response Caching Service
 *
 * Provides caching for LLM responses to reduce API costs and improve performance.
 * Uses Supabase for persistent storage with automatic expiration.
 */

import crypto from 'crypto';

/**
 * Generate a cache key from the request parameters
 */
export function generateCacheKey(messages, systemPrompt, model = 'gpt-4o-mini') {
  // Create a hash of the key components
  const keyData = {
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    systemPrompt,
    model,
  };

  const hash = crypto.createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex');

  return `llm:${model}:${hash.substring(0, 16)}`;
}

/**
 * Check if a cached response exists and is still valid
 */
export async function getCachedResponse(env, cacheKey) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/llm_cache?cache_key=eq.${encodeURIComponent(cacheKey)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return null;
    }

    const cacheEntry = data[0];

    // Update hit count asynchronously (don't wait)
    updateCacheHit(env, cacheKey).catch(err => console.error('Failed to update cache hit:', err));

    return {
      response: cacheEntry.response,
      tokensUsed: cacheEntry.tokens_used,
      createdAt: cacheEntry.created_at,
    };
  } catch (error) {
    console.error('Error retrieving cached response:', error);
    return null;
  }
}

/**
 * Store a response in the cache
 */
export async function setCachedResponse(env, cacheKey, response, tokensUsed = null, ttlHours = 24) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  try {
    const expiresAt = new Date(Date.now() + (ttlHours * 60 * 60 * 1000)).toISOString();

    const cacheData = {
      cache_key: cacheKey,
      prompt_hash: cacheKey.split(':')[2], // Extract hash from cache key
      response,
      tokens_used: tokensUsed,
      expires_at: expiresAt,
    };

    const result = await fetch(`${env.SUPABASE_URL}/rest/v1/llm_cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'resolution=merge-duplicates', // Upsert if cache_key already exists
      },
      body: JSON.stringify(cacheData),
    });

    if (!result.ok) {
      console.error('Failed to cache response:', result.status, await result.text());
    }
  } catch (error) {
    console.error('Error caching response:', error);
  }
}

/**
 * Update cache hit count
 */
async function updateCacheHit(env, cacheKey) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  try {
    // Use RPC function to update hit count
    await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/update_cache_hit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ cache_key_param: cacheKey }),
    });
  } catch (error) {
    console.error('Error updating cache hit count:', error);
  }
}

/**
 * Clean expired cache entries
 */
export async function cleanExpiredCache(env) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return 0;
  }

  try {
    // Use RPC function to clean expired entries
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/clean_expired_llm_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (response.ok) {
      const result = await response.json();
      return result || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    return 0;
  }
}

/**
 * Log LLM usage for analytics
 */
export async function logLLMUsage(env, usageData) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  try {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/log_llm_usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify(usageData),
    });

    if (!response.ok) {
      console.error('Failed to log LLM usage:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error logging LLM usage:', error);
  }
}