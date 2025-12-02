/**
 * Calendar API endpoints
 * Handles calendar and tile operations for parents and children
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
async function getUserFromToken(request) {
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
 * GET /api/calendar/tiles - Get calendar tiles for authenticated user
 */
async function handleGetTiles(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get calendar for this user (parent or child)
    let calendarQuery = supabase
      .from('calendars')
      .select(`
        calendar_id,
        calendar_tiles (
          tile_id,
          day,
          title,
          body,
          media_url,
          gift,
          gift_unlocked,
          note_from_child,
          opened_at,
          version,
          created_at,
          updated_at
        )
      `);

    // If user is parent, get their child's calendar
    const { data: parentData } = await supabase
      .from('parents')
      .select('parent_uuid')
      .eq('parent_uuid', user.id)
      .single();

    if (parentData) {
      // User is parent
      calendarQuery = calendarQuery.eq('parent_uuid', user.id);
    } else {
      // User is child
      calendarQuery = calendarQuery.eq('child_uuid', user.id);
    }

    const { data: calendar, error: calendarError } = await calendarQuery.single();

    if (calendarError || !calendar) {
      return new Response(JSON.stringify({
        error: 'Calendar not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      tiles: calendar.calendar_tiles || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get tiles error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * PUT /api/calendar/tiles/:tileId - Update a calendar tile
 */
async function handleUpdateTile(request, tileId) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates = await request.json();

    // Verify the tile belongs to user's calendar
    const { data: tile, error: tileError } = await supabase
      .from('calendar_tiles')
      .select(`
        tile_id,
        calendars!inner (
          calendar_id,
          parent_uuid,
          child_uuid
        )
      `)
      .eq('tile_id', tileId)
      .single();

    if (tileError || !tile) {
      return new Response(JSON.stringify({
        error: 'Tile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user owns this calendar
    const calendar = tile.calendars;
    if (calendar.parent_uuid !== user.id && calendar.child_uuid !== user.id) {
      return new Response(JSON.stringify({
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Only parents can update tiles (children can only view)
    if (calendar.child_uuid === user.id) {
      return new Response(JSON.stringify({
        error: 'Children cannot modify tiles'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the tile
    const updateData = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.body !== undefined) updateData.body = updates.body;
    if (updates.media_url !== undefined) updateData.media_url = updates.media_url;
    updateData.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('calendar_tiles')
      .update(updateData)
      .eq('tile_id', tileId);

    if (updateError) {
      console.error('Tile update error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update tile'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Tile updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update tile error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/calendar/upload - Upload media for a tile
 */
async function handleUploadMedia(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const tileId = formData.get('tileId');

    if (!file || !tileId) {
      return new Response(JSON.stringify({
        error: 'Missing file or tileId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        error: 'Invalid file type. Only images and videos are allowed.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        error: 'File too large. Maximum size is 50MB.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify the tile belongs to user's calendar
    const { data: tile, error: tileError } = await supabase
      .from('calendar_tiles')
      .select(`
        tile_id,
        calendars!inner (
          calendar_id,
          parent_uuid,
          child_uuid
        )
      `)
      .eq('tile_id', tileId)
      .single();

    if (tileError || !tile) {
      return new Response(JSON.stringify({
        error: 'Tile not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user owns this calendar
    const calendar = tile.calendars;
    if (calendar.parent_uuid !== user.id) {
      return new Response(JSON.stringify({
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${tileId}_${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('calendar-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({
        error: 'Failed to upload file'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate signed URL (expires in 1 year for authenticated access)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from('calendar-media')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    if (signedError) {
      console.error('Signed URL error:', signedError);
      // Try to clean up uploaded file
      await supabase.storage.from('calendar-media').remove([fileName]);
      return new Response(JSON.stringify({
        error: 'Failed to generate secure media URL'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update tile with signed URL
    const { error: updateError } = await supabase
      .from('calendar_tiles')
      .update({
        media_url: signedUrlData.signedUrl,
        updated_at: new Date().toISOString()
      })
      .eq('tile_id', tileId);

    if (updateError) {
      console.error('Tile update error:', updateError);
      // Try to clean up uploaded file
      await supabase.storage.from('calendar-media').remove([fileName]);
      return new Response(JSON.stringify({
        error: 'Failed to update tile with media'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      media_url: signedUrlData.signedUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload media error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequest(context) {
  const { request } = context;

  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/calendar', '');

  // Route requests
  if (request.method === 'GET' && path === '/tiles') {
    return handleGetTiles(request);
  }

  if (request.method === 'PUT' && path.startsWith('/tiles/')) {
    const tileId = path.split('/tiles/')[1];
    return handleUpdateTile(request, tileId);
  }

  if (request.method === 'POST' && path === '/upload') {
    return handleUploadMedia(request);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}