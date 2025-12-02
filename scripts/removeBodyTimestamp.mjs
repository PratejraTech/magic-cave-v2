import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');

/**
 * Remove body_timestamp field from all _compressed.json files
 * Restores schema to: {"Title":str, "Subtitle": str, "Body":str, "cache_key":CACHE_KEY, "day": 1-25}
 */
async function removeBodyTimestamp() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('_compressed.json')
  );

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);

    try {
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);

      // Skip if body_timestamp doesn't exist
      if (!data.body_timestamp) {
        skipped++;
        continue;
      }

      // Remove body_timestamp and maintain proper field order
      const cleanedData = {
        Title: data.Title,
        Subtitle: data.Subtitle,
        Body: data.Body,
        cache_key: data.cache_key,
        day: data.day,
      };

      // Remove any undefined values
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });

      await writeFile(jsonPath, JSON.stringify(cleanedData, null, 2), 'utf8');
      console.log(`✓ Removed body_timestamp from ${jsonFile.name}`);
      updated++;
    } catch (error) {
      console.error(`✗ Error processing ${jsonFile.name}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✓ Updated: ${updated} files`);
  console.log(`  ⊘ Skipped: ${skipped} files (no body_timestamp)`);
  if (errors > 0) {
    console.log(`  ✗ Errors: ${errors} files`);
  }
}

removeBodyTimestamp()
  .then(() => {
    console.log('\n✅ Schema restoration complete!');
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

