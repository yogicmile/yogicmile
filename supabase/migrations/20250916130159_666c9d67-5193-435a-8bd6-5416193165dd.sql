-- Update role without triggering updated_at
UPDATE public.users 
SET role = 'super_admin'
WHERE email = 'admin@yogicmile.com' AND id = '3a5c6d36-92a1-4233-bb3f-b36aa24e5797';