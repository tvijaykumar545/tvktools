CREATE OR REPLACE FUNCTION public.rotate_api_key(p_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
  v_secret text;
  v_plain text;
  v_hash text;
  v_prefix text;
  v_new_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT name INTO v_name
  FROM public.api_keys
  WHERE id = p_id AND user_id = v_uid AND revoked_at IS NULL;

  IF v_name IS NULL THEN
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

  RETURN json_build_object('success', true, 'id', v_new_id, 'key', v_plain, 'prefix', v_prefix);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rotate_api_key(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.rotate_api_key(uuid) TO authenticated;