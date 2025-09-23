-- Add a temporary policy to allow checking for existing users during registration
CREATE POLICY "Allow registration existence checks"
ON public.users
FOR SELECT
TO anon
USING (true);