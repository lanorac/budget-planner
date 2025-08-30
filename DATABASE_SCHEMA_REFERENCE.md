# Database Schema Reference

## ⚠️ Critical Notes
- **Column names must match exactly** between SQLAlchemy models and SQL queries
- **Case sensitivity matters** - use exact column names as defined in models
- **Foreign key relationships** must use correct column names

## Table Schemas

### Assets Table (`assets`)
```sql
- id: UUID (primary key)
- planner_id: UUID (foreign key to planners.id)
- name: TEXT (not null)
- include_toggle: STRING ('on'/'off')
- scenario: STRING ('ALL'/'A'/'B'/'C')
- sale_value: NUMERIC(14,2)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Liabilities Table (`liabilities`)
```sql
- id: UUID (primary key)
- planner_id: UUID (foreign key to planners.id)
- name: TEXT (not null)
- include_toggle: STRING ('on'/'off')
- scenario: STRING ('ALL'/'A'/'B'/'C')
- monthly_cost: NUMERIC(14,2) ⚠️ NOT monthly_payment
- principal: NUMERIC(14,2) ⚠️ NOT remaining_balance
- linked_asset_id: UUID (foreign key to assets.id)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Expenses Table (`expenses`)
```sql
- id: UUID (primary key)
- planner_id: UUID (foreign key to planners.id)
- name: TEXT (not null)
- include_toggle: STRING ('on'/'off')
- scenario: STRING ('ALL'/'A'/'B'/'C')
- monthly_amount: NUMERIC(14,2)
- category_id: UUID (foreign key to categories.id)
- linked_asset_id: UUID (foreign key to assets.id)
- linked_liab_id: UUID (foreign key to liabilities.id) ⚠️ NOT linked_liability_id
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Bills Table (`bills`)
```sql
- id: UUID (primary key)
- planner_id: UUID (foreign key to planners.id)
- name: TEXT (not null)
- include_toggle: STRING ('on'/'off')
- scenario: STRING ('ALL'/'A'/'B'/'C')
- monthly_amount: NUMERIC(14,2)
- category_id: UUID (foreign key to categories.id)
- linked_asset_id: UUID (foreign key to assets.id)
- linked_liab_id: UUID (foreign key to liabilities.id) ⚠️ NOT linked_liability_id
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Income Table (`income`)
```sql
- id: UUID (primary key)
- planner_id: UUID (foreign key to planners.id)
- name: TEXT (not null)
- include_toggle: STRING ('on'/'off')
- scenario: STRING ('ALL'/'A'/'B'/'C')
- monthly_amount: NUMERIC(14,2)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Categories Table (`categories`)
```sql
- id: UUID (primary key)
- planner_id: UUID (foreign key to planners.id)
- name: TEXT (not null)
- kind: STRING ('expense'/'bill')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Planners Table (`planners`)
```sql
- id: UUID (primary key)
- name: TEXT (not null)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Common Mistakes to Avoid

### ❌ Wrong Column Names (These Don't Exist)
- `monthly_payment` → Use `monthly_cost` (liabilities)
- `remaining_balance` → Use `principal` (liabilities)
- `interest_rate` → This column doesn't exist
- `linked_liability_id` → Use `linked_liab_id` (expenses, bills)

### ✅ Correct Column Names
- `monthly_cost` (liabilities)
- `principal` (liabilities)
- `linked_liab_id` (expenses, bills)
- `sale_value` (assets)

## SQL Query Examples

### Correct Liabilities Query
```sql
SELECT 
    l.id,
    l.name,
    l.monthly_cost,  -- ✅ Correct
    l.principal,     -- ✅ Correct
    l.linked_asset_id
FROM liabilities l
WHERE l.planner_id = :planner_id
```

### Correct Expenses Query
```sql
SELECT 
    e.id,
    e.name,
    e.monthly_amount,
    e.linked_liab_id  -- ✅ Correct
FROM expenses e
LEFT JOIN liabilities l ON e.linked_liab_id = l.id  -- ✅ Correct
WHERE e.planner_id = :planner_id
```

### Correct Bills Query
```sql
SELECT 
    b.id,
    b.name,
    b.monthly_amount,
    b.linked_liab_id  -- ✅ Correct
FROM bills b
LEFT JOIN liabilities l ON b.linked_liab_id = l.id  -- ✅ Correct
WHERE b.planner_id = :planner_id
```

## Effective Status Logic

### Liabilities Effective Status
```sql
CASE 
    WHEN l.include_toggle = 'off' THEN 'off'
    WHEN l.linked_asset_id IS NULL THEN l.include_toggle
    WHEN a.include_toggle = 'off' THEN 'off'
    ELSE l.include_toggle
END as effective_status
```

### Expenses/Bills Effective Status
```sql
CASE 
    WHEN e.include_toggle = 'off' THEN 'off'
    WHEN e.linked_asset_id IS NOT NULL AND a.include_toggle = 'off' THEN 'off'
    WHEN e.linked_liab_id IS NOT NULL AND l.include_toggle = 'off' THEN 'off'
    ELSE e.include_toggle
END as effective_status
```

## Data Types
- **UUID**: Use `UUID(as_uuid=True)` in SQLAlchemy
- **Numeric**: Use `Numeric(14,2)` for currency amounts
- **String**: Use `String` for enum-like fields
- **Text**: Use `Text` for longer string fields
- **Timestamps**: Use `TimestampMixin` for created_at/updated_at

## Foreign Key Relationships
- All tables have `planner_id` linking to `planners.id`
- Assets can be linked to liabilities via `linked_asset_id`
- Expenses/Bills can be linked to assets via `linked_asset_id`
- Expenses/Bills can be linked to liabilities via `linked_liab_id`
- Expenses/Bills can be categorized via `category_id`
