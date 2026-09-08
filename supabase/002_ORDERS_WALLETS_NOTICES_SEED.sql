-- ============================================================
-- JAMPLE LIFE — ORDERS, WALLET TRANSACTIONS & NOTICES SCHEMA & SEED
-- File: supabase/002_ORDERS_WALLETS_NOTICES_SEED.sql
-- ============================================================
-- Run this in your Supabase Project:
-- Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE' CHECK (payment_method IN ('ONLINE', 'WALLET', 'UPI', 'BANK_TRANSFER', 'COD')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  total_pv NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  total_bv NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  sku_snapshot VARCHAR(50) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  pv_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  bv_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WALLET TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('COMMISSION_CREDIT', 'PAYOUT_DEBIT', 'ORDER_PAYMENT', 'MANUAL_ADJUSTMENT', 'BONUS_CREDIT')),
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  reference_id VARCHAR(100),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYOUT REQUESTS
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  net_payable NUMERIC(12,2) NOT NULL CHECK (net_payable > 0),
  tds_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  admin_fee NUMERIC(10,2) NOT NULL DEFAULT 0.0,
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTICES / ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'ANNOUNCEMENT' CHECK (category IN ('ANNOUNCEMENT', 'OFFER', 'SYSTEM', 'EVENT', 'COMPLIANCE')),
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SETTLEMENT PERIODS
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

-- 7. ENABLE ROW LEVEL SECURITY & PUBLIC POLICIES (for anon client demo & dev usage)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
CREATE POLICY "Public read order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Public read wallet_transactions" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read payout_requests" ON public.payout_requests;
CREATE POLICY "Public read payout_requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read notices" ON public.notices;
CREATE POLICY "Public read notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read settlement_periods" ON public.settlement_periods;
CREATE POLICY "Public read settlement_periods" ON public.settlement_periods FOR ALL USING (true) WITH CHECK (true);

-- 8. COMPREHENSIVE SEED DATA
DO $$
DECLARE
  v_kamal_id UUID;
  v_rajesh_id UUID;
  v_pooja_id UUID;
  v_vikram_id UUID;
  v_order_id UUID;
  v_prod_noni UUID;
  v_prod_oil UUID;
  v_prod_neem UUID;
