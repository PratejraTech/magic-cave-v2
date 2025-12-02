/*
  # Storage Policies for Calendar Media
  Sets up Row Level Security policies for the calendar-media storage bucket
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Parents can access their calendar media
CREATE POLICY "Parents can access their calendar media" ON storage.objects
FOR ALL USING (
  bucket_id = 'calendar-media'
  AND auth.uid()::text IN (
    SELECT p.parent_uuid::text
    FROM parents p
    JOIN children c ON c.parent_uuid = p.parent_uuid
    JOIN calendars cal ON cal.child_uuid = c.child_uuid
    WHERE cal.calendar_id::text = split_part(name, '/', 1)
  )
);

-- Policy: Children can access their calendar media (read-only)
CREATE POLICY "Children can access their calendar media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'calendar-media'
  AND auth.uid()::text IN (
    SELECT c.child_uuid::text
    FROM children c
    JOIN calendars cal ON cal.child_uuid = c.child_uuid
    WHERE cal.calendar_id::text = split_part(name, '/', 1)
  )
);

-- Policy: Service role can manage all media (for uploads/deletes)
CREATE POLICY "Service role can manage all media" ON storage.objects
FOR ALL USING (
  auth.role() = 'service_role'
);

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'calendar-media',
  'calendar-media',
  false,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO NOTHING;