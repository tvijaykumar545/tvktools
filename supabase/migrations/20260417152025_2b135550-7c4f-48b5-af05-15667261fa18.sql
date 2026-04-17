-- Restrict listing of avatars bucket: users can only list their own folder.
-- Public read access to specific files via getPublicUrl still works since the
-- bucket is marked public (storage CDN serves files regardless of RLS for public buckets).
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;

CREATE POLICY "Users can list their own avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);