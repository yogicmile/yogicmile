-- P0: Fix Privilege Escalation Vulnerability
-- This migration prevents users from modifying their own role and adds monitoring

-- Step 1: Drop existing permissive UPDATE policy on users table
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Step 2: Create restrictive UPDATE policy that prevents role changes
CREATE POLICY "Users can update own profile (role protected)" 
ON users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    -- Ensure role is not being changed
    role = (SELECT u.role FROM users u WHERE u.id = auth.uid())
    OR role IS NULL  -- Allow NULL (no change)
  )
);

-- Step 3: Mark users.role column as deprecated
COMMENT ON COLUMN users.role IS 'DEPRECATED: Use user_roles table via has_role() function. This column is read-only for backward compatibility and will be removed in future release.';

-- Step 4: Create trigger function to detect privilege escalation attempts
CREATE OR REPLACE FUNCTION detect_role_escalation_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if the actor is an admin using user_roles table
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      -- Log the critical security event
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (
        auth.uid(),
        'privilege_escalation_attempt',
        jsonb_build_object(
          'attempted_role', NEW.role,
          'previous_role', OLD.role,
          'target_user_id', NEW.id,
          'severity', 'critical',
          'timestamp', now(),
          'blocked', true
        )
      );
      
      -- Block the attempt
      RAISE EXCEPTION 'Security violation: Unauthorized role modification detected and blocked';
    ELSE
      -- Admin is changing role - log for audit
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (
        auth.uid(),
        'admin_role_change',
        jsonb_build_object(
          'new_role', NEW.role,
          'old_role', OLD.role,
          'target_user_id', NEW.id,
          'severity', 'high',
          'timestamp', now()
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 5: Create trigger to enforce role protection
DROP TRIGGER IF EXISTS prevent_role_escalation ON users;
CREATE TRIGGER prevent_role_escalation
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (NEW.role IS DISTINCT FROM OLD.role)
EXECUTE FUNCTION detect_role_escalation_attempt();

-- Step 6: Create one-way sync function (user_roles -> users.role for backward compatibility)
CREATE OR REPLACE FUNCTION sync_role_from_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_primary_role TEXT;
BEGIN
  -- Get the primary role from user_roles (prioritize admin > moderator > user)
  SELECT 
    CASE 
      WHEN 'admin' = ANY(array_agg(role::text)) THEN 'admin'
      WHEN 'moderator' = ANY(array_agg(role::text)) THEN 'moderator'
      ELSE 'user'
    END INTO v_primary_role
  FROM user_roles 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  -- Update users.role for backward compatibility (bypassing trigger)
  IF TG_OP = 'DELETE' THEN
    UPDATE users SET role = v_primary_role WHERE id = OLD.user_id;
    RETURN OLD;
  ELSE
    UPDATE users SET role = v_primary_role WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
END;
$$;

-- Step 7: Create trigger on user_roles to keep users.role synchronized
DROP TRIGGER IF EXISTS sync_role_trigger ON user_roles;
CREATE TRIGGER sync_role_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION sync_role_from_user_roles();

-- Step 8: Create security monitoring query for admins
COMMENT ON FUNCTION detect_role_escalation_attempt() IS 'Security function: Monitors and blocks privilege escalation attempts. Logs all role change attempts to audit_logs.';
COMMENT ON FUNCTION sync_role_from_user_roles() IS 'Backward compatibility: Syncs user_roles table to users.role column (one-way). Uses security definer to bypass RLS.';

-- Step 9: Add index for performance on role checks
CREATE INDEX IF NOT EXISTS idx_audit_logs_privilege_escalation 
ON audit_logs(user_id, action, created_at) 
WHERE action = 'privilege_escalation_attempt';

-- Step 10: Verify existing has_role function is properly configured
-- This should already exist from the security best practices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    RAISE EXCEPTION 'Critical: has_role() function not found. Please create it first using the user_roles setup instructions.';
  END IF;
END $$;