import type { NextFunction, Request, Response } from 'express';
import { createAppError } from '../../middlewares/errorHandler.js';
import {
  createCourse,
  deleteCourseById,
  getCourseById,
  listCourses,
  updateCourseById,
  updateCourseStatus,
} from './course.service.js';

function getCourseIdParam(req: Request): string {
  const courseId = req.params.id;

  if (typeof courseId !== 'string' || courseId.trim().length === 0) {
    throw createAppError('Invalid course id', 400);
  }

  return courseId;
}

export async function getCoursesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const courses = await listCourses(req.user ?? null, req.query as Record<string, string>);
    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: courses,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to fetch courses', 400));
  }
}

export async function getCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const course = await getCourseById(getCourseIdParam(req), req.user ?? null);
    res.status(200).json({
      success: true,
      message: 'Course retrieved successfully',
      data: course,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to fetch course', 400));
  }
}

export async function createCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const course = await createCourse(req.body ?? {});
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to create course', 400));
  }
}

export async function updateCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const actor = req.user;
    if (!actor) {
      throw createAppError('Authentication required', 401);
    }

    const course = await updateCourseById(getCourseIdParam(req), req.body ?? {}, actor);
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to update course', 400));
  }
}

export async function updateCourseStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const actor = req.user;
    if (!actor) {
      throw createAppError('Authentication required', 401);
    }

    if (actor.role !== 'admin') {
      throw createAppError('Forbidden: only admins can update course status', 403);
    }

    const { status } = req.body ?? {};
    const course = await updateCourseStatus(getCourseIdParam(req), status);
    res.status(200).json({
      success: true,
      message: 'Course status updated successfully',
      data: course,
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to update course status', 400));
  }
}

export async function deleteCourseController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteCourseById(getCourseIdParam(req));
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error instanceof Error ? error : createAppError('Unable to delete course', 400));
  }
}
