import { readdir, stat, readFile, writeFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'public', 'photos');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'photoPairs.generated.ts');
const SUPPORTED_IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.PNG', '.JPG', '.JPEG', '.WEBP']);
const DEFAULT_MESSAGE = 'A sparkling Christmas memory filled with butterflies, heartbeats, and Daddy moments.';
const DEFAULT_SUBTITLE = 'Daddy Loves You!';

const getField = (source, keys, coerceToString = true) => {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const rawValue = source[key];
    if (rawValue === undefined || rawValue === null) continue;
    if (coerceToString) {
      const value = String(rawValue).trim();
      if (value.length === 0) continue;
      return value;
    }
    return rawValue;
  }
  return undefined;
};

const parseDay = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const dayNumber = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(dayNumber) || !Number.isInteger(dayNumber)) return undefined;
  return dayNumber;
};

const toPublicPath = (filename) => `/photos/${filename}`;
async function parseMetadata(baseName) {
  const jsonPath = path.join(SOURCE_DIR, `${baseName}.json`);
  const mdPath = path.join(SOURCE_DIR, `${baseName}.md`);
  const hasJson = await stat(jsonPath).then(
    (stats) => stats.isFile(),
    () => false
  );

  if (hasJson) {
    try {
      const raw = await readFile(jsonPath, 'utf8');
      const data = JSON.parse(raw);
      const title =
        getField(data, ['title', 'Title', 'buttonTitle', 'ButtonTitle']) ?? baseName;
      const subtitle =
        getField(data, ['subtitle', 'Subtitle', 'summary', 'Summary']) ?? DEFAULT_SUBTITLE;
      const body =
        getField(data, ['body', 'Body', 'message', 'Message', 'story', 'Story']) ?? DEFAULT_MESSAGE;
      const prompt =
        getField(data, ['prompt', 'Prompt']) ?? `${title} ${body}`;
      const cacheKey = getField(data, ['cache_key', 'cacheKey', 'CacheKey']);
      const day = parseDay(getField(data, ['day', 'Day'], false));
      return {
        title,
        subtitle,
        message: body,
        body,
        prompt,
        cacheKey: cacheKey ?? null,
        day: day ?? null,
        metadata: toPublicPath(`${baseName}.json`),
      };
    } catch {
      return {
        title: baseName,
        subtitle: DEFAULT_SUBTITLE,
        message: DEFAULT_MESSAGE,
        body: DEFAULT_MESSAGE,
        prompt: baseName,
        cacheKey: null,
        day: null,
      };
    }
  }

  const hasMarkdown = await stat(mdPath).then(
    (stats) => stats.isFile(),
    () => false
  );
  if (hasMarkdown) {
    const raw = await readFile(mdPath, 'utf8');
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length > 0) {
      const [firstLine, ...rest] = lines;
      const title = firstLine.replace(/^#\s*/, '') || baseName;
      const message = rest.join('\n') || DEFAULT_MESSAGE;
      return {
        title,
        subtitle: DEFAULT_SUBTITLE,
        message,
        body: message,
        prompt: `${title} ${message}`,
        metadata: toPublicPath(`${baseName}.md`),
        cacheKey: null,
        day: null,
      };
    }
  }

  return {
    title: baseName,
    subtitle: DEFAULT_SUBTITLE,
    message: DEFAULT_MESSAGE,
    body: DEFAULT_MESSAGE,
    prompt: baseName,
    metadata: null,
    cacheKey: null,
    day: null,
  };
}

