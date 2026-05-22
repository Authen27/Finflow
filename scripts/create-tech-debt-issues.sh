#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Create GitHub issues for the FinFlow technical-debt register (TECH_DEBT.md).
#
# WHY THIS IS A SCRIPT (not run for you):
#   `gh` was not installed and no GH_TOKEN was present in the audit environment,
#   and `gh auth login` requires an interactive browser step. Run this yourself
#   once gh is installed and authenticated.
#
# PREREQUISITES:
#   1. Install GitHub CLI:        https://cli.github.com/   (winget install GitHub.cli)
#   2. Authenticate:              gh auth login
#   3. Confirm repo access:       gh repo view Authen27/Finflow
#
# USAGE:
#   bash scripts/create-tech-debt-issues.sh            # creates labels + 18 issues
#   REPO=yourfork/Finflow bash scripts/create-tech-debt-issues.sh   # override repo
#
# IDEMPOTENCY: gh has no native dedupe — re-running creates duplicates. Run once.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO="${REPO:-Authen27/Finflow}"
echo "Target repo: $REPO"

# ── Labels (created idempotently; ignore "already exists" errors) ────────────
ensure_label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" 2>/dev/null || true; }
ensure_label "tech-debt"     "5319e7" "Tracked in TECH_DEBT.md"
ensure_label "sev:critical"  "b60205" "Critical severity"
ensure_label "sev:high"      "d93f0b" "High severity"
ensure_label "sev:medium"    "fbca04" "Medium severity"
ensure_label "sev:low"       "0e8a16" "Low severity"
ensure_label "area:correctness" "1d76db" "Technical / correctness"
ensure_label "area:security"    "000000" "Security"
ensure_label "area:performance" "c5def5" "Performance"
ensure_label "area:scalability" "bfd4f2" "Scalability"
ensure_label "area:functional"  "0052cc" "Functional / product"
ensure_label "area:process"     "cccccc" "Engineering process"

mk() { # mk <title> <labels-csv> <body>
  gh issue create --repo "$REPO" --title "$1" --label "$2" --body "$3"
}

mk "TD-01 · Floating-point money arithmetic" \
   "tech-debt,sev:critical,area:correctness" \
'**Severity:** Critical · **Effort:** L (~1–2 weeks)

All money is JS `number` (IEEE-754). `format.convert` chains float division then multiplication; aggregates accumulate over `reduce`; EMI interest/principal split on floats. Rounding only at display.

**Impact**
- *Tech:* systemic rounding drift in the compute hub every page depends on.
- *Functional:* totals/splits/amortization/net-worth can disagree by cents and fail to reconcile.
- *Business:* erodes trust; blocks regulated/business accounting on the roadmap.

**Approach:** integer minor units (cents) end-to-end OR a decimal lib (dinero.js/big.js); explicit half-even rounding only at FX boundaries; property-based round-trip tests.

**Justification:** the defining gap between a budgeting toy and fintech-grade software; cheapest to fix before the decimal model spreads. A characterization test already pins the current lossy behaviour in `format.test.ts`.'

mk "TD-02 · Zero automated tests" \
   "tech-debt,sev:high,area:process" \
'**Severity:** High · **Effort:** M

(Partially addressed: vitest + 39 tests now cover `calculations`, `format`, `amortization`.) Remaining: broaden coverage (sync adapter no-clobber rules, store selectors, component/integration), and gate CI on `npm test` before build.

**Impact** — *Tech:* regression safety for the TD-01/TD-03 refactors. *Functional:* prevents silent money-math regressions. *Business:* faster safe iteration; diligence credibility.

**Approach:** add adapter + component tests (testing-library); wire `npm test` into `.github/workflows/ci.yml` before the build step.

**Justification:** highest-ROI safety net; prerequisite for the correctness fixes.'

mk "TD-03 · No optimistic concurrency (lost updates)" \
   "tech-debt,sev:high,area:correctness" \
'**Severity:** High · **Effort:** M

`SupabaseAdapter.upsert` does not check `updated_at`; last-write-wins. Concurrent edits in a shared household silently clobber each other.

**Impact** — *Tech:* no conflict detection/resolution. *Functional:* lost edits in the headline multi-user scenario. *Business:* data-loss complaints contradict the shared-finance promise.

**Approach:** `updated_at` precondition on writes (`.eq(...)`) → surface conflict + re-fetch/merge; or a compare-and-set RPC; longer term per-field merge/CRDT.

**Justification:** concurrency is intrinsic to the multi-household design.'

mk "TD-04 · Admin privilege schema not version-controlled" \
   "tech-debt,sev:high,area:security" \
'**Severity:** High · **Effort:** S

The admin app references `admin_roles` and `admin_dashboard_kpis()` but neither exists in `db/schema.sql` — the only versioned schema. Privileged authorization lives in an unmanaged migration.

**Impact** — *Tech:* schema drift; admin RLS not reproducible. *Functional:* an env can ship lacking correct admin authorization. *Business:* a privileged-access table with no source-of-truth is a material security/audit risk.

**Approach:** commit `admin_roles`, the KPI RPC, and their RLS into versioned migrations; CI check that deployed schema matches.

