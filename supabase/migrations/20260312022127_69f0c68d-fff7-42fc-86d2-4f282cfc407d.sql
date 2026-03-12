
-- Create a trigger function that prevents duplicate tool_usage inserts
-- for the same tool_id + user_id (or anonymous) within 5 seconds
CREATE OR REPLACE FUNCTION public.prevent_duplicate_tool_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tool_usage
    WHERE tool_id = NEW.tool_id
      AND (
        (NEW.user_id IS NOT NULL AND user_id = NEW.user_id)
        OR (NEW.user_id IS NULL AND user_id IS NULL)
      )
      AND created_at > (now() - interval '5 seconds')
  ) THEN
    RAISE EXCEPTION 'Duplicate tool usage within cooldown window';
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger
CREATE TRIGGER trg_prevent_duplicate_tool_usage
BEFORE INSERT ON public.tool_usage
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_tool_usage();

-- Add an index to speed up the duplicate check
CREATE INDEX IF NOT EXISTS idx_tool_usage_dedup
ON public.tool_usage (tool_id, user_id, created_at DESC);
