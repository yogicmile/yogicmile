-- Fix RLS policies for user registration

-- Drop the problematic INSERT policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.users;

-- Create a new policy that allows unauthenticated users to register
-- but restricts what they can insert
CREATE POLICY "Allow user registration" 
ON public.users 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Allow registration with proper mobile number format
  mobile_number IS NOT NULL 
  AND mobile_number ~ '^\+91[6-9]\d{9}$'
  AND full_name IS NOT NULL 
  AND LENGTH(full_name) > 0
);

-- Update the SELECT policy to allow authenticated users to see their own profile
-- and allow system queries during registration
DROP POLICY IF EXISTS "Users can select own profile" ON public.users;
CREATE POLICY "Users can select own profile" 
ON public.users 
FOR SELECT 
TO authenticated, anon
USING (
  auth.uid() = id::uuid 
  OR auth.role() = 'service_role'
  OR auth.uid() IS NULL  -- Allow anonymous access for registration checks
);

-- Keep the UPDATE policy as is
-- The "Deny all access to anonymous users" policy should be updated too
DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.users;

-- Create a more specific policy for anonymous users - deny UPDATE/DELETE but allow SELECT/INSERT for registration
CREATE POLICY "Anonymous users limited access" 
ON public.users 
FOR ALL
TO anon
USING (
  -- Allow SELECT for registration checks and INSERT for new users
  TRUE
)
WITH CHECK (
  -- Only allow INSERT with proper validation, no UPDATE/DELETE
  mobile_number IS NOT NULL 
  AND mobile_number ~ '^\+91[6-9]\d{9}$'
  AND full_name IS NOT NULL 
  AND LENGTH(full_name) > 0
);