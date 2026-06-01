# Vyact — Rename & Rebrand Transition Checklist

> **Status:** DRAFT — pending founder sign-off on the two pre-flight gates (§1) before any execution begins.
> **Companion to:** `CLAUDE.md` · `VERSIONS.md` · `VISION_AND_NEXT_STEPS.md`
> **Audience:** Founder (decisions), development agents (execution), founder again (release).

---

## 0. How to use this checklist

- **Do not start at §3.** Sections §1 and §2 are gates. If either gate fails, the rest of the checklist does not execute. Every line below assumes both gates have passed.
- Items marked **[BLOCKING]** must complete before the next group begins. Items marked **[PARALLEL]** can be picked up by another agent in parallel.
- Items marked **[FOUNDER]** require the founder's decision or sign-off. An agent should pause and ask.
- A rename is a one-way door for branding and a two-way door for code. Cut the code carefully; cut the public surface only once.

---

## 1. Pre-flight gates — DO THESE FIRST

These are not engineering tasks. They are conditions of execution. The founder owns all of §1.

### 1.1 Trademark clearance **[FOUNDER · BLOCKING]**
- [ ] Conduct a knockout trademark search in every market of operation. **Minimum required: UK (IPO), US (USPTO), India (CGPDTM), EU (EUIPO), and WIPO international register.**
- [ ] Search classes 9 (software), 35 (business services), 36 (financial services), and 42 (technology services) — fintech typically registers across these.
- [ ] Verify no conflicting marks in adjacent categories (banking, accounting, wealth management, AI assistants).
- [ ] If knockout search is clean, engage an IP attorney for a full search and filing strategy. **Do not skip this step on the assumption that the name is unique.** A name being "unusual" is not a legal opinion.
- [ ] File trademark applications in priority markets before public launch.
- [ ] Document the cleared classes and jurisdictions in `/legal/trademark-status.md` for future reference.

### 1.2 Domain & handle availability **[FOUNDER · BLOCKING]**
- [ ] Verify and register the primary domain. Decide: `vyact.com` or `vyact.app` or `vyact.io` as canonical? **Register all three regardless** — defensive registrations are cheap.
- [ ] Register defensive variants: `getvyact.com`, `vyact.co`, `vyact.ai`, `vyact.finance`, common typos (`vyacht.com`, `viact.com`).
- [ ] Verify and claim social handles: X / Twitter, Instagram, LinkedIn (company page), YouTube, TikTok, Threads, Bluesky, Mastodon, Reddit (`r/vyact`), GitHub (org and personal), npm (`@vyact`), Product Hunt.
- [ ] App store names: reserve in Apple App Store Connect and Google Play Console (these reservations have specific rules and expire).
- [ ] If any blocking handle is taken (especially X / Instagram / GitHub org), assess whether the name is still viable or whether a modifier is needed (`vyactapp`, `vyacthq`). **[FOUNDER]** to decide.

### 1.3 Linguistic & cultural sanity check **[FOUNDER · BLOCKING]**
- [ ] Pronounce "Vyact" to 5 people in each launch market without context. Confirm they (a) can say it back, (b) can spell it on first hearing, (c) do not associate it with anything embarrassing in their language.
- [ ] Specific check for Indian languages given the Sanskrit roots in the naming rationale — confirm "Vyact" does not collide with vernacular meanings the user wouldn't want.
- [ ] Confirm no negative phonetic collisions in target launch markets (UK, US, India).
- [ ] Document outcomes. If results are mixed, **stop and reconsider** before triggering §3 onward.

### 1.4 Brand-system kickoff **[FOUNDER · BLOCKING]**
- [ ] Decide naming conventions: is the product "Vyact" or "Vyact App" or "Vyact Wealth"? Is the company also "Vyact" or a separate parent name (e.g. "Vyact Labs Ltd")?
- [ ] Decide capitalisation: `Vyact` (preferred per the launch note), `VYACT`, or `vyact`? **Lock one and never deviate.**
- [ ] Decide whether "Family Pulse Score™" is renamed to "Vyact Score" or kept as a sub-brand. **[FOUNDER]**
- [ ] Decide whether to retain "Vyact" verb usage in copy ("vyact a bill") or treat that as community-driven only.
- [ ] Tagline locked? Current candidate from the rename brief: *"The household wealth engine."* Confirm or replace.

