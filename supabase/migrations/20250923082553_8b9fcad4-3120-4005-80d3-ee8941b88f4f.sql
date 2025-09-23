-- Ensure admin user exists with proper role
DO $$
BEGIN
  -- Check if admin user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@yogicmile.com') THEN
    -- Insert admin user (this would normally be done through Supabase Auth)
    -- For testing purposes, we'll just ensure the user role exists
    INSERT INTO public.users (id, email, full_name, mobile_number, address, role, created_at)
    VALUES (
      '3a5c6d36-92a1-4233-bb3f-b36aa24e5797'::uuid,
      'admin@yogicmile.com',
      'Admin User',
      '9999999999',
      'Admin Address',
      'admin',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      email = 'admin@yogicmile.com';
  ELSE
    -- Update existing user to admin role
    UPDATE public.users 
    SET role = 'admin'
    WHERE email = 'admin@yogicmile.com';
  END IF;

  -- Ensure user_roles table has admin role (if it exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('3a5c6d36-92a1-4233-bb3f-b36aa24e5797'::uuid, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;