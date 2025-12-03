#!/usr/bin/env node

/**
 * Fixed Storage Policies for Supabase
 * Provides corrected policy definitions for the calendar-media bucket
 */

console.log('🔧 CORRECTED STORAGE POLICIES FOR SUPABASE');
console.log('==========================================');
console.log('');
console.log('The "name" column refers to the file path in storage.objects.');
console.log('File paths are structured as: calendar_id/filename');
console.log('');
console.log('Use these corrected policies in your Supabase dashboard:');
console.log('https://supabase.com/dashboard/project/qscsyhdmtvtiauhhibhq/storage');
console.log('');
console.log('==========================================');
console.log('');

// Policy 1: Parents can access their calendar media
console.log('POLICY 1 - Parents can access their calendar media:');
console.log('---------------------------------------------------');
console.log('Operations: SELECT, INSERT, UPDATE, DELETE');
console.log('');
console.log('Policy Expression:');
console.log(`bucket_id = 'calendar-media'`);
console.log(`AND (`);
console.log(`  -- Check if user is a parent with access to this calendar`);
console.log(`  auth.uid()::text IN (`);
console.log(`    SELECT p.parent_uuid::text`);
console.log(`    FROM parents p`);
console.log(`    JOIN children c ON c.parent_uuid = p.parent_uuid`);
console.log(`    JOIN calendars cal ON cal.child_uuid = c.child_uuid`);
console.log(`    WHERE cal.calendar_id::text = split_part(storage.objects.name, '/', 1)`);
console.log(`  )`);
console.log(`  OR`);
console.log(`  -- Allow access to files in the user's calendar folder`);
console.log(`  EXISTS (`);
console.log(`    SELECT 1`);
console.log(`    FROM parents p`);
console.log(`    JOIN children c ON c.parent_uuid = p.parent_uuid`);
console.log(`    JOIN calendars cal ON cal.child_uuid = c.child_uuid`);
console.log(`    WHERE p.parent_uuid::text = auth.uid()::text`);
console.log(`    AND cal.calendar_id::text = split_part(storage.objects.name, '/', 1)`);
console.log(`  )`);
console.log(`)`);
console.log('');

// Policy 2: Children can access their calendar media (read-only)
console.log('POLICY 2 - Children can access their calendar media (read-only):');
console.log('------------------------------------------------------------------');
console.log('Operations: SELECT');
console.log('');
console.log('Policy Expression:');
console.log(`bucket_id = 'calendar-media'`);
console.log(`AND auth.uid()::text IN (`);
console.log(`  SELECT c.child_uuid::text`);
console.log(`  FROM children c`);
console.log(`  JOIN calendars cal ON cal.child_uuid = c.child_uuid`);
console.log(`  WHERE cal.calendar_id::text = split_part(storage.objects.name, '/', 1)`);
console.log(`)`);
console.log('');

// Policy 3: Service role can manage all media
console.log('POLICY 3 - Service role can manage all media:');
console.log('----------------------------------------------');
console.log('Operations: SELECT, INSERT, UPDATE, DELETE');
console.log('');
console.log('Policy Expression:');
console.log(`bucket_id = 'calendar-media'`);
console.log(`AND auth.role() = 'service_role'`);
console.log('');

// Alternative simpler approach
console.log('==========================================');
console.log('ALTERNATIVE APPROACH (Simpler):');
console.log('==========================================');
console.log('');
console.log('If the complex policies are too difficult, use these simpler ones:');
console.log('');
console.log('SIMPLE POLICY - Authenticated users can access calendar media:');
console.log('Operations: SELECT, INSERT, UPDATE, DELETE');
console.log('Policy: bucket_id = \'calendar-media\' AND auth.role() = \'authenticated\'');
console.log('');
console.log('This allows all authenticated users to manage files in their calendar folders.');
console.log('The application code will handle the folder structure correctly.');
console.log('');

console.log('==========================================');
console.log('FILE PATH STRUCTURE:');
console.log('==========================================');
console.log('Files should be stored as:');
console.log('- calendar_id/filename.jpg');
console.log('- calendar_id/photos/image.png');
console.log('- calendar_id/videos/video.mp4');
console.log('');
console.log('Where calendar_id is the UUID of the calendar.');