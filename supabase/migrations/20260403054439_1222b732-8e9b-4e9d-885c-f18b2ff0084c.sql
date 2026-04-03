
-- 1. Change default signup points from 100 to 50
ALTER TABLE public.profiles ALTER COLUMN points_balance SET DEFAULT 50;

-- Update the profile insert RLS to reflect new default
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id AND plan = 'free' AND points_balance = 50);

-- Update handle_new_user to set 50 points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, points_balance)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 50);
  
  -- Log the signup bonus transaction
  INSERT INTO public.points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (NEW.id, 50, 'add', 'Signup bonus', 50);
  
  RETURN NEW;
END;
$$;

-- 2. Daily reward claims table
CREATE TABLE public.daily_reward_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  claimed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_awarded INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, claimed_date)
);

ALTER TABLE public.daily_reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily claims"
  ON public.daily_reward_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily claims"
  ON public.daily_reward_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Referral codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral code"
  ON public.referral_codes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Referral claims table
CREATE TABLE public.referral_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  points_awarded INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral claims"
  ON public.referral_claims FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id);

-- 5. Claim daily reward function
CREATE OR REPLACE FUNCTION public.claim_daily_reward(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_points INTEGER := 5;
BEGIN
  -- Check if already claimed today
  IF EXISTS (SELECT 1 FROM daily_reward_claims WHERE user_id = p_user_id AND claimed_date = CURRENT_DATE) THEN
    RETURN json_build_object('success', false, 'error', 'Already claimed today');
  END IF;

  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  v_new_balance := v_balance + v_points;

  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;

  INSERT INTO daily_reward_claims (user_id, points_awarded) VALUES (p_user_id, v_points);

  INSERT INTO points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (p_user_id, v_points, 'add', 'Daily login bonus', v_new_balance);

  RETURN json_build_object('success', true, 'points', v_points, 'balance', v_new_balance);
END;
$$;

-- 6. Credit review points function
CREATE OR REPLACE FUNCTION public.credit_review_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_points INTEGER := 10;
BEGIN
  -- Only on INSERT (new review), not on update
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = NEW.user_id FOR UPDATE;
  IF v_balance IS NULL THEN RETURN NEW; END IF;

  v_new_balance := v_balance + v_points;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = NEW.user_id;

  INSERT INTO points_transactions (user_id, points_used, action_type, description, tool_id, balance_after)
  VALUES (NEW.user_id, v_points, 'add', 'Review bonus (+10)', NEW.tool_id, v_new_balance);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_credit_review_points
  AFTER INSERT ON public.tool_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_review_points();

-- 7. Credit favorite points function (2 pts)
CREATE OR REPLACE FUNCTION public.credit_favorite_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_points INTEGER := 2;
BEGIN
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = NEW.user_id FOR UPDATE;
  IF v_balance IS NULL THEN RETURN NEW; END IF;

  v_new_balance := v_balance + v_points;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = NEW.user_id;

  INSERT INTO points_transactions (user_id, points_used, action_type, description, tool_id, balance_after)
  VALUES (NEW.user_id, v_points, 'add', 'Favorite bonus (+2)', NEW.tool_id, v_new_balance);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_credit_favorite_points
  AFTER INSERT ON public.tool_favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_favorite_points();

-- 8. Claim referral bonus function
CREATE OR REPLACE FUNCTION public.claim_referral_bonus(p_referral_code TEXT, p_referred_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_points INTEGER := 25;
BEGIN
  -- Find referrer
  SELECT user_id INTO v_referrer_id FROM referral_codes WHERE code = p_referral_code;
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Can't refer yourself
  IF v_referrer_id = p_referred_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot use own referral code');
  END IF;

  -- Check if already claimed
  IF EXISTS (SELECT 1 FROM referral_claims WHERE referred_user_id = p_referred_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Referral already claimed');
  END IF;

  -- Credit referrer
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = v_referrer_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Referrer not found');
  END IF;

  v_new_balance := v_balance + v_points;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = v_referrer_id;

  INSERT INTO referral_claims (referrer_id, referred_user_id, points_awarded)
  VALUES (v_referrer_id, p_referred_user_id, v_points);

  INSERT INTO points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (v_referrer_id, v_points, 'add', 'Referral bonus', v_new_balance);

  RETURN json_build_object('success', true, 'points', v_points);
END;
$$;