**Justification:** privileged authorization must be reviewable and reproducible.'

mk "TD-05 · No render error boundary" \
   "tech-debt,sev:high,area:functional" \
'**Severity:** High · **Effort:** XS (~½ day)

No top-level React error boundary; an uncaught render error white-screens the app.

**Impact** — *Tech:* no fault isolation. *Functional:* one bad data shape kills the whole app. *Business:* trust-destroying for a finance tool.

**Approach:** top-level `<ErrorBoundary>` with a recovery fallback ("your data is safe locally") + optional per-route boundaries; wire to error logging.

**Justification:** tiny effort, removes a catastrophic-feeling failure mode.'

mk "TD-06 · Client pulls entire tables; no pagination/delta sync" \
   "tech-debt,sev:high,area:scalability" \
'**Severity:** High · **Effort:** M–L

`SupabaseAdapter.list()` does `select(*).eq(household_id)` with no limit; whole dataset cached in localStorage and aggregated client-side. `txns_updated_idx` exists but no delta sync (`updated_at > cursor`) is used.

**Impact** — *Tech:* compute/memory scale with full history on the client. *Functional:* slow loads for power/business users. *Business:* caps addressable segment and per-household data ceiling.

**Approach:** pagination + delta-sync cursor (incl. soft-deletes) using the existing index; push heavy aggregations into Postgres views/RPCs.

**Justification:** rework gets much harder once more pages assume all data is in memory.'

mk "TD-07 · AI Chat & Insights shipped as stubs" \
   "tech-debt,sev:high,area:functional" \
'**Severity:** High · **Effort:** M (wire) / XS (relabel)

`StubChatBackend` is a regex matcher; `SupabaseChatBackend.ask()` throws. The PII-safe `SafeSummary` contract is built but never sent.

**Impact** — *Tech:* dead seams carry maintenance cost. *Functional:* "AI" returns canned answers. *Business:* over-promising risks trust.

**Approach:** implement the Supabase Edge fn → Claude Haiku using `SafeSummary`; or label "Beta/coming soon" until wired.

**Justification:** the PII boundary is done; finishing is low-risk, but honest labelling protects trust meanwhile.'

mk "TD-08 · Audit trail not populated for financial CRUD" \
   "tech-debt,sev:medium,area:functional" \
'**Severity:** Medium · **Effort:** S

`activity_log` is only written by 3 RPCs (accept/transfer/leave). Transaction/budget/goal/debt/asset mutations write nothing.

**Impact** — *Tech:* auditing relies on client cooperation. *Functional:* no "who changed this and when" for shared households. *Business:* weakens shared-finance/compliance story.

**Approach:** Postgres triggers on domain tables (server-side, non-bypassable) capturing actor/action/diff.

**Justification:** triggers make the trail tamper-resistant and complete with modest effort.'

mk "TD-09 · Non-atomic, N+1 bulk import (replaceAll)" \
   "tech-debt,sev:medium,area:correctness" \
'**Severity:** Medium · **Effort:** S

`replaceAll` soft-deletes all rows then upserts one-by-one in a loop, no transaction. Mid-loop failure leaves the household partially imported.

**Impact** — *Tech:* no atomicity, many round-trips. *Functional:* restore/import can corrupt data on partial failure. *Business:* corruption on restore is severe.

**Approach:** single Postgres RPC/transaction (delete + bulk insert), all-or-nothing; batched insert.

**Justification:** restore is exactly when users are already fragile.'

mk "TD-10 · Sync queue drops ops silently; no retry cap/visibility" \
   "tech-debt,sev:medium,area:correctness" \
'**Severity:** Medium · **Effort:** S

`flushQueue` drops non-UUID-id ops (console only); failed ops retained with no cap/backoff; `pendingOpCount()` not surfaced.

**Impact** — *Tech:* no DLQ/backoff. *Functional:* no signal that data failed to sync. *Business:* "I entered it but it vanished".

**Approach:** surface unsynced count + a "sync issue" indicator; capped retries w/ backoff; dead-letter view.

**Justification:** plumbing exists; exposing state closes a silent data-loss gap cheaply.'

mk "TD-11 · No route-level code splitting; heavy bundle" \
   "tech-debt,sev:medium,area:performance" \
'**Severity:** Medium · **Effort:** S

All ~17 pages + Recharts eagerly imported; no React.lazy/Suspense.

**Impact** — *Tech:* single large bundle; Recharts ships to all. *Functional:* slower first paint on mobile. *Business:* worse activation/retention on a mobile-first audience.

**Approach:** React.lazy per route + Suspense; lazy-load Recharts on chart pages only.

**Justification:** standard low-risk win.'

mk "TD-12 · Derived metrics recompute per render" \
   "tech-debt,sev:medium,area:performance" \
'**Severity:** Medium · **Effort:** S–M

Pages recompute pulse/aggregations per render; useMemo coverage uneven (Dashboard recomputes over full txn array).

**Impact** — *Tech:* redundant O(n) recompute. *Functional:* jank as data grows. *Business:* degraded perceived perf for engaged users.

