import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');

// Determine API endpoint - check environment or default to production
const API_BASE = process.env.VITE_CHAT_API_URL || process.env.CHAT_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'https://toharper.dad');
const CHAT_ENDPOINT = API_BASE 
  ? `${API_BASE.replace(/\/$/, '')}/api/chat-with-daddy`
  : '/api/chat-with-daddy';

/**
 * Famous Christmas songs with 3-line poem adaptations
 * Each song has a simple, toddler-friendly 3-line version
 */
const CHRISTMAS_SONGS = {
  'Jingle Bells': {
    lines: [
      'Jingle bells, jingle bells,',
      'All the way you make me smile!',
      'Oh what fun it is to see you play today!'
    ]
  },
  'Silent Night': {
    lines: [
      'Silent night, peaceful night,',
      'All is calm, you are bright.',
      'Sleep in heavenly peace, my little light.'
    ]
  },
  'Rudolph': {
    lines: [
      'Rudolph with your nose so bright,',
      'Won\'t you guide my heart tonight?',
      'You shine like stars, so warm and right!'
    ]
  },
  'Frosty': {
    lines: [
      'Frosty the snowman, happy and free,',
      'Laughing and playing, just like you and me!',
      'You bring so much joy, for all to see!'
    ]
  },
  'Deck the Halls': {
    lines: [
      'Deck the halls with boughs of holly,',
      'Fa la la la la, you make me jolly!',
      'Tis the season to be happy, my sweetie!'
    ]
  },
  'We Wish You a Merry Christmas': {
    lines: [
      'We wish you a merry Christmas,',
      'We wish you a merry Christmas,',
      'And a happy new year, my dear!'
    ]
  },
  'Santa Claus is Coming to Town': {
    lines: [
      'You better watch out, you better not cry,',
      'Santa Claus is coming, flying in the sky!',
      'He brings love and joy, as you grow so high!'
    ]
  },
  'White Christmas': {
    lines: [
      'I\'m dreaming of a white Christmas,',
      'Just like the ones I used to know,',
      'Where you play in the snow, and love continues to grow!'
    ]
  },
  'Let It Snow': {
    lines: [
      'Oh the weather outside is frightful,',
      'But you make it so delightful!',
      'Let it snow, let it snow, let it snow!'
    ]
  },
  'The Twelve Days of Christmas': {
    lines: [
      'On the first day of Christmas,',
      'My true love gave to me,',
      'A heart full of joy, just for you and me!'
    ]
  },
  'Joy to the World': {
    lines: [
      'Joy to the world, the Lord is come!',
      'Let earth receive her King,',
      'And you bring joy to everything!'
    ]
  },
  'O Christmas Tree': {
    lines: [
      'O Christmas tree, O Christmas tree,',
      'How lovely are your branches!',
      'You light up my heart, with all your chances!'
    ]
  },
  'Away in a Manger': {
    lines: [
      'Away in a manger, no crib for a bed,',
      'The little Lord Jesus laid down his sweet head.',
      'You are my little star, safe in my heart instead!'
    ]
  },
  'Hark! The Herald Angels Sing': {
    lines: [
      'Hark! The herald angels sing,',
      'Glory to the newborn King!',
      'Peace on earth, and joy you bring!'
    ]
  },
  'O Holy Night': {
    lines: [
      'O holy night, the stars are brightly shining,',
      'It is the night of our dear Savior\'s birth.',
      'You are my light, my reason for living!'
    ]
  }
};

/**
 * Select an appropriate Christmas song based on the Title
 */
function selectChristmasSong(title) {
  const titleLower = title.toLowerCase();
  
  // Match keywords to songs
  if (titleLower.includes('excited') || titleLower.includes('happy') || titleLower.includes('joy') || titleLower.includes('smile')) {
    return 'Joy to the World';
  }
  if (titleLower.includes('night') || titleLower.includes('sleep') || titleLower.includes('calm') || titleLower.includes('peace')) {
    return 'Silent Night';
  }
  if (titleLower.includes('snow') || titleLower.includes('winter') || titleLower.includes('cold')) {
    return 'Let It Snow';
  }
  if (titleLower.includes('tree') || titleLower.includes('lights') || titleLower.includes('decorate')) {
    return 'O Christmas Tree';
  }
  if (titleLower.includes('santa') || titleLower.includes('presents') || titleLower.includes('gifts')) {
    return 'Santa Claus is Coming to Town';
  }
  if (titleLower.includes('play') || titleLower.includes('fun') || titleLower.includes('laugh')) {
    return 'Jingle Bells';
  }
  if (titleLower.includes('star') || titleLower.includes('bright') || titleLower.includes('shine')) {
    return 'Rudolph';
  }
  if (titleLower.includes('heart') || titleLower.includes('love') || titleLower.includes('daddy')) {
    return 'We Wish You a Merry Christmas';
  }
  if (titleLower.includes('count') || titleLower.includes('number') || titleLower.includes('days')) {
    return 'The Twelve Days of Christmas';
  }
  if (titleLower.includes('watch') || titleLower.includes('see') || titleLower.includes('look')) {
    return 'Frosty';
  }
  
  // Default to a warm, loving song
  return 'We Wish You a Merry Christmas';
}

