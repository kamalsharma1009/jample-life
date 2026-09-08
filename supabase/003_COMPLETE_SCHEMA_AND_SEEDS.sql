-- ============================================================
-- JAMPLE LIFE — COMPLETE SCHEMA EXTENSION & BUSINESS MODULES SEED
-- File: supabase/003_COMPLETE_SCHEMA_AND_SEEDS.sql
-- ============================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard
-- 2. Go to: SQL Editor -> New Query
-- 3. Paste this ENTIRE script and click "Run" (green button)
-- ============================================================

-- 1. EXTEND PROFILES TABLE WITH RESIDENTIAL, NOMINEE & BANKING FIELDS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Flat 402, Green Valley Heights, Golf Course Ext.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Gurugram';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Haryana';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode VARCHAR(20) DEFAULT '122001';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nominee_name VARCHAR(100) DEFAULT 'Sunita Verma';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nominee_relation VARCHAR(50) DEFAULT 'Spouse';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nominee_mobile VARCHAR(20) DEFAULT '+91 98765 43219';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) DEFAULT 'HDFC Bank Ltd';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50) DEFAULT '50100293848842';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(20) DEFAULT 'HDFC0001245';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20) DEFAULT 'ABCDE1234F';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20) DEFAULT '489238491029';

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE' CHECK (payment_method IN ('ONLINE', 'WALLET', 'COD', 'BANK_TRANSFER')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  total_pv NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  total_bv NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  shipping_name VARCHAR(100),
  shipping_address TEXT,
  shipping_city VARCHAR(50),
  shipping_state VARCHAR(50),
  shipping_pincode VARCHAR(20),
  shipping_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  sku_snapshot VARCHAR(50) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  pv_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  bv_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  quantity INT NOT NULL DEFAULT 1,
  total NUMERIC(10,2) NOT NULL
);

-- 4. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('COMMISSION_CREDIT', 'PAYOUT_DEBIT', 'ORDER_PAYMENT', 'ADMIN_ADJUSTMENT', 'BONUS_CREDIT')),
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  reference_id VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYOUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  tds_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  admin_fee NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  net_payable NUMERIC(12,2) NOT NULL,
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'TRANSFERRED')),
  remarks TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CORPORATE NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(30) NOT NULL DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'EVENT', 'OFFER', 'COMPLIANCE', 'SYSTEM')),
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SETTLEMENT PERIODS TABLE
CREATE TABLE IF NOT EXISTS public.settlement_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_number VARCHAR(30) UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'FINALIZED' CHECK (status IN ('OPEN', 'CALCULATING', 'FINALIZED', 'PAID')),
  total_business NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  total_payout NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  eligible_members INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY & OPEN POLICIES FOR INSTANT WEB INTERACTION
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access orders" ON public.orders;
CREATE POLICY "Public full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access order_items" ON public.order_items;
CREATE POLICY "Public full access order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Public full access wallet_transactions" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access payout_requests" ON public.payout_requests;
CREATE POLICY "Public full access payout_requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access notices" ON public.notices;
CREATE POLICY "Public full access notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access settlement_periods" ON public.settlement_periods;
CREATE POLICY "Public full access settlement_periods" ON public.settlement_periods FOR ALL USING (true) WITH CHECK (true);

-- 9. SEED BUSINESS TRANSACTIONS, NOTICES & SETTLEMENTS
DO $$
DECLARE
  v_kamal_id UUID;
  v_rajesh_id UUID;
  v_pooja_id UUID;
  v_vikram_id UUID;
  v_prod_noni UUID;
  v_prod_oil UUID;
  v_prod_neem UUID;
