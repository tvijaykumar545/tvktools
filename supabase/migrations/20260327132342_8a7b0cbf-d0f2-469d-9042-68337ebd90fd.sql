
-- Restrict INSERT so new profiles must have plan='free' and points_balance=100 (defaults)
DROP POLICY "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() = user_id
    AND plan = 'free'
    AND points_balance = 100
  );
