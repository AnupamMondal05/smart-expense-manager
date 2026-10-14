import { Router } from 'express';
import { createSettlement, settleSettlement } from '../controllers/settlementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/', createSettlement);
router.put('/:id/settle', settleSettlement);

export default router;