> **Gate check:** if any item in §1 is unresolved, do not proceed to §2. Engineering work done before these are settled is rework waiting to happen.

---

## 2. Scope & sequencing decisions **[FOUNDER]**

Before code changes, lock these decisions. They determine the size of the migration.

### 2.1 What gets renamed
- [ ] **Live product code (v6 codebase):** YES — fully rename.
- [ ] **Historical v1–v5 vanilla shell at root:** **[FOUNDER decision]** — rename or leave as-is and archive under `legacy/finflow-v5/`? Recommendation: archive, do not rename. The v5 shell is being deprecated by the React migration anyway.
- [ ] **Historical documents (business plans, GTM, financial models, investor decks):** **[FOUNDER decision]** — these are public-facing investor artefacts. Recommendation: rename forward-facing documents (the v7 PRD, the roadmap deck, the architecture deck) but **do not** retroactively rewrite the v1–v5 historical record. Brand evolution is normal; pretending it never happened is not.
- [ ] **Future documents only:** the `Vision & Next Steps` md, the v7 PRD, and all subsequent decks adopt Vyact immediately.

### 2.2 Migration mode for existing data
- [ ] How do existing v6 users (if any beyond the founder) experience the rename? **[FOUNDER]**
- [ ] Recommended: a one-time silent migration on next app open — `localStorage` keys re-namespaced, profile preserved, with a one-screen "Welcome to Vyact — same data, new name" notice.
- [ ] Decide: keep the old `finflow.*` localStorage keys readable as a fallback for 90 days, then delete? Or hard-cut on day one?

### 2.3 Public communication plan
- [ ] Date of the public rename announcement.
- [ ] Channels: any existing email list, social, Product Hunt, blog post.
- [ ] Holding redirect: if `finflow.*` domains exist publicly, set up 301 redirects to `vyact.*`.
- [ ] An honest "we renamed and here's why" post for any existing community.

---

## 3. Brand asset creation **[PARALLEL with §4]**

Lock the visual identity before it lands in code.

### 3.1 Visual identity
- [ ] **Logo** — wordmark + monogram ("V"). Light and dark variants. SVG masters.
- [ ] **Favicon** suite — 16, 32, 48, 96, 192, 512px. SVG + PNG fallbacks.
- [ ] **App icons** — iOS (1024px master + all sizes), Android (adaptive icon foreground + background layers + all densities), PWA maskable icons.
- [ ] **Social card / OG image** — 1200×630 default, plus Twitter card variant.
- [ ] **Splash screens** if PWA / native — light & dark.
- [ ] **Brand colour palette** locked in design tokens. Current v6 uses paper-warm + coral + cream — confirm or revise for Vyact ("premium dark-themed Alpha interface" was mentioned in the rename note; **[FOUNDER]** to confirm whether the warm palette stays or shifts to dark-premium).
- [ ] **Typography lockup** — confirm Newsreader + Inter Tight + JetBrains Mono are retained or revised.

### 3.2 Brand voice & messaging
- [ ] Update the one-line product description. Old: *"FinFlow — Family Finance OS."* New: *"Vyact — The household wealth engine."* (or alternative per §1.4).
- [ ] Rewrite the elevator pitch (3 sentences).
- [ ] Rewrite the App Store / Play Store short description and long description.
- [ ] Confirm whether "Family Pulse Score™" becomes "Vyact Score" or stays as a sub-mark (per §1.4).
- [ ] Rewrite the README opening paragraph.
- [ ] Voice guidelines: define do/don't (does Vyact use the verb form in copy or not?).

### 3.3 Brand kit deliverable
- [ ] A single `/brand` folder in the repo containing: logos (SVG + PNG), favicon suite, app icons, OG images, palette tokens (`colors.json`), type spec, and a one-page brand guide PDF. This is the source of truth — every other artefact references it.

---

## 4. Codebase migration

> **Reference state:** per `CLAUDE.md`, FinFlow exists in two places — the v5 vanilla shell at the project root and the v6 React app in `react/`. The plan below assumes both get migrated. If §2.1 decides the v5 shell is archived instead, skip the v5 items.

