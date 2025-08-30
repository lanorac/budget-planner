-- Budget Planner Web App — Database Schema (PostgreSQL)
-- Version: 1.0
-- Generated: 2025-08-30
-- Notes:
-- * Uses UUID primary keys and strict foreign keys.
-- * Scenario-aware logic is exposed via SQL views (effective_*).
-- * Prefer UTC timestamps in the backend; store user TZ in profile if needed.

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Enum Types ----------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scenario_code') THEN
        CREATE TYPE scenario_code AS ENUM ('ALL','A','B','C');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'include_toggle') THEN
        CREATE TYPE include_toggle AS ENUM ('on','off');
    END IF;
END $$;

-- ---------- Core Tables ----------

CREATE TABLE IF NOT EXISTS app_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           CITEXT UNIQUE NOT NULL,
    display_name    TEXT,
    locale          TEXT DEFAULT 'fi-FI',
    currency_code   TEXT DEFAULT 'EUR',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional organizations/households for sharing (future-proof)
CREATE TABLE IF NOT EXISTS households (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    owner_user_id   UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many membership (for collaboration)
CREATE TABLE IF NOT EXISTS household_members (
    household_id    UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'editor', -- 'owner' | 'editor' | 'viewer'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (household_id, user_id)
);

-- A “profile” container for the planner data; keep it separate from auth users.
CREATE TABLE IF NOT EXISTS planners (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id    UUID REFERENCES households(id) ON DELETE SET NULL,
    owner_user_id   UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL DEFAULT 'My Planner',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings (per planner)
CREATE TABLE IF NOT EXISTS planner_settings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    starting_cash   NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (planner_id)
);

-- Sale months per scenario
CREATE TABLE IF NOT EXISTS scenario_settings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    scenario        scenario_code NOT NULL,
    sale_month      INT CHECK (sale_month BETWEEN 1 AND 12),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (planner_id, scenario)
);

-- Category dictionary
CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL CHECK (kind IN ('expense','bill')),
    name            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (planner_id, kind, name)
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    include_toggle  include_toggle NOT NULL DEFAULT 'off', -- 'on' = Selling in scenario
    scenario        scenario_code NOT NULL DEFAULT 'ALL',
    sale_value      NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assets_planner ON assets(planner_id);
CREATE INDEX IF NOT EXISTS idx_assets_scenario ON assets(planner_id, scenario);
CREATE INDEX IF NOT EXISTS idx_assets_include ON assets(planner_id, include_toggle);

-- Liabilities
CREATE TABLE IF NOT EXISTS liabilities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    include_toggle  include_toggle NOT NULL DEFAULT 'on', -- 'on' = keep/paying
    scenario        scenario_code NOT NULL DEFAULT 'ALL',
    monthly_cost    NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    principal       NUMERIC(14,2),
    linked_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- NEW: if asset sold->effective off
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_liab_planner ON liabilities(planner_id);
CREATE INDEX IF NOT EXISTS idx_liab_scenario ON liabilities(planner_id, scenario);
CREATE INDEX IF NOT EXISTS idx_liab_include ON liabilities(planner_id, include_toggle);
CREATE INDEX IF NOT EXISTS idx_liab_linked_asset ON liabilities(linked_asset_id);

