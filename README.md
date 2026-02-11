# Melkonian Industries - Time Tracking & Invoicing

Internal dashboard for tracking billable hours, software subscriptions, and payables across clients. Built for Melkonian Industries LLC.

**Production:** https://melkonian-industries.netlify.app

## Features

- **Time Tracking** — Log daily hours with start/end times, auto-calculated totals, and receipt attachments
- **Software Subscriptions** — Track monthly and annual subscriptions per client with billing cycle normalization
- **Payables** — Manage client payables with automatic 10% calculations and Nextier cross-client mirroring
- **Grand Total** — Real-time rollup of time costs + annualized subscriptions - payables
- **Multi-client** — Admin sees all clients; each client sees only their own data
- **Reports** — Cross-client reporting view for admin users
- **Print-ready invoices** — Print-optimized layout for client invoices

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 |
| UI | React 19, Tailwind CSS, Radix UI, shadcn/ui |
| Database | Supabase (Postgres) |
| File Storage | Supabase Storage (`receipts` bucket) |
| Auth | Passcode-based sessions (HTTP-only cookies) |
| Testing | Vitest, Testing Library |

## Getting Started

```bash
git clone https://github.com/davemelk100/v0-pdf-data-storage.git
cd v0-pdf-data-storage
npm install --legacy-peer-deps
```

Copy `.env.local.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PASSCODE_ADMIN=
PASSCODE_CYGNET=
PASSCODE_MINDFLIP=
PASSCODE_NEXTIER=
```

Run locally:

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## Authentication

Access is controlled by 5-digit passcodes set via environment variables. Each passcode maps to a role:

| Env Variable | Role | Access |
|---|---|---|
| `PASSCODE_ADMIN` | Admin | All routes, all clients |
| `PASSCODE_CYGNET` | Client | `/client/cygnet` only |
| `PASSCODE_MINDFLIP` | Client | `/client/client-b` only |
| `PASSCODE_NEXTIER` | Client | `/client/nextier` only |

## Project Structure

```
app/
  layout.tsx          Root layout (theme + auth providers)
  page.tsx            Admin dashboard (/)
  login/page.tsx      Login page
  reports/page.tsx    Cross-client reports
  client/[clientId]/page.tsx   Per-client view
  api/auth/route.ts   Auth API (POST login, DELETE logout)
components/
  time-tracking-section.tsx    Time entry table + CRUD
  subscriptions-section.tsx    Subscription table + CRUD
  payables-section.tsx         Payables table + CRUD + Nextier sync
  grand-total-section.tsx      Rollup calculations
  ui/                          shadcn/ui primitives
lib/
  supabase.ts         Supabase client, row mappers, all CRUD functions
  auth-context.tsx     Auth provider (supabase client, session, sign-in/out)
  project-data.ts      TypeScript interfaces + seed data
middleware.ts          Route protection
tests/
  unit/                Unit tests (middleware, auth, mappers, CRUD, calculations)
  helpers/             Mock Supabase client factory
```

## Deployment

Deployed to Netlify. The Next.js runtime adapter handles SSR and API routes automatically.

Environment variables must be set in **Netlify > Site settings > Environment variables**.
