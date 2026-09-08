-- ============================================================
-- JAMPLE LIFE — COMPLETE DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- ============================================================
-- Run this in your Supabase SQL Editor.
-- Supabase Project: Project Settings → SQL Editor → New Query
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1: PROFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id VARCHAR(20) UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20) UNIQUE,
  date_of_birth DATE,
  address JSONB DEFAULT '{}',
  profile_image_url TEXT,
  role VARCHAR(10) NOT NULL DEFAULT 'MEMBER'
    CHECK (role IN ('ADMIN', 'MEMBER')),
  network_role VARCHAR(10) NOT NULL DEFAULT 'MEMBER'
    CHECK (network_role IN ('MEMBER', 'LEADER')),
  rank_code VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED')),
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'NOT_SUBMITTED'
    CHECK (kyc_status IN ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED')),
  referral_code VARCHAR(20) UNIQUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Member ID counter (atomic generation)
CREATE TABLE member_id_counter (
  id INT PRIMARY KEY DEFAULT 1,
  current_value BIGINT NOT NULL DEFAULT 100000,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO member_id_counter (id, current_value) VALUES (1, 100000)
  ON CONFLICT (id) DO NOTHING;

-- Order number counter
CREATE TABLE order_number_counter (
  id INT PRIMARY KEY DEFAULT 1,
  year INT NOT NULL,
  current_value BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT single_row_order CHECK (id = 1)
);

-- Settlement number counter
CREATE TABLE settlement_counter (
  id INT PRIMARY KEY DEFAULT 1,
  year INT NOT NULL,
  week_number INT NOT NULL DEFAULT 0,
  CONSTRAINT single_row_settlement CHECK (id = 1)
);

-- Payout number counter
CREATE TABLE payout_counter (
  id INT PRIMARY KEY DEFAULT 1,
  year INT NOT NULL,
  current_value BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT single_row_payout CHECK (id = 1)
);

-- ============================================================
-- SECTION 2: NETWORKS & GENEALOGY
-- ============================================================

CREATE TABLE networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_code VARCHAR(20) UNIQUE NOT NULL,
  network_name VARCHAR(100) NOT NULL,
  root_member_id UUID REFERENCES profiles(id),
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER networks_updated_at
  BEFORE UPDATE ON networks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE network_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_id UUID NOT NULL REFERENCES networks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  UNIQUE (network_id, member_id)
);

CREATE TABLE genealogy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES profiles(id),           -- who referred
  parent_id UUID REFERENCES profiles(id),             -- placement parent
  position VARCHAR(5) CHECK (position IN ('LEFT', 'RIGHT')),
  level INTEGER NOT NULL DEFAULT 0,
  network_id UUID REFERENCES networks(id),
  path TEXT,                                           -- materialized path e.g. 'JL100001.JL100002.JL100003'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent self-sponsorship
  CONSTRAINT no_self_sponsor CHECK (member_id != sponsor_id),
  -- Prevent self-placement
  CONSTRAINT no_self_parent CHECK (member_id != parent_id)
);

-- Closure table for fast ancestor/descendant queries
CREATE TABLE genealogy_paths (
  ancestor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  descendant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  depth INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ancestor_id, descendant_id)
);

-- Unique placement constraint: only one LEFT and one RIGHT per parent
CREATE UNIQUE INDEX genealogy_placement_unique
  ON genealogy (parent_id, position)
  WHERE parent_id IS NOT NULL AND position IS NOT NULL;

