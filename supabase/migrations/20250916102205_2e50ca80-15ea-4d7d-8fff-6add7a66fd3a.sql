-- Security Enhancement: Harden audit_logs access policies
-- Remove permissive user insertion policy and restrict to service role only

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Create restrictive service-role only insertion policy
CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Keep user read access for their own logs
-- Policy "Users can view their own audit logs" already exists and is appropriate

-- Add indexes for better performance on audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at 
ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created_at 
ON public.audit_logs(action, created_at DESC);