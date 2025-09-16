-- Fix security vulnerability: Add RLS policies to views that expose sensitive user data
-- This prevents unauthorized access to personal information, financial data, and transaction history

-- Enable RLS on all views that contain sensitive user data
ALTER VIEW public.v_user_wallet SET (security_invoker = on);
ALTER VIEW public.v_daily_summary SET (security_invoker = on); 
ALTER VIEW public.v_redemption_history SET (security_invoker = on);

-- Create RLS policies for the user wallet view to restrict access to own data only
CREATE POLICY "Users can only view their own wallet summary" ON public.v_user_wallet
FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for daily summary view to restrict access to own data only  
CREATE POLICY "Users can only view their own daily summary" ON public.v_daily_summary
FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for redemption history view to restrict access to own data only
CREATE POLICY "Users can only view their own redemption history" ON public.v_redemption_history  
FOR SELECT USING (auth.uid() = user_id);

-- Enable RLS on the views
ALTER VIEW public.v_user_wallet ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_redemption_history ENABLE ROW LEVEL SECURITY;