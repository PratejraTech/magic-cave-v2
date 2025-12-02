import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');

async function removeDuplicates() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('_compressed.json')
  );

  let processed = 0;
  let cleaned = 0;

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(PHOTOS_DIR, jsonFile.name);
    
    try {
      const content = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(content);

      // Check if duplicates exist
      const hasDuplicates = 
        (data.title && data.Title) ||
        (data.body && data.Body) ||
        (data.subtitle && data.Subtitle);

      if (hasDuplicates) {
        // Create clean object with only uppercase keys
        const cleanedData = {
          Title: data.Title || data.title,
          Subtitle: data.Subtitle || data.subtitle,
          Body: data.Body || data.body,
          cache_key: data.cache_key,
          day: data.day,
        };

        // Remove any undefined values
        Object.keys(cleanedData).forEach(key => {
          if (cleanedData[key] === undefined) {
            delete cleanedData[key];
          }
        });

        await writeFile(jsonPath, JSON.stringify(cleanedData, null, 2), 'utf8');
        console.log(`[remove:duplicates] Cleaned ${jsonFile.name}`);
        cleaned++;
      }
      processed++;
    } catch (error) {
      console.error(`[remove:duplicates] Error processing ${jsonFile.name}: ${error.message}`);
    }
  }

  console.log(`\n[remove:duplicates] Summary:`);
  console.log(`  Processed: ${processed} files`);
  console.log(`  Cleaned: ${cleaned} files`);
}

removeDuplicates()
  .catch((error) => {
    console.error('[remove:duplicates] Fatal error:', error);
    process.exit(1);
  });

