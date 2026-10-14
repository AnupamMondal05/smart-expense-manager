import { ApiError } from '../utils/apiResponse.js';
import {
  toCents, fromCents, distributeEqual, distributeByShares,
  amountsEqual, sumAmounts, round,
} from '../utils/currency.js';

/**
 * Calculate individual shares for an expense based on the split type.
 *
 * @param {number} amount - Total expense amount in dollars
 * @param {string} splitType - One of: 'equal', 'custom', 'percentage', 'shares'
 * @param {string[]} participantIds - Array of user IDs participating in the expense
 * @param {Array} individualSharesInput - Array of { user, amount, percentage, shares }
 * @returns {Array} Array of { user, amount, percentage, shares }
 */
export function calculateShares(amount, splitType, participantIds, individualSharesInput = []) {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }
  if (!participantIds || participantIds.length === 0) {
    throw new ApiError(400, 'At least one participant is required');
  }
  if (new Set(participantIds).size !== participantIds.length) {
    throw new ApiError(400, 'Duplicate participants are not allowed');
  }
  if (!Array.isArray(individualSharesInput)) {
    throw new ApiError(400, 'Individual shares must be an array');
  }

  const inputMap = new Map();
  for (const item of individualSharesInput) {
    if (!item || typeof item.user !== 'string' || !item.user) {
      throw new ApiError(400, 'Each individual share must include a valid participant');
    }
    if (!participantIds.includes(item.user)) {
      throw new ApiError(400, 'Individual shares contain an invalid participant');
    }
    if (inputMap.has(item.user)) {
      throw new ApiError(400, 'Duplicate individual shares are not allowed');
    }
    inputMap.set(item.user, item);
  }

  switch (splitType) {
    case 'equal':
      return calculateEqualSplit(amount, participantIds);

    case 'custom':
      return calculateCustomSplit(amount, participantIds, inputMap);

    case 'percentage':
      return calculatePercentageSplit(amount, participantIds, inputMap);

    case 'shares':
      return calculateShareSplit(amount, participantIds, inputMap);

    default:
      throw new ApiError(400, `Invalid split type: ${splitType}`);
  }
}

/**
 * Equal split: divide amount evenly among all participants.
 * Remainder (from rounding) is distributed to the first few participants.
 */
function calculateEqualSplit(amount, participantIds) {
  const distributions = distributeEqual(amount, participantIds.length);

  return participantIds.map((userId, i) => ({
    user: userId,
    amount: distributions[i],
    percentage: round((distributions[i] / amount) * 100),
    shares: 1,
  }));
}

/**
 * Custom split: user specifies exact amounts per participant.
 * Validates that the sum of all amounts equals the total expense amount.
 */
function calculateCustomSplit(amount, participantIds, inputMap) {
  const shares = participantIds.map((userId) => {
    const input = inputMap.get(userId);
    if (!input || input.amount === '' || input.amount === null || input.amount === undefined) {
      throw new ApiError(400, 'An amount is required for every participant');
    }
    const amt = Number(input.amount);
    if (!Number.isFinite(amt)) {
      throw new ApiError(400, 'Individual amounts must be valid numbers');
    }
    if (amt < 0) {
      throw new ApiError(400, 'Individual amounts cannot be negative');
    }
    return { user: userId, amount: round(amt), percentage: 0, shares: 0 };
  });

  const totalShares = sumAmounts(shares.map((s) => s.amount));
  if (!amountsEqual(totalShares, amount)) {
    throw new ApiError(400, `Individual amounts must add up to ${amount.toFixed(2)}. Current total: ${totalShares.toFixed(2)}`);
  }

  // Fill in percentage for informational purposes
  shares.forEach((s) => {
    s.percentage = round((s.amount / amount) * 100);
  });

  return shares;
}

/**
 * Percentage split: user specifies a percentage for each participant.
 * Validates that percentages sum to exactly 100%.
 * Monetary amount is calculated as amount * percentage / 100.
 */
function calculatePercentageSplit(amount, participantIds, inputMap) {
  const shares = participantIds.map((userId) => {
    const input = inputMap.get(userId);
    if (!input || input.percentage === '' || input.percentage === null || input.percentage === undefined) {
      throw new ApiError(400, 'A percentage is required for every participant');
    }
    const pct = Number(input.percentage);
    if (!Number.isFinite(pct)) {
      throw new ApiError(400, 'Percentages must be valid numbers');
    }
    if (pct < 0) {
      throw new ApiError(400, 'Percentages cannot be negative');
    }
    if (pct > 100) {
      throw new ApiError(400, 'Individual percentage cannot exceed 100%');
    }
    return { user: userId, amount: 0, percentage: pct, shares: 0 };
  });

  const totalPct = shares.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(totalPct - 100) > 0.01) {
    throw new ApiError(400, `Percentages must add up to 100%. Current total: ${totalPct.toFixed(2)}%`);
  }

  // Calculate monetary amounts using proportional distribution
  const weights = shares.map((s) => s.percentage);
  const distributions = distributeByShares(amount, weights);

  shares.forEach((s, i) => {
    s.amount = distributions[i];
  });

  return shares;
}

/**
 * Share split: user specifies a number of shares for each participant.
 * Monetary amount = totalAmount * (participantShares / totalShares).
 */
function calculateShareSplit(amount, participantIds, inputMap) {
  const shares = participantIds.map((userId) => {
    const input = inputMap.get(userId);
    if (!input || input.shares === '' || input.shares === null || input.shares === undefined) {
      throw new ApiError(400, 'Shares are required for every participant');
    }
    const sh = Number(input.shares);
    if (!Number.isFinite(sh)) {
      throw new ApiError(400, 'Shares must be valid numbers');
    }
    if (sh < 0) {
      throw new ApiError(400, 'Shares cannot be negative');
    }
    if (sh === 0) {
      throw new ApiError(400, 'Shares must be greater than 0');
    }
    return { user: userId, amount: 0, percentage: 0, shares: sh };
  });

  const totalShares = shares.reduce((sum, s) => sum + s.shares, 0);
  if (totalShares <= 0) {
    throw new ApiError(400, 'Total shares must be greater than 0');
  }

  const weights = shares.map((s) => s.shares);
  const distributions = distributeByShares(amount, weights);

  shares.forEach((s, i) => {
    s.amount = distributions[i];
    s.percentage = round((s.shares / totalShares) * 100);
  });

  return shares;
}

/**
 * Validate expense input before calculation.
 * Returns cleaned/normalized values.
 */
export function validateExpenseInput({ amount, splitType, participants, individualShares }) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new ApiError(400, 'Amount must be a valid number');
  }
  if (amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new ApiError(400, 'At least one participant is required');
  }

  const validSplitTypes = ['equal', 'custom', 'percentage', 'shares'];
  if (!validSplitTypes.includes(splitType)) {
    throw new ApiError(400, `Invalid split type: ${splitType}`);
  }

  return {
    amount: round(amount),
    splitType,
    participants,
    individualShares: individualShares || [],
  };
}
