// ============================================================
// SUPABASE EDGE FUNCTION: process-order
// ============================================================
// Purpose: Validates commerce order, generates Order Number,
// deducts warehouse inventory, credits Personal PV & BV,
// and propagates Team BV up the 13-level sponsor hierarchy.
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

    const { member_id, items, shipping_address, payment_method, notes } = await req.json()

    if (!member_id || !items || items.length === 0 || !shipping_address) {
      return new Response(
        JSON.stringify({ error: 'Incomplete order payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Calculate order volume and financial totals
    let subtotal = 0
    let totalBv = 0
    let totalPv = 0

    const orderItemsToInsert = []

    for (const item of items) {
      const { data: product, error: prodErr } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single()

      if (prodErr || !product) {
        throw new Error(`Product not found: ${item.id}`)
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for: ${product.name} (Available: ${product.stock_quantity})`)
      }

      const itemTotal = product.dp * item.quantity
      const itemBv = (product.business_volume || product.pv * 10) * item.quantity
      const itemPv = product.pv * item.quantity

      subtotal += itemTotal
      totalBv += itemBv
      totalPv += itemPv

      orderItemsToInsert.push({
        product_id: product.id,
        sku: product.sku,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.dp,
        unit_bv: product.business_volume || product.pv * 10,
        unit_pv: product.pv,
        total_price: itemTotal,
      })

      // Deduct stock
      await supabaseClient
        .from('products')
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq('id', product.id)
    }

    const shippingCost = subtotal >= 1000 ? 0 : 70
    const totalAmount = subtotal + shippingCost

    // 2. Generate unique Order Number (JL-ORD-YYYY-XXXXX)
    const currentYear = new Date().getFullYear()
    const { data: orderSeq } = await supabaseClient.rpc('generate_next_order_number')
    const orderNumber = orderSeq || `JL-ORD-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`

    // 3. Create Order Record
    const { data: order, error: orderErr } = await supabaseClient
      .from('orders')
      .insert({
        member_id,
        order_number: orderNumber,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        total_bv: totalBv,
        total_pv: totalPv,
        status: 'PROCESSING',
        payment_status: 'PAID',
        payment_method: payment_method || 'UPI',
        shipping_address,
        notes,
      })
      .select()
      .single()

    if (orderErr) {
      throw orderErr
    }

    // 4. Attach Order Items
    const itemsWithOrderId = orderItemsToInsert.map((i) => ({ ...i, order_id: order.id }))
    await supabaseClient.from('order_items').insert(itemsWithOrderId)

    // 5. Credit Personal PV and BV to Member Profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('personal_pv, personal_bv')
      .eq('id', member_id)
      .single()

    await supabaseClient
      .from('profiles')
      .update({
        personal_pv: (profile?.personal_pv || 0) + totalPv,
        personal_bv: (profile?.personal_bv || 0) + totalBv,
      })
      .eq('id', member_id)

    // 6. Propagate Team BV up the 13-level sponsor hierarchy via genealogy closure table
    const { data: ancestors } = await supabaseClient
      .from('genealogy_closure')
      .select('ancestor_id, distance')
      .eq('descendant_id', member_id)
      .gt('distance', 0)
      .lte('distance', 13)

    if (ancestors && ancestors.length > 0) {
      for (const anc of ancestors) {
        const { data: ancProfile } = await supabaseClient
          .from('profiles')
          .select('team_bv')
          .eq('id', anc.ancestor_id)
          .single()

        await supabaseClient
          .from('profiles')
          .update({
            team_bv: (ancProfile?.team_bv || 0) + totalBv,
          })
          .eq('id', anc.ancestor_id)
      }
    }

    // 7. Trigger confirmation notification
    await supabaseClient.from('notifications').insert({
      recipient_id: member_id,
      title: 'Order Confirmed!',
      message: `Your order ${orderNumber} for ${formatCurrency(totalAmount)} has been placed. +${totalPv} PV and +${totalBv} BV credited.`,
      type: 'ORDER',
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order processed successfully',
        order: {
          id: order.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          total_bv: totalBv,
          total_pv: totalPv,
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

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}
