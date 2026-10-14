import { Router } from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  searchUsers,
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getGroupExpenses, getGroupExpenseSummary, getGroupBalances } from '../controllers/expenseController.js';
import { getGroupSettlements } from '../controllers/settlementController.js';

const router = Router();

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/search', searchUsers);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.get('/:id/expenses', getGroupExpenses);
router.get('/:id/expenses/summary', getGroupExpenseSummary);
router.get('/:id/balances', getGroupBalances);
router.get('/:id/settlements', getGroupSettlements);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
