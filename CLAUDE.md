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

## Environment variables

Create a `.env` file (gitignored) with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The same vars must be set in the Vercel dashboard for production.

## Architecture

Vue 3 SPA with hash-mode routing. **Backend: Supabase** (PostgreSQL + Auth + RLS). Hosted on **Vercel**.

### Auth (`src/stores/authStore.js`)

Pinia store wrapping Supabase Auth. Exposes: `user`, `loading`, `init()`, `signIn(email, password)`, `signUp(email, password)`, `signOut()`, `signInWithProvider(provider)`, `handleImplicitCallback(accessToken, refreshToken)`.

`init()` is idempotent (memoised via `_initPromise`) — safe to call from both `App.vue` and the router guard.

### State

**`src/stores/budgetStore.js`** — Pinia store (Composition API style). All actions are async and write to Supabase.

Supabase tables:
- `categories` — `{ id TEXT PK, user_id, name, amount, type, color, created_at }`
- `tracking` — `{ id bigserial, user_id, category_id, year, month, value JSONB }` — UNIQUE(user_id, category_id, year, month)
- `settings` — `{ user_id PK, currency_symbol, current_year }`

In-memory shape mirrors the old localStorage schema for compatibility:
- `categories` ref — array of `{ id, name, amount, type, color, createdAt }`. Type is one of: `'Expense'`, `'Investment'`, `'EMI / Loan'`, `'Short term saving'`
- `tracking` ref — nested map `{ year → month → categoryId → false | true | number }`. `false` = not done, `true` = done (full amount), `number > 0` = partial amount
- `settings` ref — `{ currencySymbol, currentYear }`

Key getters: `expenses`, `investments`, `emis`, `savings` (filtered arrays by type), `totalExpense`, `totalInvestment`, `totalEMI`, `totalSaving`, `totalBudget`, `categoryMap`, `completionForMonth(year, month)`, `completionForYear(year)`, `isTracked(year, month, categoryId)`, `getTrackingValue(year, month, categoryId)`.

Key actions: `loadData()`, `addCategory(payload)`, `updateCategory(id, payload)`, `deleteCategory(id)`, `setTracking(year, month, categoryId, value)` (optimistic update, reverts on error), `toggleTracking(year, month, categoryId)`, `setYear(year)`, `importFromJSON(data)`, `clearData()` (in-memory reset, called on logout), `clearAllData()` (deletes from Supabase + resets).

**`src/stores/creditCardStore.js`** — Separate Pinia store for credit cards.

Supabase tables:
- `cc_cards` — `{ id TEXT PK, user_id, name, color }`
- `cc_tracking` — `{ id bigserial, user_id, card_id, year, month, paid BOOLEAN }` — UNIQUE(user_id, card_id, year, month)

Key actions: `loadData()`, `addCard(name)`, `updateCard(id, name)`, `deleteCard(id)`, `togglePayment(year, month, cardId)` (optimistic update), `setYear(year)`, `importFromJSON(data)`, `clearData()`, `clearAllData()`.

Both stores expose `loadFromStorage` as a legacy alias for `loadData`.

All tables have RLS enabled — every query is automatically scoped to `auth.uid() = user_id`.

### Routing (`src/router/index.js`)

Hash-mode router with a `beforeEach` auth guard.

| Path | View |
|---|---|
| `/login` | `LoginView` (public) |
| `/` | `DashboardView` |
| `/categories` | `CategoriesView` |
| `/credit-cards` | `CreditCardsView` |

`/tracker` and `/insights` redirect to `/categories` and `/` respectively.

The guard calls `authStore.init()` on every navigation and redirects unauthenticated users to `/login`. It also handles the Supabase implicit OAuth flow: if `access_token` is present in the URL hash it calls `authStore.handleImplicitCallback(...)` and clears the fragment.

### `App.vue`

- Shows a full-screen spinner while `authStore.loading || store.loading || ccStore.loading`.
- `onMounted`: calls `authStore.init()`, then `Promise.all([store.loadData(), ccStore.loadData()])` if authed.
- Watches `authStore.user`: loads data on login, calls `clearData()` on both stores on logout.
- `AppHeader` is only rendered when the user is authenticated.

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
