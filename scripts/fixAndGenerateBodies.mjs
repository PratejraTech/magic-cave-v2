import { readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');
const CHILDREN_QUOTES_PATH = path.join(ROOT, 'public', 'data', 'quotes_children.json');

// Determine API endpoint
const API_BASE = process.env.VITE_CHAT_API_URL || process.env.CHAT_API_URL || (process.env.NODE_ENV === 'production' ? 'https://toharper.dad' : 'http://localhost:4000');
const CHAT_ENDPOINT = `${API_BASE}/api/chat-with-daddy`;

// System prompt for body generation
const BODY_SYSTEM_PROMPT =
  `You are a gentle, loving father writing short poems for your toddler daughter. Each poem is inspired by the Title field provided as input. The poem must be warm, safe, playful, and age-appropriate. Use language and imagery that a young child can understand and enjoy; emphasise feelings of love, comfort, wonder, curiosity, kindness, and simple everyday moments. Incorporate occasional references to things a young child may love (like butterflies, swings, dogs, backyard adventures, bedtime stories), but never stray into darkness, fear, or complex adult themes. Poems should be short (3 lines), lyrical, rhythmic, and feel like a tender bedtime lullaby or a gentle whisper from Daddy.

When you output, produce only a JSON object with the same fields as the input — preserving "day" (or whatever ID field), and adding or filling "body" with the poem. Do not add any extra keys or metadata. Maintain valid JSON.`;

// User prompt template
const BODY_USER_PROMPT = (title, quoteText = null, day = null) => {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required for body generation');
  }
  
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

// Fetch a random quote from quotes_children.json
async function fetchChildrenQuote() {
  try {
    const quotesContent = await readFile(CHILDREN_QUOTES_PATH, 'utf8');
    const quotes = JSON.parse(quotesContent);
    if (Array.isArray(quotes) && quotes.length > 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      if (randomQuote.quote) {
        return randomQuote.quote;
      }
    }
  } catch (error) {
    console.warn(`[fix:bodies] Could not load children quotes: ${error.message}`);
  }
  
  return null;
}

// Extract body from JSON string if present
function extractBodyFromJson(bodyString) {
  if (!bodyString || typeof bodyString !== 'string') return null;
  
  try {
    const parsed = JSON.parse(bodyString);
    if (parsed && typeof parsed === 'object' && parsed.body) {
      return parsed.body;
    }
  } catch {
    // Not JSON, return null
  }
  
  return null;
}

// Generate body text from Title and quoteText
async function generateBodyFromTitleAndQuote(title, quoteText = null, dayNumber = null) {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required to generate body');
  }

  const uniqueSessionId = `generate-body-${Date.now()}-${Math.random().toString(36).substring(7)}-day-${dayNumber || 'unknown'}`;

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
        systemPrompt: BODY_SYSTEM_PROMPT,
        messages,
        quotes: [],
        childrenQuotes: [],
        sessionId: uniqueSessionId,
        max_completion_tokens: 150,
        useCustomSystemPrompt: true,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      throw new Error('API returned SSE format instead of JSON. Check stream parameter.');
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid API response format: expected object, got ${typeof data}`);
    }
    
    const reply = data.reply;
    
    // Try to parse as JSON first (expected format)
    try {
      const parsed = typeof reply === 'string' ? JSON.parse(reply) : reply;
      if (parsed && typeof parsed === 'object' && parsed.body) {
        return parsed.body.trim();
      }
    } catch {
      // If not JSON, treat as plain string (fallback)
    }
    
    if (typeof reply !== 'string') {
      throw new Error(`Invalid reply format: expected string or JSON object with body field, got ${typeof reply}`);
    }
    
    return reply.trim();
  } catch (error) {
    throw new Error(`Failed to generate body: ${error.message}`);
  }
}

async function processPhotoFiles() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('_compressed.json')
  );

  const filesToUpdate = [];
  const results = [];

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);

    try {
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);

      const title = data.Title || data.title || '';
      const body = data.Body || data.body || '';
      const day = data.day || data.Day || null;

      // Check if Body needs fixing or generation
      let needsUpdate = false;
      let newBody = body;

      // If Body is a JSON string, extract the body text
      if (body && typeof body === 'string' && body.trim().startsWith('{')) {
        const extracted = extractBodyFromJson(body);
        if (extracted) {
          newBody = extracted;
          needsUpdate = true;
        }
      }

      // If Body is empty or missing, generate it
      if (!newBody || newBody.trim().length === 0) {
        if (!title) {
          console.warn(`[fix:bodies] Skipping ${jsonFile.name}: No Title field`);
          continue;
        }
        needsUpdate = true;
        // Will generate below
      }

      if (needsUpdate) {
        filesToUpdate.push({
          file: jsonFile.name,
          jsonPath,
          title: title.trim(),
          currentBody: body,
          newBody: newBody && newBody.trim().length > 0 ? newBody : null, // null means needs generation
          day,
          data,
        });
      }
    } catch (error) {
      console.error(`[fix:bodies] Error reading ${jsonFile.name}: ${error.message}`);
    }
  }

  if (filesToUpdate.length === 0) {
    console.log(`[fix:bodies] All files have valid Body fields. No updates needed.`);
    return { successful: [], failed: [] };
  }

  console.log(`[fix:bodies] Found ${filesToUpdate.length} files needing Body updates`);
  
  // Check if API is available
  let apiAvailable = false;
  try {
    console.log(`[fix:bodies] Testing API endpoint: ${CHAT_ENDPOINT}`);
    const testResponse = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], quotes: [], sessionId: 'test' }),
    }).catch(() => null);
    apiAvailable = testResponse && testResponse.status !== 404;
  } catch (error) {
    console.warn(`[fix:bodies] API endpoint not available: ${error.message}`);
  }

  if (!apiAvailable) {
    console.warn(`[fix:bodies] ⚠️  Chat API not available at ${CHAT_ENDPOINT}`);
    console.warn(`[fix:bodies] ⚠️  Will only fix JSON string bodies, cannot generate new ones.`);
  } else {
    console.log(`[fix:bodies] ✓ Chat API is available.`);
  }

  // Process each file
  for (const fileInfo of filesToUpdate) {
    try {
      console.log(`[fix:bodies] Processing ${fileInfo.file}...`);

      let finalBody = fileInfo.newBody;

      // If body needs generation and API is available
      if (!finalBody && apiAvailable) {
        console.log(`[fix:bodies] Generating Body from Title: "${fileInfo.title}"`);
        try {
          const quoteText = await fetchChildrenQuote();
          finalBody = await generateBodyFromTitleAndQuote(fileInfo.title, quoteText, fileInfo.day);
          console.log(`[fix:bodies] ✓ Generated Body (${finalBody.length} chars)`);
        } catch (error) {
          console.error(`[fix:bodies] ✗ Failed to generate Body: ${error.message}`);
          results.push({
            file: fileInfo.file,
            success: false,
            error: error.message,
          });
          continue;
        }
      } else if (!finalBody) {
        console.warn(`[fix:bodies] ⚠️  Skipping ${fileInfo.file} - Body is empty and API not available`);
        results.push({
          file: fileInfo.file,
          success: false,
          error: 'Body is empty and API not available',
        });
        continue;
      }

      // Get subtitle with case-insensitive fallback
      const subtitle = fileInfo.data.Subtitle || fileInfo.data.subtitle || 'Daddy Loves You!';
      const cacheKey = fileInfo.data.cache_key || fileInfo.data.cacheKey || fileInfo.data.CacheKey || '';

      // Ensure proper field order and consistent case
      const orderedData = {
        Title: fileInfo.title,
        Subtitle: subtitle,
        Body: finalBody,
        cache_key: cacheKey,
        day: fileInfo.day,
      };

      // Write updated JSON
      await writeFile(fileInfo.jsonPath, JSON.stringify(orderedData, null, 2), 'utf8');
      results.push({
        file: fileInfo.file,
        success: true,
        title: fileInfo.title,
        body: finalBody.substring(0, 50) + '...',
      });
      
      console.log(`[fix:bodies] ✓ Updated ${fileInfo.file}`);
    } catch (error) {
      console.error(`[fix:bodies] ✗ Failed to process ${fileInfo.file}: ${error.message}`);
      results.push({
        file: fileInfo.file,
        success: false,
        error: error.message,
      });
    }
  }

  console.log(`\n[fix:bodies] Summary:`);
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  console.log(`  ✓ Successfully updated: ${successful.length}`);
  if (failed.length > 0) {
    console.log(`  ✗ Failed: ${failed.length}`);
    failed.forEach((r) => console.log(`    - ${r.file}: ${r.error}`));
  }

  return { successful, failed };
}

processPhotoFiles()
  .then(({ successful, failed }) => {
    if (failed.length > 0) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('[fix:bodies] Fatal error:', error);
    process.exit(1);
  });

