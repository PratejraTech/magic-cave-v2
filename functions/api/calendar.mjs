/**
 * Calendar API endpoints
 * Handles calendar and tile operations for parents and children
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
 * GET /api/calendars/{id}/tiles - Get calendar tiles by calendar ID
 */
async function handleGetTilesByCalendarId(request, calendarId, supabase) {
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

    // Get calendar and verify ownership
    const { data: calendar, error: calendarError } = await supabase
      .from('calendars')
      .select(`
        calendar_id,
        parent_uuid,
        child_uuid,
        template_id,
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
      `)
      .eq('calendar_id', calendarId)
      .single();

    if (calendarError || !calendar) {
      return new Response(JSON.stringify({
        error: 'Calendar not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user owns this calendar (parent or child)
    if (calendar.parent_uuid !== user.id && calendar.child_uuid !== user.id) {
      return new Response(JSON.stringify({
        error: 'Forbidden'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      calendar: {
        id: calendar.calendar_id,
        template_id: calendar.template_id,
        tiles: calendar.calendar_tiles
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get tiles by calendar ID error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/calendar/tiles - Get calendar tiles for authenticated user
 */
async function handleGetTiles(request, supabase) {
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

    // Get calendar for this user (parent or child)
    let calendarQuery = supabase
      .from('calendars')
      .select(`
        calendar_id,
        template_id,
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
      calendar: {
        calendar_id: calendar.calendar_id,
        template_id: calendar.template_id
      },
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
async function handleUpdateTile(request, tileId, supabase) {
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
  * PUT /api/calendar/tiles/:tileId/gift - Assign a gift to a tile
  */
async function handleAssignGift(request, tileId, supabase) {
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

    const giftData = await request.json();

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

    // Validate gift data
    const allowedTypes = ['sticker', 'video', 'downloadable', 'external_link', 'experience'];
    if (!giftData.type || !allowedTypes.includes(giftData.type)) {
      return new Response(JSON.stringify({
        error: 'Invalid gift type'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update tile with gift
    const { error: updateError } = await supabase
      .from('calendar_tiles')
      .update({
        gift: giftData,
        updated_at: new Date().toISOString()
      })
      .eq('tile_id', tileId);

    if (updateError) {
      console.error('Gift assignment error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to assign gift'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Gift assigned successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Assign gift error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
  * POST /api/calendar/tiles/:tileId/unlock - Unlock a tile and reveal gift
  */
async function handleUnlockTile(request, tileId, supabase) {
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

    const { note } = await request.json();

    // Verify the tile belongs to user's calendar
    const { data: tile, error: tileError } = await supabase
      .from('calendar_tiles')
      .select(`
        tile_id,
        day,
        gift,
        gift_unlocked,
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

    // Check if user owns this calendar (only children can unlock)
    const calendar = tile.calendars;
    if (calendar.child_uuid !== user.id) {
      return new Response(JSON.stringify({
        error: 'Only children can unlock tiles'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already unlocked
    if (tile.gift_unlocked) {
      return new Response(JSON.stringify({
        error: 'Tile already unlocked'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if tile has a gift
    if (!tile.gift) {
      return new Response(JSON.stringify({
        error: 'No gift available for this tile'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update tile as unlocked
    const updateData = {
      gift_unlocked: true,
      opened_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (note) {
      updateData.note_from_child = note;
    }

    const { error: updateError } = await supabase
      .from('calendar_tiles')
      .update(updateData)
      .eq('tile_id', tileId);

    if (updateError) {
      console.error('Tile unlock error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to unlock tile'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      gift: tile.gift,
      message: 'Tile unlocked successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unlock tile error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * PUT /api/calendar/template - Update calendar template
 */
async function handleUpdateTemplate(request, supabase) {
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

    const { templateId } = await request.json();

    if (!templateId) {
      return new Response(JSON.stringify({
        error: 'Template ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('template_id')
      .eq('template_id', templateId)
      .eq('retired', false)
      .single();

    if (templateError || !template) {
      return new Response(JSON.stringify({
        error: 'Template not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update calendar template
    let updateQuery = supabase
      .from('calendars')
      .update({ template_id: templateId, updated_at: new Date().toISOString() });

    // If user is parent, update their child's calendar
    const { data: parentData } = await supabase
      .from('parents')
      .select('parent_uuid')
      .eq('parent_uuid', user.id)
      .single();

    if (parentData) {
      // User is parent
      updateQuery = updateQuery.eq('parent_uuid', user.id);
    } else {
      // User is child
      updateQuery = updateQuery.eq('child_uuid', user.id);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error('Template update error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update calendar template'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Calendar template updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update template error:', error);
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
async function handleUploadMedia(request, supabase) {
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
  const path = url.pathname.replace('/api/calendar', '');

  // Route requests
  if (request.method === 'GET' && path.startsWith('/calendars/') && path.endsWith('/tiles')) {
    const calendarId = path.split('/calendars/')[1].split('/tiles')[0];
    return handleGetTilesByCalendarId(request, calendarId, supabase);
  }

  if (request.method === 'GET' && path === '/tiles') {
    return handleGetTiles(request, supabase);
  }

  if (request.method === 'PUT' && path.startsWith('/tiles/')) {
    const tileId = path.split('/tiles/')[1];
    return handleUpdateTile(request, tileId, supabase);
  }

  if (request.method === 'POST' && path === '/upload') {
    return handleUploadMedia(request, supabase);
  }

  if (request.method === 'PUT' && path.startsWith('/tiles/') && path.endsWith('/gift')) {
    const tileId = path.split('/tiles/')[1].split('/gift')[0];
    return handleAssignGift(request, tileId, supabase);
  }

  if (request.method === 'POST' && path.startsWith('/tiles/') && path.endsWith('/unlock')) {
    const tileId = path.split('/tiles/')[1].split('/unlock')[0];
    return handleUnlockTile(request, tileId, supabase);
  }

  if (request.method === 'PUT' && path === '/template') {
    return handleUpdateTemplate(request, supabase);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}