-- Fix Security Definer Views Issue
-- Drop existing views that may have SECURITY DEFINER property
DROP VIEW IF EXISTS public.v_daily_summary CASCADE;
DROP VIEW IF EXISTS public.v_redemption_history CASCADE;
DROP VIEW IF EXISTS public.v_user_wallet CASCADE;

-- Recreate v_daily_summary without SECURITY DEFINER
CREATE VIEW public.v_daily_summary AS
SELECT 
    user_id,
    date,
    sum(steps) AS daily_steps,
    sum(coins_earned) AS daily_coins
FROM step_logs
GROUP BY user_id, date;

-- Enable RLS on the view
ALTER VIEW public.v_daily_summary ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only see their own data
CREATE POLICY "Users can view their own daily summary" 
ON public.v_daily_summary 
FOR SELECT 
USING (auth.uid() = user_id);

-- Recreate v_redemption_history without SECURITY DEFINER
CREATE VIEW public.v_redemption_history AS
SELECT 
    r.id AS redemption_id,
    r.user_id,
    rw.name AS reward_name,
    r.coins_spent,
    r.status,
    r.created_at
FROM redemptions r
JOIN rewards rw ON r.reward_id = rw.id;

-- Enable RLS on the view
ALTER VIEW public.v_redemption_history ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only see their own redemption history
CREATE POLICY "Users can view their own redemption history" 
ON public.v_redemption_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Recreate v_user_wallet without SECURITY DEFINER
CREATE VIEW public.v_user_wallet AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.phase,
    w.balance_paisa,
    w.balance_rupees,
    COALESCE(sum(s.steps), 0::bigint) AS total_steps
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN step_logs s ON u.id = s.user_id
GROUP BY u.id, u.full_name, u.phase, w.balance_paisa, w.balance_rupees;

-- Enable RLS on the view
ALTER VIEW public.v_user_wallet ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only see their own wallet data
CREATE POLICY "Users can view their own wallet data" 
ON public.v_user_wallet 
FOR SELECT 
USING (auth.uid() = user_id);