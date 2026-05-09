
-- API keys
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  last_used_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash) WHERE revoked_at IS NULL;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own api keys" ON public.api_keys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Block direct insert api keys" ON public.api_keys
  FOR INSERT TO authenticated, anon WITH CHECK (false);

CREATE POLICY "Users can rename own api keys" ON public.api_keys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON public.api_keys
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- API request log
CREATE TABLE public.api_request_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  status integer NOT NULL,
  points_charged integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_log_key_time ON public.api_request_log(api_key_id, created_at DESC);
CREATE INDEX idx_api_log_user_time ON public.api_request_log(user_id, created_at DESC);

ALTER TABLE public.api_request_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own request log" ON public.api_request_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Block client inserts to request log" ON public.api_request_log
  FOR INSERT TO authenticated, anon WITH CHECK (false);

-- RPCs
CREATE OR REPLACE FUNCTION public.create_api_key(p_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_secret text;
  v_plain text;
  v_hash text;
  v_prefix text;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 OR length(p_name) > 80 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid name');
  END IF;

  v_secret := encode(extensions.gen_random_bytes(24), 'hex');
  v_plain := 'tvk_live_' || v_secret;
  v_prefix := substr(v_plain, 1, 13);
  v_hash := encode(extensions.digest(v_plain, 'sha256'), 'hex');

  INSERT INTO public.api_keys (user_id, name, key_prefix, key_hash)
  VALUES (v_uid, trim(p_name), v_prefix, v_hash)
  RETURNING id INTO v_id;

  RETURN json_build_object('success', true, 'id', v_id, 'key', v_plain, 'prefix', v_prefix);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_api_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_api_key(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.revoke_api_key(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  UPDATE public.api_keys SET revoked_at = now()
  WHERE id = p_id AND user_id = auth.uid() AND revoked_at IS NULL;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Not found');
  END IF;
  RETURN json_build_object('success', true);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.revoke_api_key(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_api_key(uuid) TO authenticated;

-- Service-role-only verifier (called from edge function with service role)
CREATE OR REPLACE FUNCTION public.verify_api_key(p_plain text)
RETURNS TABLE(api_key_id uuid, user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_hash text;
BEGIN
  v_hash := encode(extensions.digest(p_plain, 'sha256'), 'hex');
  RETURN QUERY
  UPDATE public.api_keys
     SET last_used_at = now()
   WHERE key_hash = v_hash
     AND revoked_at IS NULL
     AND (expires_at IS NULL OR expires_at > now())
   RETURNING id, api_keys.user_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.verify_api_key(text) FROM PUBLIC, anon, authenticated;

-- Server-side points deduction for API (no auth.uid() check; called by service role)
CREATE OR REPLACE FUNCTION public.api_deduct_points(p_user_id uuid, p_tool_id text, p_tool_name text, p_points_cost integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
BEGIN
  SELECT points_balance INTO v_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  IF p_points_cost <= 0 THEN
    RETURN json_build_object('success', true, 'balance', v_balance);
  END IF;
  IF v_balance < p_points_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points', 'balance', v_balance, 'cost', p_points_cost);
  END IF;
  v_new_balance := v_balance - p_points_cost;
  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;
  INSERT INTO points_transactions (user_id, tool_id, tool_name, points_used, action_type, balance_after, description)
  VALUES (p_user_id, p_tool_id, p_tool_name, p_points_cost, 'use', v_new_balance, 'API call');
  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.api_deduct_points(uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
