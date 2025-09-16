-- Create a default admin user for testing
-- Note: In production, you should create admin users through proper channels

-- First, let's create a function to safely create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email text,
  p_password text,
  p_full_name text DEFAULT 'Admin User'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  signup_result jsonb;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    -- Update existing user to admin role
    UPDATE public.users 
    SET role = 'super_admin' 
    WHERE id = (SELECT id FROM auth.users WHERE email = p_email);
    
    RETURN 'Updated existing user to admin role: ' || p_email;
  END IF;
  
  -- For demo purposes, we'll create a user record manually
  -- In production, admin users should be created through Supabase Auth properly
  
  -- Generate a UUID for the new user
  new_user_id := gen_random_uuid();
  
  -- Insert into users table with admin role
  INSERT INTO public.users (
    id,
    mobile_number,
    full_name,
    email,
    role,
    address,
    created_at
  ) VALUES (
    new_user_id,
    '9999999999', -- Demo mobile number
    p_full_name,
    p_email,
    'super_admin',
    'Admin Address',
    now()
  );
  
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new_user_id, p_full_name);
  
  -- Create wallet balance
  INSERT INTO public.wallet_balances (user_id)
  VALUES (new_user_id);
  
  -- Create user phase record
  INSERT INTO public.user_phases (user_id)
  VALUES (new_user_id);
  
  RETURN 'Demo admin user created. Email: ' || p_email || '. Please set up auth through Supabase Auth dashboard.';
END;
$$;

-- Create a demo admin user (for development/testing only)
SELECT create_admin_user('admin@yogicmile.com', 'admin123', 'Super Admin');

-- Also create some sample data for testing
INSERT INTO public.system_alerts (alert_type, severity, title, description) VALUES
  ('security', 'high', 'Multiple failed login attempts', 'Detected 5 failed admin login attempts from IP 192.168.1.100'),
  ('system', 'medium', 'High database load', 'Database response time increased by 30% in the last hour'),
  ('user', 'low', 'User report submitted', 'New user complaint requires moderation review');

-- Sample marketing campaign
INSERT INTO public.marketing_campaigns (
  name, type, title, message, created_by, status, target_audience
) VALUES (
  'Welcome Campaign',
  'push',
  'Welcome to Yogic Mile!',
  'Start your fitness journey today and earn rewards for every step!',
  (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1),
  'active',
  '{"phase": "all", "location": "all"}'::jsonb
);

-- Sample support tickets
INSERT INTO public.support_tickets (
  user_id, category, priority, title, description, status
) VALUES (
  (SELECT id FROM public.users WHERE role != 'super_admin' LIMIT 1),
  'technical',
  'medium',
  'Step tracking not working',
  'My steps are not being counted properly since yesterday. Please help.',
  'open'
);

-- Drop the helper function after use
DROP FUNCTION create_admin_user(text, text, text);