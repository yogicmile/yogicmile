-- Fix Security Definer Views Issue
-- Views cannot have RLS directly - security is handled by underlying table policies

-- Drop existing views that may have SECURITY DEFINER property
DROP VIEW IF EXISTS public.v_daily_summary CASCADE;
DROP VIEW IF EXISTS public.v_redemption_history CASCADE;
DROP VIEW IF EXISTS public.v_user_wallet CASCADE;

-- Recreate v_daily_summary without SECURITY DEFINER
-- Security will be enforced by step_logs table RLS policies
CREATE VIEW public.v_daily_summary AS
SELECT 
    user_id,
    date,
    sum(steps) AS daily_steps,
    sum(coins_earned) AS daily_coins
FROM step_logs
GROUP BY user_id, date;

-- Recreate v_redemption_history without SECURITY DEFINER
-- Security will be enforced by redemptions and rewards table RLS policies
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

-- Recreate v_user_wallet without SECURITY DEFINER
-- Security will be enforced by users, wallets, and step_logs table RLS policies
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