# Monthly Budget Tracker

A personal and family finance tracker built as a Vue 3 SPA with Supabase backend. Configure budget categories across four types, track monthly payments with full or partial amounts, monitor investments, and collaborate with family members — all in a dark-themed, mobile-friendly interface.

## Features

- **Dashboard** — Summary cards (budget, completion %, paid so far, remaining), budget split donut chart with embedded cumulative investments line chart, quick-toggle tracker for the current month, YTD summary, monthly completion bars, and a category breakdown table
- **Categories** — Add, edit, and delete budget categories with a name, monthly amount, and type (Expense, Investment, EMI/Loan, Short term saving). 12-column tracking grid with year selector built into the same view
- **Three-state tracking** — Mark categories as done (full amount), partial (enter a custom amount), or reset to undone; partial amounts count toward completion
- **Credit Cards** — Track monthly credit card payment status separately from budget categories
- **Family Collaboration** — Create or join a family group via invite code. Shared budget categories, tracking, and task management for the whole family
  - **Family Tasks** — Create tasks with assignees and due dates. Open/Closed tabs, "My Tasks" filter, overdue badges. Users can only delete their own tasks
  - **Family Members** — View members with display names and avatars. Owner can manage membership
- **Authentication** — Email/password and OAuth sign-in via Supabase Auth
- **Export / Import** — Download all data as a JSON file and restore it on any device via the header buttons

## Tech Stack

- [Vue 3](https://vuejs.org/) + [Vite 7](https://vitejs.dev/)
- [Pinia 3](https://pinia.vuejs.org/) — state management
- [Vue Router 4](https://router.vuejs.org/) — hash-mode routing
- [Tailwind CSS v3](https://tailwindcss.com/) — utility-first styling, dark-only design
- [Supabase](https://supabase.com/) — PostgreSQL database, authentication, and Row Level Security

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
| `/login` | Sign in / sign up |
| `/` | Dashboard |
| `/categories` | Category management + 12-month tracking grid |
| `/credit-cards` | Credit card payment tracker |
| `/family` | Family collaboration — members, shared budget, tasks |

## Data Storage

All data is stored in Supabase (PostgreSQL) with Row Level Security:

| Table | Purpose |
|---|---|
| `categories` | Personal budget categories (name, amount, type, color) |
| `tracking` | Personal monthly tracking (year, month, category, value) |
| `settings` | Personal preferences (currency, selected year) |
| `cc_cards` | Credit card definitions |
| `cc_tracking` | Credit card monthly payment status |
| `families` | Family groups with invite codes |
| `family_members` | Membership with roles and display names |
| `family_categories` | Shared budget categories |
| `family_tracking` | Shared monthly tracking |
| `family_settings` | Family-level preferences |
| `family_tasks` | Shared tasks with assignees and due dates |
