import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateShares } from '../services/splitCalculator.js';
import { sumAmounts, amountsEqual } from '../utils/currency.js';

const U1 = 'user1';
const U2 = 'user2';
const U3 = 'user3';
const U4 = 'user4';
const U5 = 'user5';

describe('Split Calculator', () => {
  describe('Equal Split', () => {
    it('splits evenly among 3 participants', () => {
      const shares = calculateShares(90, 'equal', [U1, U2, U3]);
      assert.equal(shares.length, 3);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 90);
      shares.forEach(s => {
        assert.equal(s.amount, 30);
        assert.equal(s.shares, 1);
      });
    });

    it('handles uneven division with rounding', () => {
      const shares = calculateShares(100, 'equal', [U1, U2, U3]);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
      // 100/3 = 33.33 each, remainder 1 cent → first person gets 33.34
      assert.equal(shares[0].amount, 33.34);
      assert.equal(shares[1].amount, 33.33);
      assert.equal(shares[2].amount, 33.33);
    });

    it('handles single participant', () => {
      const shares = calculateShares(50, 'equal', [U1]);
      assert.equal(shares.length, 1);
      assert.equal(shares[0].amount, 50);
    });

    it('handles 4 participants evenly', () => {
      const shares = calculateShares(100, 'equal', [U1, U2, U3, U4]);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
      shares.forEach(s => assert.equal(s.amount, 25));
    });

    it('handles decimal amount', () => {
      const shares = calculateShares(33.33, 'equal', [U1, U2, U3]);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 33.33);
    });
  });

  describe('Custom Split', () => {
    it('accepts manually specified amounts that sum to total', () => {
      const input = [
        { user: U1, amount: 50, percentage: 0, shares: 0 },
        { user: U2, amount: 30, percentage: 0, shares: 0 },
        { user: U3, amount: 20, percentage: 0, shares: 0 },
      ];
      const shares = calculateShares(100, 'custom', [U1, U2, U3], input);
      assert.equal(shares[0].amount, 50);
      assert.equal(shares[1].amount, 30);
      assert.equal(shares[2].amount, 20);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
    });

    it('handles decimal custom amounts', () => {
      const input = [
        { user: U1, amount: 33.34, percentage: 0, shares: 0 },
        { user: U2, amount: 33.33, percentage: 0, shares: 0 },
        { user: U3, amount: 33.33, percentage: 0, shares: 0 },
      ];
      const shares = calculateShares(100, 'custom', [U1, U2, U3], input);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
    });

    it('rejects custom amounts that do not sum to total', () => {
      const input = [
        { user: U1, amount: 50, percentage: 0, shares: 0 },
        { user: U2, amount: 30, percentage: 0, shares: 0 },
        { user: U3, amount: 10, percentage: 0, shares: 0 },
      ];
      assert.throws(
        () => calculateShares(100, 'custom', [U1, U2, U3], input),
        /must add up to/
      );
    });

    it('rejects negative custom amounts', () => {
      const input = [
        { user: U1, amount: -10, percentage: 0, shares: 0 },
        { user: U2, amount: 110, percentage: 0, shares: 0 },
      ];
      assert.throws(
        () => calculateShares(100, 'custom', [U1, U2], input),
        /cannot be negative/
      );
    });

    it('handles zero share for a participant', () => {
      const input = [
        { user: U1, amount: 100, percentage: 0, shares: 0 },
        { user: U2, amount: 0, percentage: 0, shares: 0 },
      ];
      const shares = calculateShares(100, 'custom', [U1, U2], input);
      assert.equal(shares[0].amount, 100);
      assert.equal(shares[1].amount, 0);
    });
  });

  describe('Percentage Split', () => {
    it('calculates amounts from percentages', () => {
      const input = [
        { user: U1, amount: 0, percentage: 50, shares: 0 },
        { user: U2, amount: 0, percentage: 30, shares: 0 },
        { user: U3, amount: 0, percentage: 20, shares: 0 },
      ];
      const shares = calculateShares(100, 'percentage', [U1, U2, U3], input);
      assert.equal(shares[0].amount, 50);
      assert.equal(shares[1].amount, 30);
      assert.equal(shares[2].amount, 20);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
    });

    it('handles percentage with rounding', () => {
      const input = [
        { user: U1, amount: 0, percentage: 33.33, shares: 0 },
        { user: U2, amount: 0, percentage: 33.33, shares: 0 },
        { user: U3, amount: 0, percentage: 33.34, shares: 0 },
      ];
      const shares = calculateShares(100, 'percentage', [U1, U2, U3], input);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
    });

    it('rejects percentages not summing to 100', () => {
      const input = [
        { user: U1, amount: 0, percentage: 50, shares: 0 },
        { user: U2, amount: 0, percentage: 30, shares: 0 },
        { user: U3, amount: 0, percentage: 10, shares: 0 },
      ];
      assert.throws(
        () => calculateShares(100, 'percentage', [U1, U2, U3], input),
        /must add up to 100/
      );
    });

    it('rejects negative percentages', () => {
      const input = [
        { user: U1, amount: 0, percentage: -10, shares: 0 },
        { user: U2, amount: 0, percentage: 110, shares: 0 },
      ];
      assert.throws(
        () => calculateShares(100, 'percentage', [U1, U2], input),
        /cannot be negative/
      );
    });

    it('rejects percentage over 100 for single participant', () => {
      const input = [
        { user: U1, amount: 0, percentage: 150, shares: 0 },
      ];
      assert.throws(
        () => calculateShares(100, 'percentage', [U1], input),
        /cannot exceed 100/
      );
    });

    it('handles 100% single participant', () => {
      const input = [
        { user: U1, amount: 0, percentage: 100, shares: 0 },
      ];
      const shares = calculateShares(50, 'percentage', [U1], input);
      assert.equal(shares[0].amount, 50);
    });
  });

  describe('Share Split', () => {
    it('calculates amounts based on share weights', () => {
      // Example from spec: Anupam=2, Rahul=1, Sayan=1, total=4 shares, amount=100
      const input = [
        { user: U1, amount: 0, percentage: 0, shares: 2 },
        { user: U2, amount: 0, percentage: 0, shares: 1 },
        { user: U3, amount: 0, percentage: 0, shares: 1 },
      ];
      const shares = calculateShares(100, 'shares', [U1, U2, U3], input);
      assert.equal(shares[0].amount, 50);  // 2/4 * 100
      assert.equal(shares[1].amount, 25);  // 1/4 * 100
      assert.equal(shares[2].amount, 25);  // 1/4 * 100
      assert.equal(sumAmounts(shares.map(s => s.amount)), 100);
    });

    it('handles shares with rounding', () => {
      const input = [
        { user: U1, amount: 0, percentage: 0, shares: 2 },
        { user: U2, amount: 0, percentage: 0, shares: 1 },
      ];
      const shares = calculateShares(10, 'shares', [U1, U2], input);
      // 2/3 * 10 = 6.67, 1/3 * 10 = 3.33
      assert.equal(sumAmounts(shares.map(s => s.amount)), 10);
    });

    it('rejects total shares of zero', () => {
      const input = [
        { user: U1, amount: 0, percentage: 0, shares: 0 },
        { user: U2, amount: 0, percentage: 0, shares: 0 },
      ];
      assert.throws(
        () => calculateShares(100, 'shares', [U1, U2], input),
        /Shares must be greater than 0/
      );
    });

    it('rejects negative shares', () => {
      const input = [
        { user: U1, amount: 0, percentage: 0, shares: -1 },
        { user: U2, amount: 0, percentage: 0, shares: 3 },
      ];
      assert.throws(
        () => calculateShares(100, 'shares', [U1, U2], input),
        /cannot be negative/
      );
    });

    it('rejects zero shares for a participant', () => {
      const input = [
        { user: U1, amount: 0, percentage: 0, shares: 1 },
        { user: U2, amount: 0, percentage: 0, shares: 0 },
        { user: U3, amount: 0, percentage: 0, shares: 1 },
      ];
      assert.throws(
        () => calculateShares(100, 'shares', [U1, U2, U3], input),
        /Shares must be greater than 0/
      );
    });
  });

  describe('Edge Cases', () => {
    it('rejects zero amount', () => {
      assert.throws(
        () => calculateShares(0, 'equal', [U1, U2]),
        /Amount must be greater than 0/
      );
    });

    it('rejects negative amount', () => {
      assert.throws(
        () => calculateShares(-100, 'equal', [U1, U2]),
        /Amount must be greater than 0/
      );
    });

    it('rejects empty participants', () => {
      assert.throws(
        () => calculateShares(100, 'equal', []),
        /At least one participant/
      );
    });

    it('rejects invalid split type', () => {
      assert.throws(
        () => calculateShares(100, 'invalid', [U1, U2]),
        /Invalid split type/
      );
    });

    it('handles very small decimal amounts', () => {
      const shares = calculateShares(0.03, 'equal', [U1, U2, U3]);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 0.03);
    });

    it('handles large amounts', () => {
      const shares = calculateShares(1000000, 'equal', [U1, U2]);
      assert.equal(sumAmounts(shares.map(s => s.amount)), 1000000);
      assert.equal(shares[0].amount, 500000);
      assert.equal(shares[1].amount, 500000);
    });
  });

  describe('Consistency: all split types produce same total', () => {
    const amount = 250;
    const participants = [U1, U2, U3, U4, U5];

    it('equal split sums to total', () => {
      const shares = calculateShares(amount, 'equal', participants);
      assert.ok(amountsEqual(sumAmounts(shares.map(s => s.amount)), amount));
    });

    it('percentage split sums to total', () => {
      const input = [
        { user: U1, percentage: 20, amount: 0, shares: 0 },
        { user: U2, percentage: 20, amount: 0, shares: 0 },
        { user: U3, percentage: 20, amount: 0, shares: 0 },
        { user: U4, percentage: 20, amount: 0, shares: 0 },
        { user: U5, percentage: 20, amount: 0, shares: 0 },
      ];
      const shares = calculateShares(amount, 'percentage', participants, input);
      assert.ok(amountsEqual(sumAmounts(shares.map(s => s.amount)), amount));
    });

    it('shares split sums to total', () => {
      const input = [
        { user: U1, shares: 3, amount: 0, percentage: 0 },
        { user: U2, shares: 2, amount: 0, percentage: 0 },
        { user: U3, shares: 5, amount: 0, percentage: 0 },
        { user: U4, shares: 1, amount: 0, percentage: 0 },
        { user: U5, shares: 4, amount: 0, percentage: 0 },
      ];
      const shares = calculateShares(amount, 'shares', participants, input);
      assert.ok(amountsEqual(sumAmounts(shares.map(s => s.amount)), amount));
    });
  });
});
