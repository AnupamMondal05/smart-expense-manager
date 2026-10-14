import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiResponse.js';
import { calculateShares } from '../services/splitCalculator.js';
import { calculateGroupBalances, getBalanceSummary } from '../services/balanceCalculator.js';
import { round } from '../utils/currency.js';
import { createNotifications } from '../services/notificationService.js';
import { applySettledSettlements } from '../services/settledBalanceCalculator.js';

const CATEGORIES = ['Food', 'Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Education', 'Shopping', 'Medical', 'Other'];
const SPLIT_TYPES = ['equal', 'custom', 'percentage', 'shares'];

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

function formatExpense(expense) {
  return {
    id: expense._id,
    group: expense.group
      ? (expense.group._id
          ? { id: expense.group._id, name: expense.group.name }
          : { id: expense.group, name: '' })
      : null,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    paidBy: sanitizeUser(expense.paidBy),
    splitType: expense.splitType,
    participants: (expense.participants || []).map((p) => sanitizeUser(p)),
    individualShares: (expense.individualShares || []).map((s) => ({
      user: sanitizeUser(s.user),
      amount: s.amount,
      percentage: s.percentage,
      shares: s.shares,
    })),
    notes: expense.notes,
    date: expense.date,
    createdBy: sanitizeUser(expense.createdBy),
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

async function verifyMembership(groupId, userId) {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  const isMember = group.members.some((m) => m.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, 'You are not a member of this group');
  return group;
}



export const createExpense = asyncHandler(async (req, res) => {
  const {
    groupId,
    title,
    amount,
    category,
    paidBy,
    participants,
    splitType,
    individualShares,
    notes,
    date,
  } = req.body;

  if (!groupId) throw new ApiError(400, 'Group ID is required');
  if (!title || !title.trim()) throw new ApiError(400, 'Title is required');
  if (!amount || amount <= 0) throw new ApiError(400, 'Amount must be greater than 0');
  if (!CATEGORIES.includes(category)) throw new ApiError(400, 'Invalid category');
  if (!SPLIT_TYPES.includes(splitType)) throw new ApiError(400, 'Invalid split type');
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    throw new ApiError(400, 'At least one participant is required');
  }

  const group = await verifyMembership(groupId, req.user._id);

  // Verify paidBy and participants are group members
  const memberIds = group.members.map((m) => m.toString());
  const paidById = paidBy || req.user._id.toString();
  if (!memberIds.includes(paidById)) {
    throw new ApiError(400, 'The person who paid must be a group member');
  }
  for (const pId of participants) {
    if (!memberIds.includes(pId)) {
      throw new ApiError(400, 'All participants must be group members');
    }
  }

  const computedShares = calculateShares(
    round(Number(amount)),
    splitType,
    participants,
    individualShares || []
  );

  const expense = await Expense.create({
    group: groupId,
    title: title.trim(),
    amount: round(Number(amount)),
    category,
    paidBy: paidById,
    splitType,
    participants,
    individualShares: computedShares.map((s) => ({
      user: s.user,
      amount: s.amount,
      percentage: s.percentage,
      shares: s.shares,
    })),
    notes: notes?.trim() || '',
    date: date || Date.now(),
    createdBy: req.user._id,
  });

  const populated = await Expense.findById(expense._id)
    .populate('paidBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email')
    .populate('individualShares.user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('group', 'name');

  const involvedUsers = [...new Set([...(participants || []), paidById])]
    .filter((userId) => userId !== req.user._id.toString());
  await createNotifications(involvedUsers.map((userId) => ({
    user: userId,
    message: `${req.user.firstName} added "${expense.title}" to ${populated.group.name}`,
    type: participants.includes(userId) ? 'expense_involvement' : 'expense_added',
    relatedGroup: expense.group,
    relatedExpense: expense._id,
  })));

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    expense: formatExpense(populated),
  });
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { group: groupId, category, search, sort } = req.query;

  const filter = {};
  if (groupId) filter.group = groupId;
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (search) filter.title = { $regex: search, $options: 'i' };

  // Only show expenses from groups the user is a member of
  const userGroups = await Group.find({ members: req.user._id }).select('_id');
  const groupIds = userGroups.map((g) => g._id);
  filter.group = { $in: groupIds };

  const sortBy = sort === 'asc' ? { date: 1 } : { date: -1 };

  const expenses = await Expense.find(filter)
    .populate('paidBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email')
    .populate('individualShares.user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('group', 'name')
    .sort(sortBy);

  res.json({
    success: true,
    expenses: expenses.map(formatExpense),
  });
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email')
    .populate('individualShares.user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('group', 'name');

  if (!expense) throw new ApiError(404, 'Expense not found');

  await verifyMembership(expense.group.id || expense.group, req.user._id);

  res.json({
    success: true,
    expense: formatExpense(expense),
  });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const {
    title,
    amount,
    category,
    paidBy,
    participants,
    splitType,
    individualShares,
    notes,
    date,
  } = req.body;

  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');

  const group = await verifyMembership(expense.group, req.user._id);

  // Only creator or group owner can edit
  const isCreator = expense.createdBy.toString() === req.user._id.toString();
  const isOwner = group.owner.toString() === req.user._id.toString();
  if (!isCreator && !isOwner) {
    throw new ApiError(403, 'Only the expense creator or group owner can edit this expense');
  }

  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(400, 'Title cannot be empty');
    expense.title = title.trim();
  }
  if (amount !== undefined) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new ApiError(400, 'Amount must be greater than 0');
    }
    expense.amount = round(numericAmount);
  }
  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) throw new ApiError(400, 'Invalid category');
    expense.category = category;
  }
  if (paidBy !== undefined) {
    const memberIds = group.members.map((m) => m.toString());
    if (!memberIds.includes(paidBy)) throw new ApiError(400, 'Paid by must be a group member');
    expense.paidBy = paidBy;
  }
  if (splitType !== undefined) {
    if (!SPLIT_TYPES.includes(splitType)) throw new ApiError(400, 'Invalid split type');
    expense.splitType = splitType;
  }
  if (participants !== undefined) {
    if (!Array.isArray(participants) || participants.length === 0) {
      throw new ApiError(400, 'At least one participant is required');
    }
    const memberIds = group.members.map((m) => m.toString());
    for (const pId of participants) {
      if (!memberIds.includes(pId)) throw new ApiError(400, 'All participants must be group members');
    }
    expense.participants = participants;
  }
  if (notes !== undefined) {
    expense.notes = notes?.trim() || '';
  }
  if (date !== undefined) {
    expense.date = date;
  }

  // Recompute only when split-related data changed, retaining stored inputs for partial edits.
  if (amount !== undefined || splitType !== undefined || participants !== undefined || individualShares !== undefined) {
    const existingInputs = (expense.individualShares || []).map((share) => ({
      user: share.user.toString(),
      amount: share.amount,
      percentage: share.percentage,
      shares: share.shares,
    }));
    const splitInputs = individualShares !== undefined ? individualShares : existingInputs;
    expense.individualShares = calculateShares(
      expense.amount,
      expense.splitType,
      expense.participants.map((p) => p.toString()),
      splitInputs
    );
  }

  await expense.save();

  const populated = await Expense.findById(expense._id)
    .populate('paidBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email')
    .populate('individualShares.user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('group', 'name');

  res.json({
    success: true,
    message: 'Expense updated successfully',
    expense: formatExpense(populated),
  });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, 'Expense not found');

  const group = await Group.findById(expense.group);
  if (!group) throw new ApiError(404, 'Group not found');

  const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
  if (!isMember) throw new ApiError(403, 'You are not a member of this group');

  const isCreator = expense.createdBy.toString() === req.user._id.toString();
  const isOwner = group.owner.toString() === req.user._id.toString();
  if (!isCreator && !isOwner) {
    throw new ApiError(403, 'Only the expense creator or group owner can delete this expense');
  }

  await Expense.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Expense deleted successfully',
  });
});

export const getGroupExpenses = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;

  await verifyMembership(groupId, req.user._id);

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'firstName lastName email')
    .populate('participants', 'firstName lastName email')
    .populate('individualShares.user', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('group', 'name')
    .sort({ date: -1 });

  res.json({
    success: true,
    expenses: expenses.map(formatExpense),
  });
});

export const getGroupExpenseSummary = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;

  await verifyMembership(groupId, req.user._id);

  const expenses = await Expense.find({ group: groupId });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    success: true,
    summary: {
      total: round(total),
      count: expenses.length,
    },
  });
});

export const getGroupBalances = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;

  const group = await verifyMembership(groupId, req.user._id);
  const members = await Group.findById(groupId).populate('members', 'firstName lastName email');

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'firstName lastName email')
    .populate('individualShares.user', 'firstName lastName email');

  const calculated = calculateGroupBalances(members.members, expenses);
  const settlements = await Settlement.find({ group: groupId, status: 'settled' });
  const { balances, summary } = applySettledSettlements(calculated.balances, settlements);
  const balanceSummary = getBalanceSummary(balances);

  res.json({
    success: true,
    balances,
    summary,
  });
});
