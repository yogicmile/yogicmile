import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get yesterday's date (process previous day's gifts)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    console.log(`Processing step gifts for date: ${dateStr}`)

    // Get all active referrals (within 30-day bonus period)
    const { data: activeReferrals, error: refError } = await supabaseClient
      .from('referrals_new')
      .select('referee_user_id, referrer_user_id, referee_mobile')
      .eq('status', 'pending')
      .gt('bonus_expires_at', new Date().toISOString())

    if (refError) {
      console.error('Error fetching active referrals:', refError)
      throw refError
    }

    console.log(`Found ${activeReferrals?.length || 0} active referrals`)

    const results = []
    let successCount = 0
    let failCount = 0

    // Process each referee
    for (const referral of activeReferrals || []) {
      try {
        const { data, error } = await supabaseClient.rpc('process_daily_step_gift', {
          p_referee_user_id: referral.referee_user_id,
          p_date: dateStr
        })
        
        if (data?.success) {
          successCount++
          console.log(`✅ Gift processed for ${referral.referee_mobile}: ${data.steps_gifted} steps`)
        } else {
          failCount++
          console.log(`⏭️ Skipped ${referral.referee_mobile}: ${data?.message}`)
        }
        
        results.push({
          referee_user_id: referral.referee_user_id,
          referee_mobile: referral.referee_mobile,
          result: data
        })
      } catch (err) {
        failCount++
        console.error(`Error processing ${referral.referee_mobile}:`, err)
        results.push({
          referee_user_id: referral.referee_user_id,
          referee_mobile: referral.referee_mobile,
          error: err.message
        })
      }
    }

    console.log(`Processing complete: ${successCount} successful, ${failCount} skipped/failed`)

    return new Response(JSON.stringify({
      success: true,
      date: dateStr,
      total_referrals: activeReferrals?.length || 0,
      gifts_processed: successCount,
      skipped: failCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
