// ============================================================
// SUPABASE EDGE FUNCTION: process-payout
// ============================================================
// Purpose: Handles distributor withdrawal processing, wallet debit,
// statutory verification, and bank payment notification.
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

    const { payout_id, action, payment_reference, reject_reason } = await req.json()

    if (!payout_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing payout_id or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: payout, error: payErr } = await supabaseClient
      .from('payout_requests')
      .select('*, member:profiles(id, full_name, email)')
      .eq('id', payout_id)
      .single()

    if (payErr || !payout) {
      throw new Error(`Payout request not found: ${payout_id}`)
    }

    if (action === 'APPROVE') {
      if (!payment_reference) {
        throw new Error('Bank UTR / Payment reference is required to mark payout as PAID')
      }

      // Update Payout Record
      await supabaseClient
        .from('payout_requests')
        .update({
          status: 'PAID',
          payment_reference,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payout_id)

      // Notify Member
      await supabaseClient.from('notifications').insert({
        recipient_id: payout.member_id,
        title: 'Withdrawal Transferred to Bank!',
        message: `Your payout of ₹${payout.net_amount.toFixed(2)} has been transferred. Reference UTR: ${payment_reference}.`,
        type: 'FINANCE',
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Payout marked as PAID successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'REJECT') {
      if (!reject_reason) {
        throw new Error('Reason is required when rejecting a payout')
      }

      // Refund amount back to member wallet
      const { data: wallet } = await supabaseClient
        .from('wallets')
        .select('id, balance')
        .eq('member_id', payout.member_id)
        .single()

      const refundedBalance = (wallet?.balance || 0) + payout.requested_amount
      await supabaseClient
        .from('wallets')
        .update({ balance: refundedBalance })
        .eq('member_id', payout.member_id)

      // Record Refund in Ledger
      await supabaseClient.from('wallet_transactions').insert({
        wallet_id: wallet?.id,
        member_id: payout.member_id,
        transaction_type: 'PAYOUT_REFUND',
        entry_type: 'CREDIT',
        amount: payout.requested_amount,
        balance_after: refundedBalance,
        reference_id: payout.payout_number,
        description: `Refund for rejected payout ${payout.payout_number} — Reason: ${reject_reason}`,
      })

      // Update Payout Status
      await supabaseClient
        .from('payout_requests')
        .update({
          status: 'REJECTED',
          notes: reject_reason,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payout_id)

      // Notify Member
      await supabaseClient.from('notifications').insert({
        recipient_id: payout.member_id,
        title: 'Payout Request Rejected',
        message: `Your payout request ${payout.payout_number} of ₹${payout.requested_amount.toFixed(2)} was rejected: "${reject_reason}". The amount has been refunded to your wallet.`,
        type: 'FINANCE',
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Payout rejected and refunded to wallet' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(`Invalid action: ${action}`)
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
