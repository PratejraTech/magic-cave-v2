/**
 * Health Check API Endpoint
 * Provides system health status for monitoring
 */

import { supabase } from '../../src/lib/supabaseClient.js';

export async function onRequest({ request, env }) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    checks: {}
  };

  try {
    // Database connectivity check
    const { error: dbError } = await supabase
      .from('parents')
      .select('count')
      .limit(1);

    health.checks.database = dbError ? 'unhealthy' : 'healthy';
    if (dbError) {
      health.status = 'degraded';
      health.checks.database_error = dbError.message;
    }

    // Supabase auth check
    const { error: authError } = await supabase.auth.getSession();
    health.checks.auth = authError ? 'unhealthy' : 'healthy';

    // Storage check
    const { error: storageError } = await supabase.storage
      .from('photos')
      .list('', { limit: 1 });

    health.checks.storage = storageError ? 'unhealthy' : 'healthy';

    // External services check (OpenAI)
    const openaiKey = env.OPENAI_API_KEY;
    health.checks.openai = openaiKey ? 'configured' : 'not_configured';

    // Firebase check
    const firebaseKey = env.VITE_FIREBASE_API_KEY;
    health.checks.firebase = firebaseKey ? 'configured' : 'not_configured';

    // Memory usage (Cloudflare specific)
    if (typeof performance !== 'undefined' && performance.memory) {
      health.checks.memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }

    // Response time
    health.response_time_ms = Date.now() - new Date(health.timestamp).getTime();

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
  }

  const statusCode = health.status === 'healthy' ? 200 :
                    health.status === 'degraded' ? 200 : 503;

  return new Response(JSON.stringify(health, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}