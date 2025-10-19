import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    const { device_fingerprint, user_agent } = await req.json();

    if (!device_fingerprint) {
      throw new Error('Missing device_fingerprint');
    }

    // Generate secure session token server-side
    const sessionToken = crypto.randomUUID();

    // Insert device session with service role privileges
    const { data, error } = await supabaseClient
      .from('device_sessions')
      .insert({
        user_id: user.id,
        device_fingerprint,
        session_token: sessionToken,
        ip_address: null,
        user_agent: user_agent || null,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create device session:', error);
      throw error;
    }

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: 'device_session_created',
      p_severity: 'low',
      p_details: { device_fingerprint, session_id: data.id },
      p_ip_address: null,
      p_user_agent: user_agent || null
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        session_id: data.id,
        message: 'Device session created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-device-session:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create device session' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
