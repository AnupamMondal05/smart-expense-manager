import { toCents, fromCents, round, sumAmounts } from '../utils/currency.js';

/**
 * Calculate balances for all members of a group based on all expenses.
 *
 * For each member:
 *   totalPaid     = sum of expense.amount where paidBy === member
 *   totalShare    = sum of individualShare.amount where user === member
 *   netBalance    = totalPaid - totalShare
 *
 * Positive netBalance = member should receive money
 * Negative netBalance = member owes money
 *
 * @param {Array} members - Array of member objects (populated User refs): { _id, firstName, lastName, email }
 * @param {Array} expenses - Array of Expense documents (plain objects with .paidBy and .individualShares)
 * @returns {Object} { balances: Array<{ user, totalPaid, totalShare, netBalance }>, summary: { totalPaid, totalShare, isBalanced } }
 */
export function calculateGroupBalances(members, expenses) {
  const memberIds = members.map((m) => m._id.toString());

  // Initialize balances in cents to avoid floating-point errors
  const balancesInCents = new Map();
  for (const memberId of memberIds) {
    balancesInCents.set(memberId, {
      totalPaidCents: 0,
      totalShareCents: 0,
    });
  }

  for (const expense of expenses) {
    const paidById = expense.paidBy._id
      ? expense.paidBy._id.toString()
      : expense.paidBy.toString();

    const expenseAmountCents = toCents(expense.amount);

    // Add to payer's totalPaid
    if (balancesInCents.has(paidById)) {
      balancesInCents.get(paidById).totalPaidCents += expenseAmountCents;
    }

    // Add each participant's share to their totalShare
    for (const share of expense.individualShares || []) {
      const userId = share.user._id
        ? share.user._id.toString()
        : share.user.toString();

      if (balancesInCents.has(userId)) {
        balancesInCents.get(userId).totalShareCents += toCents(share.amount);
      }
    }
  }

  // Convert to dollar amounts and compute net balance
  const balances = members.map((member) => {
    const memberId = member._id.toString();
    const data = balancesInCents.get(memberId);
    const totalPaid = fromCents(data.totalPaidCents);
    const totalShare = fromCents(data.totalShareCents);
    const netBalance = fromCents(data.totalPaidCents - data.totalShareCents);

    return {
      user: {
        id: member._id.toString(),
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
      },
      totalPaid: round(totalPaid),
      totalShare: round(totalShare),
      netBalance: round(netBalance),
    };
  });

  // Sort: creditors (positive) first, then debtors (negative), then settled
  balances.sort((a, b) => b.netBalance - a.netBalance);

  const totalPaid = round(sumAmounts(balances.map((b) => b.totalPaid)));
  const totalShare = round(sumAmounts(balances.map((b) => b.totalShare)));

  // Check if all balances net to zero (they always should mathematically)
  const totalNet = round(sumAmounts(balances.map((b) => b.netBalance)));
  const isBalanced = Math.abs(totalNet) < 0.01;

  return {
    balances,
    summary: {
      totalPaid,
      totalShare,
      isBalanced,
    },
  };
}

/**
 * Get a simplified view of who owes whom (without full settlement optimization).
 * This is NOT the debt settlement algorithm — just a simple per-member summary.
 *
 * @param {Array} balances - Output from calculateGroupBalances
 * @returns {Array} Each member with a human-readable status
 */
export function getBalanceSummary(balances) {
  return balances.map((b) => {
    const absAmount = Math.abs(b.netBalance);
    let status = 'settled';
    let statusType = 'neutral';

    if (b.netBalance > 0.01) {
      status = `should receive ${absAmount.toFixed(2)}`;
      statusType = 'positive';
    } else if (b.netBalance < -0.01) {
      status = `owes ${absAmount.toFixed(2)}`;
      statusType = 'negative';
    }

    return {
      user: b.user,
      totalPaid: b.totalPaid,
      totalShare: b.totalShare,
      netBalance: b.netBalance,
      status,
      statusType,
    };
  });
}
