-- Fix referral system tables by dropping and recreating properly

-- Drop the problematic tables if they exist
DROP TABLE IF EXISTS public.referrals_new CASCADE;
DROP TABLE IF EXISTS public.share_logs CASCADE;

-- Create share_logs table first (no dependencies)
CREATE TABLE public.share_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  share_type TEXT NOT NULL,
  share_context TEXT,
  content_shared TEXT,
  platform TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  analytics_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on share_logs
ALTER TABLE public.share_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for share_logs
CREATE POLICY "Users can view their own share logs" 
ON public.share_logs 
FOR SELECT 
USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own share logs" 
ON public.share_logs 
FOR INSERT 
WITH CHECK (user_id::text = auth.uid()::text);

-- Create referrals table with proper structure
CREATE TABLE public.referrals_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_mobile TEXT NOT NULL,
  referee_mobile TEXT NOT NULL,
  referrer_user_id UUID,
  referee_user_id UUID,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_paid BOOLEAN DEFAULT FALSE,
  steps_completed INTEGER DEFAULT 0,
  minimum_steps_required INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referee_mobile),
  UNIQUE(referee_user_id)
);

-- Enable RLS on referrals_new
ALTER TABLE public.referrals_new ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals_new
CREATE POLICY "Users can view referrals they are involved in" 
ON public.referrals_new 
FOR SELECT 
USING (referrer_user_id::text = auth.uid()::text OR referee_user_id::text = auth.uid()::text);

CREATE POLICY "Users can create referrals as referee" 
ON public.referrals_new 
FOR INSERT 
WITH CHECK (referee_user_id::text = auth.uid()::text);

CREATE POLICY "System can update referral status" 
ON public.referrals_new 
FOR UPDATE 
USING (true);

-- Create or replace the generate referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code(mobile_number_param TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extract last 4 digits from mobile number and prepend with YM
  RETURN 'YM' || RIGHT(REGEXP_REPLACE(mobile_number_param, '[^0-9]', '', 'g'), 4);
END;
$$;

-- Create function to log social shares
CREATE OR REPLACE FUNCTION public.log_social_share(
  p_user_id UUID,
  p_share_type TEXT,
  p_platform TEXT,
  p_content TEXT DEFAULT NULL,
  p_context TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  v_share_id UUID;
BEGIN
  INSERT INTO public.share_logs (
    user_id,
    share_type, 
    platform,
    content_shared,
    share_context
  ) VALUES (
    p_user_id,
    p_share_type,
    p_platform, 
    p_content,
    p_context
  ) RETURNING id INTO v_share_id;
  
  RETURN v_share_id;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_mobile ON public.referrals_new(referrer_mobile);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_mobile ON public.referrals_new(referee_mobile);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals_new(status);
CREATE INDEX IF NOT EXISTS idx_share_logs_user_type ON public.share_logs(user_id, share_type);

-- Insert sample referral data
INSERT INTO public.referrals_new (referrer_mobile, referee_mobile, referral_code, referrer_user_id, referee_user_id, status, steps_completed) VALUES
('9876543210', '9876543211', 'YM3210', null, null, 'completed', 1500),
('9876543212', '9876543213', 'YM3212', null, null, 'pending', 800),
('9876543214', '9876543215', 'YM3214', null, null, 'completed', 2000)
ON CONFLICT DO NOTHING;