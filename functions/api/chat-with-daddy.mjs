import { SYSTEM_PROMPT } from './systemPrompt.js';
import { getSystemPromptTemplate, renderSystemPrompt } from './systemPromptTemplates.js';
import { moderateContent, logModerationResult } from './contentModeration.js';
import { generateCacheKey, getCachedResponse, setCachedResponse, logLLMUsage } from './llmCache.js';

// Assistant prompt for reading letter chunks progressively from DADS_LETTER KV Namespace
// Uses low-token format: base prompt with [CHUNK_STYLE] placeholder for chunk SYSTEM_PROMPT
// Works for both Harper and Guest sessions, progressively revealing and enriching chunks
const ASSISTANT_PROMPT =
  "You are {childName}'s {parentTitle} reading a letter to your child like a storyteller. You are a gentle, loving {parentType}. Your voice carries {parentEnergy}—steady, warm, protective, and full of wonder. The letter is stored in chunks in DADS_LETTER KV Namespace, and you are progressively revealing and enriching each chunk to build a complete narrative. Each chunk should build upon previous ones, creating anticipation and connection. For both Harper and Guest sessions, reveal content gradually, making it engaging and age-appropriate. Express love and adoration while maintaining the original content. Style: [CHUNK_STYLE]\n\nCRITICAL RESPONSE FORMAT:\n- Always respond with EXACTLY 2 short, inspiring, and loving sentences\n- Then include ONE children-based quote from the provided quotes\n- Format: [Sentence 1]. [Sentence 2]. \"[Quote text]\"\n- Keep sentences very short, simple, and age-friendly for a 3-year-old\n- Each response must be unique—never repeat phrases or patterns\n- Speak directly from Daddy to Harper—clear, warm, and personal\n\nCRITICAL RULES FOR PROGRESSIVE REVELATION:\n- NEVER start with greetings like 'Hello, my sweet Harper' or 'Hello sweetheart' - jump directly into the letter content\n- Each chunk should feel like a natural continuation of the story, building upon previous chunks\n- Progressively reveal and enrich the content—don't repeat what was already said\n- Use the specific chunk content to craft a unique opening that connects to previous chunks\n- Never use the same greeting or opening phrase twice\n- Vary your rhythm, tone, and structure based on the chunk's emotional content and position in the narrative\n- If the chunk mentions specific memories or events, reference them directly and connect them to the ongoing story\n- Let the chunk's unique words and phrases inspire your opening sentence\n- Build anticipation—each chunk should feel like the next page of a storybook\n- Always end with a children-based quote that complements your 2 sentences\n- Channel Dad energy: gentle, caring, loving, protective, warm, steady—like a father reading his daughter a story";

/**
 * Load conversation memory from KV storage
 */
async function loadMemoryFromKV(kv, sessionId) {
  if (!kv) return null;
  try {
    const key = `memory:${sessionId}`;
    const data = await kv.get(key, 'json');
    return data || null;
  } catch (error) {
    console.error('Error loading memory from KV:', error);
    return null;
  }
}

/**
 * Save conversation memory to KV storage
 */
async function saveMemoryToKV(kv, sessionId, memoryData) {
  if (!kv) return;
  try {
    const key = `memory:${sessionId}`;
    await kv.put(key, JSON.stringify(memoryData));
  } catch (error) {
    console.error('Error saving memory to KV:', error);
  }
}

/**
 * Build conversation context from memory
 */
function buildConversationContext(memory, recentMessages) {
  if (!memory) {
    return recentMessages;
  }

  const context = [];
  
  // Add summary if available
  if (memory.summary) {
    context.push({
      role: 'system',
      content: `Previous conversation summary: ${memory.summary}`,
    });
  }

  // Add recent messages from memory (last 10)
  if (memory.recentMessages && Array.isArray(memory.recentMessages)) {
    context.push(...memory.recentMessages.slice(-10));
  }

  // Add current conversation messages
  context.push(...recentMessages);

  return context;
}

/**
 * Update memory with new conversation
 */
