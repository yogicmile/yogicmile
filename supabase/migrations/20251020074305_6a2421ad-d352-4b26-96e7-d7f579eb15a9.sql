-- P1: Fix Race Condition in Coin Redemption
-- This migration creates an atomic redemption function to prevent double-spending

-- Step 1: Create atomic redemption function with row-level locking
CREATE OR REPLACE FUNCTION redeem_daily_coins_atomic(
  p_user_id UUID,
  p_date DATE,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_daily_steps RECORD;
  v_wallet_balance RECORD;
  v_redeemed_amount INTEGER := 0;
  v_transaction_id UUID;
BEGIN
  -- Step 1: Lock the daily_steps row to prevent concurrent redemption
  -- Using FOR UPDATE NOWAIT to fail fast if another transaction is processing
  SELECT * INTO v_daily_steps
  FROM daily_steps
  WHERE user_id = p_user_id 
    AND date = p_date
  FOR UPDATE NOWAIT;
  
  -- Check if record exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_steps_found',
      'message', 'No step record found for this date'
    );
  END IF;
  
  -- Check if already redeemed
  IF v_daily_steps.is_redeemed = true THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_redeemed',
      'message', 'Coins already redeemed for this date',
      'redeemed_at', v_daily_steps.redeemed_at
    );
  END IF;
  
  -- Calculate redemption amount (paisa_earned from daily_steps)
  v_redeemed_amount := v_daily_steps.paisa_earned;
  
  -- Validate redemption amount
  IF v_redeemed_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_coins_to_redeem',
      'message', 'No coins available to redeem for this date'
    );
  END IF;
  
  -- Step 2: Lock wallet_balances row
  SELECT * INTO v_wallet_balance
  FROM wallet_balances
  WHERE user_id = p_user_id
  FOR UPDATE NOWAIT;
  
  -- Create wallet if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO wallet_balances (user_id, total_balance, total_earned)
    VALUES (p_user_id, 0, 0)
    RETURNING * INTO v_wallet_balance;
  END IF;
  
  -- Step 3: Create transaction record with idempotency key
  BEGIN
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      description,
      metadata
    ) VALUES (
      p_user_id,
      'daily_steps',
      v_redeemed_amount,
      format('Daily step coins redeemed for %s', p_date),
      jsonb_build_object(
        'date', p_date,
        'steps', v_daily_steps.steps,
        'phase_rate', v_daily_steps.phase_rate,
        'idempotency_key', p_idempotency_key
      )
    ) RETURNING id INTO v_transaction_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Idempotency check: transaction already exists
      RETURN jsonb_build_object(
        'success', true,
        'already_processed', true,
        'message', 'Transaction already processed',
        'amount', v_redeemed_amount
      );
  END;
  
  -- Step 4: Update wallet balance
  UPDATE wallet_balances
  SET 
    total_balance = total_balance + v_redeemed_amount,
    total_earned = total_earned + v_redeemed_amount,
    last_updated = now()
  WHERE user_id = p_user_id;
  
  -- Step 5: Mark as redeemed
  UPDATE daily_steps
  SET 
    is_redeemed = true,
    redeemed_at = now()
  WHERE user_id = p_user_id 
    AND date = p_date;
  
  -- Step 6: Log security event for high-value redemptions
  IF v_redeemed_amount > 1000 THEN
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (
      p_user_id,
      'high_value_redemption',
      jsonb_build_object(
        'amount', v_redeemed_amount,
        'date', p_date,
        'transaction_id', v_transaction_id,
        'severity', 'low'
      )
    );
  END IF;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'amount', v_redeemed_amount,
    'new_balance', v_wallet_balance.total_balance + v_redeemed_amount,
    'transaction_id', v_transaction_id,
    'message', format('Successfully redeemed %s coins', v_redeemed_amount)
  );
  
EXCEPTION
  WHEN lock_not_available THEN
    -- Another transaction is processing this redemption
    RETURN jsonb_build_object(
      'success', false,
      'error', 'concurrent_redemption',
      'message', 'Redemption already in progress, please try again'
    );
  WHEN OTHERS THEN
    -- Log unexpected errors
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (
      p_user_id,
      'redemption_error',
      jsonb_build_object(
        'error', SQLERRM,
        'date', p_date,
        'severity', 'high'
      )
    );
    
    RAISE;
END;
$$;

