export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight requests
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
  } catch (error) {
    return new Response(`Invalid JSON in request body: ${error.message}`, { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Validate request body structure
  if (!body || typeof body !== 'object') {
    return new Response('Invalid request body', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  const { message, timestamp = new Date().toISOString(), sessionId = 'default' } = body;

  // Extract message content - handle both string and ChatMessage object formats
  const messageContent = typeof message === 'string' 
    ? message 
    : (message?.content || '');

  // Validate message content
  if (!messageContent || typeof messageContent !== 'string' || messageContent.trim().length === 0) {
    return new Response('Missing or invalid message: expected string or ChatMessage object with content field', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Validate sessionId
  if (sessionId && (typeof sessionId !== 'string' || sessionId.length > 200)) {
    return new Response(`Invalid sessionId: must be a string with max 200 characters, got ${typeof sessionId}`, { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  if (!env.HARPER_ADVENT) {
    return new Response('KV namespace HARPER_ADVENT not configured', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  try {
    const kvKey = `session:${sessionId}`;
    const existing = await env.HARPER_ADVENT.get(kvKey, 'json');
    const nextHistory = Array.isArray(existing) ? existing : [];
    // Store the message content (string) in KV
    nextHistory.push({ timestamp, message: messageContent });
    await env.HARPER_ADVENT.put(kvKey, JSON.stringify(nextHistory.slice(-200)));
    return new Response(JSON.stringify({ status: 'stored' }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(`Failed to log message to KV storage: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }
}

