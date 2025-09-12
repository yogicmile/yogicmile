-- Fix security warnings from the linter

-- Enable RLS on tables that don't have it
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;

-- Create public read policies for phases (everyone should see phases)
CREATE POLICY "Anyone can view phases" 
ON public.phases 
FOR SELECT 
USING (true);

-- Create public read policies for rewards (everyone should see active rewards)
CREATE POLICY "Anyone can view active rewards" 
ON public.rewards 
FOR SELECT 
USING (is_active = true);

-- Fix function search paths for existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.earn_steps(p_user_id uuid, p_steps integer)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
declare
    v_today date := current_date;
    v_daily_steps int;
    v_allowed_steps int;
    v_steps_to_add int;
    v_rate numeric(5,2);
    v_paisa_earned bigint;
begin
    -- Get today's steps
    select coalesce(sum(steps), 0)
    into v_daily_steps
    from step_logs
    where user_id = p_user_id and date = v_today;

    -- Apply daily limit (12,000 steps)
    v_allowed_steps := 12000 - v_daily_steps;
    if v_allowed_steps <= 0 then
        return 'Daily step limit (12,000) reached';
    end if;

    v_steps_to_add := least(p_steps, v_allowed_steps);

    -- Get rate based on current phase
    select paisa_rate
    into v_rate
    from phases
    where name = (select phase from users where id = p_user_id);

    if v_rate is null then
        v_rate := 1.00; -- default safety net
    end if;

    -- Convert steps → paisa (25 steps = 1 paisa)
    v_paisa_earned := floor(v_steps_to_add / 25.0 * v_rate);

    -- Insert log
    insert into step_logs(user_id, date, steps, coins_earned)
    values (p_user_id, v_today, v_steps_to_add, v_paisa_earned);

    -- Update wallet
    update wallets
    set balance_paisa = balance_paisa + v_paisa_earned,
        updated_at = now()
    where user_id = p_user_id;

    -- Log transaction
    insert into transactions(user_id, type, amount_paisa, description)
    values (p_user_id, 'earning', v_paisa_earned, 'Steps converted to paisa');

    return concat('Steps added: ', v_steps_to_add, ', Paisa earned: ', v_paisa_earned);
end;
$function$;