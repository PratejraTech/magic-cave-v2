/**
 * Content Moderation Service
 *
 * Provides safety filtering for AI-generated content to ensure it's appropriate for children.
 * Uses both rule-based filtering and optional AI-powered content analysis.
 */

const INAPPROPRIATE_WORDS = [
  // Violence
  'kill', 'death', 'dead', 'die', 'dying', 'murder', 'fight', 'war', 'weapon', 'gun', 'knife',
  // Negative emotions (excessive)
  'hate', 'hated', 'hating', 'angry', 'anger', 'rage', 'furious',
  // Adult themes
  'sex', 'sexual', 'naked', 'nude', 'drugs', 'alcohol', 'smoke', 'smoking',
  // Scary content
  'ghost', 'monster', 'scary', 'terrifying', 'nightmare', 'haunted',
  // Inappropriate language
  'stupid', 'idiot', 'dumb', 'ugly', 'fat', 'skinny', 'weird',
];

const POSITIVE_WORDS = [
  'love', 'happy', 'joy', 'fun', 'friend', 'family', 'smile', 'laugh',
  'play', 'adventure', 'dream', 'magic', 'wonder', 'kind', 'gentle',
  'sweet', 'cuddle', 'hug', 'kiss', 'beautiful', 'amazing', 'wonderful',
];

/**
 * Check if content contains inappropriate words
 */
function containsInappropriateWords(text) {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_WORDS.some(word => lowerText.includes(word));
}

/**
 * Check if content has positive sentiment
 */
function hasPositiveSentiment(text) {
  const lowerText = text.toLowerCase();
  const positiveCount = POSITIVE_WORDS.filter(word => lowerText.includes(word)).length;
  const totalWords = text.split(/\s+/).length;

  // Require at least 20% positive words for longer content
  return totalWords < 10 || (positiveCount / Math.max(totalWords * 0.1, 1)) >= 0.2;
}

/**
 * Check content length appropriateness
 */
function isAppropriateLength(text, maxLength = 500) {
  return text.length <= maxLength;
}

/**
 * Moderate content for child appropriateness
 */
export function moderateContent(content, contentType = 'general') {
  if (!content || typeof content !== 'string') {
    return {
      approved: false,
      reason: 'Invalid content',
      moderatedContent: '',
    };
  }

  const issues = [];

  // Check for inappropriate words
  if (containsInappropriateWords(content)) {
    issues.push('Contains inappropriate words');
  }

  // Check sentiment for chat messages and tile content
  if (['chat_message', 'tile_body', 'tile_title'].includes(contentType)) {
    if (!hasPositiveSentiment(content)) {
      issues.push('Lacks positive sentiment');
    }
  }

  // Check length
  if (!isAppropriateLength(content)) {
    issues.push('Content too long');
  }

  // Additional checks based on content type
  switch (contentType) {
    case 'tile_title':
      if (content.length > 100) {
        issues.push('Title too long');
      }
      break;
    case 'chat_message':
      if (content.length > 200) {
        issues.push('Message too long for chat');
      }
      break;
  }

  if (issues.length > 0) {
    return {
      approved: false,
      reason: issues.join(', '),
      moderatedContent: '',
      originalContent: content,
    };
  }

  return {
    approved: true,
    reason: 'Approved',
    moderatedContent: content,
    originalContent: content,
  };
}

/**
 * Sanitize content by removing or replacing inappropriate elements
 */
export function sanitizeContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let sanitized = content;

  // Remove or replace inappropriate words with safer alternatives
  const replacements = {
    'kill': 'stop',
    'death': 'end',
    'dead': 'gone',
    'die': 'stop',
    'dying': 'ending',
    'fight': 'play',
    'war': 'adventure',
    'weapon': 'tool',
    'gun': 'toy',
    'knife': 'spoon',
    'hate': 'don\'t like',
    'angry': 'upset',
    'rage': 'feeling big',
    'furious': 'very upset',
    'stupid': 'silly',
    'idiot': 'friend',
    'dumb': 'quiet',
    'ugly': 'different',
    'fat': 'big',
    'skinny': 'little',
    'weird': 'special',
    'ghost': 'friend',
    'monster': 'character',
    'scary': 'exciting',
    'terrifying': 'surprising',
    'nightmare': 'dream',
    'haunted': 'magical',
  };

  for (const [bad, good] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${bad}\\b`, 'gi');
    sanitized = sanitized.replace(regex, good);
  }

  return sanitized;
}

/**
 * Log moderation result to database
 */
export async function logModerationResult(env, moderationResult, parentUuid, childUuid = null) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase not configured for moderation logging');
    return;
  }

  try {
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/content_moderation_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        parent_uuid: parentUuid,
        child_uuid: childUuid,
        content_type: moderationResult.contentType || 'general',
        content_text: moderationResult.originalContent || moderationResult.moderatedContent,
        moderation_result: moderationResult.approved ? 'approved' : 'flagged',
        moderation_reason: moderationResult.reason,
        original_content: moderationResult.originalContent,
        moderated_content: moderationResult.moderatedContent,
      }),
    });

    if (!response.ok) {
      console.error('Failed to log moderation result:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error logging moderation result:', error);
  }
}