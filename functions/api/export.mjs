/**
 * Export API endpoints
 * Handles PDF export functionality
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
 * GET /api/export/pdf - Generate and download PDF calendar
 */
async function handleExportPDF(request, supabase) {
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

    // Get calendar data for this user
    let calendarQuery = supabase
      .from('calendars')
      .select(`
        calendar_id,
        year,
        template_id,
        templates (
          name,
          metadata
        ),
        calendar_tiles (
          tile_id,
          day,
          title,
          body,
          media_url,
          gift,
          gift_unlocked,
          note_from_child,
          opened_at
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

    // Generate PDF content (simplified HTML for now)
    const template = calendar.templates;
    const tiles = calendar.calendar_tiles.sort((a, b) => a.day - b.day);

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Advent Calendar ${calendar.year}</title>
          <style>
            body {
              font-family: ${template?.metadata?.fonts?.body || 'Arial, sans-serif'};
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, ${template?.metadata?.colors?.primary || '#667eea'} 0%, ${template?.metadata?.colors?.secondary || '#764ba2'} 100%);
              color: white;
              border-radius: 10px;
            }
            .calendar-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .tile {
              background: white;
              border-radius: 8px;
              padding: 15px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              break-inside: avoid;
            }
            .tile-header {
              font-size: 18px;
              font-weight: bold;
              color: ${template?.metadata?.colors?.primary || '#333'};
              margin-bottom: 10px;
            }
            .tile-content {
              font-size: 14px;
              line-height: 1.4;
              margin-bottom: 10px;
            }
            .gift-indicator {
              background: #e8f5e8;
              color: #2e7d32;
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 12px;
              display: inline-block;
              margin-top: 5px;
            }
            .note {
              background: #fff3e0;
              padding: 10px;
              border-radius: 4px;
              font-size: 12px;
              margin-top: 10px;
              font-style: italic;
            }
            @media print {
              body { margin: 0; }
              .tile { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Advent Calendar ${calendar.year}</h1>
            <p>Template: ${template?.name || 'Default'}</p>
          </div>

          <div class="calendar-grid">
            ${tiles.map(tile => `
              <div class="tile">
                <div class="tile-header">Day ${tile.day}</div>
                ${tile.title ? `<div class="tile-content"><strong>${tile.title}</strong></div>` : ''}
                ${tile.body ? `<div class="tile-content">${tile.body}</div>` : ''}
                ${tile.gift ? `<div class="gift-indicator">🎁 Gift: ${tile.gift.title || 'Special Surprise'}</div>` : ''}
                ${tile.note_from_child ? `<div class="note">"${tile.note_from_child}"</div>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    // For now, return HTML content - in production, this would use a PDF generation service
    // like Puppeteer, PDF-lib, or a service like PDFShift

    // Log export event
    await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: 'export_pdf',
        metadata: {
          calendar_id: calendar.calendar_id,
          year: calendar.year,
          tile_count: tiles.length
        },
        timestamp: new Date().toISOString()
      });

    // Return HTML content with appropriate headers for download
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="advent-calendar-${calendar.year}.html"`
      }
    });

  } catch (error) {
    console.error('Export PDF error:', error);
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
  const path = url.pathname.replace('/api/export', '');

  // Route requests
  if (request.method === 'GET' && path === '/pdf') {
    return handleExportPDF(request, supabase);
  }

  return new Response(JSON.stringify({
    error: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}