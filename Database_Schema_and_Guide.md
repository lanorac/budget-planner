# Budget Planner — Database Schema & Development Guide (PostgreSQL)

**Version:** 1.0  
**Generated:** 2025-08-30

This document describes the relational schema, conventions, and backend access patterns for the Budget Planner web app. It is designed for **PostgreSQL** with **UUID PKs**, **enum types** for toggles/scenarios, and **SQL views** for effective status calculations.

---

## 1. Design Principles

- **Single source of truth:** Raw tables store user input. **Views** expose computed logic (e.g., whether a liability is effectively “on”).  
- **Deterministic business rules:** Centralized in the backend + views; the frontend is a pure client of the API.  
- **Scenario-aware:** All rows have a `scenario` field (`ALL | A | B | C`); queries include `(scenario = 'ALL' OR scenario = :active)`.  
- **Link logic:**  
  - Selling an **asset** (`include_toggle = 'on'`) disables any **linked liabilities** (override), and any **linked expenses/bills**.  
  - Removing a **liability** (effective off) disables any expenses/bills linked to it.  
- **Safety & performance:** UUIDs, indexes on FKs and filters, server-side pagination.

---

## 2. Getting Started

1. **Create DB & Run Schema**
   ```bash
   createdb budget_planner
   psql -d budget_planner -f schema.sql
   ```

2. **(Optional) Create a planner and seed categories**
   ```sql
   -- 1) Create user & planner
   INSERT INTO app_users (email, display_name) VALUES ('you@example.com','You') RETURNING id;
   -- Use the returned id as :user_id
   INSERT INTO planners (owner_user_id, name) VALUES (:user_id, 'My Planner') RETURNING id;
   -- Use the returned id as :planner_id
   INSERT INTO planner_settings (planner_id, starting_cash) VALUES (:planner_id, 0);
   INSERT INTO scenario_settings (planner_id, scenario, sale_month) VALUES
     (:planner_id,'ALL',1),(:planner_id,'A',3),(:planner_id,'B',6),(:planner_id,'C',9);

   -- 2) Seed categories
   INSERT INTO categories (planner_id, kind, name) VALUES
     (:planner_id, 'bill', 'Ylläpitokulut'),
     (:planner_id, 'bill', 'Vakuutukset'),
     (:planner_id, 'bill', 'Tilaukset'),
     (:planner_id, 'bill', 'Ruoka'),
     (:planner_id, 'expense', 'Harrastukset'),
     (:planner_id, 'expense', 'Liikenne'),
     (:planner_id, 'expense', 'Muut');
   ```

3. **Insert sample rows**
   ```sql
   -- Asset: House (selling in scenario A)
   INSERT INTO assets (planner_id, name, include_toggle, scenario, sale_value)
   VALUES (:planner_id, 'House', 'on', 'A', 200000);

   -- Liability: Mortgage linked to House (auto-off if House sold)
   INSERT INTO liabilities (planner_id, name, include_toggle, scenario, monthly_cost, linked_asset_id)
   VALUES (:planner_id, 'Mortgage', 'on', 'ALL', 900, (SELECT id FROM assets WHERE name='House' AND planner_id=:planner_id LIMIT 1));

   -- Income, Expenses, Bills
   INSERT INTO income (planner_id, name, monthly_amount) VALUES (:planner_id, 'Salary', 4000);
   INSERT INTO bills (planner_id, name, monthly_amount, category_id)
   VALUES (:planner_id, 'Electricity', 120, (SELECT id FROM categories WHERE kind='bill' AND name='Ylläpitokulut' AND planner_id=:planner_id));
   ```

---

## 3. Query Patterns (API Layer)

### 3.1 Scenario Filter Helper
```sql
-- :planner_id :: UUID, :scenario :: scenario_code ('ALL','A','B','C')
-- Note: rows with scenario = 'ALL' always count.
WHERE planner_id = :planner_id
  AND (scenario = 'ALL' OR scenario = :scenario)
```

### 3.2 Effective Status (Server-side)
- **Liabilities (override):**
  ```sql
  SELECT * FROM v_liabilities_effective
   WHERE planner_id = :planner_id
     AND (scenario = 'ALL' OR scenario = :scenario)
     AND effective_on = TRUE;
  ```

