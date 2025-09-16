-- Update any existing user to admin role (for testing)
-- Replace the email with the one you created in Supabase Auth

UPDATE public.users 
SET role = 'super_admin' 
WHERE email = 'admin@yogicmile.com';

-- If the user doesn't exist in public.users table yet, this will handle it
-- (This happens when users sign up through Supabase Auth but haven't used the main app)

-- Add some sample data for the dashboard to display
INSERT INTO public.system_alerts (alert_type, severity, title, description) VALUES
  ('security', 'high', 'Multiple failed login attempts', 'Detected 5 failed admin login attempts from IP 192.168.1.100'),
  ('system', 'medium', 'High database load', 'Database response time increased by 30% in the last hour'),
  ('user', 'low', 'User report submitted', 'New user complaint requires moderation review')
ON CONFLICT DO NOTHING;