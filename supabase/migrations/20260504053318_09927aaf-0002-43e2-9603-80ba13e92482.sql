
-- 1. Storage: explicit UPDATE policy scoped to user's own folder for payment-screenshots
CREATE POLICY "Users can update own payment screenshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. tool_reviews: hide user_id column from clients via column-level grants
REVOKE SELECT ON public.tool_reviews FROM anon, authenticated;
GRANT SELECT (id, tool_id, rating, feedback, created_at, updated_at) ON public.tool_reviews TO anon, authenticated;
-- user_id remains accessible to RLS expressions (server-side) but not returned to clients.
-- For users to identify their own review, expose a SECURITY DEFINER helper:
CREATE OR REPLACE FUNCTION public.get_my_review_id(p_tool_id text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.tool_reviews WHERE user_id = auth.uid() AND tool_id = p_tool_id LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_review_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_review_id(text) TO authenticated;

-- 3. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated.
-- These should only be called server-side via service role (or via triggers).
REVOKE EXECUTE ON FUNCTION public.admin_approve_purchase(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_reject_purchase(uuid, uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_points(uuid, uuid, integer, text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.credit_points_purchase(uuid, text, integer, numeric) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;

-- Re-grant admin functions to authenticated so they can be invoked, but only succeed for actual admins
-- (the functions internally check has_role). Admin checks within functions still gate access.
GRANT EXECUTE ON FUNCTION public.admin_approve_purchase(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reject_purchase(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_points(uuid, uuid, integer, text, text) TO authenticated;

-- 4. Tighten user-supplied uid on claim/submit functions: enforce auth.uid()
CREATE OR REPLACE FUNCTION public.claim_daily_reward(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_points INTEGER := 5;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

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
$function$;

CREATE OR REPLACE FUNCTION public.submit_purchase_request(p_user_id uuid, p_package_name text, p_points_amount integer, p_price_inr numeric, p_screenshot_url text DEFAULT NULL::text, p_user_email text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_purchase_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  INSERT INTO public.points_purchases (user_id, package_name, points_amount, price_inr, status, screenshot_url, user_email)
  VALUES (p_user_id, p_package_name, p_points_amount, p_price_inr, 'pending', p_screenshot_url, p_user_email)
  RETURNING id INTO v_purchase_id;
  RETURN json_build_object('success', true, 'purchase_id', v_purchase_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_referral_bonus(p_referral_code text, p_referred_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_referrer_id UUID;
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_points INTEGER := 25;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_referred_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT user_id INTO v_referrer_id FROM referral_codes WHERE code = p_referral_code;
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  IF v_referrer_id = p_referred_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot use own referral code');
  END IF;
  IF EXISTS (SELECT 1 FROM referral_claims WHERE referred_user_id = p_referred_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Referral already claimed');
  END IF;
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = v_referrer_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Referrer not found');
  END IF;
  v_new_balance := v_balance + v_points;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = v_referrer_id;
  INSERT INTO referral_claims (referrer_id, referred_user_id, points_awarded) VALUES (v_referrer_id, p_referred_user_id, v_points);
  INSERT INTO points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (v_referrer_id, v_points, 'add', 'Referral bonus', v_new_balance);
  RETURN json_build_object('success', true, 'points', v_points);
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_tool_points(p_user_id uuid, p_tool_id text, p_tool_name text, p_points_cost integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_balance integer;
  v_new_balance integer;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  IF p_points_cost = 0 THEN
    RETURN json_build_object('success', true, 'balance', v_balance);
  END IF;
  IF v_balance < p_points_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points', 'balance', v_balance, 'cost', p_points_cost);
  END IF;
  v_new_balance := v_balance - p_points_cost;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;
  INSERT INTO points_transactions (user_id, tool_id, tool_name, points_used, action_type, balance_after)
  VALUES (p_user_id, p_tool_id, p_tool_name, p_points_cost, 'use', v_new_balance);
  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$function$;
