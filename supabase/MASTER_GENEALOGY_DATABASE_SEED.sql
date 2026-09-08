-- ============================================================
-- JAMPLE LIFE — MASTER DATABASE SETUP & COMPREHENSIVE SEED
-- File: supabase/MASTER_GENEALOGY_DATABASE_SEED.sql
-- ============================================================
-- Run this in your Supabase Project:
-- Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 1. SCHEMAS & TABLES
-- ─────────────────────────────────────────────────────────────

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  date_of_birth DATE,
  role VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
  network_role VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK (network_role IN ('MEMBER', 'LEADER')),
  rank_code VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
  status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED')),
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED' CHECK (kyc_status IN ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED')),
  referral_code VARCHAR(20) UNIQUE,
  personal_pv NUMERIC(10,2) NOT NULL DEFAULT 25.0,
  personal_bv NUMERIC(10,2) NOT NULL DEFAULT 250.0,
  team_bv NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  direct_referrals_count INT NOT NULL DEFAULT 0,
  total_downline_count INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RANKS
CREATE TABLE IF NOT EXISTS public.ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rank_code VARCHAR(30) UNIQUE NOT NULL,
  rank_name VARCHAR(50) NOT NULL,
  display_order INT NOT NULL,
  bonus_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- NETWORKS
CREATE TABLE IF NOT EXISTS public.networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_code VARCHAR(20) UNIQUE NOT NULL,
  network_name VARCHAR(100) NOT NULL,
  root_member_id UUID REFERENCES public.profiles(id),
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
  total_members INT NOT NULL DEFAULT 1,
  total_volume_bv NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GENEALOGY HIERARCHY
CREATE TABLE IF NOT EXISTS public.genealogy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES public.profiles(id),
  parent_id UUID REFERENCES public.profiles(id),
  position VARCHAR(5) CHECK (position IN ('LEFT', 'RIGHT')),
  level INT NOT NULL DEFAULT 0,
  network_id UUID REFERENCES public.networks(id),
  left_bv NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  right_bv NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMISSION RULES (13 Levels)
CREATE TABLE IF NOT EXISTS public.commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_type VARCHAR(30) NOT NULL,
  level INT,
  rate NUMERIC(5,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (rule_type, level)
);

-- PRODUCT CATEGORIES & PRODUCTS
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_order INT DEFAULT 1,
  status VARCHAR(10) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id),
  mrp NUMERIC(10,2) NOT NULL,
  dp NUMERIC(10,2) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  pv NUMERIC(10,2) NOT NULL DEFAULT 25.0,
  business_volume NUMERIC(10,2) NOT NULL DEFAULT 250.0,
  stock_quantity INT NOT NULL DEFAULT 100,
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE RLS OR ALLOW READ FOR ANON (for development & demo usage)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genealogy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read ranks" ON public.ranks;
CREATE POLICY "Public read ranks" ON public.ranks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read networks" ON public.networks;
CREATE POLICY "Public read networks" ON public.networks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read genealogy" ON public.genealogy;
CREATE POLICY "Public read genealogy" ON public.genealogy FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read commission_rules" ON public.commission_rules;
CREATE POLICY "Public read commission_rules" ON public.commission_rules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read product_categories" ON public.product_categories;
CREATE POLICY "Public read product_categories" ON public.product_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR ALL USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- 2. SEED RANKS & COMMISSION RULES
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.ranks (rank_code, rank_name, display_order, bonus_percentage) VALUES
  ('MEMBER',             'Member',             1,  0.0),
  ('RUBY_EXECUTIVE',     'Ruby Executive',     2,  5.0),
  ('JAMPLE_DIRECTOR',    'Jample Director',    3,  10.0),
  ('MARKETING_DIRECTOR', 'Marketing Director', 4,  15.0),
  ('BUSINESS_DIRECTOR',  'Business Director',  5,  18.0),
  ('DIAMOND_DIRECTOR',   'Diamond Director',   6,  20.0),
  ('CROWN_AMBASSADOR',   'Crown Ambassador',   7,  25.0)
ON CONFLICT (rank_code) DO UPDATE SET rank_name = EXCLUDED.rank_name, bonus_percentage = EXCLUDED.bonus_percentage;

