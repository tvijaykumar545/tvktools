
CREATE OR REPLACE FUNCTION public.get_most_used_tools(limit_count integer DEFAULT 8)
RETURNS TABLE(tool_id text, tool_name text, category text, usage_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tool_id, tool_name, category, COUNT(*) as usage_count
  FROM public.tool_usage
  GROUP BY tool_id, tool_name, category
  ORDER BY usage_count DESC
  LIMIT limit_count;
$$;
