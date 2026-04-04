# 💰 WealthLens

A modern personal finance dashboard with a glassmorphic UI, built to help you track income, expenses, budgets, and net worth — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Dashboard** — Monthly overview with quick-add transaction shortcuts
- **Transactions** — Categorized income & expense tracking with bulk actions
- **Budgets** — Set monthly limits per category with visual progress bars
- **Analytics** — Income vs. expenses charts, category breakdowns, savings trends
- **Net Worth** — Track assets & liabilities with historical snapshots
- **Auth** — Secure email/password authentication via Supabase SSR
- **Responsive** — Mobile-first design with iOS-style bottom tab navigation
- **Theming** — System-aware dark/light mode with glassmorphic UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (SSR cookies) |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting Started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. Open the SQL Editor and run the contents of `supabase/migrations/001_initial_schema.sql`.

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

1. Push to GitHub and import the repo on [vercel.com](https://vercel.com/).
2. Add the environment variables above.
3. Deploy — Vercel auto-detects Next.js, no config needed.

## License

MIT