INSERT INTO public.commission_rules (rule_type, level, rate, active) VALUES
  ('LEVEL_INCOME', 1,  10.0, TRUE),
  ('LEVEL_INCOME', 2,  8.0,  TRUE),
  ('LEVEL_INCOME', 3,  6.0,  TRUE),
  ('LEVEL_INCOME', 4,  4.0,  TRUE),
  ('LEVEL_INCOME', 5,  4.0,  TRUE),
  ('LEVEL_INCOME', 6,  4.0,  TRUE),
  ('LEVEL_INCOME', 7,  2.0,  TRUE),
  ('LEVEL_INCOME', 8,  2.0,  TRUE),
  ('LEVEL_INCOME', 9,  2.0,  TRUE),
  ('LEVEL_INCOME', 10, 1.0,  TRUE),
  ('LEVEL_INCOME', 11, 1.0,  TRUE),
  ('LEVEL_INCOME', 12, 1.0,  TRUE),
  ('LEVEL_INCOME', 13, 1.0,  TRUE)
ON CONFLICT (rule_type, level) DO UPDATE SET rate = EXCLUDED.rate;


-- ─────────────────────────────────────────────────────────────
-- 3. SEED DISTRIBUTOR MEMBERS & GENEALOGY HIERARCHY
-- ─────────────────────────────────────────────────────────────

-- Fixed deterministic UUIDs for relational integrity
DO $$
DECLARE
  uid_admin   UUID := 'a0000000-0000-0000-0000-000000000001';
  uid_kamal   UUID := 'b0000000-0000-0000-0000-000000000001'; -- Root (Kamal Verma)
  uid_rajesh  UUID := 'b0000000-0000-0000-0000-000000000002'; -- L1 Left
  uid_pooja   UUID := 'b0000000-0000-0000-0000-000000000003'; -- L1 Right
  uid_vikram  UUID := 'b0000000-0000-0000-0000-000000000004'; -- L1 Direct
  uid_ananya  UUID := 'b0000000-0000-0000-0000-000000000005'; -- L1 Direct
  uid_deepak  UUID := 'b0000000-0000-0000-0000-000000000006'; -- L2 under Rajesh (Left)
  uid_sneha   UUID := 'b0000000-0000-0000-0000-000000000007'; -- L2 under Rajesh (Right)
  uid_amitabh UUID := 'b0000000-0000-0000-0000-000000000008'; -- L2 under Pooja (Left)
  uid_priya   UUID := 'b0000000-0000-0000-0000-000000000009'; -- L2 under Pooja (Right)
  uid_suresh  UUID := 'b0000000-0000-0000-0000-000000000010'; -- L3 under Deepak
  uid_meera   UUID := 'b0000000-0000-0000-0000-000000000011'; -- L3 under Deepak
  uid_arjun   UUID := 'b0000000-0000-0000-0000-000000000012'; -- L3 under Sneha
  uid_kavita  UUID := 'b0000000-0000-0000-0000-000000000013'; -- L3 under Amitabh
  uid_rohit   UUID := 'b0000000-0000-0000-0000-000000000014'; -- L4 under Suresh
  uid_divya   UUID := 'b0000000-0000-0000-0000-000000000015'; -- L4 under Suresh
  net_id      UUID := 'c0000000-0000-0000-0000-000000000001';
