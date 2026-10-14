import Group from '../models/Group.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiResponse.js';
import { createNotifications } from '../services/notificationService.js';

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

function formatGroup(group) {
  return {
    id: group._id,
    name: group.name,
    owner: group.owner
      ? sanitizeUser(
          group.owner._id
            ? group.owner
            : { _id: group.owner, firstName: '', lastName: '', email: '' }
        )
      : null,
    members: (group.members || []).map((m) =>
      m._id ? sanitizeUser(m) : { id: m, firstName: '', lastName: '', email: '' }
    ),
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

export const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Group name is required');
  }

  const group = await Group.create({
    name: name.trim(),
    owner: req.user._id,
    members: [req.user._id],
  });

  const populated = await Group.findById(group._id).populate('owner', 'firstName lastName email').populate('members', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    group: formatGroup(populated),
  });
});

export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('owner', 'firstName lastName email')
    .populate('members', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    groups: groups.map(formatGroup),
  });
});

export const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('owner', 'firstName lastName email')
    .populate('members', 'firstName lastName email');

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isMember = group.members.some((m) => m._id.toString() === req.user._id.toString());
  if (!isMember) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  res.json({
    success: true,
    group: formatGroup(group),
  });
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Group name is required');
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the group owner can update this group');
  }

  group.name = name.trim();
  await group.save();

  const populated = await Group.findById(group._id)
    .populate('owner', 'firstName lastName email')
    .populate('members', 'firstName lastName email');

  res.json({
    success: true,
    message: 'Group updated successfully',
    group: formatGroup(populated),
  });
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the group owner can delete this group');
  }

  await Group.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Group deleted successfully',
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Member email is required');
  }

  const group = await Group.findById(req.params.id);

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
  if (!isMember) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  const userToAdd = await User.findOne({ email: email.toLowerCase() });
  if (!userToAdd) {
    throw new ApiError(404, 'No user found with that email');
  }

  const alreadyMember = group.members.some((m) => m.toString() === userToAdd._id.toString());
  if (alreadyMember) {
    throw new ApiError(400, 'This user is already a member of the group');
  }

  group.members.push(userToAdd._id);
  await group.save();
  await createNotifications([{
    user: userToAdd._id,
    message: `You were added to the group "${group.name}"`,
    type: 'group_member_added',
    relatedGroup: group._id,
  }]);

  const populated = await Group.findById(group._id)
    .populate('owner', 'firstName lastName email')
    .populate('members', 'firstName lastName email');

  res.json({
    success: true,
    message: 'Member added successfully',
    group: formatGroup(populated),
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const group = await Group.findById(req.params.id);

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isOwner = group.owner.toString() === req.user._id.toString();
  const isSelf = userId === req.user._id.toString();

  if (!isOwner && !isSelf) {
    throw new ApiError(403, 'Only the group owner can remove other members');
  }

  if (group.owner.toString() === userId) {
    throw new ApiError(400, 'The group owner cannot be removed. Delete the group instead.');
  }

  const memberIndex = group.members.findIndex((m) => m.toString() === userId);
  if (memberIndex === -1) {
    throw new ApiError(404, 'This user is not a member of the group');
  }

  group.members.splice(memberIndex, 1);
  await group.save();

  const populated = await Group.findById(group._id)
    .populate('owner', 'firstName lastName email')
    .populate('members', 'firstName lastName email');

  res.json({
    success: true,
    message: 'Member removed successfully',
    group: formatGroup(populated),
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email || !email.trim()) {
    return res.json({ success: true, users: [] });
  }

  const users = await User.find({
    email: { $regex: email.trim(), $options: 'i' },
    _id: { $ne: req.user._id },
  })
    .select('firstName lastName email')
    .limit(10);

  res.json({
    success: true,
    users: users.map(sanitizeUser),
  });
});
