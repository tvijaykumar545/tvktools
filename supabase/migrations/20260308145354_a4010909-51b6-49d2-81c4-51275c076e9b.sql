
-- Seed admin role for tvijaykumar545@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'tvijaykumar545@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all tool usage
CREATE POLICY "Admins can view all tool usage"
ON public.tool_usage FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
