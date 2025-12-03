import { moderateContent, logModerationResult } from './contentModeration.js';
import { generateCacheKey, getCachedResponse, setCachedResponse, logLLMUsage } from './llmCache.js';

// Simple content library for inspiration (subset for server-side use)
const CONTENT_INSPIRATION = {
  christmas: [
    "The Christmas lights are twinkling just for you!",
    "Santa's workshop is filled with special gifts for wonderful children!",
    "Snowflakes are falling like tiny kisses from the angels!",
    "Your smile makes Christmas even more magical!",
    "The Christmas tree is decorated with love and joy!",
    "Reindeer are practicing their flying for Christmas Eve!",
    "Christmas cookies are baking with extra love and sprinkles!",
    "The North Pole is sending you holiday hugs and kisses!",
    "Christmas magic happens when you believe and love!",
    "Your laughter is the best Christmas carol of all!"
  ],
  encouragement: [
    "You are capable of amazing things - believe in yourself!",
    "Every day is a new opportunity to be your best self!",
    "Your kindness makes the world a better place!",
    "You have unique gifts that only you can share!",
    "Challenges help us grow stronger and wiser!",
    "Your smile lights up everyone's day!",
    "You are loved more than you can imagine!",
    "Your efforts create a better tomorrow!",
    "You have the power to make positive changes!",
    "Your heart is filled with goodness and light!"
  ],
  love: [
    "You are loved beyond measure and cherished beyond words!",
    "My love for you grows stronger with each passing day!",
    "You are the light of my life and the joy of my heart!",
    "I am so proud to be your parent!",
    "Your presence fills my life with happiness and meaning!",
    "You are precious, wonderful, and absolutely irreplaceable!",
    "My love for you is as constant as the stars in the sky!",
    "You make every day brighter just by being yourself!",
    "I love you more than all the treasures in the world!",
    "You are my greatest blessing and my deepest joy!"
  ]
};

// System prompt for tile content generation
const TILE_CONTENT_SYSTEM_PROMPT =
  `You are a loving parent creating personalized advent calendar messages for your child. Create warm, age-appropriate messages that build excitement and connection. Messages should be:

- Age-appropriate for children aged 3-12
- Filled with love, wonder, and holiday magic
- Short and engaging (2-4 sentences)
- Include specific references to the day number and holiday theme
- End with a loving sign-off from the parent

Format: Write only the message content, no additional formatting or metadata.`;

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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

  const {
    tileId,
    day,
    childName = 'child',
    childAge = 3,
    parentType = 'parent',
    theme = 'christmas',
    existingContent = '',
  } = body;

  // Validate required fields
  if (!tileId || !day) {
    return new Response('Missing required fields: tileId, day', {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
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

  try {
    // Get inspiration content based on theme
    const inspirationContent = CONTENT_INSPIRATION[theme] || CONTENT_INSPIRATION.christmas;
    const randomInspirations = inspirationContent
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join('\n- ');

    // Create personalized prompt for content generation
    const userPrompt = `Create a personalized advent calendar message for Day ${day} of Christmas.

Child details:
- Name: ${childName}
- Age: ${childAge}
- Parent type: ${parentType}

Theme: ${theme}
${existingContent ? `Existing content to build upon: ${existingContent}` : ''}

Inspiration examples (use these as creative inspiration, not to copy directly):
- ${randomInspirations}

Make this message special, age-appropriate, and filled with holiday magic!`;

    const messages = [
      { role: 'system', content: TILE_CONTENT_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    // Check cache first
    const cacheKey = generateCacheKey(messages, 'gpt-4o-mini');
    const cachedResponse = await getCachedResponse(env, cacheKey);

    let generatedContent;
    let tokensUsed = null;
    const startTime = Date.now();

    if (cachedResponse) {
      console.log('Using cached tile content');
      generatedContent = cachedResponse.response;
      tokensUsed = cachedResponse.tokensUsed;
    } else {
      // Make API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      generatedContent = data.choices?.[0]?.message?.content?.trim() || '';
      tokensUsed = data.usage?.total_tokens;

      // Cache the response
      if (generatedContent && tokensUsed) {
        await setCachedResponse(env, cacheKey, generatedContent, tokensUsed);
      }
    }

    const responseTime = Date.now() - startTime;

    // Log LLM usage
    if (!cachedResponse && tokensUsed) {
      await logLLMUsage(env, {
        parent_uuid: null,
        child_uuid: null,
        model: 'gpt-4o-mini',
        operation_type: 'content_generation',
        tokens_prompt: 0,
        tokens_completion: tokensUsed,
        response_time_ms: responseTime,
        success: true,
      });
    }

    // Apply content moderation
    const moderationResult = moderateContent(generatedContent, 'tile_body');

    // Log moderation result if flagged
    if (moderationResult.approved === false) {
      console.warn('Content moderation flagged generated tile content:', moderationResult.reason);
      await logModerationResult(env, {
        ...moderationResult,
        contentType: 'tile_body',
      }, null);
    }

    // Use moderated content if available, otherwise use original
    const finalContent = moderationResult.moderatedContent || generatedContent;

    return new Response(JSON.stringify({
      success: true,
      content: finalContent,
      moderated: !!moderationResult.moderatedContent,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Content generation error:', error);

    // Log failed LLM usage
    await logLLMUsage(env, {
      parent_uuid: null,
      child_uuid: null,
      model: 'gpt-4o-mini',
      operation_type: 'content_generation',
      tokens_prompt: 0,
      tokens_completion: 0,
      response_time_ms: 0,
      success: false,
      error_message: error.message,
    });

    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate content',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}