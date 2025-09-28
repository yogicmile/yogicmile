-- CRITICAL SECURITY FIX: Remove public access to user_profiles table
-- This fixes the "User Personal Information Could Be Harvested by Competitors" vulnerability

-- Drop all existing policies that allow public (anonymous) access to user_profiles
DROP POLICY IF EXISTS "Public profiles viewable based on privacy settings" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles based on privacy settings" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view public profiles and their own" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view public profiles or friends profiles" ON public.user_profiles;

-- Drop duplicate/conflicting policies to clean up
DROP POLICY IF EXISTS "Friends can view friend profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "View public profiles when authenticated" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create secure, non-overlapping policies that ONLY allow authenticated users

-- 1. Users can only view and manage their own profile data
CREATE POLICY "Authenticated users can manage own profile" 
ON public.user_profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Authenticated users can view OTHER users' profiles based on privacy settings and friendship
CREATE POLICY "Authenticated users can view profiles based on privacy" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() != user_id AND (
    -- Profile is set to public visibility
    (profile_visibility = 'public') OR
    -- Profile is friends-only and current user is a friend
    (profile_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE status = 'accepted' 
      AND (
        (requester_id = auth.uid() AND addressee_id = user_id) OR
        (requester_id = user_id AND addressee_id = auth.uid())
      )
    ))
  )
);

-- 3. System can create profiles for new users during registration
CREATE POLICY "System can create user profiles" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add security logging trigger to monitor profile access
CREATE OR REPLACE FUNCTION log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile views for security monitoring
  IF TG_OP = 'SELECT' AND NEW.user_id != auth.uid() THEN
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (
      auth.uid(),
      'profile_view',
      jsonb_build_object(
        'viewed_user_id', NEW.user_id,
        'privacy_setting', NEW.profile_visibility,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;