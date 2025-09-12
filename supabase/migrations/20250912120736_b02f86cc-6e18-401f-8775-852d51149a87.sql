-- Update users table to use mobile number as primary identifier
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_email_key;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mobile_number TEXT UNIQUE NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';

-- Make email optional by removing NOT NULL constraint
ALTER TABLE public.users 
ALTER COLUMN email DROP NOT NULL;

-- Add unique constraint on mobile_number
ALTER TABLE public.users 
ADD CONSTRAINT users_mobile_number_key UNIQUE (mobile_number);

-- Create OTP logs table
CREATE TABLE IF NOT EXISTS public.otp_logs (
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

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(p_mobile_number TEXT, p_otp TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN := FALSE;
BEGIN
  -- Check if OTP is valid and not expired
  UPDATE otp_logs 
  SET is_used = TRUE
  WHERE mobile_number = p_mobile_number 
    AND otp = p_otp 
    AND expires_at > NOW() 
    AND is_used = FALSE;
  
  -- Return true if a row was updated
  GET DIAGNOSTICS v_valid = FOUND;
  
  RETURN v_valid;
END;
$$;