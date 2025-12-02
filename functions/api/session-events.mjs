/**
  * Session Events API
  * Logs session events to Supabase database
  * Supports querying events by session ID
  */

import { createClient } from '@supabase/supabase-js';

/**
  * Extract IP address from request headers
  */
function getClientIP(request) {
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;

  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = request.headers.get('X-Real-IP');
  if (xRealIP) return xRealIP;

  return 'unknown';
}

/**
  * Get session user info from Supabase
  * Checks session data in the database
  */
async function getSessionUser(supabase, sessionId) {
  try {
    const { data, error } = await supabase
      .from('session_events')
      .select('user_id, ip')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      ip: data.ip
    };
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

/**
  * Log event to Supabase database
  */
async function logEvent(supabase, sessionId, eventType, eventData, ip, userId) {
  if (!supabase) {
    console.warn('Supabase client not configured, skipping event log');
    return;
  }

  try {
    const { error } = await supabase
      .from('session_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
        ip: ip,
        user_id: userId || sessionId,
        timestamp: new Date().toISOString()
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error logging event to Supabase:', error);
    throw error;
  }
}

/**
  * Query events from Supabase database
  */
async function queryEvents(supabase, sessionId, limit = 100) {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('session_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error querying events:', error);
    return [];
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Initialize Supabase client
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // GET request - query events
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Missing sessionId parameter', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    const events = await queryEvents(supabase, sessionId);

    return new Response(JSON.stringify({ events }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // POST request - log event
  if (request.method === 'POST') {
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

    const { sessionId, eventType, eventData } = body;

    if (!sessionId || !eventType) {
      return new Response('Missing sessionId or eventType', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    const ip = getClientIP(request);

    // Get user info from session
    let userId = sessionId;
    if (supabase) {
      const sessionUser = await getSessionUser(supabase, sessionId);
      if (sessionUser) {
        userId = sessionUser.userId;
      }
    }

    try {
      await logEvent(supabase, sessionId, eventType, eventData || {}, ip, userId);

      return new Response(JSON.stringify({
        success: true,
        message: 'Event logged'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
  }

  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    },
  });
}

