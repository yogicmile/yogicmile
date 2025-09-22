-- Create referral system tables for comprehensive tracking

-- Create referrals_new table for tracking referral relationships
CREATE TABLE IF NOT EXISTS public.referrals_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_mobile TEXT NOT NULL,
  referee_mobile TEXT NOT NULL,
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

CREATE POLICY "Users can create referrals as referee" 
ON public.referrals_new 
FOR INSERT 
WITH CHECK (auth.uid() = referee_user_id);

CREATE POLICY "System can update referral status" 
ON public.referrals_new 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create share_logs table for tracking social media shares
CREATE TABLE IF NOT EXISTS public.share_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own share logs" 
ON public.share_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add referral_code column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
        ALTER TABLE public.users ADD COLUMN referral_code TEXT UNIQUE;
    END IF;
END $$;

-- Add mobile_number column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mobile_number') THEN
        ALTER TABLE public.users ADD COLUMN mobile_number TEXT UNIQUE;
    END IF;
END $$;

-- Create function to generate referral code from mobile number
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

-- Create function to process referral signup
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  p_referee_user_id UUID,
  p_referee_mobile TEXT,
  p_referral_code TEXT
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_user RECORD;
  v_existing_referral RECORD;
  v_referral_id UUID;
BEGIN
  -- Validate inputs
  IF p_referee_user_id IS NULL OR p_referee_mobile IS NULL OR p_referral_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required parameters');
  END IF;

  -- Check if referee already used a referral code
  SELECT * INTO v_existing_referral 
  FROM public.referrals_new 
  WHERE referee_user_id = p_referee_user_id OR referee_mobile = p_referee_mobile;
  
  IF v_existing_referral.id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already used a referral code');
  END IF;

  -- Find referrer by referral code
  SELECT * INTO v_referrer_user 
  FROM public.users 
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Check for self-referral
  IF v_referrer_user.id = p_referee_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot use your own referral code');
  END IF;

  -- Create referral relationship
  INSERT INTO public.referrals_new (
    referrer_mobile, 
    referee_mobile, 
    referrer_user_id, 
    referee_user_id, 
    referral_code
  ) VALUES (
    v_referrer_user.mobile_number, 
    p_referee_mobile, 
    v_referrer_user.id, 
    p_referee_user_id, 
    p_referral_code
  ) RETURNING id INTO v_referral_id;

  -- Give immediate welcome bonus to referee (100 paisa)
  INSERT INTO public.bonus_logs (
    user_id, 
    bonus_type, 
    amount_paisa, 
    description
  ) VALUES (
    p_referee_user_id, 
    'referral_welcome', 
    100, 
    'Welcome bonus for using referral code'
  );

  -- Update referee's wallet
  INSERT INTO public.wallet_balances (user_id, total_balance, total_earned)
  VALUES (p_referee_user_id, 100, 100)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_balance = wallet_balances.total_balance + 100,
    total_earned = wallet_balances.total_earned + 100,
    last_updated = now();

  RETURN jsonb_build_object(
    'success', true, 
    'referral_id', v_referral_id,
    'welcome_bonus', 100,
    'message', 'Referral processed successfully. Welcome bonus added!'
  );
END;
$$;

-- Create function to complete referral (when referee reaches minimum steps)
CREATE OR REPLACE FUNCTION public.complete_referral(
  p_referee_user_id UUID,
  p_steps_completed INTEGER
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_referrer_bonus INTEGER := 200; -- 200 paisa for referrer
BEGIN
  -- Get pending referral for this referee
  SELECT * INTO v_referral 
  FROM public.referrals_new 
  WHERE referee_user_id = p_referee_user_id 
    AND status = 'pending'
    AND bonus_paid = false;
  
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No pending referral found');
  END IF;

  -- Check if minimum steps requirement is met
  IF p_steps_completed < v_referral.minimum_steps_required THEN
    -- Update steps but don't complete yet
    UPDATE public.referrals_new 
    SET steps_completed = p_steps_completed
    WHERE id = v_referral.id;
    
    RETURN jsonb_build_object(
      'success', false, 
      'message', format('Need %s more steps to complete referral', 
                       v_referral.minimum_steps_required - p_steps_completed)
    );
  END IF;

  -- Complete the referral
  UPDATE public.referrals_new 
  SET 
    status = 'completed',
    bonus_paid = true,
    steps_completed = p_steps_completed,
    completed_at = now()
  WHERE id = v_referral.id;

  -- Give bonus to referrer (200 paisa)
  INSERT INTO public.bonus_logs (
    user_id, 
    bonus_type, 
    amount_paisa, 
    description
  ) VALUES (
    v_referral.referrer_user_id, 
    'referral_completion', 
    v_referrer_bonus, 
    format('Referral bonus for %s completing %s steps', 
           v_referral.referee_mobile, p_steps_completed)
  );

  -- Update referrer's wallet
  INSERT INTO public.wallet_balances (user_id, total_balance, total_earned)
  VALUES (v_referral.referrer_user_id, v_referrer_bonus, v_referrer_bonus)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_balance = wallet_balances.total_balance + v_referrer_bonus,
    total_earned = wallet_balances.total_earned + v_referrer_bonus,
    last_updated = now();

  RETURN jsonb_build_object(
    'success', true, 
    'referrer_bonus', v_referrer_bonus,
    'message', 'Referral completed successfully! Bonuses distributed.'
  );
END;
$$;

-- Create function to log social share
CREATE OR REPLACE FUNCTION public.log_social_share(
  p_user_id UUID,
  p_share_type TEXT,
  p_platform TEXT,
  p_content TEXT DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.share_logs (
    user_id, 
    share_type, 
    platform, 
    content_shared,
    analytics_data
  ) VALUES (
    p_user_id, 
    p_share_type, 
    p_platform, 
    p_content,
    jsonb_build_object(
      'timestamp', extract(epoch from now()),
      'user_agent', 'test_environment'
    )
  );

  RETURN jsonb_build_object('success', true, 'message', 'Share logged successfully');
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_mobile ON public.referrals_new(referrer_mobile);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_mobile ON public.referrals_new(referee_mobile);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals_new(status);
CREATE INDEX IF NOT EXISTS idx_share_logs_user_type ON public.share_logs(user_id, share_type);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_mobile_number ON public.users(mobile_number);