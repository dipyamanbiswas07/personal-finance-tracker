# Monthly Budget Tracker

A personal monthly budget tracker built as a Vue 3 SPA. Configure budget categories, tag them as Expense or Investment, set monthly amounts, and mark them as done for each month of the year. All data is stored locally in the browser — no backend, no accounts.

## Features

- **Categories** — Add, edit, and delete budget categories with a name, monthly amount, and type (Expense or Investment)
- **Monthly Tracker** — 12-column grid to mark each category as done per month; switch between years
- **Dashboard** — Summary cards and a quick-toggle view for the current month
- **Insights** — SVG donut chart, monthly progress bars, and a filterable category breakdown table
- **Persistent storage** — Everything saved to `localStorage`; survives page refreshes

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) — state management
- [Vue Router 4](https://router.vuejs.org/) — hash-mode routing (no server required)
- [Tailwind CSS v3](https://tailwindcss.com/) — utility-first styling, dark mode via `class` strategy

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Project Structure

```
src/
├── assets/main.css          # Tailwind directives + base styles
├── router/index.js          # 4 routes (hash mode)
├── stores/budgetStore.js    # Pinia store — all state, getters, actions
├── components/
│   ├── layout/AppHeader.vue
│   ├── ui/                  # BaseButton, BaseInput, BaseSelect, BaseModal, BaseBadge
│   ├── categories/          # CategoryList, CategoryCard, CategoryForm
│   ├── tracker/             # MonthlyTracker, MonthCell, YearSelector, QuickTracker
│   └── insights/            # SummaryCards, DonutChart, MonthlyProgress, CategoryBreakdown
└── views/
    ├── DashboardView.vue
    ├── CategoriesView.vue
    ├── TrackerView.vue
    └── InsightsView.vue
```

## Data Storage

All data lives in `localStorage` under three keys:

| Key | Contents |
|---|---|
| `budget_categories` | Array of category objects (id, name, amount, type, color) |
| `budget_tracking` | Nested map: `year → month → categoryId → boolean` |
| `budget_settings` | Currency symbol and selected year |
