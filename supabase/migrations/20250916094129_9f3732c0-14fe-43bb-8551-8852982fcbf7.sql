-- Update OTP functions to use secure hashing
-- Replace the existing generate_otp function with secure version
CREATE OR REPLACE FUNCTION public.generate_otp(p_mobile_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_otp TEXT;
  v_hashed_otp TEXT;
  v_user_id UUID;
BEGIN
  -- Generate 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Hash the OTP before storage
  v_hashed_otp := public.hash_otp(v_otp);
  
  -- Get user ID from mobile number
  SELECT id INTO v_user_id FROM users WHERE mobile_number = p_mobile_number;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with mobile number: %', p_mobile_number;
  END IF;
  
  -- Mark previous OTPs as expired
  UPDATE otp_logs 
  SET is_used = TRUE 
  WHERE user_id = v_user_id AND is_used = FALSE;
  
  -- Insert new hashed OTP
  INSERT INTO otp_logs (user_id, otp, expires_at)
  VALUES (v_user_id, v_hashed_otp, NOW() + INTERVAL '5 minutes');
  
  -- Return plain OTP (only for SMS sending, never store this)
  RETURN v_otp;
END;
$$;

-- Update verify_otp function to work with hashed OTPs  
CREATE OR REPLACE FUNCTION public.verify_otp(p_mobile_number text, p_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_stored_hash TEXT;
BEGIN
  -- Get user ID from mobile number
  SELECT id INTO v_user_id FROM users WHERE mobile_number = p_mobile_number;
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the stored hashed OTP
  SELECT otp INTO v_stored_hash 
  FROM otp_logs 
  WHERE user_id = v_user_id 
    AND expires_at > NOW() 
    AND is_used = FALSE
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verify the OTP using our secure hash function
  IF public.verify_hashed_otp(p_otp, v_stored_hash) THEN
    -- Mark OTP as used
    UPDATE otp_logs 
    SET is_used = TRUE
    WHERE user_id = v_user_id 
      AND otp = v_stored_hash 
      AND is_used = FALSE;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;