-- ============================================================
-- SECTION 3: PLANS
-- ============================================================

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_code VARCHAR(20) UNIQUE NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  enrollment_amount NUMERIC(10,2) NOT NULL CHECK (enrollment_amount > 0),
  principal_percentage NUMERIC(5,2) NOT NULL DEFAULT 2.5 CHECK (principal_percentage >= 0),
  profit_percentage NUMERIC(5,2) NOT NULL DEFAULT 2.5 CHECK (profit_percentage >= 0),
  monthly_return NUMERIC(10,2) GENERATED ALWAYS AS
    (enrollment_amount * (principal_percentage + profit_percentage) / 100) STORED,
  duration_months INTEGER NOT NULL DEFAULT 40 CHECK (duration_months > 0),
  total_return NUMERIC(10,2) GENERATED ALWAYS AS
    (enrollment_amount * (principal_percentage + profit_percentage) / 100 * duration_months) STORED,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  business_rule_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE plan_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES profiles(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  enrolled_amount NUMERIC(10,2) NOT NULL CHECK (enrolled_amount > 0),
  status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plan_accruals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES plan_enrollments(id),
  member_id UUID NOT NULL REFERENCES profiles(id),
  month_number INTEGER NOT NULL CHECK (month_number > 0),
  principal_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  accrual_date DATE NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED', 'CREDITED', 'REVERSED')),
  settlement_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: PRODUCTS & CATEGORIES
-- ============================================================

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category_id UUID REFERENCES product_categories(id),
  mrp NUMERIC(10,2) NOT NULL CHECK (mrp > 0),
  dp NUMERIC(10,2) NOT NULL CHECK (dp > 0 AND dp <= mrp),
  selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price > 0 AND selling_price <= mrp),
  pv NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (pv >= 0),
  business_volume NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (business_volume >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  minimum_order_quantity INTEGER NOT NULL DEFAULT 1 CHECK (minimum_order_quantity >= 1),
  maximum_order_quantity INTEGER CHECK (maximum_order_quantity IS NULL OR maximum_order_quantity >= minimum_order_quantity),
  status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Price version snapshots (historical prices preserved)
CREATE TABLE product_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  mrp NUMERIC(10,2) NOT NULL,
  dp NUMERIC(10,2) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  pv NUMERIC(10,2) NOT NULL DEFAULT 0,
  business_volume NUMERIC(10,2) NOT NULL DEFAULT 0,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  transaction_type VARCHAR(20) NOT NULL
    CHECK (transaction_type IN ('STOCK_IN', 'STOCK_OUT', 'ORDER', 'RETURN', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- ============================================================
-- SECTION 5: COMMERCE — ORDERS, ITEMS, PAYMENTS
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES profiles(id),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  payment_status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (order_status IN (
      'PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING',
      'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
  shipping_address JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_version_id UUID REFERENCES product_versions(id),
  -- Price snapshots: preserve historical price
  product_name_snapshot VARCHAR(200) NOT NULL,
  sku_snapshot VARCHAR(50) NOT NULL,
  mrp_snapshot NUMERIC(10,2) NOT NULL,
  dp_snapshot NUMERIC(10,2) NOT NULL,
  selling_price_snapshot NUMERIC(10,2) NOT NULL,
  pv_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0,
  business_volume_snapshot NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  member_id UUID NOT NULL REFERENCES profiles(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(20) NOT NULL DEFAULT 'MANUAL'
    CHECK (method IN ('MANUAL', 'RAZORPAY', 'UPI', 'BANK_TRANSFER')),
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  gateway_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: BUSINESS VOLUME
-- ============================================================

CREATE TABLE business_volume_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES profiles(id),
  source_order_id UUID REFERENCES orders(id),
  source_order_item_id UUID REFERENCES order_items(id),
  network_id UUID REFERENCES networks(id),
  pv NUMERIC(10,2) NOT NULL DEFAULT 0,
  business_volume NUMERIC(10,2) NOT NULL DEFAULT 0,
  transaction_type VARCHAR(15) NOT NULL DEFAULT 'ORDER'
    CHECK (transaction_type IN ('ORDER', 'RETURN', 'ADJUSTMENT', 'REVERSAL')),
  status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'REVERSED', 'CANCELLED', 'LOCKED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 7: COMMISSION SYSTEM
-- ============================================================

CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_type VARCHAR(30) NOT NULL
    CHECK (rule_type IN ('LEVEL_INCOME', 'BDC', 'DIRECTOR_BONUS', 'EDUCATION_COMMISSION')),
  level INTEGER CHECK (level IS NULL OR (level >= 1 AND level <= 13)),
  rate NUMERIC(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (rule_type, level)
);

CREATE TABLE commission_rule_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES commission_rules(id),
  rate NUMERIC(5,2) NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_number VARCHAR(30) UNIQUE NOT NULL,
  network_id UUID REFERENCES networks(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  cutoff_at TIMESTAMPTZ,
  status VARCHAR(25) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN (
      'OPEN', 'CLOSING', 'CALCULATING', 'UNDER_REVIEW',
      'FINALIZED', 'PAYOUT_AVAILABLE', 'PARTIALLY_PAID',
      'PAID', 'FAILED', 'CANCELLED'
    )),
  total_business NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_bdc NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_director_bonus NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_education_commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_plan_accruals NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  eligible_members INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  payout_available_at TIMESTAMPTZ,
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

CREATE TABLE commission_caps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cap_type VARCHAR(30) NOT NULL DEFAULT 'OVERALL',
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  period VARCHAR(10) NOT NULL DEFAULT 'WEEKLY'
    CHECK (period IN ('WEEKLY', 'MONTHLY', 'ANNUAL')),
  applicable_to VARCHAR(30) NOT NULL DEFAULT 'ALL'
    CHECK (applicable_to IN ('ALL', 'LEVEL_INCOME', 'BDC', 'DIRECTOR_BONUS', 'EDUCATION_COMMISSION')),
  active BOOLEAN NOT NULL DEFAULT FALSE,  -- INACTIVE by default
  effective_from TIMESTAMPTZ,
  effective_until TIMESTAMPTZ,
  business_rule_note TEXT DEFAULT 'Commission cap basis not confirmed. Configure and activate when business rules are confirmed.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE commission_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  beneficiary_member_id UUID NOT NULL REFERENCES profiles(id),
  source_member_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  business_volume_transaction_id UUID REFERENCES business_volume_transactions(id),
  commission_type VARCHAR(25) NOT NULL
    CHECK (commission_type IN ('LEVEL_INCOME', 'BDC', 'DIRECTOR_BONUS', 'EDUCATION_COMMISSION', 'OTHER')),
  level INTEGER,
  rate NUMERIC(5,2) NOT NULL,
  base_amount NUMERIC(10,2) NOT NULL,
  calculated_amount NUMERIC(10,2) NOT NULL,
  original_amount NUMERIC(10,2),     -- before cap
  capped_amount NUMERIC(10,2),
  final_amount NUMERIC(10,2) NOT NULL,
  cap_applied BOOLEAN NOT NULL DEFAULT FALSE,
  cap_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0,
  cap_reason TEXT,
  settlement_id UUID REFERENCES settlements(id),
  rule_version_id UUID REFERENCES commission_rule_versions(id),
  status VARCHAR(15) NOT NULL DEFAULT 'CALCULATED'
    CHECK (status IN ('CALCULATED', 'ELIGIBLE', 'LOCKED', 'SETTLED', 'REVERSED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settlement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  settlement_id UUID NOT NULL REFERENCES settlements(id),
  member_id UUID NOT NULL REFERENCES profiles(id),
  level_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  bdc_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  director_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  education_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  plan_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  other_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  gross_income NUMERIC(10,2) NOT NULL DEFAULT 0,
  cap_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'FINALIZED', 'PAID', 'REVERSED')),
  UNIQUE (settlement_id, member_id)
);

-- ============================================================
-- SECTION 8: BDC (Business Development Club)
-- ============================================================

CREATE TABLE bdc_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  minimum_levels INTEGER NOT NULL DEFAULT 12,
  qualifying_turnover NUMERIC(12,2),
  percentage NUMERIC(5,2) NOT NULL DEFAULT 5 CHECK (percentage >= 0 AND percentage <= 100),
  duration_months INTEGER NOT NULL DEFAULT 20,
  direct_sponsor_requirement INTEGER,
  pv_matching_requirement BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_director_requirement BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT FALSE,  -- INACTIVE until configured
  business_rule_note TEXT NOT NULL DEFAULT 'BDC qualification thresholds require business rule confirmation before activation.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdc_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES profiles(id),
  qualifying_turnover NUMERIC(12,2) NOT NULL,
  monthly_amount NUMERIC(10,2) NOT NULL,
  months_remaining INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdc_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES profiles(id),
  bdc_eligibility_id UUID NOT NULL REFERENCES bdc_eligibility(id),
  settlement_id UUID REFERENCES settlements(id),
  month_number INTEGER NOT NULL,
  base_turnover NUMERIC(12,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'CALCULATED'
    CHECK (status IN ('CALCULATED', 'SETTLED', 'REVERSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 9: RANKS
-- ============================================================

CREATE TABLE ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rank_code VARCHAR(30) UNIQUE NOT NULL,
  rank_name VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  bonus_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (bonus_percentage >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  business_rule_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rank_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rank_id UUID NOT NULL REFERENCES ranks(id),
  qualification_rules JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT FALSE,  -- INACTIVE until admin configures
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rank_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES profiles(id),
  previous_rank VARCHAR(30),
  new_rank VARCHAR(30) NOT NULL,
  qualification_snapshot JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(20) NOT NULL DEFAULT 'SYSTEM'
    CHECK (source IN ('SYSTEM', 'ADMIN_OVERRIDE')),
  reason TEXT
);

-- ============================================================
-- SECTION 10: EDUCATION CENTERS
-- ============================================================

CREATE TABLE education_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_name VARCHAR(100) NOT NULL,
  leader_member_id UUID NOT NULL REFERENCES profiles(id),
  network_id UUID REFERENCES networks(id),
  address JSONB DEFAULT '{}',
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  education_commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 6
    CHECK (education_commission_percentage >= 0 AND education_commission_percentage <= 100),
  active BOOLEAN NOT NULL DEFAULT FALSE,  -- INACTIVE until approved
  business_rule_note TEXT DEFAULT 'Education commission requires admin approval and business rule confirmation.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education_center_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES education_centers(id),
  member_id UUID NOT NULL REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
  UNIQUE (center_id, member_id)
);

CREATE TABLE education_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  center_id UUID NOT NULL REFERENCES education_centers(id),
  leader_member_id UUID NOT NULL REFERENCES profiles(id),
  settlement_id UUID REFERENCES settlements(id),
  center_business_volume NUMERIC(12,2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 6,
  calculated_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  capped_amount NUMERIC(10,2),
  final_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payout_number VARCHAR(10) NOT NULL DEFAULT 'FIRST'
    CHECK (payout_number IN ('FIRST', 'SECOND')),
  status VARCHAR(15) NOT NULL DEFAULT 'CALCULATED'
    CHECK (status IN ('CALCULATED', 'SETTLED', 'REVERSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 11: WALLET & LEDGER
-- ============================================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  available_payout NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (available_payout >= 0),
  pending_income NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (pending_income >= 0),
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_withdrawn >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(200) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES profiles(id),
  transaction_type VARCHAR(25) NOT NULL
    CHECK (transaction_type IN (
      'COMMISSION', 'BDC_BONUS', 'DIRECTOR_BONUS', 'EDUCATION_COMMISSION',
      'PLAN_ACCRUAL', 'PAYOUT', 'WITHDRAWAL', 'REFUND', 'REVERSAL', 'ADJUSTMENT', 'OTHER'
    )),
  reference_type VARCHAR(50),
  reference_id UUID,
  credit NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  debit NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  -- Must have either credit or debit (not both zero)
  CONSTRAINT valid_transaction CHECK (credit > 0 OR debit > 0)
);

-- ============================================================
-- SECTION 12: PAYOUTS
-- ============================================================

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_number VARCHAR(30) UNIQUE NOT NULL,
  member_id UUID NOT NULL REFERENCES profiles(id),
  settlement_id UUID REFERENCES settlements(id),
  settlement_item_id UUID REFERENCES settlement_items(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method VARCHAR(20) NOT NULL DEFAULT 'BANK_TRANSFER'
    CHECK (method IN ('BANK_TRANSFER', 'UPI', 'OTHER')),
  bank_details_snapshot JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN (
      'AVAILABLE', 'REQUESTED', 'UNDER_REVIEW', 'APPROVED',
      'PROCESSING', 'PAID', 'REJECTED', 'FAILED'
    )),
  requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  rejection_reason TEXT,
  payment_reference VARCHAR(100),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank/withdrawal profile (stored securely, encrypted account number)
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_account_holder VARCHAR(100),
  bank_name VARCHAR(100),
  account_number_encrypted TEXT,    -- stored encrypted
  ifsc VARCHAR(15),
  upi_id VARCHAR(100),
  preferred_method VARCHAR(20) NOT NULL DEFAULT 'BANK_TRANSFER'
    CHECK (preferred_method IN ('BANK_TRANSFER', 'UPI')),
  kyc_required BOOLEAN NOT NULL DEFAULT TRUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 13: KYC
-- ============================================================

CREATE TABLE kyc_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'NOT_SUBMITTED'
    CHECK (status IN ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kyc_profile_id UUID NOT NULL REFERENCES kyc_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(15) NOT NULL
    CHECK (document_type IN ('IDENTITY', 'ADDRESS', 'BANK', 'PHOTO')),
  storage_path TEXT NOT NULL,       -- path in private Supabase Storage bucket
  file_name VARCHAR(200) NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 14: ENGAGEMENT (TASKS, NOTIFICATIONS, NOTICES)
-- ============================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'
    CHECK (type IN ('PURCHASE', 'REFERRAL', 'PROFILE', 'ENGAGEMENT', 'CUSTOM')),
  reward_type VARCHAR(20) NOT NULL DEFAULT 'OTHER'
    CHECK (reward_type IN ('WALLET_CREDIT', 'PV', 'OTHER')),
  reward_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED')),
  completion_criteria JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  member_id UUID NOT NULL REFERENCES profiles(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  reward_granted BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  UNIQUE (task_id, member_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'OTHER'
    CHECK (type IN (
      'REGISTRATION', 'REFERRAL', 'ORDER', 'PAYMENT', 'SHIPMENT', 'DELIVERY',
      'COMMISSION', 'SETTLEMENT', 'PAYOUT_AVAILABLE', 'PAYOUT_APPROVED',
      'PAYOUT_REJECTED', 'RANK_ACHIEVEMENT', 'KYC_APPROVED', 'KYC_REJECTED',
      'ADMIN_NOTICE', 'OTHER'
    )),
  reference_type VARCHAR(50),
  reference_id UUID,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  audience VARCHAR(20) NOT NULL DEFAULT 'ALL'
    CHECK (audience IN ('ALL', 'SPECIFIC_NETWORK', 'SPECIFIC_RANK', 'SPECIFIC_PLAN')),
  audience_filter JSONB DEFAULT '{}',
  start_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  status VARCHAR(10) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 15: SYSTEM SETTINGS & AUDIT
-- ============================================================

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT 'null',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id),
  actor_role VARCHAR(10),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 16: INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_member_id ON profiles(member_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_mobile ON profiles(mobile);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_rank_code ON profiles(rank_code);

-- Network
CREATE INDEX idx_network_members_member_id ON network_members(member_id);
CREATE INDEX idx_network_members_network_id ON network_members(network_id);

-- Genealogy
CREATE INDEX idx_genealogy_sponsor_id ON genealogy(sponsor_id);
CREATE INDEX idx_genealogy_parent_id ON genealogy(parent_id);
CREATE INDEX idx_genealogy_network_id ON genealogy(network_id);
CREATE INDEX idx_genealogy_level ON genealogy(level);
CREATE INDEX idx_genealogy_paths_ancestor ON genealogy_paths(ancestor_id);
CREATE INDEX idx_genealogy_paths_descendant ON genealogy_paths(descendant_id);
CREATE INDEX idx_genealogy_paths_depth ON genealogy_paths(depth);

-- Orders
CREATE INDEX idx_orders_member_id ON orders(member_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Business Volume
CREATE INDEX idx_bv_member_id ON business_volume_transactions(member_id);
CREATE INDEX idx_bv_order_id ON business_volume_transactions(source_order_id);
CREATE INDEX idx_bv_network_id ON business_volume_transactions(network_id);
CREATE INDEX idx_bv_status ON business_volume_transactions(status);
CREATE INDEX idx_bv_created_at ON business_volume_transactions(created_at);

-- Commission
CREATE INDEX idx_ct_beneficiary ON commission_transactions(beneficiary_member_id);
CREATE INDEX idx_ct_source ON commission_transactions(source_member_id);
CREATE INDEX idx_ct_order_id ON commission_transactions(order_id);
CREATE INDEX idx_ct_settlement_id ON commission_transactions(settlement_id);
CREATE INDEX idx_ct_status ON commission_transactions(status);
CREATE INDEX idx_ct_created_at ON commission_transactions(created_at);
CREATE INDEX idx_ct_type ON commission_transactions(commission_type);

-- Settlement
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_period ON settlements(period_start, period_end);
CREATE INDEX idx_settlement_items_member ON settlement_items(member_id);
CREATE INDEX idx_settlement_items_settlement ON settlement_items(settlement_id);

-- Wallet
CREATE INDEX idx_wallet_tx_member ON wallet_transactions(member_id);
CREATE INDEX idx_wallet_tx_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_tx_created_at ON wallet_transactions(created_at);

-- Payouts
CREATE INDEX idx_payouts_member ON payouts(member_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_settlement ON payouts(settlement_id);

-- Notifications
CREATE INDEX idx_notifications_member ON notifications(member_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Plans
CREATE INDEX idx_plan_enrollments_member ON plan_enrollments(member_id);
CREATE INDEX idx_plan_accruals_member ON plan_accruals(member_id);
CREATE INDEX idx_plan_accruals_enrollment ON plan_accruals(enrollment_id);

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);

-- Rank history
CREATE INDEX idx_rank_history_member ON rank_history(member_id);
CREATE INDEX idx_rank_history_calculated_at ON rank_history(calculated_at);
