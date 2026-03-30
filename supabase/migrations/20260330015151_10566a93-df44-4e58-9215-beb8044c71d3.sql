-- Restrict points_purchases INSERT to only allow 'pending' status
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.points_purchases;

CREATE POLICY "Users can insert own purchases"
  ON public.points_purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );