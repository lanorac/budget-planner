\% Web-Based Budget Planner --- Product Requirements Document % Version
1.0 % 2025-08-30

# 1. Problem Statement

Users need a flexible tool to simulate their personal finances,
including assets, liabilities, income, recurring expenses, and bills.
Excel offers power, but lacks collaboration, cloud access, and a modern
interface. We aim to turn this into a **web app** with **scenario
simulation**, **linked item logic**, and **real-time analytics**, backed
by a secure database.

# 2. Goals & Objectives

-   Provide a beautiful, responsive web app for tracking and simulating
    personal budgets.
-   Implement smart logic: assets/liabilities/expenses/bills can be
    linked and automatically included/excluded.
-   Support multiple financial **scenarios (ALL / A / B / C)** for
    planning alternatives.
-   Offer **interactive dashboards**, charts, and **12‑month forecast
    projections**.
-   Allow data persistence using a secure backend database.
-   Future-proof the system to support user accounts and sharing.

# 3. Key Features

## 3.1 User Interface (UI)

-   Responsive design (mobile + desktop)
-   Clean dashboard with tabs: Planner, Bills, Scenario Compare,
    Forecast, Settings
-   In-line editable tables (Excel/Notion-like experience)
-   Dropdowns: Include?, Scenario, Category, Linked Items
-   Toggle for active scenario
-   Charts:
    -   Monthly summary bar chart
    -   Scenario comparison KPIs
    -   Forecast line chart

## 3.2 Core Modules

### Assets

-   Fields: Name, Include?, Scenario, Est. Sales Value, Notes

### Liabilities

-   Fields: Name, Include?, Scenario, Monthly Cost, Principal, Linked
    Asset, Notes
-   **Effective Include?** is auto-computed (Off if linked asset is
    sold)

### Income

-   Fields: Source, Include?, Scenario, Monthly Amount, Notes

### Expenses

-   Fields: Name, Include?, Scenario, Amount, Category, Linked Asset,
    Linked Liability, Notes
-   Auto-computed Effective Include?

### Bills

-   Predefined categories: Utilities, Insurance, Subscriptions,
    Groceries
-   Link to assets/liabilities for automatic exclusion

### Settings

-   Starting cash
-   Asset sale month per scenario

### Forecast

-   12-month projection: income - liabilities - expenses - bills
-   Auto-calculates closing balances per month
-   Line chart output

## 3.3 Business Logic Rules

-   If Asset.Include = On → linked Liabilities → Effective = Off
-   If Liability.Include = Off → linked Expenses/Bills → Effective = Off
-   Rows are active if Scenario = "All" or matches Active Scenario
-   Calculations always use **Effective Include?** flag

# 4. Technical Architecture

## 4.1 Frontend

-   Framework: React or Vue (preferred: React + Vite)
-   Styling: Tailwind CSS or Material UI
-   State: React Query / Zustand
-   Charts: Chart.js or ApexCharts

## 4.2 Backend

-   Framework: Python (FastAPI) or Node (Express)
-   API: REST or GraphQL
-   Business logic implemented server-side

## 4.3 Database

-   Relational DB: PostgreSQL or SQLite
-   Tables:
    -   users
    -   assets
    -   liabilities
    -   income
    -   expenses
    -   bills
    -   settings
    -   scenario_states

## 4.4 Hosting

-   Frontend: Vercel, Netlify, or Docker server
-   Backend: Railway, Render, or Docker VPS
-   Database: Supabase, Neon.tech, or local PostgreSQL

# 5. Stretch Features

-   User login and session storage
-   Scenario sharing (read-only or collaborative)
-   Export scenarios to PDF or Excel
-   AI assistant for financial insight
-   Localized UI (Finnish/English toggle)

# 6. Success Metrics

-   Functional MVP in \< 4 weeks
-   Scenario parity with Excel version
-   Fast scenario switching (\< 200ms)
-   Usability score \> 80%
-   Zero data loss in live testing

# 7. Open Questions

-   Start with single user or multi-user auth?
-   Should charts be exportable?
-   Finnish UI first?
-   Add monthly/yearly toggle?
