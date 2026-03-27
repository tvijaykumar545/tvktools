
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  heading text NOT NULL DEFAULT '',
  body_text text NOT NULL DEFAULT '',
  button_text text DEFAULT '',
  button_url text DEFAULT '',
  footer_text text DEFAULT '',
  accent_color text NOT NULL DEFAULT '#00ffff',
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all templates" ON public.email_templates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert templates" ON public.email_templates
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates" ON public.email_templates
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates" ON public.email_templates
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
