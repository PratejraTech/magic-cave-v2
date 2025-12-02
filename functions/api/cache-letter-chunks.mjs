/**
 * Cloudflare Function to cache letter chunks to KV
 * This endpoint can be called to populate/refresh the KV cache
 * GET /api/cache-letter-chunks - Populates cache from JSON file
 */

// Import fetchLetterChunksFromFile - note: in Cloudflare Functions, we need to inline or use a different approach
// Since we can't easily import from another .mjs file in Cloudflare Functions, we'll inline the function
async function fetchLetterChunksFromFile() {
  try {
    const baseUrl = 'https://toharper.dad';
    const filePath = '/data/dads_letter.json';
    
    let response = await fetch(`${baseUrl}${filePath}`);
    
    if (!response.ok) {
      try {
        response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch letter chunks: ${response.status}`);
        }
      } catch (relativeError) {
        throw new Error(`Failed to fetch letter chunks from both absolute and relative paths: ${response.status}`);
      }
    }
    
    const chunks = await response.json();
    if (!Array.isArray(chunks)) {
      throw new Error('Letter chunks file does not contain an array');
    }
    
    return chunks;
  } catch (error) {
    console.error('Error fetching letter chunks from file:', error);
    return [];
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Check if KV is available - use DADS_LETTER namespace for letter chunks
  if (!env.DADS_LETTER) {
    return new Response('KV namespace DADS_LETTER not available', {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  try {
    const cacheKey = 'chunks'; // Key in DADS_LETTER namespace
    
    // Check if already cached
    const existing = await env.DADS_LETTER.get(cacheKey, 'json');
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Chunks already cached',
          chunksCount: existing.length,
          cached: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Fetch chunks from file
    console.log('Fetching letter chunks from file...');
    const chunks = await fetchLetterChunksFromFile();

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No letter chunks found in file',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Remove duplicates by chunk number
    const uniqueChunks = [];
    const seenChunkNumbers = new Set();
    const duplicates = [];

    for (const chunk of chunks) {
      if (chunk && typeof chunk === 'object' && typeof chunk.chunk === 'number') {
        if (!seenChunkNumbers.has(chunk.chunk)) {
          seenChunkNumbers.add(chunk.chunk);
          uniqueChunks.push(chunk);
        } else {
          duplicates.push(chunk.chunk);
        }
      }
    }

    if (duplicates.length > 0) {
      console.warn(`Found ${duplicates.length} duplicate chunk numbers: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Cache the unique chunks in DADS_LETTER namespace
    await env.DADS_LETTER.put(cacheKey, JSON.stringify(uniqueChunks));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Letter chunks cached successfully',
        chunksCount: uniqueChunks.length,
        duplicatesRemoved: duplicates.length,
        cached: false,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error caching letter chunks:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to cache letter chunks',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

