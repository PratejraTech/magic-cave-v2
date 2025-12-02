import { readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');
const DADDY_QUOTES_PATH = path.join(ROOT, 'public', 'data', 'daddy-quotes.json');
const CHILDREN_QUOTES_PATH = path.join(ROOT, 'public', 'data', 'quotes_children.json');

// Determine API endpoint - check environment or default to local
const API_BASE = process.env.VITE_CHAT_API_URL || process.env.CHAT_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');
const CHAT_ENDPOINT = `${API_BASE}/api/chat-with-daddy`;

// System prompt: Gentle, loving father writing short poems for toddler daughter
// This is specifically for body generation, separate from chat functionality
const BODY_SYSTEM_PROMPT =
  `You are a gentle, loving father writing short poems for your toddler daughter. Each poem is inspired by the Title field provided as input. The poem must be warm, safe, playful, and age-appropriate. Use language and imagery that a young child can understand and enjoy; emphasise feelings of love, comfort, wonder, curiosity, kindness, and simple everyday moments. Incorporate occasional references to things a young child may love (like butterflies, swings, dogs, backyard adventures, bedtime stories), but never stray into darkness, fear, or complex adult themes. Poems should be short (3 lines), lyrical, rhythmic, and feel like a tender bedtime lullaby or a gentle whisper from Daddy.

When you output, produce only a JSON object with the same fields as the input — preserving "day" (or whatever ID field), and adding or filling "body" with the poem. Do not add any extra keys or metadata. Maintain valid JSON.`

// User prompt template: Combines Title, SYSTEM_PROMPT, and quote from quotes_children.json
// This is specifically for body generation, separate from chat functionality
const BODY_USER_PROMPT = (title, quoteText = null, day = null) => {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required for body generation');
  }
  
  // Build input JSON object
  const inputJson = { title };
  if (day !== null && day !== undefined) {
    inputJson.day = day;
  }
  
  let prompt = `Read the input JSON's "title". Write a poem of exactly 3 lines.\n\nInput JSON:\n${JSON.stringify(inputJson, null, 2)}`;
  
  if (quoteText && quoteText.trim().length > 0) {
    prompt += `\n\nLet this quote inspire your poem: "${quoteText}"`;
  }
  
  prompt += `\n\nEach line may contain one or two short sentences. Use simple, concrete language suitable for a 3-year-old. Use gentle repetition, soft rhythm, and melodic flow — like a lullaby or whispered bedtime story. Use imagery drawn from safe everyday life: backyard, swings, butterflies, doggies, soft light, playful moments, cuddles, quiet childhood wonder. Focus on love, warmth, curiosity, and connection. Address the child directly ("you," "my little one," "my darling girl"). Avoid any scary, negative, or adult-themed content. Do not include rhyme unless natural and simple; rhythm and feeling matter more than forced rhyme. Do not reference specific holidays, seasons (unless general), political or adult contexts.\n\nOutput exactly one JSON object (not a list) with the same fields as the input, preserving "day" and adding "body" with the poem.`;
  return prompt;
};

// Fetch a random quote from quotes_children.json for loving inspiration
async function fetchChildrenQuote() {
  try {
    const quotesContent = await readFile(CHILDREN_QUOTES_PATH, 'utf8');
    const quotes = JSON.parse(quotesContent);
    if (Array.isArray(quotes) && quotes.length > 0) {
      // Randomly select a quote from children quotes
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      if (randomQuote.quote) {
        return randomQuote.quote;
      }
    }
  } catch (error) {
    console.warn(`[generate:bodies] Could not load children quotes from quotes_children.json: ${error.message}`);
  }
  
  return null;
}

/**
 * Generate body text from Title and quoteText using BODY_SYSTEM_PROMPT.
 * This function is specifically for body generation and uses BODY_SYSTEM_PROMPT,
 * which is separate from the chat system prompt (SYSTEM_PROMPT || CHAT_SYSTEM_PROMPT).
 * 
 * @param {string} title - The memory title (required)
 * @param {string|null} quoteText - Optional quote text for inspiration
 * @param {number|null} dayNumber - Optional day number for session ID uniqueness
 * @returns {Promise<string>} Generated body text
 */
