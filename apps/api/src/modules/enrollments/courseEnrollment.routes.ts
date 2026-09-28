import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireStudent } from '../../middlewares/authorization.middleware.js';
import { createCourseEnrollmentController } from './enrollment.controller.js';

const router = Router();
router.post('/:id/enroll', requireAuth, requireStudent, createCourseEnrollmentController);
export default router;
