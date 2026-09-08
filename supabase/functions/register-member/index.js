// ============================================================
// SUPABASE EDGE FUNCTION: register-member
// ============================================================
// Purpose: Handles member registration logic, Member ID generation,
// referral sponsor validation, genealogy closure placement,
// and wallet initialization.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, full_name, mobile, referral_code, address, network_id } = await req.json()

    if (!email || !password || !full_name || !mobile) {
      return new Response(
        JSON.stringify({ error: 'Missing required registration fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Resolve sponsor if referral code provided
    let sponsor = null
    if (referral_code) {
      const { data: sponsorData, error: sponsorErr } = await supabaseClient
        .from('profiles')
        .select('id, member_id, full_name, network_id')
        .or(`member_id.eq.${referral_code},referral_code.eq.${referral_code}`)
        .single()

      if (!sponsorErr && sponsorData) {
        sponsor = sponsorData
      }
    }

    // 2. Create Auth User in Supabase Auth
    const { data: authUser, error: authErr } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, mobile },
    })

    if (authErr) {
      return new Response(
        JSON.stringify({ error: authErr.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = authUser.user.id

    // 3. Generate sequential Member ID (JL-YYYY-XXXX)
    const currentYear = new Date().getFullYear()
    const { data: counterData, error: counterErr } = await supabaseClient.rpc('generate_next_member_id')
    const memberId = counterData || `JL-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`

    // 4. Create Profile
    const { data: profile, error: profileErr } = await supabaseClient
      .from('profiles')
      .insert({
        id: userId,
        member_id: memberId,
        full_name,
        email,
        mobile,
        sponsor_id: sponsor?.id || null,
        network_id: network_id || sponsor?.network_id || null,
        role: 'MEMBER',
        network_role: 'MEMBER',
        rank_code: 'MEMBER',
        status: 'ACTIVE',
        kyc_status: 'PENDING',
        referral_code: memberId,
        personal_pv: 0,
        personal_bv: 0,
        team_bv: 0,
      })
      .select()
      .single()

    if (profileErr) {
      return new Response(
        JSON.stringify({ error: profileErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Initialize Member Wallet
    await supabaseClient.from('wallets').insert({
      member_id: userId,
      balance: 0.00,
      total_credited: 0.00,
      total_debited: 0.00,
    })

    // 6. Insert into Genealogy Closure Table
    if (sponsor) {
      // Self-reference (distance 0)
      await supabaseClient.from('genealogy_closure').insert({
        ancestor_id: userId,
        descendant_id: userId,
        distance: 0,
      })

      // Propagate all ancestors with distance + 1
      const { data: ancestorLinks } = await supabaseClient
        .from('genealogy_closure')
        .select('ancestor_id, distance')
        .eq('descendant_id', sponsor.id)

      if (ancestorLinks && ancestorLinks.length > 0) {
        const newLinks = ancestorLinks.map((link) => ({
          ancestor_id: link.ancestor_id,
          descendant_id: userId,
          distance: link.distance + 1,
        }))
        await supabaseClient.from('genealogy_closure').insert(newLinks)
      }
    }

    // 7. Welcome Notification
    await supabaseClient.from('notifications').insert({
      recipient_id: userId,
      title: 'Welcome to Jample Life!',
      message: `Your Member ID is ${memberId}. Explore our product line to activate your personal PV.`,
      type: 'ACCOUNT',
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Member registered successfully',
        member: {
          id: userId,
          member_id: memberId,
          full_name,
          email,
          sponsor_id: sponsor?.member_id || null,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