### 4.1 Pre-migration **[BLOCKING]**
- [ ] Create a long-lived branch: `rename/finflow-to-vyact`. All rename work happens here. Do not commit to `main` until §6 verification passes.
- [ ] Tag the current `main` as `pre-vyact-final` so the rollback point is immutable.
- [ ] Take a full export of any production data (even if it's just the founder's localStorage). The migration must not destroy the founder's own historical app data.
- [ ] Audit every occurrence: `grep -ri "finflow" .` and `grep -ri "FinFlow" .` — produce a complete inventory before changing any file. Save it as `/rename-audit.txt`. Expect occurrences in: source files, configs, tests, README, comments, JSDoc, JSON files, asset filenames, env vars, localStorage keys.

### 4.2 Identifiers and namespaces
- [ ] `package.json` — name field, repository URL, homepage, bug tracker URL.
- [ ] `react/package.json` — same.
- [ ] Vite config — base path if it references the brand.
- [ ] Tailwind config — any class prefix if used.
- [ ] TypeScript path aliases — if any reference `@finflow/*`, rename to `@vyact/*`.
- [ ] Any internal npm scope (`@finflow/...`) → `@vyact/...`.

### 4.3 Source files
- [ ] Update all comments, docstrings, JSDoc references.
- [ ] Update `<title>` tags in `index.html` (both v5 root and `react/index.html`).
- [ ] Update meta tags: description, og:title, og:description, twitter:card.
- [ ] Update i18n string files — search every locale for "FinFlow" and replace.
- [ ] Update copy in all React components — sidebar header, settings page footer, about screens, onboarding text, empty states.
- [ ] Update the v5 vanilla shell's `app.js` UI strings if §2.1 decided to migrate it too.
- [ ] Update Help & Guide section content — every mention.
- [ ] Update any toast / notification / error message that references the product name.
- [ ] Update any seed-data text that mentions the product name.

### 4.4 Storage & data
- [ ] **Critical: storage key namespace.** v5 uses anonymous-profile `localStorage` keys with legacy v4 names per `VERSIONS.md`. Decide:
  - **Option A** (recommended): write a one-time migration function in `DataAdapter` that, on first run after the rename, reads the old `finflow.*` keys and writes them to new `vyact.*` keys, then deletes the old ones after a 90-day safety window.
  - **Option B**: hard-cut. Users on the old build lose their data unless they manually export/import. Acceptable only if there are effectively no users yet.
  - **[FOUNDER]** to choose. **The migration function must be idempotent** — running it twice must not corrupt or duplicate data.
- [ ] Update `DataAdapter` interface and its three implementations (`LocalStorageAdapter`, `SupabaseAdapter`, `HybridAdapter`) to use the new namespace.
- [ ] Update `db/schema.sql` — any schema name, table-name prefix, or RLS policy name that contains "finflow".
- [ ] When the cloud foundation lands (per `VISION_AND_NEXT_STEPS.md` task A1), the Supabase project name should be `vyact-prod` / `vyact-staging`, not `finflow-*`.

### 4.5 Exports, downloads, file naming
- [ ] CSV export filename: `finflow-transactions-YYYY-MM.csv` → `vyact-transactions-YYYY-MM.csv`. Verify in code.
- [ ] JSON backup filename: same change.
- [ ] Balance sheet CSV: same change.
- [ ] Any in-app generated PDF or shareable artefact: same change.
- [ ] Any keyboard-shortcut help reference that mentions the brand.

### 4.6 Repo, docs, config
- [ ] `README.md` — full rewrite of the header section. Keep the historical changelog in `VERSIONS.md` intact (do not rewrite history).
- [ ] `CLAUDE.md` — update header and overview sections, but **annotate** "renamed from FinFlow in [date]" so the history isn't lost.
- [ ] `VERSIONS.md` — **add a new entry at the top** for the rename. Do not rewrite v1–v6 entries.
- [ ] `VISION_AND_NEXT_STEPS.md` — rename throughout (this is forward-looking).
- [ ] `ARCHITECTURE.md` — update.
- [ ] Any in-line code comments referencing the brand by name.
- [ ] License file — if the copyright line references the brand or entity, update per §1.4 entity decision.
- [ ] Repo name on GitHub — rename the repo. GitHub auto-creates a redirect from the old URL; verify it works before merging the branch.
- [ ] GitHub org name (if "finflow" is an org) — rename or migrate. This affects every clone URL — coordinate with §5.

