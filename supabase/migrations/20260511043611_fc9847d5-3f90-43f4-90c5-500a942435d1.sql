-- Audit log for client-callable RPCs
CREATE TABLE public.rpc_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  function_name text NOT NULL,
  caller_user_id uuid,
  args jsonb,
  success boolean NOT NULL,
  error_message text,
  duration_ms integer
);

CREATE INDEX idx_rpc_audit_log_created_at ON public.rpc_audit_log (created_at DESC);
CREATE INDEX idx_rpc_audit_log_function ON public.rpc_audit_log (function_name, created_at DESC);
CREATE INDEX idx_rpc_audit_log_caller ON public.rpc_audit_log (caller_user_id, created_at DESC);
CREATE INDEX idx_rpc_audit_log_failures ON public.rpc_audit_log (created_at DESC) WHERE success = false;

ALTER TABLE public.rpc_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rpc audit log"
  ON public.rpc_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Block client inserts to rpc audit log"
  ON public.rpc_audit_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Internal helper used by RPCs to record an audit entry. Not callable by clients.
CREATE OR REPLACE FUNCTION public.log_rpc_call(
  p_function_name text,
  p_caller uuid,
  p_args jsonb,
  p_success boolean,
  p_error text DEFAULT NULL
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.rpc_audit_log (function_name, caller_user_id, args, success, error_message)
  VALUES (p_function_name, p_caller, p_args, p_success, p_error);
$$;

REVOKE EXECUTE ON FUNCTION public.log_rpc_call(text, uuid, jsonb, boolean, text) FROM anon, authenticated, public;

-- Instrument client-callable RPCs ---------------------------------------------

CREATE OR REPLACE FUNCTION public.create_api_key(p_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_secret text; v_plain text; v_hash text; v_prefix text; v_id uuid;
  v_args jsonb := jsonb_build_object('name', p_name);
BEGIN
  IF v_uid IS NULL THEN
    PERFORM public.log_rpc_call('create_api_key', v_uid, v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 OR length(p_name) > 80 THEN
    PERFORM public.log_rpc_call('create_api_key', v_uid, v_args, false, 'Invalid name');
    RETURN json_build_object('success', false, 'error', 'Invalid name');
  END IF;

  v_secret := encode(extensions.gen_random_bytes(24), 'hex');
  v_plain := 'tvk_live_' || v_secret;
  v_prefix := substr(v_plain, 1, 13);
  v_hash := encode(extensions.digest(v_plain, 'sha256'), 'hex');

  INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash)
  VALUES (v_uid, trim(p_name), v_prefix, v_hash)
  RETURNING id INTO v_id;

  PERFORM public.log_rpc_call('create_api_key', v_uid, v_args, true, NULL);
  RETURN json_build_object('success', true, 'id', v_id, 'key', v_plain, 'prefix', v_prefix);
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_api_key(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_args jsonb := jsonb_build_object('id', p_id);
BEGIN
  IF v_uid IS NULL THEN
    PERFORM public.log_rpc_call('revoke_api_key', v_uid, v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  UPDATE public.api_keys SET revoked_at = now()
  WHERE id = p_id AND user_id = v_uid AND revoked_at IS NULL;
  IF NOT FOUND THEN
    PERFORM public.log_rpc_call('revoke_api_key', v_uid, v_args, false, 'Not found');
    RETURN json_build_object('success', false, 'error', 'Not found');
  END IF;
  PERFORM public.log_rpc_call('revoke_api_key', v_uid, v_args, true, NULL);
  RETURN json_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.rotate_api_key(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_name text; v_secret text; v_plain text; v_hash text; v_prefix text; v_new_id uuid;
  v_args jsonb := jsonb_build_object('id', p_id);
BEGIN
  IF v_uid IS NULL THEN
    PERFORM public.log_rpc_call('rotate_api_key', v_uid, v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  SELECT name INTO v_name FROM public.api_keys
   WHERE id = p_id AND user_id = v_uid AND revoked_at IS NULL;
  IF v_name IS NULL THEN
    PERFORM public.log_rpc_call('rotate_api_key', v_uid, v_args, false, 'Key not found or already revoked');
    RETURN json_build_object('success', false, 'error', 'Key not found or already revoked');
  END IF;
  UPDATE public.api_keys SET revoked_at = now() WHERE id = p_id;
  v_secret := encode(extensions.gen_random_bytes(24), 'hex');
  v_plain := 'tvk_live_' || v_secret;
  v_prefix := substr(v_plain, 1, 13);
  v_hash := encode(extensions.digest(v_plain, 'sha256'), 'hex');
  INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash)
  VALUES (v_uid, v_name, v_prefix, v_hash)
  RETURNING id INTO v_new_id;
  PERFORM public.log_rpc_call('rotate_api_key', v_uid, v_args, true, NULL);
  RETURN json_build_object('success', true, 'id', v_new_id, 'key', v_plain, 'prefix', v_prefix);
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_tool_points(p_user_id uuid, p_tool_id text, p_tool_name text, p_points_cost integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_balance integer; v_new_balance integer;
  v_args jsonb := jsonb_build_object('user_id', p_user_id, 'tool_id', p_tool_id, 'tool_name', p_tool_name, 'points_cost', p_points_cost);
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    PERFORM public.log_rpc_call('deduct_tool_points', auth.uid(), v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    PERFORM public.log_rpc_call('deduct_tool_points', auth.uid(), v_args, false, 'User not found');
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  IF p_points_cost = 0 THEN
    PERFORM public.log_rpc_call('deduct_tool_points', auth.uid(), v_args, true, NULL);
    RETURN json_build_object('success', true, 'balance', v_balance);
  END IF;
  IF v_balance < p_points_cost THEN
    PERFORM public.log_rpc_call('deduct_tool_points', auth.uid(), v_args, false, 'Insufficient points');
    RETURN json_build_object('success', false, 'error', 'Insufficient points', 'balance', v_balance, 'cost', p_points_cost);
  END IF;
  v_new_balance := v_balance - p_points_cost;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;
  INSERT INTO points_transactions (user_id, tool_id, tool_name, points_used, action_type, balance_after)
  VALUES (p_user_id, p_tool_id, p_tool_name, p_points_cost, 'use', v_new_balance);
  PERFORM public.log_rpc_call('deduct_tool_points', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_daily_reward(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_balance INTEGER; v_new_balance INTEGER; v_points INTEGER := 5;
  v_args jsonb := jsonb_build_object('user_id', p_user_id);
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    PERFORM public.log_rpc_call('claim_daily_reward', auth.uid(), v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  IF EXISTS (SELECT 1 FROM daily_reward_claims WHERE user_id = p_user_id AND claimed_date = CURRENT_DATE) THEN
    PERFORM public.log_rpc_call('claim_daily_reward', auth.uid(), v_args, false, 'Already claimed today');
    RETURN json_build_object('success', false, 'error', 'Already claimed today');
  END IF;
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    PERFORM public.log_rpc_call('claim_daily_reward', auth.uid(), v_args, false, 'User not found');
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  v_new_balance := v_balance + v_points;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;
  INSERT INTO daily_reward_claims (user_id, points_awarded) VALUES (p_user_id, v_points);
  INSERT INTO points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (p_user_id, v_points, 'add', 'Daily login bonus', v_new_balance);
  PERFORM public.log_rpc_call('claim_daily_reward', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true, 'points', v_points, 'balance', v_new_balance);
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_referral_bonus(p_referral_code text, p_referred_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer_id UUID; v_balance INTEGER; v_new_balance INTEGER; v_points INTEGER := 25;
  v_args jsonb := jsonb_build_object('referral_code', p_referral_code, 'referred_user_id', p_referred_user_id);
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_referred_user_id THEN
    PERFORM public.log_rpc_call('claim_referral_bonus', auth.uid(), v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  SELECT user_id INTO v_referrer_id FROM referral_codes WHERE code = p_referral_code;
  IF v_referrer_id IS NULL THEN
    PERFORM public.log_rpc_call('claim_referral_bonus', auth.uid(), v_args, false, 'Invalid referral code');
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  IF v_referrer_id = p_referred_user_id THEN
    PERFORM public.log_rpc_call('claim_referral_bonus', auth.uid(), v_args, false, 'Cannot use own referral code');
    RETURN json_build_object('success', false, 'error', 'Cannot use own referral code');
  END IF;
  IF EXISTS (SELECT 1 FROM referral_claims WHERE referred_user_id = p_referred_user_id) THEN
    PERFORM public.log_rpc_call('claim_referral_bonus', auth.uid(), v_args, false, 'Referral already claimed');
    RETURN json_build_object('success', false, 'error', 'Referral already claimed');
  END IF;
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = v_referrer_id FOR UPDATE;
  IF v_balance IS NULL THEN
    PERFORM public.log_rpc_call('claim_referral_bonus', auth.uid(), v_args, false, 'Referrer not found');
    RETURN json_build_object('success', false, 'error', 'Referrer not found');
  END IF;
  v_new_balance := v_balance + v_points;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = v_referrer_id;
  INSERT INTO referral_claims (referrer_id, referred_user_id, points_awarded) VALUES (v_referrer_id, p_referred_user_id, v_points);
  INSERT INTO points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (v_referrer_id, v_points, 'add', 'Referral bonus', v_new_balance);
  PERFORM public.log_rpc_call('claim_referral_bonus', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true, 'points', v_points);
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_purchase_request(p_user_id uuid, p_package_name text, p_points_amount integer, p_price_inr numeric, p_screenshot_url text DEFAULT NULL::text, p_user_email text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_purchase_id uuid;
  v_args jsonb := jsonb_build_object('user_id', p_user_id, 'package_name', p_package_name, 'points_amount', p_points_amount, 'price_inr', p_price_inr);
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    PERFORM public.log_rpc_call('submit_purchase_request', auth.uid(), v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  INSERT INTO public.points_purchases (user_id, package_name, points_amount, price_inr, status, screenshot_url, user_email)
  VALUES (p_user_id, p_package_name, p_points_amount, p_price_inr, 'pending', p_screenshot_url, p_user_email)
  RETURNING id INTO v_purchase_id;
  PERFORM public.log_rpc_call('submit_purchase_request', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true, 'purchase_id', v_purchase_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_adjust_points(p_admin_id uuid, p_user_id uuid, p_points integer, p_action text, p_description text DEFAULT ''::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_balance integer; v_new_balance integer;
  v_args jsonb := jsonb_build_object('admin_id', p_admin_id, 'user_id', p_user_id, 'points', p_points, 'action', p_action, 'description', p_description);
BEGIN
  IF NOT has_role(p_admin_id, 'admin') THEN
    PERFORM public.log_rpc_call('admin_adjust_points', auth.uid(), v_args, false, 'Unauthorized');
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    PERFORM public.log_rpc_call('admin_adjust_points', auth.uid(), v_args, false, 'User not found');
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  IF p_action = 'add' THEN
    v_new_balance := v_balance + p_points;
  ELSIF p_action = 'deduct' THEN
    v_new_balance := GREATEST(v_balance - p_points, 0);
  ELSE
    PERFORM public.log_rpc_call('admin_adjust_points', auth.uid(), v_args, false, 'Invalid action');
    RETURN json_build_object('success', false, 'error', 'Invalid action');
  END IF;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;
  INSERT INTO points_transactions (user_id, points_used, action_type, description, admin_id, balance_after)
  VALUES (p_user_id, p_points, p_action, p_description, p_admin_id, v_new_balance);
  PERFORM public.log_rpc_call('admin_adjust_points', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_approve_purchase(p_admin_id uuid, p_purchase_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_purchase record; v_new_balance integer;
  v_args jsonb := jsonb_build_object('admin_id', p_admin_id, 'purchase_id', p_purchase_id);
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    PERFORM public.log_rpc_call('admin_approve_purchase', auth.uid(), v_args, false, 'Not authorized');
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;
  SELECT * INTO v_purchase FROM public.points_purchases WHERE id = p_purchase_id;
  IF NOT FOUND THEN
    PERFORM public.log_rpc_call('admin_approve_purchase', auth.uid(), v_args, false, 'Purchase not found');
    RETURN json_build_object('success', false, 'error', 'Purchase not found');
  END IF;
  IF v_purchase.status != 'pending' THEN
    PERFORM public.log_rpc_call('admin_approve_purchase', auth.uid(), v_args, false, 'Purchase already processed');
    RETURN json_build_object('success', false, 'error', 'Purchase already processed');
  END IF;
  UPDATE public.points_purchases
  SET status = 'approved', approved_by = p_admin_id, approved_at = now()
  WHERE id = p_purchase_id;
  UPDATE public.profiles SET points_balance = points_balance + v_purchase.points_amount
  WHERE user_id = v_purchase.user_id
  RETURNING points_balance INTO v_new_balance;
  INSERT INTO public.points_transactions (user_id, points_used, action_type, description, admin_id, balance_after)
  VALUES (v_purchase.user_id, v_purchase.points_amount, 'add',
    'Purchase approved: ' || v_purchase.package_name || ' (₹' || v_purchase.price_inr || ')',
    p_admin_id, v_new_balance);
  PERFORM public.log_rpc_call('admin_approve_purchase', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_reject_purchase(p_admin_id uuid, p_purchase_id uuid, p_reason text DEFAULT 'Payment could not be verified'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_purchase record;
  v_args jsonb := jsonb_build_object('admin_id', p_admin_id, 'purchase_id', p_purchase_id, 'reason', p_reason);
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    PERFORM public.log_rpc_call('admin_reject_purchase', auth.uid(), v_args, false, 'Not authorized');
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;
  SELECT * INTO v_purchase FROM public.points_purchases WHERE id = p_purchase_id;
  IF NOT FOUND THEN
    PERFORM public.log_rpc_call('admin_reject_purchase', auth.uid(), v_args, false, 'Purchase not found');
    RETURN json_build_object('success', false, 'error', 'Purchase not found');
  END IF;
  IF v_purchase.status != 'pending' THEN
    PERFORM public.log_rpc_call('admin_reject_purchase', auth.uid(), v_args, false, 'Purchase already processed');
    RETURN json_build_object('success', false, 'error', 'Purchase already processed');
  END IF;
  UPDATE public.points_purchases
  SET status = 'rejected', rejection_reason = p_reason, approved_by = p_admin_id, approved_at = now()
  WHERE id = p_purchase_id;
  PERFORM public.log_rpc_call('admin_reject_purchase', auth.uid(), v_args, true, NULL);
  RETURN json_build_object('success', true);
END;
$function$;