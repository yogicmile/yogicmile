-- Clean up remaining old OTP logs policies that could create security conflicts

DROP POLICY IF EXISTS "Service role can insert OTPs" ON otp_logs;
DROP POLICY IF EXISTS "Users can insert their own OTP logs" ON otp_logs;
DROP POLICY IF EXISTS "Users can update their own OTP logs" ON otp_logs;
DROP POLICY IF EXISTS "Users can view their own OTP logs" ON otp_logs;

-- Verify final policies are correct - should only have the new restrictive policies