-- Step 2: Add idempotency_key column to transactions table for duplicate prevention
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Step 3: Create unique index on idempotency_key to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_key 
ON transactions(user_id, idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- Step 4: Add index for performance on redemption queries
CREATE INDEX IF NOT EXISTS idx_daily_steps_redemption 
ON daily_steps(user_id, date, is_redeemed) 
WHERE is_redeemed = false;

-- Step 5: Create rate limiting table for redemption attempts
CREATE TABLE IF NOT EXISTS redemption_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on rate limiting table
ALTER TABLE redemption_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own rate limits
CREATE POLICY "Users can view own rate limits"
ON redemption_rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: System can manage rate limits
CREATE POLICY "System can manage rate limits"
ON redemption_rate_limits
FOR ALL
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Create rate-limited redemption wrapper function
CREATE OR REPLACE FUNCTION redeem_daily_coins_with_rate_limit(
  p_user_id UUID,
  p_date DATE,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate_limit RECORD;
  v_max_attempts INTEGER := 5;
  v_window_minutes INTEGER := 15;
  v_result JSONB;
BEGIN
  -- Check rate limiting
  SELECT * INTO v_rate_limit
  FROM redemption_rate_limits
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Initialize rate limit record if not exists
  IF v_rate_limit IS NULL THEN
    INSERT INTO redemption_rate_limits (user_id, date, attempt_count)
    VALUES (p_user_id, p_date, 1)
    RETURNING * INTO v_rate_limit;
  ELSE
    -- Check if blocked
    IF v_rate_limit.blocked_until IS NOT NULL AND v_rate_limit.blocked_until > now() THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'rate_limited',
        'message', 'Too many redemption attempts. Please try again later.',
        'blocked_until', v_rate_limit.blocked_until
      );
    END IF;
    
    -- Reset counter if window expired
    IF v_rate_limit.window_start < now() - (v_window_minutes || ' minutes')::interval THEN
      UPDATE redemption_rate_limits
      SET attempt_count = 1, window_start = now(), last_attempt = now(), blocked_until = NULL
      WHERE user_id = p_user_id AND date = p_date;
    ELSE
      -- Increment attempt counter
      UPDATE redemption_rate_limits
      SET 
        attempt_count = attempt_count + 1,
        last_attempt = now(),
        blocked_until = CASE 
          WHEN attempt_count + 1 >= v_max_attempts 
          THEN now() + interval '1 hour'
          ELSE NULL
        END
      WHERE user_id = p_user_id AND date = p_date
      RETURNING * INTO v_rate_limit;
      
      -- Check if now blocked
      IF v_rate_limit.attempt_count >= v_max_attempts THEN
        -- Log rate limit violation
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (
          p_user_id,
          'redemption_rate_limit_exceeded',
          jsonb_build_object(
            'date', p_date,
            'attempts', v_rate_limit.attempt_count,
            'severity', 'medium'
          )
        );
        
        RETURN jsonb_build_object(
          'success', false,
          'error', 'rate_limited',
          'message', 'Too many redemption attempts. Blocked for 1 hour.',
          'blocked_until', v_rate_limit.blocked_until
        );
      END IF;
    END IF;
  END IF;
  
  -- Execute atomic redemption
  v_result := redeem_daily_coins_atomic(p_user_id, p_date, p_idempotency_key);
  
  -- Reset rate limit on successful redemption
  IF (v_result->>'success')::boolean = true THEN
    DELETE FROM redemption_rate_limits WHERE user_id = p_user_id AND date = p_date;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Step 7: Add comments for documentation
COMMENT ON FUNCTION redeem_daily_coins_atomic(UUID, DATE, TEXT) IS 'Atomic function: Prevents race conditions in coin redemption using FOR UPDATE NOWAIT locking. Returns JSON with success status and amount.';
COMMENT ON FUNCTION redeem_daily_coins_with_rate_limit(UUID, DATE, TEXT) IS 'Rate-limited wrapper: Calls redeem_daily_coins_atomic with attempt limiting (5 attempts per 15 minutes).';
COMMENT ON TABLE redemption_rate_limits IS 'Security table: Tracks redemption attempts to prevent brute-force attacks on the redemption system.';

-- Step 8: Grant execute permissions
GRANT EXECUTE ON FUNCTION redeem_daily_coins_atomic(UUID, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_daily_coins_with_rate_limit(UUID, DATE, TEXT) TO authenticated;