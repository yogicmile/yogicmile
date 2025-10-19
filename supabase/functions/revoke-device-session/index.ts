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

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error('Missing session_id');
    }

    // Verify the session belongs to the user before revoking
    const { data: existingSession, error: verifyError } = await supabaseClient
      .from('device_sessions')
      .select('id, user_id')
      .eq('id', session_id)
      .single();

    if (verifyError || !existingSession) {
      throw new Error('Session not found');
    }

    if (existingSession.user_id !== user.id) {
      throw new Error('Unauthorized: Session does not belong to user');
    }

    // Revoke the session with service role privileges
    const { error } = await supabaseClient
      .from('device_sessions')
      .update({ is_active: false })
      .eq('id', session_id);

    if (error) {
      console.error('Failed to revoke device session:', error);
      throw error;
    }

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: 'device_session_revoked',
      p_severity: 'medium',
      p_details: { revoked_session_id: session_id },
      p_ip_address: null,
      p_user_agent: null
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Device session revoked successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in revoke-device-session:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to revoke device session' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
