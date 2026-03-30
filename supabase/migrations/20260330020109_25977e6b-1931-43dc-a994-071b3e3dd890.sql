-- Drop the overly broad upload policy that bypasses folder scoping
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;