
-- Create managed_tools table
CREATE TABLE public.managed_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'utility',
  icon TEXT NOT NULL DEFAULT '🔧',
  is_free BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'frontend',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.managed_tools ENABLE ROW LEVEL SECURITY;

-- Anyone can read active tools
CREATE POLICY "Anyone can read active tools"
ON public.managed_tools
FOR SELECT
USING (is_active = true);

-- Admins can read all tools (including inactive)
CREATE POLICY "Admins can read all tools"
ON public.managed_tools
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert tools
CREATE POLICY "Admins can insert tools"
ON public.managed_tools
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update tools
CREATE POLICY "Admins can update tools"
ON public.managed_tools
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete tools
CREATE POLICY "Admins can delete tools"
ON public.managed_tools
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_managed_tools_updated_at
  BEFORE UPDATE ON public.managed_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