**Approach:** memoized Zustand selectors computed once per data change.

**Justification:** centralizing derived state speeds rendering and shrinks correctness surface.'

mk "TD-13 · Budget period is a per-device localStorage overlay" \
   "tech-debt,sev:medium,area:functional" \
'**Severity:** Medium · **Effort:** S

Multi-period budgets store `period` in `budgetMeta.ts` (localStorage), merged client-side, because the DB lacks the column. Two devices show different periods.

**Impact** — *Tech:* schema/feature mismatch on the client. *Functional:* inconsistent budget views across devices. *Business:* confusing in the multi-device scenario.

**Approach:** add a real `period` (+ custom range) column via migration; backfill from `budgetMeta`; remove the overlay.

**Justification:** promotes a documented stop-gap into the schema.'

mk "TD-14 · localStorage quota ceiling; failures swallowed" \
   "tech-debt,sev:medium,area:scalability" \
'**Severity:** Medium · **Effort:** S–M

Full dataset cached in localStorage (~5–10 MB). `markSynced`/cache writes catch and ignore quota errors → large households silently fail to cache.

**Impact** — *Tech:* hard ceiling, no failure signal. *Functional:* silent perf degradation. *Business:* caps usable data volume.

**Approach:** move cache to IndexedDB (idb-keyval); surface quota failures.

**Justification:** pairs with TD-06; required to scale past a small family.'

mk "TD-15 · No MFA / documented auth rate limiting" \
   "tech-debt,sev:medium,area:security" \
'**Severity:** Medium · **Effort:** XS (config)

No MFA and no documented rate limiting / leaked-password protection / CAPTCHA.

**Impact** — *Tech:* larger account-takeover surface. *Functional:* weaker protection for full financial profiles. *Business:* below the security bar for finance; enterprise barrier.

**Approach:** enable Supabase MFA, leaked-password protection, auth rate limits; MFA enrolment in Settings.

**Justification:** mostly configuration; large security gain for minimal effort.'

mk "TD-16 · Backups/exports unencrypted at rest" \
   "tech-debt,sev:medium,area:security" \
'**Severity:** Medium · **Effort:** S

JSON/CSV/clipboard exports contain the full financial picture + PII in plaintext.

**Impact** — *Tech:* sensitive data leaves the app unprotected. *Functional:* exports are a standing leak vector. *Business:* privacy/compliance exposure.

**Approach:** passphrase-based encryption (WebCrypto AES-GCM) for JSON backups; at minimum warn users.

**Justification:** backups are the most portable copy of the most sensitive data.'

mk "TD-17 · No transaction list virtualization" \
   "tech-debt,sev:low,area:performance" \
'**Severity:** Low · **Effort:** S

Transactions page renders the full array, no windowing.

**Impact** — *Tech:* DOM node count scales with history. *Functional:* sluggish past ~1k rows. *Business:* minor; heavy users only.

**Approach:** virtualize with @tanstack/react-virtual.

**Justification:** cheap and isolated when datasets grow.'

mk "TD-18 · Hand-run SQL file instead of a migrations tool" \
   "tech-debt,sev:medium,area:process" \
'**Severity:** Medium · **Effort:** S

Schema is a single hand-run `db/schema.sql`; no migration tooling/version history (related to TD-04).

**Impact** — *Tech:* schema evolution not reproducible/reviewable; env drift likely. *Functional:* hard to guarantee env matches code. *Business:* operational risk; slower, riskier changes.

**Approach:** adopt Supabase CLI migrations (or sqitch/Flyway); ordered migrations committed; run in CI/CD.

**Justification:** reproducible schema is foundational and a prerequisite for TD-04/TD-13.'

mk "TD-19 · No end-to-end / browser test automation" \
   "tech-debt,sev:high,area:process" \
'**Severity:** High · **Effort:** M (phased)

Unit tests now exist (vitest, 39 tests), but no E2E tests exercise the app in a browser: navigation, CRUD modals, multi-currency UI, backup/restore, the v6.4 persistence guarantees, auth/multi-household/RLS, responsive rendering.

**Impact** — *Tech:* no guard on store↔adapter↔storage seams; the "data lost on refresh / sign-out→sign-in" regression has no pinning test. *Functional:* cross-cutting journeys can break silently; RLS isolation asserted nowhere. *Business:* manual QA does not scale across three deployables.

**Approach:** Playwright, two lanes — **Lane A (local-only)** deterministic, seeded via localStorage at boot (reusing `seed.ts`), runs per-PR; **Lane B (cloud)** auth/multi-household/invitations/sync + negative RLS-isolation against a disposable Supabase test project, nightly. POM under `react/e2e/`; determinism harness (frozen clock, pinned UUID, fixed viewport, no animations); CI e2e job sharded with traces/video on failure; Chromium per-PR, WebKit/Firefox + mobile nightly.

**Justification:** the missing layer above the new unit tests; the localStorage-only mode makes most journeys testable with zero backend/flake, and Lane B is the only place RLS (the core security boundary, see TD-04) can be asserted end to end.'

echo "✅ Done. Created tech-debt labels and 19 issues in $REPO."
