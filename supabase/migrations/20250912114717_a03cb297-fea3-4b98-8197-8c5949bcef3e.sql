-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create step tracking table for daily records
CREATE TABLE public.daily_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  capped_steps INTEGER NOT NULL DEFAULT 0, -- Steps after applying 12k cap
  units_earned INTEGER NOT NULL DEFAULT 0, -- capped_steps / 25
  paisa_earned INTEGER NOT NULL DEFAULT 0, -- units * phase_rate
  phase_id INTEGER NOT NULL DEFAULT 1, -- Current phase when earned
  phase_rate INTEGER NOT NULL DEFAULT 1, -- Rate at time of earning
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create user phases progress table
CREATE TABLE public.user_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1,
  total_lifetime_steps INTEGER NOT NULL DEFAULT 0,
  current_phase_steps INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  phase_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create transactions table for redemptions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'redemption', 'bonus', 'spin_wheel')),
  amount INTEGER NOT NULL, -- Amount in paisa
  description TEXT NOT NULL,
  item_name TEXT, -- For redemptions
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  progress_data JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_type)
);

-- Create spin wheel results table
CREATE TABLE public.spin_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  reward_type TEXT NOT NULL,
  reward_amount INTEGER DEFAULT 0, -- Paisa amount or step bonus
  reward_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create wallet balances table for tracking current balance
CREATE TABLE public.wallet_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_balance INTEGER NOT NULL DEFAULT 0, -- Total balance in paisa
  total_earned INTEGER NOT NULL DEFAULT 0, -- Lifetime earnings in paisa
  total_redeemed INTEGER NOT NULL DEFAULT 0, -- Lifetime redemptions in paisa
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for daily_steps
CREATE POLICY "Users can view their own daily steps" ON public.daily_steps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily steps" ON public.daily_steps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily steps" ON public.daily_steps
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_phases
CREATE POLICY "Users can view their own phases" ON public.user_phases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own phases" ON public.user_phases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own phases" ON public.user_phases
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for spin_results
CREATE POLICY "Users can view their own spin results" ON public.spin_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own spin results" ON public.spin_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for wallet_balances
CREATE POLICY "Users can view their own wallet balance" ON public.wallet_balances
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wallet balance" ON public.wallet_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet balance" ON public.wallet_balances
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user profile and initial data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Yogic Walker')
  );
  
  -- Create initial user phase record
  INSERT INTO public.user_phases (user_id)
  VALUES (NEW.id);
  
  -- Create initial wallet balance
  INSERT INTO public.wallet_balances (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user setup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_phases_updated_at
  BEFORE UPDATE ON public.user_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_daily_steps_user_date ON public.daily_steps(user_id, date DESC);
CREATE INDEX idx_transactions_user_created ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_achievements_user_type ON public.achievements(user_id, achievement_type);
CREATE INDEX idx_spin_results_user_date ON public.spin_results(user_id, date DESC);