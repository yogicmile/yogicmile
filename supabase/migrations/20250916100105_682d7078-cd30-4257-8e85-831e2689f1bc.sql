-- Fix security vulnerability: Ensure all tables with sensitive data have complete RLS policies
-- The views will inherit proper access control from these underlying table policies

-- Fix wallets table - add missing INSERT/UPDATE policies so the application can function properly
CREATE POLICY "Users can insert their own wallet" ON public.wallets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets  
FOR UPDATE USING (auth.uid() = user_id);

-- Fix step_logs table - add missing policies for user access
CREATE POLICY "Users can insert their own step logs" ON public.step_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own step logs" ON public.step_logs
FOR UPDATE USING (auth.uid() = user_id);

-- Fix redemptions table - add missing INSERT policy 
CREATE POLICY "Users can insert their own redemptions" ON public.redemptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix referrals table - add missing INSERT policy
CREATE POLICY "Users can insert referrals" ON public.referrals  
FOR INSERT WITH CHECK (auth.uid() = referrer_id);