- **Expenses/Bills (linked logic):**
  ```sql
  SELECT * FROM v_expenses_effective
   WHERE planner_id = :planner_id
     AND (scenario = 'ALL' OR scenario = :scenario)
     AND effective_on = TRUE;

  SELECT * FROM v_bills_effective
   WHERE planner_id = :planner_id
     AND (scenario = 'ALL' OR scenario = :scenario)
     AND effective_on = TRUE;
  ```

### 3.3 KPIs
```sql
-- Cash from selling selected assets in scenario
SELECT COALESCE(SUM(a.sale_value),0) AS cash_from_sales
FROM assets a
WHERE a.planner_id = :planner_id
  AND (a.scenario = 'ALL' OR a.scenario = :scenario)
  AND a.include_toggle = 'on';

-- Monthly income
SELECT COALESCE(SUM(i.monthly_amount),0) AS monthly_income
FROM income i
WHERE i.planner_id = :planner_id
  AND (i.scenario = 'ALL' OR i.scenario = :scenario)
  AND i.include_toggle = 'on';

-- Monthly liabilities
SELECT COALESCE(SUM(l.monthly_cost),0) AS monthly_liabilities
FROM v_liabilities_effective l
WHERE l.planner_id = :planner_id
  AND (l.scenario = 'ALL' OR l.scenario = :scenario)
  AND l.effective_on = TRUE;

-- Monthly expenses
SELECT COALESCE(SUM(e.monthly_amount),0) AS monthly_expenses
FROM v_expenses_effective e
WHERE e.planner_id = :planner_id
  AND (e.scenario = 'ALL' OR e.scenario = :scenario)
  AND e.effective_on = TRUE;

-- Monthly bills
SELECT COALESCE(SUM(b.monthly_amount),0) AS monthly_bills
FROM v_bills_effective b
WHERE b.planner_id = :planner_id
  AND (b.scenario = 'ALL' OR b.scenario = :scenario)
  AND b.effective_on = TRUE;
```

---

## 4. Backend Best Practices

- **Service layer** enforces business rules; **do not** compute “effective” logic on the client.  
- **Transactions** for multi-row updates (e.g., batch toggles).  
- **Pagination**: default `limit 50 offset 0`; expose cursors later.  
- **Validation**: enforce numeric ranges, reject negative amounts unless intended.  
- **Idempotency**: upsert categories by `(planner_id, kind, name)` to avoid duplicates.  
- **Migrations**: use Alembic (Python) or Prisma/Drizzle (Node). Maintain a `schema_version` table.  
- **Testing**: unit tests for link logic, scenario filtering, and KPI queries. Provide fixture seeds.

---

## 5. Indices & Performance

- Index common predicates: `(planner_id, scenario)`, include toggles, FKs.  
- Consider **partial indexes** if datasets grow (e.g., `WHERE include_toggle='on'`).  
- Use **EXPLAIN ANALYZE** on KPI queries; add covering indexes as needed.

---

## 6. Security

- Use **row-level access** by `planner_id` (tenant isolation) in the service layer.  
- Validate ownership: `user_id` must own or be member of `household_id` to access a planner.  
- Store **timestamps in UTC**.  
- Avoid dynamic SQL where possible; always **parameterize**.

---

## 7. Migration Strategy (Alembic Example)

1. Initialize migrations:
   ```bash
   alembic init db
   ```
2. Point `sqlalchemy.url` to your DB in `alembic.ini`.
3. Create an autogenerated migration from SQLAlchemy models or maintain raw SQL files.
4. Use **semantic versioning** for releases; tag migration IDs accordingly.
5. Run migrations per environment (dev/stage/prod) with backups.

---

## 8. Validation Test Cases

- Selling an asset turns linked liabilities **off** (effective).  
- Turning a liability **off** turns linked expenses/bills **off** (effective).  
- Scenario switch shows correct items (rows with `ALL` + current scenario).  
- KPI sums reconcile with itemized queries.  
- Forecast uses scenario-specific cash sale month.

---

## 9. File Map

- `schema.sql` — DDL for PostgreSQL (run once per environment)  
- `backend/` — FastAPI/Express service implementing queries above  
- `migrations/` — Alembic/Prisma migration directory  
- `seeds/` — category seeds and sample data

---

## 10. Next Steps

- Stand up a **FastAPI** scaffold with SQLAlchemy models mapping 1:1 to this schema.  
- Implement endpoints:
  - `GET/POST /assets | /liabilities | /income | /expenses | /bills`
  - `GET /kpis?plannerId&scenario`  
  - `GET /forecast?plannerId`  
- Add auth (JWT / session) and RLS in the service layer.

