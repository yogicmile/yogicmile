-- Phase 1: Database Schema Updates for 10% Step Gift System (Fixed)

-- 1.1 Update daily_steps table - Separate personal vs bonus steps
ALTER TABLE public.daily_steps 
ADD COLUMN IF NOT EXISTS personal_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gifted_from_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gifted_from_motivations INTEGER DEFAULT 0;

-- Migrate existing data (steps column becomes personal_steps)
UPDATE public.daily_steps 
SET personal_steps = steps,
    bonus_steps = 0
WHERE personal_steps = 0;

-- Add comments for clarity
COMMENT ON COLUMN daily_steps.personal_steps IS 'User own walking, capped at 12000, earns paisa';
COMMENT ON COLUMN daily_steps.bonus_steps IS 'Gifted steps from referrals/motivations, uncapped, only for phase progression';

-- 1.2 Update referrals_new table - Add gift tracking
ALTER TABLE public.referrals_new 
ADD COLUMN IF NOT EXISTS referrer_signup_bonus_paisa INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS referrer_signup_bonus_steps INTEGER DEFAULT 5000,
ADD COLUMN IF NOT EXISTS daily_step_gift_percentage NUMERIC(3,2) DEFAULT 0.10,
ADD COLUMN IF NOT EXISTS total_steps_gifted BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_paisa_value_of_gifts BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_gift_date DATE;

-- Update existing pending referrals with 30-day expiry
UPDATE public.referrals_new 
SET 
  bonus_expires_at = created_at + INTERVAL '30 days',
  referrer_signup_bonus_paisa = 100,
  referrer_signup_bonus_steps = 5000,
  daily_step_gift_percentage = 0.10
WHERE bonus_expires_at IS NULL AND status = 'pending';

-- 1.3 Create step_bonuses_log table - Audit trail
CREATE TABLE IF NOT EXISTS public.step_bonuses_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN (
    'referral_signup',
    'referral_daily_gift', 
    'community_motivation',
    'phase_advancement_bonus'
  )),
  steps_awarded INTEGER NOT NULL CHECK (steps_awarded > 0),
  paisa_value INTEGER DEFAULT 0,
  source_details JSONB DEFAULT '{}'::jsonb,
  awarded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recipient_phase_at_award INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_step_bonuses_recipient ON step_bonuses_log(recipient_user_id, awarded_date);
CREATE INDEX idx_step_bonuses_source ON step_bonuses_log(source_user_id, awarded_date);
CREATE INDEX idx_step_bonuses_type ON step_bonuses_log(bonus_type, awarded_date);

ALTER TABLE public.step_bonuses_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bonus logs"
  ON public.step_bonuses_log FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "System can insert bonus logs"
  ON public.step_bonuses_log FOR INSERT
  WITH CHECK (true);

-- 1.4 Create motivation_logs table
CREATE TABLE IF NOT EXISTS public.motivation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motivator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  motivated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referrer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  activity_id UUID,
  steps_gifted_to_referrer INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(motivator_user_id, motivated_user_id, activity_id)
);

CREATE INDEX idx_motivations_user ON motivation_logs(motivated_user_id, created_at);
CREATE INDEX idx_motivations_referrer ON motivation_logs(referrer_user_id, created_at);

ALTER TABLE public.motivation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view motivations they're involved in"
  ON public.motivation_logs FOR SELECT
  USING (
    auth.uid() = motivator_user_id OR 
    auth.uid() = motivated_user_id OR 
    auth.uid() = referrer_user_id
  );

CREATE POLICY "Users can insert motivations"
  ON public.motivation_logs FOR INSERT
  WITH CHECK (auth.uid() = motivator_user_id);

-- Phase 2: Core Backend Functions

-- 2.1 Update process_referral_signup - Add step gifts
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
  v_referral_id UUID;
  v_signup_bonus_cash INTEGER := 100;
  v_signup_bonus_steps INTEGER := 5000;
  v_referrer_current_phase INTEGER;
