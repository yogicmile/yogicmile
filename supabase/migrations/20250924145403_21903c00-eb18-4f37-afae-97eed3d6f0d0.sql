-- Create rate_limits table and fraud detection function (corrected)
-- 1) rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_op ON public.rate_limits (user_id, operation_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits (window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage their own rate limits" ON public.rate_limits;
CREATE POLICY "Users can manage their own rate limits"
  ON public.rate_limits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2) Fraud detection function
CREATE OR REPLACE FUNCTION public.detect_fraud_patterns(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_logins_10m INTEGER := 0;
  v_high_events_30m INTEGER := 0;
BEGIN
  -- Basic fraud detection based on audit_logs
  SELECT COUNT(*) INTO v_failed_logins_10m
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND action IN ('login_failed', 'multiple_failed_logins')
    AND created_at > now() - interval '10 minutes';

  SELECT COUNT(*) INTO v_high_events_30m
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND (details->>'severity') = 'high'
    AND created_at > now() - interval '30 minutes';

  -- Flag as fraud if too many failures or high severity events
  IF v_failed_logins_10m >= 5 OR v_high_events_30m >= 3 THEN
    RETURN TRUE;
  END IF;

  -- Flag specific risky activity types
  IF p_activity_type IN ('data_breach_attempt', 'unauthorized_access') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;