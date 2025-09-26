-- Fix user_profiles table RLS policies to respect privacy settings
-- Drop existing overly permissive policies if they exist
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles based on privacy" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;

-- Create secure RLS policies for user_profiles that respect privacy settings
-- Users can always view their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
    ON public.user_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Authenticated users can view profiles marked as public
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'View public profiles when authenticated'
  ) THEN
    CREATE POLICY "View public profiles when authenticated" 
    ON public.user_profiles 
    FOR SELECT 
    TO authenticated
    USING (
      profile_visibility = 'public' 
      AND auth.uid() IS NOT NULL
    );
  END IF;
END $$;

-- Friends can view each other's profiles regardless of public setting
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Friends can view friend profiles'
  ) THEN
    CREATE POLICY "Friends can view friend profiles" 
    ON public.user_profiles 
    FOR SELECT 
    TO authenticated
    USING (
      auth.uid() != user_id 
      AND EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE ((requester_id = auth.uid() AND addressee_id = user_profiles.user_id) 
               OR (requester_id = user_profiles.user_id AND addressee_id = auth.uid()))
        AND status = 'accepted'
      )
    );
  END IF;
END $$;

-- Also fix the users table exposure
DROP POLICY IF EXISTS "Users can view all user data" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Public user data access" ON public.users;

-- Create secure policies for users table only if they don't exist
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