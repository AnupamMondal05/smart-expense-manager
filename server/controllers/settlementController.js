import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiResponse.js';
import { calculateGroupBalances } from '../services/balanceCalculator.js';
import { calculateSettlements } from '../services/settlementCalculator.js';
import { toCents, fromCents } from '../utils/currency.js';
import { createNotifications } from '../services/notificationService.js';
import { applySettledSettlements } from '../services/settledBalanceCalculator.js';

const userFields = 'firstName lastName email';

async function getMemberGroup(groupId, userId) {
  const group = await Group.findOne({ _id: groupId, members: userId })
    .populate('members', userFields);
  if (!group) throw new ApiError(404, 'Group not found or you are not a member');
  return group;
}

async function getSuggestions(group) {
  const [expenses, settlements] = await Promise.all([
    Expense.find({ group: group._id })
      .populate('paidBy', userFields)
      .populate('individualShares.user', userFields),
    Settlement.find({ group: group._id, status: 'settled' }),
  ]);
  const calculated = calculateGroupBalances(group.members, expenses);
  const { balances, summary } = applySettledSettlements(calculated.balances, settlements);
  return { balances, summary, suggestions: calculateSettlements(balances) };
}

export const getGroupSettlements = asyncHandler(async (req, res) => {
  const group = await getMemberGroup(req.params.id, req.user._id);
  const [calculated, settlements] = await Promise.all([
    getSuggestions(group),
    Settlement.find({ group: group._id })
      .populate('from', userFields)
      .populate('to', userFields)
      .sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, ...calculated, settlements });
});

export const createSettlement = asyncHandler(async (req, res) => {
  const { group: groupId, from, to, amount } = req.body;
  const group = await getMemberGroup(groupId, req.user._id);
  const amountCents = toCents(Number(amount));

  if (!from || !to || from === to || amountCents <= 0) {
    throw new ApiError(400, 'A positive amount and different payer and recipient are required');
  }
  const memberIds = new Set(group.members.map((member) => member._id.toString()));
  if (!memberIds.has(from) || !memberIds.has(to)) {
    throw new ApiError(400, 'Payer and recipient must be group members');
  }

  const settlement = await Settlement.create({
    group: group._id,
    from,
    to,
    amount: fromCents(amountCents),
  });
  const populated = await settlement.populate([
    { path: 'from', select: userFields },
    { path: 'to', select: userFields },
  ]);
  await createNotifications([from, to].filter((userId) => userId !== req.user._id.toString()).map((userId) => ({
    user: userId,
    message: `A settlement of ${settlement.amount.toFixed(2)} was created in ${group.name}`,
    type: 'settlement_created',
    relatedGroup: group._id,
  })));
  res.status(201).json({ success: true, settlement: populated });
});

export const settleSettlement = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findById(req.params.id).populate('group');
  if (!settlement) throw new ApiError(404, 'Settlement not found');
  const isMember = settlement.group.members.some((member) => member.toString() === req.user._id.toString());
  if (!isMember) throw new ApiError(403, 'You are not a member of this group');
  if (settlement.status !== 'pending') throw new ApiError(400, 'Only pending settlements can be settled');

  settlement.status = 'settled';
  settlement.settledAt = new Date();
  await settlement.save();
  await createNotifications([settlement.from, settlement.to]
    .map((user) => user.toString())
    .filter((userId) => userId !== req.user._id.toString())
    .map((userId) => ({
      user: userId,
      message: `A settlement of ${settlement.amount.toFixed(2)} was marked as paid`,
      type: 'settlement_paid',
      relatedGroup: settlement.group._id,
    })));
  res.json({ success: true, settlement });
});
