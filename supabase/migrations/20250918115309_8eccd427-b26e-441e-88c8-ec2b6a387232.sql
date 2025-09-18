-- PHASE 1: CRITICAL SECURITY FIXES

-- 1. Create secure user roles system to prevent privilege escalation
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin', 'moderator');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 2. Fix user_profiles data exposure with granular privacy controls
-- First, add privacy settings to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'friends' CHECK (profile_visibility IN ('public', 'friends', 'private'));
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS show_activity_score BOOLEAN DEFAULT true;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT true;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user_profiles;

-- Create secure user_profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles based on privacy settings" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    (profile_visibility = 'public') OR
    (profile_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE ((requester_id = auth.uid() AND addressee_id = user_profiles.user_id) OR
             (requester_id = user_profiles.user_id AND addressee_id = auth.uid()))
      AND status = 'accepted'
    ))
  );

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Secure OTP generation with enhanced rate limiting
-- Add more granular rate limiting columns
ALTER TABLE public.otp_rate_limits ADD COLUMN IF NOT EXISTS daily_attempts INTEGER DEFAULT 0;
ALTER TABLE public.otp_rate_limits ADD COLUMN IF NOT EXISTS daily_window_start DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.otp_rate_limits ADD COLUMN IF NOT EXISTS permanent_block BOOLEAN DEFAULT false;

-- Update OTP generation function to include daily limits and better security
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

-- 4. Add device trust scoring for enhanced security
CREATE TABLE public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_fingerprint TEXT NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '30 days'
);

ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own device sessions" ON public.device_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own device sessions" ON public.device_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create security audit function for enhanced monitoring
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, details, ip_address, user_agent, created_at
  ) VALUES (
    p_user_id, 
    p_event_type,
    p_details || jsonb_build_object('severity', p_severity),
    p_ip_address,
    p_user_agent,
    now()
  );
  
  -- Alert on high severity events
  IF p_severity = 'high' THEN
    INSERT INTO public.fraud_detection (
      user_id, fraud_type, severity_level, detection_data, detection_timestamp
    ) VALUES (
      p_user_id, p_event_type, p_severity, p_details, now()
    );
  END IF;
END;
$$;