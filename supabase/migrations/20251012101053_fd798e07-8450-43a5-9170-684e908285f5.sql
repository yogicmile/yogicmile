-- Update verify_otp_with_audit to normalize mobile numbers by digits-only comparison
CREATE OR REPLACE FUNCTION public.verify_otp_with_audit(p_mobile_number text, p_otp text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_stored_hash TEXT;
  v_is_valid BOOLEAN := FALSE;
BEGIN
  -- Normalize comparison to digits-only to avoid formatting mismatches
  SELECT id INTO v_user_id 
  FROM users 
  WHERE REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g') = REGEXP_REPLACE(p_mobile_number, '[^0-9]', '', 'g')
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    -- Log failed verification attempt
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (NULL, 'otp_verification_failed', 
            jsonb_build_object('reason', 'user_not_found', 'mobile_number', p_mobile_number),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
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
    -- Log expired/missing OTP attempt
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_verification_failed', 
            jsonb_build_object('reason', 'otp_expired_or_missing'),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'OTP expired or invalid');
  END IF;
  
  -- Verify the OTP using our secure hash function
  IF public.verify_hashed_otp(p_otp, v_stored_hash) THEN
    -- Mark OTP as used
    UPDATE otp_logs 
    SET is_used = TRUE
    WHERE user_id = v_user_id 
      AND otp = v_stored_hash 
      AND is_used = FALSE;
    
    -- Reset rate limiting on successful verification
    DELETE FROM otp_rate_limits WHERE mobile_number = p_mobile_number;
    
    -- Log successful verification
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_verified_successfully', 
            jsonb_build_object('mobile_number', p_mobile_number),
            p_ip_address, p_user_agent);
    
    v_is_valid := TRUE;
  ELSE
    -- Log failed verification
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_verification_failed', 
            jsonb_build_object('reason', 'invalid_otp'),
            p_ip_address, p_user_agent);
  END IF;
  
  RETURN jsonb_build_object('success', v_is_valid, 'verified', v_is_valid);
END;
$$;