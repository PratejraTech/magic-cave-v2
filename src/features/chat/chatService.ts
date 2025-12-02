export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

export interface DaddyQuote {
  response_id: number;
  response_type: string;
  text: string;
}

export interface ChildrenQuote {
  id: number;
  quote: string;
  used: boolean;
  use_count: number;
}

export interface LetterChunk {
  chunk: number;
  topics: string[];
  last_used: boolean;
  times_used: number;
  reuse_day: number;
  interaction_hint: string;
  SYSTEM_PROMPT: string;
  content: string;
}

export interface ChatResponse {
  reply: string;
  chunkProgress?: {
    lastChunk: number;
    totalChunks: number;
  } | null;
}

export interface ChunkProgress {
  lastChunk: number;
  totalChunks: number;
  sessionId?: string;
  updatedAt?: string;
}

const CHAT_STORAGE_KEY = 'chat-with-daddy';
const SESSION_STORAGE_KEY = 'chat-with-daddy-session-id';

const env = import.meta.env as Record<string, string | boolean | undefined>;
// In production, use relative URL (empty string). In dev, use localhost if VITE_CHAT_API_URL not set
const API_BASE =
  env.VITE_CHAT_API_URL?.toString() ||
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

const QUOTE_ENDPOINT = '/data/daddy-quotes.json';
const CHILDREN_QUOTES_ENDPOINT = '/data/quotes_children.json';
const LETTER_ENDPOINT = '/data/dads_letter.json';
// Ensure endpoint doesn't have double slashes
const CHAT_ENDPOINT = API_BASE 
  ? `${API_BASE.replace(/\/$/, '')}/api/chat-with-daddy`
  : '/api/chat-with-daddy';
const CHAT_SESSION_ENDPOINT = API_BASE
  ? `${API_BASE.replace(/\/$/, '')}/api/chat-sessions`
  : '/api/chat-sessions';

export const loadStoredMessages = (): ChatMessage[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return parsed.slice(-5);
  } catch {
    return [];
  }
};

export const persistMessages = (messages: ChatMessage[]) => {
  if (typeof window === 'undefined') return;
  try {
    const last5 = messages.slice(-5);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(last5));
    // Sync to cookies for persistence across deployments
    import('../../lib/cookieStorage').then(({ setRecentChatInfo }) => {
      setRecentChatInfo(last5.map((m) => ({ role: m.role, content: m.content })));
    }).catch(() => {
      // ignore cookie sync failures
    });
  } catch {
    // ignore storage failures
  }
};

export const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  // Use cookie-based session ID for consistency with main app
  try {
    // Dynamic import to avoid circular dependencies
    const cookieStorage = require('../../lib/cookieStorage');
    return cookieStorage.getOrCreateSession();
  } catch {
    // Fallback to localStorage if cookieStorage not available
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    return newId;
  }
};

