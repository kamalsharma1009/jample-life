/**
 * Fallback & Demo dataset for Jample Life MLM platform.
 * Used when Supabase is in demo mode or for instant rendering of products, categories, notices, etc.
 */

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Healthcare', slug: 'healthcare', description: 'Health and wellness products for a better life', count: 6 },
  { id: 'cat-2', name: 'Wellness', slug: 'wellness', description: 'Natural wellness and nutrition supplements', count: 4 },
  { id: 'cat-3', name: 'Personal Care', slug: 'personal-care', description: 'Personal hygiene and premium care products', count: 3 },
  { id: 'cat-4', name: 'Nutrition', slug: 'nutrition', description: 'Nutritional supplements and health boosters', count: 5 },
]

export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    sku: 'JL-NSC-001',
    name: 'Noni Seabuckthorn Capsules',
    slug: 'noni-seabuckthorn-capsules',
    category_id: 'cat-1',
    category_name: 'Healthcare',
    short_description: 'Premium Noni and Seabuckthorn blend capsules for natural immunity and vitality',
    full_description: 'Jample Life Noni Seabuckthorn Capsules are a powerful synergy of Morinda citrifolia (Noni) fruit extract and Hippophae rhamnoides (Seabuckthorn). Enriched with over 150 bioactive compounds, essential fatty acids (Omega 3, 6, 7 & 9), and vitamins A, C & E, this formulation boosts cellular immunity, revitalizes energy metabolism, and enhances digestive health.',
    ingredients: 'Pure Noni Extract (400mg), Seabuckthorn Berry Extract (250mg), Piperine Extract (5mg), Vegetarian HPMC Capsule shell.',
    usage_instructions: 'Take 1-2 capsules twice daily with lukewarm water before meals, or as directed by your healthcare professional.',
    mrp: 2500.00,
    dp: 1250.00,
    selling_price: 1250.00,
    pv: 25,
    business_volume: 250,
    stock_quantity: 120,
    status: 'ACTIVE',
    featured: true,
    rating: 4.9,
    reviews_count: 86,
    benefits: [
      'Boosts natural immune defense and cellular resistance',
      'Rich in rare Omega-7 fatty acids and vital antioxidants',
      'Supports healthy digestion and nutrient absorption',
      'Enhances physical stamina and overall vitality',
    ],
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-2',
    sku: 'JL-NO-002',
    name: 'Nabhi Oil (Ayurvedic Navel Drops)',
    slug: 'nabhi-oil',
    category_id: 'cat-2',
    category_name: 'Wellness',
    short_description: 'Traditional Ayurvedic navel elixir for holistic vitality, gut balance and radiant skin',
    full_description: 'Jample Life Nabhi Oil is formulated in accordance with the timeless Ayurvedic Nabhi Chikitsa tradition. The belly button connects to more than 72,000 veins (nadis) across the human body. Infused with potent cold-pressed botanical extracts and essential herbal essences, it supports deep detoxification, gut rejuvenation, and systemic stress relief.',
    ingredients: 'Cold pressed Sesame Oil, Mustard Oil, Almond Oil, Tea Tree extract, Castor Oil, Shankhpushpi, Ashwagandha oil extract.',
    usage_instructions: 'Apply 3-4 drops directly into the belly button at bedtime. Gently massage clockwise in a 2-inch circle for 2-3 minutes.',
    mrp: 1250.00,
    dp: 750.00,
    selling_price: 750.00,
    pv: 15,
    business_volume: 150,
    stock_quantity: 180,
    status: 'ACTIVE',
    featured: true,
    rating: 4.8,
    reviews_count: 54,
    benefits: [
      'Balances the central digestive fire (Agni) and eases bloating',
      'Promotes deep restful sleep and mental relaxation',
      'Nourishes dry skin from within and adds a natural glow',
      'Helps balance Vata, Pitta, and Kapha doshas',
    ],
    image_url: 'https://images.unsplash.com/photo-1608248597359-54876a445d47?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-3',
    sku: 'JL-NKJ-003',
    name: 'Neem Karela Jamun Capsules',
    slug: 'neem-karela-jamun-capsules',
    category_id: 'cat-1',
    category_name: 'Healthcare',
    short_description: 'Ayurvedic metabolic and glycemic balance formula with bitter herbal trio',
    full_description: 'Jample Life Neem Karela Jamun Capsules combine the classical trifecta of blood-purifying and sugar-regulating herbs. Neem purifies the bloodstream, Karela (Bitter Gourd) contains charantin and polypeptide-p which mimic natural insulin, and Jamun (Black Plum) seeds are renowned for maintaining healthy HbA1c levels.',
    ingredients: 'Azadirachta indica (Neem leaf extract 200mg), Momordica charantia (Karela fruit extract 250mg), Syzygium cumini (Jamun seed extract 250mg).',
    usage_instructions: 'Take 1 capsule twice daily, 30 minutes before breakfast and dinner, or as prescribed.',
    mrp: 2500.00,
    dp: 1250.00,
    selling_price: 1250.00,
    pv: 25,
    business_volume: 250,
    stock_quantity: 95,
    status: 'ACTIVE',
    featured: false,
    rating: 4.7,
    reviews_count: 42,
    benefits: [
      'Helps maintain healthy blood glucose levels naturally',
      'Purifies blood and supports liver and pancreas function',
      'Rich in plant antioxidants that protect against oxidative stress',
      'Supports healthy metabolism and weight management',
    ],
    image_url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-4',
    sku: 'JL-SP-004',
    name: 'Anion Organic Sanitary Pads (Pack of 30)',
    slug: 'sanitary-pads',
    category_id: 'cat-3',
    category_name: 'Personal Care',
    short_description: 'Negative-ion antibacterial breathable organic cotton sanitary protection',
    full_description: 'Jample Life Premium Sanitary Pads feature an advanced 7-layer structure integrated with an Anion (negative ion) and Far-IR strip. Made with 100% hypoallergenic organic cotton, zero chlorine bleach, and breathable bottom layer that prevents rashes, eliminates odors, and protects feminine wellness.',
    ingredients: '100% Organic GOTS-certified cotton surface, Green Anion chip, Super Absorbent Polymer (SAP) core, breathable PE back-sheet.',
    usage_instructions: 'Unwrap pad, remove adhesive backing and press firmly onto undergarment. Change every 4-6 hours.',
    mrp: 350.00,
    dp: 150.00,
    selling_price: 150.00,
    pv: 3,
    business_volume: 30,
    stock_quantity: 450,
    status: 'ACTIVE',
    featured: false,
    rating: 4.9,
    reviews_count: 128,
    benefits: [
      'Anion strip releases over 6,000 negative ions/cm3 to curb bacteria',
      'Ultra-absorbent core holds up to 150ml without leakage',
      'Chlorine-free, fragrance-free, dioxin-free and skin-friendly',
      'Breathable micro-porous layer prevents heat and moisture build-up',
    ],
    image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-5',
    sku: 'JL-CUR-005',
    name: 'Curcumin 95% Piperine Capsules',
    slug: 'curcumin-piperine-capsules',
    category_id: 'cat-1',
    category_name: 'Healthcare',
    short_description: 'High-potency standardized Curcumin with BioPerine for joint and cellular defense',
    full_description: 'Jample Life Curcumin formula features 95% standardized curcuminoids extracted from organic turmeric rhizomes, paired with BioPerine black pepper extract to increase bioavailability by up to 2000%. Provides comprehensive support for joint mobility, cardiac resilience, and cellular longevity.',
    ingredients: 'Curcuma longa rhizome extract (500mg - 95% curcuminoids), Piper nigrum fruit extract (5mg - 95% piperine).',
    usage_instructions: 'Take 1 capsule daily after a fat-containing meal, or as advised.',
    mrp: 1800.00,
    dp: 950.00,
    selling_price: 950.00,
    pv: 18,
    business_volume: 180,
    stock_quantity: 110,
    status: 'ACTIVE',
    featured: true,
    rating: 4.9,
    reviews_count: 73,
    benefits: [
      'Clinically proven antioxidant support for joint flexibility',
      'Enhanced with Piperine for 20x higher absorption',
      'Protects cardiovascular cells from oxidative damage',
      'Supports healthy brain and cognitive performance',
    ],
    image_url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-6',
    sku: 'JL-ASH-006',
    name: 'KSM-66 Ashwagandha Gold',
    slug: 'ashwagandha-gold',
    category_id: 'cat-2',
    category_name: 'Wellness',
    short_description: 'Full-spectrum organic root extract for stress resilience, cortisol balance and vigor',
    full_description: 'Jample Life KSM-66 Ashwagandha is the highest concentration full-spectrum root extract available today. Clinically proven to reduce serum cortisol levels, elevate athletic endurance, sharpen mental clarity, and restore youthful vigor.',
    ingredients: 'Organic KSM-66 Ashwagandha root extract (600mg - 5% Withanolides), Piperine (2.5mg).',
    usage_instructions: 'Take 1 capsule twice daily with milk or water after meals.',
    mrp: 1950.00,
    dp: 1100.00,
    selling_price: 1100.00,
    pv: 22,
    business_volume: 220,
    stock_quantity: 140,
    status: 'ACTIVE',
    featured: true,
    rating: 5.0,
    reviews_count: 94,
    benefits: [
      'Reduces stress, nervous tension, and high cortisol levels',
      'Boosts muscle strength, stamina, and workout recovery',
      'Enhances focus, memory, and cognitive sharpness',
      'Supports natural hormonal balance in both men and women',
    ],
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  },
]

