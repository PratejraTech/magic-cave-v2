// @ts-ignore - Supabase types will be available at runtime
import { createClient } from '@supabase/supabase-js';

// Storage configuration for media assets
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'calendar-media',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.avi']
};

// Initialize Supabase client for storage operations
export function createStorageClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration for storage');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Generate secure file path for uploaded media
export function generateSecureFilePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return `${userId}/${timestamp}-${randomId}.${extension}`;
}

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!STORAGE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed. Allowed extensions: ${STORAGE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  return { valid: true };
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ url: string; path: string }> {
  const supabase = createStorageClient();

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate secure file path
  const filePath = generateSecureFilePath(userId, file.name);

  try {
    // Upload file to storage
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${(error as Error).message}`);
  }
}

// Delete file from Supabase Storage
export async function deleteFile(filePath: string): Promise<void> {
  const supabase = createStorageClient();

  try {
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${(error as Error).message}`);
  }
}

// Get signed URL for private access (if needed)
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  const supabase = createStorageClient();

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw new Error(`Failed to create signed URL: ${(error as Error).message}`);
  }
}

// Initialize storage bucket (run this once during setup)
export async function initializeStorageBucket(): Promise<void> {
  const supabase = createStorageClient();

  try {
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === STORAGE_CONFIG.BUCKET_NAME);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(STORAGE_CONFIG.BUCKET_NAME, {
        public: false, // Private bucket for security
        allowedMimeTypes: STORAGE_CONFIG.ALLOWED_TYPES,
        fileSizeLimit: STORAGE_CONFIG.MAX_FILE_SIZE
      });

      if (error) {
        throw error;
      }

      console.log(`Created storage bucket: ${STORAGE_CONFIG.BUCKET_NAME}`);
    }

    // Set up bucket policies
    setupStoragePolicies();

  } catch (error) {
    console.error('Error initializing storage bucket:', error);
    throw error;
  }
}

// Set up storage policies for access control
function setupStoragePolicies(): void {
  // Note: These policies would typically be set up via SQL migrations
  // This function is for reference and initial setup

  const policies = [
    {
      name: 'Parents can access their calendar media',
      definition: `
        CREATE POLICY "Parents can access their calendar media" ON storage.objects
        FOR ALL USING (
          bucket_id = '${STORAGE_CONFIG.BUCKET_NAME}'
          AND auth.uid()::text IN (
            SELECT parent_uuid::text FROM calendars c
            JOIN children ch ON ch.child_uuid = c.child_uuid
            WHERE c.calendar_id::text = (storage.foldername(name))[1]
          )
        );
      `
    },
    {
      name: 'Children can access their calendar media',
      definition: `
        CREATE POLICY "Children can access their calendar media" ON storage.objects
        FOR SELECT USING (
          bucket_id = '${STORAGE_CONFIG.BUCKET_NAME}'
          AND auth.uid()::text IN (
            SELECT child_uuid::text FROM calendars c
            WHERE c.calendar_id::text = (storage.foldername(name))[1]
          )
        );
      `
    }
  ];

  console.log('Storage policies should be created via SQL migrations:');
  policies.forEach(policy => {
    console.log(`- ${policy.name}`);
    console.log(policy.definition);
  });
}