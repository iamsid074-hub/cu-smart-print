-- Disable maintenance mode globally
INSERT INTO public.site_settings (key, value)
VALUES ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = 'false'::jsonb;