function updateMemory(memory, newMessages) {
  const updatedMemory = memory || {
    summary: '',
    recentMessages: [],
    totalMessages: 0,
  };

  // Add new messages to recent messages
  updatedMemory.recentMessages = [
    ...(updatedMemory.recentMessages || []),
    ...newMessages,
  ].slice(-20); // Keep last 20 messages

  updatedMemory.totalMessages = (updatedMemory.totalMessages || 0) + newMessages.length;

  // Simple summary update (in production, could use LLM to generate summary)
  if (updatedMemory.totalMessages > 10 && updatedMemory.totalMessages % 5 === 0) {
    // Update summary periodically (simplified - in production use LLM)
    updatedMemory.summary = `Conversation with ${updatedMemory.totalMessages} messages about various topics.`;
  }

  return updatedMemory;
}

/**
 * Load chunk progress from DADS_LETTER KV namespace
 * @param {KVNamespace} dadsLetterKv - DADS_LETTER KV namespace
 * @param {string} sessionId - Session ID
 * @returns {Promise<{lastChunk: number, totalChunks: number} | null>}
 */
async function loadChunkProgress(dadsLetterKv, sessionId) {
  if (!dadsLetterKv) return null;
  try {
    const key = `chunk-progress:${sessionId}`;
    const data = await dadsLetterKv.get(key, 'json');
    return data || null;
  } catch (error) {
    console.error('Error loading chunk progress from KV:', error);
    return null;
  }
}

/**
 * Save chunk progress to DADS_LETTER KV namespace
 * @param {KVNamespace} dadsLetterKv - DADS_LETTER KV namespace
 * @param {string} sessionId - Session ID
 * @param {number} chunkNumber - Chunk number that was just read
 * @param {number} totalChunks - Total number of chunks available
 */
