import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSessionRequest {
  mobileNumber: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { mobileNumber }: CreateSessionRequest = await req.json();

    if (!mobileNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mobile number required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating auth session for: ${mobileNumber}`);

    // Check if user exists in public.users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, mobile_number, full_name')
      .eq('mobile_number', mobileNumber)
      .maybeSingle();

    if (userError || !userData) {
      console.error('User not found in public.users:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found user in public.users: ${userData.id}`);

    // Check if auth.users record exists
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userData.id);

    let authUserId = userData.id;

    if (authUserError || !authUser) {
      console.log('Auth user not found, creating one...');
      
      // Create auth user with phone number
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: mobileNumber,
        phone_confirm: true, // Skip phone verification since OTP was already verified
        user_metadata: {
          full_name: userData.full_name,
          mobile_number: mobileNumber,
        },
        email_confirm: true,
      });

      if (createError) {
        console.error('Failed to create auth user:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create auth user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      authUserId = newAuthUser.user!.id;
      console.log(`Created auth user: ${authUserId}`);

      // Update public.users with auth user id if different
      if (authUserId !== userData.id) {
        await supabaseAdmin
          .from('users')
          .update({ id: authUserId })
          .eq('mobile_number', mobileNumber);
      }
    }

    // Create a session for this user using admin API
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: authUserId,
    });

    if (sessionError || !sessionData.session) {
      console.error('Failed to create session:', sessionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Session created successfully for user:', authUserId);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUserId,
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating session:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
