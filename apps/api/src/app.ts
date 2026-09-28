import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import courseRoutes from './modules/courses/course.routes.js';
import teacherCourseRoutes from './modules/courses/teacherCourse.routes.js';
import enrollmentRoutes from './modules/enrollments/enrollment.routes.js';
import adminEnrollmentRoutes from './modules/enrollments/adminEnrollment.routes.js';
import courseEnrollmentRoutes from './modules/enrollments/courseEnrollment.routes.js';
import studentRoutes from './modules/enrollments/student.routes.js';
import userRoutes from './modules/users/user.routes.js';
import adminDashboardRoutes from './modules/users/adminDashboard.routes.js';
import healthRoutes from './routes/health.js';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/enrollments', adminEnrollmentRoutes);
app.use('/api/courses', courseEnrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teacher/courses', teacherCourseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course Enrollment System API is running',
    data: {},
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