async function generateBodyFromTitleAndQuote(title, quoteText = null, dayNumber = null) {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required to generate body');
  }

  // Create a unique session ID for each request to prevent context sharing
  // Include timestamp and random number to ensure atomicity
  const uniqueSessionId = `generate-body-${Date.now()}-${Math.random().toString(36).substring(7)}-day-${dayNumber || 'unknown'}`;

  // Each request is completely independent - no shared context
  // Use BODY_SYSTEM_PROMPT explicitly (NOT SYSTEM_PROMPT or CHAT_SYSTEM_PROMPT)
  // User prompt combines Title, dayNumber, and quoteText together
  const messages = [
    { role: 'system', content: BODY_SYSTEM_PROMPT },
    { role: 'user', content: BODY_USER_PROMPT(title, quoteText, dayNumber) },
  ];

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Explicitly send BODY_SYSTEM_PROMPT to ensure API uses it (not chat prompt)
        systemPrompt: BODY_SYSTEM_PROMPT,
        messages,
        quotes: [], // Empty quotes array - we're using quoteText in the user prompt instead
        childrenQuotes: [], // Empty children quotes array - we're using quoteText in the user prompt instead
        sessionId: uniqueSessionId, // Unique session for each request
        max_completion_tokens: 150, // Limit tokens to keep responses short (3 lines)
        useCustomSystemPrompt: true, // Critical flag: tells API to use BODY_SYSTEM_PROMPT instead of SYSTEM_PROMPT || CHAT_SYSTEM_PROMPT
        stream: false, // Force non-streaming JSON response (not SSE)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    // Verify content-type is JSON, not SSE
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      throw new Error('API returned SSE format instead of JSON. Check stream parameter.');
    }

    const data = await response.json();
    
    // Extract reply string from response
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid API response format: expected object, got ${typeof data}`);
    }
    
    const reply = data.reply;
    if (typeof reply !== 'string') {
      throw new Error(`Invalid reply format: expected string, got ${typeof reply}. Response: ${JSON.stringify(data).substring(0, 200)}`);
    }
    
    return reply.trim();
  } catch (error) {
    throw new Error(`Failed to generate body: ${error.message}`);
  }
}

const BODY_CACHE_TTL = 1000 * 60 * 60 * 24 * 2; // 2 days in milliseconds

// Check if we should force refresh all bodies (for refresh:bodies script)
const FORCE_REFRESH = process.env.FORCE_REFRESH_BODIES === 'true' || process.env.REFRESH_BODIES === 'true';

async function processPhotoFiles() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  // Process compressed JSON files (since we removed originals)
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('_compressed.json')
  );

  const filesToUpdate = [];
  const results = [];
  const generatedBodies = []; // Store all generated bodies for output
  const now = Date.now();

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);
    const baseName = path.parse(jsonFile.name).name;

    try {
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);
      const fileStats = await stat(jsonPath);

      // Case-insensitive field reading
      const title = data.Title || data.title || '';
      const body = data.Body || data.body || '';
      const cacheKey = data.cache_key || data.cacheKey || data.CacheKey || '';
      const day = data.day || data.Day || null;
      // Use file mtime as timestamp for age calculation (body_timestamp field removed from schema)
      const bodyTimestamp = fileStats.mtimeMs;

      // Check if Body needs regeneration:
      // 1. FORCE_REFRESH is enabled (for refresh:bodies) - regenerate all
      // 2. Body is empty
      // 3. Body is older than 2 days (BODY_CACHE_TTL)
      const bodyAge = now - bodyTimestamp;
      const needsRegeneration = FORCE_REFRESH || !body || body.trim().length === 0 || bodyAge >= BODY_CACHE_TTL;

      if (needsRegeneration) {
        filesToUpdate.push({
          file: jsonFile.name,
          baseName,
          jsonPath,
          title: title.trim(),
          body: body.trim(),
          cacheKey: cacheKey.trim(),
          day,
          bodyAge: bodyAge / (1000 * 60 * 60 * 24), // Age in days
          data,
        });
      }
    } catch (error) {
      console.error(`[generate:bodies] Error reading ${jsonFile.name}: ${error.message}`);
    }
  }

  if (FORCE_REFRESH) {
    console.log(`[generate:bodies] 🔄 FORCE REFRESH MODE: Regenerating Body text for ALL ${filesToUpdate.length} files`);
  } else {
    console.log(`[generate:bodies] Found ${filesToUpdate.length} files needing Body regeneration`);
  }
  
  if (filesToUpdate.length === 0) {
    if (FORCE_REFRESH) {
      console.log(`[generate:bodies] No JSON files found to process.`);
    } else {
      console.log(`[generate:bodies] No files need Body regeneration. All files are up to date (within 2 days).`);
    }
    return { successful: [], failed: [] };
  }

  // Log which files need updating and why
  if (!FORCE_REFRESH) {
    const emptyBodies = filesToUpdate.filter(f => !f.body || f.body.trim().length === 0);
    const staleBodies = filesToUpdate.filter(f => f.body && f.body.trim().length > 0);
    
    if (emptyBodies.length > 0) {
      console.log(`[generate:bodies] ${emptyBodies.length} files have empty Body fields`);
    }
    if (staleBodies.length > 0) {
      console.log(`[generate:bodies] ${staleBodies.length} files have stale Body fields (older than 2 days)`);
      staleBodies.forEach(f => {
        console.log(`  - ${f.file}: ${f.bodyAge.toFixed(1)} days old`);
      });
    }
  } else {
    console.log(`[generate:bodies] Will regenerate Body text for all ${filesToUpdate.length} files using LLM`);
  }

  // Check if API is available
  let apiAvailable = false;
  try {
    console.log(`[generate:bodies] Testing API endpoint: ${CHAT_ENDPOINT}`);
    const testResponse = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], quotes: [], sessionId: 'test' }),
    }).catch(() => null);
    apiAvailable = testResponse && testResponse.status !== 404;
  } catch (error) {
    console.warn(`[generate:bodies] API endpoint not available: ${error.message}`);
  }

  if (!apiAvailable) {
    console.warn(`[generate:bodies] ⚠️  Chat API not available at ${CHAT_ENDPOINT}`);
    console.warn(`[generate:bodies] ⚠️  Body generation requires the chat API to be running.`);
    console.warn(`[generate:bodies] ⚠️  Start the chat server with: npm run chat-server`);
    console.warn(`[generate:bodies] ⚠️  Or set VITE_CHAT_API_URL to your production API URL`);
    console.warn(`[generate:bodies] ⚠️  Skipping Body generation. Files will have empty Body fields.`);
    console.warn(`[generate:bodies] ⚠️  Re-run this script after starting the API to generate Body fields.`);
  } else {
    console.log(`[generate:bodies] ✓ Chat API is available. Generating Body fields...`);
  }

  // Generate bodies and cache keys for each file
  for (const fileInfo of filesToUpdate) {
    try {
      console.log(`[generate:bodies] Processing ${fileInfo.file}...`);

      // Generate cache_key if missing
      let cacheKey = fileInfo.cacheKey;
      if (!cacheKey || cacheKey.trim().length === 0) {
        if (fileInfo.day && typeof fileInfo.day === 'number') {
          cacheKey = `harper-day-${fileInfo.day.toString().padStart(2, '0')}`;
        } else {
          throw new Error(`Cannot generate cache_key: day field is missing or invalid (${fileInfo.day})`);
        }
      }

      // Generate or fix Title if missing
      let title = fileInfo.title;
      if (!title || title.trim().length === 0) {
        // Use a default title based on filename or day
        title = fileInfo.day ? `Day ${fileInfo.day} Memory` : `Memory from ${fileInfo.baseName}`;
        console.log(`[generate:bodies] Generated default title for ${fileInfo.file}: "${title}"`);
      }

      // Generate Body using LLM
      // When FORCE_REFRESH is true, always regenerate and replace existing Body
      // Clear existing body before generation to prevent convergence
      const hadExistingBody = fileInfo.body && fileInfo.body.trim().length > 0;
      let body = '';
      
      // For FORCE_REFRESH mode, API must be available - fail if not
      if (FORCE_REFRESH && !apiAvailable) {
        throw new Error(`FORCE_REFRESH requires API to be available, but API is not accessible at ${CHAT_ENDPOINT}`);
      }
      
      if (apiAvailable) {
        const action = FORCE_REFRESH ? 'Force replacing' : (hadExistingBody ? 'Regenerating' : 'Generating');
        const ageInfo = FORCE_REFRESH && hadExistingBody ? ` (clearing and replacing existing ${fileInfo.bodyAge.toFixed(1)} day old Body)` : (hadExistingBody ? ` (was ${fileInfo.bodyAge.toFixed(1)} days old)` : '');
        console.log(`[generate:bodies] ${action} Body from Title: "${title}"${ageInfo}`);
        try {
          // Fetch quote text for inspiration (optional, won't block if unavailable)
          const quoteText = await fetchChildrenQuote();
          
          // Generate fresh body using BODY_SYSTEM_PROMPT with Title and quoteText together
          // Pass day number for unique session ID to ensure atomic requests
          body = await generateBodyFromTitleAndQuote(title, quoteText, fileInfo.day);
          console.log(`[generate:bodies] ✓ ${FORCE_REFRESH ? 'Replaced' : (hadExistingBody ? 'Regenerated' : 'Generated')} Body (${body.length} chars)`);
        } catch (error) {
          console.error(`[generate:bodies] ✗ Failed to generate Body via LLM: ${error.message}`);
          throw error; // Re-throw to mark file as failed
        }
      } else {
        // API not available - only skip if not FORCE_REFRESH mode
        console.warn(`[generate:bodies] ⚠️  Skipping Body generation for ${fileInfo.file} (API not available)`);
        // Keep body empty since we cleared it
        body = '';
      }

      // Get subtitle with case-insensitive fallback
      const subtitle = fileInfo.data.Subtitle || fileInfo.data.subtitle || 'Daddy Loves You!';

      // Ensure proper field order and consistent case (Title, Subtitle, Body)
      // Body is the generated string from data.reply, written to "Body" key (title case)
      // Schema: {Title, Subtitle, Body, cache_key, day} - NO body_timestamp
      const orderedData = {
        Title: title,
        Subtitle: subtitle,
        Body: body, // Generated body string written to "Body" key (title case)
        cache_key: cacheKey,
        day: fileInfo.day,
      };

      // Body must be populated - for FORCE_REFRESH, this is mandatory
      if (!body || body.trim().length === 0) {
        if (FORCE_REFRESH) {
          throw new Error(`FORCE_REFRESH failed: Body generation returned empty result for ${fileInfo.file}. Check API response.`);
        } else if (!apiAvailable) {
          throw new Error('Body generation required but API not available. Start chat server or set VITE_CHAT_API_URL.');
        } else {
          throw new Error('Body generation failed - check API response');
        }
      }

      // Write updated JSON
      await writeFile(fileInfo.jsonPath, JSON.stringify(orderedData, null, 2), 'utf8');
      results.push({
        file: fileInfo.file,
        success: true,
        title,
        body: body.substring(0, 50) + '...',
        cacheKey,
      });
      
      // Store generated body for output
      if (body && body.trim().length > 0) {
        generatedBodies.push({
          day: fileInfo.day || null,
          output: body.trim(),
        });
      }
      
      console.log(`[generate:bodies] ✓ Updated ${fileInfo.file}`);
    } catch (error) {
      console.error(`[generate:bodies] ✗ Failed to process ${fileInfo.file}: ${error.message}`);
      results.push({
        file: fileInfo.file,
        success: false,
        error: error.message,
      });
    }
  }

  console.log(`\n[generate:bodies] Summary:`);
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  console.log(`  ✓ Successfully updated: ${successful.length}`);
  if (failed.length > 0) {
    console.log(`  ✗ Failed: ${failed.length}`);
    failed.forEach((r) => console.log(`    - ${r.file}: ${r.error}`));
  }

  // Output prompt and all generated bodies if refresh mode
  if (FORCE_REFRESH && generatedBodies.length > 0) {
    console.log(`\n[generate:bodies] Generated Bodies Output:`);
    console.log(`{Body.SystemPrompt}: ${BODY_SYSTEM_PROMPT}`);
    console.log(`{Body.UserPrompt}: ${BODY_USER_PROMPT('[Title]')}`);
    console.log('');
    generatedBodies.forEach((item) => {
      console.log(JSON.stringify({ day: item.day || '', output: item.output }, null, 2));
    });
  }

  return { successful, failed, generatedBodies };
}

processPhotoFiles()
  .then(({ successful, failed, generatedBodies }) => {
    if (failed.length > 0) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('[generate:bodies] Fatal error:', error);
    process.exit(1);
  });

