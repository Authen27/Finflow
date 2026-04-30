# FinFlow — Family Finance OS

Three deliverables in one repo, each independently runnable:

| Path | What | Stack | Run |
|---|---|---|---|
| `./` | **v5 vanilla shell** | HTML + CSS + JS, no build | open `index.html` |
| `react/` | **v6 + v7 + v7.5** consumer app | Vite · React 18 · TS · Tailwind · Recharts · Zustand | `cd react && npm install && npm run dev` → `:5173` |
| `admin/` | **v8 admin backend** with Claude native theme | Vite · React 18 · TS · Tailwind · Recharts | `cd admin && npm install && npm run dev` → `:5174` |

## What's where

- **`index.html` · `style.css` · `app.js`** — v5 vanilla shell. Fully working. No tooling required.
- **`src/dataAdapter.js`** — v4.1 vanilla data adapter (LocalStorage / Supabase / Hybrid).
- **`react/`** — v6 React migration plus v7 onboarding/EMI/recurring + v7.5 rules-based Planner + AI Chatbot scaffold.
- **`admin/`** — v8 admin backend in Claude native theme. NorthStar dashboard + role-gated pages + mock data layer.
- **`db/schema.sql`** — Postgres schema for Supabase (auth, multi-household, RLS).
- **`FinFlow App/`** — product specs, GTM strategy, financial model, design wireframes, v7 PRD.
- **`VERSIONS.md`** — full changelog v1 → v8.
- **`ARCHITECTURE.md`** — cloud + auth + multi-household design doc.
- **`CLAUDE.md`** — orientation for Claude Code agents working on this repo.

## Quick start

```bash
git clone <this-repo>
cd budget-app

# Run the v5 vanilla shell
python -m http.server 8000  # then open http://localhost:8000

# Or the v6/v7 React consumer app
cd react && npm install && npm run dev

# Or the v8 admin backend (separate terminal)
cd admin && npm install && npm run dev
```

The consumer (`:5173`) and admin (`:5174`) can run side-by-side.

## Roadmap

See `VERSIONS.md` for the full version history and `ARCHITECTURE.md` for the cloud migration plan.

- **v8.1** — Supabase wiring (auth + RLS) for both apps; real Stripe webhooks; real PostHog/Intercom/Sentry integrations
- **v8.2** — LLM-driven Planner (rules engine outputs become structured prompts); chat backend via Edge Function
- **v9.0** — Multi-tenant cloud sync (consumer); per-org admin views
- **Platform expansion** — 8 verticals reusing the four-component architecture (Health · Care · Learning · Work · Legal · Consumer) per `FinFlow App/finflow-platform-expansion.html`
