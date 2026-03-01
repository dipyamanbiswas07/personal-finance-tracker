# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

There are no tests or linting scripts configured.

**Seeding data:** Paste `seed.js` into the browser console while the app is open, then refresh the page.

## Architecture

Vue 3 SPA with hash-mode routing (no backend, no server required). All state is persisted to `localStorage` — there is no API layer.

### State

**`src/stores/budgetStore.js`** — Pinia store (Composition API style). Owns all budget state and is the only place that reads/writes the budget localStorage keys:

- `budget_categories` — array of `{ id, name, amount, type, color, createdAt }`. Type is one of: `'Expense'`, `'Investment'`, `'EMI / Loan'`, `'Short term saving'`
- `budget_tracking` — nested map `{ year → month → categoryId → false | true | number }`. `false` = not done, `true` = done (full amount), `number > 0` = partial amount paid
- `budget_settings` — `{ currencySymbol, currentYear }`

Key getters: `expenses`, `investments`, `emis`, `savings` (filtered arrays by type), `totalExpense`, `totalInvestment`, `totalEMI`, `totalSaving`, `totalBudget`, `completionForMonth(year, month)`, `completionForYear(year)`.

Key actions: `setTracking(year, month, categoryId, value)` — value is `false`, `true`, or a positive number. `getTrackingValue(year, month, categoryId)` returns the raw stored value.

**`src/stores/creditCardStore.js`** — Separate Pinia store for credit cards. Keys: `cc_cards`, `cc_tracking`, `cc_settings`. Actions: `addCard`, `updateCard`, `deleteCard`, `togglePayment`. Both stores call `loadFromStorage()` on app mount in `App.vue`.

### Routing (`src/router/index.js`)

Hash-mode router. Three active routes:

| Path | View |
|---|---|
| `/` | `DashboardView` |
| `/categories` | `CategoriesView` |
| `/credit-cards` | `CreditCardsView` |

`/tracker` and `/insights` redirect to `/categories` and `/` respectively.

### Styling

Dark-only design. Custom Tailwind semantic color tokens defined in `tailwind.config.js`:

- `bg-base` / `bg-surface` / `bg-card` — layered dark backgrounds
- `accent` / `accent-hover` — indigo (#6366f1)
- `expense` — red (#ef4444), `investment` — green (#10b981)
- `emi` — amber (#f59e0b), `saving` — purple (#8b5cf6)
- `text-primary` / `text-muted`

Reusable CSS classes in `src/assets/main.css`: `.glass-card` (frosted card surface), `.nav-link` / `.nav-link.router-link-active`.

### Component conventions

- `src/components/ui/` — base primitives (`BaseButton`, `BaseInput`, `BaseSelect`, `BaseModal`, `BaseBadge`). Prefer these over raw HTML elements.
- Charts in `src/components/insights/` are hand-rolled SVG (no chart library). `DonutChart.vue` embeds a cumulative investments line chart in addition to the donut.
- Components consume the store directly via `useBudgetStore()` — no prop drilling for store state.
- `CategoriesView.vue` is a combined categories + tracker view — it owns the year selector, category form modal, and the 12-column MonthCell grid, all in one file.
- `DashboardView.vue` is a combined dashboard + insights view — it renders all summary and chart components together; there is no separate InsightsView in routing.