BEGIN

  -- 1. Insert Admin
  INSERT INTO public.profiles (
    id, member_id, full_name, email, mobile, role, network_role, rank_code,
    status, kyc_status, referral_code, personal_pv, personal_bv, team_bv, wallet_balance, total_earned
  ) VALUES (
    uid_admin, 'JL-ADMIN-001', 'Admin Supervisor', 'admin@jamplelife.com', '+919876543210', 'ADMIN', 'LEADER', 'CROWN_AMBASSADOR',
    'ACTIVE', 'VERIFIED', 'JL-ADMIN', 100, 1000, 150000, 245000, 890000
  ) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- 2. Insert Root Member (Kamal Verma)
  INSERT INTO public.profiles (
    id, member_id, full_name, email, mobile, role, network_role, rank_code,
    status, kyc_status, referral_code, personal_pv, personal_bv, team_bv, wallet_balance, total_earned,
    direct_referrals_count, total_downline_count
  ) VALUES (
    uid_kamal, 'JL-2026-0088', 'Kamal Verma', 'kamal@jamplelife.com', '+919811223344', 'MEMBER', 'LEADER', 'RUBY_EXECUTIVE',
    'ACTIVE', 'VERIFIED', 'JL-2026-0088', 25, 250, 18450, 12450, 48750, 6, 48
  ) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, team_bv = EXCLUDED.team_bv;

  -- 3. Insert Downline Members
  -- Level 1
  INSERT INTO public.profiles (id, member_id, full_name, email, mobile, role, rank_code, personal_pv, team_bv, wallet_balance, direct_referrals_count, total_downline_count)
  VALUES
    (uid_rajesh,  'JL-2026-0091', 'Rajesh Sharma',  'rajesh@jamplelife.com',  '+919822334455', 'MEMBER', 'JAMPLE_DIRECTOR', 50, 9400, 18200, 8, 26),
    (uid_pooja,   'JL-2026-0092', 'Pooja Gupta',    'pooja@jamplelife.com',   '+919833445566', 'MEMBER', 'RUBY_EXECUTIVE',  25, 5200, 7800,  4, 14),
    (uid_vikram,  'JL-2026-0093', 'Vikram Singh',   'vikram@jamplelife.com',  '+919844556677', 'MEMBER', 'MEMBER',          25, 2450, 3200,  3, 5),
    (uid_ananya,  'JL-2026-0094', 'Ananya Roy',     'ananya@jamplelife.com',  '+919855667788', 'MEMBER', 'MEMBER',          25, 1400, 1600,  2, 3)
  ON CONFLICT (id) DO NOTHING;

  -- Level 2
  INSERT INTO public.profiles (id, member_id, full_name, email, mobile, role, rank_code, personal_pv, team_bv, wallet_balance, direct_referrals_count, total_downline_count)
  VALUES
    (uid_deepak,  'JL-2026-0105', 'Deepak Patel',   'deepak@jamplelife.com',  '+919866778899', 'MEMBER', 'RUBY_EXECUTIVE',  25, 4800, 5400,  5, 12),
    (uid_sneha,   'JL-2026-0106', 'Sneha Kulkarni', 'sneha@jamplelife.com',   '+919877889900', 'MEMBER', 'MEMBER',          25, 3600, 3900,  3, 8),
    (uid_amitabh, 'JL-2026-0107', 'Amitabh Sen',    'amitabh@jamplelife.com', '+919888990011', 'MEMBER', 'MEMBER',          25, 2800, 2400,  2, 6),
    (uid_priya,   'JL-2026-0108', 'Priya Nair',     'priya@jamplelife.com',   '+919899001122', 'MEMBER', 'MEMBER',          25, 1900, 1800,  2, 4)
  ON CONFLICT (id) DO NOTHING;

  -- Level 3
  INSERT INTO public.profiles (id, member_id, full_name, email, mobile, role, rank_code, personal_pv, team_bv, wallet_balance, direct_referrals_count, total_downline_count)
  VALUES
    (uid_suresh,  'JL-2026-0121', 'Suresh Raina',   'suresh@jamplelife.com',  '+919711223344', 'MEMBER', 'MEMBER',          25, 2200, 2100,  3, 5),
    (uid_meera,   'JL-2026-0122', 'Meera Joshi',    'meera@jamplelife.com',   '+919722334455', 'MEMBER', 'MEMBER',          25, 1800, 1650,  2, 3),
    (uid_arjun,   'JL-2026-0123', 'Arjun Kapoor',   'arjun@jamplelife.com',   '+919733445566', 'MEMBER', 'MEMBER',          25, 1500, 1200,  1, 2),
    (uid_kavita,  'JL-2026-0124', 'Kavita Chawla',  'kavita@jamplelife.com',  '+919744556677', 'MEMBER', 'MEMBER',          25, 1200, 950,   1, 2)
  ON CONFLICT (id) DO NOTHING;

  -- Level 4
  INSERT INTO public.profiles (id, member_id, full_name, email, mobile, role, rank_code, personal_pv, team_bv, wallet_balance, direct_referrals_count, total_downline_count)
  VALUES
    (uid_rohit,   'JL-2026-0145', 'Rohit Saxena',   'rohit@jamplelife.com',   '+919755667788', 'MEMBER', 'MEMBER',          25, 800,  650,   0, 0),
    (uid_divya,   'JL-2026-0146', 'Divya Bhatia',   'divya@jamplelife.com',   '+919766778899', 'MEMBER', 'MEMBER',          25, 650,  500,   0, 0)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Create Master Network
  INSERT INTO public.networks (id, network_code, network_name, root_member_id, total_members, total_volume_bv)
  VALUES (net_id, 'NET-JL-ROYAL', 'Jample Royal Achievers', uid_kamal, 48, 18450)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Build Tree Genealogy Links
  DELETE FROM public.genealogy;

  -- Level 0 (Root Kamal)
  INSERT INTO public.genealogy (member_id, sponsor_id, parent_id, position, level, network_id, left_bv, right_bv)
  VALUES (uid_kamal, NULL, NULL, NULL, 0, net_id, 9400, 9050);

  -- Level 1 (Directs to Kamal)
  INSERT INTO public.genealogy (member_id, sponsor_id, parent_id, position, level, network_id, left_bv, right_bv)
  VALUES
    (uid_rajesh,  uid_kamal, uid_kamal, 'LEFT',  1, net_id, 4800, 3600),
    (uid_pooja,   uid_kamal, uid_kamal, 'RIGHT', 1, net_id, 2800, 1900),
    (uid_vikram,  uid_kamal, uid_rajesh, 'LEFT', 1, net_id, 1200, 850),
    (uid_ananya,  uid_kamal, uid_pooja,  'RIGHT',1, net_id, 800,  600);

  -- Level 2 (Downlines under Rajesh & Pooja)
  INSERT INTO public.genealogy (member_id, sponsor_id, parent_id, position, level, network_id, left_bv, right_bv)
  VALUES
    (uid_deepak,  uid_rajesh, uid_rajesh, 'LEFT',  2, net_id, 2200, 1800),
    (uid_sneha,   uid_rajesh, uid_rajesh, 'RIGHT', 2, net_id, 1500, 1200),
    (uid_amitabh, uid_pooja,  uid_pooja,  'LEFT',  2, net_id, 1200, 950),
    (uid_priya,   uid_pooja,  uid_pooja,  'RIGHT', 2, net_id, 850,  600);

  -- Level 3 (Downlines under Deepak, Sneha & Amitabh)
  INSERT INTO public.genealogy (member_id, sponsor_id, parent_id, position, level, network_id, left_bv, right_bv)
  VALUES
    (uid_suresh,  uid_deepak, uid_deepak, 'LEFT',  3, net_id, 800,  650),
    (uid_meera,   uid_deepak, uid_deepak, 'RIGHT', 3, net_id, 600,  450),
    (uid_arjun,   uid_sneha,  uid_sneha,  'LEFT',  3, net_id, 500,  400),
    (uid_kavita,  uid_amitabh,uid_amitabh,'RIGHT', 3, net_id, 450,  350);

  -- Level 4 (Downlines under Suresh)
  INSERT INTO public.genealogy (member_id, sponsor_id, parent_id, position, level, network_id, left_bv, right_bv)
  VALUES
    (uid_rohit,   uid_suresh, uid_suresh, 'LEFT',  4, net_id, 0, 0),
    (uid_divya,   uid_suresh, uid_suresh, 'RIGHT', 4, net_id, 0, 0);