-- Income
CREATE TABLE IF NOT EXISTS income (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    include_toggle  include_toggle NOT NULL DEFAULT 'on',
    scenario        scenario_code NOT NULL DEFAULT 'ALL',
    monthly_amount  NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_income_planner ON income(planner_id);
CREATE INDEX IF NOT EXISTS idx_income_scenario ON income(planner_id, scenario);
CREATE INDEX IF NOT EXISTS idx_income_include ON income(planner_id, include_toggle);

-- Expenses (discretionary)
CREATE TABLE IF NOT EXISTS expenses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    include_toggle  include_toggle NOT NULL DEFAULT 'on',
    scenario        scenario_code NOT NULL DEFAULT 'ALL',
    monthly_amount  NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    linked_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    linked_liab_id  UUID REFERENCES liabilities(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exp_planner ON expenses(planner_id);
CREATE INDEX IF NOT EXISTS idx_exp_scenario ON expenses(planner_id, scenario);
CREATE INDEX IF NOT EXISTS idx_exp_include ON expenses(planner_id, include_toggle);
CREATE INDEX IF NOT EXISTS idx_exp_cat ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_exp_link_asset ON expenses(linked_asset_id);
CREATE INDEX IF NOT EXISTS idx_exp_link_liab ON expenses(linked_liab_id);

-- Bills (recurring household)
CREATE TABLE IF NOT EXISTS bills (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planner_id      UUID NOT NULL REFERENCES planners(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    include_toggle  include_toggle NOT NULL DEFAULT 'on',
    scenario        scenario_code NOT NULL DEFAULT 'ALL',
    monthly_amount  NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    linked_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    linked_liab_id  UUID REFERENCES liabilities(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bills_planner ON bills(planner_id);
CREATE INDEX IF NOT EXISTS idx_bills_scenario ON bills(planner_id, scenario);
CREATE INDEX IF NOT EXISTS idx_bills_include ON bills(planner_id, include_toggle);
CREATE INDEX IF NOT EXISTS idx_bills_cat ON bills(category_id);
CREATE INDEX IF NOT EXISTS idx_bills_link_asset ON bills(linked_asset_id);
CREATE INDEX IF NOT EXISTS idx_bills_link_liab ON bills(linked_liab_id);

-- ---------- Effective Status Views ----------
-- Active if: (Scenario matches OR ALL) AND include_toggle + link rules are satisfied.
-- For Liabilities: override rule -> linked asset 'on' (sold) turns liability effective 'off'.

CREATE OR REPLACE VIEW v_assets_active AS
SELECT a.*
FROM assets a;

CREATE OR REPLACE VIEW v_liabilities_effective AS
SELECT
    l.*,
    CASE
        WHEN l.include_toggle = 'off' THEN FALSE
        WHEN l.linked_asset_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM assets ax
                 WHERE ax.id = l.linked_asset_id
                   AND ax.include_toggle = 'on'
             )
             THEN FALSE
        ELSE TRUE
    END AS effective_on
FROM liabilities l;

CREATE OR REPLACE VIEW v_expenses_effective AS
SELECT
    e.*,
    CASE
        WHEN e.include_toggle = 'off' THEN FALSE
        WHEN e.linked_asset_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM assets ax
                 WHERE ax.id = e.linked_asset_id
                   AND ax.include_toggle = 'on'
             ) THEN FALSE
        WHEN e.linked_liab_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM v_liabilities_effective lx
                 WHERE lx.id = e.linked_liab_id
                   AND lx.effective_on = FALSE
             ) THEN FALSE
        ELSE TRUE
    END AS effective_on
FROM expenses e;

CREATE OR REPLACE VIEW v_bills_effective AS
SELECT
    b.*,
    CASE
        WHEN b.include_toggle = 'off' THEN FALSE
        WHEN b.linked_asset_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM assets ax
                 WHERE ax.id = b.linked_asset_id
                   AND ax.include_toggle = 'on'
             ) THEN FALSE
        WHEN b.linked_liab_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM v_liabilities_effective lx
                 WHERE lx.id = b.linked_liab_id
                   AND lx.effective_on = FALSE
             ) THEN FALSE
        ELSE TRUE
    END AS effective_on
FROM bills b;

-- ---------- Scenario-Scoped Views ----------
-- Filters rows where scenario = 'ALL' or scenario = :active_scenario
-- (The backend should pass the active scenario and select from these via parameterized queries.)

-- Example parameterized pattern (to be used in the backend):
-- SELECT * FROM v_liabilities_effective WHERE planner_id = $1 AND (scenario = 'ALL' OR scenario = $2) AND effective_on = TRUE;

-- ---------- Rollup Views (Monthly KPIs) ----------
CREATE OR REPLACE VIEW v_kpi_monthly AS
SELECT
    p.id AS planner_id,
    -- Cash from asset sales (sum sale_value where include 'on' and scenario matches)
    COALESCE((SELECT SUM(a.sale_value)
              FROM assets a
              WHERE a.planner_id = p.id), 0) AS sale_cash_all_scenarios,
    NOW() AS generated_at
FROM planners p;

-- ---------- Seed Helpers (optional) ----------
-- Insert common Finnish categories (run once per planner_id):
-- INSERT INTO categories (planner_id, kind, name)
-- VALUES
--  (:planner_id, 'bill', 'Ylläpitokulut'),
--  (:planner_id, 'bill', 'Vakuutukset'),
--  (:planner_id, 'bill', 'Tilaukset'),
--  (:planner_id, 'bill', 'Ruoka'),
--  (:planner_id, 'expense', 'Harrastukset'),
--  (:planner_id, 'expense', 'Liikenne'),
--  (:planner_id, 'expense', 'Muut');

-- ---------- Triggers ----------
-- Maintain updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN
    ('app_users','households','household_members','planners','planner_settings','scenario_settings',
     'categories','assets','liabilities','income','expenses','bills')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

-- ---------- Indexing Strategy Notes ----------
-- * Foreign keys get btree indexes for join speed.
-- * Filtered queries commonly use (planner_id, scenario) and include_toggle/effective_on predicates.

-- ---------- End of Schema ----------
