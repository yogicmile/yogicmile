-- Fix search path security issue for existing functions
ALTER FUNCTION public.get_user_subscription_status(UUID) SET search_path = public;
ALTER FUNCTION public.has_active_boost(UUID, TEXT) SET search_path = public;

-- Update the function definition to include SET search_path
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(p_user_id UUID)
RETURNS TABLE (
  plan_type subscription_plan,
  status subscription_status,
  is_premium BOOLEAN,
  is_family_member BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check direct subscription
  SELECT s.plan_type, s.status, 
         s.plan_type IN ('premium', 'family') as is_premium,
         false as is_family_member,
         s.current_period_end as expires_at
  INTO plan_type, status, is_premium, is_family_member, expires_at
  FROM public.subscriptions s 
  WHERE s.user_id = p_user_id AND s.status = 'active';
  
  -- If no direct subscription, check family membership
  IF NOT FOUND THEN
    SELECT 'family'::subscription_plan, fp.status,
           true as is_premium,
           true as is_family_member,
           fp.current_period_end as expires_at
    INTO plan_type, status, is_premium, is_family_member, expires_at
    FROM public.family_members fm
    JOIN public.family_plans fp ON fm.family_plan_id = fp.id
    WHERE fm.member_user_id = p_user_id AND fp.status = 'active';
  END IF;
  
  -- If still no subscription found, return free tier
  IF NOT FOUND THEN
    plan_type := 'free';
    status := 'active';
    is_premium := false;
    is_family_member := false;
    expires_at := NULL;
  END IF;
  
  RETURN NEXT;
END;
$$;