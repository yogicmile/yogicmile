-- Auto-delete from public.users when auth user is deleted
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete from public.users when auth.users record is deleted
  DELETE FROM public.users WHERE id = OLD.id;
  
  -- Log the deletion
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    OLD.id,
    'user_deleted',
    jsonb_build_object(
      'email', OLD.email,
      'phone', OLD.phone,
      'deleted_at', now()
    )
  );
  
  RETURN OLD;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_deleted();

-- Update create_user_with_mobile RPC with better error handling
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
AS $function$
DECLARE
  v_user_id uuid;
  v_existing uuid;
  v_existing_email text;
BEGIN
  -- Check if user already exists by mobile
  SELECT id, email INTO v_existing, v_existing_email
  FROM public.users
  WHERE mobile_number = p_mobile_number
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    -- User exists - raise a clear error
    RAISE EXCEPTION 'DUPLICATE_MOBILE: Mobile number % already registered with email %. Please login or use a different number.', 
      p_mobile_number, COALESCE(v_existing_email, 'N/A')
      USING HINT = 'existing_user_id:' || v_existing::text;
  END IF;

  -- Check if email already exists (if provided)
  IF p_email IS NOT NULL THEN
    SELECT id INTO v_existing
    FROM public.users
    WHERE email = p_email
    LIMIT 1;
    
    IF v_existing IS NOT NULL THEN
      RAISE EXCEPTION 'DUPLICATE_EMAIL: Email % already registered. Please login or use a different email.', p_email
        USING HINT = 'existing_user_id:' || v_existing::text;
    END IF;
  END IF;

  -- Create new user
  v_user_id := COALESCE(p_user_id, auth.uid(), gen_random_uuid());

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
$function$;