### 4.7 CI / CD / infrastructure-as-code
- [ ] CI config (GitHub Actions / equivalent) — workflow names, job names, environment variable names.
- [ ] Deploy environment variable names — e.g. `FINFLOW_API_KEY` → `VYACT_API_KEY`. Update in code AND in the secrets store. Keep both for a transition window if needed.
- [ ] Docker image tags / repository names.
- [ ] Cloud resource names — RDS instance, S3 buckets, CloudFront distribution. **[FOUNDER]** to decide whether to rename existing resources or create new ones and migrate. Renaming production resources in-place is risky; creating new and migrating is safer but slower.
- [ ] Sentry project name; PostHog project name; any other observability tool.
- [ ] DNS records and SSL certificate CNs (per §5).

### 4.8 Assets
- [ ] Replace every old logo, favicon, app icon, splash, OG image with §3 outputs.
- [ ] Delete the old assets from the repo — don't leave them where they can be accidentally referenced.
- [ ] Update any hard-coded asset filenames in code.

---

## 5. External services & integrations

Things outside your codebase that hold the old brand name.

### 5.1 Email & comms
- [ ] Transactional email "from" name and address — `noreply@finflow.com` → `noreply@vyact.com`. Set up the new mailbox.
- [ ] Domain authentication for the new domain — SPF, DKIM, DMARC records. Test before sending.
- [ ] Any HTML email templates — update logo, footer, links.
- [ ] Marketing email list provider (Mailchimp / Loops / Resend) — update sender identity, footer address, list name.

