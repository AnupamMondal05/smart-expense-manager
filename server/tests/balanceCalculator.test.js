import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateGroupBalances, getBalanceSummary } from '../services/balanceCalculator.js';
import { sumAmounts } from '../utils/currency.js';

// Helper to create mock members
function makeMembers(ids) {
  return ids.map((id) => ({
    _id: { toString: () => id },
    firstName: `User${id.slice(-1)}`,
    lastName: 'Test',
    email: `${id}@test.com`,
  }));
}

// Helper to create a mock expense
function makeExpense(amount, paidById, shares) {
  return {
    amount,
    paidBy: { _id: { toString: () => paidById } },
    individualShares: shares.map(([userId, shareAmount]) => ({
      user: { _id: { toString: () => userId } },
      amount: shareAmount,
    })),
  };
}

describe('Balance Calculator', () => {
  describe('Single expense, equal split', () => {
    it('calculates balances correctly for 3 members splitting equally', () => {
      const members = makeMembers(['A', 'B', 'C']);
      const expenses = [
        makeExpense(90, 'A', [['A', 30], ['B', 30], ['C', 30]]),
      ];

      const { balances, summary } = calculateGroupBalances(members, expenses);

      // A paid 90, owes 30 → net +60
      // B paid 0, owes 30 → net -30
      // C paid 0, owes 30 → net -30
      const aBalance = balances.find(b => b.user.id === 'A');
      const bBalance = balances.find(b => b.user.id === 'B');
      const cBalance = balances.find(b => b.user.id === 'C');

      assert.equal(aBalance.totalPaid, 90);
      assert.equal(aBalance.totalShare, 30);
      assert.equal(aBalance.netBalance, 60);

      assert.equal(bBalance.totalPaid, 0);
      assert.equal(bBalance.totalShare, 30);
      assert.equal(bBalance.netBalance, -30);

      assert.equal(cBalance.totalPaid, 0);
      assert.equal(cBalance.totalShare, 30);
      assert.equal(cBalance.netBalance, -30);

      assert.equal(summary.totalPaid, 90);
      assert.equal(summary.totalShare, 90);
      assert.ok(summary.isBalanced);
    });
  });

  describe('Spec example: Anupam paid 2500, share 2000', () => {
    it('gives Anupam a net balance of +500', () => {
      const members = makeMembers(['anupam', 'rahul', 'sayan']);
      const expenses = [
        makeExpense(2500, 'anupam', [['anupam', 2000], ['rahul', 250], ['sayan', 250]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);

      const anupam = balances.find(b => b.user.id === 'anupam');
      assert.equal(anupam.totalPaid, 2500);
      assert.equal(anupam.totalShare, 2000);
      assert.equal(anupam.netBalance, 500);
    });
  });

  describe('Multiple expenses', () => {
    it('aggregates paid and share across expenses', () => {
      const members = makeMembers(['A', 'B', 'C']);
      const expenses = [
        makeExpense(90, 'A', [['A', 30], ['B', 30], ['C', 30]]),
        makeExpense(60, 'B', [['A', 20], ['B', 20], ['C', 20]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);

      // A: paid 90, owes 30+20=50 → net +40
      // B: paid 60, owes 30+20=50 → net +10
      // C: paid 0, owes 30+20=50 → net -50
      const aBalance = balances.find(b => b.user.id === 'A');
      const bBalance = balances.find(b => b.user.id === 'B');
      const cBalance = balances.find(b => b.user.id === 'C');

      assert.equal(aBalance.netBalance, 40);
      assert.equal(bBalance.netBalance, 10);
      assert.equal(cBalance.netBalance, -50);
    });
  });

  describe('Multiple members, varying scenarios', () => {
    it('handles 5 members with different paid amounts', () => {
      const members = makeMembers(['A', 'B', 'C', 'D', 'E']);
      const expenses = [
        makeExpense(100, 'A', [['A', 20], ['B', 20], ['C', 20], ['D', 20], ['E', 20]]),
        makeExpense(50, 'C', [['A', 10], ['B', 10], ['C', 10], ['D', 10], ['E', 10]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);

      // A: paid 100, owes 20+10=30 → net +70
      // B: paid 0, owes 20+10=30 → net -30
      // C: paid 50, owes 20+10=30 → net +20
      // D: paid 0, owes 20+10=30 → net -30
      // E: paid 0, owes 20+10=30 → net -30
      const aBalance = balances.find(b => b.user.id === 'A');
      const cBalance = balances.find(b => b.user.id === 'C');
      const bBalance = balances.find(b => b.user.id === 'B');

      assert.equal(aBalance.netBalance, 70);
      assert.equal(cBalance.netBalance, 20);
      assert.equal(bBalance.netBalance, -30);
    });
  });

  describe('Decimal amounts', () => {
    it('handles decimal amounts without floating-point errors', () => {
      const members = makeMembers(['A', 'B', 'C']);
      const expenses = [
        makeExpense(33.33, 'A', [['A', 11.11], ['B', 11.11], ['C', 11.11]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);

      const aBalance = balances.find(b => b.user.id === 'A');
      // A paid 33.33, owes 11.11 → net 22.22
      assert.equal(aBalance.netBalance, 22.22);
    });

    it('handles many decimal expenses without drift', () => {
      const members = makeMembers(['A', 'B']);
      const expenses = [
        makeExpense(0.1, 'A', [['A', 0.05], ['B', 0.05]]),
        makeExpense(0.2, 'B', [['A', 0.1], ['B', 0.1]]),
        makeExpense(0.1, 'A', [['A', 0.05], ['B', 0.05]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);

      const aBalance = balances.find(b => b.user.id === 'A');
      // A paid 0.1+0.1=0.2, owes 0.05+0.1+0.05=0.2 → net 0
      assert.equal(aBalance.netBalance, 0);
    });
  });

  describe('No expenses', () => {
    it('returns zero balances for all members', () => {
      const members = makeMembers(['A', 'B', 'C']);
      const expenses = [];

      const { balances, summary } = calculateGroupBalances(members, expenses);

      balances.forEach(b => {
        assert.equal(b.totalPaid, 0);
        assert.equal(b.totalShare, 0);
        assert.equal(b.netBalance, 0);
      });
      assert.equal(summary.totalPaid, 0);
      assert.ok(summary.isBalanced);
    });
  });

  describe('Balance sorting', () => {
    it('sorts creditors before debtors', () => {
      const members = makeMembers(['A', 'B', 'C']);
      const expenses = [
        makeExpense(90, 'A', [['A', 30], ['B', 30], ['C', 30]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);

      // A (+60) should be first, then B (-30) and C (-30)
      assert.equal(balances[0].user.id, 'A');
      assert.ok(balances[0].netBalance > 0);
      assert.ok(balances[1].netBalance <= 0);
      assert.ok(balances[2].netBalance <= 0);
    });
  });

  describe('Conservation of money', () => {
    it('net balances always sum to zero', () => {
      const members = makeMembers(['A', 'B', 'C', 'D']);
      const expenses = [
        makeExpense(100, 'A', [['A', 25], ['B', 25], ['C', 25], ['D', 25]]),
        makeExpense(50.5, 'B', [['A', 12.63], ['B', 12.62], ['C', 12.63], ['D', 12.62]]),
        makeExpense(33.33, 'D', [['A', 8.33], ['B', 8.33], ['C', 8.34], ['D', 8.33]]),
      ];

      const { balances, summary } = calculateGroupBalances(members, expenses);

      const totalNet = sumAmounts(balances.map(b => b.netBalance));
      assert.ok(Math.abs(totalNet) < 0.01, `Expected net ~0, got ${totalNet}`);
      assert.ok(summary.isBalanced);
    });
  });

  describe('getBalanceSummary', () => {
    it('produces human-readable status for each member', () => {
      const members = makeMembers(['A', 'B', 'C']);
      const expenses = [
        makeExpense(90, 'A', [['A', 30], ['B', 30], ['C', 30]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);
      const summary = getBalanceSummary(balances);

      const aSummary = summary.find(s => s.user.id === 'A');
      const bSummary = summary.find(s => s.user.id === 'B');

      assert.equal(aSummary.statusType, 'positive');
      assert.match(aSummary.status, /should receive 60/);

      assert.equal(bSummary.statusType, 'negative');
      assert.match(bSummary.status, /owes 30/);
    });

    it('marks settled members correctly', () => {
      const members = makeMembers(['A', 'B']);
      const expenses = [
        makeExpense(100, 'A', [['A', 50], ['B', 50]]),
        makeExpense(100, 'B', [['A', 50], ['B', 50]]),
      ];

      const { balances } = calculateGroupBalances(members, expenses);
      const summary = getBalanceSummary(balances);

      // Both paid 100 and owe 100 → settled
      summary.forEach(s => {
        assert.equal(s.statusType, 'neutral');
        assert.equal(s.status, 'settled');
      });
    });
  });
});
