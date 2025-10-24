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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
};

interface GenerateOTPRequest {
  mobileNumber: string;
  ipAddress?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const reqId = crypto.randomUUID();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error(`[${reqId}] Invalid method: ${req.method}`);
    return new Response(JSON.stringify({
      success: false,
      code: 'INVALID_METHOD',
      error: 'Please use POST method with JSON body.',
      reqId
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Safely parse request body
    const rawBody = await req.text();
    
    if (!rawBody || rawBody.trim() === '') {
      console.error(`[${reqId}] Empty request body`);
      return new Response(JSON.stringify({
        success: false,
        code: 'INVALID_JSON',
        error: 'Request body is required.',
        reqId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody: GenerateOTPRequest;
    try {
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(`[${reqId}] JSON parse error:`, parseError);
      return new Response(JSON.stringify({
        success: false,
        code: 'INVALID_JSON',
        error: 'Invalid JSON format in request body.',
        reqId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read Twilio credentials at request time
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error(`[${reqId}] Missing Twilio credentials`);
      return new Response(JSON.stringify({
        success: false,
        code: 'CONFIG_MISSING',
        error: 'WhatsApp service not configured. Please contact support.',
        reqId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { mobileNumber, ipAddress, userAgent } = requestBody;

    const maskedMobile = mobileNumber ? `${mobileNumber.slice(0, -4)}****` : 'unknown';
    console.log(`[${reqId}] Request: method=${req.method}, mobile=${maskedMobile}, userAgent=${userAgent?.substring(0, 50)}`);

    if (!mobileNumber) {
      console.error(`[${reqId}] Missing mobile number`);
      return new Response(JSON.stringify({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'Mobile number is required.',
        reqId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      console.warn(`[${reqId}] Mobile ${maskedMobile} is permanently blocked`);
      return new Response(JSON.stringify({
        success: false,
        code: 'OTP_BLOCKED',
        error: 'Account is blocked. Contact support.',
        blocked_until: rateLimitData.blocked_until,
        reqId
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (rateLimitData?.blocked_until && new Date(rateLimitData.blocked_until) > new Date()) {
      const blockedUntil = new Date(rateLimitData.blocked_until);
      const waitSeconds = Math.ceil((blockedUntil.getTime() - Date.now()) / 1000);
      console.warn(`[${reqId}] Mobile ${maskedMobile} is temporarily blocked for ${waitSeconds}s`);
      return new Response(JSON.stringify({
        success: false,
        code: 'OTP_RATE_LIMIT',
        error: `Too many requests. Try again after ${Math.ceil(waitSeconds / 60)} minutes.`,
        retry_after_seconds: waitSeconds,
        blocked_until: rateLimitData.blocked_until,
        reqId
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    if (rateLimitData?.daily_window_start === today && rateLimitData.daily_attempts >= 10) {
      console.warn(`[${reqId}] Mobile ${maskedMobile} exceeded daily limit`);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return new Response(JSON.stringify({
        success: false,
        code: 'OTP_DAILY_LIMIT',
        error: 'Daily OTP limit (10) exceeded. Try again tomorrow.',
        next_allowed_at: tomorrow.toISOString(),
        attempts_remaining: 0,
        reqId
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate 6-digit OTP
    const plainOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[${reqId}] Generated OTP for ${maskedMobile}`);

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

    console.log(`[${reqId}] WhatsApp OTP sent successfully: ${whatsappData.sid}`);

    // Calculate attempts remaining
    const currentAttempts = rateLimitData ? 
      ((Date.now() - new Date(rateLimitData.window_start).getTime()) < 60 * 60 * 1000 ? 
        rateLimitData.attempts + 1 : 1) : 1;
    const attemptsRemaining = Math.max(0, 3 - currentAttempts);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent via WhatsApp',
        attempts_remaining: attemptsRemaining,
        reqId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error(`[${reqId}] Unexpected error:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      code: 'UNEXPECTED_ERROR',
      error: 'Something went wrong. Please try again.',
      reqId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
