-- Fix linter error 0010: Security Definer View by enabling security_invoker on all public views
-- This makes views respect the querying user's permissions & underlying RLS instead of the view owner's

-- Ensure Postgres 15+ (Supabase default) supports security_invoker on views
-- Apply to all known views used by the app
ALTER VIEW IF EXISTS public.v_daily_summary SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_redemption_history SET (security_invoker = on);
ALTER VIEW IF EXISTS public.v_user_wallet SET (security_invoker = on);

-- Optional hardening: mark views as security barriers to prevent leaky predicates via functions
-- (safe no-op if already set)
ALTER VIEW IF EXISTS public.v_daily_summary SET (security_barrier = on);
ALTER VIEW IF EXISTS public.v_redemption_history SET (security_barrier = on);
ALTER VIEW IF EXISTS public.v_user_wallet SET (security_barrier = on);