export const MOCK_NOTICES = [
  {
    id: 'n-1',
    title: 'Weekly Settlement Cycle Closes Every Monday Midnight',
    content: 'All personal orders and team volume recorded before Monday 23:59:59 IST will be calculated in the Tuesday settlement batch.',
    category: 'SETTLEMENT',
    priority: 'HIGH',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'n-2',
    title: 'Director Leadership Bonus Pool Qualifiers Announced',
    content: 'Congratulations to all members advancing to Marketing Director and Business Director ranks this cycle!',
    category: 'RECOGNITION',
    priority: 'MEDIUM',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
]

export const MOCK_EARNING_STATS = [
  { month: 'Apr', earnings: 4200, bv: 1850 },
  { month: 'May', earnings: 6800, bv: 3200 },
  { month: 'Jun', earnings: 9400, bv: 4600 },
  { month: 'Jul', earnings: 13500, bv: 6900 },
  { month: 'Aug', earnings: 18200, bv: 9100 },
  { month: 'Sep', earnings: 24650, bv: 12400 },
]

export const MOCK_RECENT_ACTIVITIES = [
  { id: 'act-1', type: 'COMMISSION', description: 'Level 1 Commission received from JL-2026-0042', amount: 350.00, time: '2 hours ago' },
  { id: 'act-2', type: 'ORDER', description: 'Personal Order #JL-ORD-2026-0182 completed', amount: 1250.00, pv: 25, time: 'Yesterday' },
  { id: 'act-3', type: 'MEMBER', description: 'New direct sponsor joined: Rajesh Sharma (JL-2026-0091)', time: '2 days ago' },
  { id: 'act-4', type: 'SETTLEMENT', description: 'Weekly Settlement payout credited to wallet', amount: 4850.00, time: 'Sep 2, 2026' },
]

export const MOCK_ORDERS = [
  {
    id: 'ord-101',
    order_number: 'JL-ORD-2026-0089',
    created_at: '2026-09-02T14:30:00Z',
    status: 'DELIVERED',
    payment_status: 'PAID',
    payment_method: 'UPI',
    subtotal: 2500.00,
    shipping_cost: 0.00,
    total_amount: 2500.00,
    total_bv: 500,
    total_pv: 50,
    items_count: 2,
    shipping_address: {
      full_name: 'Kamal Verma',
      phone: '+91 98765 43210',
      address_line1: 'Flat 402, Green Valley Heights',
      address_line2: 'Sector 14',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
    },
    items: [
      { id: 'oi-1', product_name: 'Noni Seabuckthorn Capsules', sku: 'JL-NSC-001', quantity: 2, unit_price: 1250.00, unit_bv: 250, total_price: 2500.00, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'ord-102',
    order_number: 'JL-ORD-2026-0104',
    created_at: '2026-09-04T10:15:00Z',
    status: 'PROCESSING',
    payment_status: 'PAID',
    payment_method: 'WALLET',
    subtotal: 1850.00,
    shipping_cost: 0.00,
    total_amount: 1850.00,
    total_bv: 370,
    total_pv: 37,
    items_count: 2,
    shipping_address: {
      full_name: 'Kamal Verma',
      phone: '+91 98765 43210',
      address_line1: 'Flat 402, Green Valley Heights',
      address_line2: 'Sector 14',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
    },
    items: [
      { id: 'oi-2', product_name: 'Nabhi Oil', sku: 'JL-NO-002', quantity: 1, unit_price: 750.00, unit_bv: 150, total_price: 750.00, image_url: 'https://images.unsplash.com/photo-1608248597359-54876a445d47?w=300&auto=format&fit=crop&q=80' },
      { id: 'oi-3', product_name: 'KSM-66 Ashwagandha Gold', sku: 'JL-ASH-006', quantity: 1, unit_price: 1100.00, unit_bv: 220, total_price: 1100.00, image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80' },
    ],
  },
]

// ─────────────────────────────────────────────────────────
// PHASE 3: INCOME & SETTLEMENTS
// ─────────────────────────────────────────────────────────

export const MOCK_SETTLEMENT_PERIODS = [
  {
    id: 'set-2026-w35',
    settlement_number: 'SET-2026-W35',
    period_start: '2026-08-25',
    period_end: '2026-08-31',
    cutoff_date: '2026-08-31T23:59:59Z',
    payout_date: '2026-09-01T09:00:00Z',
    status: 'PAID',
    level_income: 14250.00,
    bdc_income: 2400.00,
    director_bonus: 4500.00,
    gross_amount: 21150.00,
    tds_deduction: 1057.50, // 5% TDS
    admin_charge: 1057.50,  // 5% Admin charge
    net_payout: 19035.00,
    qualifying_pv: 25,
    is_qualified: true,
  },
  {
    id: 'set-2026-w34',
    settlement_number: 'SET-2026-W34',
    period_start: '2026-08-18',
    period_end: '2026-08-24',
    cutoff_date: '2026-08-24T23:59:59Z',
    payout_date: '2026-08-25T09:00:00Z',
    status: 'PAID',
    level_income: 11800.00,
    bdc_income: 1800.00,
    director_bonus: 3200.00,
    gross_amount: 16800.00,
    tds_deduction: 840.00,
    admin_charge: 840.00,
    net_payout: 15120.00,
    qualifying_pv: 25,
    is_qualified: true,
  },
  {
    id: 'set-2026-w36',
    settlement_number: 'SET-2026-W36 (CURRENT)',
    period_start: '2026-09-01',
    period_end: '2026-09-07',
    cutoff_date: '2026-09-07T23:59:59Z',
    payout_date: '2026-09-08T09:00:00Z',
    status: 'OPEN',
    level_income: 8650.00,
    bdc_income: 1200.00,
    director_bonus: 2800.00,
    gross_amount: 12650.00,
    tds_deduction: 632.50,
    admin_charge: 632.50,
    net_payout: 11385.00,
    qualifying_pv: 25,
    is_qualified: true,
  },
]

export const MOCK_13_LEVELS_BREAKDOWN = [
  { level: 1, rate: 10.0, members_count: 6, total_bv: 3500, earned_amount: 350.00, qualified_count: 6 },
  { level: 2, rate: 8.0, members_count: 14, total_bv: 8200, earned_amount: 656.00, qualified_count: 12 },
  { level: 3, rate: 6.0, members_count: 22, total_bv: 14600, earned_amount: 876.00, qualified_count: 18 },
  { level: 4, rate: 4.0, members_count: 18, total_bv: 11400, earned_amount: 456.00, qualified_count: 15 },
  { level: 5, rate: 4.0, members_count: 15, total_bv: 9800, earned_amount: 392.00, qualified_count: 11 },
  { level: 6, rate: 4.0, members_count: 12, total_bv: 7500, earned_amount: 300.00, qualified_count: 9 },
  { level: 7, rate: 2.0, members_count: 9, total_bv: 5400, earned_amount: 108.00, qualified_count: 7 },
  { level: 8, rate: 2.0, members_count: 6, total_bv: 3800, earned_amount: 76.00, qualified_count: 5 },
  { level: 9, rate: 2.0, members_count: 4, total_bv: 2500, earned_amount: 50.00, qualified_count: 3 },
  { level: 10, rate: 1.0, members_count: 3, total_bv: 1800, earned_amount: 18.00, qualified_count: 2 },
  { level: 11, rate: 1.0, members_count: 2, total_bv: 1200, earned_amount: 12.00, qualified_count: 2 },
  { level: 12, rate: 1.0, members_count: 1, total_bv: 600, earned_amount: 6.00, qualified_count: 1 },
  { level: 13, rate: 1.0, members_count: 1, total_bv: 400, earned_amount: 4.00, qualified_count: 1 },
]

// ─────────────────────────────────────────────────────────
// PHASE 3: WALLET LEDGER
// ─────────────────────────────────────────────────────────

export const MOCK_WALLET_TRANSACTIONS = [
  {
    id: 'tx-101',
    transaction_type: 'SETTLEMENT_CREDIT',
    description: 'Weekly Settlement Payout - Week 35 (SET-2026-W35)',
    reference_id: 'SET-2026-W35',
    amount: 19035.00,
    entry_type: 'CREDIT',
    balance_after: 24250.00,
    created_at: '2026-09-01T09:15:00Z',
    status: 'COMPLETED',
  },
  {
    id: 'tx-102',
    transaction_type: 'PAYOUT_WITHDRAWAL',
    description: 'Bank Transfer Withdrawal to HDFC Bank (A/C **4589)',
    reference_id: 'PAY-2026-0042',
    amount: 10000.00,
    entry_type: 'DEBIT',
    balance_after: 14250.00,
    created_at: '2026-09-02T11:30:00Z',
    status: 'COMPLETED',
  },
  {
    id: 'tx-103',
    transaction_type: 'PRODUCT_PURCHASE',
    description: 'Order Payment #JL-ORD-2026-0104 (Nabhi Oil + Ashwagandha)',
    reference_id: 'JL-ORD-2026-0104',
    amount: 1800.00,
    entry_type: 'DEBIT',
    balance_after: 12450.00,
    created_at: '2026-09-04T10:15:00Z',
    status: 'COMPLETED',
  },
  {
    id: 'tx-104',
    transaction_type: 'SETTLEMENT_CREDIT',
    description: 'Weekly Settlement Payout - Week 34 (SET-2026-W34)',
    reference_id: 'SET-2026-W34',
    amount: 15120.00,
    entry_type: 'CREDIT',
    balance_after: 15215.00,
    created_at: '2026-08-25T09:00:00Z',
    status: 'COMPLETED',
  },
  {
    id: 'tx-105',
    transaction_type: 'DIRECT_BONUS',
    description: 'Direct Sponsor Activation Bonus (JL-2026-0091)',
    reference_id: 'REF-0091',
    amount: 500.00,
    entry_type: 'CREDIT',
    balance_after: 15715.00,
    created_at: '2026-08-20T16:45:00Z',
    status: 'COMPLETED',
  },
]

// ─────────────────────────────────────────────────────────
// PHASE 3: PAYOUTS & BANK DETAILS
// ─────────────────────────────────────────────────────────

export const MOCK_BANK_DETAILS = {
  account_holder: 'Kamal Verma',
  bank_name: 'HDFC Bank Ltd',
  account_number: '50100492814589',
  ifsc: 'HDFC0001234',
  upi_id: 'kamal.verma@okhdfcbank',
  verified: true,
}

export const MOCK_PAYOUT_REQUESTS = [
  {
    id: 'pay-1',
    payout_number: 'PAY-2026-0042',
    requested_amount: 10000.00,
    tds_deduction: 500.00,
    admin_charge: 500.00,
    net_payout: 9000.00,
    payment_method: 'BANK_TRANSFER',
    bank_account_preview: 'HDFC Bank (A/C **4589)',
    status: 'PAID',
    payment_reference: 'UTR98274918237',
    requested_at: '2026-09-01T14:30:00Z',
    processed_at: '2026-09-02T11:30:00Z',
  },
  {
    id: 'pay-2',
    payout_number: 'PAY-2026-0028',
    requested_amount: 8000.00,
    tds_deduction: 400.00,
    admin_charge: 400.00,
    net_payout: 7200.00,
    payment_method: 'BANK_TRANSFER',
    bank_account_preview: 'HDFC Bank (A/C **4589)',
    status: 'PAID',
    payment_reference: 'UTR19284729104',
    requested_at: '2026-08-25T12:00:00Z',
    processed_at: '2026-08-26T10:15:00Z',
  },
]

// ─────────────────────────────────────────────────────────
// PHASE 3: TEAM GENEALOGY & DOWNLINE ROSTER
// ─────────────────────────────────────────────────────────

export const MOCK_DOWNLINE_MEMBERS = [
  { id: 'm-1', member_id: 'JL-2026-0091', full_name: 'Rajesh Sharma', level: 1, rank: 'JAMPLE_DIRECTOR', personal_pv: 50, team_bv: 4800, direct_referrals: 8, joined_at: '2026-07-15', status: 'ACTIVE' },
  { id: 'm-2', member_id: 'JL-2026-0092', full_name: 'Pooja Gupta', level: 1, rank: 'MEMBER', personal_pv: 25, team_bv: 1200, direct_referrals: 3, joined_at: '2026-07-22', status: 'ACTIVE' },
  { id: 'm-3', member_id: 'JL-2026-0093', full_name: 'Vikram Singh', level: 1, rank: 'MEMBER', personal_pv: 25, team_bv: 850, direct_referrals: 2, joined_at: '2026-08-01', status: 'ACTIVE' },
  { id: 'm-4', member_id: 'JL-2026-0094', full_name: 'Ananya Roy', level: 1, rank: 'MEMBER', personal_pv: 0, team_bv: 0, direct_referrals: 0, joined_at: '2026-08-10', status: 'PENDING' },
  { id: 'm-5', member_id: 'JL-2026-0105', full_name: 'Deepak Patel', level: 2, sponsor_id: 'JL-2026-0091', rank: 'MEMBER', personal_pv: 25, team_bv: 1600, direct_referrals: 4, joined_at: '2026-08-05', status: 'ACTIVE' },
  { id: 'm-6', member_id: 'JL-2026-0106', full_name: 'Sneha Kulkarni', level: 2, sponsor_id: 'JL-2026-0091', rank: 'MEMBER', personal_pv: 25, team_bv: 950, direct_referrals: 2, joined_at: '2026-08-12', status: 'ACTIVE' },
  { id: 'm-7', member_id: 'JL-2026-0118', full_name: 'Amitabh Sen', level: 3, sponsor_id: 'JL-2026-0105', rank: 'MEMBER', personal_pv: 25, team_bv: 600, direct_referrals: 1, joined_at: '2026-08-20', status: 'ACTIVE' },
]

export const MOCK_GENEALOGY_NODES = [
  {
    id: 'node-root',
    type: 'default',
    data: { label: '👤 You (JL-2026-0088)\nMember | 25 PV' },
    position: { x: 300, y: 50 },
    style: { background: '#800020', color: '#fff', border: '2px solid #f59e0b', borderRadius: '16px', padding: '12px', fontWeight: 'bold' },
  },
  {
    id: 'node-1',
    type: 'default',
    data: { label: 'Rajesh Sharma\nJL-2026-0091 | Dir | 50 PV' },
    position: { x: 100, y: 180 },
    style: { background: '#fff', color: '#0f172a', border: '2px solid #10b981', borderRadius: '14px', padding: '10px', fontSize: '12px' },
  },
  {
    id: 'node-2',
    type: 'default',
    data: { label: 'Pooja Gupta\nJL-2026-0092 | 25 PV' },
    position: { x: 300, y: 180 },
    style: { background: '#fff', color: '#0f172a', border: '2px solid #3b82f6', borderRadius: '14px', padding: '10px', fontSize: '12px' },
  },
  {
    id: 'node-3',
    type: 'default',
    data: { label: 'Vikram Singh\nJL-2026-0093 | 25 PV' },
    position: { x: 500, y: 180 },
    style: { background: '#fff', color: '#0f172a', border: '2px solid #3b82f6', borderRadius: '14px', padding: '10px', fontSize: '12px' },
  },
  {
    id: 'node-4',
    type: 'default',
    data: { label: 'Deepak Patel\nJL-2026-0105 | 25 PV' },
    position: { x: 50, y: 310 },
    style: { background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px', fontSize: '11px' },
  },
  {
    id: 'node-5',
    type: 'default',
    data: { label: 'Sneha Kulkarni\nJL-2026-0106 | 25 PV' },
    position: { x: 180, y: 310 },
    style: { background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px', fontSize: '11px' },
  },
]

export const MOCK_GENEALOGY_EDGES = [
  { id: 'e-root-1', source: 'node-root', target: 'node-1', animated: true, style: { stroke: '#800020', strokeWidth: 2 } },
  { id: 'e-root-2', source: 'node-root', target: 'node-2', animated: true, style: { stroke: '#800020', strokeWidth: 2 } },
  { id: 'e-root-3', source: 'node-root', target: 'node-3', animated: true, style: { stroke: '#800020', strokeWidth: 2 } },
  { id: 'e-1-4', source: 'node-1', target: 'node-4', style: { stroke: '#94a3b8', strokeWidth: 1.5 } },
  { id: 'e-1-5', source: 'node-1', target: 'node-5', style: { stroke: '#94a3b8', strokeWidth: 1.5 } },
]

// ─────────────────────────────────────────────────────────
// PHASE 4: ADMIN NETWORKS & ALL MEMBERS
// ─────────────────────────────────────────────────────────

export const MOCK_NETWORKS = [
  { id: 'net-1', network_code: 'NET_NORTH_01', network_name: 'North India Pioneers', leader_name: 'Rajesh Sharma', leader_id: 'JL-2026-0091', total_members: 142, total_volume_bv: 48500, status: 'ACTIVE', created_at: '2026-06-01' },
  { id: 'net-2', network_code: 'NET_WEST_02', network_name: 'Western Champions', leader_name: 'Sunita Deshmukh', leader_id: 'JL-2026-0045', total_members: 98, total_volume_bv: 32400, status: 'ACTIVE', created_at: '2026-06-15' },
  { id: 'net-3', network_code: 'NET_SOUTH_03', network_name: 'Southern Leaders Guild', leader_name: 'Karthik Raman', leader_id: 'JL-2026-0033', total_members: 64, total_volume_bv: 19800, status: 'ACTIVE', created_at: '2026-07-01' },
]

export const MOCK_ALL_MEMBERS = [
  { id: 'mem-1', member_id: 'JL-2026-0088', full_name: 'Kamal Verma', email: 'kamal@jamplelife.com', mobile: '+91 98765 43210', role: 'MEMBER', network_role: 'MEMBER', rank_code: 'MEMBER', network_id: 'net-1', network_name: 'North India Pioneers', sponsor_id: 'JL-2026-0091', sponsor_name: 'Rajesh Sharma', status: 'ACTIVE', kyc_status: 'VERIFIED', personal_pv: 25, personal_bv: 250, team_bv: 8450, direct_referrals_count: 6, total_downline_count: 48, wallet_balance: 12450.00, total_earned: 48750.00, joined_at: '2026-07-01T10:00:00Z', address: 'Flat 402, Green Valley Heights', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
  { id: 'mem-2', member_id: 'JL-2026-0091', full_name: 'Rajesh Sharma', email: 'rajesh.sharma@gmail.com', mobile: '+91 98111 22334', role: 'MEMBER', network_role: 'LEADER', rank_code: 'JAMPLE_DIRECTOR', network_id: 'net-1', network_name: 'North India Pioneers', sponsor_id: 'JL-2026-0001', sponsor_name: 'Master Sponsor', status: 'ACTIVE', kyc_status: 'VERIFIED', personal_pv: 50, personal_bv: 500, team_bv: 48500, direct_referrals_count: 18, total_downline_count: 142, wallet_balance: 34200.00, total_earned: 142500.00, joined_at: '2026-06-01T09:30:00Z', address: 'B-12, Sector 15', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
  { id: 'mem-3', member_id: 'JL-2026-0092', full_name: 'Pooja Gupta', email: 'pooja.gupta@outlook.com', mobile: '+91 98222 33445', role: 'MEMBER', network_role: 'MEMBER', rank_code: 'MEMBER', network_id: 'net-1', network_name: 'North India Pioneers', sponsor_id: 'JL-2026-0088', sponsor_name: 'Kamal Verma', status: 'ACTIVE', kyc_status: 'VERIFIED', personal_pv: 25, personal_bv: 250, team_bv: 1200, direct_referrals_count: 3, total_downline_count: 14, wallet_balance: 4200.00, total_earned: 12800.00, joined_at: '2026-07-22T14:15:00Z', address: '45 Park Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { id: 'mem-4', member_id: 'JL-2026-0093', full_name: 'Vikram Singh', email: 'vikram.singh@yahoo.com', mobile: '+91 98333 44556', role: 'MEMBER', network_role: 'MEMBER', rank_code: 'MEMBER', network_id: 'net-1', network_name: 'North India Pioneers', sponsor_id: 'JL-2026-0088', sponsor_name: 'Kamal Verma', status: 'ACTIVE', kyc_status: 'PENDING', personal_pv: 25, personal_bv: 250, team_bv: 850, direct_referrals_count: 2, total_downline_count: 8, wallet_balance: 2400.00, total_earned: 6200.00, joined_at: '2026-08-01T11:00:00Z', address: '78 Model Town', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { id: 'mem-5', member_id: 'JL-2026-0094', full_name: 'Ananya Roy', email: 'ananya.roy@gmail.com', mobile: '+91 98444 55667', role: 'MEMBER', network_role: 'MEMBER', rank_code: 'MEMBER', network_id: 'net-1', network_name: 'North India Pioneers', sponsor_id: 'JL-2026-0088', sponsor_name: 'Kamal Verma', status: 'PENDING', kyc_status: 'UNSUBMITTED', personal_pv: 0, personal_bv: 0, team_bv: 0, direct_referrals_count: 0, total_downline_count: 0, wallet_balance: 0.00, total_earned: 0.00, joined_at: '2026-08-10T16:30:00Z', address: '12 Lake Road', city: 'Kolkata', state: 'West Bengal', pincode: '700029' },
  { id: 'mem-6', member_id: 'JL-2026-0045', full_name: 'Sunita Deshmukh', email: 'sunita.d@gmail.com', mobile: '+91 98555 66778', role: 'MEMBER', network_role: 'LEADER', rank_code: 'MARKETING_DIRECTOR', network_id: 'net-2', network_name: 'Western Champions', sponsor_id: 'JL-2026-0001', sponsor_name: 'Master Sponsor', status: 'ACTIVE', kyc_status: 'VERIFIED', personal_pv: 50, personal_bv: 500, team_bv: 32400, direct_referrals_count: 14, total_downline_count: 98, wallet_balance: 28900.00, total_earned: 112000.00, joined_at: '2026-06-15T12:00:00Z', address: '88 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
]

