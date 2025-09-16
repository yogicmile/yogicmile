-- Fix Critical Security Issue: Remove overly permissive RLS policies on users table
-- This addresses the "User Personal Information Could Be Stolen by Hackers" security finding

-- Drop the dangerous "Anyone can create a new user" policy
-- This policy allowed unauthenticated users to insert data, which is a major security risk
DROP POLICY IF EXISTS "Anyone can create a new user" ON public.users;

-- Drop duplicate policies to clean up and avoid confusion
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Keep only the essential, secure policies:
-- 1. "Users can select own profile" - allows users to see only their own data
-- 2. "Users can update own profile" - allows users to update only their own data

-- Add a secure INSERT policy that only allows authenticated users to create their own record
-- This replaces the dangerous "Anyone can create a new user" policy
CREATE POLICY "Authenticated users can create their own profile" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure the remaining policies are properly named and secure
-- The existing "Users can select own profile" and "Users can update own profile" policies
-- already properly restrict access to (auth.uid() = id), so they remain secure

-- Add additional security: prevent users from updating their own ID
-- This adds an extra layer of protection against potential ID manipulation
CREATE POLICY "Prevent ID manipulation" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND id = OLD.id);