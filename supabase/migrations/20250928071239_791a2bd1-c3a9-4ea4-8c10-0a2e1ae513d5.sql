-- Fix the function search path security warning
-- Update the log_profile_access function to have a fixed search_path

CREATE OR REPLACE FUNCTION log_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log profile views for security monitoring
  IF TG_OP = 'SELECT' AND NEW.user_id != auth.uid() THEN
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (
      auth.uid(),
      'profile_view',
      jsonb_build_object(
        'viewed_user_id', NEW.user_id,
        'privacy_setting', NEW.profile_visibility,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;