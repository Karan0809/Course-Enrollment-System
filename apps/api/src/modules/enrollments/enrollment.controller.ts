import type { NextFunction, Request, Response } from 'express';
import { createAppError } from '../../middlewares/errorHandler.js';
import {
  createStudentEnrollment,
  listAllEnrollments,
  listCourseEnrollments,
  listStudentEnrollments,
} from './enrollment.service.js';
import {
  parseCourseIdParam,
  parseCreateEnrollmentInput,
  parseEnrollmentListFilters,
} from './enrollment.validation.js';

export async function createEnrollmentController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const student = req.user;
    if (!student) throw createAppError('Authentication required', 401);

    const { courseId } = parseCreateEnrollmentInput(req.body);
    const enrollment = await createStudentEnrollment(student, courseId);
    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: { enrollment },
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to create enrollment'));
  }
}

export async function getMyEnrollmentsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const student = req.user;
    if (!student) throw createAppError('Authentication required', 401);

    const enrollments = await listStudentEnrollments(student);
    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: { enrollments },
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to retrieve enrollments'));
  }
}

export async function getAllEnrollmentsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filters = parseEnrollmentListFilters(req.query as Record<string, unknown>);
    const enrollments = await listAllEnrollments(filters);
    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: { enrollments },
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to retrieve enrollments'));
  }
}

export async function getCourseEnrollmentsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const teacher = req.user;
    if (!teacher) throw createAppError('Authentication required', 401);

    const courseId = parseCourseIdParam(req.params.courseId);
    const enrollments = await listCourseEnrollments(teacher, courseId);
    res.status(200).json({
      success: true,
      message: 'Course enrollments retrieved successfully',
      data: { enrollments },
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to retrieve course enrollments'));
  }
}