BEGIN
  -- Grab real member IDs from public.profiles
  SELECT id INTO v_kamal_id FROM public.profiles WHERE email = 'kamal@jamplelife.com' LIMIT 1;
  SELECT id INTO v_rajesh_id FROM public.profiles WHERE email = 'rajesh@jamplelife.com' LIMIT 1;
  SELECT id INTO v_pooja_id FROM public.profiles WHERE email = 'pooja@jamplelife.com' LIMIT 1;
  SELECT id INTO v_vikram_id FROM public.profiles WHERE email = 'vikram@jamplelife.com' LIMIT 1;

  -- Fallback if kamal is missing
  IF v_kamal_id IS NULL THEN
    SELECT id INTO v_kamal_id FROM public.profiles WHERE role = 'MEMBER' LIMIT 1;
  END IF;

  -- Grab real product IDs
  SELECT id INTO v_prod_noni FROM public.products WHERE sku = 'JL-NSC-001' LIMIT 1;
  SELECT id INTO v_prod_oil FROM public.products WHERE sku = 'JL-NO-002' LIMIT 1;
  SELECT id INTO v_prod_neem FROM public.products WHERE sku = 'JL-NKJ-003' LIMIT 1;

  -- 9.1 Corporate Notices
  INSERT INTO public.notices (title, content, category, priority, status, published_at) VALUES
    ('Annual Leadership Summit Goa 2026 Announced!', 'Qualified Ruby Executives and Directors are invited for a 3-night luxury leadership retreat at Goa with our Founder.', 'EVENT', 'HIGH', 'PUBLISHED', NOW() - INTERVAL '2 days'),
    ('Fast Track BV Double Bonus Month', 'Achieve 50 Personal PV this month and get an extra 10% on your Level 1 & Level 2 sponsor overrides.', 'OFFER', 'URGENT', 'PUBLISHED', NOW() - INTERVAL '4 days'),
    ('Standardized Direct Selling TDS & Statutory Updates', 'TDS at 5% is strictly deducted under Section 194H of the Income Tax Act for all bank payout transfers.', 'COMPLIANCE', 'NORMAL', 'PUBLISHED', NOW() - INTERVAL '10 days')
  ON CONFLICT DO NOTHING;

  -- 9.2 Settlement Periods
  INSERT INTO public.settlement_periods (period_number, period_start, period_end, status, total_business, total_payout, eligible_members) VALUES
    ('ST-2026-W34', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '7 days', 'PAID', 485000.00, 112400.00, 38),
    ('ST-2026-W35', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'FINALIZED', 624500.00, 145600.00, 46),
    ('ST-2026-W36', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'OPEN', 184500.00, 36900.00, 24)
  ON CONFLICT (period_number) DO NOTHING;

  -- 9.3 Orders and Order Items
  IF v_kamal_id IS NOT NULL THEN
    INSERT INTO public.orders (
      id, order_number, member_id, status, payment_status, payment_method,
      subtotal, tax_amount, discount_amount, total_amount, total_pv, total_bv, created_at,
      shipping_name, shipping_city, shipping_state
    ) VALUES
      ('d0000000-0000-0000-0000-000000000001', 'ORD-2026-8941', v_kamal_id, 'DELIVERED', 'PAID', 'ONLINE', 2500.00, 0, 0, 2500.00, 25.0, 250.0, NOW() - INTERVAL '5 days', 'Kamal Verma', 'Gurugram', 'Haryana'),
      ('d0000000-0000-0000-0000-000000000002', 'ORD-2026-9102', v_kamal_id, 'CONFIRMED', 'PAID', 'WALLET', 1250.00, 0, 0, 1250.00, 15.0, 150.0, NOW() - INTERVAL '1 day', 'Kamal Verma', 'Gurugram', 'Haryana')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO public.order_items (order_id, product_id, product_name_snapshot, sku_snapshot, unit_price, pv_snapshot, bv_snapshot, quantity, total)
    VALUES
      ('d0000000-0000-0000-0000-000000000001', v_prod_noni, 'Noni Seabuckthorn Capsules (60 caps)', 'JL-NSC-001', 1250.00, 25.0, 250.0, 2, 2500.00),
      ('d0000000-0000-0000-0000-000000000002', v_prod_oil, 'Traditional Ayurvedic Nabhi Oil (30ml)', 'JL-NO-002', 750.00, 15.0, 150.0, 1, 750.00)
    ON CONFLICT DO NOTHING;

    -- Wallet Transactions for Kamal
    INSERT INTO public.wallet_transactions (member_id, transaction_type, amount, balance_after, description, status, created_at)
    VALUES
      (v_kamal_id, 'COMMISSION_CREDIT', 4500.00, 12450.00, 'Weekly Sponsor Level Overrides — Settlement ST-2026-W35', 'COMPLETED', NOW() - INTERVAL '1 day'),
      (v_kamal_id, 'COMMISSION_CREDIT', 3200.00, 7950.00, 'Director Bonus Tier Override', 'COMPLETED', NOW() - INTERVAL '6 days'),
      (v_kamal_id, 'PAYOUT_DEBIT', -2000.00, 4750.00, 'Bank Payout Transfer ref #NEFT-884920', 'COMPLETED', NOW() - INTERVAL '8 days')
    ON CONFLICT DO NOTHING;

    -- Payout Request for Kamal
    INSERT INTO public.payout_requests (request_number, member_id, amount, net_payable, tds_amount, admin_fee, bank_name, bank_account_number, bank_ifsc, status, created_at)
    VALUES
      ('PAY-2026-0041', v_kamal_id, 5000.00, 4500.00, 250.00, 250.00, 'HDFC Bank Ltd', '50100293848842', 'HDFC0001245', 'APPROVED', NOW() - INTERVAL '3 days'),
      ('PAY-2026-0042', v_kamal_id, 3500.00, 3150.00, 175.00, 175.00, 'HDFC Bank Ltd', '50100293848842', 'HDFC0001245', 'PENDING', NOW() - INTERVAL '12 hours')
    ON CONFLICT (request_number) DO NOTHING;
  END IF;

  IF v_rajesh_id IS NOT NULL THEN
    INSERT INTO public.orders (
      id, order_number, member_id, status, payment_status, payment_method,
      subtotal, tax_amount, discount_amount, total_amount, total_pv, total_bv, created_at,
      shipping_name, shipping_city, shipping_state
    ) VALUES
      ('d0000000-0000-0000-0000-000000000003', 'ORD-2026-8719', v_rajesh_id, 'DELIVERED', 'PAID', 'ONLINE', 3750.00, 0, 0, 3750.00, 50.0, 500.0, NOW() - INTERVAL '8 days', 'Rajesh Sharma', 'Noida', 'Uttar Pradesh')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO public.wallet_transactions (member_id, transaction_type, amount, balance_after, description, status, created_at)
    VALUES
      (v_rajesh_id, 'COMMISSION_CREDIT', 8200.00, 18200.00, 'Director Pool Distribution — 10% Pool Share', 'COMPLETED', NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- 10. SUCCESS CONFIRMATION QUERY
SELECT 
  'Profiles Count' AS table_name, COUNT(*)::text AS row_count FROM public.profiles
UNION ALL
SELECT 'Orders Count', COUNT(*)::text FROM public.orders
UNION ALL
SELECT 'Order Items Count', COUNT(*)::text FROM public.order_items
UNION ALL
SELECT 'Wallet Transactions', COUNT(*)::text FROM public.wallet_transactions
UNION ALL
SELECT 'Payout Requests', COUNT(*)::text FROM public.payout_requests
UNION ALL
SELECT 'Notices Count', COUNT(*)::text FROM public.notices
UNION ALL
SELECT 'Settlement Periods', COUNT(*)::text FROM public.settlement_periods;
