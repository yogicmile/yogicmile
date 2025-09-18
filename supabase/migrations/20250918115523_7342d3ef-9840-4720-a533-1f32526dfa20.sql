-- PHASE 1: CRITICAL SECURITY FIXES (Fixed)

-- 1. Create secure user roles system to prevent privilege escalation
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin', 'moderator');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
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
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 2. Fix user_profiles data exposure with granular privacy controls
-- Add privacy settings to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'friends' CHECK (profile_visibility IN ('public', 'friends', 'private'));
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS show_activity_score BOOLEAN DEFAULT true;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT true;

-- Drop ALL existing policies on user_profiles to recreate securely
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles based on privacy settings" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

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

-- 4. Add device trust scoring for enhanced security
CREATE TABLE IF NOT EXISTS public.device_sessions (
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

DROP POLICY IF EXISTS "Users can view their own device sessions" ON public.device_sessions;
DROP POLICY IF EXISTS "Users can manage their own device sessions" ON public.device_sessions;

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