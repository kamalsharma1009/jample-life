-- ============================================================
-- JAMPLE LIFE — ROW LEVEL SECURITY POLICIES
-- Migration: 002_rls_policies.sql
-- ============================================================
-- IMPORTANT: Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE genealogy ENABLE ROW LEVEL SECURITY;
ALTER TABLE genealogy_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_accruals ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_volume_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_caps ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdc_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdc_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_center_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────
-- HELPER FUNCTION: Check if current user is admin
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is active member
CREATE OR REPLACE FUNCTION is_active_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'MEMBER'
    AND status = 'ACTIVE'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if member_id is a descendant of current user
CREATE OR REPLACE FUNCTION is_my_downline(target_member_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM genealogy_paths gp
    JOIN genealogy g_me ON g_me.member_id = auth.uid()
    WHERE gp.ancestor_id = auth.uid()
    AND gp.descendant_id = target_member_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────

-- Admin: full access
CREATE POLICY "admin_profiles_all" ON profiles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Member: read own profile
CREATE POLICY "member_profiles_read_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Member: update own profile (limited fields — enforced at application level)
CREATE POLICY "member_profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND NOT is_admin())
  WITH CHECK (id = auth.uid());

-- Allow members to see basic info of their sponsor (for referral display)
-- Only non-sensitive fields should be exposed — controlled in queries
CREATE POLICY "member_can_view_sponsor_basic" ON profiles
  FOR SELECT TO authenticated
  USING (
    -- Can view own profile
    id = auth.uid()
    -- Can view sponsor's basic profile
    OR id IN (
      SELECT sponsor_id FROM genealogy WHERE member_id = auth.uid()
    )
    -- Admin can view all
    OR is_admin()
  );

-- ─────────────────────────────────────────────────────────
-- NETWORKS
-- ─────────────────────────────────────────────────────────

-- Admin: full access
CREATE POLICY "admin_networks_all" ON networks
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Members: can read active networks they belong to
CREATE POLICY "member_networks_read" ON networks
  FOR SELECT TO authenticated
  USING (
    status = 'ACTIVE'
    AND id IN (SELECT network_id FROM network_members WHERE member_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────
-- NETWORK MEMBERS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_network_members_all" ON network_members
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_network_members_read" ON network_members
  FOR SELECT TO authenticated
  USING (member_id = auth.uid() OR is_admin());

-- ─────────────────────────────────────────────────────────
-- GENEALOGY
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_genealogy_all" ON genealogy
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Members can see their own genealogy record
CREATE POLICY "member_genealogy_read_own" ON genealogy
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- Members can see genealogy of their direct downline (limited visibility)
CREATE POLICY "member_genealogy_read_downline" ON genealogy
  FOR SELECT TO authenticated
  USING (
    is_my_downline(member_id)
    AND auth.uid() != member_id
  );

CREATE POLICY "admin_genealogy_paths_all" ON genealogy_paths
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_genealogy_paths_read" ON genealogy_paths
  FOR SELECT TO authenticated
  USING (
    ancestor_id = auth.uid()
    OR descendant_id = auth.uid()
  );

-- ─────────────────────────────────────────────────────────
-- PLANS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_plans_all" ON plans
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_plans_read_active" ON plans
  FOR SELECT TO authenticated
  USING (status = 'ACTIVE' AND active = TRUE);

CREATE POLICY "admin_plan_enrollments_all" ON plan_enrollments
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_plan_enrollments_own" ON plan_enrollments
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

CREATE POLICY "admin_plan_accruals_all" ON plan_accruals
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_plan_accruals_own" ON plan_accruals
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- PRODUCTS (read-only for members, full for admin)
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_categories_all" ON product_categories
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "anyone_read_active_categories" ON product_categories
  FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "admin_products_all" ON products
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "anyone_read_active_products" ON products
  FOR SELECT
  USING (status IN ('ACTIVE', 'OUT_OF_STOCK'));

CREATE POLICY "admin_product_versions_all" ON product_versions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_product_versions_read" ON product_versions
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "admin_inventory_all" ON inventory_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_orders_all" ON orders
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_orders_own" ON orders
  FOR ALL TO authenticated
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "admin_order_items_all" ON order_items
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_order_items_own" ON order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE member_id = auth.uid())
  );

CREATE POLICY "admin_payments_all" ON payments
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_payments_own" ON payments
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- BUSINESS VOLUME
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_bv_all" ON business_volume_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_bv_own" ON business_volume_transactions
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- COMMISSION RULES (admin writes, members read active)
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_commission_rules_all" ON commission_rules
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_commission_rules_read" ON commission_rules
  FOR SELECT TO authenticated
  USING (active = TRUE);

CREATE POLICY "admin_commission_rule_versions_all" ON commission_rule_versions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_commission_rule_versions_read" ON commission_rule_versions
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "admin_commission_caps_all" ON commission_caps
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_commission_caps_read" ON commission_caps
  FOR SELECT TO authenticated
  USING (TRUE);

-- ─────────────────────────────────────────────────────────
-- COMMISSION TRANSACTIONS
-- CRITICAL: Members can ONLY see their own earned commissions
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_commission_tx_all" ON commission_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_commission_tx_own" ON commission_transactions
  FOR SELECT TO authenticated
  USING (beneficiary_member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- SETTLEMENTS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_settlements_all" ON settlements
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Members can read settlements (to see cycle status)
CREATE POLICY "member_settlements_read" ON settlements
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "admin_settlement_items_all" ON settlement_items
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Members can only see their own settlement items
CREATE POLICY "member_settlement_items_own" ON settlement_items
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- BDC
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_bdc_rules_all" ON bdc_rules
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_bdc_rules_read" ON bdc_rules
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "admin_bdc_eligibility_all" ON bdc_eligibility
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_bdc_eligibility_own" ON bdc_eligibility
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

CREATE POLICY "admin_bdc_tx_all" ON bdc_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_bdc_tx_own" ON bdc_transactions
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- RANKS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_ranks_all" ON ranks
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_ranks_read" ON ranks
  FOR SELECT TO authenticated
  USING (active = TRUE);

CREATE POLICY "admin_rank_rules_all" ON rank_rules
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_rank_rules_read" ON rank_rules
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "admin_rank_history_all" ON rank_history
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_rank_history_own" ON rank_history
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- EDUCATION
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_education_centers_all" ON education_centers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_education_centers_read" ON education_centers
  FOR SELECT TO authenticated
  USING (
    status = 'APPROVED'
    OR leader_member_id = auth.uid()
  );

CREATE POLICY "admin_ec_members_all" ON education_center_members
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_ec_members_read" ON education_center_members
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

CREATE POLICY "admin_education_commissions_all" ON education_commissions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_education_commissions_own" ON education_commissions
  FOR SELECT TO authenticated
  USING (leader_member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- WALLET & TRANSACTIONS
-- CRITICAL: Members can ONLY see their own wallet
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_wallets_all" ON wallets
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_wallets_own" ON wallets
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

CREATE POLICY "admin_wallet_tx_all" ON wallet_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_wallet_tx_own" ON wallet_transactions
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- PAYOUTS
-- CRITICAL: Members can ONLY see their own payouts
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_payouts_all" ON payouts
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_payouts_own" ON payouts
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

-- Members can create a payout request (INSERT only for AVAILABLE status)
CREATE POLICY "member_payouts_request" ON payouts
  FOR INSERT TO authenticated
  WITH CHECK (
    member_id = auth.uid()
    AND status = 'REQUESTED'
  );

CREATE POLICY "admin_withdrawal_all" ON withdrawal_requests
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_withdrawal_own" ON withdrawal_requests
  FOR ALL TO authenticated
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- ─────────────────────────────────────────────────────────
-- KYC — strongly protected
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_kyc_profiles_all" ON kyc_profiles
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_kyc_own" ON kyc_profiles
  FOR ALL TO authenticated
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "admin_kyc_docs_all" ON kyc_documents
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_kyc_docs_own" ON kyc_documents
  FOR ALL TO authenticated
  USING (
    kyc_profile_id IN (
      SELECT id FROM kyc_profiles WHERE member_id = auth.uid()
    )
  )
  WITH CHECK (
    kyc_profile_id IN (
      SELECT id FROM kyc_profiles WHERE member_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────
-- TASKS & NOTIFICATIONS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_tasks_all" ON tasks
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_tasks_read_active" ON tasks
  FOR SELECT TO authenticated
  USING (status = 'ACTIVE');

CREATE POLICY "admin_task_completions_all" ON task_completions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_task_completions_own" ON task_completions
  FOR ALL TO authenticated
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "admin_notifications_all" ON notifications
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_notifications_own" ON notifications
  FOR ALL TO authenticated
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "admin_notices_all" ON notices
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "member_notices_read_published" ON notices
  FOR SELECT TO authenticated
  USING (status = 'PUBLISHED');

-- ─────────────────────────────────────────────────────────
-- SYSTEM — Admin only
-- ─────────────────────────────────────────────────────────

CREATE POLICY "admin_system_settings_all" ON system_settings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_audit_logs_all" ON audit_logs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow insert for audit (server-side functions write audit logs)
CREATE POLICY "authenticated_audit_insert" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
