/**
 * API endpoint to fetch conversation history from KV storage
 * Returns last 5 messages from chat-history:${sessionId}
 */

/**
 * Load full conversation history from KV storage
 */
async function loadChatHistoryFromKV(kv, sessionId) {
  if (!kv) return [];
  try {
    const key = `chat-history:${sessionId}`;
    const data = await kv.get(key, 'json');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading chat history from KV:', error);
    return [];
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Get sessionId from query parameters
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
    // Load full conversation history from KV
    const fullHistory = await loadChatHistoryFromKV(env.HARPER_ADVENT, sessionId);
    
    // Return last 5 messages
    const last5Messages = fullHistory.slice(-5);
    
    return new Response(JSON.stringify({ messages: last5Messages }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return new Response(`Failed to fetch chat history: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }
}