async function processPhoto(fileName) {
  const baseName = path.parse(fileName).name;
  const ext = path.extname(fileName);
  const isCompressedFile = baseName.endsWith('_compressed');

  let imageFileName = fileName;
  let metadataBaseName;
  let metadataPath;

  if (isCompressedFile) {
    // This is already a compressed file - use it directly
    // Strip _compressed to get base name for metadata lookup
    metadataBaseName = baseName.replace(/_compressed$/, '');
    
    // Try compressed metadata first, fall back to original metadata
    const compressedJsonPath = path.join(SOURCE_DIR, `${baseName}.json`);
    const hasCompressedJson = await stat(compressedJsonPath).then(
      (stats) => stats.isFile(),
      () => false
    );
    metadataPath = hasCompressedJson ? baseName : metadataBaseName;
  } else {
    // Check if compressed version exists, prefer it
    const compressedFileName = `${baseName}_compressed${ext}`;
    const compressedPath = path.join(SOURCE_DIR, compressedFileName);
    
    const hasCompressed = await stat(compressedPath).then(
      (stats) => stats.isFile(),
      () => false
    );

    if (hasCompressed) {
      imageFileName = compressedFileName;
      // Try compressed metadata first
      const compressedJsonPath = path.join(SOURCE_DIR, `${baseName}_compressed.json`);
      const hasCompressedJson = await stat(compressedJsonPath).then(
        (stats) => stats.isFile(),
        () => false
      );
      metadataPath = hasCompressedJson ? `${baseName}_compressed` : baseName;
    } else {
      metadataPath = baseName;
    }
  }

  // Parse metadata (will handle missing files gracefully)
  const parsedMetadata = await parseMetadata(metadataPath);
  const { title, subtitle, message, body, prompt, metadata: metadataPathFromParsed, cacheKey, day } = parsedMetadata;

  // Determine metadata file path for output
  let metadataFileName;
  if (metadataPathFromParsed) {
    metadataFileName = metadataPathFromParsed;
  } else if (isCompressedFile && metadataPath === baseName) {
    metadataFileName = `${baseName}.json`;
  } else if (metadataPath === metadataBaseName) {
    metadataFileName = `${metadataBaseName}.json`;
  } else {
    metadataFileName = `${metadataPath}.json`;
  }

  return {
    image: toPublicPath(imageFileName),
    title,
    subtitle,
    message,
    body,
    prompt,
    metadata: metadataFileName.startsWith('/') ? metadataFileName : toPublicPath(metadataFileName),
    cacheKey,
    day,
  };
}

async function validateFilePairs() {
  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  const imageFiles = new Set();
  const jsonFiles = new Set();

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    const ext = path.extname(name).toLowerCase();
    
    if (SUPPORTED_IMAGE_EXT.has(ext)) {
      const baseName = path.parse(name).name;
      imageFiles.add(baseName.replace('_compressed', ''));
    } else if (ext === '.json') {
      const baseName = path.parse(name).name;
      jsonFiles.add(baseName.replace('_compressed', ''));
    }
  }

  const orphanedImages = [];
  const orphanedJson = [];

  for (const imageBase of imageFiles) {
    if (!jsonFiles.has(imageBase)) {
      orphanedImages.push(imageBase);
    }
  }

  for (const jsonBase of jsonFiles) {
    if (!imageFiles.has(jsonBase)) {
      orphanedJson.push(jsonBase);
    }
  }

  if (orphanedImages.length > 0) {
    console.warn(`[generate:photoPairs] Warning: ${orphanedImages.length} image(s) without JSON: ${orphanedImages.slice(0, 5).join(', ')}${orphanedImages.length > 5 ? '...' : ''}`);
  }

  if (orphanedJson.length > 0) {
    console.warn(`[generate:photoPairs] Warning: ${orphanedJson.length} JSON file(s) without image: ${orphanedJson.slice(0, 5).join(', ')}${orphanedJson.length > 5 ? '...' : ''}`);
  }
}

async function generatePairs() {
  await validateFilePairs();

  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  const photos = [];
  const skipped = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (!SUPPORTED_IMAGE_EXT.has(ext)) continue;

    try {
      console.log(`[generate:photoPairs] Processing ${entry.name}`);
      const pair = await processPhoto(entry.name);
      if (pair !== null) {
        photos.push(pair);
      }
    } catch (error) {
      skipped.push({ file: entry.name, error: error.message });
      console.warn(`[generate:photoPairs] Warning: Skipped ${entry.name}: ${error.message || 'Unknown error'}`);
    }
  }

  photos.sort((a, b) => {
    // Sort by day first, then by image path
    if (a.day !== null && b.day !== null) {
      return a.day - b.day;
    }
    if (a.day !== null) return -1;
    if (b.day !== null) return 1;
    return a.image.localeCompare(b.image);
  });

  const manifest = `export type PhotoPair = {
  image: string;
  title: string;
  message: string;
  subtitle?: string | null;
  body?: string | null;
  prompt?: string | null;
  metadata?: string | null;
  cacheKey?: string | null;
  day?: number | null;
};

export const photoPairs: PhotoPair[] = ${JSON.stringify(photos, null, 2)};`;

  await writeFile(MANIFEST_PATH, manifest);
  console.log(`[generate:photoPairs] Saved ${photos.length} entries to ${MANIFEST_PATH}`);
  if (skipped.length > 0) {
    console.log(`[generate:photoPairs] Skipped ${skipped.length} file(s)`);
  }
}

generatePairs().catch((error) => {
  console.error('[generate:photoPairs] Failed', error);
  process.exit(1);
});
