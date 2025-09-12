-- Handle existing constraints and columns more carefully
DO $$ 
BEGIN
    -- Drop existing email unique constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
        ALTER TABLE public.users DROP CONSTRAINT users_email_key;
    END IF;
    
    -- Drop existing mobile number constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_mobile_number_key') THEN
        ALTER TABLE public.users DROP CONSTRAINT users_mobile_number_key;
    END IF;
END $$;

-- Add mobile_number column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Add password_hash column if it doesn't exist  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add address column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Make email nullable
ALTER TABLE public.users 
ALTER COLUMN email DROP NOT NULL;

-- Update empty values and add constraints
UPDATE public.users 
SET mobile_number = COALESCE(mobile_number, ''), 
    address = COALESCE(address, '');

-- Now add NOT NULL constraints
ALTER TABLE public.users 
ALTER COLUMN mobile_number SET NOT NULL,
ALTER COLUMN address SET NOT NULL;

-- Add unique constraint on mobile_number
ALTER TABLE public.users 
ADD CONSTRAINT users_mobile_number_key UNIQUE (mobile_number);

-- Drop and recreate otp_logs table to ensure clean state
DROP TABLE IF EXISTS public.otp_logs;

CREATE TABLE public.otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mobile_number TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on otp_logs
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for otp_logs
CREATE POLICY "Users can view their own OTP logs" 
ON public.otp_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OTP logs" 
ON public.otp_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP logs" 
ON public.otp_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to generate OTP
CREATE OR REPLACE FUNCTION public.generate_otp(p_mobile_number TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp TEXT;
  v_user_id UUID;
BEGIN
  -- Generate 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Get user ID from mobile number
  SELECT id INTO v_user_id FROM users WHERE mobile_number = p_mobile_number;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with mobile number: %', p_mobile_number;
  END IF;
  
  -- Mark previous OTPs as expired
  UPDATE otp_logs 
  SET is_used = TRUE 
  WHERE mobile_number = p_mobile_number AND is_used = FALSE;
  
  -- Insert new OTP
  INSERT INTO otp_logs (user_id, mobile_number, otp, expires_at)
  VALUES (v_user_id, p_mobile_number, v_otp, NOW() + INTERVAL '5 minutes');
  
  RETURN v_otp;
END;
$$;

-- Create function to verify OTP (fixed syntax)
CREATE OR REPLACE FUNCTION public.verify_otp(p_mobile_number TEXT, p_otp TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if OTP is valid and not expired, and mark as used
  UPDATE otp_logs 
  SET is_used = TRUE
  WHERE mobile_number = p_mobile_number 
    AND otp = p_otp 
    AND expires_at > NOW() 
    AND is_used = FALSE;
  
  -- Return true if a row was updated (FOUND is a special variable)
  RETURN FOUND;
END;
$$;