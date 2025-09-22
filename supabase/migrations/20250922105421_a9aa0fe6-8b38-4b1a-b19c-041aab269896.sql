-- Enable leaked password protection in Supabase Auth
-- This needs to be done via the Supabase dashboard, but we can document it here
-- Go to Authentication > Settings > Password Protection and enable "Leaked Password Protection"

-- For now, we'll add a comment to track this requirement
SELECT 'Leaked password protection should be enabled in Supabase Auth settings' as security_note;