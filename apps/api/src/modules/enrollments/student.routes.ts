import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireStudent } from '../../middlewares/authorization.middleware.js';
import { getStudentEnrollmentDetailsController } from './enrollment.controller.js';

const router = Router();
router.get('/me/enrollments', requireAuth, requireStudent, getStudentEnrollmentDetailsController);
export default router;
