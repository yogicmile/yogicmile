-- Elevate the specified user to super_admin
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'admin@yogicmile.com';