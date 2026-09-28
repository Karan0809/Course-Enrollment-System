import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireTeacher } from '../../middlewares/authorization.middleware.js';
import { getTeacherCoursesController } from './course.controller.js';
import { getTeacherCourseStudentsController } from '../enrollments/enrollment.controller.js';

const router = Router();
router.use(requireAuth, requireTeacher);
router.get('/', getTeacherCoursesController);
router.get('/:id/students', getTeacherCourseStudentsController);
export default router;
