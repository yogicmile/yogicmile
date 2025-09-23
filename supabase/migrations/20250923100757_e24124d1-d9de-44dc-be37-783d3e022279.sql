-- Fix critical RLS policy issues identified in security review (corrected version)

-- 1. Fix infinite recursion in challenge policies by creating security definer functions
CREATE OR REPLACE FUNCTION public.get_user_challenge_role(challenge_id_param uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'creator' WHERE EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id_param AND creator_id = auth.uid()
  )
  UNION
  SELECT 'participant' WHERE EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_id = challenge_id_param AND user_id = auth.uid()
  )
  UNION
  SELECT 'none'
  LIMIT 1;
$$;

-- 2. Remove overly permissive user data policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;

-- Create proper user data access policies (only for users table if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    CREATE POLICY "Users can view only their own user data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

    CREATE POLICY "Users can update only their own user data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;

-- 3. Fix user profiles with proper privacy controls using correct column name
CREATE POLICY "Users can manage their own profile"
ON public.user_profiles
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Public profiles viewable based on privacy settings"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = user_id OR 
  privacy_setting = 'public' OR
  (
    privacy_setting = 'friends' AND
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' AND 
      ((requester_id = auth.uid() AND addressee_id = user_id) OR 
       (requester_id = user_id AND addressee_id = auth.uid()))
    )
  )
);

-- 4. Fix challenge policies using the security definer function
DROP POLICY IF EXISTS "Users can view public challenges and their own" ON public.challenges;
DROP POLICY IF EXISTS "Users can view challenge participants" ON public.challenge_participants;

CREATE POLICY "Users can view challenges based on privacy and participation"
ON public.challenges
FOR SELECT
USING (
  privacy_setting = 'public' OR
  creator_id = auth.uid() OR
  public.get_user_challenge_role(id) = 'participant'
);

CREATE POLICY "Users can view participants of accessible challenges"
ON public.challenge_participants
FOR SELECT
USING (
  user_id = auth.uid() OR
  public.get_user_challenge_role(challenge_id) IN ('creator', 'participant') OR
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id AND privacy_setting = 'public'
  )
);

-- 5. Add privacy protection for forum posts (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Forum posts respect user privacy" ON public.forum_posts;
    
    CREATE POLICY "Forum posts respect user privacy"
    ON public.forum_posts
    FOR SELECT
    USING (
      -- Always allow viewing own posts
      author_id = auth.uid() OR
      -- Only show posts from users with public profiles or friends
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = forum_posts.author_id AND (
          up.privacy_setting = 'public' OR
          (
            up.privacy_setting = 'friends' AND
            EXISTS (
              SELECT 1 FROM public.friendships 
              WHERE status = 'accepted' AND 
              ((requester_id = auth.uid() AND addressee_id = up.user_id) OR 
               (requester_id = up.user_id AND addressee_id = auth.uid()))
            )
          )
        )
      )
    );
  END IF;
END $$;

-- 6. Add security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_violation(
  p_violation_type text,
  p_table_name text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, details, created_at
  ) VALUES (
    auth.uid(),
    'security_violation',
    jsonb_build_object(
      'violation_type', p_violation_type,
      'table_name', p_table_name,
      'details', p_details,
      'severity', 'high'
    ),
    now()
  );
END;
$$;

-- 7. Add data masking function for sensitive user information
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  p_data text,
  p_requester_id uuid,
  p_data_owner_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If requesting own data or admin, return full data
  IF p_requester_id = p_data_owner_id OR 
     public.has_role(p_requester_id, 'admin'::app_role) THEN
    RETURN p_data;
  END IF;
  
  -- Otherwise, mask the data
  IF LENGTH(p_data) > 4 THEN
    RETURN LEFT(p_data, 2) || REPEAT('*', LENGTH(p_data) - 4) || RIGHT(p_data, 2);
  ELSE
    RETURN REPEAT('*', LENGTH(p_data));
  END IF;
END;
$$;

-- 8. Add enhanced privacy settings table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility text NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  data_sharing_enabled boolean NOT NULL DEFAULT true,
  marketing_emails_enabled boolean NOT NULL DEFAULT true,
  analytics_tracking_enabled boolean NOT NULL DEFAULT true,
  location_sharing_enabled boolean NOT NULL DEFAULT false,
  activity_visibility text NOT NULL DEFAULT 'friends' CHECK (activity_visibility IN ('public', 'friends', 'private')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on privacy settings
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own privacy settings"
ON public.privacy_settings
FOR ALL
USING (auth.uid() = user_id);

-- 9. Add fraud detection enhancements
CREATE OR REPLACE FUNCTION public.detect_fraud_patterns(
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_fraud boolean := false;
  v_step_count integer;
BEGIN
  -- Check for suspicious step patterns
  IF p_activity_type = 'steps' THEN
    v_step_count := (p_activity_data->>'steps')::integer;
    
    -- Flag steps over 50,000 per day
    IF v_step_count > 50000 THEN
      v_is_fraud := true;
      
      -- Log the fraud detection if table exists
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fraud_detection' AND table_schema = 'public') THEN
        INSERT INTO public.fraud_detection (
          user_id, fraud_type, severity_level, detection_data, detection_timestamp
        ) VALUES (
          p_user_id,
          'excessive_steps',
          'high',
          jsonb_build_object(
            'steps', v_step_count,
            'threshold', 50000,
            'activity_data', p_activity_data
          ),
          now()
        );
      END IF;
    END IF;
  END IF;
  
  RETURN v_is_fraud;
END;
$$;

-- 10. Add rate limiting table and policies
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
ON public.rate_limits
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update rate limits"
ON public.rate_limits
FOR UPDATE
USING (true);