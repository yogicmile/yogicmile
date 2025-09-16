-- CRITICAL SECURITY FIXES

-- 1. Fix dangerous OTP RLS policy that allows unauthenticated access
DROP POLICY IF EXISTS "Insert OTPs for users" ON public.otp_logs;

-- Create secure OTP insert policy - only authenticated systems should insert OTPs
CREATE POLICY "System can insert OTPs" 
ON public.otp_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 2. Add RLS policies to views to prevent data exposure
ALTER VIEW public.v_daily_summary SET ROW LEVEL SECURITY;
ALTER VIEW public.v_redemption_history SET ROW LEVEL SECURITY;  
ALTER VIEW public.v_user_wallet SET ROW LEVEL SECURITY;

-- Create RLS policies for views to protect user data
CREATE POLICY "Users can view own daily summary" 
ON public.v_daily_summary 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own redemption history" 
ON public.v_redemption_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet" 
ON public.v_user_wallet 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Restrict business configuration access to authenticated users only
DROP POLICY IF EXISTS "Anyone can view phases" ON public.phases;
CREATE POLICY "Authenticated users can view phases" 
ON public.phases 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
CREATE POLICY "Authenticated users can view active rewards" 
ON public.rewards 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- 4. Create secure function to hash OTPs before storage
CREATE OR REPLACE FUNCTION public.hash_otp(plain_otp text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use crypt with a salt for secure hashing
  RETURN crypt(plain_otp, gen_salt('bf', 8));
END;
$$;

-- 5. Create secure function to verify hashed OTPs
CREATE OR REPLACE FUNCTION public.verify_hashed_otp(plain_otp text, hashed_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(plain_otp, hashed_otp) = hashed_otp;
END;
$$;