export const resetSessionId = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const fetchDaddyQuotes = async (): Promise<DaddyQuote[]> => {
  try {
    const response = await fetch(QUOTE_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Failed to load daddy quotes: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as DaddyQuote[];
  } catch (error) {
    console.error('Error fetching daddy quotes:', error);
    // Return fallback quote to ensure chat still works
    return [
      {
        response_id: 0,
        response_type: 'fallback',
        text: 'Daddy loves you to the moon marshmallow and back!',
      },
    ];
  }
};

/**
 * Fetches children quotes from quotes_children.json
 * These are used as loving inspiration in chat responses
 * @returns Array of children quotes or empty array on error
 */
export const fetchChildrenQuotes = async (): Promise<ChildrenQuote[]> => {
  try {
    const response = await fetch(CHILDREN_QUOTES_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Failed to load children quotes: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as ChildrenQuote[];
  } catch (error) {
    console.error('Error fetching children quotes:', error);
    return [];
  }
};

/**
 * Fetches letter chunks from dads_letter.json
 * @returns Array of letter chunks or empty array on error
 */
export const fetchDadsLetter = async (): Promise<LetterChunk[]> => {
  try {
    const response = await fetch(LETTER_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Failed to load dad's letter: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as LetterChunk[];
  } catch (error) {
    console.error('Error fetching dad\'s letter:', error);
    // Return empty array on error - component should handle gracefully
    return [];
  }
};

/**
 * Request a streaming response from Daddy
 * @param messages - Chat messages
 * @param quotes - Daddy quotes (for non-letter mode)
 * @param sessionOverride - Optional session ID override
 * @param letterChunks - Letter chunks (for letter reading mode)
 * @param childrenQuotes - Children quotes for loving inspiration
 * @param onChunk - Callback for each streamed chunk
 * @param onProgress - Callback for chunk progress updates
 * @returns Promise that resolves with the full reply
 */
export const requestDaddyResponse = async (
  messages: ChatMessage[],
  quotes: DaddyQuote[],
  sessionOverride?: string,
  letterChunks?: LetterChunk[],
  childrenQuotes?: ChildrenQuote[],
  onChunk?: (chunk: string, fullReply: string) => void,
  onProgress?: (progress: { lastChunk: number; totalChunks: number }) => void
): Promise<string> => {
  const endpoint = CHAT_ENDPOINT;
  const payload: {
    messages: ChatMessage[];
    quotes?: DaddyQuote[];
    letterChunks?: LetterChunk[];
    sessionId: string;
    useCustomSystemPrompt?: boolean;
    systemPrompt?: string;
    stream?: boolean;
  } = {
    messages,
    sessionId: sessionOverride ?? getSessionId(),
    stream: onChunk !== undefined, // Enable streaming if callback provided
  };

  // Include letterChunks if provided (letter reading mode)
  if (letterChunks && letterChunks.length > 0) {
    payload.letterChunks = letterChunks;
    payload.useCustomSystemPrompt = true;
    // Don't pass systemPrompt - let API use ASSISTANT_PROMPT which efficiently incorporates chunk SYSTEM_PROMPT
  }
  
  // Always include quotes (filtered to children-based in API) for both regular chat and letter mode
  // Filter quotes to children-based types on client side as well
  const childrenBasedQuotes = quotes.filter((quote) => 
    quote.response_type === 'joy' || 
    quote.response_type === 'Dad and Harper' || 
    quote.response_type === 'calendar_quote'
  );
  
  if (childrenBasedQuotes.length > 0) {
    payload.quotes = childrenBasedQuotes;
  }
  
  // Include children quotes for loving inspiration
  if (childrenQuotes && childrenQuotes.length > 0) {
    payload.childrenQuotes = childrenQuotes;
  }

  console.log('Sending chat request to:', endpoint);
  console.log('Streaming:', payload.stream ? 'enabled' : 'disabled');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Chat API error:', response.status, errorText);
      
      if (response.status === 405) {
        throw new Error(`Chat service unavailable: Method not allowed (405). Endpoint: ${endpoint}. Please check that the Cloudflare Function is deployed correctly.`);
      }
      
      throw new Error(`Chat service unavailable: ${response.status} ${errorText}`);
    }

    // Handle streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';
      let buffer = '';

      if (!reader) {
        throw new Error('Stream reader not available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return fullReply;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle completion
              if (parsed.done) {
                // Store chunk progress if provided
                if (parsed.chunkProgress && onProgress) {
                  onProgress(parsed.chunkProgress);
                }
                return parsed.reply || fullReply;
              }
              
              // Handle streaming chunks - update fullReply and call onChunk callback
              if (parsed.reply !== undefined) {
                fullReply = parsed.reply;
                // Call onChunk with the delta chunk if available, otherwise pass empty string
                if (onChunk) {
                  onChunk(parsed.chunk || '', fullReply);
                }
              }
            } catch (e) {
              // Skip invalid JSON (like empty data: lines)
              if (data !== '') {
                console.warn('Failed to parse SSE data:', data.substring(0, 100));
              }
            }
          }
        }
      }

      return fullReply;
    }

    // Non-streaming response
    const data = (await response.json()) as ChatResponse;
    console.log('Chat response received:', data.reply?.substring(0, 50) + '...');
    // Update chunk progress if provided
    if (data.chunkProgress && onProgress) {
      onProgress(data.chunkProgress);
    }
    return data.reply;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to reach chat service at ${endpoint}. Please check your connection.`);
    }
    throw error;
  }
};

let daddyQuotesCache: DaddyQuote[] | null = null;

// SUBTITLE_SYSTEM_PROMPT removed - using SYSTEM_PROMPT instead for subtitle generation

const SUBTITLE_CACHE_KEY = 'modal-subtitles';
const subtitleCache = new Map<string, string>();
let subtitleCallCounter = 0;

const loadSubtitleCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SUBTITLE_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    Object.entries(parsed).forEach(([key, value]) => subtitleCache.set(key, value));
  } catch {
    // ignore
  }
};

const persistSubtitleCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj = Object.fromEntries(subtitleCache.entries());
    localStorage.setItem(SUBTITLE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
};

loadSubtitleCache();

export const generateModalSubtitle = async (title: string): Promise<string> => {
  const normalizedTitle = title.trim().toLowerCase();
  if (subtitleCache.has(normalizedTitle)) {
    return subtitleCache.get(normalizedTitle) as string;
  }

  subtitleCallCounter += 1;
  if (subtitleCallCounter % 2 !== 0 && subtitleCache.size > 0) {
    const cachedSubtitle = subtitleCache.values().next().value;
    if (cachedSubtitle) {
      return cachedSubtitle;
    }
  }

  if (!daddyQuotesCache) {
    daddyQuotesCache = await fetchDaddyQuotes();
  }

  // Use SYSTEM_PROMPT for subtitle generation (short, loving responses)
  const subtitlePrompt = 'You are Daddy. Write a single short, wise, loving sentence for a 3-year-old daughter based on the provided title. Never exceed 15 words.';
  const messages: ChatMessage[] = [
    { role: 'system', content: subtitlePrompt },
    { role: 'user', content: `Title: ${title}` },
  ];

  const reply = await requestDaddyResponse(messages, daddyQuotesCache, 'modal-subtitle');
  subtitleCache.set(normalizedTitle, reply);
  persistSubtitleCache();
  return reply;
};

const BODY_CACHE_KEY = 'modal-body-cache';
const BODY_CACHE_TTL = 1000 * 60 * 60 * 24 * 2;
type BodyCacheEntry = { body: string; timestamp: number };
const bodyCache = new Map<string, BodyCacheEntry>();

const loadBodyCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(BODY_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, BodyCacheEntry>;
    Object.entries(parsed).forEach(([key, value]) => bodyCache.set(key, value));
  } catch {
    // ignore
  }
};

const persistBodyCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj = Object.fromEntries(bodyCache.entries());
    localStorage.setItem(BODY_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
};

loadBodyCache();

const BODY_SYSTEM_PROMPT =
  `You are a gentle, loving father writing short poems for your toddler daughter. Each poem is inspired by the Title field provided as input. The poem must be warm, safe, playful, and age-appropriate. Use language and imagery that a young child can understand and enjoy; emphasise feelings of love, comfort, wonder, curiosity, kindness, and simple everyday moments. Incorporate occasional references to things a young child may love (like butterflies, swings, dogs, backyard adventures, bedtime stories), but never stray into darkness, fear, or complex adult themes. Poems should be short (3 lines), lyrical, rhythmic, and feel like a tender bedtime lullaby or a gentle whisper from Daddy.

