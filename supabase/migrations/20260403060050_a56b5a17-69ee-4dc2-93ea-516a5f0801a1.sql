
-- 1. Fix has_role function: enforce caller restriction inside subquery
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      )
  )
$$;

-- 2. Add unique constraint on daily_reward_claims to prevent points farming
ALTER TABLE public.daily_reward_claims
  ADD CONSTRAINT daily_reward_claims_user_date_unique
  UNIQUE (user_id, claimed_date);

-- 3. Add trigger to validate tool_usage inserts against managed_tools
CREATE OR REPLACE FUNCTION public.validate_tool_usage_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.managed_tools WHERE id = NEW.tool_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid tool_id: tool does not exist or is inactive';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_tool_usage_before_insert
  BEFORE INSERT ON public.tool_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_tool_usage_insert();
