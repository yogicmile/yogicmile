import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Twilio credentials are read inside the handler to ensure freshest values at runtime
// const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
// const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
// const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateOTPRequest {
  mobileNumber: string;
  ipAddress?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Read Twilio credentials at request time
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error('Missing Twilio credentials', {
        has_sid: !!TWILIO_ACCOUNT_SID,
        has_token: !!TWILIO_AUTH_TOKEN,
        has_whatsapp: !!TWILIO_WHATSAPP_NUMBER,
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'CONFIG_MISSING',
          error: 'System configuration incomplete. Please use Email & Password to sign up.',
          missing: {
            accountSid: !TWILIO_ACCOUNT_SID, 
            authToken: !TWILIO_AUTH_TOKEN, 
            whatsappFrom: !TWILIO_WHATSAPP_NUMBER 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { mobileNumber, ipAddress, userAgent }: GenerateOTPRequest = await req.json();

    if (!mobileNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mobile number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limiting
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('otp_rate_limits')
      .select('*')
      .eq('mobile_number', mobileNumber)
      .maybeSingle();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      throw rateLimitError;
    }

    // Check if blocked
    if (rateLimitData?.permanent_block) {
      console.log('User permanently blocked:', mobileNumber);
      return new Response(
        JSON.stringify({ success: false, error: 'Account permanently blocked. Contact support.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (rateLimitData?.blocked_until && new Date(rateLimitData.blocked_until) > new Date()) {
      console.log('User temporarily blocked:', mobileNumber);
      const blockedUntil = new Date(rateLimitData.blocked_until);
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: 'OTP_RATE_LIMIT',
          error: 'You can request up to 3 OTPs per hour. Please try again later.',
          next_allowed_at: blockedUntil.toISOString(),
          window_minutes: 60
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    if (rateLimitData?.daily_window_start === today && rateLimitData.daily_attempts >= 10) {
      console.log('Daily limit exceeded:', mobileNumber);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: 'OTP_DAILY_LIMIT',
          error: 'Daily OTP limit (10) exceeded. You can request again tomorrow.',
          next_allowed_at: tomorrow.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const plainOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP for', mobileNumber);

    // Hash the OTP using database function
    const { data: hashedOTP, error: hashError } = await supabase.rpc('hash_otp', {
      plain_otp: plainOTP
    });

    if (hashError) {
      console.error('Error hashing OTP:', hashError);
      throw hashError;
    }

    // Get or create user ID
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('mobile_number', mobileNumber)
      .maybeSingle();

    // If user doesn't exist, create a basic user record for OTP signup
    if (!userData) {
      console.log('User not found, creating new user for OTP signup:', mobileNumber);
      
      const { data: newUser, error: createError } = await supabase.rpc('create_user_with_mobile', {
        p_mobile_number: mobileNumber,
        p_full_name: 'Yogic Walker', // Default name, can be updated later
        p_email: null,
        p_address: null,
        p_referred_by: null,
        p_user_id: null
      });

      if (createError) {
        console.error('Error creating new user:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create user account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the newly created user
      const { data: createdUserData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

      if (fetchError || !createdUserData) {
        console.error('Error fetching newly created user:', fetchError);
        return new Response(
          JSON.stringify({ success: false, error: 'User creation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userData = createdUserData;
      console.log('New user created successfully:', userData.id);
    }

    if (userError) {
      console.error('Database error:', userError);
      throw userError;
    }

    // Mark previous OTPs as used
    await supabase
      .from('otp_logs')
      .update({ is_used: true })
      .eq('user_id', userData.id)
      .eq('is_used', false);

    // Store new OTP
    const { error: insertError } = await supabase
      .from('otp_logs')
      .insert({
        user_id: userData.id,
        otp: hashedOTP,
        mobile_number: mobileNumber,
        expires_at: new Date(Date.now() + 3 * 60 * 1000).toISOString() // 3 minutes
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      throw insertError;
    }

    // Update rate limiting
    if (rateLimitData) {
      const windowStart = new Date(rateLimitData.window_start);
      const isWithinWindow = (Date.now() - windowStart.getTime()) < 60 * 60 * 1000; // 60 minutes (consistent window)
      const newAttempts = isWithinWindow ? rateLimitData.attempts + 1 : 1;
      const newDailyAttempts = rateLimitData.daily_window_start === today ? 
        rateLimitData.daily_attempts + 1 : 1;

      await supabase
        .from('otp_rate_limits')
        .update({
          attempts: newAttempts,
          window_start: isWithinWindow ? rateLimitData.window_start : new Date().toISOString(),
          daily_attempts: newDailyAttempts,
          daily_window_start: today,
          blocked_until: newAttempts >= 3 ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('mobile_number', mobileNumber);
    } else {
      await supabase
        .from('otp_rate_limits')
        .insert({
          mobile_number: mobileNumber,
          attempts: 1,
          window_start: new Date().toISOString(),
          daily_attempts: 1,
          daily_window_start: today
        });
    }

    // Log audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userData.id,
        action: 'otp_generated',
        details: { mobile_number: mobileNumber },
        ip_address: ipAddress,
        user_agent: userAgent
      });

    // Send OTP via WhatsApp
    const normalizedTo = mobileNumber.replace(/\s+/g, '');
    const e164To = normalizedTo.startsWith('+') ? normalizedTo : `+${normalizedTo}`;
    const whatsappTo = e164To.startsWith('whatsapp:') ? e164To : `whatsapp:${e164To}`;

    // Normalize FROM number: accept "+123..." or "whatsapp:+123..." in secret
    const rawFrom = (TWILIO_WHATSAPP_NUMBER || '').trim();
    const e164From = rawFrom.startsWith('whatsapp:')
      ? rawFrom
      : `whatsapp:${rawFrom.startsWith('+') ? rawFrom : `+${rawFrom}`}`;

    const message = `Your YogicMile verification code is: ${plainOTP}\n\nThis code will expire in 3 minutes.\n\nDo not share this code with anyone.`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append('To', whatsappTo);
    formData.append('From', e164From);
    formData.append('Body', message);

    const whatsappResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('Twilio API error:', whatsappData);
      let errorCode = 'TWILIO_ERROR';
      let errMsg = 'Failed to send WhatsApp message';
      
      if (whatsappData?.code === 63007) {
        errorCode = 'TWILIO_INVALID_FROM';
        errMsg = 'WhatsApp sender number is not configured correctly. Please contact support or use Email & Password.';
      } else if (whatsappData?.code === 21608 || whatsappData?.code === 63016) {
        errorCode = 'TWILIO_SANDBOX_REQUIRED';
        errMsg = 'This number isn\'t enabled for WhatsApp sandbox. Please use Email & Password to sign up.';
      } else if (whatsappData?.code === 20003 || whatsappData?.code === 20103 || whatsappData?.code === 20404) {
        errorCode = 'TWILIO_AUTH_INVALID';
        errMsg = 'WhatsApp authentication failed. Please contact support or use Email & Password.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: errorCode,
          error: errMsg, 
          details: whatsappData 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('WhatsApp OTP sent successfully:', whatsappData.sid);

    // Calculate attempts remaining
    const currentAttempts = rateLimitData ? 
      ((Date.now() - new Date(rateLimitData.window_start).getTime()) < 60 * 60 * 1000 ? 
        rateLimitData.attempts + 1 : 1) : 1;
    const attemptsRemaining = Math.max(0, 3 - currentAttempts);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent via WhatsApp',
        attempts_remaining: attemptsRemaining
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-whatsapp-otp function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to generate OTP' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
