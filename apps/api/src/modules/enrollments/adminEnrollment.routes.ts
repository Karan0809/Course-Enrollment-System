import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireAdmin } from '../../middlewares/authorization.middleware.js';
import { getAdminEnrollmentDetailsController } from './enrollment.controller.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/', getAdminEnrollmentDetailsController);
export default router;
