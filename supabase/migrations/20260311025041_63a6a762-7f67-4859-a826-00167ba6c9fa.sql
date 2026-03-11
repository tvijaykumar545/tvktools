
-- Allow guest (anonymous) usage tracking
ALTER TABLE public.tool_usage ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous users to insert usage with null user_id
CREATE POLICY "Anonymous users can insert tool usage"
  ON public.tool_usage FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
