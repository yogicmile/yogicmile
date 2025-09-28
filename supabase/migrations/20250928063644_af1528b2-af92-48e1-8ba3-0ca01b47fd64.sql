-- CRITICAL SECURITY FIX: Remove dangerous policy that exposes all user data to anonymous users
-- This policy allows anonymous users to read all user data including emails, phone numbers, and addresses

-- Remove the extremely dangerous policy that allows anonymous access to all user data
DROP POLICY IF EXISTS "Allow registration existence checks" ON public.users;

-- Remove other overly permissive or duplicate policies
DROP POLICY IF EXISTS "Users can insert their own users row" ON public.users;
DROP POLICY IF EXISTS "Users can view their own users row" ON public.users;
DROP POLICY IF EXISTS "Users can update their own users row" ON public.users;
DROP POLICY IF EXISTS "Users can select own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Ensure we have secure, non-duplicate policies (these should already exist from previous migration)
-- Users can only view their own data when authenticated
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view their own user data'
  ) THEN
    CREATE POLICY "Users can view their own user data" 
    ON public.users 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

-- Users can only update their own data when authenticated  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data" 
    ON public.users 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Allow secure user registration with proper validation (keep this one as it's properly secured)
-- This policy only allows inserting with proper mobile number format and requires full name
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Allow user registration'
  ) THEN
    CREATE POLICY "Allow user registration" 
    ON public.users 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (
      mobile_number IS NOT NULL 
      AND mobile_number ~ '^\+91[6-9]\d{9}$'::text 
      AND full_name IS NOT NULL 
      AND length(full_name) > 0
    );
  END IF;
END $$;