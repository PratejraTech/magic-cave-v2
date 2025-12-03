#!/usr/bin/env node

/**
 * Setup Storage Bucket and Policies
 * Creates the calendar-media bucket and sets up policies via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.test
const envPath = join(process.cwd(), '.env.test');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('🪣 Setting up storage bucket...');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupStorage() {
  try {
    // Create the bucket
    console.log('📦 Creating calendar-media bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('calendar-media', {
      public: false,
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo'
      ],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.log('⚠️  Bucket creation issue:', bucketError.message);
    } else {
      console.log('✅ Bucket ready');
    }

    // Note: Storage policies must be set up through the Supabase dashboard
    // as they require special permissions on system tables
    console.log('');
    console.log('📋 STORAGE POLICIES SETUP REQUIRED:');
    console.log('=====================================');
    console.log('Since storage policies require special permissions, please set them up manually:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/qscsyhdmtvtiauhhibhq/storage');
    console.log('2. Select the "calendar-media" bucket');
    console.log('3. Go to "Policies" tab');
    console.log('4. Create the following policies:');
    console.log('');
    console.log('POLICY 1 - Parents can access their calendar media:');
    console.log('  Operation: SELECT, INSERT, UPDATE, DELETE');
    console.log('  Policy:');
    console.log(`  bucket_id = 'calendar-media'`);
    console.log(`  AND auth.uid()::text IN (`);
    console.log(`    SELECT p.parent_uuid::text`);
    console.log(`    FROM parents p`);
    console.log(`    JOIN children c ON c.parent_uuid = p.parent_uuid`);
    console.log(`    JOIN calendars cal ON cal.child_uuid = c.child_uuid`);
    console.log(`    WHERE cal.calendar_id::text = split_part(name, '/', 1)`);
    console.log(`  )`);
    console.log('');
    console.log('POLICY 2 - Children can access their calendar media (read-only):');
    console.log('  Operation: SELECT');
    console.log('  Policy:');
    console.log(`  bucket_id = 'calendar-media'`);
    console.log(`  AND auth.uid()::text IN (`);
    console.log(`    SELECT c.child_uuid::text`);
    console.log(`    FROM children c`);
    console.log(`    JOIN calendars cal ON cal.child_uuid = c.child_uuid`);
    console.log(`    WHERE cal.calendar_id::text = split_part(name, '/', 1)`);
    console.log(`  )`);
    console.log('');
    console.log('POLICY 3 - Service role can manage all media:');
    console.log('  Operation: SELECT, INSERT, UPDATE, DELETE');
    console.log(`  Policy: auth.role() = 'service_role'`);
    console.log('');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
  }
}

setupStorage();