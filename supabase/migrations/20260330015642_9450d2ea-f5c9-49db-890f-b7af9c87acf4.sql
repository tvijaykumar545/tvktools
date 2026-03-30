-- Make payment-screenshots bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

-- Remove points_purchases from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.points_purchases;

-- Restrict storage SELECT to own files
DROP POLICY IF EXISTS "Anyone can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment screenshots" ON storage.objects;

CREATE POLICY "Users can view own payment screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all payment screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Users can upload to their own folder only
DROP POLICY IF EXISTS "Users can upload payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payment screenshots" ON storage.objects;

CREATE POLICY "Users can upload payment screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );