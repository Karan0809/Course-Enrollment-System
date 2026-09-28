import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireAdmin } from '../../middlewares/authorization.middleware.js';
import { adminDashboardSummaryController } from './user.controller.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/summary', adminDashboardSummaryController);
export default router;
