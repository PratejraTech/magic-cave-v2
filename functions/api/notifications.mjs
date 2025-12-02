/**
 * Notifications API endpoints
 * Handles notification settings and scheduling
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
 * GET /api/notifications/settings - Get notification settings for user
 */
async function handleGetSettings(request, supabase) {
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

    // Get calendar settings for this user
    const { data: calendar, error: calendarError } = await supabase
      .from('calendars')
      .select('settings')
      .eq('parent_uuid', user.id)
      .single();

    if (calendarError || !calendar) {
      return new Response(JSON.stringify({
        error: 'Calendar not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const settings = calendar.settings || {};
    const notificationsEnabled = settings.notifications_enabled || false;
    const timezone = settings.timezone || 'UTC';

    return new Response(JSON.stringify({
      success: true,
      settings: {
        notifications_enabled: notificationsEnabled,
        timezone: timezone
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get notification settings error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * PUT /api/notifications/settings - Update notification settings
 */
async function handleUpdateSettings(request, supabase) {
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

    const { notifications_enabled, timezone } = await request.json();

    // Validate inputs
    if (typeof notifications_enabled !== 'boolean') {
      return new Response(JSON.stringify({
        error: 'notifications_enabled must be a boolean'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (timezone && typeof timezone !== 'string') {
      return new Response(JSON.stringify({
        error: 'timezone must be a string'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current calendar settings
    const { data: calendar, error: calendarError } = await supabase
      .from('calendars')
      .select('settings')
      .eq('parent_uuid', user.id)
      .single();

    if (calendarError || !calendar) {
      return new Response(JSON.stringify({
        error: 'Calendar not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentSettings = calendar.settings || {};
    const updatedSettings = {
      ...currentSettings,
      notifications_enabled: notifications_enabled,
      timezone: timezone || currentSettings.timezone || 'UTC'
    };

    // Update calendar settings
    const { error: updateError } = await supabase
      .from('calendars')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('parent_uuid', user.id);

    if (updateError) {
      console.error('Update notification settings error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update settings'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      settings: {
        notifications_enabled: updatedSettings.notifications_enabled,
        timezone: updatedSettings.timezone
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
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
  const path = url.pathname.replace('/api/notifications', '');

  // Route requests
  if (request.method === 'GET' && path === '/settings') {
    return handleGetSettings(request, supabase);
  }

  if (request.method === 'PUT' && path === '/settings') {
    return handleUpdateSettings(request, supabase);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}