END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. SEED PRODUCTS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.product_categories (name, slug, display_order) VALUES
  ('Ayurvedic Healthcare', 'healthcare', 1),
  ('Herbal Wellness',      'wellness',   2),
  ('Personal Care',        'personal',   3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  sku, name, slug, mrp, dp, selling_price, pv, business_volume, stock_quantity, featured
) VALUES
  ('JL-NSC-001', 'Noni Seabuckthorn Capsules (60 caps)', 'noni-capsules', 2500.00, 1250.00, 1250.00, 25.0, 250.0, 120, TRUE),
  ('JL-NO-002',  'Traditional Ayurvedic Nabhi Oil (30ml)', 'nabhi-oil', 1250.00, 750.00, 750.00, 15.0, 150.0, 180, TRUE),
  ('JL-NKJ-003', 'Neem Karela Jamun Capsules (60 caps)', 'neem-capsules', 2500.00, 1250.00, 1250.00, 25.0, 250.0, 100, TRUE),
  ('JL-SP-004',  'Organic Anion Sanitary Pads (Pack of 10)', 'sanitary-pads', 350.00, 150.00, 150.00, 5.0, 50.0, 500, FALSE)
ON CONFLICT (sku) DO NOTHING;

-- Verification query
SELECT
  g.level,
  p.member_id,
  p.full_name,
  p.rank_code,
  p.personal_pv,
  p.team_bv,
  g.position
FROM public.genealogy g
JOIN public.profiles p ON p.id = g.member_id
ORDER BY g.level, p.member_id;
