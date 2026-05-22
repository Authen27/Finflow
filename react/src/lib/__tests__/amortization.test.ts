import { describe, it, expect } from 'vitest';
import {
  computeEmi, computeRemainingMonths, calculateAmortizationSchedule,
  splitPayment, applyPayment, interestSummary,
} from '../amortization';
import type { Debt } from '../../types';

function debt(over: Partial<Debt>): Debt {
  return {
    id: 'd1', type: 'mortgage', name: 'Home loan',
    principal: 200000, currentBalance: 200000,
    interestRate: 5, minimumPayment: 1170,
    tenureMonths: 300, currency: 'GBP',
    ...over,
  };
}

describe('computeEmi', () => {
  it('matches the documented £200k @ 5% / 25y example (~£1170/mo)', () => {
    // Standard PMT; file header cites ~£1,170 EMI.
    const emi = computeEmi(200000, 5, 300);
    expect(emi).toBeGreaterThan(1160);
    expect(emi).toBeLessThan(1180);
  });
  it('returns 0 with no principal or no tenure', () => {
    expect(computeEmi(0, 5, 300)).toBe(0);
    expect(computeEmi(200000, 5, 0)).toBe(0);
  });
  it('falls back to straight-line when rate is 0', () => {
    expect(computeEmi(1200, 0, 12)).toBeCloseTo(100, 10);
  });
});

describe('splitPayment', () => {
  it('interest = balance * monthly rate; principal = payment - interest', () => {
    // 200000 @ 5%/yr → monthly interest = 200000 * (0.05/12) ≈ 833.33
    const { interest, principal } = splitPayment(200000, 5, 1170);
    expect(interest).toBeCloseTo(833.333, 2);
    expect(principal).toBeCloseTo(1170 - 833.333, 2);
  });
  it('never returns negative principal when payment < interest', () => {
    const { principal } = splitPayment(200000, 5, 100);
    expect(principal).toBe(0);
  });
});

describe('computeRemainingMonths', () => {
  it('returns Infinity when EMI does not cover monthly interest', () => {
    expect(computeRemainingMonths(200000, 100, 5)).toBe(Infinity);
  });
  it('uses straight-line when rate is 0', () => {
    expect(computeRemainingMonths(1200, 100, 0)).toBe(12);
  });
});

describe('calculateAmortizationSchedule', () => {
  it('amortises the balance down toward zero by the final entry', () => {
    const sched = calculateAmortizationSchedule(debt({ remainingMonths: 300 }));
    expect(sched.length).toBeGreaterThan(0);
    expect(sched[sched.length - 1].outstanding).toBeLessThanOrEqual(0.01);
  });
  it('interest portion decreases while principal portion increases over time', () => {
    const sched = calculateAmortizationSchedule(debt({ remainingMonths: 300 }));
    expect(sched[0].interest).toBeGreaterThan(sched[100].interest);
    expect(sched[0].principal).toBeLessThan(sched[100].principal);
  });
});

describe('applyPayment', () => {
  it('a normal payment reduces balance by the principal portion and decrements months', () => {
    const d = debt({ currentBalance: 200000, remainingMonths: 300 });
    const { debt: updated, log } = applyPayment(d, 1170, undefined, '2026-05-22');
    expect(updated.currentBalance).toBeLessThan(200000);
    expect(updated.currentBalance).toBeCloseTo(200000 - log.principal, 6);
    expect(updated.remainingMonths).toBe(299);
    expect(log.isPartPayment).toBe(false);
  });
  it('reduce_tenure keeps EMI and shortens the loan on a part-payment', () => {
    const d = debt({ currentBalance: 200000, remainingMonths: 300, minimumPayment: 1170 });
    const { debt: updated } = applyPayment(d, 50000, 'reduce_tenure', '2026-05-22');
    expect(updated.minimumPayment).toBeCloseTo(1170, 6); // EMI unchanged
    expect(updated.remainingMonths).toBeLessThan(299);   // tenure shortened
  });
  it('reduce_emi keeps tenure (minus one) and lowers the EMI', () => {
    const d = debt({ currentBalance: 200000, remainingMonths: 300, minimumPayment: 1170 });
    const { debt: updated } = applyPayment(d, 50000, 'reduce_emi', '2026-05-22');
    expect(updated.remainingMonths).toBe(299);
    expect(updated.minimumPayment).toBeLessThan(1170);
  });
});

describe('interestSummary', () => {
  it('aggregates lifetime interest, principal, and YTD from the payment log', () => {
    const year = new Date().getFullYear();
    const d = debt({
      paymentLog: [
        { id: '1', date: `${year - 1}-06-01`, amount: 1170, interest: 800, principal: 370, outstandingAfter: 199630, isPartPayment: false },
        { id: '2', date: `${year}-02-01`,     amount: 1170, interest: 700, principal: 470, outstandingAfter: 199160, isPartPayment: false },
      ],
    });
    const s = interestSummary(d);
    expect(s.lifetime).toBeCloseTo(1500, 10);
    expect(s.principalPaid).toBeCloseTo(840, 10);
    expect(s.ytd).toBeCloseTo(700, 10); // only the current-year entry
  });
});