BEGIN
  -- Get existing member IDs
  SELECT id INTO v_kamal_id FROM public.profiles WHERE email = 'kamal@jamplelife.com' LIMIT 1;
  SELECT id INTO v_rajesh_id FROM public.profiles WHERE email = 'rajesh@jamplelife.com' LIMIT 1;
  SELECT id INTO v_pooja_id FROM public.profiles WHERE email = 'pooja@jamplelife.com' LIMIT 1;
  SELECT id INTO v_vikram_id FROM public.profiles WHERE email = 'vikram@jamplelife.com' LIMIT 1;

  -- Get product IDs
  SELECT id INTO v_prod_noni FROM public.products WHERE sku = 'JL-NSC-001' LIMIT 1;
  SELECT id INTO v_prod_oil FROM public.products WHERE sku = 'JL-NO-002' LIMIT 1;
  SELECT id INTO v_prod_neem FROM public.products WHERE sku = 'JL-NKJ-003' LIMIT 1;

  -- 8.1 SEED NOTICES
  INSERT INTO public.notices (title, content, category, priority, status, published_at) VALUES
    ('Annual Leadership Summit Goa 2026 Announced!', 'Qualified Ruby Executives and Directors are invited for a 3-night luxury leadership retreat at Goa with our Founder.', 'EVENT', 'HIGH', 'PUBLISHED', NOW() - INTERVAL '2 days'),
    ('Fast Track BV Double Bonus Month', 'Achieve 50 Personal PV this month and get an extra 10% on your Level 1 & Level 2 sponsor overrides.', 'OFFER', 'URGENT', 'PUBLISHED', NOW() - INTERVAL '4 days'),
    ('Standardized Direct Selling TDS & Statutory Updates', 'TDS at 5% is strictly deducted under Section 194H of the Income Tax Act for all bank payout transfers.', 'COMPLIANCE', 'NORMAL', 'PUBLISHED', NOW() - INTERVAL '10 days')
  ON CONFLICT DO NOTHING;

  -- 8.2 SEED SETTLEMENT PERIODS
  INSERT INTO public.settlement_periods (period_number, period_start, period_end, status, total_business, total_payout, eligible_members) VALUES
    ('ST-2026-W34', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '7 days', 'PAID', 485000.00, 112400.00, 38),
    ('ST-2026-W35', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'FINALIZED', 624500.00, 145600.00, 46)
  ON CONFLICT (period_number) DO NOTHING;

  -- 8.3 SEED ORDERS
  IF v_kamal_id IS NOT NULL THEN
    INSERT INTO public.orders (
      id, order_number, member_id, status, payment_status, payment_method,
      subtotal, tax_amount, discount_amount, total_amount, total_pv, total_bv, created_at
    ) VALUES
      ('d0000000-0000-0000-0000-000000000001', 'ORD-2026-8941', v_kamal_id, 'DELIVERED', 'PAID', 'ONLINE', 2500.00, 0, 0, 2500.00, 25.0, 250.0, NOW() - INTERVAL '5 days'),
      ('d0000000-0000-0000-0000-000000000002', 'ORD-2026-9102', v_kamal_id, 'CONFIRMED', 'PAID', 'WALLET', 1250.00, 0, 0, 1250.00, 15.0, 150.0, NOW() - INTERVAL '1 day')
    ON CONFLICT (order_number) DO NOTHING;

    -- Order items for Kamal
    INSERT INTO public.order_items (order_id, product_id, product_name_snapshot, sku_snapshot, unit_price, pv_snapshot, bv_snapshot, quantity, total)
    VALUES
      ('d0000000-0000-0000-0000-000000000001', v_prod_noni, 'Noni Seabuckthorn Capsules (60 caps)', 'JL-NSC-001', 1250.00, 25.0, 250.0, 2, 2500.00),
      ('d0000000-0000-0000-0000-000000000002', v_prod_oil, 'Traditional Ayurvedic Nabhi Oil (30ml)', 'JL-NO-002', 750.00, 15.0, 150.0, 1, 750.00)
    ON CONFLICT DO NOTHING;

    -- Wallet transactions for Kamal
    INSERT INTO public.wallet_transactions (member_id, transaction_type, amount, balance_after, description, status, created_at)
    VALUES
      (v_kamal_id, 'COMMISSION_CREDIT', 4500.00, 12450.00, 'Weekly Sponsor Level Overrides — Settlement ST-2026-W35', 'COMPLETED', NOW() - INTERVAL '1 day'),
      (v_kamal_id, 'COMMISSION_CREDIT', 3200.00, 7950.00, 'Director Bonus Tier Override', 'COMPLETED', NOW() - INTERVAL '6 days'),
      (v_kamal_id, 'PAYOUT_DEBIT', -2000.00, 4750.00, 'Bank Payout Transfer ref #NEFT-884920', 'COMPLETED', NOW() - INTERVAL '8 days')
    ON CONFLICT DO NOTHING;

    -- Payout request for Kamal
    INSERT INTO public.payout_requests (request_number, member_id, amount, net_payable, tds_amount, admin_fee, bank_name, bank_account_number, bank_ifsc, status, created_at)
    VALUES
      ('PAY-2026-0041', v_kamal_id, 5000.00, 4500.00, 250.00, 250.00, 'HDFC Bank', '501002349182', 'HDFC0001234', 'APPROVED', NOW() - INTERVAL '3 days')
    ON CONFLICT (request_number) DO NOTHING;
  END IF;

  IF v_rajesh_id IS NOT NULL THEN
    INSERT INTO public.orders (
      id, order_number, member_id, status, payment_status, payment_method,
      subtotal, tax_amount, discount_amount, total_amount, total_pv, total_bv, created_at
    ) VALUES
      ('d0000000-0000-0000-0000-000000000003', 'ORD-2026-8719', v_rajesh_id, 'DELIVERED', 'PAID', 'ONLINE', 3750.00, 0, 0, 3750.00, 50.0, 500.0, NOW() - INTERVAL '8 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO public.wallet_transactions (member_id, transaction_type, amount, balance_after, description, status, created_at)
    VALUES
      (v_rajesh_id, 'COMMISSION_CREDIT', 8200.00, 18200.00, 'Director Pool Distribution — 10% Pool Share', 'COMPLETED', NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- Verification
SELECT 'Orders Count' as entity, COUNT(*)::text as count FROM public.orders
UNION ALL
SELECT 'Wallet Transactions', COUNT(*)::text FROM public.wallet_transactions
UNION ALL
SELECT 'Payout Requests', COUNT(*)::text FROM public.payout_requests
UNION ALL
SELECT 'Notices', COUNT(*)::text FROM public.notices;
