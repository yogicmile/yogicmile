-- Fix security definer view issue
DROP VIEW IF EXISTS referral_gift_analytics;

CREATE OR REPLACE VIEW referral_gift_analytics 
WITH (security_invoker=true)
AS
SELECT 
  DATE(awarded_date) as date,
  bonus_type,
  COUNT(DISTINCT recipient_user_id) as active_referrers,
  COUNT(*) as total_gifts,
  SUM(steps_awarded) as total_steps_gifted,
  SUM(paisa_value) as total_potential_paisa,
  ROUND(AVG(recipient_phase_at_award), 2) as avg_recipient_phase
FROM step_bonuses_log
WHERE bonus_type IN ('referral_signup', 'referral_daily_gift', 'community_motivation')
GROUP BY DATE(awarded_date), bonus_type
ORDER BY date DESC, bonus_type;