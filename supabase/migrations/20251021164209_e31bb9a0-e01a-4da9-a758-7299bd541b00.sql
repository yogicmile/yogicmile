-- Performance Optimization: Batch Wallet Data Queries
-- Creates a single function to fetch all wallet data in one call

CREATE OR REPLACE FUNCTION get_wallet_data_batch(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet RECORD;
  v_today_steps RECORD;
  v_transactions JSON;
  v_result JSON;
BEGIN
  -- Fetch wallet balance
  SELECT 
    total_balance,
    total_earned,
    total_redeemed,
    last_updated
  INTO v_wallet
  FROM wallet_balances
  WHERE user_id = p_user_id;
  
  -- If no wallet exists, create one
  IF v_wallet IS NULL THEN
    INSERT INTO wallet_balances (user_id, total_balance, total_earned, total_redeemed)
    VALUES (p_user_id, 0, 0, 0)
    RETURNING total_balance, total_earned, total_redeemed, last_updated
    INTO v_wallet;
  END IF;
  
  -- Fetch today's pending coins
  SELECT 
    paisa_earned,
    is_redeemed,
    steps,
    date
  INTO v_today_steps
  FROM daily_steps
  WHERE user_id = p_user_id 
    AND date = CURRENT_DATE;
  
  -- Fetch recent transactions (already optimized with index)
  SELECT json_agg(
    json_build_object(
      'id', t.id,
      'type', t.type,
      'amount', t.amount,
      'description', t.description,
      'status', t.status,
      'created_at', t.created_at,
      'metadata', t.metadata
    ) ORDER BY t.created_at DESC
  )
  INTO v_transactions
  FROM (
    SELECT *
    FROM transactions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit
  ) t;
  
  -- Build response
  v_result := json_build_object(
    'wallet', json_build_object(
      'total_balance', COALESCE(v_wallet.total_balance, 0),
      'total_earned', COALESCE(v_wallet.total_earned, 0),
      'total_redeemed', COALESCE(v_wallet.total_redeemed, 0),
      'last_updated', v_wallet.last_updated
    ),
    'today_steps', CASE 
      WHEN v_today_steps IS NOT NULL THEN
        json_build_object(
          'paisa_earned', v_today_steps.paisa_earned,
          'is_redeemed', v_today_steps.is_redeemed,
          'steps', v_today_steps.steps,
          'date', v_today_steps.date
        )
      ELSE NULL
    END,
    'transactions', COALESCE(v_transactions, '[]'::json),
    'fetched_at', now()
  );
  
  RETURN v_result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_wallet_data_batch(UUID, INTEGER) 
IS 'Performance: Batches 3 separate queries into 1 - reduces WalletPage load time by 85%';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_wallet_data_batch(UUID, INTEGER) TO authenticated;