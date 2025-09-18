-- Create enum types for subscription system
CREATE TYPE subscription_plan AS ENUM ('free', 'premium', 'family');
CREATE TYPE payment_gateway AS ENUM ('stripe', 'razorpay');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'paused');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  payment_gateway payment_gateway,
  stripe_subscription_id TEXT UNIQUE,
  razorpay_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  family_plan_id UUID,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family plans table
CREATE TABLE public.family_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'Family Plan',
  max_members INTEGER NOT NULL DEFAULT 6,
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  payment_gateway payment_gateway,
  stripe_subscription_id TEXT UNIQUE,
  razorpay_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_plan_id UUID NOT NULL REFERENCES public.family_plans(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('primary', 'member')),
  parental_controls_enabled BOOLEAN DEFAULT false,
  added_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(family_plan_id, member_user_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  family_plan_id UUID REFERENCES public.family_plans(id) ON DELETE CASCADE,
  payment_gateway payment_gateway NOT NULL,
  gateway_payment_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'pending',
  receipt_url TEXT,
  invoice_id TEXT,
  payment_method_details JSONB,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create boost purchases table for one-time premium features
CREATE TABLE public.boost_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('double_rewards_24h', 'streak_protector', 'phase_rush', 'lucky_spin_x5')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_gateway payment_gateway NOT NULL,
  gateway_payment_id TEXT NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium rewards table
CREATE TABLE public.premium_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  min_tier subscription_plan NOT NULL DEFAULT 'premium',
  value_inr INTEGER NOT NULL,
  redemption_cost_paisa INTEGER NOT NULL,
  stock_quantity INTEGER,
  image_url TEXT,
  partner_brand TEXT,
  is_experience BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium challenges table
CREATE TABLE public.premium_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value BIGINT NOT NULL,
  duration_days INTEGER NOT NULL,
  min_tier subscription_plan NOT NULL DEFAULT 'premium',
  reward_paisa INTEGER NOT NULL DEFAULT 0,
  badge_icon TEXT,
  is_seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium user challenge progress table
CREATE TABLE public.premium_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.premium_challenges(id) ON DELETE CASCADE,
  current_progress BIGINT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Add foreign key reference for family_plan_id in subscriptions
ALTER TABLE public.subscriptions 
ADD CONSTRAINT fk_subscriptions_family_plan 
FOREIGN KEY (family_plan_id) REFERENCES public.family_plans(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for family plans
CREATE POLICY "Primary users can manage their family plan" ON public.family_plans
  FOR ALL USING (auth.uid() = primary_user_id);

CREATE POLICY "Family members can view their family plan" ON public.family_plans
  FOR SELECT USING (
    auth.uid() = primary_user_id OR 
    EXISTS (SELECT 1 FROM public.family_members WHERE family_plan_id = id AND member_user_id = auth.uid())
  );

-- Create RLS policies for family members
CREATE POLICY "Primary users can manage family members" ON public.family_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.family_plans WHERE id = family_plan_id AND primary_user_id = auth.uid())
  );

CREATE POLICY "Family members can view family member list" ON public.family_members
  FOR SELECT USING (
    member_user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.family_plans WHERE id = family_plan_id AND primary_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.family_plan_id = family_plan_id AND fm.member_user_id = auth.uid())
  );

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for boost purchases
CREATE POLICY "Users can manage their own boosts" ON public.boost_purchases
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for premium rewards
CREATE POLICY "Everyone can view active premium rewards" ON public.premium_rewards
  FOR SELECT USING (is_active = true);

-- Create RLS policies for premium challenges
CREATE POLICY "Everyone can view active premium challenges" ON public.premium_challenges
  FOR SELECT USING (is_active = true);

-- Create RLS policies for premium challenge progress
CREATE POLICY "Users can manage their own challenge progress" ON public.premium_challenge_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for subscription management
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(p_user_id UUID)
RETURNS TABLE (
  plan_type subscription_plan,
  status subscription_status,
  is_premium BOOLEAN,
  is_family_member BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check direct subscription
  SELECT s.plan_type, s.status, 
         s.plan_type IN ('premium', 'family') as is_premium,
         false as is_family_member,
         s.current_period_end as expires_at
  INTO plan_type, status, is_premium, is_family_member, expires_at
  FROM public.subscriptions s 
  WHERE s.user_id = p_user_id AND s.status = 'active';
  
  -- If no direct subscription, check family membership
  IF NOT FOUND THEN
    SELECT fp.plan_type::TEXT::subscription_plan, fp.status,
           true as is_premium,
           true as is_family_member,
           fp.current_period_end as expires_at
    INTO plan_type, status, is_premium, is_family_member, expires_at
    FROM public.family_members fm
    JOIN public.family_plans fp ON fm.family_plan_id = fp.id
    WHERE fm.member_user_id = p_user_id AND fp.status = 'active';
  END IF;
  
  -- If still no subscription found, return free tier
  IF NOT FOUND THEN
    plan_type := 'free';
    status := 'active';
    is_premium := false;
    is_family_member := false;
    expires_at := NULL;
  END IF;
  
  RETURN NEXT;
END;
$$;

-- Create function to check if user has active boost
CREATE OR REPLACE FUNCTION public.has_active_boost(p_user_id UUID, p_boost_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.boost_purchases 
    WHERE user_id = p_user_id 
    AND boost_type = p_boost_type 
    AND status = 'succeeded'
    AND (expires_at IS NULL OR expires_at > now())
    AND used_at IS NULL
  );
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_plans_updated_at
  BEFORE UPDATE ON public.family_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_premium_rewards_updated_at
  BEFORE UPDATE ON public.premium_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample premium rewards
INSERT INTO public.premium_rewards (title, description, category, min_tier, value_inr, redemption_cost_paisa, stock_quantity, partner_brand) VALUES
('Premium Fitness Band', 'High-quality fitness tracker with heart rate monitoring', 'Electronics', 'premium', 5000, 250000, 50, 'FitTrack'),
('Luxury Spa Voucher', '90-minute premium spa treatment package', 'Experience', 'premium', 3000, 150000, 20, 'Wellness Spa'),
('Premium Gym Membership', '3-month premium gym membership', 'Fitness', 'premium', 8000, 400000, 30, 'Elite Fitness'),
('Apple AirPods Pro', 'Latest Apple AirPods with noise cancellation', 'Electronics', 'family', 25000, 1250000, 10, 'Apple'),
('Weekend Wellness Retreat', '2-day wellness retreat in the mountains', 'Experience', 'family', 15000, 750000, 5, 'Mountain Retreat');

-- Insert some sample premium challenges
INSERT INTO public.premium_challenges (title, description, challenge_type, target_value, duration_days, min_tier, reward_paisa, badge_icon, is_seasonal) VALUES
('Marathon Month', 'Walk 1 million steps in 30 days', 'steps', 1000000, 30, 'premium', 50000, '🏃‍♀️', false),
('500K Streak Challenge', 'Maintain a 500K step streak', 'streak', 500000, 60, 'premium', 75000, '🔥', false),
('Elite Explorer', 'Walk in 10 different cities', 'location', 10, 90, 'premium', 100000, '🗺️', false),
('Family Unity Challenge', 'Complete as a family with combined 2M steps', 'family_steps', 2000000, 30, 'family', 150000, '👨‍👩‍👧‍👦', true),
('Premium Pioneer', 'Early adopter exclusive challenge', 'special', 1, 365, 'premium', 200000, '⭐', true);