-- Create spin wheel related tables for comprehensive tracking

-- Create spin_results table to track all spin outcomes
CREATE TABLE IF NOT EXISTS public.spin_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_type TEXT NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 0,
  reward_description TEXT NOT NULL,
  bonus_spin_awarded BOOLEAN DEFAULT FALSE,
  session_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on spin_results
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;

-- Create policies for spin_results
CREATE POLICY "Users can view their own spin results" 
ON public.spin_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spin results" 
ON public.spin_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create spin_cooldowns table to track user spin availability
CREATE TABLE IF NOT EXISTS public.spin_cooldowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_free_spin_date DATE,
  available_spins INTEGER DEFAULT 1,
  last_spin_time TIMESTAMP WITH TIME ZONE,
  cooldown_ends_at TIMESTAMP WITH TIME ZONE,
  bonus_spins INTEGER DEFAULT 0,
  premium_weekly_spin_used BOOLEAN DEFAULT FALSE,
  premium_weekly_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on spin_cooldowns
ALTER TABLE public.spin_cooldowns ENABLE ROW LEVEL SECURITY;

-- Create policies for spin_cooldowns
CREATE POLICY "Users can view their own spin cooldowns" 
ON public.spin_cooldowns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own spin cooldowns" 
ON public.spin_cooldowns 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to initialize spin cooldown for new users
CREATE OR REPLACE FUNCTION public.initialize_spin_cooldown()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.spin_cooldowns (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize spin cooldown
DROP TRIGGER IF EXISTS initialize_user_spin_cooldown ON auth.users;
CREATE TRIGGER initialize_user_spin_cooldown
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_spin_cooldown();

-- Create function to check and update spin availability
CREATE OR REPLACE FUNCTION public.check_spin_availability(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_cooldown RECORD;
  v_can_spin BOOLEAN := FALSE;
  v_reason TEXT := 'Unknown';
  v_next_spin_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current cooldown state
  SELECT * INTO v_cooldown 
  FROM public.spin_cooldowns 
  WHERE user_id = p_user_id;
  
  -- If no record exists, create one
  IF v_cooldown IS NULL THEN
    INSERT INTO public.spin_cooldowns (user_id, available_spins)
    VALUES (p_user_id, 1)
    RETURNING * INTO v_cooldown;
  END IF;
  
  -- Check if daily free spin is available
  IF v_cooldown.last_free_spin_date IS NULL OR v_cooldown.last_free_spin_date < CURRENT_DATE THEN
    -- Reset daily spin
    UPDATE public.spin_cooldowns 
    SET 
      available_spins = 1,
      last_free_spin_date = CURRENT_DATE,
      cooldown_ends_at = NULL
    WHERE user_id = p_user_id;
    
    v_can_spin := TRUE;
    v_reason := 'Daily spin available';
  ELSIF v_cooldown.bonus_spins > 0 THEN
    v_can_spin := TRUE;
    v_reason := 'Bonus spin available';
  ELSIF v_cooldown.available_spins > 0 AND (v_cooldown.cooldown_ends_at IS NULL OR v_cooldown.cooldown_ends_at <= now()) THEN
    v_can_spin := TRUE;
    v_reason := 'Spin available';
  ELSE
    v_can_spin := FALSE;
    IF v_cooldown.cooldown_ends_at IS NOT NULL AND v_cooldown.cooldown_ends_at > now() THEN
      v_reason := 'Cooldown active';
      v_next_spin_time := v_cooldown.cooldown_ends_at;
    ELSE
      v_reason := 'No spins available';
      v_next_spin_time := (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'can_spin', v_can_spin,
    'reason', v_reason,
    'available_spins', v_cooldown.available_spins,
    'bonus_spins', v_cooldown.bonus_spins,
    'next_spin_time', v_next_spin_time,
    'cooldown_ends_at', v_cooldown.cooldown_ends_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process spin result
CREATE OR REPLACE FUNCTION public.process_spin_result(
  p_user_id UUID,
  p_reward_type TEXT,
  p_reward_amount INTEGER,
  p_reward_description TEXT,
  p_bonus_spin_awarded BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  v_spin_result_id UUID;
  v_current_balance RECORD;
BEGIN
  -- Insert spin result
  INSERT INTO public.spin_results (
    user_id, 
    reward_type, 
    reward_amount, 
    reward_description, 
    bonus_spin_awarded
  )
  VALUES (
    p_user_id, 
    p_reward_type, 
    p_reward_amount, 
    p_reward_description, 
    p_bonus_spin_awarded
  )
  RETURNING id INTO v_spin_result_id;
  
  -- Update spin cooldowns
  UPDATE public.spin_cooldowns 
  SET 
    available_spins = CASE 
      WHEN bonus_spins > 0 THEN available_spins -- Used bonus spin
      ELSE GREATEST(0, available_spins - 1) -- Used regular spin
    END,
    bonus_spins = CASE 
      WHEN bonus_spins > 0 THEN GREATEST(0, bonus_spins - 1) -- Used bonus spin
      WHEN p_bonus_spin_awarded THEN bonus_spins + 1 -- Awarded bonus spin
      ELSE bonus_spins 
    END,
    last_spin_time = now(),
    cooldown_ends_at = CASE 
      WHEN bonus_spins > 0 THEN cooldown_ends_at -- No cooldown for bonus spins
      ELSE now() + INTERVAL '24 hours' 
    END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Apply coin rewards to wallet
  IF p_reward_type = 'paisa' AND p_reward_amount > 0 THEN
    -- Insert transaction record
    INSERT INTO public.transactions (
      user_id, 
      type, 
      amount, 
      description
    ) VALUES (
      p_user_id, 
      'spin_wheel', 
      p_reward_amount, 
      p_reward_description
    );
    
    -- Update wallet balance
    SELECT * INTO v_current_balance 
    FROM public.wallet_balances 
    WHERE user_id = p_user_id;
    
    IF v_current_balance IS NOT NULL THEN
      UPDATE public.wallet_balances 
      SET 
        total_balance = total_balance + p_reward_amount,
        total_earned = total_earned + p_reward_amount,
        last_updated = now()
      WHERE user_id = p_user_id;
    ELSE
      -- Create wallet if it doesn't exist
      INSERT INTO public.wallet_balances (
        user_id, 
        total_balance, 
        total_earned
      ) VALUES (
        p_user_id, 
        p_reward_amount, 
        p_reward_amount
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'spin_result_id', v_spin_result_id,
    'reward_applied', p_reward_type = 'paisa',
    'bonus_spin_awarded', p_bonus_spin_awarded
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_spin_results_user_date ON public.spin_results(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_spin_results_session ON public.spin_results(session_id);
CREATE INDEX IF NOT EXISTS idx_spin_cooldowns_user ON public.spin_cooldowns(user_id);

-- Insert sample data for testing
INSERT INTO public.spin_results (user_id, reward_type, reward_amount, reward_description, date) 
SELECT 
  auth.uid(),
  (ARRAY['paisa', 'paisa', 'paisa', 'bonus_spin'])[floor(random() * 4) + 1],
  (ARRAY[10, 25, 50, 100])[floor(random() * 4) + 1],
  'Test spin result #' || generate_series,
  CURRENT_DATE - (generate_series || ' days')::INTERVAL
FROM generate_series(1, 10)
WHERE auth.uid() IS NOT NULL;