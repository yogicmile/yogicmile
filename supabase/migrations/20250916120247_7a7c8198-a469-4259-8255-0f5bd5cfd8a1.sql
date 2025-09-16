-- Create referrals table for tracking referral relationships
CREATE TABLE public.referrals_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_mobile TEXT NOT NULL,
  referee_mobile TEXT NOT NULL,
  referrer_bonus_paisa INTEGER NOT NULL DEFAULT 200,
  referee_bonus_paisa INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streaks table for tracking user streaks
CREATE TABLE public.streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  last_5k_steps_date DATE,
  streak_bonus_earned_date DATE,
  bonus_eligibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create share_logs table for tracking social shares
CREATE TABLE public.share_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  share_type TEXT NOT NULL CHECK (share_type IN ('achievement', 'referral', 'milestone', 'phase_upgrade', 'voucher_redemption', 'daily_summary', 'streak')),
  share_context TEXT,
  platform TEXT,
  content_shared TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bonus_logs table for tracking all bonuses
CREATE TABLE public.bonus_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('video', 'streak', 'referral', 'welcome', 'daily_double')),
  amount_paisa INTEGER NOT NULL,
  description TEXT,
  date_earned DATE NOT NULL DEFAULT current_date,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add referral_code column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS used_referral_code TEXT;

-- Enable RLS on new tables
ALTER TABLE public.referrals_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals_new
CREATE POLICY "Users can view their referral relationships" 
ON public.referrals_new 
FOR SELECT 
USING (auth.uid()::text IN (referrer_mobile, referee_mobile));

CREATE POLICY "Users can insert referral relationships" 
ON public.referrals_new 
FOR INSERT 
WITH CHECK (true); -- Allow system to create referrals

-- RLS Policies for streaks
CREATE POLICY "Users can view their own streaks" 
ON public.streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for share_logs
CREATE POLICY "Users can view their own share logs" 
ON public.share_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own share logs" 
ON public.share_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bonus_logs
CREATE POLICY "Users can view their own bonus logs" 
ON public.bonus_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bonus logs" 
ON public.bonus_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_referrals_new_referrer ON public.referrals_new(referrer_mobile);
CREATE INDEX idx_referrals_new_referee ON public.referrals_new(referee_mobile);
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX idx_share_logs_user_timestamp ON public.share_logs(user_id, timestamp DESC);
CREATE INDEX idx_bonus_logs_user_date ON public.bonus_logs(user_id, date_earned DESC);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);

-- Generate referral codes for existing users (using mobile number last 4 digits)
UPDATE public.users 
SET referral_code = 'YM' || RIGHT(mobile_number, 4)
WHERE referral_code IS NULL AND mobile_number IS NOT NULL;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_referrals_new_updated_at
BEFORE UPDATE ON public.referrals_new
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
BEFORE UPDATE ON public.streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock referral data for testing
INSERT INTO public.referrals_new (referrer_mobile, referee_mobile, status) VALUES
('+919876543210', '+919876543211', 'completed'),
('+919876543210', '+919876543212', 'completed'),
('+919876543213', '+919876543214', 'pending');

-- Insert mock streak data
INSERT INTO public.streaks (user_id, current_streak_days, longest_streak, last_activity_date) 
SELECT id, 3, 7, current_date - 1 
FROM public.users 
WHERE mobile_number = '+919876543210'
LIMIT 1;

-- Insert mock bonus logs
INSERT INTO public.bonus_logs (user_id, bonus_type, amount_paisa, description) 
SELECT id, 'referral', 200, 'Friend joined using your referral code'
FROM public.users 
WHERE mobile_number = '+919876543210'
LIMIT 1;