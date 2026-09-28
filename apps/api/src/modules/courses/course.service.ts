import { Course } from './course.model.js';
import { User } from '../users/user.model.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { createAppError } from '../../middlewares/errorHandler.js';
import type { CourseDocument, CourseLevel, CourseStatus } from './course.types.js';
import {
  isValidCourseId,
  isValidCourseLevel,
  isValidCourseStatus,
  normalizeCourseText,
  parseBooleanFilter,
  validCourseLevels,
  validCourseStatuses,
} from './course.validation.js';

export type CourseListQuery = {
  status?: string;
  level?: string;
  isActive?: string;
  teacherId?: string;
};

export type CourseInput = {
  title?: string;
  description?: string;
  teacherId?: string;
  price?: number;
  isFree?: boolean;
  duration?: number;
  level?: CourseLevel;
  status?: CourseStatus;
  isActive?: boolean;
};

export type CourseSummary = {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  price: number;
  isFree: boolean;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function serializeCourse(course: CourseDocument): CourseSummary {
  return {
    _id: course._id.toString(),
    title: course.title,
    description: course.description,
    teacherId: course.teacherId.toString(),
    price: course.price,
    isFree: course.isFree,
    duration: course.duration,
    level: course.level,
    status: course.status,
    isActive: course.isActive,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

async function ensureActiveTeacherExists(teacherId: string): Promise<void> {
  if (!isValidCourseId(teacherId)) {
    throw createAppError('Invalid teacherId', 400);
  }

  const teacher = await User.findById(teacherId);

  if (!teacher) {
    throw createAppError('Teacher not found', 404);
  }

  if (teacher.role !== 'teacher') {
    throw createAppError('Referenced teacher must be a teacher account', 400);
  }

  if (!teacher.isActive) {
    throw createAppError('Teacher account is inactive and cannot be assigned', 400);
  }
}

function ensureTeacherOwnsCourse(user: AuthenticatedUser, course: CourseDocument): void {
  if (user.role === 'teacher' && course.teacherId.toString() !== user._id) {
    throw createAppError('Forbidden: this course is not assigned to you', 403);
  }
}

export async function listCourses(user: AuthenticatedUser | null | undefined, query: CourseListQuery = {}): Promise<CourseSummary[]> {
  const filter: Record<string, unknown> = {};

  if (!user) {
    filter.status = 'published';
    filter.isActive = true;
  } else if (user.role === 'admin') {
    // admin sees all, subject to optional query filters
  } else if (user.role === 'teacher') {
    filter.teacherId = user._id;
  } else {
    filter.status = 'published';
    filter.isActive = true;
  }

  if (query.status) {
    if (!isValidCourseStatus(query.status)) {
      throw createAppError(`Status must be one of: ${validCourseStatuses.join(', ')}`, 400);
    }

    if (user && user.role === 'teacher') {
      if (query.status !== 'published' && query.status !== 'archived' && query.status !== 'draft') {
        throw createAppError('Teacher can only filter within their assigned courses', 400);
      }
    }

    filter.status = query.status;
  }

  if (query.level) {
    if (!isValidCourseLevel(query.level)) {
      throw createAppError(`Level must be one of: ${validCourseLevels.join(', ')}`, 400);
    }
    filter.level = query.level;
  }

  if (query.isActive !== undefined) {
    const isActive = parseBooleanFilter(query.isActive);
    if (isActive === undefined) {
      throw createAppError('isActive must be either true or false', 400);
    }
    filter.isActive = isActive;
  }

  if (query.teacherId) {
    if (user && user.role === 'teacher') {
      filter.teacherId = user._id;
    } else {
      if (!isValidCourseId(query.teacherId)) {
        throw createAppError('Invalid teacherId', 400);
      }
      filter.teacherId = query.teacherId;
    }
  }

  if (!user || user.role === 'student') {
    filter.status = 'published';
    filter.isActive = true;
  }

  const courses = await Course.find(filter).sort({ createdAt: -1 });
  return courses.map(serializeCourse);
}

export async function listTeacherCourses(user: AuthenticatedUser): Promise<CourseSummary[]> {
  const courses = await Course.find({ teacherId: user.id }).sort({ createdAt: -1 });
  return courses.map(serializeCourse);
}

export async function getCourseById(courseId: string, user: AuthenticatedUser | null | undefined): Promise<CourseSummary> {
  if (!isValidCourseId(courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw createAppError('Course not found', 404);
  }

  if (!user) {
    if (course.status !== 'published' || !course.isActive) {
      throw createAppError('Course not found', 404);
    }
    return serializeCourse(course);
  }

  if (user.role === 'admin') {
    return serializeCourse(course);
  }

  if (user.role === 'teacher') {
    ensureTeacherOwnsCourse(user, course);
    return serializeCourse(course);
  }

  if (course.status !== 'published' || !course.isActive) {
    throw createAppError('Course not found', 404);
  }

  return serializeCourse(course);
}

export async function createCourse(input: CourseInput): Promise<CourseSummary> {
  const title = normalizeCourseText(input.title);
  const description = normalizeCourseText(input.description);
  const teacherId = typeof input.teacherId === 'string' ? input.teacherId.trim() : '';
  const rawPrice = typeof input.price === 'number' ? input.price : 0;
  const rawDuration = typeof input.duration === 'number' ? input.duration : 0;
  const level = input.level;
  const status = input.status ?? 'draft';

  if (typeof input.isFree !== 'boolean') {
    throw createAppError('isFree must be a boolean value', 400);
  }

  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') {
    throw createAppError('isActive must be a boolean value', 400);
  }

  if (!title) {
    throw createAppError('Title is required', 400);
  }

  if (!description) {
    throw createAppError('Description is required', 400);
  }

  if (!teacherId) {
    throw createAppError('teacherId is required', 400);
  }

  if (!isValidCourseId(teacherId)) {
    throw createAppError('Invalid teacherId', 400);
  }

  if (!isValidCourseLevel(level)) {
    throw createAppError(`Level must be one of: ${validCourseLevels.join(', ')}`, 400);
  }

  if (!isValidCourseStatus(status)) {
    throw createAppError(`Status must be one of: ${validCourseStatuses.join(', ')}`, 400);
  }

  if (typeof input.duration !== 'number' || !Number.isFinite(input.duration) || input.duration <= 0) {
    throw createAppError('Duration must be a positive number', 400);
  }

  if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0) {
    throw createAppError('Price must be a non-negative number', 400);
  }

  if (input.isFree === true && rawPrice !== 0) {
    throw createAppError('Free courses must have a price of 0', 400);
  }

  await ensureActiveTeacherExists(teacherId);

  const course = await Course.create({
    title,
    description,
    teacherId,
    price: rawPrice,
    isFree: input.isFree,
    duration: rawDuration,
    level,
    status,
    isActive: input.isActive ?? true,
  });

  return serializeCourse(course);
}

export async function updateCourseById(courseId: string, input: CourseInput, actor: AuthenticatedUser): Promise<CourseSummary> {
  if (!isValidCourseId(courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw createAppError('Course not found', 404);
  }

  if (actor.role === 'student') {
    throw createAppError('Forbidden: students cannot update courses', 403);
  }

  if (input.teacherId !== undefined && typeof input.teacherId !== 'string') throw createAppError('teacherId must be a string', 400);
  if (input.title !== undefined && typeof input.title !== 'string') throw createAppError('Title must be a string', 400);
  if (input.description !== undefined && typeof input.description !== 'string') throw createAppError('Description must be a string', 400);
  if (input.price !== undefined && typeof input.price !== 'number') throw createAppError('Price must be a number', 400);
  if (input.isFree !== undefined && typeof input.isFree !== 'boolean') throw createAppError('isFree must be a boolean value', 400);
  if (input.duration !== undefined && typeof input.duration !== 'number') throw createAppError('Duration must be a number', 400);
  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') throw createAppError('isActive must be a boolean value', 400);

  if (actor.role === 'teacher') {
    ensureTeacherOwnsCourse(actor, course);

    if (input.teacherId !== undefined) {
      throw createAppError('Teacher cannot change teacher assignment', 400);
    }

    if (input.status !== undefined) {
      throw createAppError('Teacher cannot change course status', 400);
    }

    if (input.isActive !== undefined) {
      throw createAppError('Teacher cannot change active status', 400);
    }

    const allowedKeys = ['title', 'description', 'price', 'isFree', 'duration', 'level'];
    const invalidKeys = Object.keys(input).filter((key) => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw createAppError('Teacher can only update course content fields', 400);
    }
  }

  if (input.title !== undefined) {
    const safeTitle = normalizeCourseText(input.title);
    if (!safeTitle) throw createAppError('Title is required', 400);
    course.title = safeTitle;
  }

  if (input.description !== undefined) {
    const safeDescription = normalizeCourseText(input.description);
    if (!safeDescription) throw createAppError('Description is required', 400);
    course.description = safeDescription;
  }

  if (input.teacherId !== undefined) {
    if (actor.role !== 'admin') {
      throw createAppError('Teacher cannot change teacher assignment', 400);
    }
    await ensureActiveTeacherExists(input.teacherId);
    course.teacherId = input.teacherId as never;
  }

  if (input.price !== undefined) {
    const nextPrice = input.price;
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      throw createAppError('Price must be a non-negative number', 400);
    }
    const nextIsFree = input.isFree ?? course.isFree;
    if (nextIsFree && nextPrice !== 0) {
      throw createAppError('Free courses must have a price of 0', 400);
    }
    course.price = nextPrice;
  }

  if (input.isFree !== undefined) {
    if (typeof input.isFree !== 'boolean') {
      throw createAppError('isFree must be a boolean value', 400);
    }
    if (input.isFree && course.price !== 0) {
      throw createAppError('Free courses must have a price of 0', 400);
    }
    course.isFree = input.isFree;
  }

  if (input.duration !== undefined) {
    if (typeof input.duration !== 'number' || !Number.isFinite(input.duration) || input.duration <= 0) {
      throw createAppError('Duration must be a positive number', 400);
    }
    course.duration = input.duration;
  }

  if (input.level !== undefined) {
    if (!isValidCourseLevel(input.level)) {
      throw createAppError(`Level must be one of: ${validCourseLevels.join(', ')}`, 400);
    }
    course.level = input.level;
  }

  if (input.status !== undefined) {
    if (actor.role !== 'admin') {
      throw createAppError('Forbidden: only admins can update course status', 403);
    }
    if (!isValidCourseStatus(input.status)) {
      throw createAppError(`Status must be one of: ${validCourseStatuses.join(', ')}`, 400);
    }
    course.status = input.status;
  }

  if (input.isActive !== undefined) {
    if (actor.role !== 'admin') {
      throw createAppError('Forbidden: only admins can update active status', 403);
    }
    if (typeof input.isActive !== 'boolean') {
      throw createAppError('isActive must be a boolean value', 400);
    }
    course.isActive = input.isActive;
  }

  await course.save();
  return serializeCourse(course);
}

export async function updateCourseStatus(courseId: string, status: CourseStatus): Promise<CourseSummary> {
  if (!isValidCourseId(courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  if (!isValidCourseStatus(status)) {
    throw createAppError(`Status must be one of: ${validCourseStatuses.join(', ')}`, 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw createAppError('Course not found', 404);
  }

  course.status = status;
  await course.save();
  return serializeCourse(course);
}

export async function deleteCourseById(courseId: string): Promise<void> {
  if (!isValidCourseId(courseId)) {
    throw createAppError('Invalid course id', 400);
  }

  const course = await Course.findByIdAndDelete(courseId);
  if (!course) {
    throw createAppError('Course not found', 404);
  }
}
