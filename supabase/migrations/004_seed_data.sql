-- ============================================================
-- JAMPLE LIFE — SEED DATA
-- Migration: 004_seed_data.sql
-- ============================================================
-- Run AFTER all schema and RLS migrations.
-- This contains initial configuration data.
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- RANKS (from supplied material)
-- ─────────────────────────────────────────────────────────

INSERT INTO ranks (rank_code, rank_name, display_order, bonus_percentage, active, business_rule_note) VALUES
  ('MEMBER',             'Member',             1,  0.0,  TRUE, NULL),
  ('JAMPLE_DIRECTOR',    'Jample Director',    2,  10.0, TRUE, 'Qualification thresholds require business rule confirmation before auto-promotion is enabled.'),
  ('MARKETING_DIRECTOR', 'Marketing Director', 3,  5.0,  TRUE, 'Qualification thresholds require business rule confirmation before auto-promotion is enabled.'),
  ('BUSINESS_DIRECTOR',  'Business Director',  4,  2.0,  TRUE, 'Qualification thresholds require business rule confirmation before auto-promotion is enabled.'),
  ('GOLD_DIRECTOR',      'Gold Director',      5,  1.5,  TRUE, 'Qualification thresholds require business rule confirmation before auto-promotion is enabled.'),
  ('PLATINUM_DIRECTOR',  'Platinum Director',  6,  1.0,  TRUE, 'Qualification thresholds require business rule confirmation before auto-promotion is enabled.'),
  ('DIAMOND_DIRECTOR',   'Diamond Director',   7,  0.5,  TRUE, 'Qualification thresholds require business rule confirmation before auto-promotion is enabled.')
ON CONFLICT (rank_code) DO NOTHING;

-- Rank rules (inactive until configured by admin)
INSERT INTO rank_rules (rank_id, qualification_rules, active)
SELECT r.id, '{"note": "Business Rule Required — configure qualification thresholds before activating.", "min_team_size": null, "min_personal_pv": null, "min_team_pv": null}', FALSE
FROM ranks r
WHERE r.rank_code != 'MEMBER'
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- 13-LEVEL COMMISSION RULES (from supplied material)
-- ─────────────────────────────────────────────────────────

INSERT INTO commission_rules (rule_type, level, rate, active) VALUES
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
ON CONFLICT (rule_type, level) DO NOTHING;

-- BDC rule (inactive until configured)
INSERT INTO commission_rules (rule_type, level, rate, active) VALUES
  ('BDC', NULL, 5.0, FALSE)
ON CONFLICT (rule_type, level) DO NOTHING;

-- Director bonus — same percentage as rank bonus (from supplied material)
INSERT INTO commission_rules (rule_type, level, rate, active) VALUES
  ('DIRECTOR_BONUS', NULL, 20.0, FALSE)  -- Total 20% split across director ranks
ON CONFLICT DO NOTHING;

-- Education commission (inactive until configured)
INSERT INTO commission_rules (rule_type, level, rate, active) VALUES
  ('EDUCATION_COMMISSION', NULL, 6.0, FALSE)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- COMMISSION CAP (inactive — basis not confirmed)
-- ─────────────────────────────────────────────────────────

INSERT INTO commission_caps (
  cap_type, percentage, period, applicable_to, active, business_rule_note
) VALUES (
  'OVERALL', 35.0, 'WEEKLY', 'ALL', FALSE,
  'Total commission cap of 35% mentioned in source material. Calculation basis (per-member, per-settlement, per-type) requires business rule confirmation before activation.'
);

-- ─────────────────────────────────────────────────────────
-- BDC RULES (inactive — thresholds not confirmed)
-- ─────────────────────────────────────────────────────────

INSERT INTO bdc_rules (
  minimum_levels, qualifying_turnover, percentage, duration_months,
  direct_sponsor_requirement, pv_matching_requirement,
  marketing_director_requirement, active, business_rule_note
) VALUES (
  12, NULL, 5.0, 20,
  NULL, FALSE, TRUE, FALSE,
  'BDC: 12-level business, 5% of turnover, 20 months. Exact qualification thresholds (turnover amount, direct sponsor count, PV matching requirements, Marketing Director timing) require business rule confirmation.'
);

-- ─────────────────────────────────────────────────────────
-- PLANS (from supplied material)
-- ─────────────────────────────────────────────────────────

INSERT INTO plans (plan_code, plan_name, enrollment_amount, principal_percentage, profit_percentage, duration_months, description, status, active, business_rule_note) VALUES
  (
    'PLAN_1', 'Jample Plan 1',
    2000.00, 2.5, 2.5, 40,
    'Enrollment: ₹2,000 | Monthly return: ₹100/month (₹50 principal + ₹50 profit) | Duration: 40 months | Total return: ₹4,000',
    'INACTIVE', FALSE,
    'Plan returns require legal review before activation. Do not describe as guaranteed returns.'
  ),
  (
    'PLAN_2', 'Jample Plan 2',
    6000.00, 2.5, 2.5, 40,
    'Enrollment: ₹6,000 | Monthly return: ₹300/month (₹150 principal + ₹150 profit) | Duration: 40 months | Total return: ₹12,000',
    'INACTIVE', FALSE,
    'Plan returns require legal review before activation. Do not describe as guaranteed returns.'
  ),
  (
    'PLAN_3', 'Jample Plan 3',
    10000.00, 2.5, 2.5, 40,
    'Enrollment: ₹10,000 | Monthly return: ₹500/month (₹250 principal + ₹250 profit) | Duration: 40 months | Total return: ₹20,000',
    'INACTIVE', FALSE,
    'Plan returns require legal review before activation. Do not describe as guaranteed returns.'
  )
