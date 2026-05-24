// ──────────────────────────────────────────────────────────────────────────
// GOLDEN TEMPLATE — Simple (S) tier
// ──────────────────────────────────────────────────────────────────────────
//
// What "Simple" means in our rubric:
//   • Single page, single form
//   • No time manipulation
//   • No cloud env
//   • Cross-module assertion limited to "row appears in list"
//
// Copy this file's STRUCTURE — not its content — when implementing the rest
// of §1 TXN-FC. The shape to preserve:
//
//   1. test.use({ seed }) at the top — `defaultSeed` for everything that
//      needs a household to exist, `seedWith({ override })` when you need
//      a small delta. NEVER mutate localStorage from inside the test body.
//
//   2. One test = one Test Case ID from the inventory, named in the
//      describe-then-test pattern below so failure traces read clean.
//
//   3. Arrange → Act → Assert, with comments calling out each phase.
//
//   4. Assertions use Playwright web-first matchers (toBeVisible, toHaveText,
//      toHaveCount) so they auto-retry. Never `await page.waitForTimeout(N)`
//      — if you reach for it, your locator is wrong.
//
// See e2e/REVIEW_CHECKLIST.md for the full set of reviewer-enforced rules.
// ──────────────────────────────────────────────────────────────────────────

import { test, expect } from '../fixtures/app';
import { defaultSeed } from '../fixtures/seed';

test.describe('§1 TXN-FC · Transaction Creation', () => {
  test.use({ seed: defaultSeed });

  test('TXN-FC-001 · creates an income transaction with the minimum required fields', async ({
    page, transactions, txnModal,
  }) => {
    // ── ARRANGE ─────────────────────────────────────────────────────────────
    // The household is pre-seeded (defaultSeed). FIXED_NOW is 2026-05-22, so
    // we pick a date inside the seeded May 2026 window for clean aggregation.
    await transactions.goto();

    // Sanity check the seeded baseline; this is a Playwright `expect().toBe()`
    // not an assumption — if the seed regresses, the failure happens HERE
    // rather than in the middle of the test, which is much easier to debug.
    await expect(transactions.row('E2E Salary')).toBeVisible();

    // ── ACT ─────────────────────────────────────────────────────────────────
    await transactions.openAdd();
    await txnModal.waitOpen();

    await txnModal.fill({
      type:        'income',
      amount:      2_500,
      date:        '2026-05-20',
      description: 'TXN-FC-001 Bonus',
      category:    'salary',
    });

    await txnModal.submit();

    // ── ASSERT ──────────────────────────────────────────────────────────────
    // Web-first matchers — Playwright retries the assertion until the
    // locator resolves, so no explicit wait is necessary.
    const newRow = transactions.row('TXN-FC-001 Bonus');
    await expect(newRow).toBeVisible();
    await expect(newRow).toHaveCount(1);

    // ── REGRESSION GUARD ────────────────────────────────────────────────────
    // The v6.4 "data lost on refresh" class of bug is the highest-priority
    // regression for the Transactions module. Every creation test in §1
    // includes this reload assertion until v7.0 ships the cloud-cache
    // re-architecture (see TECH_DEBT.md TD-04).
    await page.reload();
    await expect(transactions.row('TXN-FC-001 Bonus')).toBeVisible();
  });
});