### 5.2 Payment & subscriptions (when H2 lands)
- [ ] Stripe account display name and statement descriptor (this is what shows on the customer's card statement — max ~22 chars, must be readable).
- [ ] Apple App Store Connect — app name, support URL, marketing URL, privacy policy URL.
- [ ] Google Play Console — same.
- [ ] App Store screenshots and promotional copy.

### 5.3 Third-party integrations
- [ ] OAuth app names with any provider (Google, Apple sign-in, future bank aggregators) — the user sees this name on consent screens.
- [ ] TrueLayer / Plaid / aggregator dev portal — registered app name, redirect URIs.
- [ ] Any analytics, error monitoring, or CDP — project / property / source names.
- [ ] LLM provider account / project name (Anthropic / OpenAI).

### 5.4 Legal & policy docs
- [ ] Privacy Policy — rewrite to reference Vyact and the new legal entity (if §1.4 changed the entity).
- [ ] Terms of Service — same.
- [ ] Cookie Policy.
- [ ] Data Processing Agreement (DPA) template.
- [ ] Any beta agreement / EULA.
- [ ] If incorporated, the company registration and any DBA / trading name filing.

### 5.5 Web presence
- [ ] Landing page / marketing site — full rewrite.
- [ ] 301 redirects from `finflow.*` to `vyact.*`. Verify with a crawler.
- [ ] Update meta tags, sitemap.xml, robots.txt.
- [ ] Search Console — add the new domain as a property, submit the new sitemap, request indexing.
- [ ] If the old domain has any backlinks (investor blog mentions, press), they will keep working via redirect, but track the top ones to manually request updates over time.

---

## 6. Verification & launch

### 6.1 Pre-merge verification (still on the `rename/finflow-to-vyact` branch)
- [ ] `grep -ri "finflow" .` returns zero results, OR returns only intentional historical references (e.g. in `VERSIONS.md`). Same for case variants.
- [ ] Run the full v6 app — every page loads, every modal opens, every flow works.
- [ ] Test the storage migration on a copy of real localStorage data (the founder's own export). Confirm no data loss.
- [ ] Test all exports — CSV, JSON, balance sheet — filenames and contents reflect the new name.
- [ ] Open the production build in an incognito window — title, favicon, meta tags all show Vyact. View source to verify.
- [ ] Lighthouse / Pagespeed scan — PWA manifest, theme color, icons all updated.
- [ ] Run any automated tests (when they exist) — green.

### 6.2 Staged release
- [ ] Deploy to a staging environment under `staging.vyact.*` (NOT the old domain).
- [ ] Smoke-test for 48 hours minimum. Use the app as a real user would.
- [ ] Confirm email sending works from the new domain (send a test transactional email).
- [ ] Confirm any OAuth flows still work (if implemented yet).

### 6.3 Production cut-over
- [ ] Schedule the cut-over for a low-activity window.
- [ ] Merge `rename/finflow-to-vyact` to `main`.
- [ ] Deploy to production at the new domain.
- [ ] Activate 301 redirects from old domain.
- [ ] Publish the public announcement (per §2.3).
- [ ] Update all social handles' bios, pinned posts, link-in-bio.
- [ ] Update Product Hunt / directory listings.
- [ ] Notify any existing users via the channel chosen in §2.3.

### 6.4 Post-launch (first 30 days)
- [ ] Monitor error rates — any spike likely related to a missed reference.
- [ ] Monitor 404s on the old domain — surface any redirect gaps.
- [ ] Monitor user feedback — any confusion about the rename.
- [ ] If the storage-migration safety window is set to 90 days (per §4.4 Option A), schedule the cleanup task for day 90.
- [ ] Trademark filings — track examiner correspondence per §1.1.
- [ ] After 30 days of stable operation, delete the `pre-vyact-final` snapshot tag — or keep it indefinitely as a historical reference. **[FOUNDER]** preference.

---

## 7. Things explicitly NOT in this checklist

So an agent doesn't accidentally do them.

- **Do not rewrite the v1–v6 historical changelog in `VERSIONS.md`.** Brand evolution is part of the company story. The rename gets a *new* entry; the past stays.
- **Do not rename the v1–v5 vanilla shell unless §2.1 decided to.** Default is to archive it under `legacy/`.
- **Do not retroactively rename the investor-facing artefacts** (business plan v2.0, GTM strategy, financial model) unless §2.1 explicitly authorised it. Those documents have already been shared; rewriting them creates confusion, not clarity.
- **Do not "improve" the rename scope mid-execution.** If you find an opportunity to refactor while renaming — note it, finish the rename, refactor later as a separate PR. Combining rename and refactor in one branch is how rename PRs become un-mergeable.
- **Do not delete the old domain or social handles.** Keep them, redirect them, hold them for at least 12 months. A returning user typing the old name should land safely on the new one.

---

## 8. Founder review queue

Items in this checklist that need an explicit founder decision before an agent can proceed:

1. **§1** — every item. Pre-flight gates.
2. **§1.4** — Vyact vs. Vyact App vs. Vyact Wealth; capitalisation lock; tagline; Pulse Score sub-brand decision.
3. **§2.1** — scope of rename: v5 shell, historical documents.
4. **§2.2** — storage migration mode (silent migrate vs. hard-cut).
5. **§2.3** — announcement timing and channels.
6. **§3.1** — palette: keep paper-warm, or shift to the premium-dark direction implied by the rename brief.
7. **§3.2** — voice: is "vyact" a verb in copy, or only in community.
8. **§4.4** — storage migration window (90 days vs. immediate).
9. **§4.7** — cloud resource rename strategy (in-place vs. create-and-migrate).
10. **§6.4** — keep the rollback tag indefinitely or delete after 30 days.

Resolve these in a single founder review session before kicking off execution. Saves a week.

---

## 9. Document map

- `CLAUDE.md` — current build state. To be updated per §4.6.
- `VERSIONS.md` — historical changelog. New top entry added; history preserved.
- `VISION_AND_NEXT_STEPS.md` — forward-looking direction. Renamed throughout.
- `VYACT_TRANSITION_CHECKLIST.md` — *this file*. Living document until cutover is complete; archived afterward.

---

Uday's feedback -->

What's NOT done ❌ — critical gaps (updated status)
Section	Item	Status
4.2	vite.config.ts plugin name is 'finflow-version-json' — must be 'vyact-version-json'	✔ Completed (renamed in react/vite.config.ts and react/vite.config.js)
4.3	admin/index.html <title> still "FinFlow — Family Finance OS"	✔ Completed (admin title updated to Vyact Admin)
4.3	react/index.html meta tags (og:title, og:description, twitter)	✔ Completed (OG/Twitter meta tags added to react/index.html)
4.3	manifest.webmanifest — name: "FinFlow", short_name: "FinFlow"	✔ Completed (react/public/manifest.webmanifest updated to Vyact)
4.4	localStorage keys still ff_* prefix (no migration function written)	✔ Completed (compat layer and idempotent migration implemented in DataAdapter/localStorageCompat)
4.5	CSV/JSON export filenames still finflow-* in source	✔ Completed (export filenames updated to vyact-*)
4.6	DEPLOY.md, ARCHITECTURE.md, CLAUDE.md headers still reference FinFlow	✔ Updated (headers renamed and annotated)
4.6	.env.production files have "FinFlow" in comments	⚠ Manual: update required (these files are often ignored; update during infra handoff)
4.7	react/.env.production VITE_APP_URL still points to old react-three-puce-61.vercel.app	✔ Updated to https://vyact-twentyx.vercel.app/
4.7	admin/.env.production VITE_APP_URL still admin-six-orpin-47.vercel.app	✔ Updated to https://vyact-admin.vercel.app/
4.3	Remaining 'FinFlow' occurrences across docs and artifacts	⚠ In progress — bulk audit reduced but historical artifacts (db schema, legacy v5, automation logs) still contain "FinFlow" and require curated decisions

§5 — External Services: Current State
Section	Item	Status
5.1	Transactional email from address (noreply@finflow.com)	❌ not yet — blocked on domain
5.1	SPF/DKIM/DMARC for vyact domain	❌ blocked on domain
5.3	Google OAuth app name still registered as "FinFlow" (or unregistered)	❌ UNBLOCKS issue 1
5.4	Privacy Policy, ToS — not yet Vyact-branded	❌ absent in repo before this pass; founder/legal review still required
5.5	Landing page / marketing site	❌ absent in repo
5.5	301 redirects from finflow domains → vyact domain	❌ needs domain & infra


§6 — Verification & Launch: Current State
Section	Item	Status
6.1	`grep -ri "finflow" .` returns many hits — zero-reference gate not yet passed	❌ BLOCKING (historical artifacts remain)
6.1	Full app run verification	❌ pending (rebuilds needed to regenerate dist after these code edits)
6.1	Storage migration test on founder's real data	❌ migration test recommended (migration code is idempotent, test required)
6.1	PWA manifest and icons verified in source	✔ Source updated (react public manifest + favicons updated)
6.2	Staging env under staging.vyact.*	❌ blocked on domain & infra
6.3	Production cut-over	❌ premature

Verified missing artifacts (repo inventory, 2026-06-01)
- Public legal pages were missing from the app surface: Privacy Policy, Terms of Service, and Cookie Policy were not routable in `react/src/App.tsx`.
- Legal/compliance content files were missing from the repo: no DPA template, beta agreement, or EULA draft was present.
- No dedicated marketing or landing-site implementation was present in the workspace.
- No repo-level redirect configuration proving `finflow.*` → `vyact.*` redirects was present.
- No dedicated transactional email template inventory was present in the repo.
- Remaining `FinFlow` hits in live source are now mostly comments/historical labels; the actionable source-level runtime strings are being reduced separately from generated artifacts.

Source sweep snapshot (2026-06-01)
- `admin/src/**`: no remaining `FinFlow` references after source-header cleanup.
- `react/src/**`: remaining hits are comment, design-note, or test-context references rather than current user-facing runtime copy in the reviewed surfaces.
- Historical and generated references still exist outside live source, especially docs, automation outputs, build artifacts, and transition-history material.
Build/Deploy Config Issues — current status
The immediate code changes listed below were completed in this pass:

- vite.config.ts — internal plugin name renamed to 'vyact-version-json' (react/vite.config.ts & react/vite.config.js)
- manifest.webmanifest — name/short_name updated to "Vyact" in react/public/manifest.webmanifest
- admin/index.html — <title> updated to "Vyact Admin"; OG/Twitter meta tags added

Remaining immediate steps (developer actions):

- Run `npm --prefix "react" run build` and `npm --prefix "admin" run build` to regenerate `dist/` and ensure generated assets (version.json, bundles) include the plugin rename and new metadata.
- Verify production preview locally: `npm --prefix "react" run preview` and `npm --prefix "admin" run preview` and confirm titles, favicons, OG tags show Vyact.
- Decide on curated handling of historical artifacts (db schema comments, v5 shell, automation-run logs) before performing a global replace — these should be audited and handled intentionally.

Notes:
- Many remaining "FinFlow" mentions are historical or in generated/archived artifacts; do not bulk-replace without curator review.
- The .env.production values that reference the old domain must be updated when the Vyact domains are provisioned.

*End of file. The rename only succeeds if §1 succeeds first. Do not skip the gates.*
