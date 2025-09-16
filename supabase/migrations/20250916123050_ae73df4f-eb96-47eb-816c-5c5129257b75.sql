-- Create admin user entry in public.users table
-- This links the Supabase Auth user to our app's user system

DO $$
DECLARE 
    auth_user_id uuid;
BEGIN
    -- Get the user ID from auth.users table
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = 'admin@yogicmile.com';
    
    IF auth_user_id IS NOT NULL THEN
        -- Insert or update user in public.users table
        INSERT INTO public.users (
            id,
            mobile_number, 
            full_name,
            email,
            role,
            address,
            created_at
        ) VALUES (
            auth_user_id,
            '9999999999',
            'Super Admin',
            'admin@yogicmile.com',
            'super_admin',
            'Admin Office',
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'super_admin',
            email = 'admin@yogicmile.com',
            full_name = 'Super Admin';
            
        -- Create profile if doesn't exist
        INSERT INTO public.profiles (user_id, full_name)
        VALUES (auth_user_id, 'Super Admin')
        ON CONFLICT (user_id) DO UPDATE SET
            full_name = 'Super Admin';
            
        -- Create wallet balance if doesn't exist  
        INSERT INTO public.wallet_balances (user_id)
        VALUES (auth_user_id)
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Create user phases if doesn't exist
        INSERT INTO public.user_phases (user_id)
        VALUES (auth_user_id)
        ON CONFLICT (user_id) DO NOTHING;
            
        RAISE NOTICE 'Admin user setup completed for %', auth_user_id;
    ELSE
        RAISE NOTICE 'Auth user admin@yogicmile.com not found. Please create in Supabase Auth first.';
    END IF;
END
$$;