BEGIN
  SELECT u.* INTO v_referrer_user
  FROM public.users u
  WHERE u.referral_code = p_referral_code
    AND u.id != p_referee_user_id;
  
  IF v_referrer_user.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid referral code'
    );
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.referrals_new 
    WHERE referee_user_id = p_referee_user_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already has a referral'
    );
  END IF;
  
  SELECT current_phase INTO v_referrer_current_phase
  FROM user_phases
  WHERE user_id = v_referrer_user.id;
  
  INSERT INTO public.referrals_new (
    referrer_mobile, 
    referee_mobile, 
    referrer_user_id, 
    referee_user_id, 
    referral_code,
    status,
    bonus_expires_at,
    referrer_signup_bonus_paisa,
    referrer_signup_bonus_steps,
    daily_step_gift_percentage
  ) VALUES (
    v_referrer_user.mobile_number, 
    p_referee_mobile, 
    v_referrer_user.id, 
    p_referee_user_id, 
    p_referral_code,
    'pending',
    now() + INTERVAL '30 days',
    v_signup_bonus_cash,
    v_signup_bonus_steps,
    0.10
  ) RETURNING id INTO v_referral_id;

  INSERT INTO public.bonus_logs (
    user_id, 
    bonus_type, 
    amount_paisa, 
    description,
    date_earned
  ) VALUES (
    v_referrer_user.id,
    'referral_signup_cash', 
    v_signup_bonus_cash, 
    format('Signup bonus for referring %s', p_referee_mobile),
    CURRENT_DATE
  );

  INSERT INTO public.wallet_balances (user_id, total_balance, total_earned)
  VALUES (v_referrer_user.id, v_signup_bonus_cash, v_signup_bonus_cash)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_balance = wallet_balances.total_balance + v_signup_bonus_cash,
    total_earned = wallet_balances.total_earned + v_signup_bonus_cash,
    last_updated = now();

  UPDATE public.user_phases
  SET 
    total_steps = total_steps + v_signup_bonus_steps,
    updated_at = now()
  WHERE user_id = v_referrer_user.id;

  INSERT INTO public.step_bonuses_log (
    recipient_user_id,
    source_user_id,
    bonus_type,
    steps_awarded,
    paisa_value,
    recipient_phase_at_award,
    source_details
  ) VALUES (
    v_referrer_user.id,
    p_referee_user_id,
    'referral_signup',
    v_signup_bonus_steps,
    0,
    v_referrer_current_phase,
    jsonb_build_object(
      'referee_mobile', p_referee_mobile,
      'referral_code', p_referral_code
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'referrer_user_id', v_referrer_user.id,
    'cash_bonus', v_signup_bonus_cash,
    'steps_gifted', v_signup_bonus_steps,
    'bonus_expires_at', now() + INTERVAL '30 days',
    'message', format('Referral successful! Earned ₹1.00 + %s bonus steps', v_signup_bonus_steps)
  );
END;
$$;

-- 2.2 Create process_daily_step_gift function
CREATE OR REPLACE FUNCTION public.process_daily_step_gift(
  p_referee_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_referee_steps INTEGER;
  v_gifted_steps INTEGER;
  v_referrer_phase RECORD;
  v_referrer_personal_steps INTEGER;
  v_allowed_gifted_steps INTEGER;
  v_paisa_potential INTEGER;
BEGIN
  SELECT * INTO v_referral 
  FROM public.referrals_new 
  WHERE referee_user_id = p_referee_user_id 
    AND status = 'pending'
    AND bonus_expires_at > now()
    AND (last_gift_date IS NULL OR last_gift_date < p_date);
  
  IF v_referral.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'No active referral or bonus period expired'
    );
  END IF;

  SELECT COALESCE(SUM(steps), 0) INTO v_referee_steps
  FROM public.daily_steps
  WHERE user_id = p_referee_user_id AND date = p_date;

  IF v_referee_steps < 10000 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', format('Referee only walked %s steps. Need 10,000+ for gift.', v_referee_steps),
      'steps_completed', v_referee_steps
    );
  END IF;

  v_gifted_steps := FLOOR(v_referee_steps * v_referral.daily_step_gift_percentage);

  SELECT * INTO v_referrer_phase
  FROM user_phases
  WHERE user_id = v_referral.referrer_user_id;

  SELECT COALESCE(personal_steps, steps, 0) INTO v_referrer_personal_steps
  FROM daily_steps
  WHERE user_id = v_referral.referrer_user_id AND date = p_date;

  v_allowed_gifted_steps := v_gifted_steps;
  v_paisa_potential := FLOOR(v_allowed_gifted_steps / 25.0) * COALESCE(v_referrer_phase.current_phase, 1);

  INSERT INTO public.daily_steps (
    user_id, 
    date, 
    personal_steps,
    bonus_steps,
    gifted_from_referrals,
    steps,
    phase_id, 
    phase_rate
  )
  VALUES (
    v_referral.referrer_user_id,
    p_date,
    v_referrer_personal_steps,
    v_allowed_gifted_steps,
    v_allowed_gifted_steps,
    v_referrer_personal_steps + v_allowed_gifted_steps,
    COALESCE(v_referrer_phase.current_phase, 1),
    COALESCE(v_referrer_phase.current_phase, 1)
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    bonus_steps = daily_steps.bonus_steps + v_allowed_gifted_steps,
    gifted_from_referrals = daily_steps.gifted_from_referrals + v_allowed_gifted_steps,
    steps = daily_steps.personal_steps + daily_steps.bonus_steps + v_allowed_gifted_steps;

  UPDATE public.user_phases
  SET 
    total_steps = total_steps + v_allowed_gifted_steps,
    updated_at = now()
  WHERE user_id = v_referral.referrer_user_id;

  INSERT INTO public.step_bonuses_log (
    recipient_user_id,
    source_user_id,
    bonus_type,
    steps_awarded,
    paisa_value,
    awarded_date,
    recipient_phase_at_award,
    source_details
  ) VALUES (
    v_referral.referrer_user_id,
    p_referee_user_id,
    'referral_daily_gift',
    v_allowed_gifted_steps,
    v_paisa_potential,
    p_date,
    COALESCE(v_referrer_phase.current_phase, 1),
    jsonb_build_object(
      'referee_steps', v_referee_steps,
      'gift_percentage', v_referral.daily_step_gift_percentage,
      'referee_mobile', v_referral.referee_mobile
    )
  );

  UPDATE public.referrals_new 
  SET 
    total_steps_gifted = total_steps_gifted + v_allowed_gifted_steps,
    total_paisa_value_of_gifts = total_paisa_value_of_gifts + v_paisa_potential,
    last_gift_date = p_date
  WHERE id = v_referral.id;

  RETURN jsonb_build_object(
    'success', true,
    'steps_gifted', v_allowed_gifted_steps,
    'referee_steps', v_referee_steps,
    'gift_percentage', v_referral.daily_step_gift_percentage,
    'referrer_phase', COALESCE(v_referrer_phase.current_phase, 1),
    'paisa_potential', v_paisa_potential,
    'message', format('Gifted %s steps (10%% of %s) to referrer', v_allowed_gifted_steps, v_referee_steps)
  );
END;
$$;

-- 2.3 Create process_motivation_bonus function
CREATE OR REPLACE FUNCTION public.process_motivation_bonus(
  p_motivator_user_id UUID,
  p_motivated_user_id UUID,
  p_activity_type TEXT,
  p_activity_id UUID DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_today_motivations INTEGER;
  v_motivation_limit INTEGER := 10;
  v_steps_per_motivation INTEGER := 500;
  v_referrer_phase INTEGER;
BEGIN
  SELECT * INTO v_referral
  FROM public.referrals_new
  WHERE referee_user_id = p_motivated_user_id
    AND status = 'pending'
    AND bonus_expires_at > now();

  IF v_referral.id IS NULL THEN
    INSERT INTO public.motivation_logs (
      motivator_user_id,
      motivated_user_id,
      activity_type,
      activity_id,
      steps_gifted_to_referrer
    ) VALUES (
      p_motivator_user_id, 
      p_motivated_user_id, 
      p_activity_type, 
      p_activity_id,
      0
    )
    ON CONFLICT (motivator_user_id, motivated_user_id, activity_id) 
    DO NOTHING;
    
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Motivation sent!',
      'steps_gifted', 0
    );
  END IF;

  SELECT COUNT(*) INTO v_today_motivations
  FROM public.motivation_logs
  WHERE motivated_user_id = p_motivated_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  IF v_today_motivations >= v_motivation_limit THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', format('Daily motivation limit reached (%s/day)', v_motivation_limit)
    );
  END IF;

  SELECT current_phase INTO v_referrer_phase
  FROM user_phases
  WHERE user_id = v_referral.referrer_user_id;

  UPDATE public.user_phases
  SET 
    total_steps = total_steps + v_steps_per_motivation,
    updated_at = now()
  WHERE user_id = v_referral.referrer_user_id;

  INSERT INTO public.daily_steps (
    user_id,
    date,
    bonus_steps,
    gifted_from_motivations,
    steps
  ) VALUES (
    v_referral.referrer_user_id,
    CURRENT_DATE,
    v_steps_per_motivation,
    v_steps_per_motivation,
    v_steps_per_motivation
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    bonus_steps = daily_steps.bonus_steps + v_steps_per_motivation,
    gifted_from_motivations = daily_steps.gifted_from_motivations + v_steps_per_motivation,
    steps = daily_steps.steps + v_steps_per_motivation;

  INSERT INTO public.motivation_logs (
    motivator_user_id,
    motivated_user_id,
    referrer_user_id,
    activity_type,
    activity_id,
    steps_gifted_to_referrer
  ) VALUES (
    p_motivator_user_id,
    p_motivated_user_id,
    v_referral.referrer_user_id,
    p_activity_type,
    p_activity_id,
    v_steps_per_motivation
  )
  ON CONFLICT (motivator_user_id, motivated_user_id, activity_id) 
  DO NOTHING;

  INSERT INTO public.step_bonuses_log (
    recipient_user_id,
    source_user_id,
    bonus_type,
    steps_awarded,
    paisa_value,
    recipient_phase_at_award,
    source_details
  ) VALUES (
    v_referral.referrer_user_id,
    p_motivated_user_id,
    'community_motivation',
    v_steps_per_motivation,
    0,
    v_referrer_phase,
    jsonb_build_object(
      'motivator_user_id', p_motivator_user_id,
      'activity_type', p_activity_type,
      'today_motivations', v_today_motivations + 1
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'steps_gifted_to_referrer', v_steps_per_motivation,
    'referrer_user_id', v_referral.referrer_user_id,
    'today_motivations', v_today_motivations + 1,
    'daily_limit', v_motivation_limit,
    'message', format('Motivation sent! Referrer earned %s bonus steps (%s/%s today)', 
                      v_steps_per_motivation, v_today_motivations + 1, v_motivation_limit)
  );
END;
$$;

-- Phase 6: Analytics View
CREATE OR REPLACE VIEW referral_gift_analytics AS
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