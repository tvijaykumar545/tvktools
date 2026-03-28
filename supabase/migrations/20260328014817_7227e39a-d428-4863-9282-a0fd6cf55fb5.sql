
-- Drop and recreate the user update policy to also lock points_balance
DROP POLICY IF EXISTS "Users can update own profile metadata" ON public.profiles;

CREATE POLICY "Users can update own profile metadata"
  ON public.profiles FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND plan = (SELECT p.plan FROM profiles p WHERE p.user_id = auth.uid())
    AND points_balance = (SELECT p.points_balance FROM profiles p WHERE p.user_id = auth.uid())
  );
