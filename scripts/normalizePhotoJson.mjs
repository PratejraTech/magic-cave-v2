import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');

/**
 * Normalize all JSON files to ensure consistent schema and remove duplicates
 * Schema: {"Title":str, "Subtitle": str, "Body":str, "cache_key":CACHE_KEY, "day": 1-25}
 */
async function normalizePhotoJson() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('.json')
  );

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);

    try {
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);

      // Check for case-insensitive duplicates
      const keys = Object.keys(data);
      const lowerKeys = keys.map((k) => k.toLowerCase());
      const duplicates = lowerKeys.filter(
        (k, i) => lowerKeys.indexOf(k) !== i
      );

      // Normalize to standard schema (case-insensitive, prefer title case)
      const normalized = {
        Title: data.Title || data.title || '',
        Subtitle: data.Subtitle || data.subtitle || data.Summary || data.summary || 'Daddy Loves You!',
        Body: data.Body || data.body || data.Prompt || data.prompt || '',
        cache_key: data.cache_key || data.cacheKey || data.CacheKey || '',
        day: data.day || data.Day || data.date || data.Date || null,
      };

      // Remove any undefined or null values (except day which can be null)
      Object.keys(normalized).forEach((key) => {
        if (normalized[key] === undefined || (normalized[key] === null && key !== 'day')) {
          delete normalized[key];
        }
      });

      // Check if normalization is needed
      const needsUpdate =
        duplicates.length > 0 ||
        keys.length !== Object.keys(normalized).length ||
        keys.some((k) => !['Title', 'Subtitle', 'Body', 'cache_key', 'day'].includes(k));

      if (needsUpdate || JSON.stringify(data, Object.keys(data).sort()) !== JSON.stringify(normalized, Object.keys(normalized).sort())) {
        // Write normalized data with proper field order
        const orderedData = {
          Title: normalized.Title,
          Subtitle: normalized.Subtitle,
          Body: normalized.Body,
          cache_key: normalized.cache_key,
          day: normalized.day,
        };

        // Remove undefined/null values
        Object.keys(orderedData).forEach((key) => {
          if (orderedData[key] === undefined || (orderedData[key] === null && key !== 'day')) {
            delete orderedData[key];
          }
        });

        await writeFile(jsonPath, JSON.stringify(orderedData, null, 2), 'utf8');
        console.log(`✓ Normalized ${jsonFile.name}${duplicates.length > 0 ? ` (removed ${duplicates.length} duplicate(s))` : ''}`);
        updated++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${jsonFile.name}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✓ Updated: ${updated} files`);
  console.log(`  ⊘ Skipped: ${skipped} files (already normalized)`);
  if (errors > 0) {
    console.log(`  ✗ Errors: ${errors} files`);
  }
}

normalizePhotoJson()
  .then(() => {
    console.log('\n✅ JSON normalization complete!');
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

