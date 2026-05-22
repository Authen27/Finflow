// FinFlow E2E — custom test fixture.
//
// Extends Playwright's base test with:
//   • determinism: a frozen clock (FIXED_NOW) + pinned crypto.randomUUID, so
//     month-based logic (today()/nowMonthKey()) and generated ids are stable.
//   • optional localStorage seeding via `test.use({ seed })`.
//   • Page Objects exposed as fixtures (dashboard, transactions).
//
// Usage:
//   import { test, expect } from '../fixtures/app';
//   test.use({ seed: defaultSeed });
//   test('...', async ({ page, dashboard }) => { ... });

import { test as base, expect, type Page } from '@playwright/test';
import {
  FIXED_NOW_MS, determinismScript, seedScript, type SeedData,
} from './seed';
import { DashboardPage } from '../pages/DashboardPage';
import { TransactionsPage } from '../pages/TransactionsPage';

type AppFixtures = {
  /** Set via test.use({ seed }) to pre-populate localStorage before boot. */
  seed: SeedData | undefined;
  dashboard: DashboardPage;
  transactions: TransactionsPage;
};

export const test = base.extend<AppFixtures>({
  seed: [undefined, { option: true }],

  page: async ({ page, seed }, use) => {
    // Freeze wall-clock time so date-derived UI is deterministic, but let
    // timers still fire (setFixedTime, not install) so the app stays responsive.
    await page.clock.setFixedTime(FIXED_NOW_MS);
    // Pin uuid generation (runs before app scripts).
    await page.addInitScript(determinismScript);
    // Seed the household, if requested.
    if (seed) await page.addInitScript(seedScript, seed);
    await use(page);
  },

  dashboard: async ({ page }, use) => { await use(new DashboardPage(page)); },
  transactions: async ({ page }, use) => { await use(new TransactionsPage(page)); },
});

export { expect, type Page };
