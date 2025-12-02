import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'public', 'photos');

const SUPPORTED_IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.PNG', '.JPG', '.JPEG', '.WEBP'];

async function removeOriginals() {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());

  const filesToDelete = [];
  const filesToKeep = [];

  // First, identify all compressed files
  const compressedFiles = new Set();
  for (const file of files) {
    const baseName = path.parse(file.name).name;
    if (baseName.endsWith('_compressed')) {
      compressedFiles.add(baseName.replace(/_compressed$/, ''));
    }
  }

  // Then, find original files that have compressed versions
  for (const file of files) {
    const baseName = path.parse(file.name).name;
    const ext = path.extname(file.name);
    
    // Skip compressed files themselves
    if (baseName.endsWith('_compressed')) {
      filesToKeep.push(file.name);
      continue;
    }

    // Skip processed files that don't have compressed versions
    if (baseName.endsWith('_processed')) {
      // Check if there's a compressed version
      const hasCompressed = compressedFiles.has(baseName.replace(/_processed$/, ''));
      if (!hasCompressed) {
        filesToKeep.push(file.name);
        continue;
      }
    }

    // Check if this file has a compressed version
    if (compressedFiles.has(baseName)) {
      // This original file has a compressed version - mark for deletion
      filesToDelete.push({
        name: file.name,
        path: path.join(PHOTOS_DIR, file.name),
        baseName,
        ext,
      });
    } else {
      // No compressed version - keep it
      filesToKeep.push(file.name);
    }
  }

  console.log(`[remove:originals] Found ${filesToDelete.length} original files with compressed versions`);
  console.log(`[remove:originals] Keeping ${filesToKeep.length} files without compressed versions`);

  let deleted = 0;
  let errors = 0;

  for (const fileInfo of filesToDelete) {
    try {
      // Verify compressed version exists before deleting
      const compressedBaseName = `${fileInfo.baseName}_compressed${fileInfo.ext}`;
      const compressedPath = path.join(PHOTOS_DIR, compressedBaseName);
      
      try {
        await stat(compressedPath);
        // Compressed version exists, safe to delete original
        await unlink(fileInfo.path);
        console.log(`[remove:originals] Deleted ${fileInfo.name}`);
        deleted++;
      } catch (statError) {
        console.warn(`[remove:originals] Skipping ${fileInfo.name} - compressed version not found`);
        errors++;
      }
    } catch (error) {
      console.error(`[remove:originals] Error deleting ${fileInfo.name}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n[remove:originals] Summary:`);
  console.log(`  Deleted: ${deleted} files`);
  if (errors > 0) {
    console.log(`  Errors/Skipped: ${errors} files`);
  }
}

removeOriginals()
  .catch((error) => {
    console.error('[remove:originals] Fatal error:', error);
    process.exit(1);
  });

