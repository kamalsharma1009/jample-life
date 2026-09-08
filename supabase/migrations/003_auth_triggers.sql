-- ============================================================
-- JAMPLE LIFE — AUTH TRIGGERS & DATABASE FUNCTIONS
-- Migration: 003_auth_triggers.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a profile record when a new auth user is created
  -- member_id and referral_code are set by the registration Edge Function
  INSERT INTO profiles (
    id,
    full_name,
    email,
    role,
    status,
    kyc_status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Member'),
    NEW.email,
    'MEMBER',
    'PENDING',
    'NOT_SUBMITTED'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create a wallet for this member
  INSERT INTO wallets (member_id)
  VALUES (NEW.id)
  ON CONFLICT (member_id) DO NOTHING;

  -- Create a KYC profile
  INSERT INTO kyc_profiles (member_id)
  VALUES (NEW.id)
  ON CONFLICT (member_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────
-- ATOMIC MEMBER ID GENERATION
-- Returns the next member ID like JL100001
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS VARCHAR AS $$
DECLARE
  next_val BIGINT;
BEGIN
  UPDATE member_id_counter
  SET current_value = current_value + 1
  WHERE id = 1
  RETURNING current_value INTO next_val;

  RETURN 'JL' || next_val::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- ATOMIC ORDER NUMBER GENERATION
-- Returns ORD-2026-000001
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year INT;
  next_val BIGINT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INT;

  -- Initialize or update for current year
  INSERT INTO order_number_counter (id, year, current_value)
  VALUES (1, current_year, 1)
  ON CONFLICT (id) DO UPDATE
  SET
    current_value = CASE
      WHEN order_number_counter.year = current_year
        THEN order_number_counter.current_value + 1
      ELSE 1
    END,
    year = current_year
  RETURNING current_value INTO next_val;

  RETURN 'ORD-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- GENERATE SETTLEMENT NUMBER
-- Returns SET-2026-W01
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_settlement_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year INT;
  next_week INT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INT;

  INSERT INTO settlement_counter (id, year, week_number)
  VALUES (1, current_year, 1)
  ON CONFLICT (id) DO UPDATE
  SET
    week_number = CASE
      WHEN settlement_counter.year = current_year
        THEN settlement_counter.week_number + 1
      ELSE 1
    END,
    year = current_year
  RETURNING week_number INTO next_week;

  RETURN 'SET-' || current_year || '-W' || LPAD(next_week::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- GENERATE PAYOUT NUMBER
-- Returns PAY-2026-000001
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_payout_number()
RETURNS VARCHAR AS $$
DECLARE
  current_year INT;
  next_val BIGINT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INT;

  INSERT INTO payout_counter (id, year, current_value)
  VALUES (1, current_year, 1)
  ON CONFLICT (id) DO UPDATE
  SET
    current_value = CASE
      WHEN payout_counter.year = current_year
        THEN payout_counter.current_value + 1
      ELSE 1
    END,
    year = current_year
  RETURNING current_value INTO next_val;

  RETURN 'PAY-' || current_year || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- GET SPONSOR CHAIN (for commission calculation)
-- Returns up to N levels of sponsors
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_sponsor_chain(
  p_member_id UUID,
  p_max_levels INT DEFAULT 13
)
RETURNS TABLE (
  member_id UUID,
  full_name VARCHAR,
  member_code VARCHAR,
  status VARCHAR,
  level_number INT
) AS $$
DECLARE
  current_id UUID;
  current_level INT;
  next_sponsor_id UUID;
BEGIN
  current_id := p_member_id;
  current_level := 0;

  LOOP
    -- Get sponsor of current member
    SELECT g.sponsor_id
    INTO next_sponsor_id
    FROM genealogy g
    WHERE g.member_id = current_id;

    EXIT WHEN next_sponsor_id IS NULL OR current_level >= p_max_levels;

    current_level := current_level + 1;

    -- Return this sponsor's info
    RETURN QUERY
    SELECT
      p.id,
      p.full_name,
      p.member_id,
      p.status,
      current_level
    FROM profiles p
    WHERE p.id = next_sponsor_id;

    current_id := next_sponsor_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────
-- GET TEAM STATS for a member
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_team_stats(p_member_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'direct_count', (
      SELECT COUNT(*) FROM genealogy WHERE sponsor_id = p_member_id
    ),
    'total_team', (
      SELECT COUNT(*) - 1  -- exclude self
      FROM genealogy_paths
      WHERE ancestor_id = p_member_id
    ),
    'active_team', (
      SELECT COUNT(*) - 1
      FROM genealogy_paths gp
      JOIN profiles p ON p.id = gp.descendant_id
      WHERE gp.ancestor_id = p_member_id
      AND p.status = 'ACTIVE'
    ),
    'total_pv', (
      SELECT COALESCE(SUM(pv), 0)
      FROM business_volume_transactions bv
      JOIN genealogy_paths gp ON gp.descendant_id = bv.member_id
      WHERE gp.ancestor_id = p_member_id
      AND bv.status = 'ACTIVE'
    ),
    'personal_pv', (
      SELECT COALESCE(SUM(pv), 0)
      FROM business_volume_transactions
      WHERE member_id = p_member_id
      AND status = 'ACTIVE'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────
-- REBUILD GENEALOGY PATHS (closure table)
-- Called when a member is placed in the tree
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION insert_genealogy_paths(p_member_id UUID, p_parent_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert self-reference (depth 0)
  INSERT INTO genealogy_paths (ancestor_id, descendant_id, depth)
  VALUES (p_member_id, p_member_id, 0)
  ON CONFLICT DO NOTHING;

  -- Insert all ancestor paths from parent
  INSERT INTO genealogy_paths (ancestor_id, descendant_id, depth)
  SELECT
    gp.ancestor_id,
    p_member_id,
    gp.depth + 1
  FROM genealogy_paths gp
  WHERE gp.descendant_id = p_parent_id
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- AUDIT LOG HELPER
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_audit_log(
  p_actor_id UUID,
  p_actor_role VARCHAR,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_id, actor_role, action, entity_type, entity_id,
    old_value, new_value, reason
  ) VALUES (
    p_actor_id, p_actor_role, p_action, p_entity_type, p_entity_id,
    p_old_value, p_new_value, p_reason
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- REFERRAL CODE GENERATOR (unique 8-char alphanumeric)
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_referral_code(p_member_id_text VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR;
  attempts INT := 0;
BEGIN
  -- Use member ID as base, making it unique
  new_code := UPPER(p_member_id_text);

  -- Verify it's unique (member_id IS the referral code for Jample Life)
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code) LOOP
    attempts := attempts + 1;
    new_code := UPPER(p_member_id_text) || attempts::TEXT;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
