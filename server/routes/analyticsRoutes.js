import { Router } from 'express';
import { getAnalytics, getDashboard } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.get('/', getAnalytics);
router.get('/dashboard', getDashboard);
export default router;
