-- Tighten users table RLS and allow safe registration

-- 1) Remove overly permissive anonymous policy
DROP POLICY IF EXISTS "Anonymous users limited access" ON public.users;

-- 2) Restrict SELECT to authenticated users viewing their own row only
DROP POLICY IF EXISTS "Users can select own profile" ON public.users;
CREATE POLICY "Users can select own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3) Restrict UPDATE to authenticated users on their own row
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Keep existing INSERT policy "Allow user registration" as-is to permit signups for anon+authenticated with validation