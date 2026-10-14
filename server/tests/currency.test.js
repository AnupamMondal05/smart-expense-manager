import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toCents, fromCents, add, subtract, multiply, divide,
  distributeEqual, distributeByShares, amountsEqual, sumAmounts, round,
} from '../utils/currency.js';

describe('Currency Utilities', () => {
  describe('toCents / fromCents', () => {
    it('converts dollars to cents correctly', () => {
      assert.equal(toCents(1), 100);
      assert.equal(toCents(0.01), 1);
      assert.equal(toCents(99.99), 9999);
      assert.equal(toCents(0), 0);
    });

    it('handles floating-point imprecision', () => {
      assert.equal(toCents(0.1 + 0.2), 30);
      assert.equal(toCents(0.1 + 0.1 + 0.1), 30);
    });

    it('converts cents back to dollars', () => {
      assert.equal(fromCents(100), 1);
      assert.equal(fromCents(1), 0.01);
      assert.equal(fromCents(9999), 99.99);
    });

    it('handles invalid inputs', () => {
      assert.equal(toCents(NaN), 0);
      assert.equal(toCents(undefined), 0);
      assert.equal(toCents('abc'), 0);
    });
  });

  describe('add', () => {
    it('adds two amounts safely', () => {
      assert.equal(add(0.1, 0.2), 0.3);
      assert.equal(add(99.99, 0.01), 100);
      assert.equal(add(1.5, 2.5), 4);
    });
  });

  describe('subtract', () => {
    it('subtracts safely', () => {
      assert.equal(subtract(100, 33.33), 66.67);
      assert.equal(subtract(1, 0.01), 0.99);
    });
  });

  describe('multiply', () => {
    it('multiplies safely', () => {
      assert.equal(multiply(10.5, 3), 31.5);
      assert.equal(multiply(0.1, 3), 0.3);
    });
  });

  describe('divide', () => {
    it('divides safely', () => {
      assert.equal(divide(100, 3), 33.33);
      assert.equal(divide(10, 4), 2.5);
    });

    it('returns 0 for division by zero', () => {
      assert.equal(divide(100, 0), 0);
    });
  });

  describe('distributeEqual', () => {
    it('distributes evenly with no remainder', () => {
      const result = distributeEqual(100, 4);
      assert.equal(result.length, 4);
      assert.equal(sumAmounts(result), 100);
      assert.deepEqual(result, [25, 25, 25, 25]);
    });

    it('distributes with remainder going to first participants', () => {
      const result = distributeEqual(100, 3);
      assert.equal(sumAmounts(result), 100);
      assert.deepEqual(result, [33.34, 33.33, 33.33]);
    });

    it('distributes 10.00 among 3 people', () => {
      const result = distributeEqual(10, 3);
      assert.equal(sumAmounts(result), 10);
      assert.deepEqual(result, [3.34, 3.33, 3.33]);
    });

    it('handles single participant', () => {
      const result = distributeEqual(50, 1);
      assert.deepEqual(result, [50]);
    });

    it('returns empty array for zero participants', () => {
      const result = distributeEqual(100, 0);
      assert.deepEqual(result, []);
    });

    it('handles decimal amounts correctly', () => {
      const result = distributeEqual(33.33, 3);
      assert.equal(sumAmounts(result), 33.33);
    });
  });

  describe('distributeByShares', () => {
    it('distributes proportionally by share weights', () => {
      const result = distributeByShares(100, [2, 1, 1]);
      assert.equal(sumAmounts(result), 100);
      assert.deepEqual(result, [50, 25, 25]);
    });

    it('handles unequal shares', () => {
      const result = distributeByShares(100, [3, 1]);
      assert.equal(sumAmounts(result), 100);
      assert.deepEqual(result, [75, 25]);
    });

    it('handles shares with remainder', () => {
      const result = distributeByShares(10, [2, 1, 1]);
      assert.equal(sumAmounts(result), 10);
      // 2/4 * 10 = 5, 1/4 * 10 = 2.5, 1/4 * 10 = 2.5
      // In cents: 1000 cents, [500, 250, 250] — no remainder
      assert.deepEqual(result, [5, 2.5, 2.5]);
    });

    it('handles zero-weight participants', () => {
      const result = distributeByShares(100, [1, 0, 1]);
      assert.equal(sumAmounts(result), 100);
      assert.deepEqual(result, [50, 0, 50]);
    });

    it('returns zeros for all-zero weights', () => {
      const result = distributeByShares(100, [0, 0]);
      assert.deepEqual(result, [0, 0]);
    });
  });

  describe('amountsEqual', () => {
    it('compares amounts with precision', () => {
      assert.ok(amountsEqual(0.1 + 0.2, 0.3));
      assert.ok(amountsEqual(100, 100));
      assert.ok(!amountsEqual(100, 100.01));
    });
  });

  describe('sumAmounts', () => {
    it('sums array of amounts safely', () => {
      assert.equal(sumAmounts([0.1, 0.2, 0.3]), 0.6);
      assert.equal(sumAmounts([33.33, 33.33, 33.34]), 100);
      assert.equal(sumAmounts([]), 0);
    });
  });

  describe('round', () => {
    it('rounds to 2 decimal places', () => {
      assert.equal(round(1.999), 2);
      assert.equal(round(33.3333), 33.33);
    });
  });
});
