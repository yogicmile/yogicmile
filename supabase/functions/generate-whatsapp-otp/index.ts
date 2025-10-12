import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

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
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Twilio configuration missing' }),
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
      return new Response(
        JSON.stringify({ success: false, error: 'Too many attempts. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    if (rateLimitData?.daily_window_start === today && rateLimitData.daily_attempts >= 10) {
      console.log('Daily limit exceeded:', mobileNumber);
      return new Response(
        JSON.stringify({ success: false, error: 'Daily OTP limit exceeded. Try again tomorrow.' }),
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

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('mobile_number', mobileNumber)
      .maybeSingle();

    if (userError || !userData) {
      console.error('User not found:', mobileNumber);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      const isWithinWindow = (Date.now() - windowStart.getTime()) < 15 * 60 * 1000; // 15 minutes
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
      let errMsg = 'Failed to send WhatsApp message';
      if (whatsappData?.code === 63007) {
        errMsg = 'WhatsApp sender number is not configured correctly. Ensure TWILIO_WHATSAPP_NUMBER is your WhatsApp-enabled number in E.164 format (e.g., +14155238886) without the "whatsapp:" prefix.';
      } else if (whatsappData?.code === 21608 || whatsappData?.code === 63016) {
        errMsg = 'Recipient is not permitted. If using Twilio Sandbox, join it and use the sandbox WhatsApp number.';
      }
      return new Response(
        JSON.stringify({ success: false, error: errMsg, details: whatsappData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('WhatsApp OTP sent successfully:', whatsappData.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent via WhatsApp'
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
