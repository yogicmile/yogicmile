-- Fix remaining function search path security issues

-- Update remaining functions to have secure search paths
ALTER FUNCTION public.hash_otp(TEXT) SET search_path = public;
ALTER FUNCTION public.verify_hashed_otp(TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.handle_new_user_community() SET search_path = public;
ALTER FUNCTION public.update_post_comment_count() SET search_path = public;
ALTER FUNCTION public.verify_otp_with_audit(TEXT, TEXT, INET, TEXT) SET search_path = public;
ALTER FUNCTION public.log_admin_action(TEXT, TEXT, TEXT, JSONB, JSONB) SET search_path = public;
ALTER FUNCTION public.generate_otp(TEXT) SET search_path = public;
ALTER FUNCTION public.verify_otp(TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.earn_steps(UUID, INTEGER) SET search_path = public;

-- Update the enhanced OTP generation function with proper search path
CREATE OR REPLACE FUNCTION public.generate_otp_with_rate_limit(
  p_mobile_number TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp TEXT;
  v_hashed_otp TEXT;
  v_user_id UUID;
  v_rate_limit_record RECORD;
  v_max_hourly_attempts INTEGER := 3;
  v_max_daily_attempts INTEGER := 10;
  v_window_minutes INTEGER := 15;
  v_block_minutes INTEGER := 60;
BEGIN
  -- Input validation
  IF p_mobile_number IS NULL OR LENGTH(p_mobile_number) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid mobile number format');
  END IF;

  -- Get user ID from mobile number
  SELECT id INTO v_user_id FROM public.users WHERE mobile_number = p_mobile_number;
  
  IF v_user_id IS NULL THEN
    INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (NULL, 'otp_generation_failed', 
            jsonb_build_object('reason', 'user_not_found', 'mobile_number', p_mobile_number),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check rate limiting
  SELECT * INTO v_rate_limit_record 
  FROM public.otp_rate_limits 
  WHERE mobile_number = p_mobile_number;

  -- Check for permanent block
  IF v_rate_limit_record.permanent_block THEN
    INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_generation_blocked', 
            jsonb_build_object('reason', 'permanent_block'),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'Account permanently blocked. Contact support.');
  END IF;

  -- Check daily limits
  IF v_rate_limit_record.daily_window_start = CURRENT_DATE AND 
     v_rate_limit_record.daily_attempts >= v_max_daily_attempts THEN
    
    INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_daily_limit_exceeded', 
            jsonb_build_object('daily_attempts', v_rate_limit_record.daily_attempts),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'Daily OTP limit exceeded. Try again tomorrow.');
  END IF;

  -- Check hourly block
  IF v_rate_limit_record.blocked_until IS NOT NULL AND v_rate_limit_record.blocked_until > NOW() THEN
    INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (v_user_id, 'otp_generation_blocked', 
            jsonb_build_object('blocked_until', v_rate_limit_record.blocked_until),
            p_ip_address, p_user_agent);
    
    RETURN jsonb_build_object('success', false, 'error', 'Too many attempts. Try again later.');
  END IF;

  -- Update rate limiting counters
  INSERT INTO public.otp_rate_limits (
    mobile_number, attempts, window_start, daily_attempts, daily_window_start
  )
  VALUES (p_mobile_number, 1, NOW(), 1, CURRENT_DATE)
  ON CONFLICT (mobile_number) 
  DO UPDATE SET 
    attempts = CASE 
      WHEN otp_rate_limits.window_start > NOW() - INTERVAL '15 minutes' 
      THEN otp_rate_limits.attempts + 1 
      ELSE 1 
    END,
    window_start = CASE 
      WHEN otp_rate_limits.window_start > NOW() - INTERVAL '15 minutes' 
      THEN otp_rate_limits.window_start 
      ELSE NOW() 
    END,
    daily_attempts = CASE 
      WHEN otp_rate_limits.daily_window_start = CURRENT_DATE 
      THEN otp_rate_limits.daily_attempts + 1 
      ELSE 1 
    END,
    daily_window_start = CURRENT_DATE,
    blocked_until = CASE 
      WHEN (otp_rate_limits.window_start > NOW() - INTERVAL '15 minutes' AND 
            otp_rate_limits.attempts + 1 >= v_max_hourly_attempts)
      THEN NOW() + INTERVAL '60 minutes'
      ELSE NULL
    END,
    updated_at = NOW();

  -- Generate secure OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_hashed_otp := public.hash_otp(v_otp);
  
  -- Mark previous OTPs as expired
  UPDATE public.otp_logs 
  SET is_used = TRUE 
  WHERE user_id = v_user_id AND is_used = FALSE;
  
  -- Insert new hashed OTP with shorter expiry for security
  INSERT INTO public.otp_logs (user_id, otp, mobile_number, expires_at)
  VALUES (v_user_id, v_hashed_otp, p_mobile_number, NOW() + INTERVAL '3 minutes');
  
  -- Log successful OTP generation
  INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent)
  VALUES (v_user_id, 'otp_generated', 
          jsonb_build_object('mobile_number', p_mobile_number),
          p_ip_address, p_user_agent);
  
  RETURN jsonb_build_object('success', true, 'message', 'OTP sent successfully');
END;
$$;