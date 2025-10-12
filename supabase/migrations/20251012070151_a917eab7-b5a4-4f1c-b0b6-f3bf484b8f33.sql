-- Fix the create_user_with_mobile function to accept user_id parameter
CREATE OR REPLACE FUNCTION public.create_user_with_mobile(
  p_mobile_number text,
  p_full_name text,
  p_email text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_referred_by text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_existing uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_existing
  FROM public.users
  WHERE mobile_number = p_mobile_number
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Use provided user_id, or auth.uid(), or generate new UUID
  v_user_id := COALESCE(p_user_id, auth.uid(), gen_random_uuid());

  -- Insert new user record
  INSERT INTO public.users (
    id, mobile_number, full_name, email, address, referred_by, referral_code, role
  ) VALUES (
    v_user_id,
    p_mobile_number,
    p_full_name,
    p_email,
    p_address,
    p_referred_by,
    p_mobile_number,
    'user'
  ) RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;