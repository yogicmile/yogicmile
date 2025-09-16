-- Update audit_logs RLS policy to be more restrictive
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a more restrictive policy that only allows service_role to insert
CREATE POLICY "Service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Add a policy for authenticated users to insert their own logs (for client-side logging)
CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add index for better performance on audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON public.audit_logs (user_id, created_at DESC);

-- Add index for action-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created 
ON public.audit_logs (action, created_at DESC);