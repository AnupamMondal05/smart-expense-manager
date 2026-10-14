/**
 * Decimal-safe currency utilities.
 * All monetary values are stored as numbers rounded to 2 decimal places.
 * To avoid floating-point drift, we convert to cents (integers) for all arithmetic,
 * then convert back to dollars for storage/display.
 */

const PRECISION = 2;
const MULTIPLIER = Math.pow(10, PRECISION);

/** Convert a dollar amount to integer cents. */
export function toCents(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 0;
  return Math.round(amount * MULTIPLIER);
}

/** Convert integer cents back to a dollar amount. */
export function fromCents(cents) {
  return Math.round(cents) / MULTIPLIER;
}

/** Add two dollar amounts safely. */
export function add(a, b) {
  return fromCents(toCents(a) + toCents(b));
}

/** Subtract b from a safely. */
export function subtract(a, b) {
  return fromCents(toCents(a) - toCents(b));
}

/** Multiply a dollar amount by a factor safely. */
export function multiply(amount, factor) {
  return fromCents(Math.round(toCents(amount) * factor));
}

/** Divide a dollar amount by a divisor, returns a dollar amount. */
export function divide(amount, divisor) {
  if (divisor === 0) return 0;
  return fromCents(Math.round(toCents(amount) / divisor));
}

/**
 * Distribute a dollar amount equally among n participants.
 * Returns an array of dollar amounts that sum exactly to the original amount.
 * The last participant absorbs any rounding remainder.
 */
export function distributeEqual(totalAmount, count) {
  if (count <= 0) return [];
  const totalCents = toCents(totalAmount);
  const perPersonCents = Math.floor(totalCents / count);
  const remainder = totalCents - perPersonCents * count;

  const result = new Array(count).fill(perPersonCents);
  // Distribute remainder one cent at a time to the first N participants
  for (let i = 0; i < remainder; i++) {
    result[i] += 1;
  }
  return result.map(fromCents);
}

/**
 * Distribute a dollar amount proportionally based on weights (shares).
 * Returns an array of dollar amounts that sum exactly to the original amount.
 * The last non-zero participant absorbs any rounding remainder.
 */
export function distributeByShares(totalAmount, weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return weights.map(() => 0);

  const totalCents = toCents(totalAmount);
  let allocated = 0;
  const results = weights.map((w) => {
    const cents = Math.floor((totalCents * w) / totalWeight);
    allocated += cents;
    return cents;
  });

  // Assign remainder to the last participant with a non-zero weight
  const remainder = totalCents - allocated;
  if (remainder !== 0) {
    for (let i = results.length - 1; i >= 0; i--) {
      if (weights[i] > 0) {
        results[i] += remainder;
        break;
      }
    }
  }

  return results.map(fromCents);
}

/**
 * Check if two dollar amounts are equal within precision tolerance.
 */
export function amountsEqual(a, b) {
  return toCents(a) === toCents(b);
}

/**
 * Sum an array of dollar amounts safely.
 */
export function sumAmounts(amounts) {
  const totalCents = amounts.reduce((acc, amt) => acc + toCents(amt), 0);
  return fromCents(totalCents);
}

/**
 * Round a dollar amount to the configured precision.
 */
export function round(amount) {
  return fromCents(toCents(amount));
}
