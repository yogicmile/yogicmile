-- CRITICAL SECURITY FIXES (Corrected)

-- 1. Fix dangerous OTP RLS policy that allows unauthenticated access
DROP POLICY IF EXISTS "Insert OTPs for users" ON public.otp_logs;

-- Create secure OTP insert policy - only service role can insert OTPs
CREATE POLICY "Service role can insert OTPs" 
ON public.otp_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 2. Since views can't have RLS directly, drop and recreate them with security
-- These views will inherit RLS from their underlying tables

-- Drop existing views
DROP VIEW IF EXISTS public.v_daily_summary;
DROP VIEW IF EXISTS public.v_redemption_history;
DROP VIEW IF EXISTS public.v_user_wallet;

-- Recreate views with security definer functions for controlled access
CREATE OR REPLACE VIEW public.v_daily_summary
WITH (security_invoker=false) AS
SELECT 
  sl.user_id,
  sl.date,
  COALESCE(SUM(sl.steps), 0) as daily_steps,
  COALESCE(SUM(sl.coins_earned), 0) as daily_coins
FROM step_logs sl
WHERE sl.user_id = auth.uid()
GROUP BY sl.user_id, sl.date;

CREATE OR REPLACE VIEW public.v_redemption_history  
WITH (security_invoker=false) AS
SELECT 
  r.id as redemption_id,
  r.user_id,
  rw.name as reward_name,
  r.coins_spent,
  r.status,
  r.created_at
FROM redemptions r
JOIN rewards rw ON r.reward_id = rw.id
WHERE r.user_id = auth.uid();

CREATE OR REPLACE VIEW public.v_user_wallet
WITH (security_invoker=false) AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.phase,
  COALESCE(SUM(sl.steps), 0) as total_steps,
  COALESCE(w.balance_paisa, 0) as balance_paisa,
  ROUND(COALESCE(w.balance_paisa, 0) / 100.0, 2) as balance_rupees
FROM users u
LEFT JOIN step_logs sl ON u.id = sl.user_id
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.id = auth.uid()
GROUP BY u.id, u.full_name, u.phase, w.balance_paisa;

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