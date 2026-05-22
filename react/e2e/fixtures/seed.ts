// FinFlow E2E — deterministic seed data + browser-side seeding script.
//
// Test data is FIXED (not generated via the app's random `seed.ts`) so that
// assertions are stable. Keys mirror LocalStorageAdapter's anonymous-mode
// layout: `ff_<entity>` for the 'local' household (see src/lib/dataAdapter.ts).

export const FIXED_NOW = '2026-05-22T12:00:00.000Z';
export const FIXED_NOW_MS = Date.parse(FIXED_NOW);

export interface SeedData {
  transactions?: unknown[];
  budgets?: unknown[];
  goals?: unknown[];
  debts?: unknown[];
  assets?: unknown[];
  members?: unknown[];
  profile?: unknown;
}

// A small, realistic household used by journey tests. All amounts in USD.
export const defaultSeed: SeedData = {
  profile: {
    name: 'Test User', email: 'test@example.com', baseCurrency: 'USD',
    language: 'en', household: 'family', dateFormat: 'us',
    payoffStrategy: 'avalanche', extraPayment: 0,
  },
  transactions: [
    { id: '00000000-0000-4000-8000-000000000001', type: 'income',  amount: 5000, currency: 'USD', date: '2026-05-01', description: 'E2E Salary',  category: 'salary' },
    { id: '00000000-0000-4000-8000-000000000002', type: 'expense', amount: 1200, currency: 'USD', date: '2026-05-05', description: 'E2E Rent',    category: 'housing' },
    { id: '00000000-0000-4000-8000-000000000003', type: 'expense', amount:  350, currency: 'USD', date: '2026-05-10', description: 'E2E Grocery', category: 'food' },
  ],
  budgets: [
    { id: '00000000-0000-4000-8000-0000000000b1', category: 'food', limit: 300, currency: 'USD' },
  ],
  goals: [
    { id: '00000000-0000-4000-8000-0000000000c1', type: 'emergency', name: 'E2E Emergency Fund', target: 10000, current: 4000, currency: 'USD', completed: false },
  ],
  debts: [],
  assets: [
    { id: '00000000-0000-4000-8000-0000000000d1', type: 'cash', name: 'E2E Checking', value: 8000, currency: 'USD', liquidity: 'liquid' },
  ],
};

/**
 * Runs IN THE BROWSER via page.addInitScript, before any app code. Writes the
 * seed into localStorage so the app boots straight into a populated household.
 */
export function seedScript(data: SeedData) {
  localStorage.setItem('ff_active_profile', 'local');
  localStorage.setItem('ff_profiles_list', JSON.stringify([{
    id: 'local', name: 'My Household', type: 'family',
    baseCurrency: 'USD', createdAt: '2026-01-01T00:00:00.000Z',
  }]));
  const w = (k: string, v: unknown) => localStorage.setItem('ff_' + k, JSON.stringify(v));
  if (data.profile)      w('profile', data.profile);
  if (data.transactions) w('transactions', data.transactions);
  if (data.budgets)      w('budgets', data.budgets);
  if (data.goals)        w('goals', data.goals);
  if (data.debts)        w('debts', data.debts);
  if (data.assets)       w('assets', data.assets);
  if (data.members)      w('members', data.members);
}

/**
 * Runs IN THE BROWSER before app code. Pins `crypto.randomUUID` to a stable
 * counter so any records the app creates during a test get predictable ids
 * (helps future snapshot/equality assertions). Clock is frozen separately via
 * Playwright's `page.clock` API in the app fixture.
 */
export function determinismScript() {
  let n = 0;
  const stable = () =>
    ('00000000-0000-4000-9000-' + String(++n).padStart(12, '0')) as `${string}-${string}-${string}-${string}-${string}`;
  try {
    if (typeof crypto !== 'undefined') {
      Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: stable });
    }
  } catch { /* non-fatal */ }
}
