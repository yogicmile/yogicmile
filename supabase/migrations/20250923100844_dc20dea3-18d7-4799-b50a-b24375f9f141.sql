-- Fix critical RLS policy issues (handle existing policies)

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

-- 2. Drop and recreate user profile policies with correct privacy controls
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles viewable based on privacy settings" ON public.user_profiles;

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

-- 3. Fix challenge policies using the security definer function
DROP POLICY IF EXISTS "Users can view challenges based on privacy and participation" ON public.challenges;
DROP POLICY IF EXISTS "Users can view participants of accessible challenges" ON public.challenge_participants;

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

-- 4. Add security functions
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
  IF p_requester_id = p_data_owner_id OR 
     public.has_role(p_requester_id, 'admin'::app_role) THEN
    RETURN p_data;
  END IF;
  
  IF LENGTH(p_data) > 4 THEN
    RETURN LEFT(p_data, 2) || REPEAT('*', LENGTH(p_data) - 4) || RIGHT(p_data, 2);
  ELSE
    RETURN REPEAT('*', LENGTH(p_data));
  END IF;
END;
$$;

-- 5. Create rate limiting table if it doesn't exist
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

-- Enable RLS on rate_limits if not already enabled
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop and recreate rate limiting policies
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can update rate limits" ON public.rate_limits;

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