import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateGroupBalances } from '../services/balanceCalculator.js';
import { applySettledSettlements } from '../services/settledBalanceCalculator.js';

const members = ['A', 'B'].map((id) => ({
  _id: { toString: () => id },
  firstName: id,
  lastName: 'Test',
  email: `${id}@test.com`,
}));

function expense(amount, paidBy, shares) {
  return {
    amount,
    paidBy: { _id: { toString: () => paidBy } },
    individualShares: shares.map(([user, share]) => ({
      user: { _id: { toString: () => user } },
      amount: share,
    })),
  };
}

describe('Settled balance adjustments', () => {
  it('removes a completed settlement from future suggestions while retaining new expenses', () => {
    const initial = calculateGroupBalances(members, [
      expense(100, 'A', [['A', 50], ['B', 50]]),
    ]);
    const adjusted = applySettledSettlements(initial.balances, [{
      status: 'settled',
      from: { toString: () => 'B' },
      to: { toString: () => 'A' },
      amount: 50,
    }]);

    assert.equal(adjusted.balances.find((balance) => balance.user.id === 'A').netBalance, 0);
    assert.equal(adjusted.balances.find((balance) => balance.user.id === 'B').netBalance, 0);

    const withNewExpense = calculateGroupBalances(members, [
      expense(100, 'A', [['A', 50], ['B', 50]]),
      expense(40, 'B', [['A', 20], ['B', 20]]),
    ]);
    const newAdjusted = applySettledSettlements(withNewExpense.balances, [{
      status: 'settled',
      from: { toString: () => 'B' },
      to: { toString: () => 'A' },
      amount: 50,
    }]);

    assert.equal(newAdjusted.balances.find((balance) => balance.user.id === 'A').netBalance, -20);
    assert.equal(newAdjusted.balances.find((balance) => balance.user.id === 'B').netBalance, 20);
  });
});
