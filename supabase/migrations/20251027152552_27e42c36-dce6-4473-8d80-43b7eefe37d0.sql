-- Drop the incorrect foreign key constraint on users.id
-- This constraint was preventing new user creation during OTP flow
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Verify users.id is now just a primary key
COMMENT ON TABLE public.users IS 'User profiles table. users.id is an independent primary key, not linked to auth.users';

-- Add proper auth linking column if it doesn't exist
-- This allows linking to auth.users without constraining the primary key
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance on auth lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE 'Successfully dropped users_id_fkey constraint. OTP user creation should now work.';
END $$;