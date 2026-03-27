ALTER TABLE public.email_templates ADD COLUMN html_content text DEFAULT '' NOT NULL;
ALTER TABLE public.email_templates ADD COLUMN editor_mode text DEFAULT 'variables' NOT NULL;