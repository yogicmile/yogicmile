-- Ensure pgcrypto is installed in the extensions schema (Supabase default)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Update hash_otp to reference pgcrypto functions from the extensions schema
CREATE OR REPLACE FUNCTION public.hash_otp(plain_otp text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN extensions.crypt(plain_otp, extensions.gen_salt('bf', 8));
END;
$$;

-- Update verify_hashed_otp to reference pgcrypto functions from the extensions schema
CREATE OR REPLACE FUNCTION public.verify_hashed_otp(plain_otp text, hashed_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN extensions.crypt(plain_otp, hashed_otp) = hashed_otp;
END;
$$;