import { readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');

async function backfillTimestamps() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('_compressed.json')
  );

  let updated = 0;
  let skipped = 0;

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);
    
    try {
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);
      const fileStats = await stat(jsonPath);

      // Skip if timestamp already exists
      if (data.body_timestamp) {
        skipped++;
        continue;
      }

      // Add timestamp using file modification time (when Body was last written)
      const updatedData = {
        ...data,
        body_timestamp: fileStats.mtimeMs,
      };

      // Maintain field order
      const orderedData = {
        Title: updatedData.Title,
        Subtitle: updatedData.Subtitle,
        Body: updatedData.Body,
        cache_key: updatedData.cache_key,
        day: updatedData.day,
        body_timestamp: updatedData.body_timestamp,
      };

      await writeFile(jsonPath, JSON.stringify(orderedData, null, 2), 'utf8');
      console.log(`[backfill:timestamps] Added timestamp to ${jsonFile.name}`);
      updated++;
    } catch (error) {
      console.error(`[backfill:timestamps] Error processing ${jsonFile.name}: ${error.message}`);
    }
  }

  console.log(`\n[backfill:timestamps] Summary:`);
  console.log(`  Updated: ${updated} files`);
  console.log(`  Skipped: ${skipped} files (already had timestamps)`);
}

backfillTimestamps()
  .catch((error) => {
    console.error('[backfill:timestamps] Fatal error:', error);
    process.exit(1);
  });

