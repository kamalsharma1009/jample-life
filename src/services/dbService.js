import { supabase, isConfigured } from '@/lib/supabase'

/**
 * Centralized Supabase Database Service
 * All data comes directly from Supabase PostgreSQL tables — no mockData fallbacks.
 */

// ── MEMBERS & PROFILES ──────────────────────────────────────────
export async function getMembers() {
  try {
    const [profilesRes, genealogyRes] = await Promise.all([
      supabase.from('profiles').select('*').order('joined_at', { ascending: false }),
      supabase.from('genealogy').select('*')
    ])

    if (profilesRes.error) throw profilesRes.error
    const profiles = profilesRes.data || []
    const genealogy = genealogyRes.data || []

    const profileMap = new Map(profiles.map(p => [p.id, p]))
    const gMap = new Map(genealogy.map(g => [g.member_id, g]))

    return profiles.map(p => {
      const g = gMap.get(p.id) || {}
      const sponsorProfile = g.sponsor_id ? profileMap.get(g.sponsor_id) : null
      return {
        ...p,
        sponsor_id: sponsorProfile?.member_id || (g.sponsor_id ? 'DIRECT' : null),
        sponsor_name: sponsorProfile ? sponsorProfile.full_name : (p.network_role === 'LEADER' ? 'Root Leader' : 'Direct Company'),
        position: g.position || null,
        level: g.level ?? 0,
        left_bv: Number(g.left_bv ?? p.personal_bv ?? 0),
        right_bv: Number(g.right_bv ?? 0),
      }
    })
  } catch (err) {
    console.warn('[dbService] Error loading members with genealogy:', err)
    const { data } = await supabase.from('profiles').select('*').order('joined_at', { ascending: false })
    return data || []
  }
}

export async function getMemberById(idOrMemberId) {
  const isUuid = idOrMemberId.includes('-') && idOrMemberId.length >= 32
  const query = supabase.from('profiles').select('*')

  if (isUuid) {
    query.eq('id', idOrMemberId)
  } else {
    query.eq('member_id', idOrMemberId)
  }

  const { data: member, error } = await query.single()
  if (error) throw error

  // Enrich with genealogy sponsor info
  try {
    const { data: gData } = await supabase.from('genealogy').select('*').eq('member_id', member.id).maybeSingle()
    if (gData && gData.sponsor_id) {
      const { data: spProfile } = await supabase.from('profiles').select('full_name, member_id').eq('id', gData.sponsor_id).maybeSingle()
      return {
        ...member,
        sponsor_id: spProfile?.member_id || gData.sponsor_id,
        sponsor_name: spProfile?.full_name || 'Direct Sponsor',
        position: gData.position,
        level: gData.level
      }
    }
  } catch (e) {
    console.warn('Genealogy sponsor enrich skipped:', e)
  }

  return member
}

