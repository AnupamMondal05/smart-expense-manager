import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSettlements } from '../services/settlementCalculator.js';

const balances = (entries) => entries.map(([id, netBalance]) => ({
  user: { id, firstName: id, lastName: '', email: `${id}@test.com` },
  netBalance,
}));

const compact = (result) => result.map(({ from, to, amount }) => [from.id, to.id, amount]);

describe('Settlement Calculator', () => {
  it('settles two members', () => {
    assert.deepEqual(compact(calculateSettlements(balances([['A', 50], ['B', -50]]))), [['B', 'A', 50]]);
  });

  it('handles multiple creditors and debtors deterministically', () => {
    assert.deepEqual(compact(calculateSettlements(balances([
      ['A', 300], ['B', 200], ['C', -250], ['D', -250],
    ]))), [['C', 'A', 250], ['D', 'A', 50], ['D', 'B', 200]]);
  });

  it('handles four or more members and zero balances', () => {
    assert.deepEqual(compact(calculateSettlements(balances([
      ['A', 0], ['B', 100], ['C', -40], ['D', -60], ['E', 0],
    ]))), [['D', 'B', 60], ['C', 'B', 40]]);
  });

  it('handles decimal values in cents', () => {
    assert.deepEqual(compact(calculateSettlements(balances([
      ['A', 10.01], ['B', -3.33], ['C', -6.68],
    ]))), [['C', 'A', 6.68], ['B', 'A', 3.33]]);
  });

  it('returns no transactions when everyone is settled', () => {
    assert.deepEqual(calculateSettlements(balances([['A', 0], ['B', 0]])), []);
  });
});
