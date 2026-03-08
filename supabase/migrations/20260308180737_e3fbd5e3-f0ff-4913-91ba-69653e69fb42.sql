
ALTER TABLE public.profiles 
  ADD COLUMN default_category TEXT NOT NULL DEFAULT 'all',
  ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
