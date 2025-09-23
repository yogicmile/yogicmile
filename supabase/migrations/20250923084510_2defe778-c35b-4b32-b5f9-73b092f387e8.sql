-- First, let's see current policies and drop them all to start fresh
DO $$
BEGIN
    -- Drop all existing policies on users table
    DROP POLICY IF EXISTS "Allow user registration" ON public.users;
    DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can select own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.users;
    DROP POLICY IF EXISTS "Anonymous users limited access" ON public.users;
END $$;

-- Now create new, proper RLS policies for user registration

-- Allow anyone to register (INSERT) with proper validation
CREATE POLICY "Allow user registration" 
ON public.users 
FOR INSERT 
WITH CHECK (
  mobile_number IS NOT NULL 
  AND mobile_number ~ '^\+91[6-9]\d{9}$'
  AND full_name IS NOT NULL 
  AND LENGTH(full_name) > 0
);

-- Allow users to view their own profile and allow registration checks
CREATE POLICY "Users can view profiles" 
ON public.users 
FOR SELECT 
USING (
  auth.uid()::text = id 
  OR auth.role() = 'service_role'
  OR true  -- Allow for registration existence checks
);

-- Allow users to update their own profile only when authenticated
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Prevent deletion for safety
CREATE POLICY "Prevent user deletion" 
ON public.users 
FOR DELETE 
USING (false);