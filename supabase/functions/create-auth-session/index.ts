import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'OPTIONS, POST'
};

interface CreateSessionRequest {
  mobileNumber: string;
  redirectUrl?: string;
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

    const { mobileNumber, redirectUrl }: CreateSessionRequest = await req.json();

    if (!mobileNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mobile number required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating auth session for: ${mobileNumber}`);

    // SECURITY: Verify that an OTP was recently validated for this mobile number
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data: recentOTP, error: otpError } = await supabaseAdmin
      .from('otp_logs')
      .select('id, created_at, is_used')
      .eq('mobile_number', mobileNumber)
      .eq('is_used', true)
      .gte('created_at', threeMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !recentOTP) {
      console.error('No recent OTP verification found:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'OTP verification required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OTP verified at: ${recentOTP.created_at}`);

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

    // SECURITY: Validate redirect URL to prevent open redirect attacks
    const allowedDomains = [
      'lovableproject.com',
      'lovable.app',
      'yogicmile.app',
      'localhost',
      'supabase.co'
    ];
    
    // Prefer request origin/referer over environment variables
    const defaultRedirect = req.headers.get('origin') || 
                           req.headers.get('referer')?.split('?')[0] || 
                           Deno.env.get('SUPABASE_SITE_URL') || 
                           Deno.env.get('SITE_URL') || 
                           Deno.env.get('SUPABASE_URL');
    
    let validatedRedirectUrl = defaultRedirect;
    
    if (redirectUrl) {
      try {
        const parsedUrl = new URL(redirectUrl);
        const isAllowed = allowedDomains.some(domain => 
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
        );
        
        if (isAllowed) {
          validatedRedirectUrl = redirectUrl;
          console.log(`✅ Redirect URL validated: ${redirectUrl}`);
        } else {
          console.warn(`⚠️ Redirect URL rejected: ${redirectUrl}, using fallback: ${defaultRedirect}`);
        }
      } catch (e) {
        console.error('Invalid redirect URL format:', e);
      }
    } else {
      console.log(`No redirect URL provided, using default: ${validatedRedirectUrl}`);
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail,
      options: {
        redirectTo: validatedRedirectUrl
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
