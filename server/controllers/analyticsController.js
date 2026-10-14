import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import Settlement from '../models/Settlement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateGroupBalances } from '../services/balanceCalculator.js';
import { applySettledSettlements } from '../services/settledBalanceCalculator.js';

function dateRange(range, start, end) {
  const now = new Date();
  if (range === 'week') {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    return { $gte: monday, $lte: now };
  }
  if (range === 'month') return { $gte: new Date(now.getFullYear(), now.getMonth(), 1), $lte: now };
  if (range === '3months') return { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1), $lte: now };
  if (range === 'custom' && start && end) {
    const to = new Date(end);
    to.setHours(23, 59, 59, 999);
    return { $gte: new Date(start), $lte: to };
  }
  return null;
}

export const getAnalytics = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).select('_id name members');
  const groupIds = groups.map((group) => group._id);
  const filter = { group: { $in: groupIds } };
  const range = dateRange(req.query.range, req.query.start, req.query.end);
  if (range) filter.date = range;

  const expenses = await Expense.find(filter).select('amount category date group');
  const categoryMap = new Map();
  const monthMap = new Map();
  const trendMap = new Map();
  const groupMap = new Map(groups.map((group) => [group._id.toString(), { name: group.name, amount: 0 }]));
  for (const expense of expenses) {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount);
    const month = expense.date.toISOString().slice(0, 7);
    monthMap.set(month, (monthMap.get(month) || 0) + expense.amount);
    const day = expense.date.toISOString().slice(0, 10);
    trendMap.set(day, (trendMap.get(day) || 0) + expense.amount);
    const group = groupMap.get(expense.group.toString());
    if (group) group.amount += expense.amount;
  }

  res.json({
    success: true,
    totalSpending: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    spendingByCategory: [...categoryMap].map(([name, amount]) => ({ name, amount })),
    monthlySpending: [...monthMap].sort(([a], [b]) => a.localeCompare(b)).map(([name, amount]) => ({ name, amount })),
    spendingTrend: [...trendMap].sort(([a], [b]) => a.localeCompare(b)).map(([name, amount]) => ({ name, amount })),
    groupSpending: [...groupMap.values()],
  });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate('members', 'firstName lastName email');
  const groupIds = groups.map((group) => group._id);
  const [expenses, settlements] = await Promise.all([
    Expense.find({ group: { $in: groupIds } })
      .populate('group', 'name')
      .populate('paidBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1 }).limit(8),
    Settlement.find({ group: { $in: groupIds } })
      .populate('group', 'name').populate('from', 'firstName lastName').populate('to', 'firstName lastName')
      .sort({ createdAt: -1 }).limit(8),
  ]);
  let youOwe = 0;
  let youAreOwed = 0;
  for (const group of groups) {
    const groupExpenses = await Expense.find({ group: group._id }).populate('paidBy').populate('individualShares.user');
    const calculated = calculateGroupBalances(group.members, groupExpenses);
    const settled = await Settlement.find({ group: group._id, status: 'settled' });
    const { balances } = applySettledSettlements(calculated.balances, settled);
    const balance = balances.find((entry) => entry.user.id === req.user._id.toString());
    if (balance?.netBalance > 0) youAreOwed += balance.netBalance;
    if (balance?.netBalance < 0) youOwe += Math.abs(balance.netBalance);
  }
  const category = new Map();
  const allExpenses = await Expense.find({ group: { $in: groupIds } }).select('category amount');
  for (const expense of allExpenses) category.set(expense.category, (category.get(expense.category) || 0) + expense.amount);
  res.json({
    success: true,
    stats: {
      totalSpending: allExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      youOwe,
      youAreOwed,
      activeGroups: groups.length,
    },
    recentExpenses: expenses,
    recentSettlements: settlements,
    categorySpending: [...category].map(([name, amount]) => ({ name, amount })),
  });
});
