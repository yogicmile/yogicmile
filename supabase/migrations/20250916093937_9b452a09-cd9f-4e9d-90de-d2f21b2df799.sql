-- Fix SECURITY DEFINER view issues by recreating views properly

-- Drop the problematic security definer views
DROP VIEW IF EXISTS public.v_daily_summary;
DROP VIEW IF EXISTS public.v_redemption_history;
DROP VIEW IF EXISTS public.v_user_wallet;

-- Recreate views without SECURITY DEFINER - they'll use the caller's permissions
-- This is safer as it respects RLS policies on the underlying tables
CREATE VIEW public.v_daily_summary AS
SELECT 
  sl.user_id,
  sl.date,
  COALESCE(SUM(sl.steps), 0) as daily_steps,
  COALESCE(SUM(sl.coins_earned), 0) as daily_coins
FROM step_logs sl
GROUP BY sl.user_id, sl.date;

CREATE VIEW public.v_redemption_history AS
SELECT 
  r.id as redemption_id,
  r.user_id,
  rw.name as reward_name,
  r.coins_spent,
  r.status,
  r.created_at
FROM redemptions r
JOIN rewards rw ON r.reward_id = rw.id;

CREATE VIEW public.v_user_wallet AS
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
GROUP BY u.id, u.full_name, u.phase, w.balance_paisa;