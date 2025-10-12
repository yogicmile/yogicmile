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

    // Generate a magic link and return it to the client for redirect-based login
    const syntheticEmail = (userData.email && userData.email.trim().length > 0)
      ? userData.email
      : `${mobileNumber.replace(/[^0-9]/g, '')}@yogicmile.app`;

    // Ensure the auth user has a valid email & phone set
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      email: syntheticEmail,
      email_confirm: true,
      phone: mobileNumber,
      phone_confirm: true,
    });

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail,
      options: {
        redirectTo: (req.headers.get('origin') || req.headers.get('referer') || Deno.env.get('SUPABASE_SITE_URL') || Deno.env.get('SITE_URL') || Deno.env.get('SUPABASE_URL'))
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Failed to generate magic link:', linkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate login link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Magic link generated for user:', authUserId);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUserId,
        action_link: linkData.properties.action_link
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
