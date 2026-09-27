import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import {
  requireAdmin,
  requireStudent,
  requireTeacher,
} from '../../middlewares/authorization.middleware.js';
import {
  createEnrollmentController,
  getAllEnrollmentsController,
  getCourseEnrollmentsController,
  getMyEnrollmentsController,
} from './enrollment.controller.js';

const router = Router();

router.post('/', requireAuth, requireStudent, createEnrollmentController);
router.get('/me', requireAuth, requireStudent, getMyEnrollmentsController);
router.get('/course/:courseId', requireAuth, requireTeacher, getCourseEnrollmentsController);
router.get('/', requireAuth, requireAdmin, getAllEnrollmentsController);

export default router;