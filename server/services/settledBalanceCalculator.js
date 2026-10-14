import { fromCents, round, sumAmounts, toCents } from '../utils/currency.js';

function idOf(value) {
  if (!value) return '';
  return (value._id || value.id || value).toString();
}

export function applySettledSettlements(balances, settlements) {
  const adjusted = balances.map((balance) => ({
    ...balance,
    netBalanceCents: toCents(balance.netBalance),
  }));
  const byUser = new Map(adjusted.map((balance) => [idOf(balance.user), balance]));

  for (const settlement of settlements) {
    if (settlement.status !== 'settled') continue;
    const fromId = idOf(settlement.from);
    const toId = idOf(settlement.to);
    const amountCents = toCents(settlement.amount);
    const debtor = byUser.get(fromId);
    const creditor = byUser.get(toId);
    if (debtor) debtor.netBalanceCents += amountCents;
    if (creditor) creditor.netBalanceCents -= amountCents;
  }

  const result = adjusted.map(({ netBalanceCents, ...balance }) => ({
    ...balance,
    netBalance: round(fromCents(netBalanceCents)),
  })).sort((a, b) => b.netBalance - a.netBalance);
  const totalNet = round(sumAmounts(result.map((balance) => balance.netBalance)));

  return {
    balances: result,
    summary: {
      totalPaid: round(sumAmounts(result.map((balance) => balance.totalPaid))),
      totalShare: round(sumAmounts(result.map((balance) => balance.totalShare))),
      isBalanced: Math.abs(totalNet) < 0.01,
    },
  };
}