ON CONFLICT (plan_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- PRODUCT CATEGORIES
-- ─────────────────────────────────────────────────────────

INSERT INTO product_categories (name, slug, description, display_order, status) VALUES
  ('Healthcare',    'healthcare',    'Health and wellness products for a better life',    1, 'ACTIVE'),
  ('Wellness',      'wellness',      'Natural wellness and nutrition supplements',        2, 'ACTIVE'),
  ('Personal Care', 'personal-care', 'Personal hygiene and care products',                3, 'ACTIVE'),
  ('Nutrition',     'nutrition',     'Nutritional supplements and health boosters',       4, 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- PRODUCTS (from supplied Jample Life catalog)
-- PV set to 0 — Admin must configure based on business rules
-- ─────────────────────────────────────────────────────────

INSERT INTO products (
  sku, name, slug,
  short_description, full_description,
  category_id,
  mrp, dp, selling_price,
  pv, business_volume,
  stock_quantity,
  status, featured
) VALUES
  (
    'JL-NSC-001',
    'Noni Seabuckthorn Capsules',
    'noni-seabuckthorn-capsules',
    'Premium Noni and Seabuckthorn blend capsules for immunity and wellness',
    'Jample Life Noni Seabuckthorn Capsules are a powerful blend of Noni fruit extract and Seabuckthorn, two of nature''s most potent superfoods. Rich in antioxidants, vitamins, and essential nutrients that support immune health, energy levels, and overall wellness.',
    (SELECT id FROM product_categories WHERE slug = 'healthcare'),
    2500.00, 1250.00, 1250.00,
    0, 0,
    100,
    'ACTIVE', TRUE
  ),
  (
    'JL-NO-002',
    'Nabhi Oil',
    'nabhi-oil',
    'Traditional Ayurvedic navel oil for holistic health and wellbeing',
    'Jample Life Nabhi Oil is crafted using traditional Ayurvedic principles. Application on the navel (nabhi) is believed to support digestion, skin health, and overall wellbeing. Made with a blend of natural oils and herbs.',
    (SELECT id FROM product_categories WHERE slug = 'wellness'),
    1250.00, 750.00, 750.00,
    0, 0,
    150,
    'ACTIVE', TRUE
  ),
  (
    'JL-NKJ-003',
    'Neem Karela Jamun Capsules',
    'neem-karela-jamun-capsules',
    'Ayurvedic blood sugar support with Neem, Bitter Gourd, and Jamun',
    'Jample Life Neem Karela Jamun Capsules combine the power of Neem, Karela (Bitter Gourd), and Jamun (Indian Blackberry) — three herbs traditionally used in Ayurveda for supporting healthy blood sugar levels and metabolic health.',
    (SELECT id FROM product_categories WHERE slug = 'healthcare'),
    2500.00, 1250.00, 1250.00,
    0, 0,
    100,
    'ACTIVE', FALSE
  ),
  (
    'JL-SP-004',
    'Sanitary Pads',
    'sanitary-pads',
    'Premium organic sanitary pads for women''s health and comfort',
    'Jample Life Sanitary Pads are crafted with women''s health in mind, using premium materials for maximum comfort and protection. Designed to be gentle, safe, and effective for everyday use.',
    (SELECT id FROM product_categories WHERE slug = 'personal-care'),
    350.00, 150.00, 150.00,
    0, 0,
    500,
    'ACTIVE', FALSE
  )
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- SYSTEM SETTINGS (default configuration)
-- ─────────────────────────────────────────────────────────

INSERT INTO system_settings (key, value, description) VALUES
  ('company_name',           '"Jample Life"',                           'Company name displayed throughout the application'),
  ('company_tagline',        '"Rich World Healthy World"',              'Company tagline'),
  ('support_email',          '"support@jamplelife.com"',                'Support email address'),
  ('support_phone',          '""',                                       'Support phone number'),
  ('timezone',               '"Asia/Kolkata"',                          'Default application timezone (IST)'),
  ('settlement_cutoff_day',  '"MONDAY"',                                'Day of week when weekly business cycle closes'),
  ('settlement_cutoff_time', '"23:59:59"',                              'Time on cutoff day when cycle closes (IST)'),
  ('payout_available_day',   '"TUESDAY"',                               'Day when payout becomes available after settlement'),
  ('payout_available_time',  '"09:00:00"',                              'Time on payout day when payout becomes available (IST)'),
  ('minimum_payout',         '100',                                      'Minimum payout request amount (INR)'),
  ('maximum_payout',         '100000',                                   'Maximum payout request amount per request (INR)'),
  ('kyc_required_for_payout','true',                                     'Whether KYC verification is required before payout'),
  ('commission_chain',       '"SPONSOR"',                                'Commission chain type: SPONSOR or PLACEMENT'),
  ('registration_requires_referral', 'true',                            'Whether referral code is required for registration'),
  ('default_currency',       '"INR"',                                    'Default currency'),
  ('currency_symbol',        '"₹"',                                     'Currency symbol'),
  ('app_version',            '"1.0.0"',                                  'Application version'),
  ('maintenance_mode',       'false',                                    'When true, app shows maintenance page'),
  ('demo_mode',              'true',                                     'When true, demo data indicators are shown')
ON CONFLICT (key) DO NOTHING;

-- Initialize counters for current year
INSERT INTO order_number_counter (id, year, current_value)
VALUES (1, EXTRACT(YEAR FROM NOW())::INT, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO settlement_counter (id, year, week_number)
VALUES (1, EXTRACT(YEAR FROM NOW())::INT, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payout_counter (id, year, current_value)
VALUES (1, EXTRACT(YEAR FROM NOW())::INT, 0)
ON CONFLICT (id) DO NOTHING;