When you output, produce only a JSON object with the same fields as the input — preserving "day" (or whatever ID field), and adding or filling "body" with the poem. Do not add any extra keys or metadata. Maintain valid JSON.`;

/**
 * System prompt for letter reading mode.
 * Guides progressive revelation and enrichment of letter chunks from DADS_LETTER KV Namespace.
 * Works for both Harper and Guest sessions, revealing chunks sequentially to build a complete narrative.
 */
export const LETTER_SYSTEM_PROMPT =
  "You are a storyteller reading a letter from Dad to a 3-year-old. The letter is stored in chunks in DADS_LETTER KV Namespace, and you are progressively revealing and enriching each chunk. Each chunk builds upon the previous ones to create a complete, coherent narrative. For both Harper and Guest sessions, reveal the content gradually, making each chunk engaging and age-appropriate. Express love and adoration while maintaining the original content and topics. Each chunk should feel like a natural continuation of the story, building anticipation and connection. Do not repeat greetings or opening phrases—let each chunk flow naturally from the previous one.";

export const generateModalBody = async (id: string, prompt: string): Promise<string> => {
  const cached = bodyCache.get(id);
  const now = Date.now();
  if (cached && now - cached.timestamp < BODY_CACHE_TTL) {
    return cached.body;
  }

  if (!daddyQuotesCache) {
    daddyQuotesCache = await fetchDaddyQuotes();
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: BODY_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  const reply = await requestDaddyResponse(messages, daddyQuotesCache, 'modal-body');
  bodyCache.set(id, { body: reply, timestamp: now });
  persistBodyCache();
  return reply;
};

/**
 * Formats a letter chunk into the user prompt format required by the API
 * @param chunk - The letter chunk to format
 * @returns Formatted prompt string
 */
export const formatLetterChunkPrompt = (chunk: LetterChunk): string => {
  return `SYSTEM_PROMPT: ${chunk.SYSTEM_PROMPT}\n\ninteraction_hint: ${chunk.interaction_hint}\n\ntopics: ${chunk.topics.join(', ')}\n\n----\n\ncontent: ${chunk.content}`;
};

/**
 * Selects a letter chunk based on sequential reading (must read chunks in order)
 * @param letterChunks - Array of available letter chunks (should be sorted by chunk number)
 * @param userInput - User's input message (not used for sequential mode, but kept for API compatibility)
 * @param previousChunks - Array of chunk numbers that have been used recently
 * @param expectedNextChunk - The next chunk number that should be read (for sequential enforcement)
 * @returns Selected chunk or null if no match
 */
export const selectLetterChunk = (
  letterChunks: LetterChunk[],
  userInput: string,
  previousChunks: number[] = [],
  expectedNextChunk?: number
): LetterChunk | null => {
  if (letterChunks.length === 0) return null;

  // Sort chunks by chunk number to ensure sequential order
  const sortedChunks = [...letterChunks].sort((a, b) => a.chunk - b.chunk);

  // If expectedNextChunk is provided, enforce sequential reading
  if (expectedNextChunk !== undefined) {
    const nextChunk = sortedChunks.find((chunk) => chunk.chunk === expectedNextChunk);
    if (nextChunk) {
      return nextChunk;
    }
    // If expected chunk not found, return null (should not happen in normal flow)
    return null;
  }

  // Fallback: return first unused chunk sequentially (for backward compatibility)
  const unusedChunks = sortedChunks.filter((chunk) => !previousChunks.includes(chunk.chunk));
  if (unusedChunks.length > 0) {
    return unusedChunks[0];
  }

  // If all chunks used, return first chunk
  return sortedChunks[0];
};

export const logChatInput = async (message: ChatMessage) => {
  try {
    await fetch(CHAT_SESSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        message,
        sessionId: getSessionId(),
      }),
    });
  } catch {
    // Ignore logging failures to keep UX smooth
  }
};
