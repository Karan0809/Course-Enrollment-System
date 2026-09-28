import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireAdmin, requireRole } from '../../middlewares/authorization.middleware.js';
import {
  createCourseController,
  deleteCourseController,
  getCourseController,
  getCoursesController,
  updateCourseController,
  updateCourseStatusController,
} from './course.controller.js';

const router = Router();

async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  await requireAuth(req, res, next);
}

router.get('/', optionalAuth, getCoursesController);
router.get('/:id', optionalAuth, getCourseController);
router.post('/', requireAuth, requireAdmin, createCourseController);
router.patch('/:id', requireAuth, requireRole('admin', 'teacher'), updateCourseController);
router.patch('/:id/status', requireAuth, requireAdmin, updateCourseStatusController);
router.delete('/:id', requireAuth, requireAdmin, deleteCourseController);

export default router;
