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

### State (`src/stores/budgetStore.js`)

Single Pinia store using the Composition API style (`defineStore` with a setup function). It owns all state and is the only place that reads/writes `localStorage`. The three storage keys are:

- `budget_categories` — array of category objects (`id`, `name`, `amount`, `type`, `color`, `createdAt`)
- `budget_tracking` — nested map `{ year → month → categoryId → boolean }`
- `budget_settings` — `{ currencySymbol, currentYear }`

`loadFromStorage()` is called once on app mount (`App.vue`). All mutations go through store actions which call the corresponding `persist*()` function immediately after updating reactive state.

### Routing (`src/router/index.js`)

Hash-mode router. Four routes map directly to four view files:

| Path | View |
|---|---|
| `/` | `DashboardView` |
| `/categories` | `CategoriesView` |
| `/tracker` | `TrackerView` |
| `/insights` | `InsightsView` |

### Styling

Dark-only design. Custom Tailwind semantic color tokens defined in `tailwind.config.js`:

- `bg-base` / `bg-surface` / `bg-card` — layered dark backgrounds
- `accent` / `accent-hover` — indigo (#6366f1)
- `expense` — red (#ef4444), `investment` — green (#10b981)
- `text-primary` / `text-muted`

Reusable CSS classes in `src/assets/main.css`: `.glass-card` (frosted card surface), `.nav-link` / `.nav-link.router-link-active`.

### Component conventions

- `src/components/ui/` — base primitives (`BaseButton`, `BaseInput`, `BaseSelect`, `BaseModal`, `BaseBadge`). Prefer these over raw HTML elements.
- Charts in `src/components/insights/` are hand-rolled SVG (no chart library dependency).
- Components consume the store directly via `useBudgetStore()` — no prop drilling for store state.
