-- Fix OTP logs security by cleaning up policies and ensuring proper restrictions

-- Drop duplicate and potentially problematic policies
DROP POLICY IF EXISTS "Users can view their own OTPs" ON otp_logs;
DROP POLICY IF EXISTS "Prevent direct OTP updates" ON otp_logs;

-- Create secure, comprehensive policies
CREATE POLICY "Authenticated users can view only their own OTP logs"
  ON otp_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert OTP logs"
  ON otp_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert only their own OTP logs"
  ON otp_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update OTP logs"
  ON otp_logs
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can update only their own OTP logs"
  ON otp_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Explicitly deny all access to anonymous users
CREATE POLICY "Deny all access to anonymous users"
  ON otp_logs
  FOR ALL
  TO anon
  USING (false);

-- Ensure no deletes are allowed except by service role
CREATE POLICY "Only service role can delete OTP logs"
  ON otp_logs
  FOR DELETE
  TO service_role
  USING (true);