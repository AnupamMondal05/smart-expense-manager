import { fromCents, toCents } from '../utils/currency.js';

const EPSILON_CENTS = 0;

function userId(balance) {
  return balance.user.id?.toString() || balance.user._id.toString();
}

/**
 * Convert net balances into a deterministic, minimal set of payments.
 * Positive balances receive money; negative balances pay money.
 */
export function calculateSettlements(balances) {
  const creditors = balances
    .map((balance, index) => ({
      id: userId(balance),
      user: balance.user,
      cents: toCents(balance.netBalance),
      index,
    }))
    .filter((balance) => balance.cents > EPSILON_CENTS)
    .sort((a, b) => b.cents - a.cents || a.id.localeCompare(b.id) || a.index - b.index);

  const debtors = balances
    .map((balance, index) => ({
      id: userId(balance),
      user: balance.user,
      cents: toCents(balance.netBalance),
      index,
    }))
    .filter((balance) => balance.cents < -EPSILON_CENTS)
    .map((balance) => ({ ...balance, cents: Math.abs(balance.cents) }))
    .sort((a, b) => b.cents - a.cents || a.id.localeCompare(b.id) || a.index - b.index);

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const cents = Math.min(creditor.cents, debtor.cents);

    settlements.push({
      from: debtor.user,
      to: creditor.user,
      amount: fromCents(cents),
    });

    creditor.cents -= cents;
    debtor.cents -= cents;
    if (creditor.cents === 0) creditorIndex += 1;
    if (debtor.cents === 0) debtorIndex += 1;
  }

  return settlements;
}
