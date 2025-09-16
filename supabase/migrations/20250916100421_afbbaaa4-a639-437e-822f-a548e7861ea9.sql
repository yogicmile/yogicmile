-- Add rate limiting and audit logging for security enhancements

-- Create audit log table for security monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
FOR SELECT USING (auth.uid() = user_id);

-- System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- Create rate limiting table for OTP generation
CREATE TABLE public.otp_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can access rate limits
CREATE POLICY "System can manage rate limits" ON public.otp_rate_limits
FOR ALL USING (auth.role() = 'service_role');

-- Create unique index for mobile number to prevent duplicates
CREATE UNIQUE INDEX idx_otp_rate_limits_mobile ON public.otp_rate_limits(mobile_number);

-- Add updated_at trigger for rate limits
CREATE TRIGGER update_otp_rate_limits_updated_at
BEFORE UPDATE ON public.otp_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced OTP generation function with rate limiting
CREATE OR REPLACE FUNCTION public.generate_otp_with_rate_limit(p_mobile_number text, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_otp TEXT;
  v_hashed_otp TEXT;
  v_user_id UUID;
  v_rate_limit_record RECORD;
  v_max_attempts INTEGER := 3;
  v_window_minutes INTEGER := 15;
  v_block_minutes INTEGER := 60;
BEGIN
  -- Get user ID from mobile number
  SELECT id INTO v_user_id FROM users WHERE mobile_number = p_mobile_number;
  
  IF v_user_id IS NULL THEN
    -- Log failed attempt
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (NULL, 'otp_generation_failed', 
            jsonb_build_object('reason', 'user_not_found', 'mobile_number', p_mobile_number),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'User not found with mobile number');
  END IF;

  -- Check rate limiting
  SELECT * INTO v_rate_limit_record 
  FROM otp_rate_limits 
  WHERE mobile_number = p_mobile_number;

  -- If blocked, check if block period has expired
  IF v_rate_limit_record.blocked_until IS NOT NULL AND v_rate_limit_record.blocked_until > NOW() THEN
    -- Log blocked attempt
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_generation_blocked', 
            jsonb_build_object('blocked_until', v_rate_limit_record.blocked_until),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'Too many attempts. Try again later.');
  END IF;

  -- Check if within rate limit window
  IF v_rate_limit_record.window_start IS NOT NULL AND 
     v_rate_limit_record.window_start > NOW() - INTERVAL '15 minutes' THEN
    
    -- Increment attempts
    UPDATE otp_rate_limits 
    SET attempts = attempts + 1, updated_at = NOW()
    WHERE mobile_number = p_mobile_number;
    
    -- Check if exceeded max attempts
    IF v_rate_limit_record.attempts >= v_max_attempts THEN
      -- Block for specified time
      UPDATE otp_rate_limits 
      SET blocked_until = NOW() + INTERVAL '60 minutes'
      WHERE mobile_number = p_mobile_number;
      
      -- Log rate limit exceeded
      INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
      VALUES (v_user_id, 'otp_rate_limit_exceeded', 
              jsonb_build_object('attempts', v_rate_limit_record.attempts + 1),
              p_ip_address, p_user_agent);
      
      RETURN jsonb_build_object('success', false, 'error', 'Too many attempts. Account temporarily blocked.');
    END IF;
    
  ELSE
    -- Reset rate limit window
    INSERT INTO otp_rate_limits (mobile_number, attempts, window_start)
    VALUES (p_mobile_number, 1, NOW())
    ON CONFLICT (mobile_number) 
    DO UPDATE SET 
      attempts = 1, 
      window_start = NOW(), 
      blocked_until = NULL,
      updated_at = NOW();
  END IF;

  -- Generate 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Hash the OTP before storage
  v_hashed_otp := public.hash_otp(v_otp);
  
  -- Mark previous OTPs as expired
  UPDATE otp_logs 
  SET is_used = TRUE 
  WHERE user_id = v_user_id AND is_used = FALSE;
  
  -- Insert new hashed OTP
  INSERT INTO otp_logs (user_id, otp, mobile_number, expires_at)
  VALUES (v_user_id, v_hashed_otp, p_mobile_number, NOW() + INTERVAL '5 minutes');
  
  -- Log successful OTP generation
  INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
  VALUES (v_user_id, 'otp_generated', 
          jsonb_build_object('mobile_number', p_mobile_number),
          p_ip_address, p_user_agent);
  
  -- Return success (OTP sent via SMS, not returned for security)
  RETURN jsonb_build_object('success', true, 'message', 'OTP sent successfully');
END;
$function$;

-- Enhanced OTP verification function with audit logging
CREATE OR REPLACE FUNCTION public.verify_otp_with_audit(p_mobile_number text, p_otp text, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_stored_hash TEXT;
  v_is_valid BOOLEAN := FALSE;
BEGIN
  -- Get user ID from mobile number
  SELECT id INTO v_user_id FROM users WHERE mobile_number = p_mobile_number;
  
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
$function$;