// ============================================================
// SUPABASE EDGE FUNCTION: calculate-settlement
// ============================================================
// Purpose: Automated 13-Level Commission Calculation Engine.
// Runs weekly on Monday 23:59:59 IST cutoff.
// Computes 13-level overrides, BDC, Director bonuses,
// 5% TDS and 5% admin deductions, and credits member wallets.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LEVEL_RATES = {
  1: 0.10, // 10%
  2: 0.08, // 8%
  3: 0.06, // 6%
  4: 0.04, // 4%
  5: 0.04, // 4%
  6: 0.04, // 4%
  7: 0.02, // 2%
  8: 0.02, // 2%
  9: 0.02, // 2%
  10: 0.01, // 1%
  11: 0.01, // 1%
  12: 0.01, // 1%
  13: 0.01, // 1%
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

    const now = new Date()
    const currentYear = now.getFullYear()
    const weekNumber = getWeekNumber(now)
    const settlementNumber = `SET-${currentYear}-W${weekNumber}`

    // 1. Create Settlement Batch record
    const { data: settlementBatch, error: batchErr } = await supabaseClient
      .from('settlements')
      .insert({
        settlement_number: settlementNumber,
        period_start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: now.toISOString(),
        cutoff_date: now.toISOString(),
        status: 'PROCESSING',
      })
      .select()
      .single()

    if (batchErr) {
      throw batchErr
    }

    // 2. Fetch all qualified members (Personal PV >= 25)
    const { data: members, error: memErr } = await supabaseClient
      .from('profiles')
      .select('id, member_id, full_name, personal_pv, rank_code')
      .eq('status', 'ACTIVE')

    if (memErr) throw memErr

    let totalGrossDisbursed = 0
    let totalTdsWithheld = 0
    let totalAdminWithheld = 0
    let totalNetDisbursed = 0

    // 3. Process 13-Level Commission calculation for each member
    for (const member of (members || [])) {
      const isQualified = (member.personal_pv || 0) >= 25
      if (!isQualified) continue // Unqualified members bypass commission earning

      // Fetch member's downline up to 13 generations with volume
      const { data: downlines } = await supabaseClient
        .from('genealogy_closure')
        .select(`
          descendant_id,
          distance,
          descendant:profiles!genealogy_closure_descendant_id_fkey(id, personal_bv)
        `)
        .eq('ancestor_id', member.id)
        .gt('distance', 0)
        .lte('distance', 13)

      let memberLevelIncome = 0

      if (downlines && downlines.length > 0) {
        for (const dl of downlines) {
          const distance = dl.distance
          const rate = LEVEL_RATES[distance] || 0
          const dlBv = dl.descendant?.personal_bv || 0

          if (dlBv > 0 && rate > 0) {
            memberLevelIncome += dlBv * rate
          }
        }
      }

      // Compute Director Leadership Bonus if qualified
      let directorBonus = 0
      if (member.rank_code !== 'MEMBER') {
        // e.g. Jample Director +10%, Marketing Director +5%
        directorBonus = memberLevelIncome * 0.10
      }

      const grossAmount = memberLevelIncome + directorBonus
      if (grossAmount <= 0) continue

      // Deduct 5% TDS and 5% Admin Charge
      const tdsDeduction = grossAmount * 0.05
      const adminCharge = grossAmount * 0.05
      const netPayout = grossAmount - tdsDeduction - adminCharge

      totalGrossDisbursed += grossAmount
      totalTdsWithheld += tdsDeduction
      totalAdminWithheld += adminCharge
      totalNetDisbursed += netPayout

      // Record Settlement Item
      await supabaseClient.from('settlement_items').insert({
        settlement_id: settlementBatch.id,
        member_id: member.id,
        level_income: memberLevelIncome,
        director_bonus: directorBonus,
        gross_amount: grossAmount,
        tds_deduction: tdsDeduction,
        admin_charge: adminCharge,
        net_amount: netPayout,
        qualifying_pv: member.personal_pv,
        status: 'PAID',
      })

      // Deposit Net Amount into Member Wallet
      const { data: wallet } = await supabaseClient
        .from('wallets')
        .select('balance, total_credited')
        .eq('member_id', member.id)
        .single()

      const updatedBalance = (wallet?.balance || 0) + netPayout
      await supabaseClient
        .from('wallets')
        .update({
          balance: updatedBalance,
          total_credited: (wallet?.total_credited || 0) + netPayout,
        })
        .eq('member_id', member.id)

      // Record Transaction Ledger
      await supabaseClient.from('wallet_transactions').insert({
        wallet_id: wallet?.id,
        member_id: member.id,
        transaction_type: 'SETTLEMENT_CREDIT',
        entry_type: 'CREDIT',
        amount: netPayout,
        balance_after: updatedBalance,
        reference_id: settlementNumber,
        description: `Weekly Settlement Payout - ${settlementNumber} (Gross: ₹${grossAmount.toFixed(2)}, TDS: -₹${tdsDeduction.toFixed(2)})`,
      })

      // Notify Member
      await supabaseClient.from('notifications').insert({
        recipient_id: member.id,
        title: 'Weekly Payout Credited!',
        message: `Your settlement ${settlementNumber} payout of ₹${netPayout.toFixed(2)} has been credited to your wallet.`,
        type: 'FINANCE',
      })
    }

    // 4. Update Batch Totals and Finalize
    await supabaseClient
      .from('settlements')
      .update({
        status: 'PAID',
        gross_amount: totalGrossDisbursed,
        tds_deduction: totalTdsWithheld,
        admin_charge: totalAdminWithheld,
        net_amount: totalNetDisbursed,
        finalized_at: new Date().toISOString(),
      })
      .eq('id', settlementBatch.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Settlement ${settlementNumber} executed successfully`,
        summary: {
          settlement_number: settlementNumber,
          total_gross: totalGrossDisbursed,
          total_tds: totalTdsWithheld,
          total_admin: totalAdminWithheld,
          total_net: totalNetDisbursed,
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

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
}
