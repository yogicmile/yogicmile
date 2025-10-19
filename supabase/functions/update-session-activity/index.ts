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

    const { device_fingerprint } = await req.json();

    if (!device_fingerprint) {
      throw new Error('Missing device_fingerprint');
    }

    // Update session activity for the user's active session with matching fingerprint
    const { error } = await supabaseClient
      .from('device_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        is_active: true 
      })
      .eq('user_id', user.id)
      .eq('device_fingerprint', device_fingerprint)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to update session activity:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Session activity updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-session-activity:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to update session activity' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