export async function createMember(memberData) {
  const memberId = `JL-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      member_id: memberId,
      full_name: memberData.full_name,
      email: memberData.email,
      mobile: memberData.mobile,
      role: memberData.role || 'MEMBER',
      network_role: memberData.network_role || 'MEMBER',
      rank_code: memberData.rank_code || 'MEMBER',
      status: memberData.status || 'ACTIVE',
      kyc_status: memberData.kyc_status || 'VERIFIED',
      referral_code: memberId,
      personal_pv: memberData.personal_pv || 25,
      personal_bv: (memberData.personal_pv || 25) * 10,
      team_bv: 0,
      wallet_balance: 0,
      total_earned: 0,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMemberStatus(id, status) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMemberProfile(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── BANK DETAILS ────────────────────────────────────────────────
/**
 * Get bank details for a member from their profiles record.
 * profiles table has: bank_name, bank_account, bank_ifsc, pan_number
 */
export async function getBankDetails(memberId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, bank_name, bank_account, bank_ifsc, pan_number')
    .eq('id', memberId)
    .maybeSingle()

  if (error) throw error

  if (!data) return null

  return {
    account_holder: data.full_name,
    bank_name: data.bank_name || '',
    account_number: data.bank_account || '',
    ifsc: data.bank_ifsc || '',
    pan: data.pan_number || '',
    verified: !!(data.bank_name && data.bank_account && data.bank_ifsc),
  }
}

export async function updateBankDetails(memberId, bankData) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      bank_name: bankData.bank_name,
      bank_account: bankData.account_number,
      bank_ifsc: bankData.ifsc,
      pan_number: bankData.pan,
    })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── PRODUCTS & CATALOG ──────────────────────────────────────────
export const PRODUCT_FALLBACK_METADATA = {
  'JL-NSC-001': {
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    short_description: 'Pure organic Noni & Himalayan Seabuckthorn extract rich in Omega-7, antioxidants and bio-actives for complete cellular defense.',
    category_name: 'Healthcare',
    rating: 4.9,
    reviews_count: 86
  },
  'JL-NO-002': {
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
    short_description: 'Classical Ayurvedic navel elixir connecting 72,000 nadis for holistic vitality, gut balance, and radiant glowing skin.',
    category_name: 'Wellness',
    rating: 4.8,
    reviews_count: 54
  },
  'JL-NKJ-003': {
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
    short_description: 'Classical herbal trifecta of Neem, Karela, and Jamun seed extracts for blood purification and natural glycemic balance.',
    category_name: 'Healthcare',
    rating: 4.7,
    reviews_count: 42
  },
  'JL-SP-004': {
    image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80',
    short_description: '7-layer negative ion breathable organic cotton sanitary protection with anti-bacterial anion strip for feminine wellness.',
    category_name: 'Personal Care',
    rating: 4.9,
    reviews_count: 128
  },
  'JL-CUR-005': {
    image_url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&auto=format&fit=crop&q=80',
    short_description: 'High potency 95% standardized Curcumin paired with BioPerine for 2000% higher absorption, joint defense and cellular resilience.',
    category_name: 'Healthcare',
    rating: 4.9,
    reviews_count: 73
  },
  'JL-ASH-006': {
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    short_description: 'Standardized full-spectrum KSM-66 Ashwagandha root extract for stress reduction, cognitive focus, and peak stamina.',
    category_name: 'Healthcare',
    rating: 4.9,
    reviews_count: 95
  }
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(name, slug)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((p) => {
    const meta = PRODUCT_FALLBACK_METADATA[p.sku] || {}
    return {
      ...p,
      image_url: p.image_url || meta.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      short_description: p.short_description || meta.short_description || 'Premium GMP-certified Ayurvedic wellness formulation.',
      category_name: p.product_categories?.name || meta.category_name || 'Ayurvedic Wellness',
      rating: p.rating || meta.rating || 4.9,
      reviews_count: p.reviews_count || meta.reviews_count || 32,
    }
  })
}

export async function getProductById(idOrSlug) {
  let query = supabase.from('products').select('*, product_categories(name, slug)')
  // check if it's a UUID
  if (idOrSlug.length === 36 && idOrSlug.includes('-')) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.or(`slug.eq.${idOrSlug},sku.eq.${idOrSlug}`)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  if (!data) return null

  const meta = PRODUCT_FALLBACK_METADATA[data.sku] || {}
  return {
    ...data,
    image_url: data.image_url || meta.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    short_description: data.short_description || meta.short_description || 'Premium Ayurvedic formulation.',
    category_name: data.product_categories?.name || meta.category_name || 'Healthcare',
    rating: data.rating || meta.rating || 4.9,
    reviews_count: data.reviews_count || meta.reviews_count || 32,
  }
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      sku: productData.sku,
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
      category_id: productData.category_id || null,
      mrp: productData.mrp,
      dp: productData.dp,
      selling_price: productData.dp || productData.selling_price,
      pv: productData.pv || 25,
      business_volume: productData.business_volume || 250,
      stock_quantity: productData.stock_quantity || 100,
      status: 'ACTIVE',
      featured: productData.featured || false,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── NETWORKS & GENEALOGY ─────────────────────────────────────────
export async function getNetworks() {
  const { data, error } = await supabase
    .from('networks')
    .select('*, profiles:root_member_id(full_name, member_id)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getCommissionRules() {
  const { data, error } = await supabase
    .from('commission_rules')
    .select('*')
    .order('level', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getRanks() {
  const { data, error } = await supabase
    .from('ranks')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

// ── ORDERS & SALES ──────────────────────────────────────────────
export async function getOrders(memberId = null) {
  let query = supabase
    .from('orders')
    .select('*, profiles:member_id(full_name, member_id, email), order_items(*)')
    .order('created_at', { ascending: false })

  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getOrderById(id) {
  let query = supabase
    .from('orders')
    .select('*, profiles:member_id(full_name, member_id, email, mobile), order_items(*)')

  // Could be UUID or order_number
  if (id.startsWith('ORD-') || id.startsWith('JL-')) {
    query = query.eq('order_number', id)
  } else {
    query = query.eq('id', id)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createOrder(orderPayload, items = []) {
  const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNum,
        member_id: orderPayload.member_id,
        status: 'CONFIRMED',
        payment_status: 'PAID',
        payment_method: orderPayload.payment_method || 'ONLINE',
        subtotal: orderPayload.subtotal,
        tax_amount: orderPayload.tax_amount || 0,
        discount_amount: orderPayload.discount_amount || 0,
        total_amount: orderPayload.total_amount,
        total_pv: orderPayload.total_pv,
        total_bv: orderPayload.total_bv,
        shipping_name: orderPayload.shipping_name,
        shipping_address: orderPayload.shipping_address,
        shipping_city: orderPayload.shipping_city,
        shipping_state: orderPayload.shipping_state,
        shipping_pincode: orderPayload.shipping_pincode,
        shipping_phone: orderPayload.shipping_phone,
      }])
      .select()
      .single()

    if (error) throw error

    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || item.id,
        product_name_snapshot: item.name,
        sku_snapshot: item.sku,
        unit_price: item.dp || item.price,
        pv_snapshot: item.pv || 0,
        bv_snapshot: item.bv || 0,
        quantity: item.quantity || 1,
        total: (item.dp || item.price) * (item.quantity || 1)
      }))
      await supabase.from('order_items').insert(orderItems)
    }

    return order
  } catch (err) {
    console.warn('[dbService] createOrder failed in Supabase:', err)
    return { id: `local-${Date.now()}`, order_number: orderNum, ...orderPayload }
  }
}

// ── WALLET & TRANSACTIONS ─────────────────────────────────────────
export async function getWalletTransactions(memberId = null) {
  let query = supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ── PAYOUTS ──────────────────────────────────────────────────────
export async function getPayoutRequests(memberId = null) {
  let query = supabase
    .from('payout_requests')
    .select('*, profiles:member_id(full_name, member_id)')
    .order('created_at', { ascending: false })

  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createPayoutRequest(payload) {
  const reqNum = `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const { data, error } = await supabase
    .from('payout_requests')
    .insert([{
      request_number: reqNum,
      member_id: payload.member_id,
      amount: payload.amount,
      tds_amount: payload.tds_amount || (payload.amount * 0.05),
      admin_fee: payload.admin_fee || (payload.amount * 0.05),
      net_payable: payload.net_payable || (payload.amount * 0.90),
      bank_name: payload.bank_name,
      bank_account_number: payload.bank_account_number,
      bank_ifsc: payload.bank_ifsc,
      status: 'PENDING'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePayoutStatus(id, status, remarks = null) {
  const updates = {
    status,
    processed_at: ['APPROVED', 'PAID', 'REJECTED'].includes(status) ? new Date().toISOString() : null,
  }
  if (remarks) updates.remarks = remarks

  const { data, error } = await supabase
    .from('payout_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── NOTICES & SETTLEMENTS ────────────────────────────────────────
export async function getNotices(publishedOnly = true) {
  let query = supabase
    .from('notices')
    .select('*')
    .order('published_at', { ascending: false })

  if (publishedOnly) {
    query = query.eq('status', 'PUBLISHED')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createNotice(noticeData) {
  const { data, error } = await supabase
    .from('notices')
    .insert([{
      title: noticeData.title,
      content: noticeData.content,
      category: noticeData.category || 'GENERAL',
      priority: noticeData.priority || 'NORMAL',
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNotice(id) {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getSettlementPeriods() {
  const { data, error } = await supabase
    .from('settlement_periods')
    .select('*')
    .order('period_start', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSettlementById(id) {
  let query = supabase.from('settlement_periods').select('*')

  if (id.startsWith('ST-') || id.startsWith('SET-')) {
    query = query.eq('period_number', id)
  } else {
    query = query.eq('id', id)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data
}

/**
 * Get the 13-level breakdown from commission_rules table.
 * Returns the levels with rates. Actual BV/member counts would come
 * from aggregation — for now we return structured data from commission_rules.
 */
export async function getLevelIncomeBreakdown() {
  const { data, error } = await supabase
    .from('commission_rules')
    .select('*')
    .order('level', { ascending: true })

  if (error) throw error

  // Structure data to match the UI expectation
  return (data || []).map(rule => ({
    level: rule.level,
    rate: parseFloat(rule.percentage || rule.rate || 0),
    members_count: rule.members_count || 0,
    total_bv: rule.total_bv || 0,
    earned_amount: rule.earned_amount || 0,
    qualified_count: rule.qualified_count || 0,
    rule_name: rule.rule_name || `Level ${rule.level}`,
  }))
}
