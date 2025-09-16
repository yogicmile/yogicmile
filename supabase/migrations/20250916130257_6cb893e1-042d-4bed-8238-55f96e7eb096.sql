-- Temporarily disable trigger, update role, then re-enable
ALTER TABLE public.users DISABLE TRIGGER ALL;

UPDATE public.users 
SET role = 'super_admin'
WHERE email = 'admin@yogicmile.com';

ALTER TABLE public.users ENABLE TRIGGER ALL;