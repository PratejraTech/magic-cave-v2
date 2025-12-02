import { readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const LETTER_JSON_PATH = path.join(ROOT, 'public', 'data', 'dads_letter.json');

/**
 * Cache letter chunks to Cloudflare KV using Wrangler CLI
 * This script reads dads_letter.json and caches all chunks to KV using Wrangler
 * 
 * Usage:
 *   node scripts/cacheLetterChunksWrangler.mjs
 * 
 * Requires:
 *   - Wrangler CLI installed (npx wrangler)
 *   - KV namespace HARPER_ADVENT configured
 *   - Authenticated with Cloudflare (wrangler login)
 */
async function cacheLetterChunksWrangler() {
  try {
    console.log('[cache:letter-chunks:wrangler] Reading letter chunks from file...');
    const fileContent = await readFile(LETTER_JSON_PATH, 'utf8');
    const chunks = JSON.parse(fileContent);

    if (!Array.isArray(chunks)) {
      throw new Error('Letter chunks file does not contain an array');
    }

    if (chunks.length === 0) {
      throw new Error('Letter chunks array is empty');
    }

    console.log(`[cache:letter-chunks:wrangler] Found ${chunks.length} letter chunks`);

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
        `[cache:letter-chunks:wrangler] Warning: ${chunks.length - validChunks.length} invalid chunks found and filtered out`
      );
    }

    if (validChunks.length === 0) {
      throw new Error('No valid letter chunks found after validation');
    }

    console.log(`[cache:letter-chunks:wrangler] Validated ${validChunks.length} chunks`);

    // Check for duplicate chunk numbers
    const chunkNumbers = validChunks.map((c) => c.chunk);
    const duplicates = chunkNumbers.filter((num, index) => chunkNumbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate chunk numbers found: ${[...new Set(duplicates)].join(', ')}`);
    }

    console.log('[cache:letter-chunks:wrangler] No duplicate chunk numbers found ✓');

    // KV namespace for letter chunks (separate from HARPER_ADVENT)
    const kvNamespace = 'DADS_LETTER';
    const kvNamespaceId = '8f354b2c73f6471b896b6b04009667f1'; // Provided namespace ID
    const kvKey = 'chunks'; // Key name in DADS_LETTER namespace

    // Write chunks to a temporary file for wrangler
    const tempFile = path.join(ROOT, '.temp_letter_chunks.json');
    await writeFile(tempFile, JSON.stringify(validChunks, null, 2));

    try {
      console.log(`[cache:letter-chunks:wrangler] Caching to KV namespace: ${kvNamespace}, key: ${kvKey}`);

      // Try different Wrangler command syntaxes
      const commands = [
        // Using namespace ID directly (most reliable)
        `npx wrangler kv key put "${kvKey}" --path=${tempFile} --namespace-id=${kvNamespaceId} --remote`,
        // Using binding name (if configured in wrangler.toml)
        `npx wrangler kv key put "${kvKey}" --path=${tempFile} --binding=${kvNamespace} --remote`,
        // Older syntax with namespace ID
        `npx wrangler kv:key put "${kvKey}" --path=${tempFile} --namespace-id=${kvNamespaceId} --remote`,
        // Older syntax with binding
        `npx wrangler kv:key put "${kvKey}" --path=${tempFile} --binding=${kvNamespace} --remote`,
      ];

      let success = false;
      for (const command of commands) {
        try {
          console.log(`[cache:letter-chunks:wrangler] Trying: ${command}`);
          execSync(command, {
            stdio: 'inherit',
            cwd: ROOT,
            env: { ...process.env },
          });
          console.log(`[cache:letter-chunks:wrangler] ✓ Successfully cached ${validChunks.length} letter chunks to KV`);
          success = true;
          break;
        } catch (cmdError) {
          console.warn(`[cache:letter-chunks:wrangler] Command failed, trying next syntax...`);
          continue;
        }
      }

      if (!success) {
        throw new Error('All Wrangler command syntaxes failed. Please check Wrangler version and KV namespace configuration.');
      }

      // Verify the cache by reading it back
      console.log('[cache:letter-chunks:wrangler] Verifying cache...');
      try {
        const verifyCommands = [
          `npx wrangler kv key get "${kvKey}" --namespace-id=${kvNamespaceId} --remote`,
          `npx wrangler kv key get "${kvKey}" --binding=${kvNamespace} --remote`,
          `npx wrangler kv:key get "${kvKey}" --namespace-id=${kvNamespaceId} --remote`,
          `npx wrangler kv:key get "${kvKey}" --binding=${kvNamespace} --remote`,
        ];

        for (const verifyCmd of verifyCommands) {
          try {
            const verifyOutput = execSync(verifyCmd, {
              encoding: 'utf8',
              cwd: ROOT,
              env: { ...process.env },
            });

            const cachedChunks = JSON.parse(verifyOutput);
            if (Array.isArray(cachedChunks) && cachedChunks.length === validChunks.length) {
              console.log(`[cache:letter-chunks:wrangler] ✓ Verification successful: ${cachedChunks.length} chunks cached`);
              break;
            } else {
              console.warn('[cache:letter-chunks:wrangler] Warning: Verification failed - chunk count mismatch');
            }
          } catch (verifyError) {
            continue;
          }
        }
      } catch (verifyError) {
        console.warn('[cache:letter-chunks:wrangler] Warning: Could not verify cache:', verifyError.message);
      }

      return { success: true, chunksCached: validChunks.length };
    } catch (wranglerError) {
      console.error('[cache:letter-chunks:wrangler] Error writing to KV with Wrangler:', wranglerError.message);
      throw wranglerError;
    } finally {
      // Clean up temp file
      try {
        await unlink(tempFile);
      } catch (cleanupError) {
        console.warn('[cache:letter-chunks:wrangler] Warning: Could not delete temp file:', cleanupError.message);
      }
    }
  } catch (error) {
    console.error('[cache:letter-chunks:wrangler] Fatal error:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure Wrangler is installed: npm install -g wrangler');
    console.error('2. Authenticate with Cloudflare: npx wrangler login');
    console.error(`3. Verify KV namespace DADS_LETTER (ID: ${kvNamespaceId}) exists and is bound`);
    console.error('4. Check Pages project settings → Functions → KV Namespace Bindings');
    console.error('5. Binding name should be: DADS_LETTER');
    process.exit(1);
  }
}

// Run the cache job
cacheLetterChunksWrangler()
  .then((result) => {
    if (result.success) {
      console.log(`[cache:letter-chunks:wrangler] Batch job completed successfully. ${result.chunksCached} chunks cached.`);
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('[cache:letter-chunks:wrangler] Batch job failed:', error);
    process.exit(1);
  });