/**
 * System prompt for generating Christmas song poems
 */
const POEM_SYSTEM_PROMPT = `You are Harper's Daddy: a masculine, caring, and deeply loving Father writing for his 3-year-old daughter Harper.

Create a 3-line poem based on a famous Christmas song. The poem must:
- Be exactly 3 lines
- Be based on a famous Christmas song (Jingle Bells, Silent Night, Rudolph, Frosty, Deck the Halls, Joy to the World, etc.)
- Include "Harper" or reference to a "3-year-old girl" or "little girl" to maximize engagement
- Be suitable for a 3-year-old (simple words, easy to read)
- Be relevant to the provided Title
- Be short, sharp, and filled with Dad energy - masculine, caring, loving, protective
- Connect the Christmas song theme to the memory in the Title

Format: Write exactly 3 lines, each on a new line. Make it personal, warm, and filled with love.`;

/**
 * Generate a 3-line Christmas poem using GPT-5 via the chat API
 */
async function generateChristmasPoem(title, dayNumber) {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required to generate poem');
  }

  // Create unique session ID for each request
  const uniqueSessionId = `christmas-poem-${Date.now()}-${Math.random().toString(36).substring(7)}-day-${dayNumber || 'unknown'}`;

  const messages = [
    { role: 'system', content: POEM_SYSTEM_PROMPT },
    { 
      role: 'user', 
      content: `Create a 3-line Christmas song poem for this memory:\n\nTitle: ${title}\n\nMake sure to include "Harper" or reference to a "3-year-old girl" or "little girl" in the poem. Base it on a famous Christmas song and make it relevant to this memory.` 
    },
  ];

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: POEM_SYSTEM_PROMPT,
        messages,
        quotes: [],
        sessionId: uniqueSessionId,
        max_completion_tokens: 150, // Keep it short for 3 lines
        useCustomSystemPrompt: true,
        stream: false, // Force non-streaming JSON response
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
    if (typeof reply !== 'string') {
      throw new Error(`Invalid reply format: expected string, got ${typeof reply}. Response: ${JSON.stringify(data).substring(0, 200)}`);
    }
    
    // Clean up the reply - ensure it's exactly 3 lines
    const lines = reply
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 3); // Take first 3 non-empty lines
    
    if (lines.length < 3) {
      // If we don't have 3 lines, pad with a simple closing
      while (lines.length < 3) {
        lines.push('Merry Christmas, my sweet Harper!');
      }
    }
    
    return lines.join('\n').trim();
  } catch (error) {
    throw new Error(`Failed to generate poem: ${error.message}`);
  }
}

/**
 * Process all JSON files and update Body fields
 */
async function updateAllBodies() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('_compressed.json')
  );
  
  console.log(`Found ${jsonFiles.length} JSON files to update`);
  
  const results = [];
  
  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);
    
    try {
      // Read existing JSON
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);
      
      const title = data.Title || data.title || '';
      if (!title) {
        console.warn(`⚠️  Skipping ${jsonFile.name}: No Title field`);
        results.push({ file: jsonFile.name, success: false, reason: 'No Title' });
        continue;
      }
      
      // Generate 3-line poem using GPT-5
      console.log(`  Generating poem for: "${title.substring(0, 50)}..."`);
      const newBody = await generateChristmasPoem(title, data.day || null);
      
      // Update Body field
      data.Body = newBody;
      
      // Update timestamp
      data.body_timestamp = Date.now();
      
      // Write back to file
      await writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      
      console.log(`✓ Updated ${jsonFile.name}`);
      console.log(`  Poem: ${newBody.split('\n').join(' | ')}`);
      results.push({ 
        file: jsonFile.name, 
        success: true,
        body: newBody
      });
      
    } catch (error) {
      console.error(`✗ Error processing ${jsonFile.name}:`, error.message);
      results.push({ file: jsonFile.name, success: false, error: error.message });
    }
  }
  
  console.log(`\n📊 Summary:`);
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  console.log(`  ✓ Successfully updated: ${successful.length}`);
  if (failed.length > 0) {
    console.log(`  ✗ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`    - ${r.file}: ${r.reason || r.error}`));
  }
  
  return { successful, failed };
}

// Run the script
updateAllBodies()
  .then(({ successful, failed }) => {
    if (failed.length > 0) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

