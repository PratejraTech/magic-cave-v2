/**
 * Analytics API endpoints
 * Handles event logging and analytics data
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Validate request method and CORS
 */
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
}

/**
 * Get user from authorization header
 */
async function getUserFromToken(request, supabase) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('Error getting user from token:', error);
    return null;
  }

  return user;
}

/**
 * POST /api/analytics/events - Log analytics events
 */
async function handleLogEvent(request, supabase) {
  try {
    const user = await getUserFromToken(request, supabase);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const eventData = await request.json();

    // Validate required fields
    if (!eventData.event_type || !eventData.metadata) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: event_type, metadata'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine parent_uuid and child_uuid from user
    let parent_uuid = null;
    let child_uuid = null;

    // Check if user is a parent
    const { data: parent } = await supabase
      .from('parents')
      .select('parent_uuid')
      .eq('parent_uuid', user.id)
      .single();

    if (parent) {
      parent_uuid = user.id;
    } else {
      // Check if user is a child
      const { data: child } = await supabase
        .from('children')
        .select('child_uuid, parent_uuid')
        .eq('child_uuid', user.id)
        .single();

      if (child) {
        child_uuid = user.id;
        parent_uuid = child.parent_uuid;
      }
    }

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        calendar_id: eventData.calendar_id || null,
        parent_uuid: eventData.parent_uuid || parent_uuid,
        child_uuid: eventData.child_uuid || child_uuid,
        event_type: eventData.event_type,
        metadata: eventData.metadata
      });

    if (insertError) {
      console.error('Analytics event logging error:', insertError);
      return new Response(JSON.stringify({
        error: 'Failed to log event'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Event logged successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Log event error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/analytics/dashboard - Get analytics dashboard data (for parents/admins)
 */
async function handleGetDashboard(request, supabase) {
  try {
    const user = await getUserFromToken(request, supabase);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is parent (only parents can view analytics)
    const { data: parent } = await supabase
      .from('parents')
      .select('parent_uuid')
      .eq('parent_uuid', user.id)
      .single();

    if (!parent) {
      return new Response(JSON.stringify({
        error: 'Forbidden - Only parents can view analytics'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get analytics data for this parent
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('parent_uuid', user.id)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Analytics fetch error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to fetch analytics data'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Aggregate data
    const stats = {
      totalEvents: events.length,
      eventsByType: {},
      recentActivity: events.slice(0, 10),
      tileOpens: 0,
      giftsUnlocked: 0,
      pdfExports: 0
    };

    events.forEach(event => {
      // Count by event type
      stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;

      // Count specific metrics
      if (event.event_type === 'tile_opened') stats.tileOpens++;
      if (event.event_type === 'gift_unlocked') stats.giftsUnlocked++;
      if (event.event_type === 'export_pdf') stats.pdfExports++;
    });

    return new Response(JSON.stringify({
      success: true,
      stats,
      events: events.slice(0, 50) // Return last 50 events
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Initialize Supabase client from environment
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({
      error: 'Supabase configuration missing'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/analytics', '');

  // Route requests
  if (request.method === 'POST' && path === '/events') {
    return handleLogEvent(request, supabase);
  }

  if (request.method === 'GET' && path === '/dashboard') {
    return handleGetDashboard(request, supabase);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}