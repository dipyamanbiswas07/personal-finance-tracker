# Personal Finance Tracker

A personal finance tracker built as a Vue 3 SPA. Configure budget categories across four types, track monthly payments with full or partial amounts, and monitor investments — all stored locally in the browser with no backend or accounts required.

## Features

- **Dashboard** — Summary cards (budget, completion %, paid so far, remaining), budget split donut chart with embedded cumulative investments line chart, quick-toggle tracker for the current month, YTD summary, monthly completion bars, and a category breakdown table
- **Categories** — Add, edit, and delete budget categories with a name, monthly amount, and type (Expense, Investment, EMI/Loan, Short term saving). 12-column tracking grid with year selector built into the same view
- **Three-state tracking** — Mark categories as done (full amount), partial (enter a custom amount), or reset to undone; partial amounts count toward completion
- **Credit Cards** — Track monthly credit card payment status separately from budget categories
- **Export / Import** — Download all data as a JSON file and restore it on any device via the header buttons
- **Persistent storage** — Everything saved to `localStorage`; survives page refreshes

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) — state management
- [Vue Router 4](https://router.vuejs.org/) — hash-mode routing (no server required)
- [Tailwind CSS v3](https://tailwindcss.com/) — utility-first styling, dark-only design

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

## Routes

| Path | Description |
|---|---|
| `/` | Dashboard (merged with insights) |
| `/categories` | Category management + 12-month tracking grid |
| `/credit-cards` | Credit card payment tracker |

## Data Storage

All data lives in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `budget_categories` | Array of category objects (id, name, amount, type, color) |
| `budget_tracking` | Nested map: `year → month → categoryId → false \| true \| number` |
| `budget_settings` | Currency symbol and selected year |
| `cc_cards` | Array of credit card objects (id, name, color) |
| `cc_tracking` | Nested map: `year → month → cardId → boolean` |
| `cc_settings` | Selected year for credit cards view |
