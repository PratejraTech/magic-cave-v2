import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const LETTER_JSON_PATH = path.join(ROOT, 'public', 'data', 'dads_letter.json');

// Determine API endpoint - check environment or default
const API_BASE = process.env.VITE_CHAT_API_URL || process.env.CHAT_API_URL || 'https://toharper.dad';
const CACHE_ENDPOINT = `${API_BASE}/api/cache-letter-chunks`;

/**
 * Cache letter chunks to Cloudflare KV
 * This script validates the letter chunks and calls the Cloudflare Function
 * endpoint to cache them in KV
 */
async function cacheLetterChunks() {
  try {
    console.log('[cache:letter-chunks] Reading letter chunks from file...');
    const fileContent = await readFile(LETTER_JSON_PATH, 'utf8');
    const chunks = JSON.parse(fileContent);

    if (!Array.isArray(chunks)) {
      throw new Error('Letter chunks file does not contain an array');
    }

    if (chunks.length === 0) {
      throw new Error('Letter chunks array is empty');
    }

    console.log(`[cache:letter-chunks] Found ${chunks.length} letter chunks`);

    // Validate chunks structure
    const validChunks = chunks.filter((chunk) => {
      return (
        chunk &&
        typeof chunk === 'object' &&
        typeof chunk.chunk === 'number' &&
        Array.isArray(chunk.topics) &&
        typeof chunk.content === 'string' &&
        chunk.content.trim().length > 0
      );
    });

    if (validChunks.length !== chunks.length) {
      console.warn(
        `[cache:letter-chunks] Warning: ${chunks.length - validChunks.length} invalid chunks found and filtered out`
      );
    }

    if (validChunks.length === 0) {
      throw new Error('No valid letter chunks found after validation');
    }

    console.log(`[cache:letter-chunks] Validated ${validChunks.length} chunks`);

    // Check for duplicate chunk numbers
    const chunkNumbers = validChunks.map((c) => c.chunk);
    const duplicates = chunkNumbers.filter((num, index) => chunkNumbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate chunk numbers found: ${[...new Set(duplicates)].join(', ')}`);
    }

    console.log('[cache:letter-chunks] No duplicate chunk numbers found ✓');

    // Option 1: Use Wrangler CLI directly (if enabled)
    if (USE_WRANGLER_DIRECT) {
      console.log('[cache:letter-chunks] Using Wrangler CLI directly...');
      const { execSync } = await import('child_process');
      const kvNamespace = 'HARPER_ADVENT'; // KV namespace binding name
      const kvKey = 'DADS_LETTER:chunks';
      
      // Write chunks to a temporary file
      const tempFile = path.join(ROOT, '.temp_letter_chunks.json');
      await import('fs/promises').then((fs) => fs.writeFile(tempFile, JSON.stringify(validChunks, null, 2)));

      try {
        // Try newer Wrangler syntax first: wrangler kv key put
        let command = `npx wrangler kv key put "${kvKey}" --path=${tempFile} --namespace-id=${kvNamespace}`;
        console.log(`[cache:letter-chunks] Executing: ${command}`);
        
        try {
          execSync(command, { stdio: 'inherit', cwd: ROOT, env: { ...process.env } });
          console.log(`[cache:letter-chunks] ✓ Successfully cached ${validChunks.length} letter chunks using Wrangler CLI`);
          
          // Clean up temp file
          await import('fs/promises').then((fs) => fs.unlink(tempFile).catch(() => {}));
          return { success: true, chunksCached: validChunks.length };
        } catch (wranglerError) {
          // Try alternative syntax: wrangler kv:key put with binding
          console.log('[cache:letter-chunks] Trying alternative Wrangler syntax...');
          command = `npx wrangler kv:key put "${kvKey}" --path=${tempFile} --binding=${kvNamespace}`;
          execSync(command, { stdio: 'inherit', cwd: ROOT, env: { ...process.env } });
          console.log(`[cache:letter-chunks] ✓ Successfully cached ${validChunks.length} letter chunks using Wrangler CLI (alternative syntax)`);
          
          // Clean up temp file
          await import('fs/promises').then((fs) => fs.unlink(tempFile).catch(() => {}));
          return { success: true, chunksCached: validChunks.length };
        }
      } catch (wranglerError) {
        // Clean up temp file
        await import('fs/promises').then((fs) => fs.unlink(tempFile).catch(() => {}));
        console.error('[cache:letter-chunks] Wrangler CLI failed:', wranglerError.message);
        console.log('[cache:letter-chunks] Falling back to API endpoint method...');
        // Fall through to API endpoint method
      }
    }

    // Option 2: Call the Cloudflare Function endpoint to cache the chunks
    console.log(`[cache:letter-chunks] Calling cache endpoint: ${CACHE_ENDPOINT}`);
    const response = await fetch(CACHE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check content type first
    const contentType = response.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    
    // Read response text once
    const responseText = await response.text();
    
    if (!response.ok) {
      // Check if we got HTML (error page) instead of JSON
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html') || !isJSON) {
        throw new Error(
          `Cache endpoint returned HTML (likely 404 or error page). Status: ${response.status}.\n` +
          `The endpoint may not be deployed yet. Make sure ${CACHE_ENDPOINT} is accessible.\n` +
          `Content-Type: ${contentType}\n` +
          `Response preview: ${responseText.substring(0, 300)}`
        );
      }
      throw new Error(`Cache endpoint returned ${response.status}: ${responseText.substring(0, 500)}`);
    }

    // Verify we got JSON before parsing
    if (!isJSON) {
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error(
          `Cache endpoint returned HTML instead of JSON. The endpoint may not be deployed.\n` +
          `URL: ${CACHE_ENDPOINT}\n` +
          `Content-Type: ${contentType}\n` +
          `Response preview: ${responseText.substring(0, 300)}`
        );
      }
      throw new Error(`Cache endpoint returned unexpected content type: ${contentType}. Response: ${responseText.substring(0, 200)}`);
    }

    // Parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Failed to parse JSON response from cache endpoint.\n` +
        `Content-Type: ${contentType}\n` +
        `Response preview: ${responseText.substring(0, 300)}\n` +
        `Parse error: ${parseError.message}`
      );
    }
    
    if (result.success) {
      console.log(`[cache:letter-chunks] ✓ Successfully cached ${result.chunksCount} letter chunks to KV`);
      if (result.duplicatesRemoved > 0) {
        console.log(`[cache:letter-chunks] Note: ${result.duplicatesRemoved} duplicate chunks were removed`);
      }
      if (result.cached) {
        console.log('[cache:letter-chunks] Note: Chunks were already cached');
      }
      return { success: true, chunksCached: result.chunksCount };
    } else {
      throw new Error(result.message || 'Failed to cache chunks');
    }
  } catch (error) {
    console.error('[cache:letter-chunks] Fatal error:', error);
    if (error.message.includes('fetch')) {
      console.error('[cache:letter-chunks] Make sure the Cloudflare Function is deployed and accessible');
      console.error(`[cache:letter-chunks] Endpoint: ${CACHE_ENDPOINT}`);
    }
    process.exit(1);
  }
}

// Run the cache job
cacheLetterChunks()
  .then((result) => {
    if (result.success) {
      console.log(`[cache:letter-chunks] Batch job completed successfully. ${result.chunksCached} chunks cached.`);
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('[cache:letter-chunks] Batch job failed:', error);
    process.exit(1);
  });