async function saveChunkProgress(dadsLetterKv, sessionId, chunkNumber, totalChunks) {
  if (!dadsLetterKv) return;
  try {
    const key = `chunk-progress:${sessionId}`;
    const progress = {
      lastChunk: chunkNumber,
      totalChunks: totalChunks,
      sessionId: sessionId,
      updatedAt: new Date().toISOString(),
    };
    await dadsLetterKv.put(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving chunk progress to KV:', error);
  }
}

/**
 * Get next chunk number that should be read (sequential)
 * @param {{lastChunk: number, totalChunks: number} | null} progress - Current progress
 * @param {number} totalChunks - Total number of chunks
 * @returns {number} Next chunk number (1-indexed) or 1 if no progress
 */
function getNextChunkNumber(progress, totalChunks) {
  if (!progress || !progress.lastChunk) {
    return 1; // Start with first chunk
  }
  const nextChunk = progress.lastChunk + 1;
  // Don't exceed total chunks
  return Math.min(nextChunk, totalChunks);
}

/**
 * Load letter chunks from KV cache or fetch from JSON file
 * Uses KV namespace DADS_LETTER with key: chunks
 */
async function loadLetterChunks(dadsLetterKv) {
  if (!dadsLetterKv) {
    // If no KV, fetch directly from file
    return await fetchLetterChunksFromFile();
  }

  try {
    // Use 'chunks' as the key in DADS_LETTER namespace
    const cacheKey = 'chunks';
    const cached = await dadsLetterKv.get(cacheKey, 'json');
    
    if (cached && Array.isArray(cached) && cached.length > 0) {
      console.log(`Loaded ${cached.length} letter chunks from KV cache (${cacheKey})`);
      return cached;
    }
    
    // Cache miss - fetch from file and cache
    console.log('Letter chunks not in cache, fetching from file...');
    const chunks = await fetchLetterChunksFromFile();
    
    if (chunks && chunks.length > 0) {
      // Remove duplicates by chunk number before caching
      const uniqueChunks = [];
      const seenChunkNumbers = new Set();
      
      for (const chunk of chunks) {
        if (chunk && typeof chunk === 'object' && typeof chunk.chunk === 'number') {
          if (!seenChunkNumbers.has(chunk.chunk)) {
            seenChunkNumbers.add(chunk.chunk);
            uniqueChunks.push(chunk);
          } else {
            console.warn(`Duplicate chunk number ${chunk.chunk} detected, skipping`);
          }
        }
      }
      
      if (uniqueChunks.length > 0) {
        // Cache indefinitely (no expiration) since letter chunks don't change often
        // Can be manually refreshed by deleting the key
        await dadsLetterKv.put(cacheKey, JSON.stringify(uniqueChunks));
        console.log(`Cached ${uniqueChunks.length} unique letter chunks in KV namespace DADS_LETTER (key: ${cacheKey})`);
        return uniqueChunks;
      }
    }
    
    return chunks;
  } catch (error) {
    console.error('Error loading letter chunks from KV:', error);
    // Fallback to fetching from file
    return await fetchLetterChunksFromFile();
  }
}

/**
 * Fetch letter chunks from the JSON file
 * Exported for use in other functions
 */
export async function fetchLetterChunksFromFile() {
  try {
    // Try to get the origin URL from the request context
    // In Cloudflare Pages/Functions, we can use the request URL
    const baseUrl = 'https://toharper.dad';
    const filePath = '/data/dads_letter.json';
    
    // Try absolute URL first
    let response = await fetch(`${baseUrl}${filePath}`);
    
    if (!response.ok) {
      // Try relative path (for local development or different domains)
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
  } catch {
    return new Response('Bad JSON', { 
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

  const {
    messages = [],
    quotes = [],
    letterChunks = [],
    childrenQuotes = [],
    sessionId = 'default',
    temperature,
    max_tokens,
    useCustomSystemPrompt,
    systemPrompt: providedSystemPrompt,
    parentType = 'dad',
    childName = 'child',
    childAge = 3,
  } = body;

  // Validate messages array
  if (!Array.isArray(messages)) {
    return new Response('messages must be an array', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Validate quotes array
  if (!Array.isArray(quotes)) {
    return new Response('quotes must be an array', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Validate letterChunks array
  if (!Array.isArray(letterChunks)) {
    return new Response('letterChunks must be an array', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Validate message structure
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object' || !msg.role || !msg.content) {
      return new Response('Invalid message structure', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return new Response('Invalid message role', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }
  }
  if (!env.OPENAI_API_KEY) {
    return new Response('Missing OPENAI_API_KEY', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Load letter chunks from KV cache if in letter mode or if chunks are provided
  // Use DADS_LETTER namespace for letter chunks (separate from HARPER_ADVENT for memory)
  let cachedLetterChunks = [];
  if (env.DADS_LETTER && (letterChunks?.length > 0 || useCustomSystemPrompt)) {
    cachedLetterChunks = await loadLetterChunks(env.DADS_LETTER);
  }
  
  // Use provided chunks if available, otherwise use cached chunks
  const finalLetterChunks = (letterChunks && letterChunks.length > 0) ? letterChunks : cachedLetterChunks;
  
  // Detect letter reading mode
  const isLetterMode = finalLetterChunks && finalLetterChunks.length > 0;
  
  // Load chunk progress from DADS_LETTER KV for sequential reading
  let chunkProgress = null;
  const totalChunks = finalLetterChunks?.length || 0;
  if (env.DADS_LETTER && isLetterMode && totalChunks > 0) {
    chunkProgress = await loadChunkProgress(env.DADS_LETTER, sessionId);
  }
  
  // Validate sequential chunk reading if in letter mode
  if (isLetterMode && finalLetterChunks.length > 0 && letterChunks.length > 0) {
    const requestedChunk = letterChunks[0]?.chunk;
    if (requestedChunk !== undefined && typeof requestedChunk === 'number') {
      const expectedNextChunk = getNextChunkNumber(chunkProgress, totalChunks);
      if (requestedChunk !== expectedNextChunk) {
        return new Response(
          JSON.stringify({ 
            error: `Sequential reading required. Expected chunk ${expectedNextChunk}, got ${requestedChunk}`,
            expectedChunk: expectedNextChunk,
            currentProgress: chunkProgress,
          }), 
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  }
  
  // Detect if this is a body generation request (has temperature/max_tokens, but NOT letter mode)
  // Letter mode uses useCustomSystemPrompt but should still stream, so exclude it from body generation
  const isBodyGeneration = !isLetterMode && (temperature !== undefined && max_tokens !== undefined);
  
  // Extract system message from request if it's a body generation request, otherwise use default
  const requestSystemMessage = messages.find((msg) => msg.role === 'system');
  let systemPrompt;
  
  if (isLetterMode) {
    // Letter reading mode: use ASSISTANT_PROMPT with chunk SYSTEM_PROMPT
    let basePrompt = providedSystemPrompt;
    if (!basePrompt) {
      // Render ASSISTANT_PROMPT with parent-specific variables
      const template = getSystemPromptTemplate(parentType);
      const parentTitle = template.name;
      const parentEnergy = parentType === 'mum' ? 'Mum energy—nurturing, warm, comforting' :
                          parentType === 'grandpa' ? 'Grandpa energy—wise, storytelling' :
                          parentType === 'grandma' ? 'Grandma energy—caring, baking' :
                          'Dad energy—steady, warm, protective';
      basePrompt = ASSISTANT_PROMPT
        .replace(/{childName}/g, childName)
        .replace(/{parentTitle}/g, parentTitle)
        .replace(/{parentType}/g, parentType)
        .replace(/{parentEnergy}/g, parentEnergy)
        .replace(/{childAge}/g, childAge.toString());
    }

    // Extract chunk-specific SYSTEM_PROMPT from user message if present
    const userMessages = messages.filter((msg) => msg.role === 'user');
    let chunkStyle = '';
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1].content;
      const systemPromptMatch = lastUserMessage.match(/SYSTEM_PROMPT:\s*(.+?)(?:\n|$)/);
      if (systemPromptMatch && systemPromptMatch[1]) {
        chunkStyle = systemPromptMatch[1].trim();
      }
    }

    // Replace [CHUNK_STYLE] placeholder with chunk SYSTEM_PROMPT (low-token format)
    let letterSystemPrompt = basePrompt.replace('[CHUNK_STYLE]', chunkStyle || 'Speak softly and kindly, like a loving parent talking to their child.');

    // Add children-based quotes to letter mode as well
    const childrenBasedQuotes = quotes.filter((quote) =>
      quote.response_type === 'joy' ||
      quote.response_type === 'Dad and Harper' ||
      quote.response_type === 'calendar_quote'
    );

    if (childrenBasedQuotes.length > 0) {
      const quoteText = childrenBasedQuotes.map((quote) => `- (${quote.response_type}) ${quote.text}`).join('\n');
      letterSystemPrompt = `${letterSystemPrompt}\n\nChildren-based quotes to include (always end your response with one of these):\n${quoteText}`;
    }

    // Add children quotes as loving inspiration
    if (childrenQuotes && childrenQuotes.length > 0) {
      const childrenQuoteText = childrenQuotes.map((cq) => `- "${cq.quote}"`).join('\n');
      letterSystemPrompt = `${letterSystemPrompt}\n\nLoving inspiration quotes (use these as inspiration for your tone and message, but always end with a children-based quote from above):\n${childrenQuoteText}`;
    }

    systemPrompt = letterSystemPrompt;
  } else if (isBodyGeneration && requestSystemMessage) {
    // For body generation, use the system prompt from the request
    // The user message contains the input JSON with title and day
    // The system prompt instructs to output JSON with body field
    systemPrompt = requestSystemMessage.content;
  } else {
    // For regular chat, use the configurable system prompt template
    // Filter quotes to children-based types: "joy", "Dad and Harper", "calendar_quote" (exclude "xmas" for Australia)
    const childrenBasedQuotes = quotes.filter((quote) =>
      quote.response_type === 'joy' ||
      quote.response_type === 'Dad and Harper' ||
      quote.response_type === 'calendar_quote'
    );

    let quoteText = childrenBasedQuotes.map((quote) => `- (${quote.response_type}) ${quote.text}`).join('\n');

    // Get the appropriate system prompt template based on parent type
    const template = getSystemPromptTemplate(parentType);
    const basePrompt = renderSystemPrompt(template, childName, childAge);

    // Add children quotes as loving inspiration
    if (childrenQuotes && childrenQuotes.length > 0) {
      const childrenQuoteText = childrenQuotes.map((cq) => `- "${cq.quote}"`).join('\n');
      if (quoteText) {
        quoteText = `${quoteText}\n\nLoving inspiration quotes (use these as inspiration for your tone and message, but always end with a children-based quote from above):\n${childrenQuoteText}`;
      } else {
        quoteText = `Loving inspiration quotes (use these as inspiration for your tone and message):\n${childrenQuoteText}`;
      }
    }

    systemPrompt = quoteText
      ? `${basePrompt}\n\nChildren-based quotes to include (always end your response with one of these):\n${quoteText}`
      : basePrompt;
  }

  // Load memory from KV if available
  let memory = null;
  if (env.HARPER_ADVENT) {
    memory = await loadMemoryFromKV(env.HARPER_ADVENT, sessionId);
  }

  // Build conversation context with memory
  const conversationMessages = messages.filter((msg) => msg.role !== 'system');
  const contextMessages = buildConversationContext(memory, conversationMessages);

  // Check if streaming is requested (default to true for chat, false for body generation)
  const shouldStream = body.stream !== false && !isBodyGeneration;

  // Determine model: use gpt-5 for body generation, gpt-5-mini for chat
  const model = isBodyGeneration ? 'gpt-5' : 'gpt-5-mini';
  
  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
    ],
    stream: shouldStream,
    // Use provided temperature (default 0.2 for body generation) or fallback to undefined for chat
    ...(temperature !== undefined && { temperature }),
    // Use provided max_tokens (default 150 for body generation) or fallback to undefined for chat
    ...(max_tokens !== undefined && { max_tokens }),
  };

  // Check cache for existing response (only for non-streaming, non-letter mode)
  let cachedResponse = null;
  let cacheKey = null;
  if (!shouldStream && !isLetterMode) {
    cacheKey = generateCacheKey(payload.messages, model);
    cachedResponse = await getCachedResponse(env, cacheKey);
  }

  let response;
  let tokensUsed = null;
  let responseTime = null;
  const startTime = Date.now();

  if (cachedResponse) {
    // Use cached response
    console.log('Using cached LLM response');
    response = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: cachedResponse.response } }],
        usage: { total_tokens: cachedResponse.tokensUsed || 0 }
      })
    };
    tokensUsed = cachedResponse.tokensUsed;
    responseTime = 0; // Cached response is instant
  } else {
    // Make API call
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    responseTime = Date.now() - startTime;
  }

  if (!response.ok) {
    const text = await response.text();

    // Log failed LLM usage
    if (!cachedResponse) {
      await logLLMUsage(env, {
        parent_uuid: null, // We don't have parent UUID in this context
        child_uuid: null,
        model,
        operation_type: isLetterMode ? 'chat' : (isBodyGeneration ? 'content_generation' : 'chat'),
        tokens_prompt: 0,
        tokens_completion: 0,
        response_time_ms: responseTime,
        success: false,
        error_message: text,
      });
    }

    return new Response(text, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Handle streaming response
  if (shouldStream && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = '';
    let buffer = '';

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (value) {
              buffer += decoder.decode(value, { stream: true });
            }
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                   // Stream complete - clean and send final message
                   fullReply = cleanReply(fullReply);

                   // Apply content moderation
                   const contentType = isLetterMode ? 'chat_message' : (isBodyGeneration ? 'tile_body' : 'chat_message');
                   const moderationResult = moderateContent(fullReply, contentType);

                   // Log moderation result
                   if (moderationResult.approved === false) {
                     console.warn('Content moderation flagged streaming response:', moderationResult.reason);
                     await logModerationResult(env, {
                       ...moderationResult,
                       contentType,
                     }, null); // We don't have parent UUID in this context
                   }

                   // Use moderated content if available, otherwise use original
                   const finalReply = moderationResult.moderatedContent || fullReply;

                   // Cache successful response (only for non-letter mode)
                   if (!cachedResponse && !isLetterMode && tokensUsed) {
                     if (cacheKey) {
                       await setCachedResponse(env, cacheKey, finalReply, tokensUsed);
                     }
                   }

                   // Log successful LLM usage
                   if (!cachedResponse) {
                     await logLLMUsage(env, {
                       parent_uuid: null, // We don't have parent UUID in this context
                       child_uuid: null,
                       model,
                       operation_type: isLetterMode ? 'chat' : (isBodyGeneration ? 'content_generation' : 'chat'),
                       tokens_prompt: 0, // We don't have token breakdown for streaming
                       tokens_completion: tokensUsed || 0,
                       response_time_ms: responseTime,
                       success: true,
                     });
                   }

                   // Update memory with final reply
                   if (env.HARPER_ADVENT) {
                     const newMessages = [
                       ...conversationMessages,
                       { role: 'assistant', content: finalReply },
                     ];
                     const updatedMemory = updateMemory(memory, newMessages);
                     await saveMemoryToKV(env.HARPER_ADVENT, sessionId, updatedMemory);
                   }
                  
                  // Update chunk progress if in letter mode
                  let updatedProgress = null;
                  if (isLetterMode && env.DADS_LETTER && finalLetterChunks.length > 0 && letterChunks.length > 0) {
                    const readChunk = letterChunks[0]?.chunk;
                    if (readChunk !== undefined && typeof readChunk === 'number') {
                      await saveChunkProgress(env.DADS_LETTER, sessionId, readChunk, totalChunks);
                      updatedProgress = { lastChunk: readChunk, totalChunks: totalChunks };
                    }
                  }
                  
                   controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, reply: finalReply, chunkProgress: updatedProgress || (chunkProgress ? { lastChunk: chunkProgress.lastChunk, totalChunks: totalChunks } : null) })}\n\n`));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  // Handle OpenAI streaming format
                  const delta = parsed.choices?.[0]?.delta?.content;
                  const finishReason = parsed.choices?.[0]?.finish_reason;
                  
                  if (delta) {
                    fullReply += delta;
                    // Clean and send each chunk as it arrives
                    const cleanedReply = cleanReply(fullReply);
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk: delta, reply: cleanedReply })}\n\n`));
                  }
                  
                  // Handle finish reason
                  if (finishReason) {
                    fullReply = cleanReply(fullReply);
                    
                     // Update memory with final reply
                     if (env.HARPER_ADVENT) {
                       const newMessages = [
                         ...conversationMessages,
                         { role: 'assistant', content: finalReply },
                       ];
                       const updatedMemory = updateMemory(memory, newMessages);
                       await saveMemoryToKV(env.HARPER_ADVENT, sessionId, updatedMemory);
                     }
                    
                    // Update chunk progress if in letter mode
                    if (isLetterMode && env.DADS_LETTER && finalLetterChunks.length > 0 && letterChunks.length > 0) {
                      const readChunk = letterChunks[0]?.chunk;
                      if (readChunk !== undefined && typeof readChunk === 'number') {
                        await saveChunkProgress(env.DADS_LETTER, sessionId, readChunk, totalChunks);
                      }
                    }
                    
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, reply: fullReply, chunkProgress: chunkProgress ? { lastChunk: chunkProgress.lastChunk, totalChunks: totalChunks } : null })}\n\n`));
                    controller.close();
                    return;
                  }
                } catch (e) {
                  // Skip invalid JSON lines (like empty data: lines)
                  if (data !== '') {
                    console.warn('Failed to parse SSE data:', data.substring(0, 100));
                  }
                }
              }
            }
            
            // If stream is done, process any remaining buffer and send final message
            if (done) {
              // Process any remaining buffer
              if (buffer.trim()) {
                const lines = buffer.split('\n');
                for (const line of lines) {
                  if (line.trim() && line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data !== '[DONE]') {
                      try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content;
                        if (delta) {
                          fullReply += delta;
                        }
                      } catch (e) {
                        // Ignore parse errors for final buffer
                      }
                    }
                  }
                }
              }
              
              // Send final cleaned reply
              fullReply = cleanReply(fullReply);
              
              // Update memory with final reply
              if (env.HARPER_ADVENT) {
                const newMessages = [
                  ...conversationMessages,
                  { role: 'assistant', content: fullReply },
                ];
                const updatedMemory = updateMemory(memory, newMessages);
                await saveMemoryToKV(env.HARPER_ADVENT, sessionId, updatedMemory);
              }
              
              // Update chunk progress if in letter mode
              if (isLetterMode && env.DADS_LETTER && finalLetterChunks.length > 0 && letterChunks.length > 0) {
                const readChunk = letterChunks[0]?.chunk;
                if (readChunk !== undefined && typeof readChunk === 'number') {
                  await saveChunkProgress(env.DADS_LETTER, sessionId, readChunk, totalChunks);
                }
              }
              
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, reply: fullReply, chunkProgress: chunkProgress ? { lastChunk: chunkProgress.lastChunk, totalChunks: totalChunks } : null })}\n\n`));
              controller.close();
              return;
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Non-streaming response (for body generation)
  const data = await response.json();
  let reply = data.choices?.[0]?.message?.content ?? '';
  reply = cleanReply(reply);

  // Apply content moderation
  const contentType = isLetterMode ? 'chat_message' : (isBodyGeneration ? 'tile_body' : 'chat_message');
  const moderationResult = moderateContent(reply, contentType);

  // Log moderation result
  if (moderationResult.approved === false) {
    console.warn('Content moderation flagged response:', moderationResult.reason);
    await logModerationResult(env, {
      ...moderationResult,
      contentType,
    }, null); // We don't have parent UUID in this context
  }

  // Use moderated content if available, otherwise use original
  const finalReply = moderationResult.moderatedContent || reply;

  // Cache successful response (only for non-letter mode)
  if (!cachedResponse && !isLetterMode && data.usage) {
    tokensUsed = data.usage.total_tokens;
    if (cacheKey) {
      await setCachedResponse(env, cacheKey, finalReply, tokensUsed);
    }
  }

  // Log successful LLM usage
  if (!cachedResponse && data.usage) {
    await logLLMUsage(env, {
      parent_uuid: null, // We don't have parent UUID in this context
      child_uuid: null,
      model,
      operation_type: isLetterMode ? 'chat' : (isBodyGeneration ? 'content_generation' : 'chat'),
      tokens_prompt: data.usage.prompt_tokens || 0,
      tokens_completion: data.usage.completion_tokens || 0,
      response_time_ms: responseTime,
      success: true,
    });
  }

  // Update memory with new conversation
  if (env.HARPER_ADVENT) {
    const newMessages = [
      ...conversationMessages,
      { role: 'assistant', content: finalReply },
    ];
    const updatedMemory = updateMemory(memory, newMessages);
    await saveMemoryToKV(env.HARPER_ADVENT, sessionId, updatedMemory);
  }

  // Update chunk progress if in letter mode (for non-streaming body generation, this won't apply)
  let updatedProgress = null;
  if (isLetterMode && env.DADS_LETTER && finalLetterChunks.length > 0 && letterChunks.length > 0) {
    const readChunk = letterChunks[0]?.chunk;
    if (readChunk !== undefined && typeof readChunk === 'number') {
      await saveChunkProgress(env.DADS_LETTER, sessionId, readChunk, totalChunks);
      updatedProgress = { lastChunk: readChunk, totalChunks: totalChunks };
    }
  }

  return new Response(JSON.stringify({ reply: finalReply, chunkProgress: updatedProgress || (chunkProgress ? { lastChunk: chunkProgress.lastChunk, totalChunks: totalChunks } : null) }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Clean reply text by removing system prompts, hints, topics, and separators
 */
function cleanReply(reply) {
  if (!reply || typeof reply !== 'string') return '';
  
  let cleaned = reply;
  
  // Remove repetitive greeting pattern: "Hello, my sweet Harper — Daddy says hello and smiles!"
  // Also catch variations like "Hello, my sweet Harper", "Hello sweet Harper", etc.
  cleaned = cleaned.replace(/^Hello,?\s+my\s+sweet\s+Harper[^.!?]*[.!?]?\s*/gi, '');
  cleaned = cleaned.replace(/^Hello\s+sweet\s+Harper[^.!?]*[.!?]?\s*/gi, '');
  cleaned = cleaned.replace(/^Hello,?\s+Harper[^.!?]*[.!?]?\s*/gi, '');
  cleaned = cleaned.replace(/Daddy\s+says\s+hello\s+and\s+smiles[^.!?]*[.!?]?\s*/gi, '');
  
  // Remove SYSTEM_PROMPT: [anything] pattern at the start (most aggressive)
  // Matches "SYSTEM_PROMPT: " or "SYSTEM PROMPT: " followed by any text until newline or end
  cleaned = cleaned.replace(/^SYSTEM\s*PROMPT\s*:?\s*[^\n]*(?:\n|$)/im, '');
  
  // Remove SYSTEM_PROMPT: [anything] pattern anywhere in the text (including with braces)
  cleaned = cleaned.replace(/SYSTEM\s*PROMPT\s*:?\s*\{?[^}]*\}?\s*[^\n]*(?:\n|$)/gim, '');
  
  // Remove interaction_hint: or interaction hint: lines (entire line including label)
  cleaned = cleaned.replace(/^interaction\s*hint\s*:?\s*[^\n]*(?:\n|$)/gim, '');
  
  // Remove topics: or Topics: lines (entire line including label)
  cleaned = cleaned.replace(/^topics?\s*:?\s*[^\n]*(?:\n|$)/gim, '');
  
  // Remove separator lines (----, ---, ===, etc.) that might be on their own line
  cleaned = cleaned.replace(/^[-=]{2,}\s*$/gm, '');
  
  // Remove any remaining "SYSTEM_PROMPT" text anywhere (case insensitive)
  cleaned = cleaned.replace(/SYSTEM\s*PROMPT\s*:?\s*/gi, '');
  
  // Clean up multiple consecutive newlines (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Remove any remaining leading/trailing whitespace and newlines
  cleaned = cleaned.trim();
  
  return cleaned;
}

